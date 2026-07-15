/* Omnify Dashboard — Starter / Growth / Enterprise tier */
var TIER_ORDER = ['starter', 'growth', 'enterprise'];

var TIER_ALLOWED_VIEWS = {
    starter: [
        'view-dashboard', 'view-briefing', 'view-orders', 'view-inventory', 'view-api', 'view-settings',
        'view-datahub', 'view-archive'
    ],
    growth: [
        'view-dashboard', 'view-briefing', 'view-orders', 'view-inventory', 'view-api', 'view-settings',
        'view-datahub', 'view-crm', 'view-archive'
    ],
    enterprise: null
};

var TIER_LIMITS = {
    starter: {
        seatsIncluded: 2,
        seatAddonPrice: 50000,
        seatAddonLabel: '+5만/인·월',
        maxChannels: 2,
        dataRetentionLabel: '최근 12개월',
        freeViewers: 0,
        briefingRecipients: 1
    },
    growth: {
        seatsIncluded: 5,
        seatAddonPrice: 40000,
        seatAddonLabel: '+4만/인·월',
        maxChannels: 4,
        dataRetentionLabel: '최근 24개월',
        freeViewers: 2,
        briefingRecipients: 3
    },
    enterprise: {
        seatsIncluded: 10,
        seatAddonPrice: 30000,
        seatAddonLabel: '+3만/인·월',
        maxChannels: 99,
        dataRetentionLabel: '전체 기간',
        freeViewers: null,
        briefingRecipients: 5
    }
};

/** Export abuse protection (no monthly quota) */
var EXPORT_GUARD = {
    maxSyncRows: 50000,
    softQueueRows: 100000,
    hardRawDumpRows: 500000,
    pdfPerDay: 20,
    exportsPerMinute: 5,
    exportsPerHour: 40
};

var TIER_NOTIFICATION_ACTIONS = {
    starter: { 'view-inventory': true, 'view-api': true, 'view-briefing': true, 'view-orders': true, 'view-datahub': true },
    growth: { 'view-inventory': true, 'view-api': true, 'view-briefing': true, 'view-orders': true, 'view-datahub': true, 'view-crm': true },
    enterprise: null
};

var TIER_META = {
    starter: {
        planLabel: 'Starter Plan',
        planDesc: 'DataHub · KPI · Drive 자료실',
        planSub: '좌석 2인 · 채널 2개 · 12개월 보존',
        demoBadge: 'Starter 데모',
        headerSub: '<span class="demo-pill">Starter 목업</span>스타터 플랜 · 매일 브리핑 · <span id="last-sync">--:--:--</span>',
        title: '(주)SAMPLE — Starter 커맨드 센터',
        pill: 'Starter'
    },
    growth: {
        planLabel: 'Growth Plan',
        planDesc: '프로모션 · 팀 5인 · Drive',
        planSub: '작업 좌석 5 · 뷰어 2 · DataHub 24개월',
        demoBadge: 'Growth 데모',
        headerSub: '<span class="demo-pill">Growth 목업</span>그로스 플랜 · 매일 브리핑 · <span id="last-sync">--:--:--</span>',
        title: '(주)SAMPLE — Growth 커맨드 센터',
        pill: 'Growth'
    },
    enterprise: {
        planLabel: 'Enterprise Plan',
        planDesc: '팀 10인 · 뷰어 무제한 · AI',
        planSub: '작업 좌석 10 · 뷰어 무제한 · 커뮤니케이션',
        demoBadge: 'Enterprise 데모',
        headerSub: '<span class="demo-pill">Enterprise 목업</span>엔터프라이즈 플랜 · <span id="last-sync">--:--:--</span>',
        title: '(주)SAMPLE — Enterprise 커맨드 센터',
        pill: 'Enterprise'
    }
};

function normalizeTierId(tier) {
    if (tier === 'standard') return 'starter';
    if (tier === 'pro') return 'enterprise';
    return tier;
}

function resolveDashboardTier() {
    try {
        var q = new URLSearchParams(window.location.search).get('tier');
        if (q) return normalizeTierId(q);
    } catch (e) { /* ignore */ }
    if (window.DASHBOARD_TIER) return normalizeTierId(window.DASHBOARD_TIER);
    return 'enterprise';
}

function tierAtLeast(minTier) {
    if (!App || !App.tier) return false;
    return TIER_ORDER.indexOf(App.tier) >= TIER_ORDER.indexOf(minTier);
}

