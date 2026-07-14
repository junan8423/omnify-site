/**
 * Omnify 테넌트 레지스트리 · 자동 구축 파이프라인 (클라이언트 MVP)
 * 실서비스에서는 동일 스키마로 API/Firebase Functions에 이식.
 */
var OMNIFY_TENANTS_KEY = 'omnify_tenants_v1';
var OMNIFY_TENANT_STORE_META_KEY = 'omnify_tenant_store_meta_v1';

/**
 * 데이터 계층 — api(Firestore) + localStorage 캐시
 * 쓰기는 로컬 즉시 반영 후 /api/tenants 동기화
 */
var TenantStore = {
    backend: 'api',
    apiBase: '/api/tenants',
    lastError: null,
    lastSyncAt: null,
    online: null,

    list: function () { return loadTenants(); },
    get: function (id) { return getTenantById(id); },
    save: function (tenant) { return upsertTenant(tenant); },
    remove: function (id) { return deleteTenant(id); },

    _apiFetch: function (opts) {
        opts = opts || {};
        var url = TenantStore.apiBase + (opts.query || '');
        return fetch(url, {
            method: opts.method || 'GET',
            credentials: 'same-origin',
            headers: Object.assign(
                { Accept: 'application/json' },
                opts.body ? { 'Content-Type': 'application/json' } : {},
                opts.headers || {}
            ),
            body: opts.body ? JSON.stringify(opts.body) : undefined
        }).then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (data) {
                if (!res.ok) {
                    var err = new Error((data && data.error) || ('HTTP ' + res.status));
                    err.status = res.status;
                    err.data = data;
                    throw err;
                }
                return data;
            });
        });
    },

    /** 서버 목록 → localStorage 캐시 교체 (어드민 부팅) */
    hydrate: function () {
        return TenantStore._apiFetch({ method: 'GET' }).then(function (data) {
            var list = (data && data.tenants) ? data.tenants : [];
            saveTenants(list.map(normalizeTenantRecord));
            TenantStore.online = true;
            TenantStore.lastError = null;
            TenantStore.lastSyncAt = new Date().toISOString();
            try {
                localStorage.setItem(OMNIFY_TENANT_STORE_META_KEY, JSON.stringify({
                    backend: 'api',
                    lastHydrateAt: TenantStore.lastSyncAt,
                    count: list.length
                }));
            } catch (e) { /* ignore */ }
            return list;
        }).catch(function (err) {
            TenantStore.online = false;
            TenantStore.lastError = String(err && err.message ? err.message : err);
            throw err;
        });
    },

    pushOne: function (tenant) {
        if (!tenant || !tenant.id) return Promise.resolve();
        return TenantStore._apiFetch({
            method: 'PUT',
            body: { tenant: tenant }
        }).then(function (data) {
            TenantStore.online = true;
            TenantStore.lastError = null;
            TenantStore.lastSyncAt = new Date().toISOString();
            return data;
        }).catch(function (err) {
            TenantStore.online = false;
            TenantStore.lastError = String(err && err.message ? err.message : err);
            throw err;
        });
    },

    pushAll: function () {
        var list = loadTenants();
        var chain = Promise.resolve();
        list.forEach(function (t) {
            chain = chain.then(function () { return TenantStore.pushOne(t); });
        });
        return chain.then(function () { return list.length; });
    },

    removeRemote: function (id) {
        return TenantStore._apiFetch({
            method: 'DELETE',
            query: '?id=' + encodeURIComponent(id)
        }).then(function (data) {
            TenantStore.online = true;
            TenantStore.lastError = null;
            return data;
        }).catch(function (err) {
            TenantStore.online = false;
            TenantStore.lastError = String(err && err.message ? err.message : err);
            throw err;
        });
    },

    /** 공개: 단건 조회 (대시보드 ?tenant=) */
    fetchOne: function (id) {
        return TenantStore._apiFetch({
            method: 'GET',
            query: '?id=' + encodeURIComponent(id)
        }).then(function (data) {
            var t = data && data.tenant ? normalizeTenantRecord(data.tenant) : null;
            if (t) upsertTenantLocalOnly(t);
            return t;
        });
    },

    exportBundle: function () {
        return {
            version: 2,
            backend: TenantStore.backend,
            exportedAt: new Date().toISOString(),
            tenants: loadTenants()
        };
    },

    importBundle: function (bundle, mode) {
        mode = mode || 'merge';
        var incoming = (bundle && bundle.tenants) ? bundle.tenants : (Array.isArray(bundle) ? bundle : null);
        if (!incoming) throw new Error('invalid bundle');
        var next = mode === 'replace' ? [] : loadTenants().slice();
        incoming.forEach(function (t) {
            if (!t || !t.id) return;
            var i = next.findIndex(function (x) { return x.id === t.id; });
            if (i >= 0) next[i] = normalizeTenantRecord(t);
            else next.unshift(normalizeTenantRecord(t));
        });
        saveTenants(next);
        try {
            localStorage.setItem(OMNIFY_TENANT_STORE_META_KEY, JSON.stringify({
                lastImportAt: new Date().toISOString(),
                count: next.length
            }));
        } catch (e) { /* ignore */ }
        if (TenantStore.backend === 'api') {
            TenantStore.pushAll().catch(function () { /* lastError set */ });
        }
        return next.length;
    }
};

function upsertTenantLocalOnly(tenant) {
    var list = loadTenants();
    var i = list.findIndex(function (t) { return t.id === tenant.id; });
    if (i >= 0) list[i] = tenant;
    else list.unshift(tenant);
    saveTenants(list);
    return tenant;
}

var PLAN_MONTHLY_MAN = { starter: 15, growth: 30, enterprise: 50 };
var PLAN_SETUP_MAN = { starter: 150, growth: 300, enterprise: null };

