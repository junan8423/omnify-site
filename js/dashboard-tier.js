/* Omnify Dashboard — Pro / Standard tier (shared shell, zero duplicate HTML) */
var STANDARD_ALLOWED_VIEWS = [
    'view-dashboard',
    'view-briefing',
    'view-orders',
    'view-inventory',
    'view-api',
    'view-settings'
];

var STANDARD_NOTIFICATION_ACTIONS = {
    'view-inventory': true,
    'view-api': true,
    'view-briefing': true,
    'view-orders': true
};

function resolveDashboardTier() {
    try {
        var q = new URLSearchParams(window.location.search).get('tier');
        if (q === 'standard' || q === 'pro') return q;
    } catch (e) { /* ignore */ }
    if (window.DASHBOARD_TIER === 'standard' || window.DASHBOARD_TIER === 'pro') return window.DASHBOARD_TIER;
    return 'pro';
}

function getNavGroupsForTier() {
    if (!App.isStandard) return App.navGroups;
    return App.navGroups.map(function(group) {
        var items = group.items.filter(function(item) {
            return STANDARD_ALLOWED_VIEWS.indexOf(item.target) >= 0;
        });
        if (!items.length) return null;
        return { label: group.label, icon: group.icon, items: items };
    }).filter(Boolean);
}

function isViewAllowedForTier(viewId) {
    if (!App.isStandard) return true;
    return STANDARD_ALLOWED_VIEWS.indexOf(viewId) >= 0;
}