function getAllowedViewsForTier(tier) {
    tier = normalizeTierId(tier);
    var base = tier === 'enterprise' ? null : (TIER_ALLOWED_VIEWS[tier] || TIER_ALLOWED_VIEWS.starter);
    var phaseMap = null;
    if (typeof getPhase1AllowedViews === 'function' && typeof App !== 'undefined' && App.tenantMeta) {
        phaseMap = getPhase1AllowedViews(App.tenantMeta);
    }
    if (!phaseMap) return base;
    var phaseList = Object.keys(phaseMap);
    if (!base) return phaseList;
    return base.filter(function(v) { return !!phaseMap[v]; });
}

function getNavGroupsForTier() {
    var allowed = getAllowedViewsForTier(App.tier);
    if (!allowed) return App.navGroups;
    return App.navGroups.map(function(group) {
        var items = group.items.filter(function(item) {
            return allowed.indexOf(item.target) >= 0;
        });
        if (!items.length) return null;
        return { label: group.label, icon: group.icon, items: items };
    }).filter(Boolean);
}

function isViewAllowedForTier(viewId) {
    var allowed = getAllowedViewsForTier(App.tier);
    if (!allowed) return true;
    return allowed.indexOf(viewId) >= 0;
}

function renderStarterDashboard() {
    var m = getMockMetrics();
    var atRisk = App.inventory.filter(function(i) { return i.status !== 'safe'; });
    var recentOrders = App.orders.slice(0, 4);
    return `
<div id="view-dashboard" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">
    <div class="glass rounded-2xl p-5 border-l-4 border-l-warning relative overflow-hidden">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-start gap-3">
                <div class="w-11 h-11 rounded-xl bg-[#fae100] flex items-center justify-center shrink-0">
                    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3c-4.97 0-9 3.58-9 8.01 0 2.15.87 4.1 2.3 5.52-.17 1.1-.78 2.22-.87 2.37-.1.15-.12.33-.06.5.06.16.2.28.37.3 1.66.22 3.26-.85 3.83-1.24.57.14 1.16.22 1.76.22 4.97 0 9-3.58 9-8.01S16.97 3 12 3z"/></svg>
                </div>
                <div>
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 class="font-bold text-base">오늘 아침 브리핑</h2>
                        <span class="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded font-bold">매일 08:30</span>
                        <span class="demo-pill">Starter</span>
                    </div>
                    <p class="text-sm text-gray-400">마진율 <strong class="text-white">${m.marginGlobal}%</strong> · 위험 재고 <strong class="text-danger">${m.atRiskInventory}건</strong> · 미처리 <strong class="text-warning">${fmtCount(m.pendingShipments)}건</strong></p>
                </div>
            </div>
            <button onclick="navigateTo('view-briefing')" class="shrink-0 text-sm font-semibold text-primary border border-primary/30 px-4 py-2 rounded-lg hover:border-primary transition-colors">브리핑 보기 →</button>
        </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="glass rounded-xl kpi-card kpi-glow kpi-drill" onclick="drillDownKpi('revenue')">
            <p class="kpi-label">오늘 통합 매출</p>
            <p class="kpi-value text-white">${m.dailyRevenueFormatted}</p>
            <div class="kpi-footer"><span class="text-success font-bold">▲ ${m.dailyRevenueChange}</span><span class="text-gray-500">${App.globalDateRange.label} · 클릭→상세</span></div>
        </div>
        <div class="glass rounded-xl kpi-card kpi-glow kpi-drill" onclick="drillDownKpi('ops')">
            <p class="kpi-label">통합 마진율</p>
            <p class="kpi-value text-white">${m.marginGlobal}%</p>
            <div class="kpi-footer"><span class="${m.marginUp ? 'text-success' : 'text-warning'} font-bold">${m.marginUp ? '▲' : '●'} ${m.marginDelta}%p</span><span class="text-gray-500">목표 ${m.targetMargin}% · 클릭→상세</span></div>
        </div>
        <div class="glass rounded-xl kpi-card kpi-glow-danger kpi-drill border-l-4 border-l-warning" onclick="drillDownKpi('actions')">
            <p class="kpi-label">미처리 주문</p>
            <p class="kpi-value text-white">${m.pendingShipments}건</p>
            <div class="kpi-footer"><span class="text-warning font-bold">발주대기 ${App.orders.filter(function(o){return o.status==='pending';}).length}건</span><span class="text-gray-500">클릭→상세</span></div>
        </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5 home-chart-row">
        <div class="glass rounded-xl p-4 xl:col-span-2 chart-card">
            <div class="chart-card-header">
                <div class="chart-card-title">
                    <h2>주간 채널별 매출</h2>
                    <span class="chart-unit-badge">만 원</span>
                </div>
            </div>
            <div class="chart-legend-row">
                <span class="chart-legend-item"><span class="chart-legend-dot" style="background:rgba(59,130,246,0.8)"></span>Cafe24</span>
                <span class="chart-legend-item"><span class="chart-legend-dot" style="background:rgba(16,185,129,0.8)"></span>스마트스토어</span>
                <span class="chart-legend-item"><span class="chart-legend-dot" style="background:rgba(249,115,22,0.8)"></span>쿠팡</span>
            </div>
            <div class="chart-canvas-wrap tall"><canvas id="multiChannelChart"></canvas></div>
        </div>
        <div class="glass rounded-xl p-4 home-inv-alert">
            <div class="chart-card-header mb-2">
                <h2 class="font-bold text-sm">위험 재고</h2>
                <span class="chart-unit-badge text-danger border-danger/30 bg-danger/10">${m.atRiskInventory}건</span>
            </div>
            <div class="space-y-2 home-inv-list" role="list" aria-label="위험 재고 목록">
                ${atRisk.length ? atRisk.map(function(i) {
                    return '<div class="p-3 rounded-lg bg-surface border border-border cursor-pointer hover:border-danger/30 shrink-0" role="listitem" onclick="navigateTo(\'view-inventory\')">' +
                        '<p class="text-sm font-semibold truncate">' + i.name + '</p>' +
                        '<p class="text-xs text-gray-500 mt-1">잔여 <strong class="text-danger">' + i.total + '</strong> / 안전 ' + i.safety + '</p></div>';
                }).join('') : '<p class="text-sm text-gray-500 text-center py-4">위험 재고 없음</p>'}
            </div>
            <button type="button" onclick="navigateTo('view-inventory')" class="home-inv-foot mt-3 text-xs text-primary font-semibold hover:underline text-center w-full">전체 재고 보기 →</button>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div class="glass rounded-xl p-4">
            <h2 class="font-bold text-sm mb-3">채널 연동 상태</h2>
            <div class="space-y-2">
                ${App.apiChannels.map(function(c) {
                    return '<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-surface">' +
                        '<span>' + c.icon + '</span>' +
                        '<div class="flex-1 min-w-0"><p class="text-sm font-medium truncate">' + c.name + '</p>' +
                        '<p class="text-[10px] text-gray-500">' + c.lastSync + '</p></div>' +
                        '<span class="status-dot ' + c.status + '"></span></div>';
                }).join('')}
            </div>
            <button onclick="navigateTo('view-api')" class="mt-3 text-xs text-primary font-semibold hover:underline">API · 동기화 이력 →</button>
        </div>
        <div class="glass rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
                <h2 class="font-bold text-sm">최근 주문</h2>
                <button onclick="navigateTo('view-orders')" class="text-xs text-primary font-semibold hover:underline">전체 →</button>
            </div>
            <div class="space-y-1.5">
                ${recentOrders.map(function(o) {
                    return '<div class="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface text-xs">' +
                        App.channelBadge(o.channel) +
                        '<span class="text-gray-300 truncate flex-1">' + o.product + '</span>' +
                        App.statusBadge(o.status) + '</div>';
                }).join('')}
            </div>
            <p class="text-[10px] text-gray-600 mt-3 text-center">Starter · 자동 동기화 · 매일 브리핑</p>
        </div>
    </div>
</div>`;
}