var PHASE1_MODULE_VIEWS = {
    dashboard: ['view-dashboard'],
    briefing: ['view-briefing'],
    datahub: ['view-datahub'],
    orders: ['view-orders'],
    inventory: ['view-inventory'],
    archive: ['view-archive'],
    crm: ['view-crm'],
    profit: ['view-profit'],
    comms: ['view-comms'],
    activity: ['view-activity']
};

var OPS_CHECKLIST_DEFS = [
    { id: 'kickoff', label: '킥오프 · 요구사항 확정' },
    { id: 'tokens', label: '채널 API 토큰 수급' },
    { id: 'drive_share', label: 'Drive 폴더 공유 확인' },
    { id: 'briefing_kakao', label: '알림톡 수신자·채널 등록' },
    { id: 'seed_qa', label: '대시보드 시드 · QA' },
    { id: 'training', label: '고객 인수인계·교육' },
    { id: 'golive', label: 'Go-live 확정' }
];

var CONTRACT_CHECKLIST_DEFS = [
    { id: 'quote_sent', label: '견적 공유' },
    { id: 'contract_signed', label: '계약서 서명' },
    { id: 'setup_paid', label: '구축비 입금 확인' },
    { id: 'refund_clause', label: '중도해지·환불 조항 명시' },
    { id: 'aop_terms', label: '일시납(AOP) 조건 합의' },
    { id: 'sla', label: '장애 대응 SLA 합의' }
];

var REFUND_POLICY_TEXT =
    '중도 해지 시 할인 전 정상가(월 이용료)를 기준으로 사용 기간만큼 차감한 뒤 잔액을 환불합니다. 초기 구축비는 환불 대상이 아닙니다.';

var PROVISION_STEPS = [
    { id: 'tenant_ns', label: '테넌트 네임스페이스 생성', detail: 'tenantId · storage prefix' },
    { id: 'config_seed', label: '대시보드 설정 시드', detail: '플랜·KPI·채널·브리핑·커스텀' },
    { id: 'channels', label: '채널 연동 슬롯 등록', detail: '웹훅 엔드포인트 예약(스텁)' },
    { id: 'wms', label: 'WMS 읽기 연동', detail: '사방넷 조회 전용 프로파일' },
    { id: 'drive', label: 'Google Drive 자료실 연동', detail: '공유 폴더·서비스 계정 바인딩' },
    { id: 'briefing', label: '알림톡 수신 슬롯', detail: '플랜 한도 · 1인 1통' },
    { id: 'preview', label: '대시보드 초안 URL 발급', detail: '데모/스테이징 미리보기' }
];

var CHANNEL_CATALOG = [
    /* Tier S — 핵심 */
    { id: 'cafe24', label: 'Cafe24(자사몰)', apiTier: 'A', group: 'core' },
    { id: 'smartstore', label: '네이버 스마트스토어', apiTier: 'AB', group: 'core' },
    { id: 'coupang', label: '쿠팡', apiTier: 'A', group: 'core' },
    /* 종합몰 · 오픈마켓 */
    { id: 'gmarket', label: 'G마켓', apiTier: 'B', group: 'market' },
    { id: 'elevenst', label: '11번가', apiTier: 'B', group: 'market' },
    { id: 'auction', label: '옥션', apiTier: 'B', group: 'market' },
    { id: 'ssg', label: 'SSG닷컴', apiTier: 'C', group: 'market' },
    { id: 'lotteon', label: '롯데온', apiTier: 'C', group: 'market' },
    { id: 'interpark', label: '인터파크', apiTier: 'C', group: 'market' },
    /* 패션 · 뷰티 버티컬 */
    { id: 'ably', label: '에이블리', apiTier: 'B', group: 'vertical' },
    { id: 'musinsa', label: '무신사', apiTier: 'B', group: 'vertical' },
    { id: 'oliveyoung', label: '올리브영', apiTier: 'C', group: 'vertical' },
    { id: 'zigzag', label: '지그재그', apiTier: 'B', group: 'vertical' },
    { id: 'cm29', label: '29CM', apiTier: 'C', group: 'vertical' },
    { id: 'brandi', label: '브랜디', apiTier: 'C', group: 'vertical' },
    { id: 'wconcept', label: 'W컨셉', apiTier: 'C', group: 'vertical' },
    /* 백화점 · 프리미엄 */
    { id: 'hyundai_hmall', label: '현대Hmall', apiTier: 'C', group: 'department' },
    { id: 'galleria', label: '갤러리아몰', apiTier: 'C', group: 'department' },
    { id: 'akmall', label: 'AK몰', apiTier: 'C', group: 'department' },
    /* 장보기 · 리빙 · 소셜 */
    { id: 'kurly', label: '컬리', apiTier: 'C', group: 'lifestyle' },
    { id: 'ohouse', label: '오늘의집', apiTier: 'C', group: 'lifestyle' },
    { id: 'kakao_store', label: '카카오톡스토어', apiTier: 'B', group: 'lifestyle' },
    { id: 'toss', label: '토스쇼핑', apiTier: 'C', group: 'lifestyle' },
    /* 글로벌 · 홈쇼핑 · 소셜 */
    { id: 'aliexpress', label: '알리익스프레스', apiTier: 'B', group: 'special' },
    { id: 'temu', label: '테무', apiTier: 'D', group: 'special' },
    { id: 'gsshop', label: 'GS샵', apiTier: 'C', group: 'special' },
    { id: 'cjonstyle', label: 'CJ온스타일', apiTier: 'C', group: 'special' },
    { id: 'nsshop', label: 'NS홈쇼핑', apiTier: 'C', group: 'special' },
    { id: 'youtube_shop', label: '유튜브쇼핑', apiTier: 'D', group: 'special' },
    { id: 'instagram_shop', label: '인스타샵', apiTier: 'D', group: 'special' },
    { id: 'other', label: '기타', apiTier: 'D', group: 'other' }
];

