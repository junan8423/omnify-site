/* (주)SAMPLE — Dashboard Application */
const App = {
    brandName: '(주)SAMPLE',
    charts: [],
    currentView: 'view-dashboard',
    demoMode: true,
    dashboardChartPeriod: 'weekly',
    demoLastRefresh: null,
    totalSkuCount: 128,
    unreadNotifications: 5,
    mockPipeline: { collected: 1248, pending: 184, processing: 67, shipped: 997 },

    notifications: [
        { id: 'n1', type: 'danger', title: '품절 임박 경보', desc: '코스메 히트 세럼 50ml — 잔여 24개 (안전재고 50 미만)', time: '3분 전', action: 'view-inventory' },
        { id: 'n2', type: 'warning', title: 'API 토큰 만료 예정', desc: '에이블리 OAuth 토큰 — 7일 후 만료 (자동 갱신 예약됨)', time: '1시간 전', action: 'view-api' },
        { id: 'n3', type: 'success', title: '아침 브리핑 발송 완료', desc: '카카오톡 데일리 리포트 — 어제 마진율 31.8% 전달', time: '오늘 08:30', action: 'view-briefing' },
        { id: 'n4', type: 'info', title: '발주 대기 알림', desc: '에이블리 송장 전송 대기 — 184건 미처리', time: '10:15', action: 'view-orders' },
        { id: 'n5', type: 'warning', title: '마진율 하락 감지', desc: '쿠팡 채널 마진율 28.1% → 24.3% (광고비 증가)', time: '09:42', action: 'view-profit' },
    ],

    orders: [
        { id: 'ORD-20260710-0847', channel: 'cafe24', product: '비건 히알루론산 토너 외 1건', amount: 34000, status: 'pending', time: '22:28:14' },
        { id: 'ORD-20260710-0846', channel: 'smartstore', product: '시카 리페어 크림 기획세트', amount: 52000, status: 'shipped', time: '22:25:03' },
        { id: 'ORD-20260710-0845', channel: 'coupang', product: '옴므 올인원 로션 200ml', amount: 28000, status: 'shipped', time: '22:22:41' },
        { id: 'ORD-20260710-0844', channel: 'ably', product: '글로우 업 세럼 30ml', amount: 45000, status: 'pending', time: '22:18:55' },
        { id: 'ORD-20260710-0843', channel: 'cafe24', product: '선크림 SPF50+ 60ml', amount: 32000, status: 'processing', time: '22:15:22' },
        { id: 'ORD-20260710-0842', channel: 'smartstore', product: '비타민C 앰플 20ml', amount: 38000, status: 'shipped', time: '22:10:08' },
        { id: 'ORD-20260710-0841', channel: 'coupang', product: '클렌징 폼 150ml 2개입', amount: 24000, status: 'shipped', time: '22:05:33' },
        { id: 'ORD-20260710-0840', channel: 'ably', product: '수분 마스크팩 10매', amount: 19000, status: 'processing', time: '22:01:17' },
    ],

    inventory: [
        { sku: 'SKU-COS-001', name: '코스메 히트 세럼 50ml', total: 24, cafe24: 10, smartstore: 8, coupang: 4, ably: 2, safety: 50, status: 'critical' },
        { sku: 'SKU-COS-002', name: '비건 수분 크림 100ml', total: 850, cafe24: 300, smartstore: 280, coupang: 180, ably: 90, safety: 100, status: 'safe' },
        { sku: 'SKU-COS-003', name: '시카 리페어 크림 50ml', total: 42, cafe24: 15, smartstore: 12, coupang: 10, ably: 5, safety: 60, status: 'warning' },
        { sku: 'SKU-COS-004', name: '글로우 업 세럼 30ml', total: 320, cafe24: 100, smartstore: 90, coupang: 80, ably: 50, safety: 80, status: 'safe' },
        { sku: 'SKU-COS-005', name: '선크림 SPF50+ 60ml', total: 156, cafe24: 50, smartstore: 45, coupang: 40, ably: 21, safety: 70, status: 'safe' },
    ],

    apiChannels: [
        { name: 'Cafe24 Enterprise', icon: '☁️', status: 'live', tokenExpiry: '45일 후', lastSync: '1분 전', orders: 428 },
        { name: '네이버 스마트스토어', icon: '🛒', status: 'live', tokenExpiry: '22일 후', lastSync: '2분 전', orders: 312 },
        { name: '쿠팡 Wing', icon: '📦', status: 'live', tokenExpiry: '18일 후', lastSync: '3분 전', orders: 287 },
        { name: '에이블리', icon: '👗', status: 'warn', tokenExpiry: '7일 후', lastSync: '5분 전', orders: 156 },
    ],

    workflows: [
        { name: 'Morning Order Sync', desc: '매일 09:00 — 전 채널 주문 수집', status: 'active', runs: 847, lastRun: '오늘 09:00', success: 99.8 },
        { name: 'Daily Kakao Briefing', desc: '매일 08:30 — 마진율·재고 경보 발송', status: 'active', runs: 847, lastRun: '오늘 08:30', success: 100 },
        { name: 'Low Inventory Alert', desc: '재고 안전선 미달 시 즉시 알림', status: 'active', runs: 2341, lastRun: '3분 전', success: 100 },
        { name: 'API Token Auto-Renew', desc: '토큰 만료 14일 전 자동 갱신', status: 'active', runs: 48, lastRun: '어제 03:00', success: 100 },
        { name: 'Invoice Auto-Send', desc: '에이블리·지그재그 송장 자동 전송', status: 'active', runs: 1203, lastRun: '10분 전', success: 97.2 },
        { name: 'Monthly Tax Report', desc: '매월 1일 세금계산서 리포트 생성', status: 'paused', runs: 12, lastRun: '2026.06.01', success: 100 },
    ],

    teamMembers: [
        { id: 'kim', name: '김지현', role: '대표', avatar: '김', color: 'from-primary to-accent' },
        { id: 'park', name: '박서연', role: '운영팀', avatar: '박', color: 'from-emerald-500 to-teal-500' },
        { id: 'lee', name: '이준호', role: '마케팅', avatar: '이', color: 'from-violet-500 to-purple-500' },
        { id: 'choi', name: '최민지', role: 'CS팀', avatar: '최', color: 'from-orange-500 to-amber-500' },
    ],

    activityLogs: [
        { id: 1, userId: 'kim', action: '로그인', category: 'auth', type: 'success', detail: '대시보드 로그인 성공', meta: 'IP 211.234.**.45 · Chrome', time: '23:15:22', ago: '5분 전', date: '2026-07-10' },
        { id: 2, userId: 'park', action: '발주 처리', category: 'orders', type: 'info', detail: '에이블리 채널 발주 12건 일괄 승인', meta: 'ORD-BATCH-0710-12', time: '23:08:14', ago: '12분 전', date: '2026-07-10' },
        { id: 3, userId: 'lee', action: 'CRM 캠페인', category: 'crm', type: 'info', detail: '여름 시즌 오프 알림톡 캠페인 수정', meta: '타겟 8,420명 · 예약 발송', time: '22:54:03', ago: '26분 전', date: '2026-07-10' },
        { id: 4, userId: 'choi', action: '재고 조정', category: 'inventory', type: 'warning', detail: '코스메 히트 세럼 안전재고 50→60 상향', meta: 'SKU-COS-001', time: '22:41:55', ago: '39분 전', date: '2026-07-10' },
        { id: 5, userId: 'kim', action: '리포트 다운로드', category: 'report', type: 'info', detail: '7월 1주차 옴니채널 매출 PDF 생성', meta: '파일 2.4MB', time: '22:30:00', ago: '51분 전', date: '2026-07-10' },
        { id: 6, userId: 'park', action: '수동 동기화', category: 'sync', type: 'success', detail: '전 채널 주문 수동 동기화 실행', meta: '1,248건 수집 완료', time: '21:15:33', ago: '2시간 전', date: '2026-07-10' },
        { id: 7, userId: 'lee', action: '광고 예산 변경', category: 'marketing', type: 'warning', detail: 'Meta Ads 일 예산 ₩50만 → ₩65만 증액', meta: 'ROAS 3.2x 기준', time: '18:22:10', ago: '5시간 전', date: '2026-07-10' },
        { id: 8, userId: 'choi', action: '고객 응대', category: 'cs', type: 'info', detail: '스마트스토어 문의 3건 처리 완료', meta: '평균 응답 4분', time: '17:05:44', ago: '6시간 전', date: '2026-07-10' },
        { id: 9, userId: 'kim', action: 'API 설정', category: 'system', type: 'danger', detail: '에이블리 OAuth 토큰 수동 갱신 시도', meta: '자동 갱신 워크플로우 예약', time: '15:30:00', ago: '8시간 전', date: '2026-07-10' },
        { id: 10, userId: 'park', action: '로그인', category: 'auth', type: 'success', detail: '대시보드 로그인 성공', meta: 'IP 175.223.**.12 · Safari', time: '09:02:18', ago: '14시간 전', date: '2026-07-10' },
        { id: 11, userId: 'lee', action: '로그인', category: 'auth', type: 'success', detail: '대시보드 로그인 성공', meta: 'IP 121.132.**.88 · Chrome', time: '08:45:00', ago: '14시간 전', date: '2026-07-10' },
        { id: 12, userId: 'kim', action: '브리핑 설정', category: 'system', type: 'info', detail: '데일리 카카오 브리핑 항목 2개 추가', meta: 'AI 예상 매출 · ROAS 알림', time: '07-09 16:20', ago: '어제', date: '2026-07-09' },
    ],

    activityCategories: {
        auth: { label: '인증', icon: '🔐' },
        orders: { label: '주문', icon: '📋' },
        inventory: { label: '재고', icon: '📦' },
        crm: { label: 'CRM', icon: '🎯' },
        marketing: { label: '마케팅', icon: '📈' },
        sync: { label: '동기화', icon: '🔄' },
        report: { label: '리포트', icon: '📄' },
        cs: { label: 'CS', icon: '💬' },
        system: { label: '시스템', icon: '⚙️' },
    },

    dataHubChannels: [
        { id: 'all', name: '전체', weight: 1 },
        { id: 'cafe24', name: 'Cafe24', weight: 0.32 },
        { id: 'smartstore', name: '스마트스토어', weight: 0.28 },
        { id: 'coupang', name: '쿠팡', weight: 0.25 },
        { id: 'ably', name: '에이블리', weight: 0.15 },
    ],

    dataHubMeta: {
        totalRows: 1247832,
        lastIngest: '2026-07-10 23:08',
        storage: 'Firebase · omni_raw_v2',
        retention: '2022.01 ~ 현재',
    },

    commands: [
        { label: '홈 — 통합 대시보드', target: 'view-dashboard', icon: '🏠' },
        { label: '누적 데이터 DB', target: 'view-datahub', icon: '🗄️' },
        { label: '데일리 브리핑', target: 'view-briefing', icon: '💬' },
        { label: '주문 · 발주', target: 'view-orders', icon: '📋' },
        { label: '통합 재고', target: 'view-inventory', icon: '📦' },
        { label: '프로모션 · CRM', target: 'view-crm', icon: '🎯' },
        { label: 'AI 수익성 분석', target: 'view-profit', icon: '📈' },
        { label: 'API 연동 상태', target: 'view-api', icon: '🔗' },
        { label: '워크플로우', target: 'view-workflow', icon: '⚡' },
        { label: '활동 이력', target: 'view-activity', icon: '🛡️' },
        { label: '설정', target: 'view-settings', icon: '⚙️' },
        { label: '자료실', target: 'view-archive', icon: '📁' },
        { label: '커뮤니케이션', target: 'view-comms', icon: '💬' },
        { label: 'Cafe24 어드민', action: () => openAdminLink('Cafe24 어드민', 'https://eclogin.cafe24.com/Shop/'), icon: '☁️' },
        { label: '스마트스토어 센터', action: () => openAdminLink('스마트스토어 센터', 'https://sell.smartstore.naver.com/'), icon: '🛒' },
        { label: '쿠팡 Wing', action: () => openAdminLink('쿠팡 Wing', 'https://wing.coupang.com/'), icon: '📦' },
        { label: '리포트 다운로드', action: () => showToast('PDF 리포트 생성 중...', 'info'), icon: '📄' },
        { label: '수동 데이터 동기화', action: () => syncOrdersDemo(), icon: '🔄' },
    ],

    navIcons: {
        home: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>',
        briefing: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>',
        orders: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>',
        inventory: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>',
        crm: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>',
        profit: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>',
        api: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>',
        workflow: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>',
    },

    navGroups: [
        {
            label: null,
            items: [
                { target: 'view-dashboard', title: '통합 대시보드', subtitle: '홈', group: null, icon: 'home', isHome: true },
            ]
        },
        {
            label: '매일 보는 리포트',
            icon: '📊',
            items: [
                { target: 'view-datahub', title: '누적 데이터 DB', group: '매일 보는 리포트', icon: 'briefing', badge: { text: 'DB', class: 'bg-primary/20 text-blue-400' } },
                { target: 'view-briefing', title: '데일리 브리핑', group: '매일 보는 리포트', icon: 'briefing', badge: { text: 'NEW', class: 'bg-warning/20 text-warning' } },
            ]
        },
        {
            label: '일상 운영',
            icon: '📦',
            items: [
                { target: 'view-orders', title: '주문 · 발주', group: '일상 운영', icon: 'orders', badge: { text: '3', class: 'bg-warning/20 text-warning w-5 h-5 rounded-full' } },
                { target: 'view-inventory', title: '통합 재고', subtitle: 'WMS', group: '일상 운영', icon: 'inventory', badge: { text: '2', class: 'bg-danger/20 text-danger w-5 h-5 rounded-full' } },
                { target: 'view-comms', title: '커뮤니케이션', group: '일상 운영', icon: 'briefing', badge: { text: '3', class: 'bg-accent/20 text-purple-300 w-5 h-5 rounded-full' } },
            ]
        },
        {
            label: '성장 · 마케팅',
            icon: '📈',
            items: [
                { target: 'view-crm', title: '프로모션 · CRM', group: '성장 · 마케팅', icon: 'crm' },
                { target: 'view-profit', title: 'AI 수익성 분석', group: '성장 · 마케팅', icon: 'profit' },
            ]
        },
        {
            label: '인프라 · 자동화',
            icon: '⚙️',
            items: [
                { target: 'view-api', title: 'API 연동 상태', group: '인프라 · 자동화', icon: 'api' },
                { target: 'view-workflow', title: '워크플로우', subtitle: 'n8n', group: '인프라 · 자동화', icon: 'workflow' },
            ]
        },
        {
            label: '관리',
            icon: '🛡️',
            items: [
                { target: 'view-activity', title: '활동 이력', group: '관리', icon: 'workflow', badge: { text: '7', class: 'bg-primary/20 text-blue-400 w-5 h-5 rounded-full' } },
                { target: 'view-settings', title: '설정', group: '관리', icon: 'workflow' },
            ]
        },
    ],

    channelBadge(ch) {
        const map = { cafe24: 'channel-cafe24', smartstore: 'channel-smartstore', coupang: 'channel-coupang', ably: 'channel-ably' };
        const names = { cafe24: 'Cafe24', smartstore: '스마트스토어', coupang: '쿠팡', ably: '에이블리' };
        return `<span class="badge ${map[ch]}">${names[ch]}</span>`;
    },

    statusBadge(status) {
        const map = {
            pending: ['bg-warning/20 text-warning', '발주대기'],
            processing: ['bg-primary/20 text-blue-400', '처리중'],
            shipped: ['bg-success/20 text-success', '출고완료'],
            critical: ['bg-danger/20 text-danger', '품절 임박'],
            warning: ['bg-warning/20 text-warning', '주의'],
            safe: ['bg-success/20 text-success', '안전'],
        };
        const [cls, label] = map[status] || ['bg-gray-700 text-gray-400', status];
        return `<span class="badge ${cls}">${label}</span>`;
    },

    formatWon(n) {
        return '₩ ' + n.toLocaleString('ko-KR');
    },

    views: {}
};

/* ── Demo mock metrics (single source of truth) ── */
function fmtCount(n) { return Number(n).toLocaleString('ko-KR'); }

function getMockMetrics() {
    var s = getSettings();
    var p = App.mockPipeline;
    var pendingTable = App.orders.filter(function(o) { return o.status === 'pending'; }).length;
    var atRisk = App.inventory.filter(function(i) { return i.status !== 'safe'; }).length;
    var scale = s.kpi.currentMonthlyRevenue / 637500000;
    var rangeMult = getDateRangeMultiplier();
    var dailyRevenue = Math.round(28450000 * scale * rangeMult);
    var marginGlobal = s.margins.global;
    var kpiPct = Math.min(100, Math.round((s.kpi.currentMonthlyRevenue / s.kpi.monthlyRevenueTarget) * 100));
    var activeAdDaily = s.adMedia.filter(function(a) { return a.active; }).reduce(function(sum, a) { return sum + a.dailyBudget; }, 0);
    var netProfit = Math.round(s.kpi.currentMonthlyRevenue * marginGlobal / 100);
    var commsUnread = (typeof commsData !== 'undefined' && commsData) ? commsData.threads.filter(function(t) { return t.unread && commsData.readIds.indexOf(t.id) < 0; }).length : 0;
    var pendingActions = p.pending + atRisk;
    var urgentActions = atRisk + (commsUnread > 0 ? 1 : 0);
    var targetLabel = s.kpi.monthlyRevenueTarget >= 100000000
        ? '₩ ' + (s.kpi.monthlyRevenueTarget / 100000000).toFixed(1) + '억'
        : App.formatWon(s.kpi.monthlyRevenueTarget);
    var netProfitLabel = netProfit >= 100000000
        ? '₩ ' + (netProfit / 100000000).toFixed(2) + '억'
        : App.formatWon(netProfit);
    var aiSavings = Math.round(activeAdDaily * 0.15 * 30);
    var avgRoas = +(s.kpi.targetRoas - 0.08).toFixed(2);
    var marginDelta = (marginGlobal - s.kpi.targetMargin).toFixed(1);
    var coupangDrop = (s.margins.coupang - 28.5).toFixed(1);

    return {
        dailyRevenue: dailyRevenue,
        dailyRevenueFormatted: App.formatWon(dailyRevenue),
        dailyRevenueChange: '+14.2%',
        marginGlobal: marginGlobal,
        marginDelta: marginDelta,
        marginUp: marginGlobal >= s.kpi.targetMargin,
        targetMargin: s.kpi.targetMargin,
        monthlyTargetFormatted: targetLabel,
        kpiPct: kpiPct,
        pendingActions: pendingActions,
        urgentActions: urgentActions,
        atRiskInventory: atRisk,
        pendingShipments: p.pending,
        totalSku: App.totalSkuCount,
        pipeline: p,
        ordersSampleCount: App.orders.length,
        pendingTable: pendingTable,
        monthlyAdSpend: s.adBudget.monthlyTotal,
        activeAdDaily: activeAdDaily,
        avgRoas: avgRoas,
        netProfit: netProfit,
        netProfitFormatted: netProfitLabel,
        aiSavings: aiSavings,
        aiSavingsFormatted: App.formatWon(aiSavings),
        coupangMargin: s.margins.coupang,
        coupangDrop: coupangDrop,
        channelMargins: [s.margins.cafe24, s.margins.smartstore, s.margins.coupang, s.margins.ably],
    };
}

function getDashboardChartData(period) {
    var s = getSettings();
    var scale = s.kpi.currentMonthlyRevenue / 637500000 * getDateRangeMultiplier();
    function sc(arr) { return arr.map(function(v) { return Math.round(v * scale); }); }
    if (period === 'monthly') {
        return {
            labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월'],
            cafe24: sc([820, 910, 880, 950, 1020, 980, 1100]),
            smartstore: sc([650, 720, 690, 780, 840, 810, 900]),
            coupang: sc([480, 520, 500, 580, 620, 590, 680]),
            roas: [280, 300, 290, 310, 330, 320, 340],
        };
    }
    return {
        labels: ['월', '화', '수', '목', '금', '토', '일'],
        cafe24: sc([320, 380, 350, 480, 420, 550, 600]),
        smartstore: sc([250, 290, 270, 390, 340, 480, 520]),
        coupang: sc([180, 210, 195, 280, 250, 340, 380]),
        roas: [210, 240, 230, 310, 280, 380, 410],
    };
}

function getProfitChartData() {
    var s = getSettings();
    var active = s.adMedia.filter(function(a) { return a.active; });
    return {
        labels: active.map(function(a) { return a.name.replace(' Ads', '').replace(' 광고', ''); }),
        adSpend: active.map(function(a) { return Math.round(a.dailyBudget * 30 / 10000); }),
        netProfit: active.map(function(a) { return Math.round(a.dailyBudget * 30 * (a.roasTarget || 3) * 0.35 / 10000); }),
    };
}

function updateDemoHeader() {
    var sub = document.getElementById('header-subtitle');
    if (!sub) return;
    var t = App.demoLastRefresh || new Date();
    var hm = String(t.getHours()).padStart(2, '0') + ':' + String(t.getMinutes()).padStart(2, '0') + ':' + String(t.getSeconds()).padStart(2, '0');
    sub.innerHTML = '<span class="demo-pill">목업 데이터</span>' + App.globalDateRange.label + ' · 데모 시연 · 갱신 <span id="last-sync">' + hm + '</span>';
}

function updateNavBadges() {
    var m = getMockMetrics();
    var ordersBadge = document.getElementById('nav-badge-orders');
    if (ordersBadge) {
        ordersBadge.textContent = m.pendingTable;
        ordersBadge.style.display = m.pendingTable ? 'flex' : 'none';
    }
    var invBadge = document.getElementById('nav-badge-inventory');
    if (invBadge) {
        invBadge.textContent = m.atRiskInventory;
        invBadge.style.display = m.atRiskInventory ? 'flex' : 'none';
    }
    var actBadge = document.getElementById('nav-badge-activity');
    if (actBadge) {
        var todayLogs = App.activityLogs.filter(function(l) { return l.date === '2026-07-10'; }).length;
        actBadge.textContent = todayLogs;
        actBadge.style.display = todayLogs ? 'flex' : 'none';
    }
    if (typeof updateCommsBadges === 'function') updateCommsBadges();
    if (typeof updateArchiveBadges === 'function') updateArchiveBadges();
    var notifBadge = document.getElementById('notif-count-badge');
    if (notifBadge) {
        notifBadge.textContent = App.unreadNotifications;
        notifBadge.style.display = App.unreadNotifications ? 'flex' : 'none';
    }
}

function refreshDemoUI() {
    updateDemoHeader();
    updateNavBadges();
}

function addActivityLog(entry) {
    var now = new Date();
    var log = {
        id: App.activityLogs.length ? Math.max.apply(null, App.activityLogs.map(function(l) { return l.id; })) + 1 : 1,
        userId: entry.userId || App.currentUserId || 'kim',
        action: entry.action || '시스템',
        category: entry.category || 'system',
        type: entry.type || 'info',
        detail: entry.detail || '',
        meta: entry.meta || '데모',
        time: String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0'),
        ago: '방금 전',
        date: '2026-07-10',
    };
    App.activityLogs.unshift(log);
    refreshDemoUI();
}

function setDashboardChartPeriod(period, skipChart) {
    App.dashboardChartPeriod = period;
    var wrap = document.getElementById('chart-period');
    if (wrap) {
        var btns = wrap.querySelectorAll('.tab-btn');
        btns.forEach(function(btn, i) {
            var active = (period === 'weekly' && i === 0) || (period === 'monthly' && i === 1);
            btn.classList.toggle('active', active);
            btn.classList.toggle('text-gray-400', !active);
        });
    }
    var titleEl = document.getElementById('chart-period-title');
    if (titleEl) titleEl.textContent = (period === 'weekly' ? '주간' : '월간') + ' 채널별 매출 & ROAS';
    if (!skipChart) {
        var multi = document.getElementById('multiChannelChart');
        if (multi && App.charts.length) initCharts();
    }
}

function bindChartPeriodTabs() {
    var wrap = document.getElementById('chart-period');
    if (!wrap) return;
    wrap.querySelectorAll('.tab-btn').forEach(function(btn, i) {
        btn.onclick = function() { setDashboardChartPeriod(i === 0 ? 'weekly' : 'monthly'); };
    });
    setDashboardChartPeriod(App.dashboardChartPeriod, true);
}

function processOrder(id) {
    var order = App.orders.find(function(o) { return o.id === id; });
    if (!order) return;
    var p = App.mockPipeline;
    if (order.status === 'pending') {
        order.status = 'processing';
        if (p.pending > 0) p.pending--;
        p.processing++;
        showToast('발주 처리를 시작했습니다. (데모)', 'success');
    } else if (order.status === 'processing') {
        order.status = 'shipped';
        if (p.processing > 0) p.processing--;
        p.shipped++;
        showToast('출고 완료 처리했습니다. (데모)', 'success');
    } else {
        showToast('이미 출고 완료된 주문입니다.', 'info');
        return;
    }
    App.demoLastRefresh = new Date();
    addActivityLog({ userId: 'kim', action: '발주 처리', category: 'orders', type: 'success', detail: order.id + ' — ' + order.product, meta: '데모 상태 변경' });
    refreshDemoUI();
    if (App.currentView === 'view-orders') {
        switchView('view-orders');
    } else if (App.currentView === 'view-dashboard') {
        switchView('view-dashboard');
    }
}

function syncOrdersDemo() {
    App.demoLastRefresh = new Date();
    showToast('데모: 전 채널 동기화 완료 (' + fmtCount(App.mockPipeline.collected) + '건)', 'success');
    addActivityLog({ userId: 'kim', action: '수동 동기화', category: 'sync', type: 'success', detail: '전 채널 주문 수동 동기화 실행', meta: fmtCount(App.mockPipeline.collected) + '건 수집 (데모)' });
    refreshDemoUI();
}

function markAllNotificationsRead() {
    App.notifications.forEach(function(n) {
        if (App.notificationReadIds.indexOf(n.id) < 0) App.notificationReadIds.push(n.id);
    });
    persistNotificationReadState();
    renderNotifications();
    refreshDemoUI();
    showToast('모든 알림을 읽음 처리했습니다.', 'success');
}

function refreshMetricsViews() {
    var views = ['view-dashboard', 'view-orders', 'view-inventory', 'view-profit', 'view-datahub'];
    if (views.indexOf(App.currentView) >= 0) switchView(App.currentView);
    else refreshDemoUI();
}

/* ── P1: Global date range, drill-down, notifications, briefing, user, datahub ── */
var DATE_RANGE_KEY = 'sample_date_range_v1';
var NOTIF_READ_KEY = 'sample_notifications_read_v1';
var CURRENT_USER_KEY = 'sample_current_user_v1';
var BRIEFING_CONFIG_KEY = 'sample_briefing_config_v1';
var DATE_RANGE_PRESETS = [
    { id: 'today', label: '오늘', multiplier: 0.14, dataHubPeriod: 'daily' },
    { id: '7d', label: '최근 7일', multiplier: 1, dataHubPeriod: 'daily' },
    { id: '30d', label: '최근 30일', multiplier: 4.2, dataHubPeriod: 'weekly' },
    { id: 'month', label: '이번 달', multiplier: 3.5, dataHubPeriod: 'monthly' },
    { id: 'lastmonth', label: '지난 달', multiplier: 3.2, dataHubPeriod: 'monthly' },
];
App.globalDateRange = { preset: '7d', label: '최근 7일', multiplier: 1, dataHubPeriod: 'daily' };
App.currentUserId = 'kim';
App.notificationReadIds = [];
App.pendingDrillDown = null;
var dataHubSort = { field: 'period', dir: 'desc' };

var BRIEFING_ITEM_DEFS = [
    { id: 'revenue', label: '전일 통합 매출 & 전일 대비', preview: function(m) { return '어제 전 채널 통합 매출: <strong>' + m.dailyRevenueFormatted + '</strong> (전일 대비 ' + m.dailyRevenueChange + ')'; } },
    { id: 'margin', label: '채널별 마진율 요약', preview: function(m) { return '통합 마진율: <strong>' + m.marginGlobal + '%</strong> (목표 ' + m.targetMargin + '%)'; } },
    { id: 'inventory', label: '위험 재고 경보 (안전재고 미달)', preview: function(m) {
        var items = App.inventory.filter(function(i) { return i.status !== 'safe'; });
        if (!items.length) return '✅ 위험 재고 없음';
        return '<p class="text-red-600 font-semibold">⚠️ 위험 재고 ' + items.length + '건</p>' + items.map(function(i) { return '<p>· ' + i.name + ' — 잔여 ' + i.total + '개</p>'; }).join('');
    }},
    { id: 'orders', label: '미처리 발주/송장 건수', preview: function(m) { return '📋 미처리 발주: <strong>' + fmtCount(m.pendingShipments) + '건</strong>'; } },
    { id: 'api', label: 'API 연동 상태 요약', preview: function() { return '🔗 API 상태: 전 채널 정상 (에이블리 토큰 7일 후 갱신)'; } },
    { id: 'forecast', label: 'AI 예상 월말 매출', preview: function(m) { return '📈 AI 예상 월말: <strong>' + m.monthlyTargetFormatted + '</strong> (달성률 ' + m.kpiPct + '%)'; } },
    { id: 'roas', label: '광고 ROAS 하락 채널 알림', preview: function(m) { return '📉 쿠팡 ROAS 주의 · 평균 ROAS <strong>' + m.avgRoas + 'x</strong>'; } },
];
App.briefingConfig = {};

function loadGlobalDateRange() {
    try {
        var raw = localStorage.getItem(DATE_RANGE_KEY);
        if (raw) {
            var saved = JSON.parse(raw);
            var preset = DATE_RANGE_PRESETS.find(function(p) { return p.id === saved.preset; });
            if (preset) App.globalDateRange = { preset: preset.id, label: preset.label, multiplier: preset.multiplier, dataHubPeriod: preset.dataHubPeriod };
        }
    } catch (e) { /* ignore */ }
}

function persistGlobalDateRange() {
    try { localStorage.setItem(DATE_RANGE_KEY, JSON.stringify({ preset: App.globalDateRange.preset })); } catch (e) { /* ignore */ }
}

function getDateRangeMultiplier() {
    return App.globalDateRange.multiplier || 1;
}

function initDateRangePicker() {
    var menu = document.getElementById('date-range-menu');
    var label = document.getElementById('date-range-label');
    if (label) label.textContent = App.globalDateRange.label;
    if (!menu) return;
    menu.innerHTML = DATE_RANGE_PRESETS.map(function(p) {
        return '<button type="button" class="' + (App.globalDateRange.preset === p.id ? 'active' : '') + '" onclick="setGlobalDateRange(\'' + p.id + '\')">' + p.label + '</button>';
    }).join('');
}

function toggleDateRangeMenu(e) {
    if (e) e.stopPropagation();
    var menu = document.getElementById('date-range-menu');
    if (menu) menu.classList.toggle('open');
}

function setGlobalDateRange(presetId) {
    var preset = DATE_RANGE_PRESETS.find(function(p) { return p.id === presetId; });
    if (!preset) return;
    App.globalDateRange = { preset: preset.id, label: preset.label, multiplier: preset.multiplier, dataHubPeriod: preset.dataHubPeriod };
    persistGlobalDateRange();
    initDateRangePicker();
    var menu = document.getElementById('date-range-menu');
    if (menu) menu.classList.remove('open');
    dataHubFilter.period = preset.dataHubPeriod;
    App.demoLastRefresh = new Date();
    refreshMetricsViews();
    showToast('기간 필터: ' + preset.label + ' (데모)', 'info');
}

function loadNotificationReadState() {
    try {
        var raw = localStorage.getItem(NOTIF_READ_KEY);
        App.notificationReadIds = raw ? JSON.parse(raw) : [];
    } catch (e) { App.notificationReadIds = []; }
    syncUnreadNotificationCount();
}

function persistNotificationReadState() {
    try { localStorage.setItem(NOTIF_READ_KEY, JSON.stringify(App.notificationReadIds)); } catch (e) { /* ignore */ }
    syncUnreadNotificationCount();
}

function syncUnreadNotificationCount() {
    App.unreadNotifications = App.notifications.filter(function(n) { return App.notificationReadIds.indexOf(n.id) < 0; }).length;
}

function isNotificationRead(id) {
    return App.notificationReadIds.indexOf(id) >= 0;
}

function markNotificationRead(id, navigate) {
    if (App.notificationReadIds.indexOf(id) < 0) App.notificationReadIds.push(id);
    persistNotificationReadState();
    renderNotifications();
    refreshDemoUI();
    if (navigate) {
        var n = App.notifications.find(function(x) { return x.id === id; });
        if (n && n.action) {
            document.getElementById('notif-panel').classList.add('hidden');
            navigateTo(n.action);
        }
    }
}

function loadCurrentUser() {
    try {
        var id = localStorage.getItem(CURRENT_USER_KEY);
        if (id && App.teamMembers.find(function(m) { return m.id === id; })) App.currentUserId = id;
    } catch (e) { /* ignore */ }
}

function getCurrentUser() {
    return App.teamMembers.find(function(m) { return m.id === App.currentUserId; }) || App.teamMembers[0];
}