function getTierLimits(tier) {
    tier = normalizeTierId(tier || (App && App.tier) || 'enterprise');
    return TIER_LIMITS[tier] || TIER_LIMITS.enterprise;
}

function getSeatAddonCount() {
    try {
        var n = parseInt(localStorage.getItem('omnify_seat_addon_' + App.tier) || '0', 10);
        return isNaN(n) ? 0 : Math.max(0, n);
    } catch (e) { return 0; }
}

function getSeatQuota() {
    var lim = getTierLimits();
    return lim.seatsIncluded + getSeatAddonCount();
}

function countBillableSeats(members) {
    members = members || (App && App.teamMembers) || [];
    return members.filter(function(m) {
        return m.active !== false && m.seatType !== 'viewer';
    }).length;
}

function countActiveViewers(members) {
    members = members || (App && App.teamMembers) || [];
    return members.filter(function(m) {
        return m.active !== false && m.seatType === 'viewer';
    }).length;
}

function isViewerUnlimited(tier) {
    var lim = getTierLimits(tier);
    return lim.freeViewers === null || lim.freeViewers === Infinity;
}

function formatViewerQuota(lim) {
    lim = lim || getTierLimits();
    if (lim.freeViewers === null || lim.freeViewers === Infinity) return '무제한';
    return String(lim.freeViewers);
}