function renderStandardDashboard() {
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
                        <span class="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded font-bold">08:30</span>
                        <span class="demo-pill">Standard</span>
                    </div>
                    <p class="text-sm text-gray-400">마진율 <strong class="text-white">${m.marginGlobal}%</strong> · 위험 재고 <strong class="text-danger">${m.atRiskInventory}건</strong> · 미처리 <strong class="text-warning">${fmtCount(m.pendingShipments)}건</strong></p>
                </div>
            </div>
            <button onclick="navigateTo('view-briefing')" class="shrink-0 text-sm font-semibold text-primary border border-primary/30 px-4 py-2 rounded-lg hover:border-primary transition-colors">브리핑 보기 →</button>
        </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="glass rounded-xl kpi-card kpi-glow kpi-drill" onclick="drillDownKpi('revenue')" title="클릭하여 상세">
            <p class="kpi-label">오늘 통합 매출</p>
            <p class="kpi-value text-white">${m.dailyRevenueFormatted}</p>
            <div class="kpi-footer"><span class="text-success font-bold">▲ ${m.dailyRevenueChange}</span><span class="text-gray-500">${App.globalDateRange.label}</span></div>
        </div>
        <div class="glass rounded-xl kpi-card kpi-glow kpi-drill" onclick="drillDownKpi('margin')" title="클릭하여 상세">
            <p class="kpi-label">통합 마진율</p>
            <p class="kpi-value text-white">${m.marginGlobal}%</p>
            <div class="kpi-footer"><span class="${m.marginUp ? 'text-success' : 'text-warning'} font-bold">${m.marginUp ? '▲' : '●'} ${m.marginDelta}%p</span><span class="text-gray-500">목표 ${m.targetMargin}%</span></div>
        </div>
        <div class="glass rounded-xl kpi-card kpi-glow-danger kpi-drill border-l-4 border-l-warning" onclick="drillDownKpi('actions')" title="클릭하여 상세">
            <p class="kpi-label">미처리 주문</p>
            <p class="kpi-value text-white">${m.pendingShipments}건</p>
            <div class="kpi-footer"><span class="text-warning font-bold">발주대기 ${App.orders.filter(function(o){return o.status==='pending';}).length}건</span><span class="text-gray-500">클릭→주문</span></div>
        </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
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
        <div class="glass rounded-xl p-4">
            <div class="chart-card-header mb-2">
                <h2 class="font-bold text-sm">위험 재고</h2>
                <span class="chart-unit-badge text-danger border-danger/30 bg-danger/10">${m.atRiskInventory}건</span>
            </div>
            <div class="space-y-2">
                ${atRisk.length ? atRisk.map(function(i) {
                    return '<div class="p-3 rounded-lg bg-surface border border-border cursor-pointer hover:border-danger/30" onclick="navigateTo(\'view-inventory\')">' +
                        '<p class="text-sm font-semibold truncate">' + i.name + '</p>' +
                        '<p class="text-xs text-gray-500 mt-1">잔여 <strong class="text-danger">' + i.total + '</strong> / 안전 ' + i.safety + '</p></div>';
                }).join('') : '<p class="text-sm text-gray-500 text-center py-4">위험 재고 없음</p>'}
            </div>
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
            <button onclick="navigateTo('view-api')" class="mt-3 text-xs text-primary font-semibold hover:underline">API 상세 →</button>
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
            <p class="text-[10px] text-gray-600 mt-3 text-center">Standard · 일 1회 배치 동기화 · 핵심 KPI만 제공</p>
        </div>
    </div>
</div>`;
}

function initDashboardTier() {
    App.tier = resolveDashboardTier();
    App.isStandard = App.tier === 'standard';
    App.standardAllowedViews = STANDARD_ALLOWED_VIEWS;
    document.body.classList.add('dashboard-tier-' + App.tier);

    var planLabel = document.getElementById('plan-badge-label');
    var planDesc = document.getElementById('plan-badge-desc');
    var planSub = document.getElementById('plan-badge-sub');
    var demoBadge = document.getElementById('demo-mode-badge');
    var headerSub = document.getElementById('header-subtitle');

    if (App.isStandard) {
        document.title = '(주)SAMPLE — Standard 커맨드 센터';
        if (planLabel) planLabel.textContent = 'Standard Plan';
        if (planDesc) planDesc.textContent = '핵심 KPI · 주문 · 재고 · 브리핑';
        if (planSub) planSub.textContent = '일 1회 배치 동기화 · 경량 파이프라인';
        if (demoBadge) demoBadge.innerHTML = '<span class="status-dot live"></span><span>Standard 데모</span>';
        if (headerSub) headerSub.innerHTML = '<span class="demo-pill">Standard 목업</span>보급형 데모 · 일 1회 동기화 · <span id="last-sync">--:--:--</span>';

        App.notifications = App.notifications.filter(function(n) {
            return STANDARD_NOTIFICATION_ACTIONS[n.action];
        });
        App.unreadNotifications = Math.min(App.unreadNotifications, App.notifications.length);
        App.commands = App.commands.filter(function(c) {
            return !c.target || STANDARD_ALLOWED_VIEWS.indexOf(c.target) >= 0;
        });

        App.mockPipeline = { collected: App.orders.length, pending: App.orders.filter(function(o) { return o.status === 'pending'; }).length, processing: 0, shipped: App.orders.filter(function(o) { return o.status === 'shipped'; }).length };

        var proDash = App.views['view-dashboard'];
        App.views['view-dashboard'] = function() {
            return App.isStandard ? renderStandardDashboard() : proDash();
        };

        if (typeof renderNav === 'function') {
            renderNav();
            if (typeof initNavigation === 'function') initNavigation();
        }
        document.querySelectorAll('.tier-pro-only').forEach(function(el) { el.style.display = 'none'; });
        injectTierDemoSwitcher('standard');
    } else {
        if (planLabel) planLabel.textContent = 'Enterprise Plan';
        if (planDesc) planDesc.textContent = '월 구독 · API 무중단 모니터링';
        if (planSub) planSub.textContent = '다음 결제일: 2026.08.01';
        injectTierDemoSwitcher('pro');
    }
}

function injectTierDemoSwitcher(current) {
    var aside = document.getElementById('mobile-sidebar');
    if (!aside || document.getElementById('tier-demo-switcher')) return;
    var box = document.createElement('div');
    box.id = 'tier-demo-switcher';
    box.className = 'mx-3 mb-3 p-2.5 rounded-lg border border-border/60 bg-surface/40 text-center';
    if (current === 'standard') {
        box.innerHTML = '<p class="text-[10px] text-gray-500 mb-1.5">전체 기능 데모</p>' +
            '<a href="demo-dashboard.html" class="text-[11px] font-semibold text-blue-400 hover:text-blue-300">Enterprise 데모 →</a>';
    } else {
        box.innerHTML = '<p class="text-[10px] text-gray-500 mb-1.5">보급형 데모</p>' +
            '<a href="demo-standard.html" class="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300">Standard 데모 →</a>';
    }
    var footer = aside.querySelector('.p-4.border-t');
    if (footer) aside.insertBefore(box, footer);
}

function drillDownKpiStandard(type) {
    if (!App.isStandard) return false;
    App.pendingDrillDown = { type: type };
    if (type === 'revenue' || type === 'margin') {
        navigateTo('view-briefing');
    } else if (type === 'actions') {
        App.pendingDrillDown.ordersFilter = '발주대기';
        navigateTo('view-orders');
    }
    return true;
}
