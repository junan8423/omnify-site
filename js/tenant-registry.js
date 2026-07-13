/**
 * Omnify 테넌트 레지스트리 · 자동 구축 파이프라인 (클라이언트 MVP)
 * 실서비스에서는 동일 스키마로 API/Firebase Functions에 이식.
 */
var OMNIFY_TENANTS_KEY = 'omnify_tenants_v1';

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
    { id: 'cafe24', label: 'Cafe24(자사몰)' },
    { id: 'smartstore', label: '네이버 스마트스토어' },
    { id: 'coupang', label: '쿠팡' },
    { id: 'ably', label: '에이블리' },
    { id: 'zigzag', label: '지그재그' },
    { id: 'musinsa', label: '무신사' },
    { id: 'elevenst', label: '11번가' },
    { id: 'gmarket', label: 'G마켓' },
    { id: 'auction', label: '옥션' },
    { id: 'other', label: '기타' }
];

function extractDriveFolderId(urlOrId) {
    var s = String(urlOrId || '').trim();
    if (!s) return '';
    if (/^[a-zA-Z0-9_-]{10,}$/.test(s) && s.indexOf('http') !== 0) return s;
    var m = s.match(/\/folders\/([a-zA-Z0-9_-]+)/) || s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    return m ? m[1] : '';
}

function slugifyTenant(name) {
    var s = String(name || '')
        .trim()
        .toLowerCase()
        .replace(/[^\w가-힣]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    if (!s) s = 'tenant';
    // ASCII-friendly id for URLs
    var ascii = s.replace(/[가-힣]/g, '');
    if (ascii.length < 2) {
        ascii = 't' + Date.now().toString(36).slice(-6);
    }
    return ascii.slice(0, 32);
}

function loadTenants() {
    try {
        var raw = localStorage.getItem(OMNIFY_TENANTS_KEY);
        var list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch (e) {
        return [];
    }
}

function saveTenants(list) {
    localStorage.setItem(OMNIFY_TENANTS_KEY, JSON.stringify(list));
}

function getTenantById(id) {
    return loadTenants().find(function(t) { return t.id === id; }) || null;
}

function upsertTenant(tenant) {
    var list = loadTenants();
    var i = list.findIndex(function(t) { return t.id === tenant.id; });
    if (i >= 0) list[i] = tenant;
    else list.unshift(tenant);
    saveTenants(list);
    return tenant;
}

function deleteTenant(id) {
    saveTenants(loadTenants().filter(function(t) { return t.id !== id; }));
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
    ably: 'https://seller.a-bly.com/',
    zigzag: 'https://shop.zigzag.kr/',
    musinsa: 'https://www.musinsa.com/',
    elevenst: 'https://soffice.11st.co.kr/',
    gmarket: 'https://www.esmplus.com/',
    auction: 'https://www.esmplus.com/',
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
    var baseSlug = slugifyTenant(form.companyNameEn || form.companyName);
    var id = baseSlug;
    var n = 1;
    while (getTenantById(id)) {
        id = baseSlug + '-' + (++n);
    }
    var serviceTier = form.serviceTier || form.billingPlan || 'growth';
    var billingPlan = form.billingPlan || serviceTier;
    var channels = (form.channels || []).slice();
    return {
        id: id,
        version: 1,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
        companyName: form.companyName || '',
        companyNameEn: form.companyNameEn || '',
        businessNo: form.businessNo || '',
        contactName: form.contactName || '',
        contactEmail: form.contactEmail || '',
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
        custom: mergeCustomConfig(defaultCustomConfig(form), form.custom || null),
        provision: {
            status: 'pending',
            steps: PROVISION_STEPS.map(function(s) {
                return { id: s.id, label: s.label, detail: s.detail, status: 'pending', at: null, message: '' };
            }),
            lastError: null
        },
        infra: {
            storagePrefix: 'tenants/' + id,
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
    upsertTenant(tenant);
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
            upsertTenant(t);
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