function canInviteViewer(lim) {
    lim = lim || getTierLimits();
    return lim.freeViewers === null || lim.freeViewers === Infinity || lim.freeViewers > 0;
}

/** 데일리 알림톡(브리핑) 기본 수신 인원 — 플랜별. 추가는 별도 문의 */
function getBriefingRecipientLimit(tier) {
    var lim = getTierLimits(tier);
    var n = lim.briefingRecipients;
    return (typeof n === 'number' && n > 0) ? n : 1;
}

function canAddTeamSeat(seatType) {
    var lim = getTierLimits();
    if (seatType === 'viewer') {
        if (isViewerUnlimited()) return true;
        return countActiveViewers() < (lim.freeViewers || 0);
    }
    return countBillableSeats() < getSeatQuota();
}

function applySeatDemoState() {
    if (!App || !App.teamMembers) return;
    try {
        if (localStorage.getItem('omnify_team_v1')) return;
    } catch (e) { /* ignore */ }
    var lim = getTierLimits();
    var billable = 0;
    var viewers = 0;
    var unlimitedViewers = isViewerUnlimited();
    App.teamMembers.forEach(function(m) {
        if (m.seatType === 'viewer') {
            m.active = unlimitedViewers || viewers < (lim.freeViewers || 0);
            if (m.active) viewers++;
        } else {
            m.active = billable < lim.seatsIncluded;
            if (m.active) billable++;
        }
    });
}

function applyDataHubTierLimits() {
    if (!App || !App.dataHubMeta) return;
    var lim = getTierLimits();
    App.dataHubMeta.retention = lim.dataRetentionLabel;
    App.dataHubMeta.exportLimit = null;
    App.dataHubMeta.exportPolicy = '집계 Export 무제한 · 대용량·고빈도만 보호';
}

function applyTierMeta() {
    var meta = TIER_META[App.tier] || TIER_META.enterprise;
    var lim = getTierLimits();
    var company = (App.tenantMeta && App.tenantMeta.companyName) || null;
    document.title = company ? (company + ' — 커맨드 센터') : meta.title;
    var planLabel = document.getElementById('plan-badge-label');
    var planDesc = document.getElementById('plan-badge-desc');
    var planSub = document.getElementById('plan-badge-sub');
    var demoBadge = document.getElementById('demo-mode-badge');
    var headerSub = document.getElementById('header-subtitle');
    if (planLabel) planLabel.textContent = company ? (company + ' · ' + meta.pill) : meta.planLabel;
    if (planDesc) planDesc.textContent = company ? ('구축 초안 · 서비스 ' + App.tier) : meta.planDesc;
    var used = countBillableSeats();
    var quota = (App.tenantMeta && App.tenantMeta.seats) ? App.tenantMeta.seats : getSeatQuota();
    var viewerLabel = typeof formatViewerQuota === 'function' ? formatViewerQuota(lim) : String(lim.freeViewers || 0);
    if (planSub) planSub.textContent = '작업좌석 ' + used + '/' + quota + ' · 뷰어 ' + countActiveViewers() + '/' + viewerLabel + ' · ' + lim.seatAddonLabel;
    if (demoBadge) demoBadge.innerHTML = '<span class="status-dot live"></span><span>' + (company ? 'Tenant 초안' : meta.demoBadge) + '</span>';
    if (headerSub) headerSub.innerHTML = meta.headerSub;
    updateSeatMeterUI();
}