var API_TIER_META = {
    A: { label: 'A', title: '공개·반공개 셀러 API — 직접 연동 설계 가능' },
    AB: { label: 'A/B', title: '공개 API + 솔루션/앱 심사 필요할 수 있음' },
    B: { label: 'B', title: '파트너·솔루션 심사/계약 후 연동' },
    C: { label: 'C', title: '입점·EDI·사방넷 등 중개/전용 연동이 일반적' },
    D: { label: 'D', title: '공개 API 약함 · 수기·정책 의존 (비권장)' }
};

function channelApiTierMeta(tier) {
    return API_TIER_META[tier] || API_TIER_META.D;
}
function extractDriveFolderId(urlOrId) {
    var s = String(urlOrId || '').trim();
    if (!s) return '';
    if (/^[a-zA-Z0-9_-]{10,}$/.test(s) && s.indexOf('http') !== 0) return s;
    var m = s.match(/\/folders\/([a-zA-Z0-9_-]+)/) || s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    return m ? m[1] : '';
}

/**
 * 업체 식별·폴더 규칙
 * - keyId: 등록 시 JK가 직접 입력하는 고유 키 (프로젝트/폴더명으로도 사용)
 * - projectFolder = keyId
 * - contactEmail: 연락처 (고유키 아님, 개인메일 허용)
 * - id: URL용 — 기본적으로 keyId와 동일(가능하면)
 */
var LIFECYCLE_DEFS = [
    { id: 'draft', label: '초안', badge: 'draft' },
    { id: 'building', label: '구축중', badge: 'pending' },
    { id: 'ready', label: '구축완료', badge: 'ready' },
    { id: 'live', label: '운영중', badge: 'ready' },
    { id: 'paused', label: '일시중단', badge: 'pending' },
    { id: 'ended', label: '종료', badge: 'error' }
];

var HEALTH_DEFS = [
    { id: 'green', label: '정상' },
    { id: 'yellow', label: '주의' },
    { id: 'red', label: '위험' }
];

/** 개인 메일 도메인 — 연락처로 허용하되, 키 ID로는 쓰지 않음 */
var CONSUMER_EMAIL_DOMAINS = [
    'gmail.com', 'googlemail.com', 'naver.com', 'daum.net', 'hanmail.net',
    'kakao.com', 'nate.com', 'hotmail.com', 'outlook.com', 'yahoo.com',
    'icloud.com', 'me.com', 'proton.me', 'protonmail.com'
];

function normalizeContactEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function isValidContactEmail(email) {
    var s = normalizeContactEmail(email);
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isConsumerEmail(email) {
    var s = normalizeContactEmail(email);
    var at = s.lastIndexOf('@');
    if (at < 0) return false;
    var domain = s.slice(at + 1);
    return CONSUMER_EMAIL_DOMAINS.indexOf(domain) >= 0;
}

/** 키 ID 정규화: 소문자 · 영문시작 · [a-z0-9_-] */
function normalizeKeyId(value) {
    var s = String(value || '').trim().toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_-]/g, '')
        .replace(/_+/g, '_')
        .replace(/^-+|-+$/g, '');
    return s.slice(0, 40);
}

function isValidKeyId(value) {
    var s = normalizeKeyId(value);
    return /^[a-z][a-z0-9_-]{1,39}$/.test(s);
}

/** @deprecated */
function isValidKeyIdEmail(email) {
    return isValidContactEmail(email);
}

function findTenantByKeyId(keyId, exceptId) {
    var k = normalizeKeyId(keyId);
    if (!k) return null;
    return loadTenantsRaw().find(function (t) {
        if (!t || t.id === exceptId) return false;
        var candidates = [t.keyId, t.projectFolder, t.id].map(function (x) {
            return normalizeKeyId(x);
        });
        return candidates.indexOf(k) >= 0;
    }) || null;
}

function findTenantByContactEmail(email, exceptId) {
    var k = normalizeContactEmail(email);
    if (!k) return null;
    return loadTenantsRaw().find(function (t) {
        return t && normalizeContactEmail(t.contactEmail) === k && t.id !== exceptId;
    }) || null;
}