function setCurrentUser(userId) {
    if (!App.teamMembers.find(function(m) { return m.id === userId; })) return;
    App.currentUserId = userId;
    try { localStorage.setItem(CURRENT_USER_KEY, userId); } catch (e) { /* ignore */ }
    updateCurrentUserUI();
    var menu = document.getElementById('user-switch-menu');
    if (menu) menu.classList.remove('open');
    showToast(getCurrentUser().name + '(으)로 전환했습니다. (데모)', 'success');
}

function updateCurrentUserUI() {
    var u = getCurrentUser();
    var av = document.getElementById('sidebar-user-avatar');
    var nm = document.getElementById('sidebar-user-name');
    var rl = document.getElementById('sidebar-user-role');
    if (av) av.textContent = u.avatar;
    if (nm) nm.textContent = u.name + ' ' + u.role;
    if (rl) rl.textContent = App.brandName + ' · ' + u.role;
    renderUserSwitchMenu();
}

function renderUserSwitchMenu() {
    var menu = document.getElementById('user-switch-menu');
    if (!menu) return;
    menu.innerHTML = App.teamMembers.map(function(m) {
        return '<button type="button" class="user-switch-item ' + (m.id === App.currentUserId ? 'active' : '') + '" onclick="setCurrentUser(\'' + m.id + '\')">' +
            '<span class="w-6 h-6 rounded-full bg-gradient-to-br ' + m.color + ' flex items-center justify-center text-[9px] font-bold text-white">' + m.avatar + '</span>' +
            '<span>' + m.name + ' <span class="text-gray-500">(' + m.role + ')</span></span></button>';
    }).join('');
}

function toggleUserSwitchMenu(e) {
    if (e) e.stopPropagation();
    var menu = document.getElementById('user-switch-menu');
    if (menu) menu.classList.toggle('open');
}

function getBriefingConfigDefaults() {
    var cfg = {};
    BRIEFING_ITEM_DEFS.forEach(function(item) {
        cfg[item.id] = item.id !== 'forecast';
    });
    return cfg;
}

function loadBriefingConfig() {
    try {
        var raw = localStorage.getItem(BRIEFING_CONFIG_KEY);
        App.briefingConfig = raw ? Object.assign(getBriefingConfigDefaults(), JSON.parse(raw)) : getBriefingConfigDefaults();
    } catch (e) { App.briefingConfig = getBriefingConfigDefaults(); }
}

function persistBriefingConfig() {
    try { localStorage.setItem(BRIEFING_CONFIG_KEY, JSON.stringify(App.briefingConfig)); } catch (e) { /* ignore */ }
}

function toggleBriefingItem(id) {
    App.briefingConfig[id] = !App.briefingConfig[id];
    persistBriefingConfig();
    renderBriefingConfigPanel();
    renderBriefingPreview();
}

function drillDownKpi(type) {
    App.pendingDrillDown = { type: type };
    if (type === 'revenue') {
        dataHubFilter.period = App.globalDateRange.dataHubPeriod || 'daily';
        dataHubFilter.channel = 'all';
        openView('view-datahub', '누적 데이터 DB', '매일 보는 리포트');
    } else if (type === 'margin') {
        navigateTo('view-profit');
    } else if (type === 'target') {
        dataHubFilter.period = 'monthly';
        dataHubFilter.channel = 'all';
        openView('view-datahub', '누적 데이터 DB', '매일 보는 리포트');
    } else if (type === 'actions') {
        App.pendingDrillDown.ordersFilter = '발주대기';
        navigateTo('view-orders');
    }
}

function applyPendingDrillDown() {
    if (!App.pendingDrillDown) return;
    var d = App.pendingDrillDown;
    if (d.ordersFilter && App.currentView === 'view-orders') {
        filterOrders(d.ordersFilter);
        document.querySelectorAll('#view-orders .glass.rounded-xl.overflow-hidden .flex.gap-2 button').forEach(function(btn) {
            var active = btn.textContent === d.ordersFilter;
            btn.classList.toggle('bg-primary', active);
            btn.classList.toggle('text-white', active);
            btn.classList.toggle('bg-surface', !active);
            btn.classList.toggle('text-gray-400', !active);
        });
    }
    App.pendingDrillDown = null;
}

function exportActivityCSV() {
    var data = App.activityLogs.filter(function(log) {
        if (activityFilter.user !== 'all' && log.userId !== activityFilter.user) return false;
        if (activityFilter.cat !== 'all' && log.category !== activityFilter.cat) return false;
        if (activityFilter.search) {
            var q = activityFilter.search.toLowerCase();
            if (log.detail.toLowerCase().indexOf(q) < 0 && log.action.toLowerCase().indexOf(q) < 0) return false;
        }
        return true;
    });
    var header = '일시,사용자,역할,카테고리,액션,상세,메타,유형\n';
    var body = data.map(function(log) {
        var m = getMember(log.userId);
        var cat = App.activityCategories[log.category] ? App.activityCategories[log.category].label : log.category;
        return [log.date + ' ' + log.time, m.name, m.role, cat, log.action, '"' + log.detail.replace(/"/g, '""') + '"', '"' + log.meta.replace(/"/g, '""') + '"', log.type].join(',');
    }).join('\n');
    var blob = new Blob(['\uFEFF' + header + body], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'activity_log_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    showToast('활동 이력 CSV ' + data.length + '건을 다운로드했습니다.', 'success');
    addActivityLog({ userId: App.currentUserId, action: 'CSV 내보내기', category: 'report', type: 'info', detail: '활동 이력 ' + data.length + '건 CSV 다운로드', meta: '데모' });
}

function renderBriefingConfigPanel() {
    var el = document.getElementById('briefing-config-list');
    if (!el) return;
    el.innerHTML = BRIEFING_ITEM_DEFS.map(function(item) {
        var on = App.briefingConfig[item.id];
        return '<div class="briefing-toggle flex items-center justify-between p-3 rounded-lg bg-surface border border-border hover:border-primary/30 transition-colors" onclick="toggleBriefingItem(\'' + item.id + '\')">' +
            '<span class="text-sm">' + item.label + '</span>' +
            '<div class="w-10 h-5 rounded-full ' + (on ? 'bg-primary' : 'bg-gray-700') + ' relative transition-colors pointer-events-none">' +
            '<div class="w-4 h-4 bg-white rounded-full absolute top-0.5 ' + (on ? 'right-0.5' : 'left-0.5') + ' transition-all shadow"></div></div></div>';
    }).join('');
}

function renderBriefingPreview() {
    var el = document.getElementById('briefing-preview-body');
    if (!el) return;
    var m = getMockMetrics();
    var u = getCurrentUser();
    var parts = ['<p>안녕하세요, <strong>' + u.name + ' ' + u.role + '님</strong>!</p>'];
    BRIEFING_ITEM_DEFS.forEach(function(item) {
        if (!App.briefingConfig[item.id]) return;
        parts.push('<p>' + item.preview(m) + '</p>');
    });
    if (parts.length <= 1) parts.push('<p class="text-gray-400">브리핑 항목을 1개 이상 선택하세요.</p>');
    el.innerHTML = parts.join('');
}

function initBriefingView() {
    renderBriefingConfigPanel();
    renderBriefingPreview();
}

function sortDataHub(field) {
    if (dataHubSort.field === field) dataHubSort.dir = dataHubSort.dir === 'asc' ? 'desc' : 'asc';
    else { dataHubSort.field = field; dataHubSort.dir = 'desc'; }
    renderDataHubTable(dataHubRowsCache);
    document.querySelectorAll('.db-sort-btn').forEach(function(btn) {
        var active = btn.dataset.sort === dataHubSort.field;
        btn.classList.toggle('active', active);
        btn.textContent = btn.dataset.label + (active ? (dataHubSort.dir === 'asc' ? ' ↑' : ' ↓') : '');
    });
}

var mentionState = { open: false, query: '', start: 0 };

function handleCommsBodyInput(textarea) {
    var val = textarea.value;
    var pos = textarea.selectionStart;
    var before = val.slice(0, pos);
    var match = before.match(/@([\w가-힣]{0,12})$/);
    var dropdown = document.getElementById('mention-dropdown');
    if (!match) { if (dropdown) dropdown.classList.remove('open'); mentionState.open = false; return; }
    mentionState = { open: true, query: match[1].toLowerCase(), start: pos - match[0].length };
    var list = App.teamMembers.filter(function(m) {
        return m.name.toLowerCase().indexOf(mentionState.query) >= 0 || m.id.indexOf(mentionState.query) >= 0;
    });
    if (!dropdown) return;
    if (!list.length) { dropdown.classList.remove('open'); return; }
    dropdown.classList.add('open');
    dropdown.innerHTML = list.map(function(m) {
        return '<div class="mention-item" onmousedown="insertMention(\'' + m.id + '\')">' +
            '<span class="w-6 h-6 rounded-full bg-gradient-to-br ' + m.color + ' flex items-center justify-center text-[9px] font-bold text-white">' + m.avatar + '</span>' +
            '<span>' + m.name + ' <span class="text-gray-500">@' + m.id + '</span></span></div>';
    }).join('');
}

function handleCommsBodyKeydown(e) {
    if (e.key === 'Escape') {
        var dropdown = document.getElementById('mention-dropdown');
        if (dropdown) dropdown.classList.remove('open');
    }
}

function insertMention(userId) {
    var m = App.teamMembers.find(function(x) { return x.id === userId; });
    var textarea = document.getElementById('comms-form-body');
    if (!m || !textarea) return;
    var val = textarea.value;
    var insert = '@' + m.name + ' ';
    textarea.value = val.slice(0, mentionState.start) + insert + val.slice(textarea.selectionStart);
    textarea.focus();
    var dropdown = document.getElementById('mention-dropdown');
    if (dropdown) dropdown.classList.remove('open');
    mentionState.open = false;
}

/* ── CRM Campaign Builder ── */
var CRM_STORAGE_KEY = 'sample_crm_campaigns_v1';
var crmData = null;
var crmActiveTab = 'builder';
var crmActiveCampaignId = null;
var crmAudienceFilter = { purchase: 0, amount: 0, category: 0 };
var crmWizardState = { step: 1, editId: null };
var PROMO_STORAGE_KEY = 'sample_promo_plans_v1';
var promoPlans = null;
var promoCalendarMode = 'month';
var promoCalendarCursor = new Date(2026, 6, 10);
var promoActivePlanId = null;
var promoModalState = { editId: null, defaultDate: null, fromCalendar: false };

var CRM_AUDIENCE_OPTIONS = {
    purchase: ['최근 3개월 미구매', '최근 1개월 구매', '6개월 이상 미구매'],
    amount: ['금액 제한 없음', '100,000원 이상', '300,000원 이상', 'VIP 500,000원 이상'],
    category: ['전체 카테고리', '스킨케어', '메이크업', '선케어'],
};
var CRM_PURCHASE_BASE = [8420, 3180, 5240];
var CRM_AMOUNT_MULT = [1, 0.62, 0.34, 0.11];
var CRM_CATEGORY_MULT = [1, 0.74, 0.48, 0.41];

var CRM_TEMPLATES = [
    { id: 'season', label: '시즌 세일', title: '#{고객명}님 여름 시즌 특별 혜택 🌞', body: '여름 시즌을 맞아 스킨케어 전용 <strong>{discount}% 시크릿 쿠폰</strong>을 발급해 드렸습니다. 7월 12일까지 사용 가능!', cta: '쿠폰 확인하기', discount: 20 },
    { id: 'winback', label: '이탈 복귀', title: '#{고객명}님, 다시 만나요 💙', body: '오랜만이에요! 복귀 고객 전용 <strong>{discount}% 할인 쿠폰</strong>과 무료배송 혜택을 준비했습니다.', cta: '혜택 받기', discount: 15 },
    { id: 'vip', label: 'VIP 전용', title: 'VIP #{고객명}님 프리미엄 혜택 ✨', body: 'VIP 고객님께만 드리는 <strong>신제품 선체험 + {discount}% 추가 할인</strong> 쿠폰입니다.', cta: 'VIP 혜택 보기', discount: 25 },
    { id: 'restock', label: '재입고 알림', title: '#{고객명}님, 찜한 상품 재입고 📦', body: '관심 상품이 재입고되었습니다. <strong>48시간 한정 {discount}% 할인</strong>으로 만나보세요.', cta: '상품 보러가기', discount: 10 },
];

function getCrmCampaignsDefaults() {
    return [
        { id: 'c-demo-1', name: '여름 시즌 오프 알림톡', type: 'alimtalk', status: 'running', templateId: 'season',
          audience: { purchase: 0, amount: 0, category: 1 }, targetCount: 6230,
          message: { title: '#{고객명}님 여름 시즌 특별 혜택 🌞', body: '스킨케어 전용 20% 시크릿 쿠폰', cta: '쿠폰 확인하기', discount: 20 },
          schedule: { mode: 'range', startDate: '2026-07-10', endDate: '2026-07-12' },
          stats: { sent: 8420, opened: 5894, clicked: 1044, converted: 1044, revenue: 42800000 },
          abTest: {
              enabled: true, splitA: 50, splitB: 50, winner: null,
              variantA: { label: 'A · 20% 쿠폰', message: { title: '#{고객명}님 여름 시즌 특별 혜택 🌞', body: '스킨케어 전용 20% 시크릿 쿠폰', cta: '쿠폰 확인하기', discount: 20 }, stats: { sent: 4210, opened: 2947, clicked: 505, converted: 489, revenue: 20100000 } },
              variantB: { label: 'B · 25% 쿠폰', message: { title: '#{고객명}님 VIP 여름 혜택 🔥', body: '한정 25% 추가 할인 쿠폰 발급!', cta: '쿠폰 받기', discount: 25 }, stats: { sent: 4210, opened: 3158, clicked: 539, converted: 555, revenue: 22700000 } },
          },
          createdBy: 'lee', createdAt: '2026-07-08 14:30' },
        { id: 'c-demo-2', name: '이탈 위험 고객 복귀 쿠폰', type: 'alimtalk', status: 'scheduled', templateId: 'winback',
          audience: { purchase: 2, amount: 1, category: 0 }, targetCount: 1240,
          message: { title: '#{고객명}님, 다시 만나요 💙', body: '복귀 고객 15% 할인 + 무료배송', cta: '혜택 받기', discount: 15 },
          schedule: { mode: 'later', startDate: '2026-07-15', endDate: '2026-07-22' },
          stats: { sent: 0, opened: 0, clicked: 0, converted: 0, revenue: 0 },
          abTest: { enabled: false, splitA: 50, splitB: 50, winner: null, variantA: null, variantB: null },
          createdBy: 'lee', createdAt: '2026-07-09 11:00' },
    ];
}

function normalizeCrmCampaign(c) {
    if (!c.abTest) c.abTest = { enabled: false, splitA: 50, splitB: 50, winner: null, variantA: null, variantB: null };
    if (c.abTest.enabled && !c.abTest.variantA) {
        c.abTest.variantA = { label: 'A (대조)', message: Object.assign({}, c.message), stats: Object.assign({}, c.stats) };
        c.abTest.variantB = { label: 'B (테스트)', message: Object.assign({}, c.message), stats: { sent: 0, opened: 0, clicked: 0, converted: 0, revenue: 0 } };
    }
    return c;
}

function loadCrmCampaigns() {
    try {
        var raw = localStorage.getItem(CRM_STORAGE_KEY);
        crmData = raw ? JSON.parse(raw) : getCrmCampaignsDefaults();
        crmData = crmData.map(normalizeCrmCampaign);
    } catch (e) { crmData = getCrmCampaignsDefaults().map(normalizeCrmCampaign); }
}

function persistCrmCampaigns() {
    try { localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(crmData)); } catch (e) { /* ignore */ }
}

function calculateCrmAudience(filter) {
    filter = filter || crmAudienceFilter;
    var base = CRM_PURCHASE_BASE[filter.purchase] || 8420;
    var mult = (CRM_AMOUNT_MULT[filter.amount] || 1) * (CRM_CATEGORY_MULT[filter.category] || 1);
    return Math.max(120, Math.round(base * mult));
}

function getCrmStatusLabel(status) {
    var map = { running: ['실행 중', 'bg-success/20 text-success'], scheduled: ['예약', 'bg-primary/20 text-blue-400'], draft: ['초안', 'bg-gray-700 text-gray-400'], paused: ['일시중지', 'bg-warning/20 text-warning'], completed: ['완료', 'bg-gray-600 text-gray-400'] };
    return map[status] || ['알 수 없음', 'bg-gray-700 text-gray-400'];
}

function getCrmStatsSummary() {
    var running = crmData.filter(function(c) { return c.status === 'running'; }).length;
    var scheduled = crmData.filter(function(c) { return c.status === 'scheduled'; }).length;
    var totalSent = crmData.reduce(function(s, c) { return s + (c.stats.sent || 0); }, 0);
    var totalConv = crmData.reduce(function(s, c) { return s + (c.stats.converted || 0); }, 0);
    var avgRate = totalSent ? ((totalConv / totalSent) * 100).toFixed(1) : '0.0';
    return { running: running, scheduled: scheduled, totalSent: totalSent, avgRate: avgRate };
}

function initCrmView() {
    renderCrmStats();
    switchCrmTab(crmActiveTab, true);
}

function switchCrmTab(tab, skipPersist) {
    crmActiveTab = tab;
    document.querySelectorAll('.crm-tab-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    ['builder', 'calendar', 'kpi'].forEach(function(t) {
        var panel = document.getElementById('crm-panel-' + t);
        if (panel) panel.classList.toggle('hidden', t !== tab);
    });
    if (tab === 'builder') {
        renderCrmAudiencePanel();
        renderCrmLivePreview();
        renderCrmCampaignList();
        renderCrmCampaignDetail(crmActiveCampaignId);
    } else if (tab === 'calendar') {
        renderPromoCalendar();
    } else if (tab === 'kpi') {
        renderPromoKpiPanel();
    }
}

function renderCrmStats() {
    var el = document.getElementById('crm-stats');
    if (!el) return;
    var s = getCrmStatsSummary();
    el.innerHTML = [
        ['활성 캠페인', s.running + '건', '실행 중'],
        ['예약 대기', s.scheduled + '건', '발송 예정'],
        ['누적 발송', fmtCount(s.totalSent) + '건', '전체 캠페인'],
        ['평균 전환율', s.avgRate + '%', '클릭→구매'],
    ].map(function(k) {
        return '<div class="glass rounded-xl p-4"><p class="text-[10px] text-gray-500">' + k[0] + '</p><p class="text-xl font-extrabold">' + k[1] + '</p><p class="text-[10px] text-gray-600">' + k[2] + '</p></div>';
    }).join('');
}

function renderCrmAudiencePanel() {
    var countEl = document.getElementById('crm-audience-count');
    var barEl = document.getElementById('crm-audience-bar');
    var segEl = document.getElementById('crm-audience-segments');
    var count = calculateCrmAudience();
    if (countEl) countEl.textContent = fmtCount(count) + '명';
    if (barEl) barEl.style.width = Math.min(100, Math.round(count / 8420 * 100)) + '%';
    if (segEl) {
        var pct = Math.round(count / 124783 * 100 * 10) / 10;
        segEl.innerHTML = [
            ['전체 CRM DB', '124,783명', '100%'],
            ['현재 필터 매칭', fmtCount(count) + '명', pct + '%'],
            ['SMS 발송 가능', fmtCount(Math.round(count * 0.97)) + '명', '97%'],
            ['알림톡 수신 동의', fmtCount(Math.round(count * 0.89)) + '명', '89%'],
        ].map(function(row) {
            return '<div class="crm-funnel-step"><span class="text-gray-400">' + row[0] + '</span><span><strong class="text-white">' + row[1] + '</strong> <span class="text-gray-600">' + row[2] + '</span></span></div>';
        }).join('');
    }
}

function renderCrmLivePreview(msg) {
    var el = document.getElementById('crm-live-preview');
    if (!el) return;
    var m = msg || (crmActiveCampaignId ? (crmData.find(function(c) { return c.id === crmActiveCampaignId; }) || {}).message : null);
    if (!m && crmData.length) m = crmData[0].message;
    if (!m) {
        var tpl = CRM_TEMPLATES[0];
        m = { title: tpl.title.replace('#{고객명}', '지현'), body: tpl.body.replace('{discount}', tpl.discount), cta: tpl.cta, discount: tpl.discount };
    }
    var title = (m.title || '').replace('#{고객명}', '지현');
    var body = (m.body || '').replace('{discount}', m.discount || 20);
    el.innerHTML = '<div class="bg-[#fae100] rounded-2xl p-3 shadow-xl w-full max-w-[260px] mx-auto">' +
        '<div class="bg-white rounded-xl p-4">' +
        '<p class="text-[10px] text-gray-400 mb-1">' + App.brandName + ' 알림톡</p>' +
        '<p class="text-sm font-bold text-gray-900 mb-2">' + title + '</p>' +
        '<p class="text-xs text-gray-600 leading-relaxed mb-3">' + body + '</p>' +
        '<button class="w-full bg-gray-100 text-gray-800 text-xs font-bold py-2 rounded-lg">' + (m.cta || '확인하기') + '</button>' +
        '</div></div>';
}