function updateSeatMeterUI() {
    var el = document.getElementById('seat-meter');
    if (!el || !App) return;
    var lim = getTierLimits();
    var used = countBillableSeats();
    var quota = getSeatQuota();
    var pct = quota ? Math.min(100, Math.round(used / quota * 100)) : 0;
    var warn = used >= quota;
    var viewerUsed = countActiveViewers();
    var viewerQuota = formatViewerQuota(lim);
    el.innerHTML =
        '<div class="flex items-center justify-between mb-1.5">' +
            '<span class="text-[10px] text-gray-500 font-semibold">작업 좌석 (Named)</span>' +
            '<span class="text-[10px] font-bold ' + (warn ? 'text-warning' : 'text-gray-400') + '">' + used + ' / ' + quota + '</span>' +
        '</div>' +
        '<div class="h-1.5 rounded-full bg-surface overflow-hidden mb-1.5">' +
            '<div class="h-full rounded-full transition-all ' + (warn ? 'bg-warning' : 'bg-primary') + '" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<p class="text-[9px] text-gray-600">뷰어 ' + viewerUsed + '/' + viewerQuota + ' · 추가 작업좌석 ' + lim.seatAddonLabel + '</p>' +
        '<p class="text-[9px] text-gray-600 mt-0.5">동시 접속이 아닌 활성 계정 수</p>';
}

function filterTierNotifications() {
    var actions = TIER_NOTIFICATION_ACTIONS[App.tier];
    if (!actions) return;
    App.notifications = App.notifications.filter(function(n) {
        return !n.action || actions[n.action];
    });
    App.unreadNotifications = Math.min(App.unreadNotifications, App.notifications.length);
}

function filterTierCommands() {
    var allowed = getAllowedViewsForTier(App.tier);
    if (!allowed) return;
    App.commands = App.commands.filter(function(c) {
        return !c.target || allowed.indexOf(c.target) >= 0;
    });
}

function initDashboardTier() {
    App.tier = resolveDashboardTier();
    App.tierAtLeast = tierAtLeast;
    App.isStarter = App.tier === 'starter';
    App.isGrowth = App.tier === 'growth';
    App.isEnterprise = App.tier === 'enterprise';
    App.allowedViews = getAllowedViewsForTier(App.tier);
    document.body.classList.add('dashboard-tier-' + App.tier);

    applyTierMeta();
    applyDataHubTierLimits();
    applySeatDemoState();
    filterTierNotifications();
    filterTierCommands();

    if (App.isStarter) {
        App.mockPipeline = { collected: App.orders.length, pending: App.orders.filter(function(o) { return o.status === 'pending'; }).length, processing: 0, shipped: App.orders.filter(function(o) { return o.status === 'shipped'; }).length };
        var fullDash = App.views['view-dashboard'];
        App.views['view-dashboard'] = function() {
            return App.isStarter ? renderStarterDashboard() : fullDash();
        };
    }

    if (typeof renderNav === 'function') {
        renderNav();
        if (typeof initNavigation === 'function') initNavigation();
    }

    if (!App.isEnterprise) {
        document.querySelectorAll('.tier-enterprise-only').forEach(function(el) { el.style.display = 'none'; });
    }
    injectTierDemoSwitcher();
}

function injectTierDemoSwitcher() {
    var aside = document.getElementById('mobile-sidebar');
    if (!aside || document.getElementById('tier-demo-switcher')) return;
    var box = document.createElement('div');
    box.id = 'tier-demo-switcher';
    box.className = 'mx-3 mb-3 p-2.5 rounded-lg border border-border bg-surface';
    box.innerHTML = '<p class="text-[10px] text-gray-500 mb-2 text-center">플랜별 데모</p>' +
        '<div class="flex flex-col gap-1.5 text-center">' +
        '<a href="demo-starter.html" class="tier-demo-link text-[11px] font-semibold py-1.5 rounded-md ' + (App.tier === 'starter' ? 'tier-demo-on' : 'tier-demo-off') + '" data-tier="starter">Starter</a>' +
        '<a href="demo-growth.html" class="tier-demo-link text-[11px] font-semibold py-1.5 rounded-md ' + (App.tier === 'growth' ? 'tier-demo-on' : 'tier-demo-off') + '" data-tier="growth">Growth</a>' +
        '<a href="demo-enterprise.html" class="tier-demo-link text-[11px] font-semibold py-1.5 rounded-md ' + (App.tier === 'enterprise' ? 'tier-demo-on' : 'tier-demo-off') + '" data-tier="enterprise">Enterprise</a>' +
        '</div>';
    var footer = aside.querySelector('.p-4.border-t');
    if (footer) aside.insertBefore(box, footer);
}

function drillDownKpiStarter(type) {
    if (!App.isStarter) return false;
    openHomeDetailPopup(type === 'margin' ? 'ops' : type);
    return true;
}