function slugifyTenant(name) {
    var s = String(name || '')
        .trim()
        .toLowerCase()
        .replace(/[^\w가-힣]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    if (!s) s = 'tenant';
    var ascii = s.replace(/[가-힣]/g, '').replace(/[^a-z0-9-]/g, '');
    if (ascii.length < 2) {
        ascii = 't' + Date.now().toString(36).slice(-6);
    }
    return ascii.slice(0, 32);
}

/**
 * 키 ID 초안 제안값 (자동 채움용, 확정은 수동 입력)
 * 권장: omnify_{영문슬러그}
 */
function suggestKeyId(companyNameEn, companyName, exceptId, listOpt) {
    var base = slugifyTenant(companyNameEn || companyName || 'tenant').replace(/-/g, '');
    if (!base) base = 'tenant';
    var folder = 'omnify_' + base.slice(0, 28);
    var n = 1;
    var list = listOpt || loadTenantsRaw();
    while (list.some(function (t) {
        if (!t || t.id === exceptId) return false;
        return normalizeKeyId(t.projectFolder) === folder ||
            normalizeKeyId(t.keyId) === folder ||
            normalizeKeyId(t.id) === folder;
    })) {
        folder = 'omnify_' + base.slice(0, 24) + '_' + (++n);
    }
    return folder;
}

/** @deprecated 호환 — suggestKeyId 사용 */
function buildProjectFolder(companyNameEn, companyName, exceptId, listOpt) {
    return suggestKeyId(companyNameEn, companyName, exceptId, listOpt);
}

function lifecycleLabel(id) {
    var d = LIFECYCLE_DEFS.find(function (x) { return x.id === id; });
    return d ? d.label : (id || '-');
}

function healthLabel(id) {
    var d = HEALTH_DEFS.find(function (x) { return x.id === id; });
    return d ? d.label : (id || '-');
}

function loadTenantsRaw() {
    try {
        var raw = localStorage.getItem(OMNIFY_TENANTS_KEY);
        var list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch (e) {
        return [];
    }
}

function loadTenants() {
    return loadTenantsRaw().map(normalizeTenantRecord);
}

function normalizeTenantRecord(t) {
    if (!t || typeof t !== 'object') return t;
    t.commercial = defaultCommercial(Object.assign({}, t, { commercial: t.commercial }));
    t.opsChecklist = mergeChecklist(OPS_CHECKLIST_DEFS, t.opsChecklist);
    t.contractChecklist = mergeChecklist(CONTRACT_CHECKLIST_DEFS, t.contractChecklist);
    t.opsNotes = t.opsNotes || '';
    // 구버전: keyId가 이메일이면 비움 → projectFolder/제안값으로 보정
    if (t.keyId && String(t.keyId).indexOf('@') >= 0) t.keyId = '';
    if (t.projectFolder && String(t.projectFolder).indexOf('@') >= 0) t.projectFolder = '';
    var resolvedKey = normalizeKeyId(t.keyId || t.projectFolder || '');
    if (!resolvedKey || !isValidKeyId(resolvedKey)) {
        resolvedKey = suggestKeyId(t.companyNameEn, t.companyName, t.id, loadTenantsRaw());
    }
    t.keyId = resolvedKey;
    t.projectFolder = resolvedKey;
    t.contactEmail = normalizeContactEmail(t.contactEmail || '');
    t.lifecycle = t.lifecycle || (t.status === 'ready' ? 'ready' : t.status === 'error' ? 'draft' : 'draft');
    t.health = t.health || 'green';
    t.nextAction = t.nextAction || '';
    t.accountOwner = t.accountOwner || 'JK';
    t.contractStart = t.contractStart || '';
    t.contractEnd = t.contractEnd || '';
    if (t.provision && Array.isArray(t.provision.steps)) {
        t.provision.steps.forEach(function (s) {
            if (s.operatorNote == null) s.operatorNote = '';
        });
    }
    if (!t.custom) t.custom = defaultCustomConfig(t);
    return t;
}

function saveTenants(list) {
    localStorage.setItem(OMNIFY_TENANTS_KEY, JSON.stringify(list));
}

function getTenantById(id) {
    return loadTenants().find(function(t) { return t.id === id; }) || null;
}

function upsertTenant(tenant) {
    upsertTenantLocalOnly(tenant);
    if (TenantStore.backend === 'api') {
        TenantStore._pendingSync = TenantStore.pushOne(tenant);
    }
    return tenant;
}

function deleteTenant(id) {
    saveTenants(loadTenants().filter(function(t) { return t.id !== id; }));
    if (TenantStore.backend === 'api') {
        TenantStore._pendingSync = TenantStore.removeRemote(id);
    }
}

function defaultCommercial(form) {
    form = form || {};
    var plan = form.billingPlan || form.serviceTier || 'growth';
    var prepaid = form.commercial && form.commercial.prepaidTerm
        ? form.commercial.prepaidTerm
        : 'none';
    var discount = 0;
    if (prepaid === '12') discount = 10;
    else if (prepaid === '6') discount = 5;
    if (form.commercial && form.commercial.discountPct != null && form.commercial.prepaidTerm === prepaid) {
        discount = Number(form.commercial.discountPct) || discount;
    }
    return {
        setupFeeMan: PLAN_SETUP_MAN[plan] != null ? PLAN_SETUP_MAN[plan] : null,
        monthlyFeeMan: Number((form.commercial && form.commercial.monthlyFeeMan) != null
            ? form.commercial.monthlyFeeMan
            : (PLAN_MONTHLY_MAN[plan] || 30)),
        prepaidTerm: prepaid,
        discountPct: discount,
        aopEnabled: prepaid === '6' || prepaid === '12',
        refundPolicyKey: 'normal_deduct',
        refundPolicyText: REFUND_POLICY_TEXT,
        notes: (form.commercial && form.commercial.notes) || ''
    };
}

function calcPrepaidTotals(commercial) {
    commercial = commercial || defaultCommercial({});
    var months = commercial.prepaidTerm === '12' ? 12 : commercial.prepaidTerm === '6' ? 6 : 0;
    var monthly = Number(commercial.monthlyFeeMan) || 0;
    var pct = Number(commercial.discountPct) || 0;
    var listTotal = months ? monthly * months : 0;
    var payTotal = months ? Math.round(listTotal * (100 - pct)) / 100 : 0;
    return {
        months: months,
        listTotal: listTotal,
        payTotal: payTotal,
        save: Math.round((listTotal - payTotal) * 100) / 100
    };
}

function defaultChecklistState(defs) {
    var o = {};
    (defs || []).forEach(function (d) { o[d.id] = false; });
    return o;
}

function mergeChecklist(defs, saved) {
    var base = defaultChecklistState(defs);
    if (!saved || typeof saved !== 'object') return base;
    Object.keys(base).forEach(function (k) {
        if (saved[k] != null) base[k] = !!saved[k];
    });
    return base;
}

function checklistProgress(defs, state) {
    state = mergeChecklist(defs, state);
    var total = defs.length;
    var done = defs.filter(function (d) { return state[d.id]; }).length;
    return { done: done, total: total, pct: total ? Math.round(done / total * 100) : 0 };
}

function phase1ModulesToViews(modules) {
    var map = { 'view-settings': true, 'view-api': true };
    (modules || []).forEach(function (mod) {
        var views = PHASE1_MODULE_VIEWS[mod] || [];
        views.forEach(function (v) { map[v] = true; });
    });
    return map;
}

function getPhase1AllowedViews(tenant) {
    if (!tenant || !tenant.custom || !tenant.custom.biz) return null;
    var mods = tenant.custom.biz.phase1Modules;
    if (!mods || !mods.length) return null;
    return phase1ModulesToViews(mods);
}

function buildQuoteText(tenant) {
    if (!tenant) return '';
    var c = tenant.custom || {};
    var com = tenant.commercial || defaultCommercial(tenant);
    var prepaid = calcPrepaidTotals(com);
    var lines = [];
    lines.push('[Omnify 견적 요약]');
    lines.push('고객사: ' + (tenant.companyName || '-'));
    lines.push('청구 플랜: ' + tenant.billingPlan + (tenant.specialPricing ? ' (특가 · 서비스 ' + tenant.serviceTier + ')' : ''));
    lines.push('서비스 티어: ' + tenant.serviceTier);
    lines.push('작업 좌석: ' + tenant.seats + ' · 알림톡 수신: ' + tenant.briefingRecipients);
    lines.push('채널: ' + (tenant.channels || []).join(', '));
    if (com.setupFeeMan != null) lines.push('초기 구축비: ' + com.setupFeeMan + '만원');
    else lines.push('초기 구축비: 별도 견적');
    lines.push('월 유지비(정상가): ' + com.monthlyFeeMan + '만원');
    if (prepaid.months) {
        lines.push('일시납: ' + prepaid.months + '개월 · 할인 ' + com.discountPct + '%');
        lines.push('일시납 정상합: ' + prepaid.listTotal + '만원 → 결제 ' + prepaid.payTotal + '만원 (절약 ' + prepaid.save + '만원)');
    } else {
        lines.push('결제 주기: 월납');
    }
    if (c.biz && c.biz.goLiveDate) lines.push('Go-live 목표: ' + c.biz.goLiveDate);
    lines.push('');
    lines.push('[중도 해지 · 환불]');
    lines.push(com.refundPolicyText || REFUND_POLICY_TEXT);
    if (c.biz && c.biz.customRequests) {
        lines.push('');
        lines.push('[커스텀 요청]');
        lines.push(c.biz.customRequests);
    }
    lines.push('');
    lines.push('미리보기: ' + ((tenant.infra && tenant.infra.previewPath) || '-'));
    return lines.join('\n');
}

function defaultBriefingLimit(serviceTier) {
    var map = { starter: 1, growth: 3, enterprise: 5 };
    return map[serviceTier] || 1;
}

var BRIEFING_CUSTOM_ITEMS = [
    { id: 'revenue', label: '전일 통합 매출' },
    { id: 'margin', label: '채널별 마진율' },
    { id: 'inventory', label: '위험 재고 경보' },
    { id: 'orders', label: '미처리 발주/송장' },
    { id: 'api', label: 'API 연동 상태' },
    { id: 'forecast', label: 'AI 월말 매출 예상' },
    { id: 'roas', label: '광고 ROAS 알림' }
];

var CUSTOM_MODULE_OPTIONS = [
    { id: 'dashboard', label: '통합 대시보드' },
    { id: 'briefing', label: '데일리 브리핑' },
    { id: 'datahub', label: 'DataHub' },
    { id: 'orders', label: '주문 · 발주' },
    { id: 'inventory', label: '통합 재고' },
    { id: 'archive', label: 'Drive 자료실' },
    { id: 'crm', label: '프로모션 (Growth+)' },
    { id: 'profit', label: 'AI 수익성 (Ent)' },
    { id: 'comms', label: '커뮤니케이션 (Ent)' },
    { id: 'activity', label: '활동 이력 (Ent)' }
];

var CHANNEL_ADMIN_URL_DEFAULTS = {
    cafe24: 'https://eclogin.cafe24.com/Shop/',
    smartstore: 'https://sell.smartstore.naver.com/',
    coupang: 'https://wing.coupang.com/',
    gmarket: 'https://www.esmplus.com/',
    elevenst: 'https://soffice.11st.co.kr/',
    auction: 'https://www.esmplus.com/',
    ssg: 'https://po.ssgadm.com/',
    lotteon: 'https://SO.lotteon.com/',
    interpark: 'https://shop.interpark.com/',
    ably: 'https://seller.a-bly.com/',
    musinsa: 'https://www.musinsa.com/',
    oliveyoung: 'https://www.oliveyoung.co.kr/',
    zigzag: 'https://shop.zigzag.kr/',
    cm29: 'https://www.29cm.co.kr/',
    brandi: 'https://www.brandi.co.kr/',
    wconcept: 'https://www.wconcept.co.kr/',
    hyundai_hmall: 'https://www.hmall.com/',
    galleria: 'https://www.galleria.co.kr/',
    akmall: 'https://www.akmall.com/',
    kurly: 'https://www.kurly.com/',
    ohouse: 'https://ohouse.kr/',
    kakao_store: 'https://shopping-sell.kakao.com/',
    toss: 'https://toss.im/',
    aliexpress: 'https://sell.aliexpress.com/',
    temu: 'https://seller.temu.com/',
    gsshop: 'https://www.gsshop.com/',
    cjonstyle: 'https://display.cjonstyle.com/',
    nsshop: 'https://www.nsmall.com/',
    youtube_shop: 'https://studio.youtube.com/',
    instagram_shop: 'https://business.facebook.com/',
    other: ''
};

function evenChannelWeights(channelIds) {
    var weights = {};
    var list = channelIds || [];
    if (!list.length) return weights;
    var base = Math.floor(100 / list.length);
    var rem = 100 - base * list.length;
    list.forEach(function(id, i) {
        weights[id] = base + (i === 0 ? rem : 0);
    });
    return weights;
}

function defaultBriefingItems() {
    var o = {};
    BRIEFING_CUSTOM_ITEMS.forEach(function(it) { o[it.id] = true; });
    return o;
}

function eokToWon(eok) {
    var n = Number(eok);
    if (!isFinite(n)) return 0;
    return Math.round(n * 100000000);
}

function wonToEok(won) {
    var n = Number(won);
    if (!isFinite(n) || !n) return 0;
    return Math.round((n / 100000000) * 100) / 100;
}

/**
 * 데모 구조 위에 얹는 고객 커스텀 시드.
 * 어드민 2번째 탭 ↔ 대시보드 getSettings / 브리핑 / 팀 시드.
 */
function defaultCustomConfig(form) {
    form = form || {};
    var channels = (form.channels || []).slice();
    var weights = evenChannelWeights(channels);
    if (channels.indexOf('cafe24') >= 0 && channels.length > 1) {
        weights = evenChannelWeights(channels);
        weights.cafe24 = Math.max(weights.cafe24 || 0, 40);
        var rest = 100 - weights.cafe24;
        var others = channels.filter(function(c) { return c !== 'cafe24'; });
        if (others.length) {
            var each = Math.floor(rest / others.length);
            var rem = rest - each * others.length;
            others.forEach(function(id, i) {
                weights[id] = each + (i === 0 ? rem : 0);
            });
        }
    }
    var urls = {};
    channels.forEach(function(id) {
        urls[id] = CHANNEL_ADMIN_URL_DEFAULTS[id] || '';
    });
    var margins = { global: 32 };
    channels.forEach(function(id) { margins[id] = 30; });

    return {
        brand: {
            displayName: form.companyName || '',
            legalName: form.companyName || '',
            titleSuffix: '커맨드 센터'
        },
        biz: {
            monthlyGmvEok: 0,
            homeMallSharePct: 50,
            avgOrderValue: 0,
            goLiveDate: '',
            phase1Modules: ['dashboard', 'briefing', 'datahub', 'orders', 'inventory', 'archive'],
            customRequests: '',
            buildNotes: ''
        },
        kpi: {
            monthlyTargetEok: 8.5,
            currentRevenueEok: 6.4,
            dailyOrderTarget: 1500,
            targetMargin: 32,
            targetRoas: 3.5
        },
        margins: margins,
        channelWeights: weights,
        channelAdminUrls: urls,
        inventory: {
            defaultSafetyDays: 14,
            defaultReorderPoint: 50,
            defaultLeadTimeDays: 7,
            autoAlertEnabled: true
        },
        briefing: {
            sendTime: '08:30',
            items: defaultBriefingItems(),
            recipientsText: ''
        },
        team: {
            seedText: ''
        },
        ads: {
            monthlyBudgetMan: 1500,
            mediaText: 'Meta Ads|SNS|50\nGoogle Ads|검색|35\n네이버 검색광고|검색|40'
        }
    };
}

function mergeCustomConfig(base, patch) {
    if (!patch) return base || defaultCustomConfig({});
    base = base || defaultCustomConfig({});
    function deep(a, b) {
        if (!b || typeof b !== 'object' || Array.isArray(b)) return b !== undefined ? b : a;
        var out = Array.isArray(a) ? a.slice() : Object.assign({}, a || {});
        Object.keys(b).forEach(function(k) {
            if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) {
                out[k] = deep(a && a[k], b[k]);
            } else if (b[k] !== undefined) {
                out[k] = b[k];
            }
        });
        return out;
    }
    return deep(base, patch);
}

function parsePipeLines(text, minCols) {
    minCols = minCols || 1;
    return String(text || '').split(/\n/).map(function(line) {
        return line.trim();
    }).filter(Boolean).map(function(line) {
        return line.split('|').map(function(p) { return p.trim(); });
    }).filter(function(parts) {
        return parts.length >= minCols && parts[0];
    });
}

function customToSettingsPatch(custom, tenantChannels) {
    custom = custom || defaultCustomConfig({});
    var channels = tenantChannels || Object.keys(custom.channelWeights || {});
    var weights = custom.channelWeights || {};
    var urls = custom.channelAdminUrls || {};
    var margins = custom.margins || {};
    var nameMap = {};
    (typeof CHANNEL_CATALOG !== 'undefined' ? CHANNEL_CATALOG : []).forEach(function(c) {
        nameMap[c.id] = c.label;
    });
    var channelSettings = channels.map(function(id) {
        return {
            id: id,
            name: nameMap[id] || id,
            url: urls[id] || CHANNEL_ADMIN_URL_DEFAULTS[id] || '',
            apiConnected: true,
            weight: Number(weights[id]) || 0,
            active: true
        };
    });
    var adLines = parsePipeLines(custom.ads && custom.ads.mediaText, 1);
    var adMedia = adLines.map(function(p, i) {
        return {
            id: 'ad-custom-' + (i + 1),
            name: p[0],
            type: p[1] || '기타',
            dailyBudget: Math.round((Number(p[2]) || 0) * 10000),
            roasTarget: Number(p[3]) || 3.0,
            active: true
        };
    });
    return {
        kpi: {
            monthlyRevenueTarget: eokToWon(custom.kpi && custom.kpi.monthlyTargetEok),
            currentMonthlyRevenue: eokToWon(custom.kpi && custom.kpi.currentRevenueEok),
            dailyOrderTarget: Number(custom.kpi && custom.kpi.dailyOrderTarget) || 0,
            targetMargin: Number(custom.kpi && custom.kpi.targetMargin) || 0,
            targetRoas: Number(custom.kpi && custom.kpi.targetRoas) || 0
        },
        margins: Object.assign({ global: Number(margins.global) || 0 }, margins),
        adBudget: {
            monthlyTotal: Math.round((Number(custom.ads && custom.ads.monthlyBudgetMan) || 0) * 10000)
        },
        inventory: Object.assign({}, custom.inventory || {}),
        channels: channelSettings,
        adMedia: adMedia.length ? adMedia : undefined
    };
}

function customTeamSeed(custom) {
    var lines = parsePipeLines(custom && custom.team && custom.team.seedText, 1);
    var colors = ['from-blue-500 to-cyan-400', 'from-violet-500 to-fuchsia-400', 'from-emerald-500 to-teal-400', 'from-amber-500 to-orange-400', 'from-rose-500 to-pink-400'];
    return lines.map(function(p, i) {
        var name = p[0];
        return {
            id: 't' + (i + 1) + '_' + name.slice(0, 2),
            name: name,
            role: p[1] || '멤버',
            email: p[2] || '',
            seatType: (p[3] === 'admin' || p[3] === 'viewer' || p[3] === 'member') ? p[3] : (i === 0 ? 'admin' : 'member'),
            active: true,
            avatar: name.charAt(0),
            color: colors[i % colors.length]
        };
    });
}

function customBriefingRecipients(custom) {
    return parsePipeLines(custom && custom.briefing && custom.briefing.recipientsText, 1).map(function(p, i) {
        return {
            id: 'cr' + (i + 1),
            name: p[0],
            role: p[1] || '',
            phone: p[2] || ''
        };
    });
}

function countCustomCompleteness(custom) {
    custom = custom || {};
    var checks = [
        !!(custom.brand && custom.brand.displayName),
        !!(custom.kpi && custom.kpi.monthlyTargetEok > 0),
        !!(custom.biz && (custom.biz.monthlyGmvEok > 0 || custom.biz.goLiveDate)),
        !!(custom.channelWeights && Object.keys(custom.channelWeights).length),
        !!(custom.briefing && custom.briefing.sendTime),
        !!(custom.team && custom.team.seedText && custom.team.seedText.trim()),
        !!(custom.biz && custom.biz.customRequests && custom.biz.customRequests.trim()),
        !!(custom.biz && custom.biz.phase1Modules && custom.biz.phase1Modules.length)
    ];
    var done = checks.filter(Boolean).length;
    return { done: done, total: checks.length, pct: Math.round(done / checks.length * 100) };
}

function buildTenantDraft(form) {
    var now = new Date().toISOString();
    var contactEmail = normalizeContactEmail(form.contactEmail);
    var keyId = normalizeKeyId(form.keyId || form.projectFolder || '');
    if (!isValidKeyId(keyId)) {
        keyId = suggestKeyId(form.companyNameEn, form.companyName);
    }
    // URL id: 키 ID와 동일 (충돌 시 접미사)
    var id = keyId;
    var n = 1;
    while (getTenantById(id)) {
        id = keyId.slice(0, 32) + '-' + (++n);
    }
    var serviceTier = form.serviceTier || form.billingPlan || 'growth';
    var billingPlan = form.billingPlan || serviceTier;
    var channels = (form.channels || []).slice();
    return {
        id: id,
        version: 1,
        status: 'draft',
        keyId: keyId,
        projectFolder: keyId,
        lifecycle: form.lifecycle || 'draft',
        health: form.health || 'green',
        nextAction: form.nextAction || '',
        accountOwner: form.accountOwner || 'JK',
        contractStart: form.contractStart || '',
        contractEnd: form.contractEnd || '',
        createdAt: now,
        updatedAt: now,
        companyName: form.companyName || '',
        companyNameEn: form.companyNameEn || '',
        businessNo: form.businessNo || '',
        contactName: form.contactName || '',
        contactEmail: contactEmail,
        contactPhone: form.contactPhone || '',
        billingPlan: billingPlan,
        serviceTier: serviceTier,
        specialPricing: !!form.specialPricing,
        seats: Number(form.seats) || (serviceTier === 'enterprise' ? 10 : serviceTier === 'growth' ? 5 : 2),
        briefingRecipients: Number(form.briefingRecipients) || defaultBriefingLimit(serviceTier),
        channels: channels,
        channelCount: channels.length,
        wms: form.wms || 'none',
        inventoryWrite: !!form.inventoryWrite,
        skuApprox: Number(form.skuApprox) || 0,
        driveFolderUrl: form.driveFolderUrl || '',
        driveFolderId: form.driveFolderId || extractDriveFolderId(form.driveFolderUrl || form.driveFolderId),
        driveOwnerEmail: form.driveOwnerEmail || '',
        driveSharedWith: form.driveSharedWith || '',
        driveEnabled: !!form.driveEnabled || !!(form.driveFolderUrl || form.driveFolderId),
        notes: form.notes || '',
        commercial: defaultCommercial(form),
        opsChecklist: mergeChecklist(OPS_CHECKLIST_DEFS, form.opsChecklist),
        contractChecklist: mergeChecklist(CONTRACT_CHECKLIST_DEFS, form.contractChecklist),
        opsNotes: form.opsNotes || '',
        custom: mergeCustomConfig(defaultCustomConfig(form), form.custom || null),
        provision: {
            status: 'pending',
            steps: PROVISION_STEPS.map(function(s) {
                return { id: s.id, label: s.label, detail: s.detail, status: 'pending', at: null, message: '', operatorNote: '' };
            }),
            lastError: null
        },
        infra: {
            storagePrefix: 'tenants/' + keyId,
            webhookBase: 'https://hooks.omnify.local/' + id,
            previewPath: 'demo-dashboard.html?tenant=' + encodeURIComponent(id) + '&tier=' + encodeURIComponent(serviceTier)
        }
    };
}

/**
 * 인프라/초안 자동 구축 시뮬레이션.
 * 실제 환경: 각 step에서 Cloud Function 호출.
 */
function runProvisionPipeline(tenantId, onProgress) {
    var tenant = getTenantById(tenantId);
    if (!tenant) return Promise.reject(new Error('tenant not found'));

    tenant.provision.status = 'running';
    tenant.updatedAt = new Date().toISOString();
    upsertTenantLocalOnly(tenant);
    if (onProgress) onProgress(tenant);

    function delay(ms) {
        return new Promise(function(resolve) { setTimeout(resolve, ms); });
    }

    function stepWork(step) {
        return delay(350 + Math.random() * 450).then(function() {
            var t = getTenantById(tenantId);
            var st = t.provision.steps.find(function(s) { return s.id === step.id; });
            if (!st) return t;

            if (step.id === 'wms' && t.wms === 'none') {
                st.status = 'skipped';
                st.message = 'WMS 미선택 — 채널 재고만';
            } else if (step.id === 'wms' && t.wms === 'sabangnet' && t.inventoryWrite) {
                st.status = 'done';
                st.message = '사방넷 읽기 등록 · 쓰기는 Ent 별도(스텁)';
            } else if (step.id === 'wms' && t.wms === 'sabangnet') {
                st.status = 'done';
                st.message = '사방넷 읽기 프로파일 적용';
            } else if (step.id === 'drive') {
                if (!t.driveEnabled) {
                    st.status = 'skipped';
                    st.message = 'Drive 연동 미포함';
                } else if (!(t.driveFolderUrl || t.driveFolderId)) {
                    st.status = 'skipped';
                    st.message = '폴더 URL/ID 없음 — 추후 연동';
                } else {
                    if (!t.driveFolderId && t.driveFolderUrl) {
                        t.driveFolderId = extractDriveFolderId(t.driveFolderUrl);
                    }
                    st.status = 'done';
                    st.message = (t.driveFolderId ? 'folderId ' + t.driveFolderId : 'URL 등록') +
                        (t.driveOwnerEmail ? ' · ' + t.driveOwnerEmail : '');
                }
            } else if (step.id === 'channels') {
                st.status = 'done';
                st.message = (t.channels || []).length + '개 슬롯 · 웹훅 URL 예약';
            } else if (step.id === 'briefing') {
                st.status = 'done';
                st.message = '수신 ' + t.briefingRecipients + '명 · 매일 1인 1통';
            } else if (step.id === 'config_seed') {
                var comp = countCustomCompleteness(t.custom);
                st.status = 'done';
                st.message = '커스텀 시드 ' + comp.done + '/' + comp.total + ' · KPI·채널·브리핑';
            } else if (step.id === 'preview') {
                st.status = 'done';
                st.message = t.infra.previewPath;
            } else {
                st.status = 'done';
                st.message = '완료';
            }
            st.at = new Date().toISOString();
            t.provision.status = 'running';
            t.updatedAt = st.at;
            upsertTenantLocalOnly(t);
            if (onProgress) onProgress(t);
            return t;
        });
    }

    var chain = Promise.resolve();
    PROVISION_STEPS.forEach(function(step) {
        chain = chain.then(function() { return stepWork(step); });
    });

    return chain.then(function() {
        var t = getTenantById(tenantId);
        t.provision.status = 'ready';
        t.status = 'ready';
        t.updatedAt = new Date().toISOString();
        upsertTenant(t);
        if (onProgress) onProgress(t);
        return t;
    }).catch(function(err) {
        var t = getTenantById(tenantId);
        if (t) {
            t.provision.status = 'error';
            t.provision.lastError = String(err && err.message ? err.message : err);
            t.status = 'error';
            upsertTenant(t);
            if (onProgress) onProgress(t);
        }
        throw err;
    });
}

function tenantStorageKey(base) {
    if (typeof App !== 'undefined' && App.tenantId) return base + '_t_' + App.tenantId;
    return base;
}

function applyTenantToDashboardApp(tenant) {
    if (!tenant || typeof App === 'undefined') return;
    App.tenantId = tenant.id;
    App.tenantMeta = tenant;
    var custom = tenant.custom || defaultCustomConfig(tenant);
    App.tenantCustom = custom;
    var display = (custom.brand && custom.brand.displayName) || tenant.companyName || App.brandName;
    App.brandName = display;
    if (tenant.serviceTier) {
        window.DASHBOARD_TIER = tenant.serviceTier;
        App.tier = tenant.serviceTier;
    }
    var suffix = (custom.brand && custom.brand.titleSuffix) || '커맨드 센터';
    try {
        document.title = display + ' — ' + suffix;
    } catch (e) { /* ignore */ }
}

function applyTenantCustomAfterLoad() {
    if (typeof App === 'undefined' || !App.tenantMeta) return;
    var custom = App.tenantCustom || App.tenantMeta.custom;
    if (!custom) return;

    if (typeof getSettings === 'function' && App.settings) {
        var patch = customToSettingsPatch(custom, App.tenantMeta.channels);
        App.settings.kpi = Object.assign({}, App.settings.kpi, patch.kpi || {});
        App.settings.margins = Object.assign({}, App.settings.margins, patch.margins || {});
        App.settings.inventory = Object.assign({}, App.settings.inventory, patch.inventory || {});
        if (patch.adBudget) App.settings.adBudget = Object.assign({}, App.settings.adBudget, patch.adBudget);
        if (patch.channels && patch.channels.length) App.settings.channels = patch.channels;
        if (patch.adMedia && patch.adMedia.length) App.settings.adMedia = patch.adMedia;
        if (typeof syncSettingsToApp === 'function') syncSettingsToApp();
    }

    if (custom.briefing) {
        if (custom.briefing.items && typeof App.briefingConfig === 'object') {
            App.briefingConfig = Object.assign({}, App.briefingConfig, custom.briefing.items);
        }
        var seeded = customBriefingRecipients(custom);
        if (seeded.length) {
            window.__OMNIFY_BRIEFING_POOL__ = seeded;
            App.briefingRecipientIds = seeded.slice(0, App.tenantMeta.briefingRecipients || seeded.length).map(function(r) {
                return r.id;
            });
        }
    }

    var team = customTeamSeed(custom);
    var teamKey = tenantStorageKey(typeof TEAM_STORAGE_KEY !== 'undefined' ? TEAM_STORAGE_KEY : 'omnify_team_v1');
    var hasSavedTeam = false;
    try { hasSavedTeam = !!localStorage.getItem(teamKey); } catch (e) { /* ignore */ }
    if (team.length && !hasSavedTeam) {
        App.teamMembers = team;
    }
}

function resolveTenantFromQuery() {
    try {
        var q = new URLSearchParams(window.location.search).get('tenant');
        if (!q) return null;
        return getTenantById(q);
    } catch (e) {
        return null;
    }
}

/** 로컬 캐시 → 없으면 API 단건 조회 */
function resolveTenantFromQueryAsync() {
    try {
        var q = new URLSearchParams(window.location.search).get('tenant');
        if (!q) return Promise.resolve(null);
        var local = getTenantById(q);
        if (local) return Promise.resolve(local);
        return TenantStore.fetchOne(q).catch(function () { return null; });
    } catch (e) {
        return Promise.resolve(null);
    }
}