function renderCrmCampaignList() {
    var el = document.getElementById('crm-campaign-list');
    if (!el) return;
    el.innerHTML = crmData.map(function(c) {
        var st = getCrmStatusLabel(c.status);
        var selected = crmActiveCampaignId === c.id ? ' selected' : '';
        return '<div class="crm-campaign-card p-3 rounded-lg bg-surface border border-border' + selected + '" onclick="selectCrmCampaign(\'' + c.id + '\')">' +
            '<div class="flex items-start justify-between gap-2 mb-1">' +
            '<span class="text-[10px] font-bold px-2 py-0.5 rounded ' + st[1] + '">' + st[0] + '</span>' +
            (c.abTest && c.abTest.enabled ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">A/B</span>' : '') +
            (c.status === 'running' ? '<span class="text-[9px] text-success pulse-live">● LIVE</span>' : '') +
            '</div>' +
            '<p class="text-sm font-bold">' + c.name + '</p>' +
            '<p class="text-[10px] text-gray-500 mt-0.5">' + c.schedule.startDate + (c.schedule.endDate ? ' ~ ' + c.schedule.endDate : '') + ' · 타겟 ' + fmtCount(c.targetCount) + '명</p>' +
            (c.stats.sent ? '<p class="text-xs text-gray-400 mt-1">발송 ' + fmtCount(c.stats.sent) + ' · 전환 ' + (c.stats.sent ? ((c.stats.converted / c.stats.sent) * 100).toFixed(1) : 0) + '% · ' + App.formatWon(c.stats.revenue) + '</p>' : '<p class="text-xs text-gray-500 mt-1">발송 예정</p>') +
            '</div>';
    }).join('') || '<p class="text-sm text-gray-500 text-center py-6">캠페인이 없습니다. + 새 캠페인으로 시작하세요.</p>';
}

function renderCrmAbTestPanel(c) {
    if (!c.abTest || !c.abTest.enabled || !c.abTest.variantA) return '';
    var ab = c.abTest;
    var variants = [['A', ab.variantA], ['B', ab.variantB]];
    var bestConv = 0;
    variants.forEach(function(v) {
        var rate = v[1].stats.sent ? v[1].stats.converted / v[1].stats.sent : 0;
        if (rate > bestConv) bestConv = rate;
    });
    return '<div class="mt-4 pt-4 border-t border-border">' +
        '<div class="flex items-center justify-between mb-3">' +
        '<h5 class="text-xs font-bold text-purple-300">A/B 테스트 성과</h5>' +
        '<span class="text-[10px] text-gray-500">분배 ' + ab.splitA + '% / ' + ab.splitB + '%</span></div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-3">' +
        variants.map(function(v) {
            var key = v[0], va = v[1];
            var sent = va.stats.sent || 0;
            var openRate = sent ? ((va.stats.opened / sent) * 100).toFixed(1) : '0.0';
            var convRate = sent ? ((va.stats.converted / sent) * 100).toFixed(1) : '0.0';
            var isWinner = ab.winner === key;
            var isLeading = !ab.winner && sent && (va.stats.converted / sent) >= bestConv && bestConv > 0;
            var cls = 'ab-variant-card' + (isWinner ? ' winner' : isLeading ? ' leading' : '');
            return '<div class="' + cls + '">' +
                '<div class="flex items-center justify-between mb-2">' +
                '<span class="text-xs font-bold">' + va.label + '</span>' +
                (isWinner ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-success/20 text-success font-bold">승자</span>' : '') +
                (isLeading ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-blue-300 font-bold">우세</span>' : '') +
                '</div>' +
                '<p class="text-[10px] text-gray-500 mb-2 truncate">' + (va.message.title || '').replace('#{고객명}', '고객') + ' · ' + (va.message.discount || 0) + '%</p>' +
                '<div class="grid grid-cols-2 gap-1.5 text-center">' +
                [['발송', fmtCount(sent)], ['오픈율', openRate + '%'], ['전환율', convRate + '%'], ['매출', va.stats.revenue ? formatDataHubWon(va.stats.revenue) : '—']].map(function(k) {
                    return '<div class="p-1.5 rounded bg-dark/50"><p class="text-[8px] text-gray-500">' + k[0] + '</p><p class="text-[11px] font-bold">' + k[1] + '</p></div>';
                }).join('') + '</div>' +
                (!ab.winner && sent ? '<button onclick="declareAbTestWinner(\'' + c.id + '\',\'' + key + '\')" class="mt-2 w-full text-[10px] py-1.5 rounded border border-border hover:border-success/40 text-gray-400 hover:text-success transition-colors">' + key + '안을 승자로 선정</button>' : '') +
                '</div>';
        }).join('') + '</div></div>';
}

function renderCrmCampaignDetail(id) {
    var el = document.getElementById('crm-campaign-detail');
    if (!el) return;
    var c = crmData.find(function(x) { return x.id === id; });
    if (!c) { el.innerHTML = '<p class="text-xs text-gray-500 text-center py-8">캠페인을 선택하면 상세 성과와 액션이 표시됩니다.</p>'; return; }
    var st = getCrmStatusLabel(c.status);
    var convRate = c.stats.sent ? ((c.stats.converted / c.stats.sent) * 100).toFixed(1) : '—';
    var openRate = c.stats.sent ? ((c.stats.opened / c.stats.sent) * 100).toFixed(1) : '—';
    el.innerHTML = '<div class="flex items-start justify-between gap-3 mb-4">' +
        '<div><span class="text-[10px] font-bold px-2 py-0.5 rounded ' + st[1] + '">' + st[0] + '</span>' +
        (c.abTest && c.abTest.enabled ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 ml-1">A/B 테스트</span>' : '') +
        '<h4 class="font-bold text-sm mt-2">' + c.name + '</h4>' +
        '<p class="text-[10px] text-gray-500">생성: ' + c.createdAt + ' · ' + (getMember(c.createdBy).name || '') +
        (c.duplicatedFrom ? ' · <span class="text-gray-600">복제됨</span>' : '') + '</p></div></div>' +
        '<div class="grid grid-cols-2 gap-2 mb-4">' +
        [['발송', fmtCount(c.stats.sent)], ['오픈율', openRate + '%'], ['전환', convRate + '%'], ['매출', c.stats.revenue ? formatDataHubWon(c.stats.revenue) : '—']].map(function(k) {
            return '<div class="p-2.5 rounded-lg bg-dark/50 text-center"><p class="text-[9px] text-gray-500">' + k[0] + '</p><p class="text-sm font-bold">' + k[1] + '</p></div>';
        }).join('') + '</div>' +
        renderCrmAbTestPanel(c) +
        '<div class="flex flex-wrap gap-2' + (c.abTest && c.abTest.enabled ? ' mt-4' : '') + '">' +
        (c.status === 'running' ? '<button onclick="pauseCrmCampaign(\'' + c.id + '\')" class="text-xs px-3 py-1.5 rounded-lg border border-warning/40 text-warning hover:bg-warning/10">일시 중지</button>' : '') +
        (c.status === 'paused' || c.status === 'scheduled' || c.status === 'draft' ? '<button onclick="launchCrmCampaign(\'' + c.id + '\')" class="text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-blue-600">발송 시작</button>' : '') +
        (c.status === 'scheduled' || c.status === 'draft' ? '<button onclick="editCrmCampaign(\'' + c.id + '\')" class="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/40">수정</button>' : '') +
        '<button onclick="duplicateCrmCampaign(\'' + c.id + '\')" class="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-purple-400/40 text-purple-300">복제</button>' +
        '<button onclick="exportCrmAudience(\'' + c.id + '\')" class="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/40">명단 CSV</button>' +
        '<button onclick="testSendCrmCampaign(\'' + c.id + '\')" class="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/40">테스트 발송</button>' +
        '</div>';
}

function selectCrmCampaign(id) {
    crmActiveCampaignId = id;
    var c = crmData.find(function(x) { return x.id === id; });
    renderCrmCampaignList();
    renderCrmCampaignDetail(id);
    if (c) renderCrmLivePreview(c.message);
}

function onCrmFilterChange(field, value) {
    crmAudienceFilter[field] = parseInt(value, 10);
    renderCrmAudiencePanel();
}

function extractCrmAudience() {
    var count = calculateCrmAudience();
    showToast(fmtCount(count) + '명 타겟 명단을 추출했습니다. (데모)', 'success');
    addActivityLog({ userId: App.currentUserId, action: 'CRM 명단 추출', category: 'crm', type: 'info', detail: '타겟 ' + fmtCount(count) + '명 추출', meta: CRM_AUDIENCE_OPTIONS.purchase[crmAudienceFilter.purchase] });
}

function exportCrmAudience(campaignId) {
    var c = campaignId ? crmData.find(function(x) { return x.id === campaignId; }) : null;
    var count = c ? c.targetCount : calculateCrmAudience();
    var rows = [];
    for (var i = 0; i < Math.min(count, 50); i++) {
        rows.push(['CUST-' + String(10000 + i), '고객' + (i + 1), '010-****-' + String(1000 + i), CRM_AUDIENCE_OPTIONS.category[c ? c.audience.category : crmAudienceFilter.category]].join(','));
    }
    var blob = new Blob(['\uFEFF고객ID,이름,연락처,관심카테고리\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'crm_audience_' + (c ? c.id : 'preview') + '.csv';
    a.click();
    showToast('타겟 명단 CSV (샘플 ' + rows.length + '건) 다운로드', 'success');
}

function openCrmWizard(editId) {
    crmWizardState = {
        step: 1, editId: editId || null,
        name: '', type: 'alimtalk', templateId: 'season',
        audience: { purchase: crmAudienceFilter.purchase, amount: crmAudienceFilter.amount, category: crmAudienceFilter.category },
        title: CRM_TEMPLATES[0].title, body: CRM_TEMPLATES[0].body, cta: CRM_TEMPLATES[0].cta, discount: 20,
        scheduleMode: 'later', startDate: getDefaultCommsDueDate(), endDate: '', launchMode: 'scheduled',
        abTestEnabled: false, splitA: 50,
        variantBTitle: '', variantBBody: '', variantBDiscount: 25, variantBCta: '쿠폰 받기',
    };
    if (editId) {
        var c = crmData.find(function(x) { return x.id === editId; });
        if (c) {
            Object.assign(crmWizardState, {
                name: c.name, type: c.type, templateId: c.templateId || 'season',
                audience: Object.assign({}, c.audience),
                title: c.message.title, body: c.message.body, cta: c.message.cta, discount: c.message.discount,
                scheduleMode: c.schedule.mode, startDate: c.schedule.startDate, endDate: c.schedule.endDate,
                launchMode: c.status === 'running' ? 'now' : 'scheduled',
                abTestEnabled: !!(c.abTest && c.abTest.enabled),
                splitA: c.abTest ? c.abTest.splitA : 50,
            });
            if (c.abTest && c.abTest.variantB) {
                crmWizardState.variantBTitle = c.abTest.variantB.message.title;
                crmWizardState.variantBBody = c.abTest.variantB.message.body;
                crmWizardState.variantBDiscount = c.abTest.variantB.message.discount;
                crmWizardState.variantBCta = c.abTest.variantB.message.cta;
            }
        }
    }
    document.getElementById('crm-modal').classList.add('open');
    renderCrmWizardStep();
}

function closeCrmWizard() {
    document.getElementById('crm-modal').classList.remove('open');
}

function crmWizardBack() {
    if (crmWizardState.step > 1) { crmWizardState.step--; renderCrmWizardStep(); }
}

function crmWizardNext() {
    if (crmWizardState.step === 1 && !crmWizardState.name.trim()) {
        showToast('캠페인 이름을 입력해주세요.', 'warning'); return;
    }
    if (crmWizardState.step < 4) { crmWizardState.step++; renderCrmWizardStep(); }
    else submitCrmCampaign();
}

function renderCrmWizardStep() {
    var step = crmWizardState.step;
    document.querySelectorAll('.crm-wizard-step').forEach(function(el) {
        var n = parseInt(el.dataset.step, 10);
        el.classList.toggle('active', n === step);
        el.classList.toggle('done', n < step);
    });
    document.getElementById('crm-wizard-back').classList.toggle('hidden', step === 1);
    document.getElementById('crm-wizard-next').textContent = step === 4 ? (crmWizardState.editId ? '저장' : '캠페인 생성') : '다음 →';

    var body = document.getElementById('crm-wizard-body');
    if (step === 1) {
        body.innerHTML = '<div class="space-y-4">' +
            '<div><label class="settings-label">캠페인 이름 <span class="text-danger">*</span></label>' +
            '<input id="crm-wiz-name" class="settings-input" maxlength="60" placeholder="예: 7월 VIP 재구매 캠페인" value="' + (crmWizardState.name || '') + '" oninput="crmWizardState.name=this.value"></div>' +
            '<div><label class="settings-label">발송 채널</label><div class="flex gap-2">' +
            [['alimtalk','💬 알림톡'],['sms','📱 SMS'],['email','📧 이메일']].map(function(ch) {
                return '<button type="button" onclick="crmWizardState.type=\'' + ch[0] + '\';renderCrmWizardStep()" class="flex-1 text-xs py-2.5 rounded-lg border ' + (crmWizardState.type === ch[0] ? 'border-primary/50 bg-primary/15 text-blue-300' : 'border-border bg-surface') + '">' + ch[1] + '</button>';
            }).join('') + '</div></div>' +
            '<div><label class="settings-label">캠페인 목표</label><select class="settings-input" onchange="crmWizardState.goal=this.value"><option>매출 증대 (쿠폰)</option><option>재구매 유도</option><option>신제품 홍보</option><option>이탈 고객 복귀</option></select></div></div>';
    } else if (step === 2) {
        body.innerHTML = '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
            '<div class="space-y-3">' +
            Object.keys(CRM_AUDIENCE_OPTIONS).map(function(key, idx) {
                var labels = ['구매 이력', '누적 금액', '관심 카테고리'];
                return '<div><label class="settings-label">' + labels[idx] + '</label><select class="settings-input" onchange="crmWizardState.audience.' + key + '=parseInt(this.value,10);renderCrmWizardAudiencePreview()">' +
                    CRM_AUDIENCE_OPTIONS[key].map(function(opt, i) {
                        return '<option value="' + i + '" ' + (crmWizardState.audience[key] === i ? 'selected' : '') + '>' + opt + '</option>';
                    }).join('') + '</select></div>';
            }).join('') +
            '</div>' +
            '<div class="glass rounded-xl p-4 border border-primary/20">' +
            '<p class="text-xs font-bold text-primary mb-2">예상 타겟</p>' +
            '<p class="text-3xl font-extrabold mb-2" id="crm-wiz-audience-count">' + fmtCount(calculateCrmAudience(crmWizardState.audience)) + '<span class="text-sm font-normal text-gray-500">명</span></p>' +
            '<div class="crm-audience-bar mb-2"><div class="crm-audience-bar-fill" id="crm-wiz-audience-bar" style="width:' + Math.min(100, Math.round(calculateCrmAudience(crmWizardState.audience) / 8420 * 100)) + '%"></div></div>' +
            '<p class="text-[10px] text-gray-500">CRM DB 124,783명 중 매칭 · 알림톡 수신 가능 약 89%</p></div></div>';
    } else if (step === 3) {
        body.innerHTML = '<div class="space-y-4">' +
            '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">' +
            '<div class="space-y-3">' +
            '<div><label class="settings-label">템플릿</label><div class="flex flex-wrap gap-1.5">' +
            CRM_TEMPLATES.map(function(t) {
                return '<button type="button" onclick="applyCrmTemplate(\'' + t.id + '\')" class="crm-template-btn text-[10px] px-2.5 py-1 rounded-md border border-border bg-surface ' + (crmWizardState.templateId === t.id ? 'active' : '') + '">' + t.label + '</button>';
            }).join('') + '</div></div>' +
            '<p class="text-[10px] font-bold text-primary">A안 (대조군)</p>' +
            '<div><label class="settings-label">제목</label><input class="settings-input" value="' + (crmWizardState.title || '').replace(/"/g, '&quot;') + '" oninput="crmWizardState.title=this.value;renderCrmWizardMessagePreview()"></div>' +
            '<div><label class="settings-label">할인율 (%)</label><input type="number" class="settings-input" min="5" max="50" value="' + crmWizardState.discount + '" oninput="crmWizardState.discount=parseInt(this.value,10)||20;renderCrmWizardMessagePreview()"></div>' +
            '<div><label class="settings-label">본문</label><textarea class="settings-input resize-none" rows="3" oninput="crmWizardState.body=this.value;renderCrmWizardMessagePreview()">' + (crmWizardState.body || '') + '</textarea></div>' +
            '<div><label class="settings-label">CTA 버튼</label><input class="settings-input" value="' + (crmWizardState.cta || '') + '" oninput="crmWizardState.cta=this.value;renderCrmWizardMessagePreview()"></div></div>' +
            '<div id="crm-wiz-preview" class="flex items-center justify-center"></div></div>' +
            '<div class="glass rounded-xl p-4 border border-purple-500/25">' +
            '<label class="flex items-center gap-2 cursor-pointer mb-3">' +
            '<input type="checkbox" ' + (crmWizardState.abTestEnabled ? 'checked' : '') + ' onchange="crmWizardState.abTestEnabled=this.checked;renderCrmWizardStep()" class="rounded">' +
            '<span class="text-xs font-bold text-purple-300">A/B 테스트 활성화</span></label>' +
            (crmWizardState.abTestEnabled ?
                '<div class="space-y-3">' +
                '<div><label class="settings-label">A안 트래픽 비율: <strong class="text-white">' + crmWizardState.splitA + '%</strong> / B안 ' + (100 - crmWizardState.splitA) + '%</label>' +
                '<input type="range" min="10" max="90" step="5" value="' + crmWizardState.splitA + '" class="w-full" oninput="crmWizardState.splitA=parseInt(this.value,10);renderCrmWizardStep()"></div>' +
                '<p class="text-[10px] font-bold text-purple-300">B안 (테스트군)</p>' +
                '<div><label class="settings-label">B안 제목</label><input class="settings-input" value="' + (crmWizardState.variantBTitle || crmWizardState.title || '').replace(/"/g, '&quot;') + '" oninput="crmWizardState.variantBTitle=this.value"></div>' +
                '<div><label class="settings-label">B안 할인율 (%)</label><input type="number" class="settings-input" min="5" max="50" value="' + (crmWizardState.variantBDiscount || 25) + '" oninput="crmWizardState.variantBDiscount=parseInt(this.value,10)||25"></div>' +
                '<div><label class="settings-label">B안 본문</label><textarea class="settings-input resize-none" rows="2" oninput="crmWizardState.variantBBody=this.value">' + (crmWizardState.variantBBody || crmWizardState.body || '') + '</textarea></div>' +
                '<div><label class="settings-label">B안 CTA</label><input class="settings-input" value="' + (crmWizardState.variantBCta || '쿠폰 받기') + '" oninput="crmWizardState.variantBCta=this.value"></div>' +
                '</div>' : '<p class="text-[10px] text-gray-500">체크 시 두 가지 메시지 변형을 동시에 발송하여 성과를 비교합니다.</p>') +
            '</div></div>';
        renderCrmWizardMessagePreview();
    } else if (step === 4) {
        var target = calculateCrmAudience(crmWizardState.audience);
        body.innerHTML = '<div class="space-y-4">' +
            '<div><label class="settings-label">발송 일정</label><div class="flex gap-2 mb-3">' +
            [['scheduled','📅 예약 발송'],['now','⚡ 즉시 발송']].map(function(m) {
                return '<button type="button" onclick="crmWizardState.launchMode=\'' + m[0] + '\';renderCrmWizardStep()" class="flex-1 text-xs py-2 rounded-lg border ' + (crmWizardState.launchMode === m[0] ? 'border-primary/50 bg-primary/15 text-blue-300' : 'border-border bg-surface') + '">' + m[1] + '</button>';
            }).join('') + '</div>' +
            '<div class="settings-row"><div><label class="settings-label">시작일</label><input type="date" class="settings-input" value="' + crmWizardState.startDate + '" onchange="crmWizardState.startDate=this.value"></div>' +
            '<div><label class="settings-label">종료일</label><input type="date" class="settings-input" value="' + crmWizardState.endDate + '" onchange="crmWizardState.endDate=this.value"></div></div></div>' +
            '<div class="glass rounded-xl p-4 border border-success/20 bg-success/5">' +
            '<p class="text-xs font-bold text-success mb-2">✓ 검토 요약</p>' +
            '<ul class="text-xs text-gray-300 space-y-1.5">' +
            '<li><span class="text-gray-500">캠페인:</span> <strong class="text-white">' + (crmWizardState.name || '(미입력)') + '</strong></li>' +
            '<li><span class="text-gray-500">채널:</span> ' + crmWizardState.type + ' · 타겟 <strong class="text-white">' + fmtCount(target) + '명</strong></li>' +
            '<li><span class="text-gray-500">혜택:</span> ' + crmWizardState.discount + '% 할인 · ' + crmWizardState.launchMode + '</li>' +
            (crmWizardState.abTestEnabled ? '<li><span class="text-gray-500">A/B:</span> <strong class="text-purple-300">' + crmWizardState.splitA + '% / ' + (100 - crmWizardState.splitA) + '%</strong> · B안 ' + (crmWizardState.variantBDiscount || 25) + '%</li>' : '') +
            '</ul></div></div>';
    }
}

function renderCrmWizardAudiencePreview() {
    var count = calculateCrmAudience(crmWizardState.audience);
    var el = document.getElementById('crm-wiz-audience-count');
    var bar = document.getElementById('crm-wiz-audience-bar');
    if (el) el.innerHTML = fmtCount(count) + '<span class="text-sm font-normal text-gray-500">명</span>';
    if (bar) bar.style.width = Math.min(100, Math.round(count / 8420 * 100)) + '%';
}

function applyCrmTemplate(id) {
    var t = CRM_TEMPLATES.find(function(x) { return x.id === id; });
    if (!t) return;
    crmWizardState.templateId = id;
    crmWizardState.title = t.title;
    crmWizardState.body = t.body;
    crmWizardState.cta = t.cta;
    crmWizardState.discount = t.discount;
    renderCrmWizardStep();
}

function renderCrmWizardMessagePreview() {
    var el = document.getElementById('crm-wiz-preview');
    if (!el) return;
    var m = { title: crmWizardState.title, body: crmWizardState.body, cta: crmWizardState.cta, discount: crmWizardState.discount };
    var title = (m.title || '').replace('#{고객명}', '지현');
    var body = (m.body || '').replace('{discount}', m.discount || 20);
    el.innerHTML = '<div class="bg-[#fae100] rounded-2xl p-3 shadow-xl w-full max-w-[260px] mx-auto">' +
        '<div class="bg-white rounded-xl p-4">' +
        '<p class="text-[10px] text-gray-400 mb-1">' + App.brandName + ' 알림톡</p>' +
        '<p class="text-sm font-bold text-gray-900 mb-2">' + title + '</p>' +
        '<p class="text-xs text-gray-600 leading-relaxed mb-3">' + body + '</p>' +
        '<button class="w-full bg-gray-100 text-gray-800 text-xs font-bold py-2 rounded-lg">' + (m.cta || '확인하기') + '</button>' +
        '</div></div>';
}

function submitCrmCampaign() {
    if (!crmWizardState.name.trim()) { showToast('캠페인 이름을 입력해주세요.', 'warning'); crmWizardState.step = 1; renderCrmWizardStep(); return; }
    var now = new Date();
    var createdAt = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    var target = calculateCrmAudience(crmWizardState.audience);
    var status = crmWizardState.launchMode === 'now' ? 'running' : 'scheduled';
    var payload = {
        name: crmWizardState.name.trim(), type: crmWizardState.type, status: status, templateId: crmWizardState.templateId,
        audience: Object.assign({}, crmWizardState.audience), targetCount: target,
        message: { title: crmWizardState.title, body: crmWizardState.body, cta: crmWizardState.cta, discount: crmWizardState.discount },
        schedule: { mode: crmWizardState.launchMode, startDate: crmWizardState.startDate, endDate: crmWizardState.endDate },
        stats: status === 'running' ? { sent: Math.round(target * 0.15), opened: Math.round(target * 0.11), clicked: Math.round(target * 0.02), converted: Math.round(target * 0.012), revenue: Math.round(target * 0.012 * 35000) } : { sent: 0, opened: 0, clicked: 0, converted: 0, revenue: 0 },
        createdBy: App.currentUserId, createdAt: createdAt,
        abTest: { enabled: false, splitA: 50, splitB: 50, winner: null, variantA: null, variantB: null },
    };
    if (crmWizardState.abTestEnabled) {
        var splitA = crmWizardState.splitA || 50;
        var splitB = 100 - splitA;
        var msgA = { title: crmWizardState.title, body: crmWizardState.body, cta: crmWizardState.cta, discount: crmWizardState.discount };
        var msgB = { title: crmWizardState.variantBTitle || crmWizardState.title, body: crmWizardState.variantBBody || crmWizardState.body, cta: crmWizardState.variantBCta || '쿠폰 받기', discount: crmWizardState.variantBDiscount || 25 };
        var sentA = status === 'running' ? Math.round(target * 0.15 * splitA / 100) : 0;
        var sentB = status === 'running' ? Math.round(target * 0.15 * splitB / 100) : 0;
        payload.abTest = {
            enabled: true, splitA: splitA, splitB: splitB, winner: null,
            variantA: { label: 'A · ' + msgA.discount + '% 쿠폰', message: msgA, stats: { sent: sentA, opened: Math.round(sentA * 0.7), clicked: Math.round(sentA * 0.12), converted: Math.round(sentA * 0.08), revenue: Math.round(sentA * 0.08 * 41000) } },
            variantB: { label: 'B · ' + msgB.discount + '% 쿠폰', message: msgB, stats: { sent: sentB, opened: Math.round(sentB * 0.75), clicked: Math.round(sentB * 0.14), converted: Math.round(sentB * 0.09), revenue: Math.round(sentB * 0.09 * 42000) } },
        };
        if (status === 'running') {
            payload.stats = {
                sent: payload.abTest.variantA.stats.sent + payload.abTest.variantB.stats.sent,
                opened: payload.abTest.variantA.stats.opened + payload.abTest.variantB.stats.opened,
                clicked: payload.abTest.variantA.stats.clicked + payload.abTest.variantB.stats.clicked,
                converted: payload.abTest.variantA.stats.converted + payload.abTest.variantB.stats.converted,
                revenue: payload.abTest.variantA.stats.revenue + payload.abTest.variantB.stats.revenue,
            };
        }
    }
    if (crmWizardState.editId) {
        var idx = crmData.findIndex(function(c) { return c.id === crmWizardState.editId; });
        if (idx >= 0) {
            payload.id = crmWizardState.editId;
            payload.createdAt = crmData[idx].createdAt;
            payload.createdBy = crmData[idx].createdBy;
            payload.duplicatedFrom = crmData[idx].duplicatedFrom || null;
            if (!crmWizardState.abTestEnabled && crmData[idx].abTest) payload.abTest = crmData[idx].abTest;
            if (crmWizardState.abTestEnabled && crmData[idx].abTest && crmData[idx].abTest.enabled && status !== 'running') {
                payload.abTest.variantA.stats = crmData[idx].abTest.variantA ? crmData[idx].abTest.variantA.stats : payload.abTest.variantA.stats;
                payload.abTest.variantB.stats = crmData[idx].abTest.variantB ? crmData[idx].abTest.variantB.stats : payload.abTest.variantB.stats;
            }
            crmData[idx] = payload;
        }
    } else {
        payload.id = 'c-' + Date.now();
        crmData.unshift(payload);
    }
    persistCrmCampaigns();
    closeCrmWizard();
    crmActiveCampaignId = payload.id;
    crmAudienceFilter = Object.assign({}, payload.audience);
    if (App.currentView === 'view-crm') initCrmView();
    addActivityLog({ userId: App.currentUserId, action: 'CRM 캠페인', category: 'crm', type: 'success', detail: payload.name + ' ' + (status === 'running' ? '즉시 발송' : '예약'), meta: '타겟 ' + fmtCount(target) + '명' });
    showToast('캠페인「' + payload.name + '」이 생성되었습니다. (데모)', 'success');
}

function pauseCrmCampaign(id) {
    var c = crmData.find(function(x) { return x.id === id; });
    if (c) { c.status = 'paused'; persistCrmCampaigns(); initCrmView(); showToast('캠페인을 일시 중지했습니다.', 'warning'); }
}

function launchCrmCampaign(id) {
    var c = crmData.find(function(x) { return x.id === id; });
    if (!c) return;
    c.status = 'running';
    if (!c.stats.sent) {
        if (c.abTest && c.abTest.enabled && c.abTest.variantA) {
            var splitA = c.abTest.splitA || 50;
            var sentA = Math.round(c.targetCount * 0.2 * splitA / 100);
            var sentB = Math.round(c.targetCount * 0.2 * (100 - splitA) / 100);
            c.abTest.variantA.stats = { sent: sentA, opened: Math.round(sentA * 0.7), clicked: Math.round(sentA * 0.12), converted: Math.round(sentA * 0.08), revenue: Math.round(sentA * 0.08 * 41000) };
            c.abTest.variantB.stats = { sent: sentB, opened: Math.round(sentB * 0.75), clicked: Math.round(sentB * 0.14), converted: Math.round(sentB * 0.09), revenue: Math.round(sentB * 0.09 * 42000) };
            c.stats = {
                sent: c.abTest.variantA.stats.sent + c.abTest.variantB.stats.sent,
                opened: c.abTest.variantA.stats.opened + c.abTest.variantB.stats.opened,
                clicked: c.abTest.variantA.stats.clicked + c.abTest.variantB.stats.clicked,
                converted: c.abTest.variantA.stats.converted + c.abTest.variantB.stats.converted,
                revenue: c.abTest.variantA.stats.revenue + c.abTest.variantB.stats.revenue,
            };
        } else {
            c.stats = { sent: Math.round(c.targetCount * 0.2), opened: Math.round(c.targetCount * 0.14), clicked: Math.round(c.targetCount * 0.025), converted: Math.round(c.targetCount * 0.015), revenue: Math.round(c.targetCount * 0.015 * 38000) };
        }
    }
    persistCrmCampaigns();
    initCrmView();
    showToast('캠페인 발송을 시작했습니다. (데모)', 'success');
}

function editCrmCampaign(id) { openCrmWizard(id); }

function testSendCrmCampaign(id) {
    var c = crmData.find(function(x) { return x.id === id; });
    showToast('테스트 알림톡을 ' + (getCurrentUser().name) + '님에게 발송했습니다. (데모)', 'success');
    if (c) renderCrmLivePreview(c.message);
}

function duplicateCrmCampaign(id) {
    var c = crmData.find(function(x) { return x.id === id; });
    if (!c) return;
    var copy = JSON.parse(JSON.stringify(c));
    copy.id = 'c-' + Date.now();
    copy.name = c.name.replace(/ \(복제\)$/, '') + ' (복제)';
    copy.status = 'draft';
    copy.stats = { sent: 0, opened: 0, clicked: 0, converted: 0, revenue: 0 };
    copy.duplicatedFrom = c.id;
    copy.createdBy = App.currentUserId;
    var now = new Date();
    copy.createdAt = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    if (copy.abTest && copy.abTest.enabled) {
        copy.abTest.winner = null;
        if (copy.abTest.variantA) copy.abTest.variantA.stats = { sent: 0, opened: 0, clicked: 0, converted: 0, revenue: 0 };
        if (copy.abTest.variantB) copy.abTest.variantB.stats = { sent: 0, opened: 0, clicked: 0, converted: 0, revenue: 0 };
    }
    crmData.unshift(copy);
    persistCrmCampaigns();
    crmActiveCampaignId = copy.id;
    initCrmView();
    addActivityLog({ userId: App.currentUserId, action: 'CRM 캠페인 복제', category: 'crm', type: 'info', detail: copy.name, meta: '원본: ' + c.name });
    showToast('캠페인「' + copy.name + '」이 복제되었습니다. (초안)', 'success');
}

function declareAbTestWinner(campaignId, variant) {
    var c = crmData.find(function(x) { return x.id === campaignId; });
    if (!c || !c.abTest || !c.abTest.enabled) return;
    c.abTest.winner = variant;
    persistCrmCampaigns();
    renderCrmCampaignDetail(campaignId);
    showToast('A/B 테스트 승자: ' + variant + '안이 선정되었습니다.', 'success');
    addActivityLog({ userId: App.currentUserId, action: 'A/B 테스트 승자 선정', category: 'crm', type: 'success', detail: c.name + ' · ' + variant + '안', meta: '전환율 기준' });
}

/* ── Promotion Calendar & KPI ── */
var PROMO_TYPE_OPTIONS = [
    { id: 'season_sale', label: '시즌 세일', css: 'type-season' },
    { id: 'flash_sale', label: '플래시 세일', css: 'type-flash' },
    { id: 'coupon', label: '쿠폰 프로모션', css: 'type-coupon' },
    { id: 'crm_push', label: 'CRM 푸시', css: 'type-crm' },
    { id: 'bundle', label: '번들 · 세트', css: 'type-bundle' },
];
var PROMO_STATUS_OPTIONS = { planning: ['기획 중', 'bg-gray-700 text-gray-400'], active: ['진행 중', 'bg-success/20 text-success'], completed: ['완료', 'bg-gray-600 text-gray-400'] };
var PROMO_CHANNEL_OPTIONS = ['cafe24', 'smartstore', 'coupang', 'ably', 'alimtalk'];
var PROMO_SCHEDULE_TEMPLATES = [
    { id: 'season', label: '시즌 세일', type: 'season_sale', days: 7, budget: 8000000, channels: ['cafe24', 'smartstore'],
      title: '7월 시즌 세일', memo: '카테고리별 할인 · CRM 연동 예정',
      kpi: { targetSent: 8000, targetOpenRate: 45, targetConversion: 3.0, targetRoas: 3.5, targetRevenue: 120000000 } },
    { id: 'flash', label: '플래시 세일', type: 'flash_sale', days: 2, budget: 2000000, channels: ['cafe24', 'coupang'],
      title: '48시간 플래시 세일', memo: '인기 SKU 한정 · 긴급 재고 소진',
      kpi: { targetSent: 0, targetOpenRate: 0, targetConversion: 4.5, targetRoas: 4.0, targetRevenue: 60000000 } },
    { id: 'coupon', label: '쿠폰 프로모션', type: 'coupon', days: 5, budget: 4000000, channels: ['cafe24', 'smartstore', 'alimtalk'],
      title: 'VIP 쿠폰 프로모션', memo: '등급별 차등 쿠폰 · 알림톡 발송',
      kpi: { targetSent: 5000, targetOpenRate: 42, targetConversion: 2.8, targetRoas: 3.2, targetRevenue: 80000000 } },
    { id: 'crm', label: 'CRM 푸시', type: 'crm_push', days: 7, budget: 3000000, channels: ['alimtalk'],
      title: 'CRM 타겟 푸시', memo: '세그먼트 타겟 · A/B 테스트 가능',
      kpi: { targetSent: 3000, targetOpenRate: 40, targetConversion: 2.5, targetRoas: 3.0, targetRevenue: 45000000 } },
];

function getPromoPlansDefaults() {
    return [
        { id: 'pp-demo-1', title: '7월 여름 시즌 프로모션', type: 'season_sale', status: 'active',
          startDate: '2026-07-10', endDate: '2026-07-15', owner: 'lee', budget: 8000000,
          channels: ['cafe24', 'smartstore', 'alimtalk'], memo: '스킨케어 카테고리 집중 · VIP 동시 쿠폰 · A/B 테스트 연동',
          campaignIds: ['c-demo-1'],
          kpi: { targetSent: 10000, targetOpenRate: 45, targetConversion: 3.0, targetRoas: 3.5, targetRevenue: 150000000,
                 actualSent: 8420, actualOpened: 5894, actualConverted: 1044, actualRevenue: 42800000, actualRoas: 2.9, inputAt: '2026-07-10' } },
        { id: 'pp-demo-2', title: '이탈 고객 복귀 캠페인', type: 'crm_push', status: 'planning',
          startDate: '2026-07-15', endDate: '2026-07-22', owner: 'lee', budget: 3000000,
          channels: ['alimtalk'], memo: '6개월 이상 미구매 고객 대상 15% 할인 쿠폰',
          campaignIds: ['c-demo-2'],
          kpi: { targetSent: 1500, targetOpenRate: 40, targetConversion: 2.5, targetRoas: 3.0, targetRevenue: 45000000,
                 actualSent: 0, actualOpened: 0, actualConverted: 0, actualRevenue: 0, actualRoas: 0, inputAt: null } },
        { id: 'pp-demo-3', title: '7월 플래시 세일 (주말)', type: 'flash_sale', status: 'planning',
          startDate: '2026-07-19', endDate: '2026-07-20', owner: 'kim', budget: 2000000,
          channels: ['cafe24', 'coupang'], memo: '48시간 한정 30% 할인 · 인기 SKU 12종',
          campaignIds: [],
          kpi: { targetSent: 0, targetOpenRate: 0, targetConversion: 4.0, targetRoas: 4.0, targetRevenue: 80000000,
                 actualSent: 0, actualOpened: 0, actualConverted: 0, actualRevenue: 0, actualRoas: 0, inputAt: null } },
    ];
}

function loadPromoPlans() {
    try {
        var raw = localStorage.getItem(PROMO_STORAGE_KEY);
        promoPlans = raw ? JSON.parse(raw) : getPromoPlansDefaults();
    } catch (e) { promoPlans = getPromoPlansDefaults(); }
}

function persistPromoPlans() {
    try { localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(promoPlans)); } catch (e) { /* ignore */ }
}

function getPromoTypeInfo(typeId) {
    return PROMO_TYPE_OPTIONS.find(function(t) { return t.id === typeId; }) || PROMO_TYPE_OPTIONS[0];
}

function formatPromoDate(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function parsePromoDate(str) {
    if (!str) return new Date();
    var p = str.split('-');
    return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
}

function getPromoKpiPct(actual, target) {
    if (!target) return 0;
    return Math.min(150, Math.round((actual / target) * 100));
}

function getPromoKpiBarClass(pct) {
    if (pct >= 90) return 'good';
    if (pct >= 60) return 'warn';
    return 'bad';
}

function getPromoPlansForDate(dateStr) {
    return promoPlans.filter(function(p) { return dateStr >= p.startDate && dateStr <= p.endDate; });
}

function setPromoCalendarMode(mode) {
    promoCalendarMode = mode;
    renderPromoCalendar();
}

function shiftPromoCalendar(dir) {
    var d = new Date(promoCalendarCursor);
    if (promoCalendarMode === 'month') d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * 7);
    promoCalendarCursor = d;
    renderPromoCalendar();
}

function renderPromoCalendar() {
    var titleEl = document.getElementById('promo-calendar-title');
    var gridEl = document.getElementById('promo-calendar-grid');
    var listEl = document.getElementById('promo-calendar-events-list');
    if (!gridEl) return;
    document.querySelectorAll('.promo-cal-mode-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.mode === promoCalendarMode);
    });
    var todayStr = formatPromoDate(new Date(2026, 6, 10));
    if (promoCalendarMode === 'month') {
        var y = promoCalendarCursor.getFullYear(), m = promoCalendarCursor.getMonth();
        if (titleEl) titleEl.textContent = y + '년 ' + (m + 1) + '월';
        var firstDay = new Date(y, m, 1);
        var startOffset = (firstDay.getDay() + 6) % 7;
        var daysInMonth = new Date(y, m + 1, 0).getDate();
        var prevMonthDays = new Date(y, m, 0).getDate();
        var cells = ['<div class="promo-cal-head">월</div>', '<div class="promo-cal-head">화</div>', '<div class="promo-cal-head">수</div>', '<div class="promo-cal-head">목</div>', '<div class="promo-cal-head">금</div>', '<div class="promo-cal-head">토</div>', '<div class="promo-cal-head">일</div>'];
        for (var i = 0; i < startOffset; i++) {
            var pd = prevMonthDays - startOffset + i + 1;
            var pdStr = formatPromoDate(new Date(y, m - 1, pd));
            cells.push('<div class="promo-cal-cell other-month" onclick="openPromoScheduleModal(\'' + pdStr + '\')"><span class="promo-cal-day-num">' + pd + '</span></div>');
        }
        for (var day = 1; day <= daysInMonth; day++) {
            var dateStr = formatPromoDate(new Date(y, m, day));
            var events = getPromoPlansForDate(dateStr);
            var isToday = dateStr === todayStr;
            cells.push('<div class="promo-cal-cell' + (isToday ? ' today' : '') + '" onclick="openPromoScheduleModal(\'' + dateStr + '\')">' +
                '<span class="promo-cal-day-num">' + day + '</span>' +
                events.slice(0, 3).map(function(p) {
                    var ti = getPromoTypeInfo(p.type);
                    return '<div class="promo-cal-event ' + ti.css + '" onclick="event.stopPropagation();selectPromoPlan(\'' + p.id + '\')" title="' + p.title + '">' + p.title + '</div>';
                }).join('') +
                (events.length > 3 ? '<div class="text-[8px] text-gray-500 mt-0.5">+' + (events.length - 3) + '건</div>' : '') +
                '</div>');
        }
        var totalCells = startOffset + daysInMonth;
        var remain = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (var j = 1; j <= remain; j++) {
            var ndStr = formatPromoDate(new Date(y, m + 1, j));
            cells.push('<div class="promo-cal-cell other-month" onclick="openPromoScheduleModal(\'' + ndStr + '\')"><span class="promo-cal-day-num">' + j + '</span></div>');
        }
        gridEl.className = 'promo-cal-grid month';
        gridEl.innerHTML = cells.join('');
    } else {
        var weekStart = new Date(promoCalendarCursor);
        weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
        var weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (titleEl) titleEl.textContent = (weekStart.getMonth() + 1) + '/' + weekStart.getDate() + ' ~ ' + (weekEnd.getMonth() + 1) + '/' + weekEnd.getDate();
        var weekCells = ['<div class="promo-cal-head">월</div>', '<div class="promo-cal-head">화</div>', '<div class="promo-cal-head">수</div>', '<div class="promo-cal-head">목</div>', '<div class="promo-cal-head">금</div>', '<div class="promo-cal-head">토</div>', '<div class="promo-cal-head">일</div>'];
        for (var w = 0; w < 7; w++) {
            var wd = new Date(weekStart);
            wd.setDate(wd.getDate() + w);
            var wStr = formatPromoDate(wd);
            var wEvents = getPromoPlansForDate(wStr);
            var wToday = wStr === todayStr;
            weekCells.push('<div class="promo-cal-cell week-cell' + (wToday ? ' today' : '') + '" onclick="openPromoScheduleModal(\'' + wStr + '\')">' +
                '<span class="promo-cal-day-num">' + (wd.getMonth() + 1) + '/' + wd.getDate() + '</span>' +
                wEvents.map(function(p) {
                    var ti = getPromoTypeInfo(p.type);
                    return '<div class="promo-cal-event ' + ti.css + ' mb-1" onclick="event.stopPropagation();selectPromoPlan(\'' + p.id + '\')" title="' + p.title + '">' + p.title + '</div>';
                }).join('') + '</div>');
        }
        gridEl.className = 'promo-cal-grid week';
        gridEl.innerHTML = weekCells.join('');
    }
    if (listEl) {
        var sorted = promoPlans.slice().sort(function(a, b) { return a.startDate.localeCompare(b.startDate); });
        listEl.innerHTML = '<h4 class="text-sm font-bold mb-3">전체 프로모션 일정</h4>' +
            (sorted.length ? sorted.map(function(p) {
                var st = PROMO_STATUS_OPTIONS[p.status] || PROMO_STATUS_OPTIONS.planning;
                var ti = getPromoTypeInfo(p.type);
                var sel = promoActivePlanId === p.id ? ' border-primary/50 bg-primary/5' : '';
                return '<div class="p-3 rounded-lg border border-border bg-surface mb-2 cursor-pointer hover:border-primary/30 transition-colors' + sel + '" onclick="selectPromoPlan(\'' + p.id + '\')">' +
                    '<div class="flex items-center gap-2 mb-1"><span class="text-[10px] font-bold px-2 py-0.5 rounded ' + st[1] + '">' + st[0] + '</span>' +
                    '<span class="text-[9px] px-1.5 py-0.5 rounded bg-surface border border-border text-gray-400">' + ti.label + '</span></div>' +
                    '<p class="text-sm font-bold">' + p.title + '</p>' +
                    '<p class="text-[10px] text-gray-500 mt-0.5">' + p.startDate + ' ~ ' + p.endDate + ' · ' + (getMember(p.owner).name || '') + '</p></div>';
            }).join('') : '<p class="text-sm text-gray-500 text-center py-6">등록된 프로모션이 없습니다.</p>');
    }
    renderPromoPlanSidebar(promoActivePlanId);
}

function selectPromoPlan(id) {
    promoActivePlanId = id;
    renderPromoCalendar();
    if (crmActiveTab === 'kpi') renderPromoKpiPanel();
}

function renderPromoPlanSidebar(id) {
    var el = document.getElementById('promo-plan-detail-sidebar');
    if (!el) return;
    var p = promoPlans.find(function(x) { return x.id === id; });
    if (!p) { el.innerHTML = '<div class="glass rounded-xl p-5 h-full"><p class="text-xs text-gray-500 text-center py-8">일정을 선택하면 기획 상세가 표시됩니다.</p></div>'; return; }
    var st = PROMO_STATUS_OPTIONS[p.status] || PROMO_STATUS_OPTIONS.planning;
    var revPct = getPromoKpiPct(p.kpi.actualRevenue, p.kpi.targetRevenue);
    el.innerHTML = '<div class="glass rounded-xl p-5">' +
        '<div class="flex items-center justify-between mb-3"><span class="text-[10px] font-bold px-2 py-0.5 rounded ' + st[1] + '">' + st[0] + '</span>' +
        '<button onclick="openPromoPlanModal(\'' + p.id + '\')" class="text-[10px] text-primary hover:text-white">수정</button></div>' +
        '<h4 class="font-bold text-sm mb-1">' + p.title + '</h4>' +
        '<p class="text-[10px] text-gray-500 mb-3">' + p.startDate + ' ~ ' + p.endDate + '</p>' +
        '<div class="space-y-2 text-xs mb-4">' +
        '<div class="flex justify-between"><span class="text-gray-500">담당</span><span>' + (getMember(p.owner).name || '') + '</span></div>' +
        '<div class="flex justify-between"><span class="text-gray-500">예산</span><span>' + App.formatWon(p.budget) + '</span></div>' +
        '<div class="flex justify-between"><span class="text-gray-500">채널</span><span class="text-right">' + p.channels.join(', ') + '</span></div></div>' +
        (p.memo ? '<p class="text-[10px] text-gray-400 mb-4 p-2 rounded bg-dark/50">' + p.memo + '</p>' : '') +
        '<p class="text-[10px] font-bold text-gray-400 mb-2">매출 달성률</p>' +
        '<div class="promo-kpi-bar mb-1"><div class="promo-kpi-bar-fill ' + getPromoKpiBarClass(revPct) + '" style="width:' + Math.min(100, revPct) + '%"></div></div>' +
        '<p class="text-xs text-gray-400 mb-3">' + revPct + '% · ' + formatDataHubWon(p.kpi.actualRevenue) + ' / ' + formatDataHubWon(p.kpi.targetRevenue) + '</p>' +
        '<button onclick="switchCrmTab(\'kpi\')" class="w-full text-xs py-2 rounded-lg border border-border hover:border-primary/40 transition-colors">KPI · 결과 입력 →</button></div>';
}

function getPromoTeamMembers() {
    return App.teamMembers || [];
}

function addPromoDurationDays(startStr, days) {
    var d = parsePromoDate(startStr);
    d.setDate(d.getDate() + Math.max(0, days - 1));
    return formatPromoDate(d);
}

function openPromoScheduleModal(defaultDate) {
    crmActiveTab = 'calendar';
    if (defaultDate) promoCalendarCursor = parsePromoDate(defaultDate);
    openPromoPlanModal(null, defaultDate || formatPromoDate(promoCalendarCursor), { fromCalendar: true });
}

function applyPromoScheduleTemplate(templateId) {
    var tpl = PROMO_SCHEDULE_TEMPLATES.find(function(t) { return t.id === templateId; });
    if (!tpl) return;
    var titleEl = document.getElementById('promo-form-title');
    var typeEl = document.getElementById('promo-form-type');
    var budgetEl = document.getElementById('promo-form-budget');
    var memoEl = document.getElementById('promo-form-memo');
    var startEl = document.getElementById('promo-form-start');
    var endEl = document.getElementById('promo-form-end');
    if (titleEl) titleEl.value = tpl.title;
    if (typeEl) typeEl.value = tpl.type;
    if (budgetEl) budgetEl.value = tpl.budget;
    if (memoEl) memoEl.value = tpl.memo;
    if (startEl && endEl) endEl.value = addPromoDurationDays(startEl.value, tpl.days);
    document.querySelectorAll('#promo-form-channels input').forEach(function(cb) {
        cb.checked = tpl.channels.indexOf(cb.value) >= 0;
    });
    Object.keys(tpl.kpi).forEach(function(k) {
        var inp = document.getElementById('promo-kpi-' + k);
        if (inp) inp.value = tpl.kpi[k];
    });
    document.querySelectorAll('.promo-template-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.tpl === templateId);
    });
    renderPromoSchedulePreview();
    showToast('「' + tpl.label + '」템플릿이 적용되었습니다. (데모)', 'success');
}

function setPromoDurationPreset(days) {
    var startEl = document.getElementById('promo-form-start');
    var endEl = document.getElementById('promo-form-end');
    if (!startEl || !endEl) return;
    endEl.value = addPromoDurationDays(startEl.value, days);
    document.querySelectorAll('.promo-duration-btn').forEach(function(btn) {
        btn.classList.toggle('active', parseInt(btn.dataset.days, 10) === days);
    });
    renderPromoSchedulePreview();
}

function renderPromoSchedulePreview() {
    var el = document.getElementById('promo-schedule-preview');
    if (!el) return;
    var title = (document.getElementById('promo-form-title') || {}).value || '(미입력)';
    var start = (document.getElementById('promo-form-start') || {}).value || '—';
    var end = (document.getElementById('promo-form-end') || {}).value || '—';
    var typeEl = document.getElementById('promo-form-type');
    var typeInfo = getPromoTypeInfo(typeEl ? typeEl.value : 'season_sale');
    var budget = parseInt((document.getElementById('promo-form-budget') || {}).value, 10) || 0;
    var channels = [];
    document.querySelectorAll('#promo-form-channels input:checked').forEach(function(cb) { channels.push(cb.value); });
    var days = 1;
    if (start && end && start !== '—') {
        days = Math.max(1, Math.round((parsePromoDate(end) - parsePromoDate(start)) / 86400000) + 1);
    }
    el.innerHTML = '<div class="glass rounded-xl p-4 border border-primary/20 bg-primary/5">' +
        '<p class="text-[10px] font-bold text-primary mb-2">📅 캘린더 미리보기</p>' +
        '<div class="flex items-center gap-2 mb-2">' +
        '<span class="promo-cal-event ' + typeInfo.css + ' flex-1">' + title + '</span></div>' +
        '<ul class="text-[10px] text-gray-400 space-y-1">' +
        '<li><span class="text-gray-500">기간:</span> <strong class="text-white">' + start + ' ~ ' + end + '</strong> (' + days + '일)</li>' +
        '<li><span class="text-gray-500">유형:</span> ' + typeInfo.label + ' · 예산 ' + App.formatWon(budget) + '</li>' +
        '<li><span class="text-gray-500">채널:</span> ' + (channels.length ? channels.join(', ') : '미선택') + '</li>' +
        '</ul></div>';
}

function openPromoPlanModal(editId, defaultDate, options) {
    if (!promoPlans) loadPromoPlans();
    options = options || {};
    promoModalState = { editId: editId || null, defaultDate: defaultDate || null, fromCalendar: !!options.fromCalendar };
    var p = editId ? promoPlans.find(function(x) { return x.id === editId; }) : null;
    var titleEl = document.getElementById('promo-modal-title');
    var deleteBtn = document.getElementById('promo-modal-delete');
    var saveBtn = document.getElementById('promo-modal-save');
    if (titleEl) titleEl.textContent = p ? '프로모션 수정' : '프로모션 일정 등록';
    if (deleteBtn) deleteBtn.classList.toggle('hidden', !p);
    if (saveBtn) saveBtn.textContent = p ? '저장' : '일정 등록';
    var body = document.getElementById('promo-modal-body');
    if (!body) return;
    var startDate = p ? p.startDate : (defaultDate || formatPromoDate(promoCalendarCursor));
    var endDate = p ? p.endDate : addPromoDurationDays(startDate, 3);
    var dateBanner = !p ? '<div class="glass rounded-lg p-3 border border-primary/25 mb-1">' +
        '<p class="text-[10px] text-gray-500">선택 일정</p>' +
        '<p class="text-sm font-bold text-primary">' + startDate + '부터 등록 · 캘린더에 즉시 반영 <span class="demo-pill">데모</span></p></div>' : '';
    body.innerHTML = dateBanner + '<div class="space-y-4">' +
        (!p ? '<div><label class="settings-label">빠른 템플릿</label><div class="flex flex-wrap gap-1.5">' +
        PROMO_SCHEDULE_TEMPLATES.map(function(t) {
            return '<button type="button" class="promo-template-btn text-[10px] px-2.5 py-1.5 rounded-md border border-border bg-surface" data-tpl="' + t.id + '" onclick="applyPromoScheduleTemplate(\'' + t.id + '\')">' + t.label + '</button>';
        }).join('') + '</div></div>' : '') +
        '<div><label class="settings-label">프로모션명 <span class="text-danger">*</span></label><input id="promo-form-title" class="settings-input" maxlength="60" value="' + (p ? p.title.replace(/"/g, '&quot;') : '') + '" placeholder="예: 7월 여름 시즌 세일" oninput="renderPromoSchedulePreview()"></div>' +
        '<div class="settings-row"><div><label class="settings-label">유형</label><select id="promo-form-type" class="settings-input" onchange="renderPromoSchedulePreview()">' +
        PROMO_TYPE_OPTIONS.map(function(t) { return '<option value="' + t.id + '" ' + (p && p.type === t.id ? 'selected' : '') + '>' + t.label + '</option>'; }).join('') + '</select></div>' +
        '<div><label class="settings-label">상태</label><select id="promo-form-status" class="settings-input">' +
        Object.keys(PROMO_STATUS_OPTIONS).map(function(k) { return '<option value="' + k + '" ' + (p && p.status === k ? 'selected' : ( !p && k === 'planning' ? 'selected' : '')) + '>' + PROMO_STATUS_OPTIONS[k][0] + '</option>'; }).join('') + '</select></div></div>' +
        '<div class="settings-row"><div><label class="settings-label">시작일</label><input type="date" id="promo-form-start" class="settings-input" value="' + startDate + '" onchange="setPromoDurationPreset(3);renderPromoSchedulePreview()"></div>' +
        '<div><label class="settings-label">종료일</label><input type="date" id="promo-form-end" class="settings-input" value="' + endDate + '" onchange="renderPromoSchedulePreview()"></div></div>' +
        (!p ? '<div><label class="settings-label">기간 프리셋</label><div class="flex flex-wrap gap-1.5">' +
        [[1, '1일'], [3, '3일'], [7, '7일'], [14, '2주']].map(function(d) {
            return '<button type="button" class="promo-duration-btn text-[10px] px-2.5 py-1.5 rounded-md border border-border bg-surface ' + (d[0] === 3 ? 'active' : '') + '" data-days="' + d[0] + '" onclick="setPromoDurationPreset(' + d[0] + ')">' + d[1] + '</button>';
        }).join('') + '</div></div>' : '') +
        '<div class="settings-row"><div><label class="settings-label">담당자</label><select id="promo-form-owner" class="settings-input">' +
        getPromoTeamMembers().map(function(m) { return '<option value="' + m.id + '" ' + ((p ? p.owner : App.currentUserId) === m.id ? 'selected' : '') + '>' + m.name + '</option>'; }).join('') + '</select></div>' +
        '<div><label class="settings-label">예산 (원)</label><input type="number" id="promo-form-budget" class="settings-input" min="0" step="100000" value="' + (p ? p.budget : 5000000) + '" oninput="renderPromoSchedulePreview()"></div></div>' +
        '<div><label class="settings-label">채널</label><div class="flex flex-wrap gap-2" id="promo-form-channels">' +
        PROMO_CHANNEL_OPTIONS.map(function(ch) {
            var checked = p ? p.channels.indexOf(ch) >= 0 : ch === 'cafe24';
            return '<label class="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border cursor-pointer hover:border-primary/30"><input type="checkbox" value="' + ch + '" ' + (checked ? 'checked' : '') + ' class="rounded" onchange="renderPromoSchedulePreview()"> ' + ch + '</label>';
        }).join('') + '</div></div>' +
        '<div><label class="settings-label">기획 메모</label><textarea id="promo-form-memo" class="settings-input resize-none" rows="2" placeholder="목표, 타겟, 특이사항">' + (p ? p.memo || '' : '') + '</textarea></div>' +
        '<div id="promo-schedule-preview"></div>' +
        '<div class="border-t border-border pt-4"><p class="text-xs font-bold text-primary mb-3">목표 KPI 설정</p>' +
        '<div class="grid grid-cols-2 gap-3">' +
        [['발송 목표', 'targetSent', p ? p.kpi.targetSent : 5000], ['오픈율 목표 (%)', 'targetOpenRate', p ? p.kpi.targetOpenRate : 45], ['전환율 목표 (%)', 'targetConversion', p ? p.kpi.targetConversion : 3], ['ROAS 목표', 'targetRoas', p ? p.kpi.targetRoas : 3.5], ['매출 목표 (원)', 'targetRevenue', p ? p.kpi.targetRevenue : 100000000]].map(function(k) {
            return '<div><label class="settings-label">' + k[0] + '</label><input type="number" id="promo-kpi-' + k[1] + '" class="settings-input" step="any" value="' + k[2] + '"></div>';
        }).join('') + '</div></div>' +
        (crmData && crmData.length ? '<div><label class="settings-label">연결 CRM 캠페인</label><select id="promo-form-campaign" class="settings-input"><option value="">없음</option>' +
        crmData.map(function(c) { return '<option value="' + c.id + '" ' + (p && p.campaignIds && p.campaignIds.indexOf(c.id) >= 0 ? 'selected' : '') + '>' + c.name + '</option>'; }).join('') + '</select></div>' : '') +
        '</div>';
    document.getElementById('promo-modal').classList.add('open');
    renderPromoSchedulePreview();
    setTimeout(function() {
        var focusEl = document.getElementById('promo-form-title');
        if (focusEl && !p) focusEl.focus();
    }, 80);
}

function closePromoPlanModal() {
    document.getElementById('promo-modal').classList.remove('open');
}

function savePromoPlan() {
    var title = (document.getElementById('promo-form-title') || {}).value || '';
    if (!title.trim()) { showToast('프로모션명을 입력해주세요.', 'warning'); return; }
    var startDate = document.getElementById('promo-form-start').value;
    var endDate = document.getElementById('promo-form-end').value;
    if (!startDate || !endDate) { showToast('시작일과 종료일을 입력해주세요.', 'warning'); return; }
    if (endDate < startDate) { showToast('종료일은 시작일 이후여야 합니다.', 'warning'); return; }
    var channels = [];
    document.querySelectorAll('#promo-form-channels input:checked').forEach(function(cb) { channels.push(cb.value); });
    if (!channels.length) { showToast('최소 1개 채널을 선택해주세요.', 'warning'); return; }
    var campaignSel = document.getElementById('promo-form-campaign');
    var campaignIds = campaignSel && campaignSel.value ? [campaignSel.value] : [];
    var payload = {
        title: title.trim(),
        type: document.getElementById('promo-form-type').value,
        status: document.getElementById('promo-form-status').value,
        startDate: startDate,
        endDate: endDate,
        owner: document.getElementById('promo-form-owner').value,
        budget: parseInt(document.getElementById('promo-form-budget').value, 10) || 0,
        channels: channels,
        memo: document.getElementById('promo-form-memo').value,
        campaignIds: campaignIds,
        kpi: {
            targetSent: parseFloat(document.getElementById('promo-kpi-targetSent').value) || 0,
            targetOpenRate: parseFloat(document.getElementById('promo-kpi-targetOpenRate').value) || 0,
            targetConversion: parseFloat(document.getElementById('promo-kpi-targetConversion').value) || 0,
            targetRoas: parseFloat(document.getElementById('promo-kpi-targetRoas').value) || 0,
            targetRevenue: parseFloat(document.getElementById('promo-kpi-targetRevenue').value) || 0,
            actualSent: 0, actualOpened: 0, actualConverted: 0, actualRevenue: 0, actualRoas: 0, inputAt: null,
        },
    };
    var isNew = !promoModalState.editId;
    if (promoModalState.editId) {
        var idx = promoPlans.findIndex(function(x) { return x.id === promoModalState.editId; });
        if (idx >= 0) {
            payload.id = promoModalState.editId;
            payload.kpi.actualSent = promoPlans[idx].kpi.actualSent;
            payload.kpi.actualOpened = promoPlans[idx].kpi.actualOpened;
            payload.kpi.actualConverted = promoPlans[idx].kpi.actualConverted;
            payload.kpi.actualRevenue = promoPlans[idx].kpi.actualRevenue;
            payload.kpi.actualRoas = promoPlans[idx].kpi.actualRoas;
            payload.kpi.inputAt = promoPlans[idx].kpi.inputAt;
            promoPlans[idx] = payload;
        }
    } else {
        payload.id = 'pp-' + Date.now();
        promoPlans.unshift(payload);
    }
    persistPromoPlans();
    closePromoPlanModal();
    promoActivePlanId = payload.id;
    promoCalendarCursor = parsePromoDate(payload.startDate);
    crmActiveTab = 'calendar';
    if (App.currentView === 'view-crm') {
        switchCrmTab('calendar');
        renderPromoCalendar();
        renderPromoPlanSidebar(payload.id);
    }
    addActivityLog({ userId: App.currentUserId, action: isNew ? '프로모션 일정 등록' : '프로모션 수정', category: 'crm', type: 'success', detail: payload.title, meta: payload.startDate + ' ~ ' + payload.endDate });
    showToast('캘린더에「' + payload.title + '」일정이 ' + (isNew ? '등록' : '저장') + '되었습니다. (데모)', 'success');
}

function deletePromoPlan() {
    if (!promoModalState.editId) return;
    promoPlans = promoPlans.filter(function(p) { return p.id !== promoModalState.editId; });
    persistPromoPlans();
    closePromoPlanModal();
    promoActivePlanId = null;
    if (App.currentView === 'view-crm') initCrmView();
    showToast('프로모션이 삭제되었습니다.', 'warning');
}

function renderPromoKpiPanel() {
    var summaryEl = document.getElementById('promo-kpi-summary');
    var listEl = document.getElementById('promo-kpi-list');
    if (!listEl) return;
    var active = promoPlans.filter(function(p) { return p.status === 'active'; }).length;
    var planning = promoPlans.filter(function(p) { return p.status === 'planning'; }).length;
    var totalTarget = promoPlans.reduce(function(s, p) { return s + (p.kpi.targetRevenue || 0); }, 0);
    var totalActual = promoPlans.reduce(function(s, p) { return s + (p.kpi.actualRevenue || 0); }, 0);
    var overallPct = getPromoKpiPct(totalActual, totalTarget);
    if (summaryEl) {
        summaryEl.innerHTML = [
            ['진행 중', active + '건', '활성 프로모션'],
            ['기획 중', planning + '건', '준비 단계'],
            ['목표 매출', formatDataHubWon(totalTarget), '전체 합계'],
            ['달성률', overallPct + '%', formatDataHubWon(totalActual) + ' 실적'],
        ].map(function(k) {
            return '<div class="glass rounded-xl p-4"><p class="text-[10px] text-gray-500">' + k[0] + '</p><p class="text-xl font-extrabold">' + k[1] + '</p><p class="text-[10px] text-gray-600">' + k[2] + '</p></div>';
        }).join('');
    }
    listEl.innerHTML = promoPlans.map(function(p) {
        var st = PROMO_STATUS_OPTIONS[p.status] || PROMO_STATUS_OPTIONS.planning;
        var revPct = getPromoKpiPct(p.kpi.actualRevenue, p.kpi.targetRevenue);
        var convPct = getPromoKpiPct(p.kpi.actualConverted, p.kpi.targetSent ? Math.round(p.kpi.targetSent * p.kpi.targetConversion / 100) : 0);
        var sel = promoActivePlanId === p.id ? ' ring-1 ring-primary/40' : '';
        return '<div class="glass rounded-xl p-5 mb-4' + sel + '" id="promo-kpi-card-' + p.id + '">' +
            '<div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">' +
            '<div><div class="flex items-center gap-2 mb-1"><span class="text-[10px] font-bold px-2 py-0.5 rounded ' + st[1] + '">' + st[0] + '</span>' +
            '<span class="text-[10px] text-gray-500">' + p.startDate + ' ~ ' + p.endDate + '</span></div>' +
            '<h4 class="font-bold text-base">' + p.title + '</h4>' +
            '<p class="text-[10px] text-gray-500 mt-0.5">' + (getMember(p.owner).name || '') + ' · 예산 ' + App.formatWon(p.budget) + ' · ' + p.channels.join(', ') + '</p></div>' +
            '<div class="flex gap-2"><button onclick="openPromoPlanModal(\'' + p.id + '\')" class="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/40">기획 수정</button>' +
            '<button onclick="selectPromoPlan(\'' + p.id + '\')" class="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/40">선택</button></div></div>' +
            '<div class="grid grid-cols-1 lg:grid-cols-2 gap-5">' +
            '<div><p class="text-xs font-bold text-gray-400 mb-3">목표 KPI</p>' +
            '<div class="space-y-2 text-xs">' +
            [['발송', fmtCount(p.kpi.targetSent), '건'], ['오픈율', p.kpi.targetOpenRate, '%'], ['전환율', p.kpi.targetConversion, '%'], ['ROAS', p.kpi.targetRoas, 'x'], ['매출', formatDataHubWon(p.kpi.targetRevenue), '']].map(function(k) {
                return '<div class="flex justify-between p-2 rounded bg-dark/40"><span class="text-gray-500">' + k[0] + ' 목표</span><span class="font-bold">' + k[1] + k[2] + '</span></div>';
            }).join('') + '</div></div>' +
            '<div><p class="text-xs font-bold text-primary mb-3">결과값 입력</p>' +
            '<div class="grid grid-cols-2 gap-2 mb-3">' +
            [['actualSent', '발송', p.kpi.actualSent], ['actualOpened', '오픈', p.kpi.actualOpened], ['actualConverted', '전환', p.kpi.actualConverted], ['actualRevenue', '매출(원)', p.kpi.actualRevenue], ['actualRoas', 'ROAS', p.kpi.actualRoas]].map(function(k) {
                return '<div><label class="text-[10px] text-gray-500">' + k[1] + '</label><input type="number" id="promo-result-' + p.id + '-' + k[0] + '" class="settings-input text-sm" step="any" value="' + k[2] + '" onchange="updatePromoResultField(\'' + p.id + '\',\'' + k[0] + '\',this.value)"></div>';
            }).join('') + '</div>' +
            '<button onclick="savePromoResults(\'' + p.id + '\')" class="text-xs px-4 py-2 rounded-lg bg-primary text-white hover:bg-blue-600 mb-3">결과 저장</button>' +
            (p.kpi.inputAt ? '<p class="text-[10px] text-gray-600 mb-2">마지막 입력: ' + p.kpi.inputAt + '</p>' : '') +
            '<p class="text-[10px] font-bold text-gray-400 mb-1">매출 달성률</p>' +
            '<div class="promo-kpi-bar mb-1"><div class="promo-kpi-bar-fill ' + getPromoKpiBarClass(revPct) + '" style="width:' + Math.min(100, revPct) + '%"></div></div>' +
            '<p class="text-xs text-gray-400">' + revPct + '% 달성 · 전환 ' + convPct + '%</p></div></div></div>';
    }).join('') || '<p class="text-sm text-gray-500 text-center py-12">프로모션 KPI 데이터가 없습니다. 캘린더에서 일정을 등록하세요.</p>';
}

function updatePromoResultField(planId, field, value) {
    var p = promoPlans.find(function(x) { return x.id === planId; });
    if (p) p.kpi[field] = parseFloat(value) || 0;
}

function savePromoResults(planId) {
    var p = promoPlans.find(function(x) { return x.id === planId; });
    if (!p) return;
    ['actualSent', 'actualOpened', 'actualConverted', 'actualRevenue', 'actualRoas'].forEach(function(f) {
        var inp = document.getElementById('promo-result-' + planId + '-' + f);
        if (inp) p.kpi[f] = parseFloat(inp.value) || 0;
    });
    var now = new Date();
    p.kpi.inputAt = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    if (p.status === 'planning' && p.kpi.actualRevenue > 0) p.status = 'active';
    persistPromoPlans();
    renderPromoKpiPanel();
    addActivityLog({ userId: App.currentUserId, action: '프로모션 KPI 입력', category: 'crm', type: 'info', detail: p.title, meta: '매출 ' + formatDataHubWon(p.kpi.actualRevenue) });
    showToast('「' + p.title + '」결과값이 저장되었습니다.', 'success');
}

// Build view templates
App.views['view-dashboard'] = () => {
    var m = getMockMetrics();
    return `
<div id="view-dashboard" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">
    <!-- Morning Briefing Banner -->
    <div class="glass rounded-2xl p-5 border-l-4 border-l-warning relative overflow-hidden">
        <div class="absolute right-0 top-0 w-48 h-48 bg-warning/5 rounded-full blur-3xl"></div>
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative">
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-[#fae100] flex items-center justify-center shrink-0 shadow-lg">
                    <svg class="w-7 h-7" viewBox="0 0 24 24" fill="#3C1E1E"><path d="M12 3c-4.97 0-9 3.58-9 8.01 0 2.15.87 4.1 2.3 5.52-.17 1.1-.78 2.22-.87 2.37-.1.15-.12.33-.06.5.06.16.2.28.37.3 1.66.22 3.26-.85 3.83-1.24.57.14 1.16.22 1.76.22 4.97 0 9-3.58 9-8.01S16.97 3 12 3z"/></svg>
                </div>
                <div>
                    <div class="flex items-center gap-2 mb-1">
                        <h2 class="font-bold text-base">오늘 아침 브리핑 발송 완료</h2>
                        <span class="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded font-bold">08:30 전송</span>
                        <span class="demo-pill">목업</span>
                    </div>
                    <p class="text-sm text-gray-400 leading-relaxed">어제 옴니채널 마진율 <strong class="text-white">${m.marginGlobal}%</strong> · 위험 재고 <strong class="text-danger">${m.atRiskInventory}건</strong> · 미처리 발주 <strong class="text-warning">${fmtCount(m.pendingShipments)}건</strong> — 카카오톡으로 전달됨</p>
                </div>
            </div>
            <button onclick="navigateTo('view-briefing')" class="shrink-0 text-sm font-semibold text-primary hover:text-white border border-primary/30 hover:border-primary px-4 py-2 rounded-lg transition-colors">브리핑 상세 보기 →</button>
        </div>
    </div>

    <!-- KPI Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        ${[
            { label: '옴니채널 통합 매출 (금일)', value: m.dailyRevenueFormatted, change: m.dailyRevenueChange, up: true, sub: App.globalDateRange.label + ' · 클릭→DB', spark: [18,22,20,28,25,32,35], drill: 'revenue' },
            { label: '통합 실시간 마진율', value: m.marginGlobal + '%', change: (m.marginUp ? '+' : '') + m.marginDelta + '%p', up: m.marginUp, sub: '목표 ' + m.targetMargin + '% · 클릭→분석', spark: [28,29,30,29,31,30,32], drill: 'margin' },
            { label: '이달 AI 예상 마감 매출', value: m.monthlyTargetFormatted, change: m.kpiPct + '%', up: true, sub: '목표 대비 · 클릭→월간DB', progress: m.kpiPct, drill: 'target' },
            { label: '미처리 액션', value: m.pendingActions + '건', change: '긴급 ' + m.urgentActions, up: false, sub: '클릭→발주대기', alert: true, drill: 'actions' },
        ].map(k => `
        <div class="glass rounded-xl kpi-card kpi-glow kpi-drill ${k.alert ? 'kpi-glow-danger border-l-4 border-l-warning' : ''}" onclick="drillDownKpi('${k.drill}')" title="클릭하여 상세 보기">
            <p class="kpi-label">${k.label}</p>
            <div class="kpi-body">
                <p class="kpi-value text-white">${k.value}</p>
                ${k.spark ? `<div class="kpi-spark-wrap"><canvas class="sparkline" data-spark="${k.spark.join(',')}"></canvas></div>` : ''}
            </div>
            ${k.progress ? `<div class="w-full bg-gray-800 rounded-full h-1.5 mt-2 mb-1"><div class="progress-bar bg-gradient-to-r from-primary to-accent h-1.5 rounded-full" style="width:${k.progress}%"></div></div>` : ''}
            <div class="kpi-footer">
                <span class="font-bold ${k.up ? 'text-success' : 'text-warning'}">${k.up ? '▲' : '●'} ${k.change}</span>
                <span class="text-gray-500">${k.sub}</span>
            </div>
        </div>`).join('')}
    </div>

    <!-- Charts + Alerts -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        <div class="glass rounded-xl p-4 xl:col-span-2 chart-card">
            <div class="chart-card-header">
                <div class="chart-card-title">
                    <h2 id="chart-period-title">${App.dashboardChartPeriod === 'monthly' ? '월간' : '주간'} 채널별 매출 & ROAS</h2>
                    <span class="chart-unit-badge">만 원</span>
                </div>
                <div class="flex bg-surface border border-border rounded-lg p-0.5 shrink-0" id="chart-period">
                    <button class="tab-btn ${App.dashboardChartPeriod === 'weekly' ? 'active' : ''} px-2.5 py-1 text-[11px] font-medium rounded-md ${App.dashboardChartPeriod !== 'weekly' ? 'text-gray-400' : ''}">주간</button>
                    <button class="tab-btn ${App.dashboardChartPeriod === 'monthly' ? 'active' : ''} px-2.5 py-1 text-[11px] font-medium rounded-md ${App.dashboardChartPeriod !== 'monthly' ? 'text-gray-400' : ''}">월간</button>
                </div>
            </div>
            <div class="chart-legend-row">
                <span class="chart-legend-item"><span class="chart-legend-dot" style="background:rgba(59,130,246,0.8)"></span>Cafe24</span>
                <span class="chart-legend-item"><span class="chart-legend-dot" style="background:rgba(16,185,129,0.8)"></span>스마트스토어</span>
                <span class="chart-legend-item"><span class="chart-legend-dot" style="background:rgba(249,115,22,0.8)"></span>쿠팡</span>
                <span class="chart-legend-item"><span class="chart-legend-dot" style="background:#a78bfa;border-radius:50%"></span>ROAS</span>
            </div>
            <div class="chart-canvas-wrap tall"><canvas id="multiChannelChart"></canvas></div>
        </div>

        <div class="glass rounded-xl p-4">
            <div class="chart-card-header mb-2">
                <div class="chart-card-title">
                    <h2>위험 재고 경보</h2>
                    <span class="chart-unit-badge text-danger border-danger/30 bg-danger/10">${m.atRiskInventory}건</span>
                </div>
            </div>
            <div class="space-y-2.5">
                ${App.inventory.filter(i => i.status !== 'safe').map(i => `
                <div class="p-3 rounded-lg bg-surface border border-border hover:border-danger/30 transition-colors cursor-pointer" onclick="navigateTo('view-inventory')">
                    <div class="flex justify-between items-start mb-1">
                        <p class="text-sm font-semibold truncate pr-2">${i.name}</p>
                        ${App.statusBadge(i.status)}
                    </div>
                    <div class="flex justify-between text-xs text-gray-500">
                        <span class="font-mono">${i.sku}</span>
                        <span>잔여 <strong class="${i.status==='critical'?'text-danger':'text-warning'}">${i.total}</strong> / 안전 ${i.safety}</span>
                    </div>
                    <div class="mt-2 w-full bg-gray-800 rounded-full h-1">
                        <div class="h-1 rounded-full ${i.status==='critical'?'bg-danger':'bg-warning'}" style="width:${Math.min(100,(i.total/i.safety)*100)}%"></div>
                    </div>
                </div>`).join('')}
            </div>
            <button onclick="navigateTo('view-inventory')" class="mt-3 text-xs text-primary font-semibold hover:underline text-center w-full">전체 재고 보기 →</button>
        </div>
    </div>

    <!-- Channel Status + Pipeline + CRM -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div class="glass rounded-xl p-4">
            <div class="chart-card-header mb-3">
                <h2 class="font-bold text-sm">채널 API 상태</h2>
            </div>
            <div class="space-y-3">
                ${App.apiChannels.map(c => `
                <div class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface transition-colors">
                    <span class="text-lg">${c.icon}</span>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium truncate">${c.name}</p>
                        <p class="text-[10px] text-gray-500">토큰 만료: ${c.tokenExpiry} · ${c.lastSync}</p>
                    </div>
                    <span class="status-dot ${c.status}"></span>
                </div>`).join('')}
            </div>
            <button onclick="navigateTo('view-api')" class="mt-3 text-xs text-primary font-semibold hover:underline">API 관리 →</button>
        </div>

        <div class="glass rounded-xl p-4">
            <div class="chart-card-header mb-2">
                <div class="chart-card-title">
                    <h2>라이브 데이터 파이프라인</h2>
                </div>
                <span class="text-[10px] font-mono bg-warning/10 text-warning px-2 py-0.5 rounded border border-warning/20 shrink-0">데모</span>
            </div>
            <div class="flex items-center gap-1 overflow-x-auto py-2 text-center">
                ${['Cron','API Sync','Parse','Firebase','카톡'].map((n,i) => `
                ${i>0?'<div class="w-6 h-0.5 bg-gray-700 relative shrink-0'+(i===1?' flow-line':'')+'"></div>':''}
                <div class="shrink-0 flex flex-col items-center gap-1">
                    <div class="w-10 h-10 rounded-lg ${i===1?'bg-primary/20 border-2 border-primary pulse-live':'bg-surface border border-border'} flex items-center justify-center text-[9px] font-bold ${i===1?'text-primary':'text-gray-400'}">${n}</div>
                </div>`).join('')}
            </div>
        </div>

        <div class="glass rounded-xl p-4 chart-card">
            <div class="chart-card-header">
                <div class="chart-card-title">
                    <h2>CRM 세그먼트</h2>
                    <span class="chart-unit-badge">124K · 재구매 42%</span>
                </div>
            </div>
            <div class="chart-canvas-wrap short relative">
                <canvas id="crmChart"></canvas>
                <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span class="text-lg font-bold">42%</span>
                    <span class="text-[9px] text-gray-500">재구매율</span>
                </div>
            </div>
            <div class="flex justify-center gap-3 mt-1 text-[10px] text-gray-400">
                <span class="chart-legend-item"><span class="chart-legend-dot" style="background:#3b82f6"></span>신규 45%</span>
                <span class="chart-legend-item"><span class="chart-legend-dot" style="background:#8b5cf6"></span>충성 35%</span>
                <span class="chart-legend-item"><span class="chart-legend-dot" style="background:#10b981"></span>이탈 20%</span>
            </div>
        </div>
    </div>

    <!-- Recent Orders -->
    <div class="glass rounded-xl overflow-hidden">
        <div class="p-4 border-b border-border flex justify-between items-center">
            <h2 class="font-bold text-sm">실시간 주문 피드</h2>
            <button onclick="navigateTo('view-orders')" class="text-xs text-primary font-semibold hover:underline">전체 보기 →</button>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="text-gray-500 text-xs border-b border-border">
                    <tr><th class="px-5 py-3 text-left font-medium">주문번호</th><th class="px-5 py-3 text-left font-medium">채널</th><th class="px-5 py-3 text-left font-medium">상품</th><th class="px-5 py-3 text-right font-medium">금액</th><th class="px-5 py-3 text-center font-medium">상태</th><th class="px-5 py-3 text-right font-medium">시간</th></tr>
                </thead>
                <tbody class="divide-y divide-border">
                    ${App.orders.slice(0,5).map(o => `
                    <tr class="table-row">
                        <td class="px-5 py-3 font-mono text-xs text-gray-400">${o.id}</td>
                        <td class="px-5 py-3">${App.channelBadge(o.channel)}</td>
                        <td class="px-5 py-3 text-gray-300 truncate max-w-[200px]">${o.product}</td>
                        <td class="px-5 py-3 text-right font-mono font-medium">${App.formatWon(o.amount)}</td>
                        <td class="px-5 py-3 text-center">${App.statusBadge(o.status)}</td>
                        <td class="px-5 py-3 text-right text-xs text-gray-500">${o.time}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
    </div>
</div>`;
};

App.views['view-datahub'] = () => `
<div id="view-datahub" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">
    <div class="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <h2 class="text-xl font-bold">누적 데이터 DB</h2>
                <span class="text-[10px] font-mono bg-primary/15 text-blue-400 px-2 py-0.5 rounded border border-primary/25">SOURCE DB</span>
            </div>
            <p class="text-sm text-gray-400">Firebase 적재 원천 데이터 · 일/주/월/연 누적 지표 분석 및보내기</p>
        </div>
        <div class="flex flex-wrap gap-2">
            <button onclick="exportDataHub('csv')" class="text-xs font-semibold px-3 py-2 rounded-lg bg-surface border border-border hover:border-primary/40 transition-colors flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                CSV
            </button>
            <button onclick="exportDataHub('pdf')" class="text-xs font-semibold px-3 py-2 rounded-lg bg-surface border border-border hover:border-primary/40 transition-colors flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                PDF
            </button>
            <button onclick="exportDataHub('xlsx')" class="text-xs font-semibold px-3 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white transition-colors flex items-center gap-1.5 shadow-lg shadow-primary/20">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                Excel
            </button>
        </div>
    </div>

    <!-- DB Status Bar -->
    <div class="glass rounded-xl p-4 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-2">
            <span class="status-dot live pulse-live"></span>
            <span class="font-semibold text-success">동기화 정상</span>
        </div>
        <div class="h-4 w-px bg-border hide-mobile"></div>
        <div><span class="text-gray-500">저장소</span> <span class="font-mono text-gray-300 ml-1">${App.dataHubMeta.storage}</span></div>
        <div><span class="text-gray-500">총 레코드</span> <span class="font-mono font-bold text-white ml-1">${App.dataHubMeta.totalRows.toLocaleString()}</span></div>
        <div><span class="text-gray-500">보존 기간</span> <span class="font-mono text-gray-300 ml-1">${App.dataHubMeta.retention}</span></div>
        <div class="ml-auto"><span class="text-gray-500">마지막 적재</span> <span class="font-mono text-gray-300 ml-1">${App.dataHubMeta.lastIngest}</span></div>
    </div>

    <!-- Period + Channel Filters -->
    <div class="glass rounded-xl p-4 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex bg-surface border border-border rounded-lg p-0.5" id="datahub-period-tabs">
                ${[['daily','일간'],['weekly','주간'],['monthly','월간'],['yearly','연간']].map(function(p) {
                    return "<button onclick=\"setDataHubPeriod('" + p[0] + "')\" data-dh-period=\"" + p[0] + "\" class=\"datahub-period-btn tab-btn px-3 py-1.5 text-xs font-semibold rounded-md " + (dataHubFilter.period === p[0] ? 'active' : 'text-gray-400') + "\">" + p[1] + "</button>";
                }).join('')}
            </div>
            <div class="flex flex-wrap gap-1.5" id="datahub-channel-tabs">
                ${App.dataHubChannels.map(function(c) {
                    return "<button onclick=\"setDataHubChannel('" + c.id + "')\" data-dh-channel=\"" + c.id + "\" class=\"datahub-channel-btn text-[10px] px-2.5 py-1 rounded-md border border-border " + (dataHubFilter.channel === c.id ? 'active' : 'bg-surface hover:border-primary/30') + "\">" + c.name + "</button>";
                }).join('')}
            </div>
        </div>
    </div>

    <!-- KPI Summary -->
    <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3" id="datahub-kpis"></div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div class="glass rounded-xl p-4 lg:col-span-2 chart-card">
            <div class="chart-card-header">
                <div class="chart-card-title">
                    <h2 id="datahub-chart-title">매출 추이</h2>
                    <span class="chart-unit-badge" id="datahub-chart-unit">원</span>
                </div>
            </div>
            <div class="chart-legend-row">
                <span class="chart-legend-item"><span class="chart-legend-dot" style="background:rgba(59,130,246,0.8)"></span>매출</span>
                <span class="chart-legend-item"><span class="chart-legend-dot" style="background:rgba(16,185,129,0.8)"></span>주문건수</span>
            </div>
            <div class="chart-canvas-wrap tall"><canvas id="dataHubTrendChart"></canvas></div>
        </div>
        <div class="glass rounded-xl p-4 chart-card">
            <div class="chart-card-header">
                <div class="chart-card-title">
                    <h2>채널별 매출 비중</h2>
                    <span class="chart-unit-badge" id="datahub-pie-period">일간</span>
                </div>
            </div>
            <div class="chart-canvas-wrap short"><canvas id="dataHubChannelChart"></canvas></div>
            <div class="space-y-2 mt-2" id="datahub-channel-legend"></div>
        </div>
    </div>

    <!-- Analysis Insight -->
    <div class="glass rounded-xl p-4 border-l-4 border-l-primary" id="datahub-insight"></div>

    <!-- Raw Data Table -->
    <div class="glass rounded-xl overflow-hidden">
        <div class="p-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
                <h3 class="font-bold text-sm">원천 집계 테이블</h3>
                <p class="text-[10px] text-gray-500 mt-0.5" id="datahub-table-desc">기간별 · 채널별 누적 스냅샷 (목업 DB)</p>
            </div>
            <div class="flex items-center gap-2">
                <input type="text" placeholder="기간·채널 검색..." oninput="filterDataHubTable(this.value)" class="bg-dark border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-primary w-40">
                <span class="text-[10px] text-gray-500 font-mono" id="datahub-row-count">0건</span>
            </div>
        </div>
        <div class="overflow-x-auto max-h-[400px] overflow-y-auto">
            <table class="w-full text-sm db-table">
                <thead class="text-gray-500 text-xs border-b border-border">
                    <tr>
                        <th class="px-4 py-3 text-left font-medium"><button type="button" class="db-sort-btn" data-sort="period" data-label="기간" onclick="sortDataHub('period')">기간</button></th>
                        <th class="px-4 py-3 text-left font-medium"><button type="button" class="db-sort-btn" data-sort="channel" data-label="채널" onclick="sortDataHub('channel')">채널</button></th>
                        <th class="px-4 py-3 text-right font-medium"><button type="button" class="db-sort-btn" data-sort="revenue" data-label="매출" onclick="sortDataHub('revenue')">매출</button></th>
                        <th class="px-4 py-3 text-right font-medium"><button type="button" class="db-sort-btn" data-sort="orders" data-label="주문" onclick="sortDataHub('orders')">주문</button></th>
                        <th class="px-4 py-3 text-right font-medium">객단가</th>
                        <th class="px-4 py-3 text-right font-medium"><button type="button" class="db-sort-btn" data-sort="margin" data-label="마진율" onclick="sortDataHub('margin')">마진율</button></th>
                        <th class="px-4 py-3 text-right font-medium">신규고객</th>
                        <th class="px-4 py-3 text-right font-medium">반품률</th>
                        <th class="px-4 py-3 text-right font-medium"><button type="button" class="db-sort-btn" data-sort="mom" data-label="MoM" onclick="sortDataHub('mom')">MoM</button></th>
                        <th class="px-4 py-3 text-right font-medium"><button type="button" class="db-sort-btn" data-sort="yoy" data-label="YoY" onclick="sortDataHub('yoy')">YoY</button></th>
                        <th class="px-4 py-3 text-right font-medium"><button type="button" class="db-sort-btn" data-sort="growth" data-label="전기대비" onclick="sortDataHub('growth')">전기대비</button></th>
                    </tr>
                </thead>
                <tbody id="datahub-tbody"></tbody>
            </table>
        </div>
    </div>
</div>`;

App.views['view-briefing'] = () => `
<div id="view-briefing" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
            <h2 class="text-xl font-bold">데일리 카카오 브리핑</h2>
            <p class="text-sm text-gray-400 mt-1">매일 08:30 자동 발송 · 구성 항목은 localStorage 저장 <span class="demo-pill">데모</span></p>
        </div>
        <div class="flex gap-2">
            <button onclick="showToast('테스트 브리핑을 발송했습니다. (데모)', 'success')" class="text-xs font-semibold px-4 py-2 rounded-lg border border-border hover:bg-surface transition-colors">테스트 발송</button>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div class="glass rounded-xl p-6 flex flex-col items-center justify-center min-h-[480px]">
            <p class="text-xs text-gray-500 mb-4 self-start">오늘 발송될 브리핑 미리보기 (설정 반영)</p>
            <div class="w-full max-w-[300px]">
                <div class="bg-[#b2c7d9] rounded-t-2xl px-4 py-2 flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-gray-400"></div>
                    <span class="text-sm font-bold text-gray-800">${App.brandName}</span>
                </div>
                <div class="bg-[#a8c5d8] p-3 rounded-b-2xl">
                    <div class="bg-white rounded-2xl overflow-hidden shadow-lg">
                        <div class="bg-[#fae100] px-4 py-2 text-xs font-bold text-gray-800">알림톡 도착</div>
                        <div class="p-4">
                            <p class="text-xs text-gray-400 mb-1">${App.brandName} 데일리 리포트</p>
                            <p class="text-sm font-bold text-gray-900 mb-3">📊 옴니채널 브리핑</p>
                            <div class="text-xs text-gray-700 space-y-2 leading-relaxed" id="briefing-preview-body"></div>
                            <button class="w-full mt-4 bg-[#fae100] text-gray-900 text-xs font-bold py-2.5 rounded-lg" onclick="navigateTo('view-dashboard')">대시보드 바로가기</button>
                        </div>
                    </div>
                    <p class="text-[10px] text-gray-600 text-right mt-1">오전 8:30</p>
                </div>
            </div>
        </div>

        <div class="space-y-5">
            <div class="glass rounded-xl p-5">
                <h3 class="font-bold text-sm mb-4">브리핑 구성 항목 <span class="text-[10px] text-gray-500 font-normal">클릭하여 ON/OFF</span></h3>
                <div class="space-y-3" id="briefing-config-list"></div>
            </div>
            <div class="glass rounded-xl p-5">
                <h3 class="font-bold text-sm mb-3">발송 이력</h3>
                <div class="space-y-2 text-sm">
                    ${['07.10 (금) 08:30','07.09 (목) 08:30','07.08 (수) 08:30','07.07 (화) 08:30'].map((d,i) => `
                    <div class="flex justify-between items-center p-2.5 rounded-lg hover:bg-surface">
                        <span class="text-gray-300">${d}</span>
                        <span class="text-[10px] ${i===0?'text-success':'text-gray-500'} font-bold">${i===0?'오늘':'발송 완료 ✓'}</span>
                    </div>`).join('')}
                </div>
            </div>
        </div>
    </div>
</div>`;

App.views['view-orders'] = () => {
    var m = getMockMetrics();
    var p = m.pipeline;
    return `
<div id="view-orders" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
            <h2 class="text-xl font-bold">옴니채널 주문 · 발주 파이프라인</h2>
            <p class="text-sm text-gray-400 mt-1">전 채널 주문 수집 · WMS 자동 발주 연동 <span class="demo-pill">데모</span></p>
        </div>
        <button onclick="syncOrdersDemo()" class="text-sm font-semibold px-4 py-2 rounded-lg bg-surface border border-border hover:border-primary/50 flex items-center gap-2 transition-colors">
            <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            수동 동기화
        </button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" id="orders-pipeline-kpi">
        ${[
            { label: '금일 수집 주문', value: fmtCount(p.collected), color: 'border-t-gray-500' },
            { label: '발주 대기', value: fmtCount(p.pending), color: 'border-t-warning' },
            { label: '처리 중', value: fmtCount(p.processing), color: 'border-t-primary' },
            { label: '출고 완료', value: fmtCount(p.shipped), color: 'border-t-success' },
        ].map(s => `
        <div class="glass rounded-xl p-5 border-t-2 ${s.color}">
            <p class="text-xs text-gray-400 mb-1">${s.label}</p>
            <p class="text-3xl font-extrabold">${s.value}<span class="text-sm font-normal text-gray-500 ml-1">건</span></p>
        </div>`).join('')}
    </div>

    <div class="glass rounded-xl overflow-hidden">
        <div class="p-4 border-b border-border flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div class="flex gap-2 flex-wrap">
                ${['전체','발주대기','처리중','출고완료'].map((f,i) => `
                <button class="text-xs px-3 py-1.5 rounded-lg font-medium ${i===0?'bg-primary text-white':'bg-surface text-gray-400 hover:text-white border border-border'}" onclick="filterOrders('${f}')">${f}</button>`).join('')}
            </div>
            <input type="text" placeholder="주문번호 · 상품명 검색..." class="bg-dark border border-border rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-primary w-full sm:w-64" oninput="searchOrders(this.value)">
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm" id="orders-table">
                <thead class="text-gray-500 text-xs border-b border-border bg-surface/50">
                    <tr>
                        <th class="px-5 py-3 text-left"><input type="checkbox" class="rounded"></th>
                        <th class="px-5 py-3 text-left font-medium">주문번호</th>
                        <th class="px-5 py-3 text-left font-medium">채널</th>
                        <th class="px-5 py-3 text-left font-medium">상품명</th>
                        <th class="px-5 py-3 text-right font-medium">결제금액</th>
                        <th class="px-5 py-3 text-center font-medium">상태</th>
                        <th class="px-5 py-3 text-right font-medium">수집시간</th>
                        <th class="px-5 py-3 text-center font-medium">액션</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border" id="orders-tbody"></tbody>
            </table>
        </div>
        <div class="p-4 border-t border-border flex justify-between items-center text-xs text-gray-500">
            <span>총 ${fmtCount(p.collected)}건 중 ${m.ordersSampleCount}건 표시 (샘플)</span>
            <div class="flex gap-1">
                <button class="px-2.5 py-1 rounded bg-surface border border-border">‹</button>
                <button class="px-2.5 py-1 rounded bg-primary text-white">1</button>
                <button class="px-2.5 py-1 rounded bg-surface border border-border">2</button>
                <button class="px-2.5 py-1 rounded bg-surface border border-border">›</button>
            </div>
        </div>
    </div>
</div>`;
};

App.views['view-inventory'] = () => {
    var m = getMockMetrics();
    return `
<div id="view-inventory" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
            <h2 class="text-xl font-bold">통합 WMS 재고 관제</h2>
            <p class="text-sm text-gray-400 mt-1">채널별 재고 할당 · 안전 재고 모니터링 · 자동 발주 제안 <span class="demo-pill">데모</span></p>
        </div>
        <button onclick="showToast('발주 제안서를 생성했습니다. (데모)', 'success')" class="text-sm font-semibold px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white transition-colors">발주 제안서 생성</button>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        ${[
            { label: '전체 SKU', value: String(m.totalSku), icon: '📦' },
            { label: '위험 재고', value: String(m.atRiskInventory), icon: '⚠️', danger: true },
            { label: '이번 주 예상 소진', value: '14 SKU', icon: '📉' },
        ].map(s => `
        <div class="glass rounded-xl p-5 flex items-center gap-4 ${s.danger?'border border-danger/30':''}">
            <span class="text-2xl">${s.icon}</span>
            <div>
                <p class="text-xs text-gray-400">${s.label}</p>
                <p class="text-2xl font-extrabold ${s.danger?'text-danger':''}">${s.value}</p>
            </div>
        </div>`).join('')}
    </div>

    <div class="glass rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="text-gray-500 text-xs border-b border-border bg-surface/50">
                    <tr>
                        <th class="px-5 py-3 text-left font-medium">SKU</th>
                        <th class="px-5 py-3 text-left font-medium">상품명</th>
                        <th class="px-5 py-3 text-center font-medium">총 가용</th>
                        <th class="px-5 py-3 text-center font-medium">Cafe24</th>
                        <th class="px-5 py-3 text-center font-medium">스마트스토어</th>
                        <th class="px-5 py-3 text-center font-medium">쿠팡</th>
                        <th class="px-5 py-3 text-center font-medium">에이블리</th>
                        <th class="px-5 py-3 text-center font-medium">안전재고</th>
                        <th class="px-5 py-3 text-center font-medium">상태</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border">
                    ${App.inventory.map(i => `
                    <tr class="table-row ${i.status!=='safe'?'bg-danger/5':''}">
                        <td class="px-5 py-4 font-mono text-xs text-gray-400">${i.sku}</td>
                        <td class="px-5 py-4 font-medium">${i.name}</td>
                        <td class="px-5 py-4 text-center font-bold ${i.status==='critical'?'text-danger':i.status==='warning'?'text-warning':'text-white'}">${i.total}</td>
                        <td class="px-5 py-4 text-center text-gray-400">${i.cafe24}</td>
                        <td class="px-5 py-4 text-center text-gray-400">${i.smartstore}</td>
                        <td class="px-5 py-4 text-center text-gray-400">${i.coupang}</td>
                        <td class="px-5 py-4 text-center text-gray-400">${i.ably}</td>
                        <td class="px-5 py-4 text-center text-gray-500">${i.safety}</td>
                        <td class="px-5 py-4 text-center">${App.statusBadge(i.status)}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
    </div>
</div>`;
};

App.views['view-crm'] = () => `
<div id="view-crm" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
            <h2 class="text-xl font-bold">프로모션 · CRM 캠페인 빌더</h2>
            <p class="text-sm text-gray-400 mt-1">A/B 테스트 · 캠페인 복제 · 프로모션 캘린더 · KPI 기획/성과 <span class="demo-pill">데모</span></p>
        </div>
        <div class="flex gap-2">
            <button onclick="exportCrmAudience(null)" class="text-xs font-semibold px-3 py-2 rounded-lg bg-surface border border-border hover:border-primary/40 transition-colors">명단 CSV</button>
            <button onclick="openPromoPlanModal()" class="text-xs font-semibold px-3 py-2 rounded-lg bg-surface border border-border hover:border-primary/40 transition-colors">+ 프로모션</button>
            <button onclick="openCrmWizard()" class="text-sm font-bold px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/20 transition-colors">+ 새 캠페인</button>
        </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3" id="crm-stats"></div>

    <div class="flex gap-1 border-b border-border">
        <button class="crm-tab-btn active" data-tab="builder" onclick="switchCrmTab('builder')">캠페인 빌더</button>
        <button class="crm-tab-btn" data-tab="calendar" onclick="switchCrmTab('calendar')">프로모션 캘린더</button>
        <button class="crm-tab-btn" data-tab="kpi" onclick="switchCrmTab('kpi')">기획 · KPI</button>
    </div>

    <div id="crm-panel-builder">
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-5 min-h-[560px]">
        <!-- Audience Builder -->
        <div class="glass rounded-xl p-5 xl:col-span-4 flex flex-col">
            <h3 class="font-bold text-sm mb-1">타겟 오디언스 빌더</h3>
            <p class="text-[10px] text-gray-500 mb-4">필터 변경 시 타겟 수 실시간 재계산</p>
            <div class="space-y-3 flex-1">
                ${Object.keys(CRM_AUDIENCE_OPTIONS).map(function(key, idx) {
                    var labels = ['구매 이력', '누적 금액', '관심 카테고리'];
                    return '<div class="p-3 rounded-lg bg-surface border border-border">' +
                        '<label class="text-xs text-gray-500 mb-1.5 block">' + labels[idx] + '</label>' +
                        '<select class="w-full bg-dark border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" onchange="onCrmFilterChange(\'' + key + '\', this.value)">' +
                        CRM_AUDIENCE_OPTIONS[key].map(function(opt, i) {
                            return '<option value="' + i + '" ' + (crmAudienceFilter[key] === i ? 'selected' : '') + '>' + opt + '</option>';
                        }).join('') + '</select></div>';
                }).join('')}
            </div>
            <div class="mt-4 pt-4 border-t border-border">
                <div class="flex justify-between items-end mb-2">
                    <p class="text-sm text-gray-400">예상 타겟</p>
                    <p class="text-2xl font-extrabold text-white" id="crm-audience-count">—</p>
                </div>
                <div class="crm-audience-bar mb-3"><div class="crm-audience-bar-fill" id="crm-audience-bar" style="width:0%"></div></div>
                <div id="crm-audience-segments" class="mb-4"></div>
                <button onclick="extractCrmAudience()" class="w-full text-sm font-semibold px-4 py-2.5 rounded-lg bg-surface border border-border hover:border-primary transition-colors">명단 추출</button>
            </div>
        </div>

        <!-- Preview + Campaign list + Detail -->
        <div class="xl:col-span-8 space-y-5 flex flex-col">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1">
                <div class="glass rounded-xl p-5">
                    <h3 class="font-bold text-sm mb-4">알림톡 라이브 프리뷰</h3>
                    <div id="crm-live-preview" class="min-h-[220px] flex items-center justify-center"></div>
                </div>
                <div class="glass rounded-xl p-5 flex flex-col">
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="font-bold text-sm">캠페인 목록</h3>
                        <span class="text-[10px] text-gray-500">${crmData ? crmData.length : 0}건</span>
                    </div>
                    <div class="space-y-2 flex-1 overflow-y-auto max-h-[280px] pr-1" id="crm-campaign-list"></div>
                </div>
            </div>
            <div class="glass rounded-xl p-5">
                <h3 class="font-bold text-sm mb-3">캠페인 상세 · A/B · 액션</h3>
                <div id="crm-campaign-detail"></div>
            </div>
        </div>
    </div>
    </div>

    <div id="crm-panel-calendar" class="hidden space-y-5">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div class="flex gap-1 p-1 rounded-lg bg-surface border border-border">
                <button class="promo-cal-mode-btn text-xs px-3 py-1.5 rounded-md font-semibold active" data-mode="week" onclick="setPromoCalendarMode('week')">주간</button>
                <button class="promo-cal-mode-btn text-xs px-3 py-1.5 rounded-md font-semibold" data-mode="month" onclick="setPromoCalendarMode('month')">월간</button>
            </div>
            <div class="flex items-center gap-3">
                <button onclick="shiftPromoCalendar(-1)" class="p-2 rounded-lg border border-border hover:border-primary/40 text-gray-400 hover:text-white transition-colors">◀</button>
                <span class="text-sm font-bold min-w-[140px] text-center" id="promo-calendar-title">2026년 7월</span>
                <button onclick="shiftPromoCalendar(1)" class="p-2 rounded-lg border border-border hover:border-primary/40 text-gray-400 hover:text-white transition-colors">▶</button>
            </div>
            <button onclick="openPromoScheduleModal()" class="text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-white hover:bg-blue-600 transition-colors">+ 일정 등록</button>
        </div>
        <div class="glass rounded-xl p-4">
            <div id="promo-calendar-grid"></div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div class="lg:col-span-2 glass rounded-xl p-5" id="promo-calendar-events-list"></div>
            <div id="promo-plan-detail-sidebar"></div>
        </div>
    </div>

    <div id="crm-panel-kpi" class="hidden space-y-5">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3" id="promo-kpi-summary"></div>
        <div id="promo-kpi-list"></div>
    </div>
</div>`;

App.views['view-profit'] = () => {
    var m = getMockMetrics();
    return `
<div id="view-profit" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">
    <div><h2 class="text-xl font-bold">AI 수익성 분석</h2><p class="text-sm text-gray-400 mt-1">채널별 마진 · 광고 ROAS · AI 인사이트 <span class="demo-pill">설정 연동</span></p></div>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        ${[
            ['이번 달 순이익', m.netProfitFormatted, '+18.3%'],
            ['평균 마진율', m.marginGlobal + '%', (m.marginUp ? '+' : '') + m.marginDelta + '%p'],
            ['광고 ROAS', m.avgRoas + 'x', '목표 ' + getSettings().kpi.targetRoas + 'x'],
            ['AI 절감 제안', m.aiSavingsFormatted, '광고비 최적화'],
        ].map(([l,v,c])=>`
        <div class="glass rounded-xl p-5"><p class="text-xs text-gray-400 mb-1">${l}</p><p class="text-2xl font-extrabold mb-1">${v}</p><p class="text-xs text-gray-500">${c}</p></div>`).join('')}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div class="glass rounded-xl p-4 lg:col-span-2 chart-card">
            <div class="chart-card-header">
                <div class="chart-card-title">
                    <h2>광고 지출 vs 순이익</h2>
                    <span class="chart-unit-badge">최근 30일 · 만 원</span>
                </div>
            </div>
            <div class="chart-legend-row">
                <span class="chart-legend-item"><span class="chart-legend-dot" style="background:rgba(239,68,68,0.7)"></span>광고 지출</span>
                <span class="chart-legend-item"><span class="chart-legend-dot" style="background:rgba(16,185,129,0.7)"></span>순이익</span>
            </div>
            <div class="chart-canvas-wrap tall"><canvas id="profitChart"></canvas></div>
        </div>
        <div class="glass rounded-xl p-4 chart-card">
            <div class="chart-card-header">
                <div class="chart-card-title">
                    <h2>채널별 마진율</h2>
                    <span class="chart-unit-badge">%</span>
                </div>
            </div>
            <div class="chart-canvas-wrap short"><canvas id="marginChart"></canvas></div>
            <div class="p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p class="text-xs font-bold text-primary mb-1">🤖 AI 인사이트</p>
                <p class="text-xs text-gray-300 leading-relaxed">쿠팡 마진율 <strong class="text-danger">${Math.abs(parseFloat(m.coupangDrop))}%p ${parseFloat(m.coupangDrop) < 0 ? '하락' : '상승'}</strong>. 메타 광고 예산 15% 재배분 시 월 <strong class="text-success">${m.aiSavingsFormatted}</strong> 절감 예상.</p>
            </div>
        </div>
    </div>
</div>`;
};

App.views['view-api'] = () => `
<div id="view-api" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div><h2 class="text-xl font-bold">API 연동 상태 모니터링</h2><p class="text-sm text-gray-400 mt-1">토큰 만료 사전 갱신 · 무중단 모니터링</p></div>
        <div class="flex items-center gap-2 px-3 py-1.5 bg-success/10 border border-success/20 rounded-lg">
            <span class="status-dot live pulse-live"></span><span class="text-xs font-semibold text-success">3개 정상 · 1개 주의</span>
        </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        ${App.apiChannels.map(c => `
        <div class="glass rounded-xl p-5 border-l-4 ${c.status==='live'?'border-l-success':'border-l-warning'}">
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3"><span class="text-2xl">${c.icon}</span><div><h3 class="font-bold">${c.name}</h3><p class="text-xs text-gray-500">금일 ${c.orders}건</p></div></div>
                <span class="badge ${c.status==='live'?'bg-success/20 text-success':'bg-warning/20 text-warning'}">${c.status==='live'?'정상':'주의'}</span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="p-3 rounded-lg bg-surface"><p class="text-[10px] text-gray-500">토큰 만료</p><p class="font-semibold ${c.status==='warn'?'text-warning':''}">${c.tokenExpiry}</p></div>
                <div class="p-3 rounded-lg bg-surface"><p class="text-[10px] text-gray-500">마지막 동기화</p><p class="font-semibold">${c.lastSync}</p></div>
            </div>
            ${c.status==='warn'?'<div class="mt-3 p-3 rounded-lg bg-warning/10 border border-warning/20 text-xs text-warning">⚡ 자동 갱신 예약됨</div>':''}
        </div>`).join('')}
    </div>
</div>`;

App.views['view-workflow'] = () => `
<div id="view-workflow" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">
    <div><h2 class="text-xl font-bold">자동화 워크플로우 엔진</h2><p class="text-sm text-gray-400 mt-1">n8n 기반 백그라운드 파이프라인</p></div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        ${[['활성 워크플로우','5'],['이번 달 실행','4,441'],['절감 공수','~42h']].map(([l,v])=>`
        <div class="glass rounded-xl p-5 text-center"><p class="text-xs text-gray-400">${l}</p><p class="text-3xl font-extrabold my-1">${v}</p></div>`).join('')}
    </div>
    <div class="space-y-3">
        ${App.workflows.map(w => `
        <div class="glass rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 ${w.status==='active'?'border-l-success':'border-l-gray-600'}">
            <div><h3 class="font-bold ${w.status!=='active'?'text-gray-500':''}">${w.name}</h3><p class="text-xs text-gray-500">${w.desc}</p></div>
            <div class="flex gap-6 text-xs text-center">
                <div><p class="text-gray-500">실행</p><p class="font-bold font-mono">${w.runs.toLocaleString()}</p></div>
                <div><p class="text-gray-500">성공률</p><p class="font-bold text-success">${w.success}%</p></div>
                <div><p class="text-gray-500">마지막</p><p class="font-bold">${w.lastRun}</p></div>
            </div>
        </div>`).join('')}
    </div>
</div>`;

App.views['view-activity'] = () => `
<div id="view-activity" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
            <h2 class="text-xl font-bold">관리자 활동 이력</h2>
            <p class="text-sm text-gray-400 mt-1">팀원별 대시보드 활동 · 감사(Audit) 로그</p>
        </div>
        <button onclick="exportActivityCSV()" class="text-xs font-semibold px-4 py-2 rounded-lg bg-surface border border-border hover:border-primary/50 transition-colors flex items-center gap-2">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            CSV보내기
        </button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        ${[
            ['오늘 활동', App.activityLogs.filter(l => l.date === '2026-07-10').length + '건', '4명 활동 중'],
            ['주의 필요', App.activityLogs.filter(l => l.type === 'warning' || l.type === 'danger').length + '건', '재고·광고·API'],
            ['최다 활동', '박서연', '주문·동기화 3건'],
            ['마지막 활동', '5분 전', '김지현 · 로그인'],
        ].map(([l, v, s]) => `
        <div class="glass rounded-xl p-4">
            <p class="text-[11px] text-gray-500 mb-1">${l}</p>
            <p class="text-xl font-extrabold">${v}</p>
            <p class="text-[10px] text-gray-600 mt-1">${s}</p>
        </div>`).join('')}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        <!-- 필터 사이드 -->
        <div class="glass rounded-xl p-4 lg:col-span-1 space-y-4">
            <h3 class="font-bold text-sm">필터</h3>
            <div>
                <p class="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">팀원</p>
                <div class="space-y-1" id="activity-user-filters">
                    <button onclick="filterActivity('user','all')" data-af="user-all" class="activity-filter active w-full text-left px-3 py-2 rounded-lg text-xs bg-primary/15 text-blue-400 border border-primary/25">전체 팀원</button>
                    ${App.teamMembers.map(m => `
                    <button onclick="filterActivity('user','${m.id}')" data-af="user-${m.id}" class="activity-filter w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-surface border border-transparent flex items-center gap-2">
                        <span class="w-6 h-6 rounded-full bg-gradient-to-br ${m.color} flex items-center justify-center text-[9px] font-bold text-white">${m.avatar}</span>
                        <span>${m.name} <span class="text-gray-500">(${m.role})</span></span>
                    </button>`).join('')}
                </div>
            </div>
            <div>
                <p class="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">카테고리</p>
                <div class="flex flex-wrap gap-1.5" id="activity-cat-filters">
                    <button onclick="filterActivity('cat','all')" data-af="cat-all" class="activity-filter-cat active text-[10px] px-2.5 py-1 rounded-md bg-surface border border-border">전체</button>
                    ${Object.entries(App.activityCategories).map(([k, v]) => `
                    <button onclick="filterActivity('cat','${k}')" data-af="cat-${k}" class="activity-filter-cat text-[10px] px-2.5 py-1 rounded-md bg-surface border border-border hover:border-primary/30">${v.icon} ${v.label}</button>`).join('')}
                </div>
            </div>
            <div>
                <p class="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">검색</p>
                <input type="text" placeholder="활동 내용 검색..." oninput="filterActivitySearch(this.value)" class="w-full bg-dark border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary">
            </div>
        </div>

        <!-- 타임라인 -->
        <div class="glass rounded-xl p-5 lg:col-span-3">
            <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-sm">활동 타임라인</h3>
                <span class="text-[10px] text-gray-500" id="activity-count">${App.activityLogs.length}건</span>
            </div>
            <div class="activity-timeline max-h-[520px] overflow-y-auto pr-2" id="activity-timeline"></div>
        </div>
    </div>
</div>`;

App.views['view-archive'] = () => `
<div id="view-archive" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <h2 class="text-xl font-bold">스마트 자료실</h2>
                <span class="text-[10px] font-mono bg-accent/15 text-purple-300 px-2 py-0.5 rounded border border-accent/25">CLOUD DRIVE</span>
            </div>
            <p class="text-sm text-gray-400">업무 파일 저장 · 공유 · 태그 검색 · 즐겨찾기 · 버전 관리</p>
        </div>
        <div class="flex gap-2">
            <label class="text-xs font-semibold px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white cursor-pointer shadow-lg shadow-primary/20 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                파일 업로드
                <input type="file" multiple class="hidden" id="archive-file-input" onchange="handleArchiveUpload(this.files)">
            </label>
        </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3" id="archive-stats"></div>

    <div class="archive-dropzone p-6 text-center" id="archive-dropzone"
         ondragover="event.preventDefault();this.classList.add('dragover')"
         ondragleave="this.classList.remove('dragover')"
         ondrop="handleArchiveDrop(event)">
        <svg class="w-10 h-10 mx-auto text-accent/60 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
        <p class="text-sm text-gray-300 font-medium">파일을 여기에 드래그하거나 클릭하여 업로드</p>
        <p class="text-[10px] text-gray-500 mt-1">PDF · Excel · 이미지 · ZIP · 최대 5MB (목업)</p>
    </div>

    <div class="glass rounded-xl p-4">
        <div class="flex flex-col sm:flex-row gap-3 mb-4">
            <input type="text" placeholder="파일명·태그 검색..." oninput="filterArchiveFiles(this.value)" class="flex-1 bg-dark border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-accent">
            <div class="flex flex-wrap gap-1.5" id="archive-cat-filters"></div>
        </div>
        <div class="flex gap-2 mb-4">
            <button onclick="setArchiveSort('recent')" data-asort="recent" class="archive-sort-btn text-[10px] px-2.5 py-1 rounded-md border border-border bg-surface">최신순</button>
            <button onclick="setArchiveSort('name')" data-asort="name" class="archive-sort-btn text-[10px] px-2.5 py-1 rounded-md border border-border">이름순</button>
            <button onclick="setArchiveSort('downloads')" data-asort="downloads" class="archive-sort-btn text-[10px] px-2.5 py-1 rounded-md border border-border">다운로드순</button>
            <button onclick="setArchiveFilterPinned()" id="archive-pinned-only" class="text-[10px] px-2.5 py-1 rounded-md border border-border ml-auto">⭐ 즐겨찾기만</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3" id="archive-file-grid"></div>
    </div>
</div>`;

App.views['view-comms'] = () => `
<div id="view-comms" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
            <h2 class="text-xl font-bold">팀 커뮤니케이션</h2>
            <p class="text-sm text-gray-400 mt-1">부서별 아젠다 · 업무 요청 · 회신 · 체크리스트</p>
        </div>
        <button onclick="openNewCommsRequest()" class="text-xs font-semibold px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/20 flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            새 요청
        </button>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3" id="comms-stats"></div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div class="lg:col-span-1 space-y-4">
            <div class="glass rounded-xl p-4">
                <h3 class="font-bold text-sm mb-3">부서 · 담당자</h3>
                <div class="space-y-1" id="comms-dept-filters"></div>
            </div>
            <div class="glass rounded-xl p-4">
                <h3 class="font-bold text-sm mb-3">이번 주 아젠다</h3>
                <div class="space-y-2 max-h-[280px] overflow-y-auto" id="comms-agenda-list"></div>
                <button onclick="addCommsAgenda()" class="text-[10px] text-primary hover:underline mt-3">+ 아젠다 추가</button>
            </div>
        </div>
        <div class="glass rounded-xl p-4 lg:col-span-1">
            <div class="flex justify-between items-center mb-3">
                <h3 class="font-bold text-sm">요청 · 협업 스레드</h3>
                <span class="text-[10px] text-gray-500" id="comms-thread-count">0건</span>
            </div>
            <div class="space-y-2 max-h-[520px] overflow-y-auto" id="comms-thread-list"></div>
        </div>
        <div class="glass rounded-xl p-4 lg:col-span-1" id="comms-detail-panel">
            <p class="text-sm text-gray-500 text-center py-16">스레드를 선택하세요</p>
        </div>
    </div>
</div>`;

App.views['view-settings'] = () => `
<div id="view-settings" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
            <h2 class="text-xl font-bold">설정</h2>
            <p class="text-sm text-gray-400 mt-1">마진율 · KPI · 광고비 · 재고 · 판매처 · 광고매체 커스터마이징</p>
        </div>
        <div class="flex gap-2">
            <button onclick="resetAllSettings()" class="text-xs font-semibold px-3 py-2 rounded-lg border border-border hover:bg-surface transition-colors">초기화</button>
            <button onclick="saveAllSettings()" class="text-xs font-semibold px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/20 transition-colors">전체 저장</button>
        </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        <div class="glass rounded-xl p-3 lg:col-span-1 space-y-1" id="settings-tabs"></div>
        <div class="glass rounded-xl p-5 lg:col-span-3" id="settings-panel"></div>
    </div>
</div>`;

function renderOrders(data) {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;
    tbody.innerHTML = data.map(o => {
        var actionLabel = o.status === 'pending' ? '발주 처리' : o.status === 'processing' ? '출고 완료' : '완료';
        var actionClass = o.status === 'shipped' ? 'text-gray-500 cursor-default' : 'text-primary hover:underline';
        var actionClick = o.status === 'shipped' ? '' : "processOrder('" + o.id + "')";
        return `
    <tr class="table-row">
        <td class="px-5 py-3"><input type="checkbox" class="rounded"></td>
        <td class="px-5 py-3 font-mono text-xs text-gray-400">${o.id}</td>
        <td class="px-5 py-3">${App.channelBadge(o.channel)}</td>
        <td class="px-5 py-3 text-gray-300">${o.product}</td>
        <td class="px-5 py-3 text-right font-mono">${App.formatWon(o.amount)}</td>
        <td class="px-5 py-3 text-center">${App.statusBadge(o.status)}</td>
        <td class="px-5 py-3 text-right text-xs text-gray-500">${o.time}</td>
        <td class="px-5 py-3 text-center"><button onclick="${actionClick}" class="text-xs ${actionClass}">${actionLabel}</button></td>
    </tr>`;
    }).join('');
}
function filterOrders(f) { const m={발주대기:'pending',처리중:'processing',출고완료:'shipped'}; renderOrders(f==='전체'?App.orders:App.orders.filter(o=>o.status===m[f])); }
function searchOrders(q) { const l=q.toLowerCase(); renderOrders(App.orders.filter(o=>o.id.toLowerCase().includes(l)||o.product.toLowerCase().includes(l))); }
function openView(targetId, title, group) {
    document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
    var nav = document.querySelector('[data-target="' + targetId + '"]');
    if (nav) nav.classList.add('active');
    if (title !== undefined) updateBreadcrumb(title, group || null);
    switchView(targetId);
    if (window.innerWidth < 768) toggleMobileSidebar();
}

function navigateTo(t) {
    var b = document.querySelector('[data-target="' + t + '"]');
    if (b) { b.click(); return; }
    var meta = {
        'view-archive': { title: '스마트 자료실', group: null },
        'view-datahub': { title: '누적 데이터 DB', group: '매일 보는 리포트' },
        'view-settings': { title: '설정', group: '관리' },
        'view-activity': { title: '활동 이력', group: '관리' },
    };
    if (meta[t]) openView(t, meta[t].title, meta[t].group);
}
function goHome() { navigateTo('view-dashboard'); }

function openAdminLink(name, url) {
    showToast(name + ' 페이지를 엽니다.', 'info');
    window.open(url, '_blank', 'noopener,noreferrer');
}

var SETTINGS_STORAGE_KEY = 'omnisync_settings_v1';
var settingsActiveTab = 'kpi';
App.settings = null;

function getSettingsDefaults() {
    return {
        kpi: {
            monthlyRevenueTarget: 850000000,
            currentMonthlyRevenue: 637500000,
            dailyOrderTarget: 1500,
            targetMargin: 32,
            targetRoas: 3.5,
        },
        margins: {
            global: 31.8,
            cafe24: 38.2,
            smartstore: 34.5,
            coupang: 24.3,
            ably: 31.7,
        },
        adBudget: {
            monthlyTotal: 15000000,
        },
        inventory: {
            defaultSafetyDays: 14,
            defaultReorderPoint: 50,
            defaultLeadTimeDays: 7,
            autoAlertEnabled: true,
        },
        channels: [
            { id: 'cafe24', name: 'Cafe24', url: 'https://eclogin.cafe24.com/Shop/', apiConnected: true, weight: 32, active: true },
            { id: 'smartstore', name: '스마트스토어', url: 'https://sell.smartstore.naver.com/', apiConnected: true, weight: 28, active: true },
            { id: 'coupang', name: '쿠팡', url: 'https://wing.coupang.com/', apiConnected: true, weight: 25, active: true },
            { id: 'ably', name: '에이블리', url: 'https://seller.a-bly.com/', apiConnected: true, weight: 15, active: true },
        ],
        adMedia: [
            { id: 'ad-1', name: 'Meta Ads', type: 'SNS', dailyBudget: 500000, roasTarget: 3.0, active: true },
            { id: 'ad-2', name: 'Google Ads', type: '검색', dailyBudget: 350000, roasTarget: 3.2, active: true },
            { id: 'ad-3', name: '네이버 검색광고', type: '검색', dailyBudget: 400000, roasTarget: 2.8, active: true },
            { id: 'ad-4', name: '쿠팡 광고', type: '마켓', dailyBudget: 250000, roasTarget: 2.5, active: true },
        ],
        inventoryItems: App.inventory.map(function(i) {
            return { sku: i.sku, name: i.name, safety: i.safety, leadTime: 7 };
        }),
    };
}

function getSettings() {
    if (!App.settings) loadSettings();
    return App.settings;
}

function loadSettings() {
    try {
        var raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (raw) {
            App.settings = Object.assign(getSettingsDefaults(), JSON.parse(raw));
            return;
        }
    } catch (e) { /* ignore */ }
    App.settings = getSettingsDefaults();
}

function persistSettings() {
    try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(App.settings));
    } catch (e) {
        showToast('설정 저장에 실패했습니다.', 'danger');
    }
    syncSettingsToApp();
    refreshDemoUI();
}

function syncSettingsToApp() {
    var s = getSettings();
    App.dataHubChannels = [{ id: 'all', name: '전체', weight: 1 }].concat(
        s.channels.filter(function(c) { return c.active; }).map(function(c) {
            return { id: c.id, name: c.name, weight: c.weight / 100 };
        })
    );
    s.inventoryItems.forEach(function(item) {
        var inv = App.inventory.find(function(i) { return i.sku === item.sku; });
        if (inv) inv.safety = item.safety;
    });
}

function resetAllSettings() {
    if (!confirm('모든 설정을 기본값으로 초기화할까요?')) return;
    App.settings = getSettingsDefaults();
    persistSettings();
    showToast('설정이 초기화되었습니다.', 'success');
    if (App.currentView === 'view-settings') initSettingsView();
    refreshMetricsViews();
}

function saveAllSettings() {
    collectSettingsFromForm();
    persistSettings();
    showToast('설정이 저장되었습니다.', 'success');
    refreshMetricsViews();
}

function collectSettingsFromForm() {
    var s = getSettings();
    var g = function(id) { var el = document.getElementById(id); return el ? el.value : null; };

    if (settingsActiveTab === 'kpi' || document.getElementById('set-kpi-monthly')) {
        s.kpi.monthlyRevenueTarget = parseInt(g('set-kpi-monthly'), 10) || s.kpi.monthlyRevenueTarget;
        s.kpi.currentMonthlyRevenue = parseInt(g('set-kpi-current'), 10) || s.kpi.currentMonthlyRevenue;
        s.kpi.dailyOrderTarget = parseInt(g('set-kpi-daily-orders'), 10) || s.kpi.dailyOrderTarget;
        s.kpi.targetMargin = parseFloat(g('set-kpi-margin')) || s.kpi.targetMargin;
        s.kpi.targetRoas = parseFloat(g('set-kpi-roas')) || s.kpi.targetRoas;
    }
    if (settingsActiveTab === 'margins' || document.getElementById('set-margin-global')) {
        s.margins.global = parseFloat(g('set-margin-global')) || s.margins.global;
        s.margins.cafe24 = parseFloat(g('set-margin-cafe24')) || s.margins.cafe24;
        s.margins.smartstore = parseFloat(g('set-margin-smartstore')) || s.margins.smartstore;
        s.margins.coupang = parseFloat(g('set-margin-coupang')) || s.margins.coupang;
        s.margins.ably = parseFloat(g('set-margin-ably')) || s.margins.ably;
    }
    if (settingsActiveTab === 'adbudget' || document.getElementById('set-ad-monthly')) {
        s.adBudget.monthlyTotal = parseInt(g('set-ad-monthly'), 10) || s.adBudget.monthlyTotal;
    }
    if (settingsActiveTab === 'inventory' || document.getElementById('set-inv-safety-days')) {
        s.inventory.defaultSafetyDays = parseInt(g('set-inv-safety-days'), 10) || s.inventory.defaultSafetyDays;
        s.inventory.defaultReorderPoint = parseInt(g('set-inv-reorder'), 10) || s.inventory.defaultReorderPoint;
        s.inventory.defaultLeadTimeDays = parseInt(g('set-inv-leadtime'), 10) || s.inventory.defaultLeadTimeDays;
        s.inventory.autoAlertEnabled = document.getElementById('set-inv-alert') ? document.getElementById('set-inv-alert').checked : s.inventory.autoAlertEnabled;
        document.querySelectorAll('[data-inv-sku]').forEach(function(row) {
            var sku = row.dataset.invSku;
            var item = s.inventoryItems.find(function(i) { return i.sku === sku; });
            if (!item) return;
            var safetyEl = row.querySelector('[data-inv-safety]');
            var leadEl = row.querySelector('[data-inv-lead]');
            if (safetyEl) item.safety = parseInt(safetyEl.value, 10) || item.safety;
            if (leadEl) item.leadTime = parseInt(leadEl.value, 10) || item.leadTime;
        });
    }
}

var SETTINGS_TABS = [
    { id: 'kpi', label: '목표 KPI', icon: '🎯' },
    { id: 'margins', label: '마진율', icon: '📊' },
    { id: 'adbudget', label: '광고비', icon: '💰' },
    { id: 'inventory', label: '재고 기준', icon: '📦' },
    { id: 'channels', label: '판매처', icon: '🏪' },
    { id: 'admedia', label: '광고 매체', icon: '📢' },
];

function setSettingsTab(tab) {
    collectSettingsFromForm();
    settingsActiveTab = tab;
    renderSettingsTabs();
    renderSettingsPanel();
}

function initSettingsView() {
    renderSettingsTabs();
    renderSettingsPanel();
}

function renderSettingsTabs() {
    var el = document.getElementById('settings-tabs');
    if (!el) return;
    el.innerHTML = SETTINGS_TABS.map(function(t) {
        return '<button onclick="setSettingsTab(\'' + t.id + '\')" class="settings-tab-btn w-full text-left px-3 py-2.5 rounded-lg text-sm border border-transparent flex items-center gap-2 ' + (settingsActiveTab === t.id ? 'active' : 'hover:bg-surface') + '"><span>' + t.icon + '</span><span>' + t.label + '</span></button>';
    }).join('');
}

function renderSettingsPanel() {
    var el = document.getElementById('settings-panel');
    if (!el) return;
    var s = getSettings();
    var html = '';

    if (settingsActiveTab === 'kpi') {
        html = '<h3 class="font-bold text-sm mb-4">목표 KPI 설정</h3><div class="space-y-4">' +
            '<div class="settings-row">' +
                '<div><label class="settings-label">월 매출 목표 (원)</label><input id="set-kpi-monthly" type="number" class="settings-input" value="' + s.kpi.monthlyRevenueTarget + '"></div>' +
                '<div><label class="settings-label">현재 월 누적 매출 (원)</label><input id="set-kpi-current" type="number" class="settings-input" value="' + s.kpi.currentMonthlyRevenue + '"></div>' +
            '</div>' +
            '<div class="settings-row">' +
                '<div><label class="settings-label">일일 주문 목표 (건)</label><input id="set-kpi-daily-orders" type="number" class="settings-input" value="' + s.kpi.dailyOrderTarget + '"></div>' +
                '<div><label class="settings-label">목표 마진율 (%)</label><input id="set-kpi-margin" type="number" step="0.1" class="settings-input" value="' + s.kpi.targetMargin + '"></div>' +
            '</div>' +
            '<div class="settings-row">' +
                '<div><label class="settings-label">목표 ROAS (배)</label><input id="set-kpi-roas" type="number" step="0.1" class="settings-input" value="' + s.kpi.targetRoas + '"></div>' +
                '<div class="flex items-end"><p class="text-xs text-gray-500 pb-2">대시보드 KPI 카드에 즉시 반영됩니다.</p></div>' +
            '</div>' +
            '<button onclick="saveAllSettings()" class="text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-white">KPI 저장</button></div>';
    }

    if (settingsActiveTab === 'margins') {
        html = '<h3 class="font-bold text-sm mb-4">채널별 마진율 (%)</h3><div class="space-y-4">' +
            '<div class="settings-row"><div><label class="settings-label">통합 마진율</label><input id="set-margin-global" type="number" step="0.1" class="settings-input" value="' + s.margins.global + '"></div><div><label class="settings-label">Cafe24</label><input id="set-margin-cafe24" type="number" step="0.1" class="settings-input" value="' + s.margins.cafe24 + '"></div></div>' +
            '<div class="settings-row"><div><label class="settings-label">스마트스토어</label><input id="set-margin-smartstore" type="number" step="0.1" class="settings-input" value="' + s.margins.smartstore + '"></div><div><label class="settings-label">쿠팡</label><input id="set-margin-coupang" type="number" step="0.1" class="settings-input" value="' + s.margins.coupang + '"></div></div>' +
            '<div class="settings-row"><div><label class="settings-label">에이블리</label><input id="set-margin-ably" type="number" step="0.1" class="settings-input" value="' + s.margins.ably + '"></div><div></div></div>' +
            '<button onclick="saveAllSettings()" class="text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-white">마진율 저장</button></div>';
    }

    if (settingsActiveTab === 'adbudget') {
        var dailySum = s.adMedia.filter(function(a) { return a.active; }).reduce(function(sum, a) { return sum + a.dailyBudget; }, 0);
        html = '<h3 class="font-bold text-sm mb-4">광고비 설정</h3><div class="space-y-4">' +
            '<div class="settings-row"><div><label class="settings-label">월 광고 예산 총액 (원)</label><input id="set-ad-monthly" type="number" class="settings-input" value="' + s.adBudget.monthlyTotal + '"></div>' +
            '<div><label class="settings-label">일 예산 합계 (자동)</label><input type="text" class="settings-input text-gray-400" readonly value="' + App.formatWon(dailySum) + '/일"></div></div>' +
            '<p class="text-xs text-gray-500">광고 매체 탭에서 매체별 일 예산을 수정할 수 있습니다.</p>' +
            '<button onclick="saveAllSettings()" class="text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-white">광고비 저장</button></div>';
    }

    if (settingsActiveTab === 'inventory') {
        html = '<h3 class="font-bold text-sm mb-4">재고 기준 설정</h3><div class="space-y-4">' +
            '<div class="settings-row">' +
                '<div><label class="settings-label">기본 안전재고 일수</label><input id="set-inv-safety-days" type="number" class="settings-input" value="' + s.inventory.defaultSafetyDays + '"></div>' +
                '<div><label class="settings-label">기본 재주문 시점 (개)</label><input id="set-inv-reorder" type="number" class="settings-input" value="' + s.inventory.defaultReorderPoint + '"></div>' +
            '</div>' +
            '<div class="settings-row">' +
                '<div><label class="settings-label">기본 리드타임 (일)</label><input id="set-inv-leadtime" type="number" class="settings-input" value="' + s.inventory.defaultLeadTimeDays + '"></div>' +
                '<div class="flex items-center gap-2 pt-5"><input id="set-inv-alert" type="checkbox" class="rounded" ' + (s.inventory.autoAlertEnabled ? 'checked' : '') + '><label class="text-xs text-gray-400">재고 부족 자동 알림</label></div>' +
            '</div>' +
            '<h4 class="font-semibold text-xs text-gray-400 mt-2 mb-2">SKU별 안전재고</h4>' +
            '<div class="overflow-x-auto"><table class="w-full text-xs"><thead class="text-gray-500 border-b border-border"><tr><th class="py-2 text-left">SKU</th><th class="py-2 text-left">상품명</th><th class="py-2 text-right">안전재고</th><th class="py-2 text-right">리드타임(일)</th></tr></thead><tbody>' +
            s.inventoryItems.map(function(item) {
                return '<tr class="border-b border-border/50" data-inv-sku="' + item.sku + '"><td class="py-2 font-mono">' + item.sku + '</td><td class="py-2">' + item.name + '</td>' +
                    '<td class="py-2 text-right"><input data-inv-safety type="number" class="settings-input w-20 text-right ml-auto" value="' + item.safety + '"></td>' +
                    '<td class="py-2 text-right"><input data-inv-lead type="number" class="settings-input w-20 text-right ml-auto" value="' + item.leadTime + '"></td></tr>';
            }).join('') +
            '</tbody></table></div>' +
            '<button onclick="saveAllSettings()" class="text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-white mt-2">재고 설정 저장</button></div>';
    }

    if (settingsActiveTab === 'channels') {
        html = '<div class="flex justify-between items-center mb-4"><h3 class="font-bold text-sm">판매처 등록 · 관리</h3>' +
            '<button onclick="addSalesChannel()" class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/20 text-blue-400 border border-primary/30">+ 판매처 추가</button></div>' +
            '<div class="space-y-3" id="settings-channels-list">' +
            s.channels.map(function(ch, idx) {
                return '<div class="p-4 rounded-xl bg-surface border border-border space-y-3" data-channel-idx="' + idx + '">' +
                    '<div class="flex justify-between items-start gap-2">' +
                        '<div class="flex items-center gap-2"><span class="text-lg">' + (ch.active ? '🟢' : '⚫') + '</span><input data-ch-name type="text" class="settings-input font-semibold" value="' + ch.name + '"></div>' +
                        '<div class="flex gap-1 shrink-0">' +
                            '<button onclick="toggleChannelActive(' + idx + ')" class="text-[10px] px-2 py-1 rounded border border-border hover:border-primary/40">' + (ch.active ? '비활성' : '활성') + '</button>' +
                            '<button onclick="deleteSalesChannel(' + idx + ')" class="text-[10px] px-2 py-1 rounded border border-danger/30 text-danger hover:bg-danger/10">삭제</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="settings-row">' +
                        '<div><label class="settings-label">관리 URL</label><input data-ch-url type="url" class="settings-input" value="' + ch.url + '"></div>' +
                        '<div><label class="settings-label">매출 비중 (%)</label><input data-ch-weight type="number" class="settings-input" value="' + ch.weight + '"></div>' +
                    '</div>' +
                    '<p class="text-[10px] text-gray-600 font-mono">ID: ' + ch.id + ' · API ' + (ch.apiConnected ? '연동됨' : '미연동') + '</p>' +
                '</div>';
            }).join('') +
            '</div><button onclick="saveChannelsFromForm()" class="text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-white mt-4">판매처 저장</button>';
    }

    if (settingsActiveTab === 'admedia') {
        html = '<div class="flex justify-between items-center mb-4"><h3 class="font-bold text-sm">광고 매체 등록 · 관리</h3>' +
            '<button onclick="addAdMedia()" class="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/20 text-blue-400 border border-primary/30">+ 매체 추가</button></div>' +
            '<div class="space-y-3">' +
            s.adMedia.map(function(ad, idx) {
                return '<div class="p-4 rounded-xl bg-surface border border-border" data-ad-idx="' + idx + '">' +
                    '<div class="flex justify-between items-start gap-2 mb-3">' +
                        '<input data-ad-name type="text" class="settings-input font-semibold flex-1" value="' + ad.name + '">' +
                        '<div class="flex gap-1 shrink-0">' +
                            '<button onclick="toggleAdMediaActive(' + idx + ')" class="text-[10px] px-2 py-1 rounded border border-border">' + (ad.active ? 'ON' : 'OFF') + '</button>' +
                            '<button onclick="deleteAdMedia(' + idx + ')" class="text-[10px] px-2 py-1 rounded border border-danger/30 text-danger">삭제</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="settings-row">' +
                        '<div><label class="settings-label">유형</label><select data-ad-type class="settings-input"><option' + (ad.type === 'SNS' ? ' selected' : '') + '>SNS</option><option' + (ad.type === '검색' ? ' selected' : '') + '>검색</option><option' + (ad.type === '마켓' ? ' selected' : '') + '>마켓</option><option' + (ad.type === '기타' ? ' selected' : '') + '>기타</option></select></div>' +
                        '<div><label class="settings-label">일 예산 (원)</label><input data-ad-budget type="number" class="settings-input" value="' + ad.dailyBudget + '"></div>' +
                    '</div>' +
                    '<div class="settings-row mt-3">' +
                        '<div><label class="settings-label">목표 ROAS</label><input data-ad-roas type="number" step="0.1" class="settings-input" value="' + ad.roasTarget + '"></div>' +
                        '<div class="flex items-end"><p class="text-[10px] text-gray-500 pb-2">월 환산: ' + App.formatWon(ad.dailyBudget * 30) + '</p></div>' +
                    '</div>' +
                '</div>';
            }).join('') +
            '</div><button onclick="saveAdMediaFromForm()" class="text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-white mt-4">광고 매체 저장</button>';
    }

    el.innerHTML = html;
}

function saveChannelsFromForm() {
    var s = getSettings();
    document.querySelectorAll('[data-channel-idx]').forEach(function(row) {
        var idx = parseInt(row.dataset.channelIdx, 10);
        var ch = s.channels[idx];
        if (!ch) return;
        var nameEl = row.querySelector('[data-ch-name]');
        var urlEl = row.querySelector('[data-ch-url]');
        var weightEl = row.querySelector('[data-ch-weight]');
        if (nameEl) ch.name = nameEl.value.trim() || ch.name;
        if (urlEl) ch.url = urlEl.value.trim() || ch.url;
        if (weightEl) ch.weight = parseInt(weightEl.value, 10) || ch.weight;
    });
    persistSettings();
    showToast('판매처 설정이 저장되었습니다.', 'success');
}

function saveAdMediaFromForm() {
    var s = getSettings();
    document.querySelectorAll('[data-ad-idx]').forEach(function(row) {
        var idx = parseInt(row.dataset.adIdx, 10);
        var ad = s.adMedia[idx];
        if (!ad) return;
        var nameEl = row.querySelector('[data-ad-name]');
        var typeEl = row.querySelector('[data-ad-type]');
        var budgetEl = row.querySelector('[data-ad-budget]');
        var roasEl = row.querySelector('[data-ad-roas]');
        if (nameEl) ad.name = nameEl.value.trim() || ad.name;
        if (typeEl) ad.type = typeEl.value;
        if (budgetEl) ad.dailyBudget = parseInt(budgetEl.value, 10) || ad.dailyBudget;
        if (roasEl) ad.roasTarget = parseFloat(roasEl.value) || ad.roasTarget;
    });
    persistSettings();
    showToast('광고 매체 설정이 저장되었습니다.', 'success');
    if (settingsActiveTab === 'adbudget') renderSettingsPanel();
}

function addSalesChannel() {
    collectSettingsFromForm();
    var s = getSettings();
    var id = 'ch-' + Date.now();
    s.channels.push({ id: id, name: '신규 판매처', url: '', apiConnected: false, weight: 10, active: true });
    persistSettings();
    renderSettingsPanel();
    showToast('판매처가 추가되었습니다. 정보를 입력 후 저장하세요.', 'info');
}

function deleteSalesChannel(idx) {
    if (!confirm('이 판매처를 삭제할까요?')) return;
    collectSettingsFromForm();
    getSettings().channels.splice(idx, 1);
    persistSettings();
    renderSettingsPanel();
    showToast('판매처가 삭제되었습니다.', 'success');
}

function toggleChannelActive(idx) {
    collectSettingsFromForm();
    var ch = getSettings().channels[idx];
    if (ch) ch.active = !ch.active;
    persistSettings();
    renderSettingsPanel();
}

function addAdMedia() {
    collectSettingsFromForm();
    var s = getSettings();
    s.adMedia.push({ id: 'ad-' + Date.now(), name: '신규 광고 매체', type: '기타', dailyBudget: 100000, roasTarget: 3.0, active: true });
    persistSettings();
    renderSettingsPanel();
    showToast('광고 매체가 추가되었습니다.', 'info');
}

function deleteAdMedia(idx) {
    if (!confirm('이 광고 매체를 삭제할까요?')) return;
    collectSettingsFromForm();
    getSettings().adMedia.splice(idx, 1);
    persistSettings();
    renderSettingsPanel();
    showToast('광고 매체가 삭제되었습니다.', 'success');
}

function toggleAdMediaActive(idx) {
    collectSettingsFromForm();
    var ad = getSettings().adMedia[idx];
    if (ad) ad.active = !ad.active;
    persistSettings();
    renderSettingsPanel();
}

var ARCHIVE_STORAGE_KEY = 'omnisync_archive_v1';
var COMMS_STORAGE_KEY = 'omnisync_comms_v1';
var archiveFiles = [];
var archiveFilter = { search: '', category: 'all', pinnedOnly: false, sort: 'recent' };
var commsData = { threads: [], agenda: [], readIds: [] };
var commsFilter = { dept: 'all', member: 'all' };
var commsActiveThreadId = null;

var ARCHIVE_CATEGORIES = {
    all: { label: '전체', icon: '📂' },
    contract: { label: '계약서', icon: '📝' },
    report: { label: '리포트', icon: '📊' },
    manual: { label: '매뉴얼', icon: '📖' },
    marketing: { label: '마케팅', icon: '🎯' },
    inventory: { label: '재고', icon: '📦' },
    etc: { label: '기타', icon: '📎' },
};

function getArchiveDefaults() {
    return [
        { id: 'f1', name: '2026_하반기_사업계획서.pdf', category: 'report', ext: 'pdf', size: 2457600, tags: ['전략', '2026'], pinned: true, uploadedBy: 'kim', uploadedAt: '2026-07-01', downloads: 12, version: 'v2.1', mockContent: '(주)SAMPLE 2026 하반기 사업계획서\n\n1. 옴니채널 매출 목표: 8.5억\n2. 신규 채널: 지그재그 검토\n3. 마진율 목표: 32%' },
        { id: 'f2', name: '7월_옴니채널_매출리포트.xlsx', category: 'report', ext: 'xlsx', size: 1843200, tags: ['매출', '7월'], pinned: true, uploadedBy: 'park', uploadedAt: '2026-07-08', downloads: 28, version: 'v1.0', mockContent: 'Date,Channel,Revenue,Orders\n2026-07-01,Cafe24,3200000,428\n2026-07-01,Smartstore,2800000,312' },
        { id: 'f3', name: '상품촬영_가이드라인.pdf', category: 'marketing', ext: 'pdf', size: 5242880, tags: ['촬영', '브랜드'], pinned: false, uploadedBy: 'lee', uploadedAt: '2026-06-15', downloads: 8, version: 'v3.0', mockContent: '상품 촬영 가이드라인\n- 배경: 화이트/뉴트럴\n- 해상도: 2000x2000 이상' },
        { id: 'f4', name: '재고실사_체크리스트.xlsx', category: 'inventory', ext: 'xlsx', size: 512000, tags: ['재고', 'WMS'], pinned: false, uploadedBy: 'park', uploadedAt: '2026-07-05', downloads: 15, version: 'v1.2', mockContent: 'SKU,Name,Expected,Actual,Diff\nSKU-COS-001,히트세럼,24,24,0' },
        { id: 'f5', name: 'Cafe24_API_연동매뉴얼.pdf', category: 'manual', ext: 'pdf', size: 3145728, tags: ['API', 'Cafe24'], pinned: false, uploadedBy: 'kim', uploadedAt: '2026-05-20', downloads: 6, version: 'v1.5', mockContent: 'Cafe24 Enterprise API 연동 매뉴얼\nOAuth 2.0 인증 절차...' },
        { id: 'f6', name: '여름시즌_알림톡_템플릿.zip', category: 'marketing', ext: 'zip', size: 8388608, tags: ['CRM', '알림톡'], pinned: false, uploadedBy: 'lee', uploadedAt: '2026-06-28', downloads: 4, version: 'v1.0', mockContent: 'PK\x03\x04 여름시즌 알림톡 템플릿 패키지 (목업)' },
    ];
}

function getCommsDefaults() {
    return {
        threads: [
            { id: 't1', type: 'request', from: 'kim', to: 'park', dept: '운영팀', title: '에이블리 송장 184건 일괄 전송', body: '에이블리 채널 미처리 송장 184건 금일 중 일괄 전송 부탁드립니다. Wing 연동 확인 후 처리해주세요.', status: 'progress', priority: 'high', due: '2026-07-10', createdAt: '2026-07-10 09:15', unread: true, replies: [
                { id: 'r1', userId: 'park', text: '확인했습니다. 14:00까지 120건 처리 완료 예정입니다.', time: '2026-07-10 09:32' },
                { id: 'r2', userId: 'kim', text: '감사합니다. 나머지는 내일 오전까지 진행해주세요.', time: '2026-07-10 10:05' },
            ]},
            { id: 't2', type: 'request', from: 'lee', to: 'choi', dept: 'CS팀', title: '스마트스토어 CS 템플릿 업데이트', body: '여름 시즌 오프 프로모션 관련 CS 응대 템플릿 3종 업데이트 필요합니다. 첨부 가이드 참고 부탁드립니다.', status: 'request', priority: 'normal', due: '2026-07-11', createdAt: '2026-07-10 11:20', unread: true, replies: [] },
            { id: 't3', type: 'agenda', from: 'park', to: 'all', dept: '운영팀', title: '주간 재고 실사 결과 공유', body: '금주 재고 실사 결과를 자료실에 업로드했습니다. 품절 임박 2건 확인 — 발주 요청 드립니다.', status: 'done', priority: 'normal', due: '2026-07-09', createdAt: '2026-07-09 16:45', unread: false, replies: [
                { id: 'r3', userId: 'kim', text: '발주 승인했습니다. Cafe24 우선 보충 진행해주세요.', time: '2026-07-09 17:10' },
            ]},
            { id: 't4', type: 'request', from: 'kim', to: 'lee', dept: '마케팅', title: '쿠팡 채널 ROAS 개선안 검토', body: '쿠팡 마진율 4.2%p 하락. Meta 광고 예산 재배분안 검토 후 수요일 회의 전 공유 부탁합니다.', status: 'progress', priority: 'high', due: '2026-07-12', createdAt: '2026-07-10 14:00', unread: true, replies: [
                { id: 'r4', userId: 'lee', text: '데이터 분석 중입니다. Meta 15% 감액 + 네이버 10% 증액안 초안 작성 중.', time: '2026-07-10 15:30' },
            ]},
            { id: 't5', type: 'check', from: 'choi', to: 'park', dept: '운영팀', title: '에이블리 API 토큰 갱신 확인', body: '에이블리 OAuth 토큰 7일 후 만료 예정. 자동 갱신 워크플로우 동작 확인 부탁드립니다.', status: 'hold', priority: 'normal', due: '2026-07-15', createdAt: '2026-07-10 08:00', unread: false, replies: [] },
        ],
        agenda: [
            { id: 'a1', date: '2026-07-10', dept: '운영팀', title: '에이블리 송장 일괄 처리', owner: 'park', done: false },
            { id: 'a2', date: '2026-07-10', dept: '마케팅', title: 'Meta 광고 예산 재배분안', owner: 'lee', done: false },
            { id: 'a3', date: '2026-07-11', dept: 'CS팀', title: 'CS 템플릿 업데이트', owner: 'choi', done: false },
            { id: 'a4', date: '2026-07-11', dept: '대표', title: '주간 옴니채널 리뷰 미팅', owner: 'kim', done: false },
            { id: 'a5', date: '2026-07-09', dept: '운영팀', title: '주간 재고 실사', owner: 'park', done: true },
        ],
        readIds: [],
    };
}

function loadArchive() {
    try {
        var raw = localStorage.getItem(ARCHIVE_STORAGE_KEY);
        archiveFiles = raw ? JSON.parse(raw) : getArchiveDefaults();
    } catch (e) { archiveFiles = getArchiveDefaults(); }
    updateArchiveBadges();
}

function persistArchive() {
    try {
        var toSave = archiveFiles.map(function(f) {
            var copy = Object.assign({}, f);
            if (copy.data && copy.data.length > 500000) { delete copy.data; copy.truncated = true; }
            return copy;
        });
        localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) { showToast('자료실 저장 용량 초과. 일부 파일만 저장됩니다.', 'warning'); }
    updateArchiveBadges();
}

function loadComms() {
    try {
        var raw = localStorage.getItem(COMMS_STORAGE_KEY);
        if (raw) { commsData = Object.assign(getCommsDefaults(), JSON.parse(raw)); return; }
    } catch (e) { /* ignore */ }
    commsData = getCommsDefaults();
    updateCommsBadges();
}

function persistComms() {
    try { localStorage.setItem(COMMS_STORAGE_KEY, JSON.stringify(commsData)); } catch (e) { /* ignore */ }
    updateCommsBadges();
}

function updateArchiveBadges() {
    var el = document.getElementById('archive-header-badge');
    if (el) el.textContent = archiveFiles.length;
}

function updateCommsBadges() {
    var unread = commsData.threads.filter(function(t) { return t.unread && commsData.readIds.indexOf(t.id) < 0; }).length;
    var el = document.getElementById('comms-nav-badge');
    if (el) { el.textContent = unread; el.style.display = unread ? 'flex' : 'none'; }
}

function getFileIconClass(ext) {
    var map = { pdf: 'file-icon-pdf', xlsx: 'file-icon-xlsx', xls: 'file-icon-xlsx', doc: 'file-icon-doc', docx: 'file-icon-doc', png: 'file-icon-img', jpg: 'file-icon-img', jpeg: 'file-icon-img', zip: 'file-icon-zip' };
    return map[ext] || 'text-gray-400';
}

function getFileIcon(ext) {
    var map = { pdf: '📕', xlsx: '📗', xls: '📗', doc: '📘', docx: '📘', png: '🖼️', jpg: '🖼️', zip: '🗜️' };
    return map[ext] || '📄';
}

function formatFileSize(bytes) {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    if (bytes >= 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return bytes + ' B';
}

function initArchiveView() {
    renderArchiveStats();
    renderArchiveCatFilters();
    renderArchiveFiles();
    var dz = document.getElementById('archive-dropzone');
    if (dz) dz.onclick = function() { var inp = document.getElementById('archive-file-input'); if (inp) inp.click(); };
    document.querySelectorAll('.archive-sort-btn').forEach(function(btn) {
        btn.classList.toggle('bg-surface', btn.dataset.asort === archiveFilter.sort);
        btn.classList.toggle('border-primary/40', btn.dataset.asort === archiveFilter.sort);
    });
}

function renderArchiveStats() {
    var el = document.getElementById('archive-stats');
    if (!el) return;
    var totalSize = archiveFiles.reduce(function(s, f) { return s + f.size; }, 0);
    var pinned = archiveFiles.filter(function(f) { return f.pinned; }).length;
    el.innerHTML = [
        ['전체 파일', archiveFiles.length + '개', '자료실'],
        ['총 용량', formatFileSize(totalSize), '목업 스토리지'],
        ['즐겨찾기', pinned + '개', '핀 고정'],
        ['이번 주 업로드', archiveFiles.filter(function(f) { return f.uploadedAt >= '2026-07-07'; }).length + '개', '7/7 이후'],
    ].map(function(k) {
        return '<div class="glass rounded-xl p-4"><p class="text-[10px] text-gray-500">' + k[0] + '</p><p class="text-lg font-extrabold">' + k[1] + '</p><p class="text-[10px] text-gray-600">' + k[2] + '</p></div>';
    }).join('');
}

function renderArchiveCatFilters() {
    var el = document.getElementById('archive-cat-filters');
    if (!el) return;
    el.innerHTML = Object.entries(ARCHIVE_CATEGORIES).map(function(entry) {
        var k = entry[0], v = entry[1];
        return '<button onclick="setArchiveCategory(\'' + k + '\')" class="text-[10px] px-2.5 py-1 rounded-md border ' + (archiveFilter.category === k ? 'border-accent/40 bg-accent/15 text-purple-300' : 'border-border bg-surface') + '">' + v.icon + ' ' + v.label + '</button>';
    }).join('');
}

function getFilteredArchiveFiles() {
    var list = archiveFiles.slice();
    if (archiveFilter.category !== 'all') list = list.filter(function(f) { return f.category === archiveFilter.category; });
    if (archiveFilter.pinnedOnly) list = list.filter(function(f) { return f.pinned; });
    if (archiveFilter.search) {
        var q = archiveFilter.search.toLowerCase();
        list = list.filter(function(f) {
            return f.name.toLowerCase().indexOf(q) >= 0 || (f.tags && f.tags.join(' ').toLowerCase().indexOf(q) >= 0);
        });
    }
    if (archiveFilter.sort === 'name') list.sort(function(a, b) { return a.name.localeCompare(b.name); });
    else if (archiveFilter.sort === 'downloads') list.sort(function(a, b) { return b.downloads - a.downloads; });
    else list.sort(function(a, b) { return b.uploadedAt.localeCompare(a.uploadedAt); });
    return list;
}

function renderArchiveFiles() {
    var grid = document.getElementById('archive-file-grid');
    if (!grid) return;
    var list = getFilteredArchiveFiles();
    if (!list.length) {
        grid.innerHTML = '<p class="text-sm text-gray-500 col-span-full text-center py-10">해당 조건의 파일이 없습니다.</p>';
        return;
    }
    grid.innerHTML = list.map(function(f) {
        var member = App.teamMembers.find(function(m) { return m.id === f.uploadedBy; }) || { name: '알 수 없음', avatar: '?' };
        return '<div class="p-4 rounded-xl bg-surface border border-border hover:border-accent/30 transition-colors group">' +
            '<div class="flex items-start justify-between gap-2 mb-2">' +
                '<div class="flex items-center gap-2 min-w-0">' +
                    '<span class="text-2xl ' + getFileIconClass(f.ext) + '">' + getFileIcon(f.ext) + '</span>' +
                    '<div class="min-w-0"><p class="text-sm font-semibold truncate" title="' + f.name + '">' + f.name + '</p>' +
                    '<p class="text-[10px] text-gray-500">' + formatFileSize(f.size) + ' · ' + f.version + '</p></div>' +
                '</div>' +
                '<button onclick="toggleArchivePin(\'' + f.id + '\')" class="text-lg shrink-0 ' + (f.pinned ? 'opacity-100' : 'opacity-30 group-hover:opacity-70') + '" title="즐겨찾기">' + (f.pinned ? '⭐' : '☆') + '</button>' +
            '</div>' +
            '<div class="flex flex-wrap gap-1 mb-2">' + (f.tags || []).map(function(t) { return '<span class="text-[9px] px-1.5 py-0.5 rounded bg-dark border border-border text-gray-500">#' + t + '</span>'; }).join('') + '</div>' +
            '<div class="flex items-center justify-between text-[10px] text-gray-500 mb-3">' +
                '<span>' + member.name + ' · ' + f.uploadedAt + '</span>' +
                '<span>↓ ' + f.downloads + '</span>' +
            '</div>' +
            '<div class="flex gap-1.5">' +
                '<button onclick="downloadArchiveFile(\'' + f.id + '\')" class="flex-1 text-[10px] font-semibold py-1.5 rounded-lg bg-primary/20 text-blue-400 border border-primary/25 hover:bg-primary/30">다운로드</button>' +
                '<button onclick="shareArchiveFile(\'' + f.id + '\')" class="text-[10px] px-2 py-1.5 rounded-lg border border-border hover:border-accent/40" title="공유 링크">🔗</button>' +
                '<button onclick="deleteArchiveFile(\'' + f.id + '\')" class="text-[10px] px-2 py-1.5 rounded-lg border border-danger/30 text-danger hover:bg-danger/10" title="삭제">🗑</button>' +
            '</div>' +
        '</div>';
    }).join('');
}

function setArchiveCategory(cat) { archiveFilter.category = cat; renderArchiveCatFilters(); renderArchiveFiles(); }
function setArchiveSort(sort) { archiveFilter.sort = sort; initArchiveView(); }
function setArchiveFilterPinned() { archiveFilter.pinnedOnly = !archiveFilter.pinnedOnly; var btn = document.getElementById('archive-pinned-only'); if (btn) btn.classList.toggle('border-accent/40', archiveFilter.pinnedOnly); renderArchiveFiles(); }
function filterArchiveFiles(q) { archiveFilter.search = q; renderArchiveFiles(); }

function handleArchiveUpload(files) {
    if (!files || !files.length) return;
    Array.from(files).forEach(function(file) {
        if (file.size > 5242880) { showToast(file.name + ' — 5MB 초과로 업로드 불가 (목업)', 'warning'); return; }
        var reader = new FileReader();
        reader.onload = function(e) {
            var ext = (file.name.split('.').pop() || 'etc').toLowerCase();
            archiveFiles.unshift({
                id: 'up-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
                name: file.name, category: 'etc', ext: ext, size: file.size,
                tags: ['업로드'], pinned: false, uploadedBy: 'kim',
                uploadedAt: new Date().toISOString().slice(0, 10), downloads: 0, version: 'v1.0',
                data: e.target.result,
            });
            persistArchive();
            renderArchiveStats();
            renderArchiveFiles();
            showToast(file.name + ' 업로드 완료', 'success');
        };
        reader.readAsDataURL(file);
    });
    var inp = document.getElementById('archive-file-input');
    if (inp) inp.value = '';
}

function handleArchiveDrop(e) {
    e.preventDefault();
    document.getElementById('archive-dropzone').classList.remove('dragover');
    handleArchiveUpload(e.dataTransfer.files);
}

function downloadArchiveFile(id) {
    var f = archiveFiles.find(function(x) { return x.id === id; });
    if (!f) return;
    var a = document.createElement('a');
    if (f.data) { a.href = f.data; a.download = f.name; }
    else {
        var mime = { pdf: 'application/pdf', xlsx: 'application/vnd.ms-excel', zip: 'application/zip' };
        var blob = new Blob([f.mockContent || '목업 파일 내용'], { type: mime[f.ext] || 'text/plain' });
        a.href = URL.createObjectURL(blob);
        a.download = f.name;
    }
    a.click();
    f.downloads++;
    persistArchive();
    renderArchiveFiles();
    showToast(f.name + ' 다운로드', 'success');
}

function shareArchiveFile(id) {
    var f = archiveFiles.find(function(x) { return x.id === id; });
    if (!f) return;
    var link = 'https://share.sample.co.kr/archive/' + f.id;
    if (navigator.clipboard) navigator.clipboard.writeText(link);
    showToast('공유 링크가 복사되었습니다.', 'success');
}

function toggleArchivePin(id) {
    var f = archiveFiles.find(function(x) { return x.id === id; });
    if (f) { f.pinned = !f.pinned; persistArchive(); renderArchiveStats(); renderArchiveFiles(); }
}

function deleteArchiveFile(id) {
    if (!confirm('이 파일을 자료실에서 삭제할까요?')) return;
    archiveFiles = archiveFiles.filter(function(f) { return f.id !== id; });
    persistArchive();
    renderArchiveStats();
    renderArchiveFiles();
    showToast('파일이 삭제되었습니다.', 'success');
}

function initCommsView() {
    renderCommsStats();
    renderCommsDeptFilters();
    renderCommsAgenda();
    renderCommsThreads();
    if (commsActiveThreadId) renderCommsDetail(commsActiveThreadId);
}

function renderCommsStats() {
    var el = document.getElementById('comms-stats');
    if (!el) return;
    var open = commsData.threads.filter(function(t) { return t.status !== 'done'; }).length;
    var unread = commsData.threads.filter(function(t) { return t.unread && commsData.readIds.indexOf(t.id) < 0; }).length;
    var agendaDone = commsData.agenda.filter(function(a) { return a.done; }).length;
    el.innerHTML = [
        ['진행 중', open + '건', '미완료 요청'],
        ['미확인', unread + '건', '읽지 않은 스레드'],
        ['아젠다', commsData.agenda.length + '건', '이번 주'],
        ['완료율', (commsData.agenda.length ? Math.round(agendaDone / commsData.agenda.length * 100) : 0) + '%', '아젠다 체크'],
    ].map(function(k) {
        return '<div class="glass rounded-xl p-4"><p class="text-[10px] text-gray-500">' + k[0] + '</p><p class="text-lg font-extrabold">' + k[1] + '</p><p class="text-[10px] text-gray-600">' + k[2] + '</p></div>';
    }).join('');
}

function renderCommsDeptFilters() {
    var el = document.getElementById('comms-dept-filters');
    if (!el) return;
    var depts = ['all', '대표', '운영팀', '마케팅', 'CS팀'];
    var html = depts.map(function(d) {
        var label = d === 'all' ? '전체 부서' : d;
        var active = commsFilter.dept === d && commsFilter.member === 'all';
        return '<button onclick="setCommsFilter(\'dept\',\'' + d + '\')" class="w-full text-left px-3 py-2 rounded-lg text-xs ' + (active ? 'bg-primary/15 text-blue-400 border border-primary/25' : 'hover:bg-surface border border-transparent') + '">' + label + '</button>';
    }).join('');
    App.teamMembers.forEach(function(m) {
        html += '<button onclick="setCommsFilter(\'member\',\'' + m.id + '\')" class="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-surface border border-transparent flex items-center gap-2 ' + (commsFilter.member === m.id ? 'bg-primary/15 text-blue-400 border-primary/25' : '') + '">' +
            '<span class="w-6 h-6 rounded-full bg-gradient-to-br ' + m.color + ' flex items-center justify-center text-[9px] font-bold text-white">' + m.avatar + '</span>' +
            '<span>' + m.name + ' <span class="text-gray-500">(' + m.role + ')</span></span></button>';
    });
    el.innerHTML = html;
}

function getFilteredCommsThreads() {
    return commsData.threads.filter(function(t) {
        if (commsFilter.dept !== 'all') {
            if (t.dept !== commsFilter.dept && commsFilter.dept !== '전체') {
                var fromM = App.teamMembers.find(function(m) { return m.id === t.from; });
                var toM = t.to !== 'all' ? App.teamMembers.find(function(m) { return m.id === t.to; }) : null;
                var matchDept = (fromM && fromM.role === commsFilter.dept) || (toM && toM.role === commsFilter.dept) || t.dept === commsFilter.dept;
                if (!matchDept) return false;
            }
        }
        if (commsFilter.member !== 'all') {
            return t.from === commsFilter.member || t.to === commsFilter.member || t.to === 'all';
        }
        return true;
    });
}

function getCommsStatusLabel(status) {
    var map = { request: ['요청', 'comms-status-request'], progress: ['진행중', 'comms-status-progress'], done: ['완료', 'comms-status-done'], hold: ['보류', 'comms-status-hold'] };
    return map[status] || ['알 수 없음', ''];
}

function renderCommsThreads() {
    var el = document.getElementById('comms-thread-list');
    var countEl = document.getElementById('comms-thread-count');
    if (!el) return;
    var list = getFilteredCommsThreads();
    if (countEl) countEl.textContent = list.length + '건';
    el.innerHTML = list.map(function(t) {
        var from = App.teamMembers.find(function(m) { return m.id === t.from; }) || { name: '?', avatar: '?' };
        var st = getCommsStatusLabel(t.status);
        var isUnread = t.unread && commsData.readIds.indexOf(t.id) < 0;
        return '<button onclick="selectCommsThread(\'' + t.id + '\')" class="comms-thread w-full text-left p-3 rounded-xl border border-border hover:border-primary/30 transition-colors ' + (commsActiveThreadId === t.id ? 'active' : '') + '">' +
            '<div class="flex items-start justify-between gap-2 mb-1">' +
                '<div class="flex items-center gap-2 min-w-0">' +
                    (isUnread ? '<span class="w-2 h-2 rounded-full bg-accent shrink-0"></span>' : '') +
                    '<span class="text-sm font-semibold truncate">' + t.title + '</span>' +
                '</div>' +
                '<span class="text-[9px] px-1.5 py-0.5 rounded shrink-0 ' + st[1] + '">' + st[0] + '</span>' +
            '</div>' +
            '<p class="text-[10px] text-gray-500 truncate">' + from.name + ' → ' + (t.to === 'all' ? '전체' : (App.teamMembers.find(function(m) { return m.id === t.to; }) || {}).name || t.to) + ' · ' + t.dept + '</p>' +
            '<p class="text-[10px] text-gray-600 mt-1">마감 ' + t.due + (t.priority === 'high' ? ' · <span class="text-danger">긴급</span>' : '') + '</p>' +
        '</button>';
    }).join('');
}

function renderCommsAgenda() {
    var el = document.getElementById('comms-agenda-list');
    if (!el) return;
    el.innerHTML = commsData.agenda.map(function(a) {
        var owner = App.teamMembers.find(function(m) { return m.id === a.owner; }) || { name: '?' };
        return '<label class="flex items-start gap-2 p-2 rounded-lg hover:bg-surface cursor-pointer">' +
            '<input type="checkbox" ' + (a.done ? 'checked' : '') + ' onchange="toggleCommsAgenda(\'' + a.id + '\')" class="rounded mt-0.5">' +
            '<div class="min-w-0"><p class="text-xs font-medium ' + (a.done ? 'line-through text-gray-500' : '') + '">' + a.title + '</p>' +
            '<p class="text-[10px] text-gray-600">' + a.date + ' · ' + owner.name + ' · ' + a.dept + '</p></div></label>';
    }).join('');
}

function selectCommsThread(id) {
    commsActiveThreadId = id;
    if (commsData.readIds.indexOf(id) < 0) commsData.readIds.push(id);
    var t = commsData.threads.find(function(x) { return x.id === id; });
    if (t) t.unread = false;
    persistComms();
    renderCommsThreads();
    renderCommsStats();
    renderCommsDetail(id);
}

function renderCommsDetail(id) {
    var el = document.getElementById('comms-detail-panel');
    var t = commsData.threads.find(function(x) { return x.id === id; });
    if (!el || !t) return;
    var from = App.teamMembers.find(function(m) { return m.id === t.from; }) || { name: '?', avatar: '?', color: 'from-gray-500 to-gray-600' };
    var toName = t.to === 'all' ? '전체 팀' : (App.teamMembers.find(function(m) { return m.id === t.to; }) || {}).name || t.to;
    var st = getCommsStatusLabel(t.status);
    el.innerHTML = '<div class="flex items-start justify-between gap-2 mb-4">' +
        '<div><h3 class="font-bold text-sm">' + t.title + '</h3>' +
        '<p class="text-[10px] text-gray-500 mt-1">' + from.name + ' → ' + toName + ' · ' + t.createdAt + '</p></div>' +
        '<span class="text-[10px] px-2 py-0.5 rounded ' + st[1] + '">' + st[0] + '</span></div>' +
        '<div class="p-3 rounded-lg bg-surface border border-border mb-4"><p class="text-sm text-gray-300 leading-relaxed">' + t.body + '</p></div>' +
        '<div class="flex gap-2 mb-4 flex-wrap">' +
        ['request', 'progress', 'done', 'hold'].map(function(s) {
            var lb = getCommsStatusLabel(s);
            return '<button onclick="updateCommsStatus(\'' + t.id + '\',\'' + s + '\')" class="text-[10px] px-2 py-1 rounded border ' + (t.status === s ? 'border-primary/40 bg-primary/15 text-blue-400' : 'border-border') + '">' + lb[0] + '</button>';
        }).join('') +
        '</div>' +
        '<h4 class="text-xs font-bold text-gray-400 mb-2">회신 (' + (t.replies || []).length + ')</h4>' +
        '<div class="space-y-2 max-h-[200px] overflow-y-auto mb-4" id="comms-replies">' +
        (t.replies || []).map(function(r) {
            var u = App.teamMembers.find(function(m) { return m.id === r.userId; }) || { name: '?', avatar: '?', color: 'from-gray-500 to-gray-600' };
            return '<div class="flex gap-2 p-2 rounded-lg bg-dark"><span class="w-6 h-6 rounded-full bg-gradient-to-br ' + u.color + ' flex items-center justify-center text-[8px] font-bold text-white shrink-0">' + u.avatar + '</span>' +
                '<div><p class="text-xs text-gray-200">' + r.text + '</p><p class="text-[10px] text-gray-600">' + u.name + ' · ' + r.time + '</p></div></div>';
        }).join('') +
        '</div>' +
        '<div class="flex gap-2"><input id="comms-reply-input" type="text" placeholder="회신 작성..." class="settings-input flex-1 text-xs" onkeydown="if(event.key===\'Enter\')submitCommsReply(\'' + t.id + '\')">' +
        '<button onclick="submitCommsReply(\'' + t.id + '\')" class="text-xs font-semibold px-3 py-2 rounded-lg bg-primary text-white shrink-0">전송</button></div>';
}

function submitCommsReply(threadId) {
    var input = document.getElementById('comms-reply-input');
    if (!input || !input.value.trim()) return;
    var t = commsData.threads.find(function(x) { return x.id === threadId; });
    if (!t) return;
    if (!t.replies) t.replies = [];
    var now = new Date();
    t.replies.push({
        id: 'r-' + Date.now(),
        userId: 'kim',
        text: input.value.trim(),
        time: now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0'),
    });
    if (t.status === 'request') t.status = 'progress';
    persistComms();
    renderCommsDetail(threadId);
    renderCommsThreads();
    showToast('회신이 전송되었습니다.', 'success');
}

function updateCommsStatus(threadId, status) {
    var t = commsData.threads.find(function(x) { return x.id === threadId; });
    if (t) { t.status = status; persistComms(); renderCommsDetail(threadId); renderCommsThreads(); renderCommsStats(); showToast('상태가 변경되었습니다.', 'success'); }
}

function setCommsFilter(type, value) {
    if (type === 'dept') { commsFilter.dept = value; commsFilter.member = 'all'; }
    if (type === 'member') commsFilter.member = value;
    renderCommsDeptFilters();
    renderCommsThreads();
}

function toggleCommsAgenda(id) {
    var a = commsData.agenda.find(function(x) { return x.id === id; });
    if (a) { a.done = !a.done; persistComms(); renderCommsAgenda(); renderCommsStats(); }
}

function addCommsAgenda() {
    var title = prompt('아젠다 제목을 입력하세요:');
    if (!title) return;
    commsData.agenda.push({ id: 'a-' + Date.now(), date: '2026-07-10', dept: '운영팀', title: title, owner: 'kim', done: false });
    persistComms();
    renderCommsAgenda();
    renderCommsStats();
    showToast('아젠다가 추가되었습니다.', 'success');
}

var commsFormState = { type: 'request', assignee: 'park', priority: 'normal' };

var COMMS_TEMPLATES = [
    { id: 'order', label: '발주 요청', title: '채널 발주 처리 요청', body: '아래 주문 건 발주 처리 부탁드립니다.\n\n• 채널: \n• 건수: \n• 마감 시한:' },
    { id: 'inventory', label: '재고 확인', title: '재고 수량 확인 요청', body: '아래 SKU 재고 현황 확인 및 보충 여부 검토 부탁드립니다.\n\n• SKU: \n• 필요 수량:' },
    { id: 'cs', label: 'CS 대응', title: '고객 문의 대응 요청', body: '아래 고객 문의 건 확인 및 응대 부탁드립니다.\n\n• 채널: \n• 문의 유형: \n• 고객 연락처:' },
    { id: 'report', label: '리포트 요청', title: '데이터 리포트 작성 요청', body: '아래 항목 리포트 작성 및 자료실 업로드 부탁드립니다.\n\n• 기간: \n• 채널: \n• 포함 지표:' },
];

function getDefaultCommsDueDate() {
    var d = new Date();
    d.setDate(d.getDate() + 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function renderCommsModalAssignees() {
    var el = document.getElementById('comms-assignee-btns');
    if (!el) return;
    var html = '<button type="button" onclick="setCommsFormAssignee(\'all\')" data-cassign="all" class="comms-assignee-btn text-xs p-2.5 rounded-xl border border-border bg-surface text-left ' + (commsFormState.assignee === 'all' ? 'active' : '') + '"><span class="block font-semibold">👥 전체 팀</span><span class="text-[10px] text-gray-500">공지 · 전체 공유</span></button>';
    App.teamMembers.forEach(function(m) {
        if (m.id === 'kim') return;
        html += '<button type="button" onclick="setCommsFormAssignee(\'' + m.id + '\')" data-cassign="' + m.id + '" class="comms-assignee-btn text-xs p-2.5 rounded-xl border border-border bg-surface text-left flex items-center gap-2 ' + (commsFormState.assignee === m.id ? 'active' : '') + '">' +
            '<span class="w-7 h-7 rounded-full bg-gradient-to-br ' + m.color + ' flex items-center justify-center text-[9px] font-bold text-white shrink-0">' + m.avatar + '</span>' +
            '<span><span class="block font-semibold">' + m.name + '</span><span class="text-[10px] text-gray-500">' + m.role + '</span></span></button>';
    });
    el.innerHTML = html;
}

function renderCommsModalTemplates() {
    var el = document.getElementById('comms-template-btns');
    if (!el) return;
    el.innerHTML = COMMS_TEMPLATES.map(function(t) {
        return '<button type="button" onclick="applyCommsTemplate(\'' + t.id + '\')" class="comms-template-btn text-[10px] px-2.5 py-1 rounded-md border border-border bg-surface">' + t.label + '</button>';
    }).join('');
}

function setCommsFormType(type) {
    commsFormState.type = type;
    document.querySelectorAll('.comms-type-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.ctype === type);
    });
}

function setCommsFormAssignee(id) {
    commsFormState.assignee = id;
    renderCommsModalAssignees();
}

function setCommsFormPriority(priority) {
    commsFormState.priority = priority;
    document.querySelectorAll('.comms-priority-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.cpri === priority);
    });
}

function applyCommsTemplate(templateId) {
    var t = COMMS_TEMPLATES.find(function(x) { return x.id === templateId; });
    if (!t) return;
    var titleEl = document.getElementById('comms-form-title');
    var bodyEl = document.getElementById('comms-form-body');
    if (titleEl) titleEl.value = t.title;
    if (bodyEl) bodyEl.value = t.body;
    if (titleEl) titleEl.focus();
    showToast('"' + t.label + '" 템플릿이 적용되었습니다.', 'info');
}

function openNewCommsRequest() {
    commsFormState = { type: 'request', assignee: 'park', priority: 'normal' };
    var modal = document.getElementById('comms-modal');
    var form = document.getElementById('comms-request-form');
    if (form) form.reset();
    var dueEl = document.getElementById('comms-form-due');
    if (dueEl) dueEl.value = getDefaultCommsDueDate();
    var agendaEl = document.getElementById('comms-form-agenda');
    if (agendaEl) agendaEl.checked = true;
    setCommsFormType('request');
    setCommsFormPriority('normal');
    renderCommsModalAssignees();
    renderCommsModalTemplates();
    if (modal) modal.classList.add('open');
    setTimeout(function() {
        var titleInput = document.getElementById('comms-form-title');
        if (titleInput) titleInput.focus();
    }, 100);
}

function closeCommsModal() {
    var modal = document.getElementById('comms-modal');
    if (modal) modal.classList.remove('open');
}

function submitCommsRequestForm(e) {
    if (e) e.preventDefault();
    var titleEl = document.getElementById('comms-form-title');
    var bodyEl = document.getElementById('comms-form-body');
    var dueEl = document.getElementById('comms-form-due');
    var agendaEl = document.getElementById('comms-form-agenda');
    var title = titleEl ? titleEl.value.trim() : '';
    if (!title) { showToast('제목을 입력해주세요.', 'warning'); if (titleEl) titleEl.focus(); return; }

    var assignee = commsFormState.assignee;
    var member = assignee === 'all' ? null : App.teamMembers.find(function(m) { return m.id === assignee; });
    var dept = member ? member.role : '전체';
    var now = new Date();
    var createdAt = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    var threadId = 't-' + Date.now();

    commsData.threads.unshift({
        id: threadId,
        type: commsFormState.type,
        from: App.currentUserId,
        to: assignee,
        dept: dept,
        title: title,
        body: bodyEl ? bodyEl.value.trim() : '',
        status: 'request',
        priority: commsFormState.priority,
        due: dueEl ? dueEl.value : getDefaultCommsDueDate(),
        createdAt: createdAt,
        unread: true,
        replies: [],
    });

    if (agendaEl && agendaEl.checked) {
        commsData.agenda.unshift({
            id: 'a-' + Date.now(),
            date: dueEl ? dueEl.value : getDefaultCommsDueDate(),
            dept: dept,
            title: title,
            owner: assignee === 'all' ? App.currentUserId : assignee,
            done: false,
        });
    }

    persistComms();
    closeCommsModal();
    if (App.currentView === 'view-comms') {
        renderCommsStats();
        renderCommsAgenda();
        renderCommsThreads();
        selectCommsThread(threadId);
    }
    showToast('요청이 전송되었습니다.', 'success');
}

var activityFilter = { user: 'all', cat: 'all', search: '' };
var dataHubFilter = { period: 'daily', channel: 'all' };
var dataHubRowsCache = [];
var dataHubTableSearch = '';

function getDataHubWeight(channel) {
    var ch = App.dataHubChannels.find(function(c) { return c.id === channel; });
    return ch ? ch.weight : 1;
}

function getDataHubPeriodLabel(period, index) {
    var i = index;
    if (period === 'daily') {
        var d = 10 - i;
        return '2026-07-' + String(Math.max(1, d)).padStart(2, '0');
    }
    if (period === 'weekly') return '2026-W' + String(28 - i).padStart(2, '0');
    if (period === 'monthly') {
        var m = 7 - i;
        return '2026-' + String(m > 0 ? m : m + 12).padStart(2, '0');
    }
    return String(2026 - i);
}

function generateDataHubRows(period, channel) {
    var configs = { daily: [14, 1], weekly: [12, 7], monthly: [12, 30], yearly: [5, 365] };
    var count = configs[period][0];
    var mult = configs[period][1];
    var w = getDataHubWeight(channel);
    var rangeMult = getDateRangeMultiplier();
    var chName = channel === 'all' ? '통합' : (App.dataHubChannels.find(function(c) { return c.id === channel; }) || {}).name || channel;
    var rows = [];

    for (var i = 0; i < count; i++) {
        var seed = (count - i) * 137 + channel.length * 47;
        var variance = 0.85 + (seed % 30) / 100;
        var revenue = Math.round(28450000 * mult * w * variance * rangeMult);
        var orders = Math.max(1, Math.round(1248 * mult * w * variance * rangeMult));
        var prevRev = revenue * (0.88 + (seed % 15) / 100);
        var momBase = revenue * (0.92 + (seed % 8) / 100);
        var yoyBase = revenue * (0.78 + (seed % 12) / 100);
        rows.push({
            period: getDataHubPeriodLabel(period, i),
            channel: chName,
            revenue: revenue,
            orders: orders,
            aov: Math.round(revenue / orders),
            margin: parseFloat((28 + (seed % 8) - 4).toFixed(1)),
            newCustomers: Math.round(342 * mult * w * variance * rangeMult * 0.3),
            returnRate: parseFloat((1.5 + (seed % 15) / 10).toFixed(1)),
            growth: parseFloat(((revenue - prevRev) / prevRev * 100).toFixed(1)),
            mom: parseFloat(((revenue - momBase) / momBase * 100).toFixed(1)),
            yoy: parseFloat(((revenue - yoyBase) / yoyBase * 100).toFixed(1)),
        });
    }
    return rows;
}

function getDataHubSummary(rows) {
    var totalRev = rows.reduce(function(s, r) { return s + r.revenue; }, 0);
    var totalOrders = rows.reduce(function(s, r) { return s + r.orders; }, 0);
    var avgMargin = rows.reduce(function(s, r) { return s + r.margin; }, 0) / rows.length;
    var totalNew = rows.reduce(function(s, r) { return s + r.newCustomers; }, 0);
    var avgReturn = rows.reduce(function(s, r) { return s + r.returnRate; }, 0) / rows.length;
    var lastGrowth = rows.length ? rows[rows.length - 1].growth : 0;
    return {
        revenue: totalRev,
        orders: totalOrders,
        aov: totalOrders ? Math.round(totalRev / totalOrders) : 0,
        margin: avgMargin.toFixed(1),
        newCustomers: totalNew,
        returnRate: avgReturn.toFixed(1),
        growth: lastGrowth,
    };
}

function formatDataHubWon(n) {
    if (n >= 100000000) return '₩ ' + (n / 100000000).toFixed(1) + '억';
    if (n >= 10000) return '₩ ' + (n / 10000).toFixed(0) + '만';
    return App.formatWon(n);
}

function renderDataHubKpis(summary) {
    var el = document.getElementById('datahub-kpis');
    if (!el) return;
    var periodNames = { daily: '일간', weekly: '주간', monthly: '월간', yearly: '연간' };
    var kpis = [
        ['누적 매출', formatDataHubWon(summary.revenue), periodNames[dataHubFilter.period] + ' 합계'],
        ['총 주문', summary.orders.toLocaleString() + '건', '전 기간 누적'],
        ['평균 객단가', App.formatWon(summary.aov), '주문당'],
        ['평균 마진율', summary.margin + '%', '광고·원가 반영'],
        ['신규 고객', summary.newCustomers.toLocaleString() + '명', '기간 내 유입'],
        ['반품률', summary.returnRate + '%', '전기 대비 ' + (summary.growth >= 0 ? '+' : '') + summary.growth + '%'],
    ];
    el.innerHTML = kpis.map(function(k) {
        return '<div class="glass rounded-xl p-4"><p class="text-[10px] text-gray-500 mb-1">' + k[0] + '</p><p class="text-lg font-extrabold">' + k[1] + '</p><p class="text-[10px] text-gray-600 mt-0.5">' + k[2] + '</p></div>';
    }).join('');
}

function renderDataHubTable(rows) {
    var tbody = document.getElementById('datahub-tbody');
    var countEl = document.getElementById('datahub-row-count');
    if (!tbody) return;

    var filtered = rows;
    if (dataHubTableSearch) {
        var q = dataHubTableSearch.toLowerCase();
        filtered = rows.filter(function(r) {
            return r.period.toLowerCase().indexOf(q) >= 0 || r.channel.toLowerCase().indexOf(q) >= 0;
        });
    }

    var sorted = filtered.slice().sort(function(a, b) {
        var f = dataHubSort.field;
        var av = a[f], bv = b[f];
        if (typeof av === 'string') { av = av.toLowerCase(); bv = String(bv).toLowerCase(); }
        if (av < bv) return dataHubSort.dir === 'asc' ? -1 : 1;
        if (av > bv) return dataHubSort.dir === 'asc' ? 1 : -1;
        return 0;
    });

    if (countEl) countEl.textContent = sorted.length + '건';
    tbody.innerHTML = sorted.map(function(r) {
        function fmtPct(v) {
            var cls = v >= 0 ? 'text-success' : 'text-danger';
            return '<span class="' + cls + '">' + (v >= 0 ? '+' : '') + v + '%</span>';
        }
        return '<tr class="border-b border-border/50">' +
            '<td class="px-4 py-2.5 font-mono text-xs">' + r.period + '</td>' +
            '<td class="px-4 py-2.5 text-xs">' + r.channel + '</td>' +
            '<td class="px-4 py-2.5 text-right font-semibold text-xs">' + App.formatWon(r.revenue) + '</td>' +
            '<td class="px-4 py-2.5 text-right text-xs">' + r.orders.toLocaleString() + '</td>' +
            '<td class="px-4 py-2.5 text-right text-xs text-gray-400">' + App.formatWon(r.aov) + '</td>' +
            '<td class="px-4 py-2.5 text-right text-xs">' + r.margin + '%</td>' +
            '<td class="px-4 py-2.5 text-right text-xs">' + r.newCustomers.toLocaleString() + '</td>' +
            '<td class="px-4 py-2.5 text-right text-xs text-gray-400">' + r.returnRate + '%</td>' +
            '<td class="px-4 py-2.5 text-right text-xs font-semibold">' + fmtPct(r.mom) + '</td>' +
            '<td class="px-4 py-2.5 text-right text-xs font-semibold">' + fmtPct(r.yoy) + '</td>' +
            '<td class="px-4 py-2.5 text-right text-xs font-semibold">' + fmtPct(r.growth) + '</td>' +
        '</tr>';
    }).join('');
}

function renderDataHubInsight(summary, rows) {
    var el = document.getElementById('datahub-insight');
    if (!el) return;
    var periodNames = { daily: '일간', weekly: '주간', monthly: '월간', yearly: '연간' };
    var best = rows.reduce(function(a, b) { return a.revenue > b.revenue ? a : b; }, rows[0]);
    var chLabel = dataHubFilter.channel === 'all' ? '전 채널 통합' : App.dataHubChannels.find(function(c) { return c.id === dataHubFilter.channel; }).name;
    el.innerHTML = '<p class="text-xs font-bold text-primary mb-1">📊 분석 인사이트</p>' +
        '<p class="text-sm text-gray-300 leading-relaxed">' +
        '<strong class="text-white">' + periodNames[dataHubFilter.period] + ' · ' + chLabel + '</strong> 기준 누적 매출 <strong class="text-white">' + formatDataHubWon(summary.revenue) + '</strong>, ' +
        '최고 실적 구간은 <strong class="text-success">' + best.period + '</strong> (' + formatDataHubWon(best.revenue) + '). ' +
        '평균 마진율 <strong class="' + (parseFloat(summary.margin) >= 30 ? 'text-success' : 'text-warning') + '">' + summary.margin + '%</strong>, ' +
        '반품률 <strong class="text-gray-300">' + summary.returnRate + '%</strong>.' +
        '</p>';
}

function renderDataHubChannelLegend() {
    var el = document.getElementById('datahub-channel-legend');
    if (!el) return;
    var colors = ['#3b82f6', '#10b981', '#f97316', '#ec4899'];
    var channels = App.dataHubChannels.filter(function(c) { return c.id !== 'all'; });
    el.innerHTML = channels.map(function(c, i) {
        var pct = (c.weight * 100).toFixed(0);
        return '<div class="flex items-center justify-between text-[10px]"><span class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full" style="background:' + colors[i] + '"></span>' + c.name + '</span><span class="font-mono text-gray-400">' + pct + '%</span></div>';
    }).join('');
}

function initDataHub() {
    dataHubRowsCache = generateDataHubRows(dataHubFilter.period, dataHubFilter.channel);
    var summary = getDataHubSummary(dataHubRowsCache);

    renderDataHubKpis(summary);
    renderDataHubTable(dataHubRowsCache);
    renderDataHubInsight(summary, dataHubRowsCache);
    renderDataHubChannelLegend();

    var periodNames = { daily: '일간', weekly: '주간', monthly: '월간', yearly: '연간' };
    var titleEl = document.getElementById('datahub-chart-title');
    var pieEl = document.getElementById('datahub-pie-period');
    var descEl = document.getElementById('datahub-table-desc');
    if (titleEl) titleEl.textContent = periodNames[dataHubFilter.period] + ' 매출 추이';
    if (pieEl) pieEl.textContent = periodNames[dataHubFilter.period];
    if (descEl) descEl.textContent = App.globalDateRange.label + ' · ' + periodNames[dataHubFilter.period] + ' · ' + (dataHubFilter.channel === 'all' ? '전 채널' : App.dataHubChannels.find(function(c) { return c.id === dataHubFilter.channel; }).name) + ' 누적 스냅샷';
}

function setDataHubPeriod(period) {
    dataHubFilter.period = period;
    if (App.currentView === 'view-datahub') switchView('view-datahub');
}

function setDataHubChannel(channel) {
    dataHubFilter.channel = channel;
    if (App.currentView === 'view-datahub') switchView('view-datahub');
}

function filterDataHubTable(q) {
    dataHubTableSearch = q;
    renderDataHubTable(dataHubRowsCache);
}

function exportDataHub(format) {
    var labels = { csv: 'CSV', pdf: 'PDF', xlsx: 'Excel' };
    var rows = dataHubRowsCache.length ? dataHubRowsCache : generateDataHubRows(dataHubFilter.period, dataHubFilter.channel);
    if (format === 'csv' || format === 'xlsx') {
        var header = '기간,채널,매출,주문,객단가,마진율,신규고객,반품률,MoM,YoY,전기대비\n';
        var body = rows.map(function(r) {
            return [r.period, r.channel, r.revenue, r.orders, r.aov, r.margin, r.newCustomers, r.returnRate, r.mom, r.yoy, r.growth].join(',');
        }).join('\n');
        var mime = format === 'xlsx' ? 'application/vnd.ms-excel;charset=utf-8;' : 'text/csv;charset=utf-8;';
        var blob = new Blob(['\uFEFF' + header + body], { type: mime });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'omni_datahub_' + dataHubFilter.period + '_' + dataHubFilter.channel + '.' + (format === 'xlsx' ? 'xlsx' : 'csv');
        a.click();
        showToast(labels[format] + ' 파일을 다운로드했습니다. (' + rows.length + '건)', 'success');
        return;
    }
    if (format === 'pdf') {
        var target = document.getElementById('view-datahub');
        if (!target || typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
            showToast('PDF 생성 라이브러리를 불러오는 중입니다.', 'warning');
            return;
        }
        showToast('PDF 리포트 생성 중... (데모)', 'info');
        html2canvas(target, { scale: 0.75, backgroundColor: '#0f172a', useCORS: true }).then(function(canvas) {
            var pdf = new jspdf.jsPDF('l', 'mm', 'a4');
            var img = canvas.toDataURL('image/png');
            var w = 297;
            var h = canvas.height * w / canvas.width;
            pdf.addImage(img, 'PNG', 0, 0, w, Math.min(h, 210));
            pdf.save('omni_datahub_' + dataHubFilter.period + '.pdf');
            showToast('PDF 리포트를 다운로드했습니다. (데모)', 'success');
        }).catch(function() {
            showToast('PDF 생성에 실패했습니다.', 'warning');
        });
    }
}

function getMember(userId) {
    return App.teamMembers.find(function(m) { return m.id === userId; }) || { name: '알 수 없음', role: '', avatar: '?', color: 'from-gray-500 to-gray-600' };
}

function renderActivityTimeline() {
    var container = document.getElementById('activity-timeline');
    var countEl = document.getElementById('activity-count');
    if (!container) return;

    var data = App.activityLogs.filter(function(log) {
        if (activityFilter.user !== 'all' && log.userId !== activityFilter.user) return false;
        if (activityFilter.cat !== 'all' && log.category !== activityFilter.cat) return false;
        if (activityFilter.search) {
            var q = activityFilter.search.toLowerCase();
            if (log.detail.toLowerCase().indexOf(q) < 0 && log.action.toLowerCase().indexOf(q) < 0 && log.meta.toLowerCase().indexOf(q) < 0) return false;
        }
        return true;
    });

    if (countEl) countEl.textContent = data.length + '건';

    if (!data.length) {
        container.innerHTML = '<p class="text-sm text-gray-500 text-center py-10">해당 조건의 활동 이력이 없습니다.</p>';
        return;
    }

    container.innerHTML = data.map(function(log) {
        var member = getMember(log.userId);
        var cat = App.activityCategories[log.category] || { label: log.category, icon: '•' };
        return '<div class="activity-item type-' + log.type + '">' +
            '<div class="flex items-start justify-between gap-3">' +
                '<div class="flex items-start gap-2.5 min-w-0">' +
                    '<span class="w-7 h-7 rounded-full bg-gradient-to-br ' + member.color + ' flex items-center justify-center text-[9px] font-bold text-white shrink-0">' + member.avatar + '</span>' +
                    '<div class="min-w-0">' +
                        '<div class="flex items-center gap-2 flex-wrap mb-0.5">' +
                            '<span class="text-sm font-semibold">' + member.name + '</span>' +
                            '<span class="text-[10px] text-gray-500">' + member.role + '</span>' +
                            '<span class="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-border">' + cat.icon + ' ' + cat.label + '</span>' +
                        '</div>' +
                        '<p class="text-sm text-gray-200">' + log.action + ' — <span class="text-gray-400">' + log.detail + '</span></p>' +
                        '<p class="text-[10px] text-gray-600 mt-1 font-mono">' + log.meta + '</p>' +
                    '</div>' +
                '</div>' +
                '<div class="text-right shrink-0">' +
                    '<p class="text-[10px] text-gray-500 font-mono">' + log.time + '</p>' +
                    '<p class="text-[10px] text-gray-600">' + log.ago + '</p>' +
                '</div>' +
            '</div>' +
        '</div>';
    }).join('');
}

function filterActivity(type, value) {
    if (type === 'user') activityFilter.user = value;
    if (type === 'cat') activityFilter.cat = value;
    document.querySelectorAll('.activity-filter').forEach(function(btn) {
        btn.classList.remove('active', 'bg-primary/15', 'text-blue-400', 'border-primary/25');
        if (btn.dataset.af === 'user-' + activityFilter.user) btn.classList.add('active', 'bg-primary/15', 'text-blue-400', 'border-primary/25');
    });
    document.querySelectorAll('.activity-filter-cat').forEach(function(btn) {
        btn.classList.remove('active', 'border-primary/40', 'text-blue-400');
        if (btn.dataset.af === 'cat-' + activityFilter.cat) btn.classList.add('active', 'border-primary/40', 'text-blue-400');
    });
    renderActivityTimeline();
}

function filterActivitySearch(q) {
    activityFilter.search = q;
    renderActivityTimeline();
}

function renderNav() {
    var container = document.getElementById('nav-container');
    if (!container) return;
    var html = '';

    App.navGroups.forEach(function(group) {
        if (!group.label) {
            group.items.forEach(function(item) {
                html += '<button data-target="' + item.target + '" data-title="' + item.title + '" data-group="" class="nav-item nav-home w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left text-sm mb-3">';
                html += '<svg class="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">' + App.navIcons[item.icon] + '</svg>';
                html += '<div class="flex-1"><span class="block">' + item.title + '</span>';
                if (item.subtitle) html += '<span class="block text-[10px] text-gray-500 font-normal">' + item.subtitle + '</span>';
                html += '</div></button>';
            });
            return;
        }

        html += '<div class="nav-group mb-2">';
        html += '<div class="nav-group-label"><span class="group-icon">' + group.icon + '</span>' + group.label + '</div>';
        html += '<div class="space-y-0.5">';

        group.items.forEach(function(item) {
            html += '<button data-target="' + item.target + '" data-title="' + item.title + '" data-group="' + item.group + '" class="nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm">';
            html += '<svg class="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">' + App.navIcons[item.icon] + '</svg>';
            html += '<span class="flex-1">';
            html += item.title;
            if (item.subtitle) html += ' <span class="text-[10px] text-gray-500">(' + item.subtitle + ')</span>';
            html += '</span>';
            if (item.badge) {
                var isDot = item.badge.class.indexOf('rounded-full') >= 0;
                html += '<span class="ml-auto text-[10px] font-bold ' + item.badge.class + ' flex items-center justify-center' + (isDot ? '' : ' px-1.5 py-0.5 rounded') + '">' + item.badge.text + '</span>';
            }
            html += '</button>';
        });

        html += '</div></div>';
    });

    container.innerHTML = html;
}

function updateBreadcrumb(title, group) {
    var homeBtn = document.getElementById('breadcrumb-home');
    var groupEl = document.getElementById('breadcrumb-group');
    var sep = document.getElementById('breadcrumb-sep');
    var sep2 = document.getElementById('breadcrumb-sep2');
    var titleEl = document.getElementById('header-title');
    if (!titleEl) return;

    var isHome = (title === '통합 대시보드' || title === '홈');

    if (isHome) {
        titleEl.textContent = '통합 대시보드';
        if (homeBtn) homeBtn.style.display = 'none';
        if (sep) sep.style.display = 'none';
        if (sep2) sep2.style.display = 'none';
        if (groupEl) { groupEl.style.display = 'none'; groupEl.textContent = ''; }
    } else {
        titleEl.textContent = title;
        if (homeBtn) homeBtn.style.display = '';
        if (sep) sep.style.display = '';
        if (groupEl && group) {
            groupEl.textContent = group;
            groupEl.style.display = '';
            if (sep2) sep2.style.display = '';
        } else {
            if (groupEl) groupEl.style.display = 'none';
            if (sep2) sep2.style.display = 'none';
        }
    }
}
function toggleMobileSidebar() { document.getElementById('mobile-sidebar').classList.toggle('open'); document.getElementById('sidebar-overlay').classList.toggle('open'); }
function toggleNotifications() { document.getElementById('notif-panel').classList.toggle('hidden'); }
function renderNotifications() {
    var list = document.getElementById('notif-list');
    if (!list) return;
    var c = { danger: 'border-l-danger', warning: 'border-l-warning', success: 'border-l-success', info: 'border-l-primary' };
    list.innerHTML = App.notifications.map(function(n) {
        var read = isNotificationRead(n.id);
        return '<div class="notif-item p-4 border-l-2 ' + c[n.type] + (read ? ' read' : '') + '" onclick="markNotificationRead(\'' + n.id + '\', true)">' +
            '<p class="text-sm font-semibold">' + n.title + (read ? '' : ' <span class="text-[9px] text-primary">NEW</span>') + '</p>' +
            '<p class="text-xs text-gray-500">' + n.desc + '</p>' +
            '<p class="text-[10px] text-gray-600 mt-1">' + n.time + (n.action ? ' · 클릭하여 이동' : '') + '</p></div>';
    }).join('');
}
function showToast(msg,type) {
    type=type||'info';
    const el=document.createElement('div');
    const colors={success:'border-success/50 bg-success/10',info:'border-primary/50 bg-primary/10',warning:'border-warning/50 bg-warning/10'};
    el.className='toast glass-strong rounded-lg px-4 py-3 text-sm border '+(colors[type]||colors.info)+' shadow-xl max-w-xs';
    el.textContent=msg;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(function(){el.style.opacity='0';el.style.transition='opacity 0.3s';setTimeout(function(){el.remove();},300);},3000);
}
function openCommandPalette() { document.getElementById('cmd-palette').classList.add('open'); document.getElementById('cmd-input').value=''; document.getElementById('cmd-input').focus(); filterCommands(''); }
function closeCommandPalette() { document.getElementById('cmd-palette').classList.remove('open'); }
function filterCommands(q) {
    const results=document.getElementById('cmd-results');
    const filtered=App.commands.filter(function(c){return c.label.toLowerCase().includes(q.toLowerCase());});
    results.innerHTML=filtered.map(function(c){
        var action=c.target?"navigateTo('"+c.target+"')":"showToast('실행 완료','info')";
        return '<button class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface text-left text-sm" onclick="closeCommandPalette();'+action+'"><span>'+c.icon+'</span><span>'+c.label+'</span></button>';
    }).join('')||'<p class="px-4 py-3 text-sm text-gray-500">결과 없음</p>';
}
function initCharts() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.color = '#9ca3af';
    Chart.defaults.font.family = 'Pretendard, sans-serif';
    Chart.defaults.scale.grid.color = 'rgba(55,65,81,0.3)';
    App.charts.forEach(function(c) { c.destroy(); });
    App.charts = [];

    var multi = document.getElementById('multiChannelChart');
    if (multi) {
        var chData = getDashboardChartData(App.dashboardChartPeriod);
        App.charts.push(new Chart(multi, {
            type: 'bar',
            data: {
                labels: chData.labels,
                datasets: [
                    { label: 'Cafe24', data: chData.cafe24, backgroundColor: 'rgba(59,130,246,0.5)', borderRadius: 4, stack: 'a' },
                    { label: '스마트스토어', data: chData.smartstore, backgroundColor: 'rgba(16,185,129,0.5)', borderRadius: 4, stack: 'a' },
                    { label: '쿠팡', data: chData.coupang, backgroundColor: 'rgba(249,115,22,0.5)', borderRadius: 4, stack: 'a' },
                    { label: 'ROAS (%)', type: 'line', data: chData.roas, borderColor: '#a78bfa', borderWidth: 2, pointRadius: 3, tension: 0.4, yAxisID: 'y1' }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { display: false } },
                scales: {
                    x: { stacked: true, grid: { display: false } },
                    y: { stacked: true, position: 'left' },
                    y1: { position: 'right', grid: { drawOnChartArea: false } }
                }
            }
        }));
    }

    var crm = document.getElementById('crmChart');
    if (crm) {
        App.charts.push(new Chart(crm, {
            type: 'doughnut',
            data: { labels: ['신규','충성','이탈'], datasets: [{ data: [45,35,20], backgroundColor: ['rgba(59,130,246,0.8)','rgba(139,92,246,0.8)','rgba(16,185,129,0.8)'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '72%', plugins: { legend: { display: false } } }
        }));
    }

    var profit = document.getElementById('profitChart');
    if (profit) {
        var pf = getProfitChartData();
        App.charts.push(new Chart(profit, {
            type: 'bar',
            data: {
                labels: pf.labels,
                datasets: [
                    { label: '광고 지출', data: pf.adSpend, backgroundColor: 'rgba(239,68,68,0.5)', borderRadius: 4 },
                    { label: '순이익', data: pf.netProfit, backgroundColor: 'rgba(16,185,129,0.5)', borderRadius: 4 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        }));
    }

    var margin = document.getElementById('marginChart');
    if (margin) {
        var s = getSettings();
        var margins = [s.margins.cafe24, s.margins.smartstore, s.margins.coupang, s.margins.ably];
        App.charts.push(new Chart(margin, {
            type: 'bar',
            data: {
                labels: ['Cafe24','스마트스토어','쿠팡','에이블리'],
                datasets: [{ label: '마진율', data: margins, backgroundColor: ['rgba(59,130,246,0.7)','rgba(16,185,129,0.7)','rgba(249,115,22,0.7)','rgba(236,72,153,0.7)'], borderRadius: 6 }]
            },
            options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { max: 50 } } }
        }));
    }

    document.querySelectorAll('.sparkline').forEach(function(el) {
        var wrap = el.parentElement;
        var d = el.dataset.spark.split(',').map(Number);
        App.charts.push(new Chart(el, {
            type: 'line',
            data: { labels: d.map(function(_, i) { return i; }), datasets: [{ data: d, borderColor: '#3b82f6', borderWidth: 1.5, pointRadius: 0, tension: 0.4, fill: true, backgroundColor: 'rgba(59,130,246,0.1)' }] },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                scales: { x: { display: false }, y: { display: false } },
                layout: { padding: 0 }
            }
        }));
        if (wrap) { wrap.style.width = '72px'; wrap.style.height = '28px'; }
    });

    var dhTrend = document.getElementById('dataHubTrendChart');
    if (dhTrend && dataHubRowsCache.length) {
        var dhLabels = dataHubRowsCache.map(function(r) { return r.period; });
        App.charts.push(new Chart(dhTrend, {
            type: 'line',
            data: {
                labels: dhLabels,
                datasets: [
                    { label: '매출', data: dataHubRowsCache.map(function(r) { return Math.round(r.revenue / 10000); }), borderColor: 'rgba(59,130,246,0.9)', backgroundColor: 'rgba(59,130,246,0.15)', borderWidth: 2, pointRadius: 3, tension: 0.35, fill: true, yAxisID: 'y' },
                    { label: '주문', data: dataHubRowsCache.map(function(r) { return r.orders; }), borderColor: 'rgba(16,185,129,0.9)', borderWidth: 2, pointRadius: 2, tension: 0.35, yAxisID: 'y1' },
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { maxRotation: 45, font: { size: 10 } } },
                    y: { position: 'left', title: { display: true, text: '만원', font: { size: 10 } } },
                    y1: { position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: '건', font: { size: 10 } } },
                }
            }
        }));
    }

    var dhChannel = document.getElementById('dataHubChannelChart');
    if (dhChannel) {
        var chData = App.dataHubChannels.filter(function(c) { return c.id !== 'all'; });
        var periodMult = { daily: 1, weekly: 7, monthly: 30, yearly: 365 }[dataHubFilter.period] || 1;
        App.charts.push(new Chart(dhChannel, {
            type: 'doughnut',
            data: {
                labels: chData.map(function(c) { return c.name; }),
                datasets: [{ data: chData.map(function(c) { return Math.round(28450000 * c.weight * periodMult / 10000); }), backgroundColor: ['rgba(59,130,246,0.8)','rgba(16,185,129,0.8)','rgba(249,115,22,0.8)','rgba(236,72,153,0.8)'], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } }
        }));
    }
}
function switchView(targetId) {
    App.currentView = targetId;
    var renderer = App.views[targetId];
    if (!renderer) return;
    document.getElementById('main-content').innerHTML = renderer();
    if (targetId === 'view-orders') {
        renderOrders(App.orders);
        applyPendingDrillDown();
    }
    if (targetId === 'view-activity') {
        activityFilter = { user: 'all', cat: 'all', search: '' };
        renderActivityTimeline();
    }
    if (targetId === 'view-datahub') {
        dataHubTableSearch = '';
        initDataHub();
        document.querySelectorAll('.db-sort-btn').forEach(function(btn) {
            var active = btn.dataset.sort === dataHubSort.field;
            btn.classList.toggle('active', active);
            if (active) btn.textContent = btn.dataset.label + (dataHubSort.dir === 'asc' ? ' ↑' : ' ↓');
        });
    }
    if (targetId === 'view-briefing') initBriefingView();
    if (targetId === 'view-settings') {
        initSettingsView();
    }
    if (targetId === 'view-archive') {
        initArchiveView();
    }
    if (targetId === 'view-comms') {
        commsActiveThreadId = null;
        initCommsView();
    }
    if (targetId === 'view-crm') {
        initCrmView();
    }
    requestAnimationFrame(function() {
        initCharts();
        bindChartPeriodTabs();
    });
}
function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(function(item) {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
            item.classList.add('active');
            var title = item.dataset.title || '';
            var group = item.dataset.group || '';
            updateBreadcrumb(title, group || null);
            switchView(item.dataset.target);
            if (window.innerWidth < 768) toggleMobileSidebar();
        });
    });
}
function initClock() {
    var days=['일','월','화','수','목','금','토'];
    function update(){
        var n=new Date();
        var el=document.getElementById('live-date'),tm=document.getElementById('live-time');
        if(el)el.textContent=n.getFullYear()+'. '+String(n.getMonth()+1).padStart(2,'0')+'. '+String(n.getDate()).padStart(2,'0')+' ('+days[n.getDay()]+')';
        if(tm)tm.textContent=String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0')+':'+String(n.getSeconds()).padStart(2,'0')+' KST';
    }
    update();setInterval(update,1000);
}
function initKeyboard() {
    document.addEventListener('keydown', function(e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openCommandPalette(); }
        if (e.altKey && e.key === 'h') { e.preventDefault(); goHome(); }
        if (e.key === 'Escape') {
            closeCommandPalette();
            closeCommsModal();
            closeCrmWizard();
            document.getElementById('notif-panel').classList.add('hidden');
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            var modal = document.getElementById('comms-modal');
            if (modal && modal.classList.contains('open')) {
                e.preventDefault();
                submitCommsRequestForm(e);
            }
        }
    });
    document.addEventListener('keydown', function(e) {
        var bodyEl = document.getElementById('comms-form-body');
        if (e.ctrlKey && e.key === 'Enter' && document.activeElement === bodyEl) {
            e.preventDefault();
            submitCommsRequestForm(e);
        }
    });
}
document.addEventListener('DOMContentLoaded', function() {
    App.demoLastRefresh = new Date();
    loadGlobalDateRange();
    loadNotificationReadState();
    loadCurrentUser();
    loadBriefingConfig();
    loadCrmCampaigns();
    loadPromoPlans();
    loadSettings();
    loadArchive();
    loadComms();
    initDateRangePicker();
    updateCurrentUserUI();
    renderNotifications();
    initNavigation();
    initClock();
    initKeyboard();
    refreshDemoUI();
    switchView('view-dashboard');
    updateBreadcrumb('통합 대시보드', null);
    var homeBtn = document.querySelector('[data-target="view-dashboard"]');
    if (homeBtn) homeBtn.classList.add('active');
    document.addEventListener('click', function(e) {
        var p = document.getElementById('notif-panel'), b = document.getElementById('notif-btn');
        if (p && !p.contains(e.target) && b && !b.contains(e.target)) p.classList.add('hidden');
        var dr = document.getElementById('date-range-wrap');
        if (dr && !dr.contains(e.target)) {
            var dm = document.getElementById('date-range-menu');
            if (dm) dm.classList.remove('open');
        }
        var us = document.getElementById('user-switch-menu');
        if (us && !e.target.closest('.p-4.border-t')) us.classList.remove('open');
    });
});
