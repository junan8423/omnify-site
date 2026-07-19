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
        { id: 'ORD-20260710-0847', channel: 'cafe24', productTitle: '비건 히알루론산 토너 외 1건', amount: 34000, status: 'pending', time: '22:28:14', sourceOrderId: 'C24-0847' },
        { id: 'ORD-20260710-0846', channel: 'smartstore', productTitle: '시카 리페어 크림 기획세트', amount: 52000, status: 'shipped', time: '22:25:03', sourceOrderId: 'NS-0846' },
        { id: 'ORD-20260710-0845', channel: 'coupang', productTitle: '옴므 올인원 로션 200ml', amount: 28000, status: 'shipped', time: '22:22:41', sourceOrderId: 'CP-0845' },
        { id: 'ORD-20260710-0844', channel: 'ably', productTitle: '글로우 업 세럼 30ml', amount: 45000, status: 'pending', time: '22:18:55', sourceOrderId: 'AB-0844' },
        { id: 'ORD-20260710-0843', channel: 'cafe24', productTitle: '선크림 SPF50+ 60ml', amount: 32000, status: 'processing', time: '22:15:22', sourceOrderId: 'C24-0843' },
        { id: 'ORD-20260710-0842', channel: 'smartstore', productTitle: '비타민C 앰플 20ml', amount: 38000, status: 'shipped', time: '22:10:08', sourceOrderId: 'NS-0842' },
        { id: 'ORD-20260710-0841', channel: 'coupang', productTitle: '클렌징 폼 150ml 2개입', amount: 24000, status: 'shipped', time: '22:05:33', sourceOrderId: 'CP-0841' },
        { id: 'ORD-20260710-0840', channel: 'ably', productTitle: '수분 마스크팩 10매', amount: 19000, status: 'processing', time: '22:01:17', sourceOrderId: 'AB-0840' },
    ],

    inventory: [
        { sku: 'SKU-COS-001', name: '코스메 히트 세럼 50ml', qtyWms: 24, qtyByChannel: { cafe24: 10, smartstore: 8, coupang: 4, ably: 2 }, safety: 50 },
        { sku: 'SKU-COS-002', name: '비건 수분 크림 100ml', qtyWms: 850, qtyByChannel: { cafe24: 300, smartstore: 280, coupang: 180, ably: 90 }, safety: 100 },
        { sku: 'SKU-COS-003', name: '시카 리페어 크림 50ml', qtyWms: 42, qtyByChannel: { cafe24: 15, smartstore: 12, coupang: 10, ably: 5 }, safety: 60 },
        { sku: 'SKU-COS-004', name: '글로우 업 세럼 30ml', qtyWms: 320, qtyByChannel: { cafe24: 100, smartstore: 90, coupang: 80, ably: 50 }, safety: 80 },
        { sku: 'SKU-COS-005', name: '선크림 SPF50+ 60ml', qtyWms: 156, qtyByChannel: { cafe24: 50, smartstore: 45, coupang: 40, ably: 21 }, safety: 70 },
    ],

    apiChannels: [
        { name: 'Cafe24 Enterprise', icon: '☁️', status: 'live', tokenExpiry: '45일 후', lastSync: '1분 전', orders: 428 },
        { name: '네이버 스마트스토어', icon: '🛒', status: 'live', tokenExpiry: '22일 후', lastSync: '2분 전', orders: 312 },
        { name: '쿠팡 Wing', icon: '📦', status: 'live', tokenExpiry: '18일 후', lastSync: '3분 전', orders: 287 },
        { name: '에이블리', icon: '👗', status: 'warn', tokenExpiry: '7일 후', lastSync: '5분 전', orders: 156 },
    ],

    syncHistory: [
        { time: '23:08:05', channel: 'Cafe24', icon: '☁️', job: '주문 · 재고 동기화', status: 'success', records: 428, duration: '42초' },
        { time: '23:08:12', channel: '스마트스토어', icon: '🛒', job: '주문 동기화', status: 'success', records: 312, duration: '38초' },
        { time: '23:07:55', channel: '쿠팡', icon: '📦', job: '주문 · 정산 동기화', status: 'success', records: 248, duration: '51초' },
        { time: '22:38:02', channel: '에이블리', icon: '👗', job: '주문 · 송장 동기화', status: 'warn', records: 184, duration: '1m 12s', note: '송장 대기 184건' },
        { time: '08:30:00', channel: '전체', icon: '💬', job: '데일리 브리핑 발송', status: 'success', records: 1, duration: '3초' },
        { time: '22:05:18', channel: 'Cafe24', icon: '☁️', job: '주문 · 재고 동기화', status: 'success', records: 415, duration: '39초' },
        { time: '21:35:44', channel: '에이블리', icon: '👗', job: 'OAuth 토큰 갱신', status: 'success', records: 1, duration: '2초' },
    ],

    teamMembers: [
        { id: 'kim', name: '김지현', role: '대표', email: 'kim@sample.co.kr', avatar: '김', color: 'from-primary to-accent', seatType: 'admin', active: true },
        { id: 'park', name: '박서연', role: '운영팀', email: 'park@sample.co.kr', avatar: '박', color: 'from-emerald-500 to-teal-500', seatType: 'member', active: true },
        { id: 'lee', name: '이준호', role: '마케팅', email: 'lee@sample.co.kr', avatar: '이', color: 'from-violet-500 to-purple-500', seatType: 'member', active: false },
        { id: 'choi', name: '최민지', role: 'CS팀', email: 'choi@sample.co.kr', avatar: '최', color: 'from-orange-500 to-amber-500', seatType: 'viewer', active: false },
    ],

    activityLogs: [
        { id: 1, userId: 'kim', action: '로그인', category: 'auth', type: 'success', detail: '대시보드 로그인 성공', meta: 'IP 211.234.**.45 · Chrome', time: '23:15:22', ago: '5분 전', date: '2026-07-10' },
        { id: 2, userId: 'park', action: '원천 처리 안내', category: 'orders', type: 'info', detail: '에이블리 발주 대기 12건 — 사방넷/채널에서 처리 안내', meta: 'ORD-BATCH-0710-12', time: '23:08:14', ago: '12분 전', date: '2026-07-10' },
        { id: 3, userId: 'lee', action: 'CRM 캠페인', category: 'crm', type: 'info', detail: '여름 시즌 오프 알림톡 캠페인 수정', meta: '타겟 8,420명 · 예약 발송', time: '22:54:03', ago: '26분 전', date: '2026-07-10' },
        { id: 4, userId: 'choi', action: '안전재고 경보값', category: 'inventory', type: 'info', detail: '코스메 히트 세럼 Omnify 경보 기준 50→60 (원천 재고 수량 변경 없음)', meta: 'SKU-COS-001', time: '22:41:55', ago: '39분 전', date: '2026-07-10' },
        { id: 5, userId: 'kim', action: '리포트 다운로드', category: 'report', type: 'info', detail: '7월 1주차 옴니채널 매출 PDF 생성', meta: '파일 2.4MB', time: '22:30:00', ago: '51분 전', date: '2026-07-10' },
        { id: 6, userId: 'park', action: '수동 동기화', category: 'sync', type: 'success', detail: '전 채널 주문 수동 동기화 실행', meta: '1,248건 수집 완료', time: '21:15:33', ago: '2시간 전', date: '2026-07-10' },
        { id: 7, userId: 'lee', action: '광고 예산 변경', category: 'marketing', type: 'warning', detail: 'Meta Ads 일 예산 ₩50만 → ₩65만 증액', meta: 'ROAS 3.2x 기준', time: '18:22:10', ago: '5시간 전', date: '2026-07-10' },
        { id: 8, userId: 'choi', action: '고객 응대', category: 'cs', type: 'info', detail: '스마트스토어 문의 3건 처리 완료', meta: '평균 응답 4분', time: '17:05:44', ago: '6시간 전', date: '2026-07-10' },
        { id: 9, userId: 'kim', action: 'API 설정', category: 'system', type: 'danger', detail: '에이블리 OAuth 토큰 수동 갱신 시도', meta: '자동 토큰 갱신 예약', time: '15:30:00', ago: '8시간 전', date: '2026-07-10' },
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
        { label: '프로모션 기획 · 성과', target: 'view-crm', icon: '🎯' },
        { label: 'AI 수익성 분석', target: 'view-profit', icon: '📈' },
        { label: 'API 연동 상태', target: 'view-api', icon: '🔗' },
        { label: '활동 이력', target: 'view-activity', icon: '🛡️' },
        { label: '설정', target: 'view-settings', icon: '⚙️' },
        { label: '자료실', target: 'view-archive', icon: '📁' },
        { label: '커뮤니케이션', target: 'view-comms', icon: '💬' },
        { label: 'Cafe24 어드민', action: () => openAdminLink('Cafe24 어드민', 'https://eclogin.cafe24.com/Shop/'), icon: '☁️' },
        { label: '스마트스토어 센터', action: () => openAdminLink('스마트스토어 센터', 'https://sell.smartstore.naver.com/'), icon: '🛒' },
        { label: '쿠팡 Wing', action: () => openAdminLink('쿠팡 Wing', 'https://wing.coupang.com/'), icon: '📦' },
        { label: '리포트 다운로드', action: function () {
            if (typeof OmnifyReportPrint !== 'undefined') OmnifyReportPrint.openReport('auto');
            else showToast('PDF 리포트 생성 중...', 'info');
        }, icon: '📄' },
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
                { target: 'view-orders', title: '주문 · 발주', group: '일상 운영', icon: 'orders', badge: { text: '184', class: 'bg-warning/20 text-warning w-5 h-5 rounded-full' } },
                { target: 'view-inventory', title: '통합 재고', subtitle: '조회', group: '일상 운영', icon: 'inventory', badge: { text: '6', class: 'bg-danger/20 text-danger w-5 h-5 rounded-full' } },
                { target: 'view-comms', title: '커뮤니케이션', group: '일상 운영', icon: 'briefing', badge: { text: '5', class: 'bg-accent/20 text-purple-300 w-5 h-5 rounded-full' } },
            ]
        },
        {
            label: '성장 · 마케팅',
            icon: '📈',
            items: [
                { target: 'view-crm', title: '프로모션 기획 · 성과', group: '성장 · 마케팅', icon: 'crm' },
                { target: 'view-profit', title: 'AI 수익성 분석', group: '성장 · 마케팅', icon: 'profit' },
            ]
        },
        {
            label: '인프라 · 연동',
            icon: '⚙️',
            items: [
                { target: 'view-api', title: 'API 연동 상태', group: '인프라 · 연동', icon: 'api' },
            ]
        },
        {
            label: '관리',
            icon: '🛡️',
            items: [
                { target: 'view-archive', title: 'Google Drive 자료실', group: '관리', icon: 'workflow', badge: { text: 'Drive', class: 'bg-[#4285f4]/20 text-blue-300' } },
                { target: 'view-activity', title: '활동 이력', group: '관리', icon: 'workflow', badge: { text: '17', class: 'bg-primary/20 text-blue-400 w-5 h-5 rounded-full' } },
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
    var orderCount = Math.max(1, Math.round(p.collected * rangeMult * Math.max(0.35, scale)));
    var aov = Math.round(dailyRevenue / orderCount);
    var newMembers = Math.max(12, Math.round(orderCount * 0.085));
    var returnRate = +(1.8 + (100 - marginGlobal) * 0.04).toFixed(1);
    var companyName = App.brandName || (App.tenantMeta && App.tenantMeta.companyName) || '고객사';

    return {
        companyName: companyName,
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
        orderCount: orderCount,
        orderCountFormatted: fmtCount(orderCount),
        aov: aov,
        aovFormatted: App.formatWon(aov),
        newMembers: newMembers,
        newMembersFormatted: fmtCount(newMembers),
        returnRate: returnRate,
        orderCountChange: '+8.4%',
        aovChange: '+2.1%',
        newMembersChange: '+11.0%',
        returnRateChange: '-0.3%p'
    };
}

function getDashboardChartData(period) {
    var s = getSettings();
    var scale = s.kpi.currentMonthlyRevenue / 637500000 * getDateRangeMultiplier();
    function sc(arr) { return arr.map(function(v) { return Math.round(v * scale); }); }
    var asOf = getDataHubAsOfDate();
    var i, d, labels;

    if (period === 'monthly') {
        labels = [];
        for (i = 6; i >= 0; i--) {
            d = new Date(asOf.getFullYear(), asOf.getMonth() - i, 1);
            labels.push((d.getMonth() + 1) + '월');
        }
        return {
            labels: labels,
            cafe24: sc([820, 910, 880, 950, 1020, 980, 1100]),
            smartstore: sc([650, 720, 690, 780, 840, 810, 900]),
            coupang: sc([480, 520, 500, 580, 620, 590, 680]),
            roas: [2.8, 3.0, 2.9, 3.1, 3.3, 3.2, 3.4].map(function(v) { return Math.round(v * 100); }),
        };
    }

    /* 주간: 최근 7일 (과거→오늘) */
    labels = [];
    var cafe24 = [], smartstore = [], coupang = [], roas = [];
    var baseC = [300, 320, 340, 360, 390, 480, 520];
    var baseS = [240, 255, 270, 285, 310, 400, 450];
    var baseP = [170, 180, 195, 210, 235, 310, 350];
    var baseR = [2.2, 2.35, 2.4, 2.55, 2.7, 3.3, 3.5];
    for (i = 6; i >= 0; i--) {
        d = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate() - i);
        labels.push((d.getMonth() + 1) + '/' + d.getDate());
        var lift = dataHubWeekdayLift(d.getDay());
        var noise = 0.96 + dataHubHashNoise(i * 7 + d.getDate()) * 0.08;
        var idx = 6 - i;
        cafe24.push(Math.round(baseC[idx] * lift * noise));
        smartstore.push(Math.round(baseS[idx] * lift * noise));
        coupang.push(Math.round(baseP[idx] * lift * noise));
        roas.push(Math.round(baseR[idx] * lift * 100));
    }
    return {
        labels: labels,
        cafe24: sc(cafe24),
        smartstore: sc(smartstore),
        coupang: sc(coupang),
        roas: roas
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
    var meta = (typeof TIER_META !== 'undefined' && TIER_META[App.tier]) ? TIER_META[App.tier] : null;
    var pill = meta ? meta.demoBadge : '목업 데이터';
    var mid = meta ? (App.tier === 'starter' ? '스타터 · 매일 브리핑' : App.tier === 'growth' ? '그로스 · 매일 브리핑' : '엔터프라이즈') : '데모 시연';
    sub.innerHTML = '<span class="demo-pill">' + pill + '</span>' + mid + ' · ' + App.globalDateRange.label + ' · 갱신 <span id="last-sync">' + hm + '</span>';
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
    if (typeof blockInventoryWrite === 'function') {
        blockInventoryWrite('발주·출고 확정');
        return;
    }
    showToast('발주·출고는 사방넷 또는 채널 어드민에서 처리하세요. Omnify는 상태 조회만 제공합니다.', 'warning');
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
var NOTIF_READ_KEY = 'sample_notifications_read_v2';
var CURRENT_USER_KEY = 'sample_current_user_v1';
var BRIEFING_CONFIG_KEY = 'sample_briefing_config_v1';
var DATE_RANGE_PRESETS = [
    { id: 'today', label: '오늘', group: '빠른 선택' },
    { id: 'yesterday', label: '전일', group: '빠른 선택' },
    { id: 'thisweek', label: '이번 주', group: '주 단위' },
    { id: 'lastweek', label: '지난 주', group: '주 단위' },
    { id: '7d', label: '최근 7일', group: '주 단위' },
    { id: '14d', label: '최근 14일', group: '주 단위' },
    { id: 'thismonth', label: '이번 달', group: '월 단위' },
    { id: 'lastmonth', label: '지난달', group: '월 단위' },
    { id: '30d', label: '최근 30일', group: '월 단위' },
    { id: '90d', label: '최근 90일', group: '월 단위' },
    { id: 'thisyear', label: '올해', group: '연 단위' },
    { id: 'lastyear', label: '작년', group: '연 단위' },
    { id: 'custom', label: '직접 지정', group: '직접 지정' }
];
App.globalDateRange = {
    preset: '7d', label: '최근 7일', multiplier: 1, dataHubPeriod: 'daily',
    start: '', end: ''
};
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
var BRIEFING_RECIPIENTS_KEY = 'sample_briefing_recipients_v1';
var BRIEFING_RECIPIENT_POOL = [
    { id: 'r1', name: '김지현', role: '대표', phone: '010-****-1201' },
    { id: 'r2', name: '박서연', role: '물류', phone: '010-****-2240' },
    { id: 'r3', name: '이준호', role: '마케팅', phone: '010-****-3388' },
    { id: 'r4', name: '최유진', role: 'CS', phone: '010-****-4412' },
    { id: 'r5', name: '정민수', role: 'MD', phone: '010-****-5520' },
    { id: 'r6', name: '한소희', role: '재무', phone: '010-****-6633' }
];
App.briefingRecipientIds = [];

function getBriefingRecipientLimitSafe() {
    if (App.tenantMeta && App.tenantMeta.briefingRecipients) return Number(App.tenantMeta.briefingRecipients) || 1;
    if (typeof getBriefingRecipientLimit === 'function') return getBriefingRecipientLimit(App.tier);
    var map = { starter: 1, growth: 3, enterprise: 5 };
    return map[App.tier] || 1;
}

function loadBriefingRecipients() {
    var lim = getBriefingRecipientLimitSafe();
    var pool = (window.__OMNIFY_BRIEFING_POOL__ && window.__OMNIFY_BRIEFING_POOL__.length)
        ? window.__OMNIFY_BRIEFING_POOL__
        : BRIEFING_RECIPIENT_POOL;
    try {
        var key = (typeof tenantStorageKey === 'function' ? tenantStorageKey(BRIEFING_RECIPIENTS_KEY) : BRIEFING_RECIPIENTS_KEY) + '_' + App.tier;
        var raw = localStorage.getItem(key);
        var ids = raw ? JSON.parse(raw) : null;
        if (!Array.isArray(ids) || !ids.length) {
            ids = pool.slice(0, lim).map(function(r) { return r.id; });
        }
        App.briefingRecipientIds = ids.filter(function(id) {
            return pool.some(function(r) { return r.id === id; });
        }).slice(0, lim);
        if (!App.briefingRecipientIds.length) {
            App.briefingRecipientIds = pool.slice(0, lim).map(function(r) { return r.id; });
        }
    } catch (e) {
        App.briefingRecipientIds = pool.slice(0, lim).map(function(r) { return r.id; });
    }
}

function persistBriefingRecipients() {
    try {
        var key = (typeof tenantStorageKey === 'function' ? tenantStorageKey(BRIEFING_RECIPIENTS_KEY) : BRIEFING_RECIPIENTS_KEY) + '_' + App.tier;
        localStorage.setItem(key, JSON.stringify(App.briefingRecipientIds));
    } catch (e) { /* ignore */ }
}

function toggleBriefingRecipient(id) {
    var lim = getBriefingRecipientLimitSafe();
    var idx = App.briefingRecipientIds.indexOf(id);
    if (idx >= 0) {
        if (App.briefingRecipientIds.length <= 1) {
            showToast('브리핑 수신자는 최소 1명 필요합니다.', 'warning');
            return;
        }
        App.briefingRecipientIds.splice(idx, 1);
    } else {
        if (App.briefingRecipientIds.length >= lim) {
            showToast('이 플랜 알림톡 수신은 ' + lim + '명까지입니다. 추가 수신은 별도 문의하세요.', 'warning');
            return;
        }
        App.briefingRecipientIds.push(id);
    }
    persistBriefingRecipients();
    renderBriefingRecipientsPanel();
}

function renderBriefingRecipientsPanel() {
    var el = document.getElementById('briefing-recipients-list');
    var meta = document.getElementById('briefing-recipients-meta');
    if (!el) return;
    var lim = getBriefingRecipientLimitSafe();
    var used = App.briefingRecipientIds.length;
    if (meta) {
        meta.innerHTML = '플랜 기본 <strong class="text-gray-300">' + lim + '명</strong> · 선택 <strong class="text-primary">' + used + '</strong>/' + lim +
            ' <span class="text-gray-600">· 1인 1통 · 매일 08:30 · 추가 시 별도 문의</span>';
    }
    el.innerHTML = ((window.__OMNIFY_BRIEFING_POOL__ && window.__OMNIFY_BRIEFING_POOL__.length)
        ? window.__OMNIFY_BRIEFING_POOL__
        : BRIEFING_RECIPIENT_POOL).map(function(r) {
        var on = App.briefingRecipientIds.indexOf(r.id) >= 0;
        var locked = !on && used >= lim;
        return '<button type="button" class="w-full flex items-center justify-between p-3 rounded-lg border text-left transition-colors ' +
            (on ? 'bg-primary/10 border-primary/40' : locked ? 'bg-surface/40 border-border opacity-50 cursor-not-allowed' : 'bg-surface border-border hover:border-primary/30') +
            '" ' + (locked ? 'disabled' : 'onclick="toggleBriefingRecipient(\'' + r.id + '\')"') + '>' +
            '<span><span class="text-sm font-semibold text-gray-200">' + r.name + '</span>' +
            '<span class="text-[10px] text-gray-500 ml-2">' + r.role + ' · ' + r.phone + '</span></span>' +
            '<span class="text-[10px] font-bold ' + (on ? 'text-primary' : 'text-gray-600') + '">' + (on ? '수신 ON' : (locked ? '한도' : 'OFF')) + '</span></button>';
    }).join('');
}

function datePad2(n) { return String(n).padStart(2, '0'); }

function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function fmtDateYmd(d) {
    return d.getFullYear() + '-' + datePad2(d.getMonth() + 1) + '-' + datePad2(d.getDate());
}

function fmtDateShort(d) {
    return (d.getMonth() + 1) + '/' + d.getDate();
}

function parseYmd(str) {
    if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
    var p = str.split('-');
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return isNaN(d.getTime()) ? null : startOfDay(d);
}

function daysInclusive(start, end) {
    return Math.max(1, Math.round((startOfDay(end) - startOfDay(start)) / 86400000) + 1);
}

function startOfWeekMon(d) {
    var day = d.getDay();
    var diff = day === 0 ? 6 : day - 1;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - diff);
}

function resolveDateRangeBounds(presetId, customStart, customEnd) {
    var today = startOfDay(new Date());
    var start = today;
    var end = today;
    var id = presetId === 'month' ? 'thismonth' : presetId;

    if (id === 'today') {
        start = end = today;
    } else if (id === 'yesterday') {
        start = end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
    } else if (id === 'thisweek') {
        start = startOfWeekMon(today);
        end = today;
    } else if (id === 'lastweek') {
        var thisMon = startOfWeekMon(today);
        end = new Date(thisMon.getFullYear(), thisMon.getMonth(), thisMon.getDate() - 1);
        start = startOfWeekMon(end);
    } else if (id === '7d') {
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
    } else if (id === '14d') {
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 13);
    } else if (id === '30d') {
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 29);
    } else if (id === '90d') {
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 89);
    } else if (id === 'thismonth') {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (id === 'lastmonth') {
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (id === 'thisyear') {
        start = new Date(today.getFullYear(), 0, 1);
    } else if (id === 'lastyear') {
        start = new Date(today.getFullYear() - 1, 0, 1);
        end = new Date(today.getFullYear() - 1, 11, 31);
    } else if (id === 'custom') {
        start = parseYmd(customStart);
        end = parseYmd(customEnd);
        if (!start || !end) return null;
        if (end < start) { var tmp = start; start = end; end = tmp; }
    } else {
        return null;
    }
    return { start: startOfDay(start), end: startOfDay(end) };
}

function dataHubPeriodForDays(days) {
    if (days <= 14) return 'daily';
    if (days <= 62) return 'weekly';
    return 'monthly';
}

function formatCustomRangeLabel(start, end) {
    if (start.getFullYear() === end.getFullYear()) {
        return fmtDateShort(start) + ' – ' + fmtDateShort(end);
    }
    return start.getFullYear() + '/' + fmtDateShort(start) + ' – ' + end.getFullYear() + '/' + fmtDateShort(end);
}

function buildGlobalDateRangeState(presetId, customStart, customEnd) {
    var id = presetId === 'month' ? 'thismonth' : presetId;
    var preset = DATE_RANGE_PRESETS.find(function(p) { return p.id === id; });
    if (!preset) return null;
    var bounds = resolveDateRangeBounds(id, customStart, customEnd);
    if (!bounds) return null;
    var days = daysInclusive(bounds.start, bounds.end);
    var multiplier = Math.round((days / 7) * 100) / 100;
    if (multiplier < 0.05) multiplier = 0.05;
    if (multiplier > 60) multiplier = 60;
    return {
        preset: id,
        label: id === 'custom' ? formatCustomRangeLabel(bounds.start, bounds.end) : preset.label,
        multiplier: multiplier,
        dataHubPeriod: dataHubPeriodForDays(days),
        start: fmtDateYmd(bounds.start),
        end: fmtDateYmd(bounds.end),
        days: days
    };
}

function loadGlobalDateRange() {
    try {
        var raw = localStorage.getItem(DATE_RANGE_KEY);
        if (!raw) {
            App.globalDateRange = buildGlobalDateRangeState('7d') || App.globalDateRange;
            return;
        }
        var saved = JSON.parse(raw);
        var id = saved.preset === 'month' ? 'thismonth' : saved.preset;
        var next = buildGlobalDateRangeState(id, saved.start, saved.end);
        if (next) App.globalDateRange = next;
        else App.globalDateRange = buildGlobalDateRangeState('7d') || App.globalDateRange;
    } catch (e) {
        App.globalDateRange = buildGlobalDateRangeState('7d') || App.globalDateRange;
    }
}

function persistGlobalDateRange() {
    try {
        localStorage.setItem(DATE_RANGE_KEY, JSON.stringify({
            preset: App.globalDateRange.preset,
            start: App.globalDateRange.start || '',
            end: App.globalDateRange.end || ''
        }));
    } catch (e) { /* ignore */ }
}

function getDateRangeMultiplier() {
    return App.globalDateRange.multiplier || 1;
}

function initDateRangePicker() {
    var menu = document.getElementById('date-range-menu');
    var label = document.getElementById('date-range-label');
    if (label) label.textContent = App.globalDateRange.label;
    if (!menu) return;

    var groups = [];
    DATE_RANGE_PRESETS.forEach(function(p) {
        if (groups.indexOf(p.group) < 0) groups.push(p.group);
    });

    var customStart = App.globalDateRange.start || fmtDateYmd(new Date(Date.now() - 6 * 86400000));
    var customEnd = App.globalDateRange.end || fmtDateYmd(new Date());
    var showCustom = App.globalDateRange.preset === 'custom';

    var html = '';
    groups.forEach(function(g) {
        if (g === '직접 지정') return;
        html += '<div class="date-range-group">';
        html += '<p class="date-range-group-label">' + g + '</p>';
        html += '<div class="date-range-grid">';
        DATE_RANGE_PRESETS.filter(function(p) { return p.group === g; }).forEach(function(p) {
            html += '<button type="button" class="date-range-opt' + (App.globalDateRange.preset === p.id ? ' active' : '') +
                '" onclick="setGlobalDateRange(\'' + p.id + '\')">' + p.label + '</button>';
        });
        html += '</div></div>';
    });

    html += '<div class="date-range-custom' + (showCustom ? ' open' : '') + '">';
    html += '<button type="button" class="date-range-opt date-range-custom-toggle' + (showCustom ? ' active' : '') +
        '" onclick="revealCustomDateRange(event)">직접 지정</button>';
    html += '<div class="date-range-custom-panel" id="date-range-custom-panel"' + (showCustom ? '' : ' hidden') + '>';
    html += '<div class="date-range-custom-fields">';
    html += '<label>시작<input type="date" id="date-range-start" value="' + customStart + '"></label>';
    html += '<label>종료<input type="date" id="date-range-end" value="' + customEnd + '"></label>';
    html += '</div>';
    html += '<button type="button" class="date-range-apply" onclick="applyCustomDateRange(event)">적용</button>';
    html += '</div></div>';

    menu.innerHTML = html;
}

function revealCustomDateRange(e) {
    if (e) e.stopPropagation();
    var panel = document.getElementById('date-range-custom-panel');
    var toggle = document.querySelector('.date-range-custom-toggle');
    if (panel) panel.hidden = false;
    if (toggle) toggle.classList.add('active');
    document.querySelectorAll('.date-range-opt').forEach(function(btn) {
        if (!btn.classList.contains('date-range-custom-toggle')) btn.classList.remove('active');
    });
}

function applyCustomDateRange(e) {
    if (e) e.stopPropagation();
    var startEl = document.getElementById('date-range-start');
    var endEl = document.getElementById('date-range-end');
    var start = startEl ? startEl.value : '';
    var end = endEl ? endEl.value : '';
    if (!start || !end) {
        showToast('시작·종료 날짜를 모두 선택해 주세요.', 'warning');
        return;
    }
    if (parseYmd(end) < parseYmd(start)) {
        showToast('종료일이 시작일보다 앞입니다.', 'warning');
        return;
    }
    setGlobalDateRange('custom', start, end);
}

function toggleDateRangeMenu(e) {
    if (e) e.stopPropagation();
    var menu = document.getElementById('date-range-menu');
    if (!menu) return;
    var opening = !menu.classList.contains('open');
    if (opening) initDateRangePicker();
    menu.classList.toggle('open', opening);
}

function setGlobalDateRange(presetId, customStart, customEnd) {
    if (presetId === 'custom' && (customStart == null || customEnd == null)) {
        revealCustomDateRange();
        return;
    }
    var next = buildGlobalDateRangeState(presetId, customStart, customEnd);
    if (!next) {
        showToast('기간을 확인할 수 없습니다.', 'warning');
        return;
    }
    App.globalDateRange = next;
    persistGlobalDateRange();
    initDateRangePicker();
    var menu = document.getElementById('date-range-menu');
    if (menu) menu.classList.remove('open');
    dataHubFilter.period = next.dataHubPeriod;
    App.demoLastRefresh = new Date();
    refreshMetricsViews();
    var hint = next.start && next.end ? (' · ' + next.start + ' ~ ' + next.end) : '';
    showToast('기간 필터: ' + next.label + hint + ' (데모)', 'info');
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
    var m = App.teamMembers.find(function(x) { return x.id === userId; });
    if (!m || m.active === false) return;
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
    var activeMembers = App.teamMembers.filter(function(m) { return m.active !== false; });
    menu.innerHTML = activeMembers.map(function(m) {
        return '<button type="button" class="user-switch-item ' + (m.id === App.currentUserId ? 'active' : '') + '" onclick="setCurrentUser(\'' + m.id + '\')">' +
            '<span class="w-6 h-6 rounded-full bg-gradient-to-br ' + m.color + ' flex items-center justify-center text-[9px] font-bold text-white">' + m.avatar + '</span>' +
            '<span>' + m.name + ' <span class="text-gray-500">(' + m.role + (m.seatType === 'viewer' ? '·뷰어' : '') + ')</span></span></button>';
    }).join('') +
    '<div class="border-t border-border mt-1 pt-1 px-2 pb-1">' +
        '<button type="button" onclick="navigateTo(\'view-settings\'); setSettingsTab(\'team\')" class="w-full text-left text-[10px] text-primary font-semibold py-2 hover:underline">팀 · 좌석 관리 →</button>' +
    '</div>';
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
    if (App.tenantCustom && App.tenantCustom.briefing && App.tenantCustom.briefing.items) {
        Object.assign(cfg, App.tenantCustom.briefing.items);
    }
    return cfg;
}

function loadBriefingConfig() {
    try {
        var key = typeof tenantStorageKey === 'function' ? tenantStorageKey(BRIEFING_CONFIG_KEY) : BRIEFING_CONFIG_KEY;
        var raw = localStorage.getItem(key);
        App.briefingConfig = raw ? Object.assign(getBriefingConfigDefaults(), JSON.parse(raw)) : getBriefingConfigDefaults();
    } catch (e) { App.briefingConfig = getBriefingConfigDefaults(); }
}

function persistBriefingConfig() {
    try {
        var key = typeof tenantStorageKey === 'function' ? tenantStorageKey(BRIEFING_CONFIG_KEY) : BRIEFING_CONFIG_KEY;
        localStorage.setItem(key, JSON.stringify(App.briefingConfig));
    } catch (e) { /* ignore */ }
}

function toggleBriefingItem(id) {
    App.briefingConfig[id] = !App.briefingConfig[id];
    persistBriefingConfig();
    renderBriefingConfigPanel();
    renderBriefingPreview();
}

function closeHomeDetailPopup() {
    var modal = document.getElementById('home-detail-modal');
    if (modal) {
        modal.classList.remove('open');
        delete modal.dataset.report;
    }
    document.removeEventListener('keydown', _homeDetailEscHandler);
}

function _homeDetailEscHandler(e) {
    if (e.key === 'Escape') closeHomeDetailPopup();
}

function buildHomeDetailPayload(type) {
    var m = getMockMetrics();
    var s = typeof getSettings === 'function' ? getSettings() : { margins: {}, kpi: {} };
    var channels = [
        { name: 'Cafe24', share: 0.34, margin: s.margins && s.margins.cafe24 },
        { name: '스마트스토어', share: 0.28, margin: s.margins && s.margins.smartstore },
        { name: '쿠팡', share: 0.22, margin: s.margins && s.margins.coupang },
        { name: '에이블리', share: 0.16, margin: s.margins && s.margins.ably }
    ];
    if (type === 'revenue') {
        var rows = channels.map(function (c) {
            var amt = Math.round(m.dailyRevenue * c.share);
            return '<tr><td>' + c.name + '</td><td class="text-right font-mono">' + App.formatWon(amt) +
                '</td><td class="text-right">' + Math.round(c.share * 100) + '%</td><td class="text-right">' +
                (c.margin != null ? c.margin + '%' : '-') + '</td></tr>';
        }).join('');
        return {
            title: m.companyName + ' 채널통합매출',
            sub: App.globalDateRange.label + ' · 채널별 분해 (샘플)',
            report: 'dashboard',
            body: '<div class="grid grid-cols-2 gap-2 mb-3">' +
                '<div class="home-ops-cell"><p class="lab">합계</p><p class="val" style="font-size:1rem">' + m.dailyRevenueFormatted + '</p></div>' +
                '<div class="home-ops-cell"><p class="lab">전일 대비</p><p class="val text-success" style="font-size:1rem">' + m.dailyRevenueChange + '</p></div></div>' +
                '<table class="home-detail-table"><thead><tr><th>채널</th><th class="text-right">매출</th><th class="text-right">비중</th><th class="text-right">마진</th></tr></thead><tbody>' +
                rows + '</tbody></table>' +
                '<p class="text-[11px] text-gray-500 mt-3">화면 이동 없이 홈에서 확인하는 상세 레이아웃입니다. 인쇄는 상단 「출력」을 사용하세요.</p>'
        };
    }
    if (type === 'ops' || type === 'margin') {
        return {
            title: '오늘의 운영 요약',
            sub: App.globalDateRange.label + ' · 주문·객단가·회원·반품',
            report: 'dashboard',
            body: '<div class="grid grid-cols-2 gap-2 mb-3">' +
                '<div class="home-ops-cell"><p class="lab">주문건수</p><p class="val">' + m.orderCountFormatted + '</p><p class="delta text-success">▲ ' + m.orderCountChange + '</p></div>' +
                '<div class="home-ops-cell"><p class="lab">객단가</p><p class="val" style="font-size:.95rem">' + m.aovFormatted + '</p><p class="delta text-success">▲ ' + m.aovChange + '</p></div>' +
                '<div class="home-ops-cell"><p class="lab">신규회원</p><p class="val">' + m.newMembersFormatted + '</p><p class="delta text-success">▲ ' + m.newMembersChange + '</p></div>' +
                '<div class="home-ops-cell"><p class="lab">반품율</p><p class="val">' + m.returnRate + '%</p><p class="delta text-success">▼ ' + m.returnRateChange + '</p></div></div>' +
                '<table class="home-detail-table"><thead><tr><th>지표</th><th>설명</th><th class="text-right">값</th></tr></thead><tbody>' +
                '<tr><td>수집 주문</td><td class="text-gray-400">파이프라인 금일 수집</td><td class="text-right font-mono">' + fmtCount(m.pipeline.collected) + '</td></tr>' +
                '<tr><td>발주 대기</td><td class="text-gray-400">미처리 송장·발주</td><td class="text-right font-mono">' + fmtCount(m.pipeline.pending) + '</td></tr>' +
                '<tr><td>출고 완료</td><td class="text-gray-400">금일 출고</td><td class="text-right font-mono">' + fmtCount(m.pipeline.shipped) + '</td></tr>' +
                '</tbody></table>'
        };
    }
    if (type === 'target') {
        var cur = s.kpi && s.kpi.currentMonthlyRevenue ? s.kpi.currentMonthlyRevenue : 0;
        var tgt = s.kpi && s.kpi.monthlyRevenueTarget ? s.kpi.monthlyRevenueTarget : 1;
        return {
            title: '이달 AI 예상 마감 매출',
            sub: '목표 대비 달성률 ' + m.kpiPct + '%',
            report: 'dashboard',
            body: '<div class="grid grid-cols-2 gap-2 mb-3">' +
                '<div class="home-ops-cell"><p class="lab">예상 마감</p><p class="val" style="font-size:1rem">' + m.monthlyTargetFormatted + '</p></div>' +
                '<div class="home-ops-cell"><p class="lab">달성률</p><p class="val text-success" style="font-size:1rem">' + m.kpiPct + '%</p></div></div>' +
                '<div class="w-full bg-gray-800 rounded-full h-2 mb-3"><div class="h-2 rounded-full bg-gradient-to-r from-primary to-accent" style="width:' + m.kpiPct + '%"></div></div>' +
                '<table class="home-detail-table"><thead><tr><th>항목</th><th class="text-right">금액</th></tr></thead><tbody>' +
                '<tr><td>월 매출 목표</td><td class="text-right font-mono">' + App.formatWon(tgt) + '</td></tr>' +
                '<tr><td>현재 누적(목업)</td><td class="text-right font-mono">' + App.formatWon(cur) + '</td></tr>' +
                '<tr><td>잔여 목표</td><td class="text-right font-mono">' + App.formatWon(Math.max(0, tgt - cur)) + '</td></tr>' +
                '</tbody></table>'
        };
    }
    if (type === 'actions') {
        var pending = (App.orders || []).filter(function (o) { return o.status === 'pending'; }).slice(0, 8);
        var rows2 = pending.map(function (o) {
            return '<tr><td class="font-mono text-xs">' + o.id + '</td><td>' + o.channel + '</td><td class="truncate max-w-[160px]">' +
                (o.product || o.productTitle || '') + '</td><td class="text-right font-mono">' + App.formatWon(o.amount) + '</td></tr>';
        }).join('');
        return {
            title: '미처리 액션',
            sub: '긴급 ' + m.urgentActions + ' · 전체 ' + m.pendingActions + '건',
            report: 'orders',
            body: '<div class="grid grid-cols-3 gap-2 mb-3">' +
                '<div class="home-ops-cell"><p class="lab">미처리</p><p class="val">' + m.pendingActions + '</p></div>' +
                '<div class="home-ops-cell"><p class="lab">발주대기</p><p class="val text-warning">' + fmtCount(m.pendingShipments) + '</p></div>' +
                '<div class="home-ops-cell"><p class="lab">위험재고</p><p class="val text-danger">' + m.atRiskInventory + '</p></div></div>' +
                '<p class="text-xs font-bold text-gray-400 mb-1.5">발주 대기 주문 (샘플)</p>' +
                '<table class="home-detail-table"><thead><tr><th>주문</th><th>채널</th><th>상품</th><th class="text-right">금액</th></tr></thead><tbody>' +
                (rows2 || '<tr><td colspan="4">대기 주문 없음</td></tr>') + '</tbody></table>'
        };
    }
    if (type === 'promo') {
        var ps = getHomePromoSummary();
        var list = (typeof promoPlans !== 'undefined' && promoPlans) ? promoPlans : [];
        var prows = list.map(function (p) {
            var st = p.status === 'active' ? '진행' : (p.status === 'planning' ? '기획' : '완료');
            return '<tr><td>' + (p.label || p.title || '') + '</td><td>' + st + '</td><td class="text-xs text-gray-400">' +
                (p.startDate || '') + ' ~ ' + (p.endDate || '') + '</td><td class="text-right font-mono">' +
                App.formatWon(p.kpi && p.kpi.actualRevenue) + '</td></tr>';
        }).join('');
        return {
            title: '프로모션 현황 상세',
            sub: '진행 ' + ps.active + ' · 기획 ' + ps.planning + ' · 완료 ' + ps.completed,
            report: 'promo',
            body: '<div class="grid grid-cols-3 gap-2 mb-3">' +
                '<div class="home-ops-cell"><p class="lab">목표 대비</p><p class="val">' + ps.pct + '%</p></div>' +
                '<div class="home-ops-cell"><p class="lab">실적</p><p class="val" style="font-size:.85rem">' + App.formatWon(ps.actual) + '</p></div>' +
                '<div class="home-ops-cell"><p class="lab">목표</p><p class="val" style="font-size:.85rem">' + App.formatWon(ps.target) + '</p></div></div>' +
                '<table class="home-detail-table"><thead><tr><th>프로모션</th><th>상태</th><th>기간</th><th class="text-right">실적</th></tr></thead><tbody>' +
                (prows || '<tr><td colspan="4">등록된 프로모션 없음</td></tr>') + '</tbody></table>' +
                '<p class="text-[11px] text-gray-500 mt-3">홈에서는 요약·스케줄만 제공합니다. CRM 메뉴로의 바로가기는 없습니다.</p>'
        };
    }
    return {
        title: '상세 내역',
        sub: '',
        report: 'dashboard',
        body: '<p class="text-sm text-gray-400">표시할 상세 데이터가 없습니다.</p>'
    };
}

function openHomeDetailPopup(type) {
    var payload = buildHomeDetailPayload(type);
    var modal = document.getElementById('home-detail-modal');
    var title = document.getElementById('home-detail-title');
    var sub = document.getElementById('home-detail-sub');
    var body = document.getElementById('home-detail-body');
    if (!modal || !body) {
        showToast('상세 팝업을 열 수 없습니다.', 'warning');
        return;
    }
    if (title) title.textContent = payload.title;
    if (sub) sub.textContent = payload.sub || '';
    body.innerHTML = payload.body;
    modal.dataset.report = payload.report || 'dashboard';
    modal.classList.add('open');
    document.addEventListener('keydown', _homeDetailEscHandler);
}

function drillDownKpi(type) {
    openHomeDetailPopup(type === 'margin' ? 'ops' : type);
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
    updateBriefingConfigSummary();
}

function updateBriefingConfigSummary() {
    var summary = document.getElementById('briefing-config-summary');
    if (!summary) return;
    var onCount = BRIEFING_ITEM_DEFS.filter(function (item) { return App.briefingConfig[item.id]; }).length;
    var body = document.getElementById('briefing-config-body');
    var collapsed = !body || body.classList.contains('hidden');
    summary.textContent = (collapsed ? '접힘' : '펼침') + ' · ON ' + onCount + '/' + BRIEFING_ITEM_DEFS.length + '항목';
}

function toggleBriefingConfigCollapse() {
    var body = document.getElementById('briefing-config-body');
    var btn = document.getElementById('briefing-config-toggle');
    var chev = document.getElementById('briefing-config-chevron');
    if (!body) return;
    var willOpen = body.classList.contains('hidden');
    body.classList.toggle('hidden', !willOpen);
    if (btn) btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    if (chev) chev.style.transform = willOpen ? 'rotate(180deg)' : 'rotate(0deg)';
    updateBriefingConfigSummary();
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
    loadBriefingRecipients();
    renderBriefingConfigPanel();
    renderBriefingPreview();
    renderBriefingRecipientsPanel();
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

/* ── 프로모션 기획 · 성과 (실행은 외부 도구) ── */
var crmActiveTab = 'calendar';
var PROMO_STORAGE_KEY = 'sample_promo_plans_v2';
var promoPlans = null;
var promoCalendarMode = 'month';
var promoCalendarCursor = new Date(2026, 6, 10);
var promoActivePlanId = null;
var promoModalState = { editId: null, defaultDate: null, fromCalendar: false };

function getHomePromoSummary() {
    try {
        if (typeof loadPromoPlans === 'function' && (!promoPlans || !promoPlans.length)) loadPromoPlans();
    } catch (e) { /* ignore */ }
    var list = Array.isArray(promoPlans) ? promoPlans : [];
    var active = list.filter(function (p) { return p.status === 'active'; });
    var planning = list.filter(function (p) { return p.status === 'planning'; });
    var completed = list.filter(function (p) { return p.status === 'completed'; });
    var focus = active[0] || planning[0] || list[0] || null;
    var target = list.reduce(function (s, p) { return s + (p.kpi && p.kpi.targetRevenue ? p.kpi.targetRevenue : 0); }, 0);
    var actual = list.reduce(function (s, p) { return s + (p.kpi && p.kpi.actualRevenue ? p.kpi.actualRevenue : 0); }, 0);
    var pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;
    return {
        count: list.length,
        active: active.length,
        planning: planning.length,
        completed: completed.length,
        focus: focus,
        target: target,
        actual: actual,
        pct: pct
    };
}

function renderHomePromoMiniCalHtml() {
    if (typeof loadPromoPlans === 'function' && (!promoPlans || !promoPlans.length)) loadPromoPlans();
    var cursor = (typeof promoCalendarCursor !== 'undefined' && promoCalendarCursor)
        ? new Date(promoCalendarCursor.getFullYear(), promoCalendarCursor.getMonth(), 1)
        : new Date(2026, 6, 1);
    var y = cursor.getFullYear();
    var m = cursor.getMonth();
    var firstDay = new Date(y, m, 1);
    var startOffset = (firstDay.getDay() + 6) % 7;
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var prevMonthDays = new Date(y, m, 0).getDate();
    var todayStr = typeof formatPromoDate === 'function' ? formatPromoDate(new Date(2026, 6, 10)) : '2026-07-10';
    var days = [];
    for (var i = 0; i < startOffset; i++) {
        var pd = prevMonthDays - startOffset + i + 1;
        days.push('<div class="day muted"><div class="dnum">' + pd + '</div></div>');
    }
    for (var day = 1; day <= daysInMonth; day++) {
        var dateStr = formatPromoDate(new Date(y, m, day));
        var events = typeof getPromoPlansForDate === 'function' ? getPromoPlansForDate(dateStr) : [];
        var pills = events.slice(0, 2).map(function (p) {
            var cls = p.status === 'active' ? '' : (p.status === 'planning' ? ' plan' : ' done');
            var lab = (p.label || p.title || '').slice(0, 8);
            return '<span class="pill' + cls + '" title="' + (p.label || p.title || '') + '">' + lab + '</span>';
        }).join('');
        if (events.length > 2) pills += '<span class="pill plan">+' + (events.length - 2) + '</span>';
        days.push('<div class="day' + (dateStr === todayStr ? '" style="outline:1px solid rgba(59,130,246,.55)' : '') +
            '"><div class="dnum">' + day + '</div>' + pills + '</div>');
    }
    var total = startOffset + daysInMonth;
    var remain = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (var j = 1; j <= remain; j++) {
        days.push('<div class="day muted"><div class="dnum">' + j + '</div></div>');
    }
    return '<div class="home-promo-mini-cal">' +
        '<div class="flex items-center justify-between px-2.5 py-2 border-b border-border/60">' +
        '<p class="text-[11px] font-bold text-gray-300">' + y + '년 ' + (m + 1) + '월 스케줄</p>' +
        '<span class="text-[10px] text-gray-500">축소판</span></div>' +
        '<div class="dow"><span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span><span>일</span></div>' +
        '<div class="days">' + days.join('') + '</div></div>';
}

function renderHomePromoCardHtml() {
    var ps = getHomePromoSummary();
    var focus = ps.focus;
    var focusTitle = focus ? (focus.label || focus.title) : '등록된 프로모션 없음';
    var focusMeta = focus
        ? ((focus.startDate || '') + (focus.endDate ? ' ~ ' + focus.endDate : '') + ' · ' + (focus.channels || []).slice(0, 3).join(', '))
        : '기간·채널·목표를 등록하면 여기에 요약됩니다';
    var statusChip = focus
        ? (focus.status === 'active' ? '<span class="promo-chip">진행중</span>'
            : focus.status === 'planning' ? '<span class="promo-chip plan">기획</span>'
            : '<span class="promo-chip done">완료</span>')
        : '<span class="promo-chip plan">대기</span>';
    var revLabel = ps.target >= 100000000
        ? (ps.actual / 100000000).toFixed(1) + ' / ' + (ps.target / 100000000).toFixed(1) + '억'
        : App.formatWon(ps.actual) + ' / ' + App.formatWon(ps.target);

    return `
    <div class="glass rounded-xl p-4 home-promo-card" id="home-promo-card">
        <div class="chart-card-header mb-3">
            <div class="chart-card-title">
                <h2>프로모션 현황</h2>
                <span class="chart-unit-badge">${ps.active} 진행</span>
            </div>
            <button type="button" onclick="openHomeDetailPopup('promo')" class="text-[11px] text-primary font-bold hover:underline shrink-0">상세</button>
        </div>
        <div class="home-promo-split">
            <div class="min-w-0 flex flex-col">
                <div class="flex items-start gap-2 mb-3">
                    <div class="min-w-0">
                        <div class="flex items-center gap-2 mb-1 flex-wrap">${statusChip}<p class="text-sm font-bold truncate">${focusTitle}</p></div>
                        <p class="text-[11px] text-gray-500">${focusMeta}</p>
                    </div>
                </div>
                <div class="grid grid-cols-3 gap-2 mb-3">
                    <div class="home-ops-cell"><p class="lab">진행</p><p class="val">${ps.active}</p></div>
                    <div class="home-ops-cell"><p class="lab">기획</p><p class="val">${ps.planning}</p></div>
                    <div class="home-ops-cell"><p class="lab">완료</p><p class="val">${ps.completed}</p></div>
                </div>
                <div class="mb-1 flex justify-between text-[10px] text-gray-500">
                    <span>기간 매출 목표 대비</span><span class="font-mono text-gray-300">${revLabel} · ${ps.pct}%</span>
                </div>
                <div class="w-full bg-gray-800 rounded-full h-1.5 mb-3">
                    <div class="h-1.5 rounded-full bg-gradient-to-r from-primary to-accent" style="width:${ps.pct}%"></div>
                </div>
                <p class="text-[11px] text-gray-500 mb-3 leading-relaxed">좌측은 기간 프로모션 써머리, 우측은 스케줄 축소판입니다. 메뉴 바로가기 없이 홈에서만 확인합니다.</p>
                <div class="mt-auto flex gap-2">
                    <button type="button" onclick="openHomeDetailPopup('promo')" class="flex-1 text-xs font-semibold py-2 rounded-lg bg-surface border border-border hover:border-primary/40">써머리 상세</button>
                    <button type="button" onclick="typeof openPromoPlanModal==='function'&&openPromoPlanModal()" class="flex-1 text-xs font-semibold py-2 rounded-lg bg-primary/90 text-white hover:bg-primary">+ 프로모션</button>
                </div>
            </div>
            <div class="min-w-0">${renderHomePromoMiniCalHtml()}</div>
        </div>
    </div>`;
}

function getPipelineHealth() {
    var warn = (App.apiChannels || []).some(function (c) { return c.status === 'warn' || c.status === 'error'; });
    var latest = (App.syncHistory || [])[0];
    return {
        ok: !warn,
        label: warn ? '주의' : '정상',
        badge: warn ? '!' : 'OK',
        latest: latest
    };
}

function refreshPipelinePanel() {
    var health = getPipelineHealth();
    var btn = document.getElementById('pipeline-btn');
    var badge = document.getElementById('pipeline-header-badge');
    var chip = document.getElementById('pipeline-status-chip');
    if (btn) {
        btn.classList.toggle('pipe-ok', health.ok);
        btn.classList.toggle('pipe-warn', !health.ok);
    }
    if (badge) {
        badge.textContent = health.badge;
        badge.style.background = health.ok ? '#10b981' : '#f59e0b';
    }
    if (chip) {
        chip.textContent = health.label;
        chip.className = 'text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ' +
            (health.ok ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20');
    }
    var flow = document.getElementById('pipeline-flow');
    if (flow) {
        var steps = ['Cron', 'API Sync', 'Parse', 'Store', '브리핑'];
        flow.innerHTML = steps.map(function (n, i) {
            return (i > 0 ? '<div class="w-5 h-0.5 bg-gray-700 shrink-0' + (i === 1 ? ' flow-line' : '') + '"></div>' : '') +
                '<div class="shrink-0 flex flex-col items-center gap-1">' +
                '<div class="w-9 h-9 rounded-lg ' + (i === 1 ? 'bg-primary/20 border-2 border-primary pulse-live' : 'bg-surface border border-border') +
                ' flex items-center justify-center text-[8px] font-bold ' + (i === 1 ? 'text-primary' : 'text-gray-400') + '">' + n + '</div></div>';
        }).join('');
    }
    var list = document.getElementById('pipeline-sync-list');
    if (list) {
        var rows = (App.syncHistory || []).slice(0, 4);
        list.innerHTML = rows.map(function (row) {
            var ok = row.status === 'success';
            return '<div class="flex items-start gap-2 p-1.5 rounded-lg bg-surface/60 border border-border/60">' +
                '<span class="pipeline-dot ' + (ok ? '' : 'warn') + ' mt-1.5 shrink-0"></span>' +
                '<div class="min-w-0 flex-1">' +
                '<p class="font-semibold text-gray-200 truncate">' + (row.channel || '') + ' · ' + (row.job || '') + '</p>' +
                '<p class="text-[10px] text-gray-500">' + (row.time || '') + ' · ' + (row.records != null ? fmtCount(row.records) + '건' : '') +
                (row.note ? ' · ' + row.note : '') + '</p></div></div>';
        }).join('') || '<p class="text-gray-500">동기화 이력이 없습니다.</p>';
    }
}

function togglePipelinePanel(e) {
    if (e) e.stopPropagation();
    var panel = document.getElementById('pipeline-panel');
    var btn = document.getElementById('pipeline-btn');
    if (!panel) return;
    var open = !panel.classList.contains('open');
    panel.classList.toggle('open', open);
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
        refreshPipelinePanel();
        var notif = document.getElementById('notif-panel');
        if (notif) notif.classList.add('hidden');
    }
}

function closePipelinePanel() {
    var panel = document.getElementById('pipeline-panel');
    var btn = document.getElementById('pipeline-btn');
    if (panel) panel.classList.remove('open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
}

function getPromoStatsSummary() {
    if (!promoPlans) loadPromoPlans();
    var active = promoPlans.filter(function(p) { return p.status === 'active'; }).length;
    var planning = promoPlans.filter(function(p) { return p.status === 'planning'; }).length;
    var completed = promoPlans.filter(function(p) { return p.status === 'completed'; }).length;
    var totalTarget = promoPlans.reduce(function(s, p) { return s + (p.kpi.targetRevenue || 0); }, 0);
    var totalActual = promoPlans.reduce(function(s, p) { return s + (p.kpi.actualRevenue || 0); }, 0);
    var avgPct = totalTarget ? Math.round((totalActual / totalTarget) * 100) : 0;
    return { active: active, planning: planning, completed: completed, avgPct: avgPct };
}

function dgRefresh() {
    if (typeof DashboardGuide !== 'undefined' && DashboardGuide.refresh) {
        DashboardGuide.refresh(App.currentView);
    }
}

function initCrmView() {
    loadPromoPlans();
    renderCrmStats();
    switchCrmTab(crmActiveTab, true);
    dgRefresh();
}

function switchCrmTab(tab, skipPersist) {
    crmActiveTab = tab;
    document.querySelectorAll('.crm-tab-btn').forEach(function(btn) {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    ['calendar', 'kpi'].forEach(function(t) {
        var panel = document.getElementById('crm-panel-' + t);
        if (panel) panel.classList.toggle('hidden', t !== tab);
    });
    if (tab === 'calendar') {
        renderPromoCalendar();
    } else if (tab === 'kpi') {
        renderPromoKpiPanel();
    }
    dgRefresh();
}

function renderCrmStats() {
    var el = document.getElementById('crm-stats');
    if (!el) return;
    var s = getPromoStatsSummary();
    el.innerHTML = [
        ['진행 중', s.active + '건', '외부 실행·성과 추적'],
        ['기획 중', s.planning + '건', '캘린더 등록'],
        ['완료', s.completed + '건', '회고·실적 입력'],
        ['평균 달성률', s.avgPct + '%', '목표 매출 대비'],
    ].map(function(k) {
        return '<div class="glass rounded-xl p-4"><p class="text-[10px] text-gray-500">' + k[0] + '</p><p class="text-xl font-extrabold">' + k[1] + '</p><p class="text-[10px] text-gray-600">' + k[2] + '</p></div>';
    }).join('');
}

var PROMO_TYPE_OPTIONS = [
    { id: 'season_sale', label: '시즌 세일', css: 'type-season' },
    { id: 'flash_sale', label: '플래시 세일', css: 'type-flash' },
    { id: 'coupon', label: '쿠폰 프로모션', css: 'type-coupon' },
    { id: 'crm_push', label: 'CRM 푸시', css: 'type-crm' },
    { id: 'bundle', label: '번들 · 세트', css: 'type-bundle' },
];
var PROMO_STATUS_OPTIONS = {
    planning: ['기획 중', 'promo-st promo-st-plan'],
    active: ['진행 중', 'promo-st promo-st-active'],
    completed: ['완료', 'promo-st promo-st-done']
};
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
          startDate: '2026-07-08', endDate: '2026-07-20', owner: 'lee', budget: 12000000,
          channels: ['cafe24', 'smartstore', 'ably', 'alimtalk'],
          memo: '스킨케어·선케어 카테고리 · VIP 20% 동시 쿠폰 · 인스타 소재 3종',
          executionTool: '솔라피 · 카카오 비즈메시지 (외부 실행)',
          abTest: { enabled: true, variantALabel: 'A안 · 20% 쿠폰', variantBLabel: 'B안 · 25% 쿠폰', winner: 'B',
            variantA: { sent: 6120, converted: 612, revenue: 28400000 },
            variantB: { sent: 6120, converted: 734, revenue: 33100000 } },
          kpi: { targetSent: 15000, targetOpenRate: 46, targetConversion: 3.2, targetRoas: 3.6, targetRevenue: 220000000,
                 actualSent: 12240, actualOpened: 8813, actualConverted: 1346, actualRevenue: 98600000, actualRoas: 3.1, inputAt: '2026-07-14' } },
        { id: 'pp-demo-2', title: '쿠팡 Wing 반짝특가', type: 'flash_sale', status: 'active',
          startDate: '2026-07-12', endDate: '2026-07-14', owner: 'kim', budget: 3500000,
          channels: ['coupang'], memo: '48h 히트 SKU 8종 · 로켓배송 강조 뱃지',
          executionTool: '쿠팡 Wing 프로모션 센터',
          abTest: { enabled: false, variantALabel: 'A안', variantBLabel: 'B안', winner: null,
            variantA: { sent: 0, converted: 0, revenue: 0 }, variantB: { sent: 0, converted: 0, revenue: 0 } },
          kpi: { targetSent: 0, targetOpenRate: 0, targetConversion: 4.8, targetRoas: 4.2, targetRevenue: 72000000,
                 actualSent: 0, actualOpened: 0, actualConverted: 918, actualRevenue: 51400000, actualRoas: 3.9, inputAt: '2026-07-14' } },
        { id: 'pp-demo-3', title: '스마트스토어 리뷰 더블', type: 'coupon', status: 'active',
          startDate: '2026-07-01', endDate: '2026-07-31', owner: 'lee', budget: 2500000,
          channels: ['smartstore', 'alimtalk'], memo: '포토리뷰 적립금 2배 · 베스트리뷰 추첨',
          executionTool: '스마트스토어 센터 · 알림톡',
          abTest: { enabled: false, variantALabel: 'A안', variantBLabel: 'B안', winner: null,
            variantA: { sent: 0, converted: 0, revenue: 0 }, variantB: { sent: 0, converted: 0, revenue: 0 } },
          kpi: { targetSent: 6000, targetOpenRate: 41, targetConversion: 2.4, targetRoas: 3.0, targetRevenue: 58000000,
                 actualSent: 4380, actualOpened: 1927, actualConverted: 118, actualRevenue: 22100000, actualRoas: 2.7, inputAt: '2026-07-13' } },
        { id: 'pp-demo-4', title: '이탈 고객 복귀 캠페인', type: 'crm_push', status: 'planning',
          startDate: '2026-07-18', endDate: '2026-07-28', owner: 'lee', budget: 4200000,
          channels: ['alimtalk', 'cafe24'], memo: '6개월 미구매 · 15% 쿠폰 · 세그먼트 A/B',
          executionTool: '카카오 비즈메시지 콘솔',
          abTest: { enabled: true, variantALabel: 'A안 · 감성 카피', variantBLabel: 'B안 · 할인 강조', winner: null,
            variantA: { sent: 0, converted: 0, revenue: 0 }, variantB: { sent: 0, converted: 0, revenue: 0 } },
          kpi: { targetSent: 4800, targetOpenRate: 44, targetConversion: 2.8, targetRoas: 3.2, targetRevenue: 64000000,
                 actualSent: 0, actualOpened: 0, actualConverted: 0, actualRevenue: 0, actualRoas: 0, inputAt: null } },
        { id: 'pp-demo-5', title: '주말 번들 세트 WEEK', type: 'bundle', status: 'planning',
          startDate: '2026-07-25', endDate: '2026-07-27', owner: 'park', budget: 2800000,
          channels: ['cafe24', 'smartstore', 'ably'], memo: '클렌징+토너 세트 · 사은품 미니 세럼',
          executionTool: 'Cafe24 프로모션 · 에이블리 딜',
          abTest: { enabled: false, variantALabel: 'A안', variantBLabel: 'B안', winner: null,
            variantA: { sent: 0, converted: 0, revenue: 0 }, variantB: { sent: 0, converted: 0, revenue: 0 } },
          kpi: { targetSent: 2200, targetOpenRate: 38, targetConversion: 3.5, targetRoas: 3.4, targetRevenue: 48000000,
                 actualSent: 0, actualOpened: 0, actualConverted: 0, actualRevenue: 0, actualRoas: 0, inputAt: null } },
        { id: 'pp-demo-6', title: '에이블리 첫구매 웰컴', type: 'coupon', status: 'planning',
          startDate: '2026-08-01', endDate: '2026-08-10', owner: 'lee', budget: 1800000,
          channels: ['ably', 'alimtalk'], memo: '신규 가입 3,000원 쿠폰 · D+1 리마인드 알림톡',
          executionTool: '에이블리 셀러 · 솔라피',
          abTest: { enabled: false, variantALabel: 'A안', variantBLabel: 'B안', winner: null,
            variantA: { sent: 0, converted: 0, revenue: 0 }, variantB: { sent: 0, converted: 0, revenue: 0 } },
          kpi: { targetSent: 3500, targetOpenRate: 48, targetConversion: 5.2, targetRoas: 4.0, targetRevenue: 36000000,
                 actualSent: 0, actualOpened: 0, actualConverted: 0, actualRevenue: 0, actualRoas: 0, inputAt: null } },
        { id: 'pp-demo-7', title: '6월 장마철 특집', type: 'season_sale', status: 'completed',
          startDate: '2026-06-15', endDate: '2026-06-28', owner: 'kim', budget: 9500000,
          channels: ['cafe24', 'smartstore', 'coupang', 'alimtalk'],
          memo: '우산·선크림 크로스셀 · 완료 회고 작성됨',
          executionTool: '솔라피 · 각 채널 프로모션',
          abTest: { enabled: true, variantALabel: 'A안 · 무료배송', variantBLabel: 'B안 · 번들할인', winner: 'A',
            variantA: { sent: 5200, converted: 676, revenue: 41200000 },
            variantB: { sent: 5200, converted: 546, revenue: 33800000 } },
          kpi: { targetSent: 12000, targetOpenRate: 43, targetConversion: 3.0, targetRoas: 3.3, targetRevenue: 180000000,
                 actualSent: 11480, actualOpened: 5166, actualConverted: 1222, actualRevenue: 168400000, actualRoas: 3.5, inputAt: '2026-06-30' } },
        { id: 'pp-demo-8', title: 'VIP 등급업 챌린지', type: 'crm_push', status: 'completed',
          startDate: '2026-06-01', endDate: '2026-06-14', owner: 'lee', budget: 3200000,
          channels: ['cafe24', 'alimtalk'], memo: '골드→VIP 승급 타겟 · 누적구매 유도',
          executionTool: '카카오 비즈메시지',
          abTest: { enabled: false, variantALabel: 'A안', variantBLabel: 'B안', winner: null,
            variantA: { sent: 0, converted: 0, revenue: 0 }, variantB: { sent: 0, converted: 0, revenue: 0 } },
          kpi: { targetSent: 2100, targetOpenRate: 52, targetConversion: 4.1, targetRoas: 3.8, targetRevenue: 52000000,
                 actualSent: 2088, actualOpened: 1253, actualConverted: 94, actualRevenue: 48700000, actualRoas: 3.6, inputAt: '2026-06-16' } },
        { id: 'pp-demo-9', title: '카페24 라이브커머스 데이', type: 'flash_sale', status: 'planning',
          startDate: '2026-08-07', endDate: '2026-08-07', owner: 'park', budget: 5000000,
          channels: ['cafe24'], memo: '19:00 라이브 2시간 · 한정 수량 타임딜',
          executionTool: 'Cafe24 라이브 스튜디오',
          abTest: { enabled: false, variantALabel: 'A안', variantBLabel: 'B안', winner: null,
            variantA: { sent: 0, converted: 0, revenue: 0 }, variantB: { sent: 0, converted: 0, revenue: 0 } },
          kpi: { targetSent: 0, targetOpenRate: 0, targetConversion: 6.0, targetRoas: 4.5, targetRevenue: 95000000,
                 actualSent: 0, actualOpened: 0, actualConverted: 0, actualRevenue: 0, actualRoas: 0, inputAt: null } },
        { id: 'pp-demo-10', title: '멤버십 데이 전체몰', type: 'season_sale', status: 'planning',
          startDate: '2026-08-15', endDate: '2026-08-18', owner: 'kim', budget: 15000000,
          channels: ['cafe24', 'smartstore', 'coupang', 'ably', 'alimtalk'],
          memo: '전 채널 동시 오픈 · 멤버십 등급별 추가 할인',
          executionTool: '채널 어드민 + 솔라피',
          abTest: { enabled: false, variantALabel: 'A안', variantBLabel: 'B안', winner: null,
            variantA: { sent: 0, converted: 0, revenue: 0 }, variantB: { sent: 0, converted: 0, revenue: 0 } },
          kpi: { targetSent: 20000, targetOpenRate: 47, targetConversion: 3.6, targetRoas: 3.7, targetRevenue: 310000000,
                 actualSent: 0, actualOpened: 0, actualConverted: 0, actualRevenue: 0, actualRoas: 0, inputAt: null } },
        { id: 'pp-demo-11', title: '재구매 리마인드 D+30', type: 'crm_push', status: 'active',
          startDate: '2026-07-05', endDate: '2026-07-31', owner: 'lee', budget: 1500000,
          channels: ['alimtalk'], memo: '구매 30일 후 소모품 리필 유도 · 매일 배치 발송',
          executionTool: '솔라피 스케줄 발송',
          abTest: { enabled: false, variantALabel: 'A안', variantBLabel: 'B안', winner: null,
            variantA: { sent: 0, converted: 0, revenue: 0 }, variantB: { sent: 0, converted: 0, revenue: 0 } },
          kpi: { targetSent: 9000, targetOpenRate: 39, targetConversion: 2.1, targetRoas: 2.9, targetRevenue: 42000000,
                 actualSent: 5120, actualOpened: 2099, actualConverted: 96, actualRevenue: 18700000, actualRoas: 2.6, inputAt: '2026-07-14' } },
        { id: 'pp-demo-12', title: '앱푸시 야간 특가', type: 'flash_sale', status: 'completed',
          startDate: '2026-07-03', endDate: '2026-07-04', owner: 'park', budget: 900000,
          channels: ['cafe24'], memo: '22:00~02:00 야간몰 · 완료',
          executionTool: 'Cafe24 앱푸시',
          abTest: { enabled: false, variantALabel: 'A안', variantBLabel: 'B안', winner: null,
            variantA: { sent: 0, converted: 0, revenue: 0 }, variantB: { sent: 0, converted: 0, revenue: 0 } },
          kpi: { targetSent: 8000, targetOpenRate: 28, targetConversion: 2.0, targetRoas: 2.8, targetRevenue: 28000000,
                 actualSent: 7640, actualOpened: 2216, actualConverted: 168, actualRevenue: 31200000, actualRoas: 3.1, inputAt: '2026-07-05' } }
    ];
}

function normalizePromoPlan(p) {
    if (!p.executionTool) p.executionTool = '';
    if (!p.abTest) {
        p.abTest = { enabled: false, variantALabel: 'A안', variantBLabel: 'B안', winner: null,
            variantA: { sent: 0, converted: 0, revenue: 0 }, variantB: { sent: 0, converted: 0, revenue: 0 } };
    }
    return p;
}

function loadPromoPlans() {
    try {
        var raw = localStorage.getItem(PROMO_STORAGE_KEY);
        promoPlans = (raw ? JSON.parse(raw) : getPromoPlansDefaults()).map(normalizePromoPlan);
    } catch (e) { promoPlans = getPromoPlansDefaults().map(normalizePromoPlan); }
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

function renderPromoAbCompareHtml(p) {
    if (!p.abTest || !p.abTest.enabled) return '';
    var ab = p.abTest;
    var va = ab.variantA || {};
    var vb = ab.variantB || {};
    function convPct(v) { return v.sent ? ((v.converted / v.sent) * 100).toFixed(1) : '0.0'; }
    return '<div class="mt-4 pt-4 border-t border-border">' +
        '<p class="text-xs font-bold text-purple-300 mb-2">A/B 기획 · 외부 실행 결과 비교</p>' +
        '<p class="text-[10px] text-gray-500 mb-3">발송은 외부 도구에서 진행하고, 실적만 여기에 기록합니다.</p>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
        [['A', ab.variantALabel || 'A안', va, ab.winner === 'A'], ['B', ab.variantBLabel || 'B안', vb, ab.winner === 'B']].map(function(row) {
            var key = row[0], label = row[1], v = row[2], isWinner = row[3];
            return '<div class="p-3 rounded-lg bg-dark/50 border border-border' + (isWinner ? ' border-success/40' : '') + '">' +
                '<div class="flex justify-between items-center mb-2"><span class="text-xs font-bold">' + label + '</span>' +
                (isWinner ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-success/20 text-success font-bold">우수</span>' : '') + '</div>' +
                '<p class="text-[10px] text-gray-400">발송 ' + fmtCount(v.sent || 0) + ' · 전환 ' + convPct(v) + '%</p>' +
                '<p class="text-xs font-bold mt-1">' + formatDataHubWon(v.revenue || 0) + '</p></div>';
        }).join('') + '</div></div>';
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

function isPromoCalMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
}

function formatPromoShortDate(dateStr) {
    if (!dateStr) return '';
    var p = dateStr.split('-');
    return parseInt(p[1], 10) + '/' + parseInt(p[2], 10);
}

function formatPromoWeekTitle(weekStart, weekEnd, mobile) {
    if (!mobile) {
        return (weekStart.getMonth() + 1) + '/' + weekStart.getDate() + ' ~ ' + (weekEnd.getMonth() + 1) + '/' + weekEnd.getDate();
    }
    var dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
    return (weekStart.getMonth() + 1) + '/' + weekStart.getDate() + '(' + dayLabels[weekStart.getDay()] + ') ~ ' +
        (weekEnd.getMonth() + 1) + '/' + weekEnd.getDate() + '(' + dayLabels[weekEnd.getDay()] + ')';
}

function renderPromoMobileWeekEventCard(p) {
    var ti = getPromoTypeInfo(p.type);
    var st = PROMO_STATUS_OPTIONS[p.status] || PROMO_STATUS_OPTIONS.planning;
    var selected = promoActivePlanId === p.id ? ' selected' : '';
    var period = p.startDate === p.endDate
        ? formatPromoShortDate(p.startDate)
        : formatPromoShortDate(p.startDate) + '~' + formatPromoShortDate(p.endDate);
    return '<div class="promo-cal-week-event-card ' + ti.css + selected + '" onclick="event.stopPropagation();selectPromoPlan(\'' + p.id + '\')">' +
        '<p class="promo-cal-week-event-title">' + p.title + '</p>' +
        '<div class="promo-cal-week-event-meta">' +
        '<span class="promo-cal-week-event-chip ' + st[1] + '">' + st[0] + '</span>' +
        '<span class="promo-cal-week-event-chip bg-surface border border-border text-gray-400">' + ti.label + '</span>' +
        '<span class="promo-cal-week-event-period">' + period + '</span>' +
        '</div></div>';
}

function renderPromoMobileWeekList(weekStart, todayStr) {
    var weekdayNames = ['월', '화', '수', '목', '금', '토', '일'];
    var weekEventIds = {};
    var weekEventCount = 0;
    var listRows = [];
    for (var w = 0; w < 7; w++) {
        var wd = new Date(weekStart);
        wd.setDate(wd.getDate() + w);
        var wStr = formatPromoDate(wd);
        var wEvents = getPromoPlansForDate(wStr);
        wEvents.forEach(function(p) {
            if (!weekEventIds[p.id]) { weekEventIds[p.id] = true; weekEventCount++; }
        });
        var wToday = wStr === todayStr;
        var rowClass = 'promo-cal-week-row' +
            (wToday ? ' today' : '') +
            (w === 5 ? ' is-sat' : '') +
            (w === 6 ? ' is-sun' : '') +
            (wEvents.length ? ' has-events' : '');
        var eventsHtml = wEvents.length
            ? '<div class="promo-cal-week-events">' + wEvents.map(renderPromoMobileWeekEventCard).join('') + '</div>'
            : '<div class="promo-cal-week-empty">등록된 일정 없음</div>';
        listRows.push('<div class="' + rowClass + '">' +
            '<div class="promo-cal-week-head" onclick="openPromoScheduleModal(\'' + wStr + '\')">' +
            '<div class="promo-cal-week-head-left">' +
            '<span class="promo-cal-weekday">' + weekdayNames[w] + '요일</span>' +
            '<span class="promo-cal-week-daynum">' + (wd.getMonth() + 1) + '월 ' + wd.getDate() + '일</span>' +
            (wToday ? '<span class="promo-cal-week-today-pill">오늘</span>' : '') +
            '</div>' +
            '<span class="promo-cal-week-add-btn">+ 일정</span>' +
            '</div>' +
            '<div class="promo-cal-week-body">' + eventsHtml + '</div>' +
            '</div>');
    }
    var weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    var summaryHtml = '<div class="promo-cal-week-summary">' +
        '<strong>' + formatPromoWeekTitle(weekStart, weekEnd, true) + '</strong>' +
        '<span class="promo-cal-week-summary-count">이번 주 프로모션 ' + weekEventCount + '건</span></div>';
    return summaryHtml + '<div class="promo-cal-week-list">' + listRows.join('') + '</div>';
}

function renderPromoDesktopWeekGrid(weekStart, todayStr) {
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
    return weekCells.join('');
}

function renderPromoCalendar() {
    var titleEl = document.getElementById('promo-calendar-title');
    var gridEl = document.getElementById('promo-calendar-grid');
    var listEl = document.getElementById('promo-calendar-events-list');
    if (!gridEl) return;
    var mobile = isPromoCalMobile();
    var maxMonthEvents = mobile ? 1 : 3;
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
                events.slice(0, maxMonthEvents).map(function(p) {
                    var ti = getPromoTypeInfo(p.type);
                    return '<div class="promo-cal-event ' + ti.css + '" onclick="event.stopPropagation();selectPromoPlan(\'' + p.id + '\')" title="' + p.title + '">' + p.title + '</div>';
                }).join('') +
                (events.length > maxMonthEvents ? '<div class="promo-cal-more text-[8px] text-gray-500 mt-0.5">+' + (events.length - maxMonthEvents) + '건</div>' : '') +
                '</div>');
        }
        var totalCells = startOffset + daysInMonth;
        var remain = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (var j = 1; j <= remain; j++) {
            var ndStr = formatPromoDate(new Date(y, m + 1, j));
            cells.push('<div class="promo-cal-cell other-month" onclick="openPromoScheduleModal(\'' + ndStr + '\')"><span class="promo-cal-day-num">' + j + '</span></div>');
        }
        gridEl.className = 'promo-cal-grid month';
        gridEl.removeAttribute('data-promo-cal-layout');
        gridEl.innerHTML = cells.join('');
    } else {
        var weekStart = new Date(promoCalendarCursor);
        weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
        var weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if (titleEl) {
            titleEl.innerHTML = '<span class="promo-cal-title-desktop">' + formatPromoWeekTitle(weekStart, weekEnd, false) + '</span>' +
                '<span class="promo-cal-title-mobile">' + formatPromoWeekTitle(weekStart, weekEnd, true) + '</span>';
        }
        gridEl.className = 'promo-cal-week-dual';
        gridEl.setAttribute('data-promo-cal-layout', 'week-dual-v2');
        gridEl.innerHTML =
            '<div class="promo-cal-week-mobile-only promo-cal-week-list-wrap">' + renderPromoMobileWeekList(weekStart, todayStr) + '</div>' +
            '<div class="promo-cal-week-desktop-only promo-cal-grid week">' + renderPromoDesktopWeekGrid(weekStart, todayStr) + '</div>';
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
        '<div class="flex justify-between"><span class="text-gray-500">채널</span><span class="text-right">' + p.channels.join(', ') + '</span></div>' +
        (p.executionTool ? '<div class="flex justify-between gap-2"><span class="text-gray-500 shrink-0">실행 도구</span><span class="text-right text-primary">' + p.executionTool + '</span></div>' : '') +
        '</div>' +
        (p.memo ? '<p class="text-[10px] text-gray-400 mb-4 p-2 rounded bg-dark/50">' + p.memo + '</p>' : '') +
        renderPromoAbCompareHtml(p) +
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
        '<div><label class="settings-label">실행 도구 (외부)</label><input id="promo-form-execution" class="settings-input" placeholder="예: 솔라피, 카카오 비즈메시지, Cafe24 CRM" value="' + (p ? (p.executionTool || '').replace(/"/g, '&quot;') : '') + '"></div>' +
        '<label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" id="promo-form-ab-enabled" class="rounded" ' + (p && p.abTest && p.abTest.enabled ? 'checked' : '') + '><span class="text-xs text-purple-300 font-semibold">A/B 테스트 기획 (결과만 기록)</span></label>' +
        '<div id="promo-form-ab-fields" class="grid grid-cols-1 sm:grid-cols-2 gap-3' + (p && p.abTest && p.abTest.enabled ? '' : ' hidden') + '">' +
        '<div><label class="settings-label">A안 라벨</label><input id="promo-form-ab-a" class="settings-input" value="' + (p && p.abTest ? (p.abTest.variantALabel || 'A안').replace(/"/g, '&quot;') : 'A안') + '"></div>' +
        '<div><label class="settings-label">B안 라벨</label><input id="promo-form-ab-b" class="settings-input" value="' + (p && p.abTest ? (p.abTest.variantBLabel || 'B안').replace(/"/g, '&quot;') : 'B안') + '"></div></div>' +
        '<div id="promo-schedule-preview"></div>' +
        '<div class="border-t border-border pt-4"><p class="text-xs font-bold text-primary mb-3">목표 KPI 설정</p>' +
        '<div class="grid grid-cols-2 gap-3">' +
        [['발송 목표', 'targetSent', p ? p.kpi.targetSent : 5000], ['오픈율 목표 (%)', 'targetOpenRate', p ? p.kpi.targetOpenRate : 45], ['전환율 목표 (%)', 'targetConversion', p ? p.kpi.targetConversion : 3], ['ROAS 목표', 'targetRoas', p ? p.kpi.targetRoas : 3.5], ['매출 목표 (원)', 'targetRevenue', p ? p.kpi.targetRevenue : 100000000]].map(function(k) {
            return '<div><label class="settings-label">' + k[0] + '</label><input type="number" id="promo-kpi-' + k[1] + '" class="settings-input" step="any" value="' + k[2] + '"></div>';
        }).join('') + '</div></div>' +
        '</div>';
    var abToggle = document.getElementById('promo-form-ab-enabled');
    var abFields = document.getElementById('promo-form-ab-fields');
    if (abToggle && abFields) {
        abToggle.onchange = function() { abFields.classList.toggle('hidden', !abToggle.checked); };
    }
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
    var abEnabled = document.getElementById('promo-form-ab-enabled') && document.getElementById('promo-form-ab-enabled').checked;
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
        executionTool: (document.getElementById('promo-form-execution') || {}).value || '',
        abTest: {
            enabled: abEnabled,
            variantALabel: (document.getElementById('promo-form-ab-a') || {}).value || 'A안',
            variantBLabel: (document.getElementById('promo-form-ab-b') || {}).value || 'B안',
            winner: null,
            variantA: { sent: 0, converted: 0, revenue: 0 },
            variantB: { sent: 0, converted: 0, revenue: 0 },
        },
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
            if (promoPlans[idx].abTest) {
                payload.abTest.variantA = promoPlans[idx].abTest.variantA || payload.abTest.variantA;
                payload.abTest.variantB = promoPlans[idx].abTest.variantB || payload.abTest.variantB;
                payload.abTest.winner = promoPlans[idx].abTest.winner;
            }
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
            '<p class="text-[10px] text-gray-500 mt-0.5">' + (getMember(p.owner).name || '') + ' · 예산 ' + App.formatWon(p.budget) + ' · ' + p.channels.join(', ') + '</p>' +
            (p.executionTool ? '<p class="text-[10px] text-primary mt-1">실행: ' + p.executionTool + '</p>' : '') + '</div>' +
            '<div class="flex gap-2"><button onclick="openPromoPlanModal(\'' + p.id + '\')" class="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/40">기획 수정</button>' +
            '<button onclick="selectPromoPlan(\'' + p.id + '\')" class="text-xs px-3 py-1.5 rounded-lg border border-border hover:border-primary/40">선택</button></div></div>' +
            '<div class="grid grid-cols-1 lg:grid-cols-2 gap-5">' +
            '<div><p class="text-xs font-bold text-gray-400 mb-3">목표 KPI</p>' +
            '<div class="space-y-2 text-xs">' +
            [['발송', fmtCount(p.kpi.targetSent), '건'], ['오픈율', p.kpi.targetOpenRate, '%'], ['전환율', p.kpi.targetConversion, '%'], ['ROAS', p.kpi.targetRoas, 'x'], ['매출', formatDataHubWon(p.kpi.targetRevenue), '']].map(function(k) {
                return '<div class="flex justify-between p-2 rounded bg-dark/40"><span class="text-gray-500">' + k[0] + ' 목표</span><span class="font-bold">' + k[1] + k[2] + '</span></div>';
            }).join('') + '</div></div>' +
            '<div><p class="text-xs font-bold text-primary mb-3">결과값 입력 <span class="text-[10px] font-normal text-gray-500">(외부 실행 후)</span></p>' +
            '<div class="grid grid-cols-2 gap-2 mb-3">' +
            [['actualSent', '발송', p.kpi.actualSent], ['actualOpened', '오픈', p.kpi.actualOpened], ['actualConverted', '전환', p.kpi.actualConverted], ['actualRevenue', '매출(원)', p.kpi.actualRevenue], ['actualRoas', 'ROAS', p.kpi.actualRoas]].map(function(k) {
                return '<div><label class="text-[10px] text-gray-500">' + k[1] + '</label><input type="number" id="promo-result-' + p.id + '-' + k[0] + '" class="settings-input text-sm" step="any" value="' + k[2] + '" onchange="updatePromoResultField(\'' + p.id + '\',\'' + k[0] + '\',this.value)"></div>';
            }).join('') + '</div>' +
            '<button onclick="savePromoResults(\'' + p.id + '\')" class="text-xs px-4 py-2 rounded-lg bg-primary text-white hover:bg-blue-600 mb-3">결과 저장</button>' +
            (p.kpi.inputAt ? '<p class="text-[10px] text-gray-600 mb-2">마지막 입력: ' + p.kpi.inputAt + '</p>' : '') +
            '<p class="text-[10px] font-bold text-gray-400 mb-1">매출 달성률</p>' +
            '<div class="promo-kpi-bar mb-1"><div class="promo-kpi-bar-fill ' + getPromoKpiBarClass(revPct) + '" style="width:' + Math.min(100, revPct) + '%"></div></div>' +
            '<p class="text-xs text-gray-400">' + revPct + '% 달성 · 전환 ' + convPct + '%</p></div></div>' +
            renderPromoAbCompareHtml(p) + '</div>';
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
        <div class="glass rounded-xl kpi-card kpi-glow kpi-drill" onclick="drillDownKpi('revenue')">
            <p class="kpi-label">${m.companyName} 채널통합매출 (금일)</p>
            <div class="kpi-body">
                <p class="kpi-value text-white">${m.dailyRevenueFormatted}</p>
                <div class="kpi-spark-wrap"><canvas class="sparkline" data-spark="18,22,20,28,25,32,35"></canvas></div>
            </div>
            <div class="kpi-footer">
                <span class="font-bold text-success">▲ ${m.dailyRevenueChange}</span>
                <span class="text-gray-500">${App.globalDateRange.label} · 클릭→상세</span>
            </div>
        </div>
        <div class="glass rounded-xl kpi-card kpi-glow kpi-drill" id="home-ops-kpi" onclick="openHomeDetailPopup('ops')">
            <p class="kpi-label">오늘의 운영 요약</p>
            <div class="home-ops-grid">
                <div class="home-ops-cell"><p class="lab">주문건수</p><p class="val">${m.orderCountFormatted}</p><p class="delta text-success">▲ ${m.orderCountChange}</p></div>
                <div class="home-ops-cell"><p class="lab">객단가</p><p class="val" style="font-size:.92rem">${m.aovFormatted}</p><p class="delta text-success">▲ ${m.aovChange}</p></div>
                <div class="home-ops-cell"><p class="lab">신규회원</p><p class="val">${m.newMembersFormatted}</p><p class="delta text-success">▲ ${m.newMembersChange}</p></div>
                <div class="home-ops-cell"><p class="lab">반품율</p><p class="val">${m.returnRate}%</p><p class="delta text-success">▼ ${m.returnRateChange}</p></div>
            </div>
            <div class="kpi-footer mt-2"><span class="text-gray-500">${App.globalDateRange.label} · 클릭→상세</span></div>
        </div>
        <div class="glass rounded-xl kpi-card kpi-glow kpi-drill" onclick="drillDownKpi('target')">
            <p class="kpi-label">이달 AI 예상 마감 매출</p>
            <div class="kpi-body"><p class="kpi-value text-white">${m.monthlyTargetFormatted}</p></div>
            <div class="w-full bg-gray-800 rounded-full h-1.5 mt-2 mb-1"><div class="progress-bar bg-gradient-to-r from-primary to-accent h-1.5 rounded-full" style="width:${m.kpiPct}%"></div></div>
            <div class="kpi-footer">
                <span class="font-bold text-success">▲ ${m.kpiPct}%</span>
                <span class="text-gray-500">목표 대비 · 클릭→상세</span>
            </div>
        </div>
        <div class="glass rounded-xl kpi-card kpi-glow kpi-drill kpi-glow-danger border-l-4 border-l-warning" onclick="drillDownKpi('actions')">
            <p class="kpi-label">미처리 액션</p>
            <div class="kpi-body"><p class="kpi-value text-white">${m.pendingActions}건</p></div>
            <div class="kpi-footer">
                <span class="font-bold text-warning">● 긴급 ${m.urgentActions}</span>
                <span class="text-gray-500">클릭→상세</span>
            </div>
        </div>
    </div>

    <!-- Charts + Alerts -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-5 home-chart-row">
        <div class="glass rounded-xl p-4 xl:col-span-2 chart-card h-full">
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

        <div class="glass rounded-xl p-4 home-inv-alert">
            <div class="chart-card-header mb-2">
                <div class="chart-card-title">
                    <h2>위험 재고 경보</h2>
                    <span class="chart-unit-badge text-danger border-danger/30 bg-danger/10">${m.atRiskInventory}건</span>
                </div>
            </div>
            <div class="space-y-2.5 home-inv-list" role="list" aria-label="위험 재고 목록">
                ${App.inventory.filter(function (i) { return i.status !== 'safe'; })
                    .sort(function (a, b) {
                        var rank = { critical: 0, warning: 1 };
                        var ra = rank[a.status] != null ? rank[a.status] : 9;
                        var rb = rank[b.status] != null ? rank[b.status] : 9;
                        if (ra !== rb) return ra - rb;
                        return (Number(a.total) || 0) - (Number(b.total) || 0);
                    })
                    .map(function (i) {
                    return `
                <div class="p-3 rounded-lg bg-surface border border-border hover:border-danger/30 transition-colors cursor-pointer shrink-0" role="listitem" onclick="navigateTo('view-inventory')">
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
                </div>`;
                }).join('') || '<p class="text-sm text-gray-500 py-6 text-center">위험 재고 없음</p>'}
            </div>
            <button type="button" onclick="navigateTo('view-inventory')" class="home-inv-foot mt-3 text-xs text-primary font-semibold hover:underline text-center w-full">전체 재고 보기 →</button>
        </div>
    </div>

    ${typeof renderHomePromoCardHtml === 'function' ? renderHomePromoCardHtml() : ''}

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
            <p class="text-sm text-gray-400">Firebase 적재 원천 데이터 · 일/주/월/연 누적 지표 분석 및 내보내기</p>
            <p class="text-[10px] text-gray-600 mt-1">집계 Export는 횟수 제한 없음 · 원시 대용량·PDF 고빈도·연속 요청만 보호 차단</p>
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
            <button type="button" onclick="demoBlockRawExport()" class="text-[10px] font-semibold px-2.5 py-2 rounded-lg border border-warning/30 text-warning/90 hover:bg-warning/10" title="원시 덤프 차단 데모">원시 덤프?</button>
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
        ${App.dataHubMeta.exportPolicy
            ? '<div><span class="text-gray-500">Export</span> <span class="font-mono text-gray-300 ml-1">' + App.dataHubMeta.exportPolicy + '</span></div>'
            : '<div><span class="text-gray-500">Export</span> <span class="font-mono text-success ml-1">집계 무제한 · 보호 규칙 적용</span></div>'}
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
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 datahub-chart-row">
        <div class="glass rounded-xl p-4 lg:col-span-2 chart-card h-full">
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
            <div class="chart-canvas-wrap tall datahub-canvas-grow"><canvas id="dataHubTrendChart"></canvas></div>
        </div>
        <div class="glass rounded-xl p-4 chart-card h-full datahub-share-card">
            <div class="chart-card-header">
                <div class="chart-card-title">
                    <h2>채널별 매출 비중</h2>
                    <span class="chart-unit-badge" id="datahub-pie-period">일간</span>
                </div>
            </div>
            <div class="datahub-share-body">
                <div class="chart-canvas-wrap datahub-share-pie"><canvas id="dataHubChannelChart"></canvas></div>
                <div class="datahub-channel-legend-grid" id="datahub-channel-legend" aria-label="채널 범례 (최대 12개 · 3열)"></div>
            </div>
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

App.views['view-briefing'] = () => {
    var lim = typeof getBriefingRecipientLimitSafe === 'function' ? getBriefingRecipientLimitSafe() : 1;
    var tierLabel = App.tier === 'starter' ? 'Starter' : App.tier === 'growth' ? 'Growth' : 'Enterprise';
    return `
<div id="view-briefing" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
            <h2 class="text-xl font-bold">데일리 카카오 브리핑</h2>
            <p class="text-sm text-gray-400 mt-1">매일 08:30 · <strong class="text-gray-300">1인 1통</strong> · ${tierLabel} 수신 <strong class="text-primary">${lim}명</strong> 기본 <span class="demo-pill">데모</span></p>
        </div>
        <div class="flex gap-2">
            <button onclick="showToast('테스트 브리핑을 선택 수신자에게 발송했습니다. (데모)', 'success')" class="text-xs font-semibold px-4 py-2 rounded-lg border border-border hover:bg-surface transition-colors">테스트 발송</button>
        </div>
    </div>

    <div class="glass rounded-xl p-4 border border-primary/20 bg-primary/5">
        <p class="text-sm text-gray-200"><span class="font-bold text-primary">알림톡 수신 한도</span> — 스타터 1 · 그로스 3 · 엔터 5명 기본 제공. 추가는 별도 문의. 수신자는 작업 좌석·뷰어에 포함되지 않습니다.</p>
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
                    <p class="text-[10px] text-gray-600 text-right mt-1">오전 8:30 · 수신 ${lim}명 한도</p>
                </div>
            </div>
        </div>

        <div class="space-y-5">
            <div class="glass rounded-xl p-5">
                <h3 class="font-bold text-sm mb-1">알림톡 수신자</h3>
                <p class="text-[11px] text-gray-500 mb-3" id="briefing-recipients-meta"></p>
                <div class="space-y-2" id="briefing-recipients-list"></div>
            </div>
            <div class="glass rounded-xl overflow-hidden" id="briefing-config-card">
                <button type="button" id="briefing-config-toggle" class="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-surface/40 transition-colors" onclick="toggleBriefingConfigCollapse()" aria-expanded="false" aria-controls="briefing-config-body">
                    <div class="min-w-0">
                        <h3 class="font-bold text-sm">브리핑 구성 항목 <span class="text-[10px] text-gray-500 font-normal">클릭하여 ON/OFF</span></h3>
                        <p class="text-[11px] text-gray-500 mt-0.5" id="briefing-config-summary">접힘 · 미리보기·수신 설정만 우선 확인</p>
                    </div>
                    <svg id="briefing-config-chevron" class="w-4 h-4 text-gray-400 shrink-0 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <div id="briefing-config-body" class="hidden px-5 pb-5 border-t border-border">
                    <div class="space-y-3 pt-4" id="briefing-config-list"></div>
                </div>
            </div>
            <div class="glass rounded-xl p-5">
                <h3 class="font-bold text-sm mb-3">발송 이력</h3>
                <div class="space-y-2 text-sm">
                    ${['07.10 (금) 08:30','07.09 (목) 08:30','07.08 (수) 08:30','07.07 (화) 08:30'].map((d,i) => `
                    <div class="flex justify-between items-center p-2.5 rounded-lg hover:bg-surface">
                        <span class="text-gray-300">${d}</span>
                        <span class="text-[10px] ${i===0?'text-success':'text-gray-500'} font-bold">${i===0?'오늘 · '+lim+'통':'발송 완료 ✓'}</span>
                    </div>`).join('')}
                </div>
            </div>
        </div>
    </div>
</div>`;
};

App.views['view-orders'] = () => {
    var m = getMockMetrics();
    var p = m.pipeline;
    return `
<div id="view-orders" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
            <h2 class="text-xl font-bold">${m.companyName} 주문 · 발주 현황</h2>
            <p class="text-sm text-gray-400 mt-1">전 채널 주문 상태 미러 · 발주·출고 실행은 사방넷/채널 <span class="demo-pill">데모</span></p>
        </div>
        <div class="flex flex-wrap gap-2">
            <button type="button" onclick="typeof OmnifyReportPrint!=='undefined'&&OmnifyReportPrint.openForm('orders')" class="text-sm font-semibold px-4 py-2 rounded-lg bg-surface border border-border hover:border-primary/50 transition-colors">출력 양식</button>
            <button onclick="syncOrdersDemo()" class="text-sm font-semibold px-4 py-2 rounded-lg bg-surface border border-border hover:border-primary/50 flex items-center gap-2 transition-colors">
                <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                수동 동기화
            </button>
        </div>
    </div>

    <div class="glass rounded-xl p-4 border border-warning/25 bg-warning/5" id="orders-policy-banner">
        <p class="text-sm text-gray-200"><span class="font-bold text-warning">상태 조회 · 동기화만 제공합니다.</span> 「원천에서 처리」는 사방넷 또는 채널 어드민 안내이며, Omnify가 발주·출고를 확정하지 않습니다. (이지·셀메이트 미연동)</p>
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

App.views['view-inventory'] = function () {
    if (typeof buildInventoryShellHtml === 'function') return buildInventoryShellHtml();
    return '<div id="view-inventory" class="view-section fade-in p-8 text-gray-400">재고 조회 UI를 불러오지 못했습니다.</div>';
};

App.views['view-crm'] = () => `
<div id="view-crm" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
            <h2 class="text-xl font-bold">프로모션 기획 · 성과</h2>
            <p class="text-sm text-gray-400 mt-1">캘린더 일정 · 목표 KPI · 외부 실행 후 실적 기록 <span class="demo-pill">데모</span></p>
        </div>
        <div class="flex flex-wrap gap-2">
            <button type="button" onclick="typeof OmnifyReportPrint!=='undefined'&&OmnifyReportPrint.openForm('promo')" class="text-sm font-semibold px-4 py-2 rounded-lg bg-surface border border-border hover:border-primary/50 transition-colors">출력 양식</button>
            <button onclick="openPromoPlanModal()" class="text-sm font-bold px-4 py-2 rounded-lg bg-primary hover:bg-blue-600 text-white shadow-lg shadow-primary/20 transition-colors">+ 프로모션</button>
        </div>
    </div>

    <div class="glass rounded-xl p-4 border border-primary/20 bg-primary/5" id="crm-execution-banner">
        <p class="text-sm text-gray-300"><span class="font-bold text-primary">실행은 외부 도구</span>에서 진행합니다. Omnify에서는 프로모션 일정·목표 KPI를 기획하고, 발송·전환 실적을 수동으로 기록합니다.</p>
        <p class="text-[11px] text-gray-500 mt-1">알림톡·SMS·마켓 프로모션은 솔라피, 카카오 비즈메시지, 각 채널 어드민 등에서 실행하세요.</p>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3" id="crm-stats"></div>

    <div class="flex gap-1 border-b border-border">
        <button class="crm-tab-btn active" data-tab="calendar" onclick="switchCrmTab('calendar')">프로모션 캘린더</button>
        <button class="crm-tab-btn" data-tab="kpi" onclick="switchCrmTab('kpi')">기획 · KPI</button>
    </div>

    <div id="crm-panel-calendar" class="space-y-5">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 promo-cal-toolbar">
            <div class="flex gap-1 p-1 rounded-lg bg-surface border border-border w-full sm:w-auto">
                <button class="promo-cal-mode-btn flex-1 sm:flex-none text-xs px-3 py-1.5 rounded-md font-semibold" data-mode="week" onclick="setPromoCalendarMode('week')">주간</button>
                <button class="promo-cal-mode-btn flex-1 sm:flex-none text-xs px-3 py-1.5 rounded-md font-semibold active" data-mode="month" onclick="setPromoCalendarMode('month')">월간</button>
            </div>
            <div class="flex items-center gap-2 sm:gap-3 promo-cal-nav w-full sm:w-auto">
                <button onclick="shiftPromoCalendar(-1)" class="p-2 rounded-lg border border-border hover:border-primary/40 text-gray-400 hover:text-white transition-colors shrink-0" aria-label="이전">◀</button>
                <span class="text-sm font-bold min-w-[140px] text-center flex-1 sm:flex-none" id="promo-calendar-title">2026년 7월</span>
                <button onclick="shiftPromoCalendar(1)" class="p-2 rounded-lg border border-border hover:border-primary/40 text-gray-400 hover:text-white transition-colors shrink-0" aria-label="다음">▶</button>
            </div>
            <button onclick="openPromoScheduleModal()" class="promo-cal-add-btn text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-white hover:bg-blue-600 transition-colors inline-flex items-center justify-center w-full sm:w-auto">+ 일정 등록</button>
        </div>
        <div class="glass rounded-xl p-4 promo-cal-shell">
            <div class="promo-cal-wrap">
                <div id="promo-calendar-grid"></div>
            </div>
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
    <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div><h2 class="text-xl font-bold">AI 수익성 분석</h2><p class="text-sm text-gray-400 mt-1">채널별 마진 · 광고 ROAS · AI 인사이트 <span class="demo-pill">설정 연동</span></p></div>
        <button type="button" onclick="typeof OmnifyReportPrint!=='undefined'&&OmnifyReportPrint.openForm('profit')" class="text-sm font-semibold px-4 py-2 rounded-lg bg-surface border border-border hover:border-primary/50 transition-colors">출력 양식</button>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        ${[
            ['이번 달 순이익', m.netProfitFormatted, '+18.3%'],
            ['평균 마진율', m.marginGlobal + '%', (m.marginUp ? '+' : '') + m.marginDelta + '%p'],
            ['광고 ROAS', m.avgRoas + 'x', '목표 ' + getSettings().kpi.targetRoas + 'x'],
            ['AI 절감 제안', m.aiSavingsFormatted, '광고비 최적화'],
        ].map(([l,v,c])=>`
        <div class="glass rounded-xl p-5"><p class="text-xs text-gray-400 mb-1">${l}</p><p class="text-2xl font-extrabold mb-1">${v}</p><p class="text-xs text-gray-500">${c}</p></div>`).join('')}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 profit-chart-row">
        <div class="glass rounded-xl p-4 lg:col-span-2 chart-card h-full">
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
            <div class="chart-canvas-wrap tall profit-canvas-grow"><canvas id="profitChart"></canvas></div>
        </div>
        <div class="glass rounded-xl p-4 chart-card h-full profit-margin-card">
            <div class="chart-card-header">
                <div class="chart-card-title">
                    <h2>채널별 마진율</h2>
                    <span class="chart-unit-badge">%</span>
                </div>
            </div>
            <div class="chart-canvas-wrap tall profit-canvas-grow"><canvas id="marginChart"></canvas></div>
            <div class="p-4 rounded-lg bg-primary/10 border border-primary/20 profit-insight">
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
        <div><h2 class="text-xl font-bold">API 연동 · 동기화</h2><p class="text-sm text-gray-400 mt-1">채널 API 상태 · 자동 동기화 · 이력 모니터링</p></div>
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
            ${c.status==='warn'?'<div class="mt-3 p-3 rounded-lg bg-warning/10 border border-warning/20 text-xs text-warning">⚡ 토큰 자동 갱신 예약됨</div>':''}
        </div>`).join('')}
    </div>
    <div class="glass rounded-xl overflow-hidden" id="api-sync-history">
        <div class="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
                <h3 class="font-bold text-sm">동기화 · 알림 이력</h3>
                <p class="text-[10px] text-gray-500 mt-0.5">최근 24시간 · 15~30분 주기 자동 동기화</p>
            </div>
            <button onclick="syncOrdersDemo()" class="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:border-primary/40 transition-colors">수동 동기화</button>
        </div>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead class="text-gray-500 text-xs border-b border-border bg-surface/40">
                    <tr>
                        <th class="px-4 py-3 text-left font-medium">시각</th>
                        <th class="px-4 py-3 text-left font-medium">채널</th>
                        <th class="px-4 py-3 text-left font-medium">작업</th>
                        <th class="px-4 py-3 text-right font-medium">건수</th>
                        <th class="px-4 py-3 text-right font-medium">소요</th>
                        <th class="px-4 py-3 text-center font-medium">상태</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border">
                    ${App.syncHistory.map(function(row) {
                        var st = row.status === 'success' ? '<span class="text-[10px] px-2 py-0.5 rounded bg-success/20 text-success font-bold">성공</span>'
                            : row.status === 'warn' ? '<span class="text-[10px] px-2 py-0.5 rounded bg-warning/20 text-warning font-bold">주의</span>'
                            : '<span class="text-[10px] px-2 py-0.5 rounded bg-danger/20 text-danger font-bold">실패</span>';
                        return '<tr class="table-row">' +
                            '<td class="px-4 py-3 font-mono text-xs text-gray-400">' + row.time + '</td>' +
                            '<td class="px-4 py-3"><span class="mr-1.5">' + row.icon + '</span>' + row.channel + '</td>' +
                            '<td class="px-4 py-3 text-gray-300">' + row.job + (row.note ? ' <span class="text-warning text-[10px]">(' + row.note + ')</span>' : '') + '</td>' +
                            '<td class="px-4 py-3 text-right font-mono">' + row.records.toLocaleString() + '</td>' +
                            '<td class="px-4 py-3 text-right text-xs text-gray-500">' + row.duration + '</td>' +
                            '<td class="px-4 py-3 text-center">' + st + '</td></tr>';
                    }).join('')}
                </tbody>
            </table>
        </div>
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
            ['오늘 활동', App.activityLogs.filter(l => l.date === '2026-07-10').length + '건', '5명 활동 중'],
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
                <h2 class="text-xl font-bold">Google Drive 자료실</h2>
                <span class="text-[10px] font-mono bg-[#4285f4]/15 text-blue-300 px-2 py-0.5 rounded border border-[#4285f4]/25">DRIVE</span>
            </div>
            <p class="text-sm text-gray-400">연동 폴더 검색 · 바로가기 · 폴더 관리는 Google Drive에서</p>
        </div>
        <div class="flex flex-wrap gap-2" id="archive-header-actions">
            <button type="button" id="btn-archive-open-drive" class="text-xs font-semibold px-4 py-2 rounded-lg border border-[#4285f4]/40 text-blue-300 hover:bg-[#4285f4]/10 transition-colors flex items-center gap-1.5">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7.71 3.5L1.15 15l3.43 5.5h6.84l6.57-10.5L7.71 3.5zm8.43 12L12.58 21H5.74l3.43-5.5h6.97z"/></svg>
                Drive 폴더 열기
            </button>
        </div>
    </div>

    <div class="glass rounded-xl p-5 border border-[#4285f4]/25 bg-[#4285f4]/5" id="archive-drive-connect"></div>

    <div class="glass rounded-xl p-4 border border-border/80" id="archive-drive-guide"></div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3" id="archive-stats"></div>

    <div class="archive-dropzone p-6 text-center opacity-80" id="archive-dropzone">
        <svg class="w-10 h-10 mx-auto text-[#4285f4]/60 mb-2" viewBox="0 0 24 24" fill="currentColor"><path d="M7.71 3.5L1.15 15l3.43 5.5h6.84l6.57-10.5L7.71 3.5z"/></svg>
        <p class="text-sm text-gray-300 font-medium">파일 업로드 · 하위 폴더 생성은 Google Drive에서</p>
        <p class="text-[10px] text-gray-500 mt-1">아래 「Drive 폴더 열기」로 이동한 뒤 폴더명·구조를 변경하세요. Omnify는 목록 · 검색 · 바로가기를 제공합니다.</p>
        <button type="button" id="btn-archive-open-drive-dz" class="mt-3 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-[#4285f4]/35 text-blue-300 hover:bg-[#4285f4]/10">↗ Drive에서 관리하기</button>
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
        var actionLabel = o.status === 'pending' ? '원천에서 처리' : o.status === 'processing' ? '원천에서 출고' : '완료';
        var actionClass = o.status === 'shipped' ? 'text-gray-500 cursor-default' : 'text-warning hover:underline';
        var actionClick = o.status === 'shipped' ? '' : "processOrder('" + o.id + "')";
        return `
    <tr class="table-row">
        <td class="px-5 py-3"><input type="checkbox" class="rounded"></td>
        <td class="px-5 py-3 font-mono text-xs text-gray-400">${o.id}</td>
        <td class="px-5 py-3">${App.channelBadge(o.channel)}</td>
        <td class="px-5 py-3 text-gray-300">${o.product || o.productTitle || ''}</td>
        <td class="px-5 py-3 text-right font-mono">${App.formatWon(o.amount)}</td>
        <td class="px-5 py-3 text-center">${App.statusBadge(o.status)}</td>
        <td class="px-5 py-3 text-right text-xs text-gray-500">${o.time}</td>
        <td class="px-5 py-3 text-center"><button onclick="${actionClick}" class="text-xs ${actionClass}">${actionLabel}</button></td>
    </tr>`;
    }).join('');
}
function filterOrders(f) { const m={발주대기:'pending',처리중:'processing',출고완료:'shipped'}; renderOrders(f==='전체'?App.orders:App.orders.filter(o=>o.status===m[f])); }
function searchOrders(q) {
    var l = q.toLowerCase();
    renderOrders(App.orders.filter(function (o) {
        return String(o.id).toLowerCase().indexOf(l) >= 0 ||
            String(o.product || o.productTitle || '').toLowerCase().indexOf(l) >= 0;
    }));
}
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

var SETTINGS_STORAGE_KEY = 'omnisync_settings_v2';
var TEAM_STORAGE_KEY = 'omnify_team_v2';
var settingsActiveTab = 'team';
App.settings = null;

function getSettingsDefaults() {
    var base = {
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
        appearance: {
            mode: 'dark',
            tone: 'ocean',
        },
    };
    if (App.tenantMeta && App.tenantMeta.custom && typeof customToSettingsPatch === 'function') {
        var patch = customToSettingsPatch(App.tenantMeta.custom, App.tenantMeta.channels);
        base.kpi = Object.assign({}, base.kpi, patch.kpi || {});
        base.margins = Object.assign({}, base.margins, patch.margins || {});
        base.inventory = Object.assign({}, base.inventory, patch.inventory || {});
        if (patch.adBudget) base.adBudget = Object.assign({}, base.adBudget, patch.adBudget);
        if (patch.channels && patch.channels.length) base.channels = patch.channels;
        if (patch.adMedia && patch.adMedia.length) base.adMedia = patch.adMedia;
    }
    return base;
}

function getSettings() {
    if (!App.settings) loadSettings();
    return App.settings;
}

function loadSettings() {
    var key = typeof tenantStorageKey === 'function' ? tenantStorageKey(SETTINGS_STORAGE_KEY) : SETTINGS_STORAGE_KEY;
    try {
        var raw = localStorage.getItem(key);
        if (raw) {
            App.settings = Object.assign(getSettingsDefaults(), JSON.parse(raw));
            if (!App.settings.appearance) App.settings.appearance = getSettingsDefaults().appearance;
            App.settings.appearance = normalizeAppearance(App.settings.appearance);
            if (typeof applyTenantCustomAfterLoad === 'function' && App.tenantMeta) {
                /* keep user edits; custom only fills missing seed path via getSettingsDefaults */
            }
            return;
        }
    } catch (e) { /* ignore */ }
    App.settings = getSettingsDefaults();
}

function persistSettings() {
    try {
        var key = typeof tenantStorageKey === 'function' ? tenantStorageKey(SETTINGS_STORAGE_KEY) : SETTINGS_STORAGE_KEY;
        localStorage.setItem(key, JSON.stringify(App.settings));
    } catch (e) {
        showToast('설정 저장에 실패했습니다.', 'danger');
    }
    applyAppearanceSettings();
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
    applyAppearanceSettings();
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
    if (settingsActiveTab === 'appearance' || document.getElementById('set-appearance-mode')) {
        collectAppearanceFromForm(s);
    }
}

var APPEARANCE_UI_THEME_KEY = 'omnify_ui_theme';
var APPEARANCE_TONES = [
    { id: 'ocean', label: '오션 블루', desc: '기본 · 신뢰감 · 데이터 대시보드', sw1: '#3b82f6', sw2: '#8b5cf6' },
    { id: 'slate', label: '슬레이트', desc: '중립 · 비즈니스 · 차분한 톤', sw1: '#475569', sw2: '#0f766e' },
    { id: 'forest', label: '포레스트', desc: '성장 · 마진 · 친환경 인상', sw1: '#059669', sw2: '#14b8a6' },
    { id: 'rose', label: '로즈', desc: '강조 · 프로모션 · 캠페인', sw1: '#e11d48', sw2: '#db2777' },
    { id: 'amber', label: '앰버', desc: '워밍 · 세일 · 알림 강조', sw1: '#d97706', sw2: '#ea580c' },
];

function normalizeAppearance(a) {
    var tones = { ocean: 1, slate: 1, forest: 1, rose: 1, amber: 1 };
    return {
        mode: (a && a.mode === 'light') ? 'light' : 'dark',
        tone: (a && tones[a.tone]) ? a.tone : 'ocean',
    };
}

function applyAppearanceSettings(opt) {
    var s = getSettings();
    if (!s.appearance) s.appearance = getSettingsDefaults().appearance;
    var ap = normalizeAppearance(opt || s.appearance);
    s.appearance = ap;
    var root = document.documentElement;
    root.setAttribute('data-theme', ap.mode);
    root.setAttribute('data-tone', ap.tone);
    root.style.colorScheme = ap.mode;
    try {
        localStorage.setItem(APPEARANCE_UI_THEME_KEY, JSON.stringify(ap));
    } catch (e) { /* ignore */ }
    if (typeof Chart !== 'undefined') {
        Chart.defaults.color = ap.mode === 'light' ? '#334155' : '#a8b0bc';
        Chart.defaults.borderColor = ap.mode === 'light' ? 'rgba(148,163,184,0.45)' : 'rgba(55,65,81,0.45)';
        if (Chart.defaults.scale && Chart.defaults.scale.grid) {
            Chart.defaults.scale.grid.color = ap.mode === 'light' ? 'rgba(148,163,184,0.35)' : 'rgba(55,65,81,0.35)';
        }
    }
}

function collectAppearanceFromForm(s) {
    s = s || getSettings();
    if (!s.appearance) s.appearance = getSettingsDefaults().appearance;
    var modeEl = document.querySelector('input[name="set-appearance-mode"]:checked') || document.getElementById('set-appearance-mode');
    var toneEl = document.querySelector('input[name="set-appearance-tone"]:checked');
    if (modeEl && modeEl.value) s.appearance.mode = modeEl.value;
    if (toneEl && toneEl.value) s.appearance.tone = toneEl.value;
    s.appearance = normalizeAppearance(s.appearance);
    return s.appearance;
}

function previewAppearance(mode, tone) {
    var s = getSettings();
    if (!s.appearance) s.appearance = getSettingsDefaults().appearance;
    if (mode) s.appearance.mode = mode;
    if (tone) s.appearance.tone = tone;
    s.appearance = normalizeAppearance(s.appearance);
    applyAppearanceSettings(s.appearance);
    if (settingsActiveTab === 'appearance') renderSettingsPanel();
}

function saveAppearanceSettings() {
    collectAppearanceFromForm();
    persistSettings();
    showToast('외관 설정이 적용·저장되었습니다.', 'success');
    if (typeof initCharts === 'function' && App.currentView && App.currentView !== 'view-settings') {
        try { initCharts(); } catch (e) { /* ignore */ }
    }
}

var SETTINGS_TABS = [
    { id: 'appearance', label: '외관 · 톤', icon: '🎨' },
    { id: 'team', label: '팀 · 좌석', icon: '👥' },
    { id: 'kpi', label: '목표 KPI', icon: '🎯' },
    { id: 'margins', label: '마진율', icon: '📊' },
    { id: 'adbudget', label: '광고비', icon: '💰' },
    { id: 'inventory', label: '재고 기준', icon: '📦' },
    { id: 'channels', label: '판매처', icon: '🏪' },
    { id: 'admedia', label: '광고 매체', icon: '📢' },
];

function loadTeamMembers() {
    try {
        var key = typeof tenantStorageKey === 'function' ? tenantStorageKey(TEAM_STORAGE_KEY) : TEAM_STORAGE_KEY;
        var raw = localStorage.getItem(key);
        if (raw) {
            var parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length) App.teamMembers = parsed;
        }
    } catch (e) { /* ignore */ }
}

function saveTeamMembers() {
    try {
        var key = typeof tenantStorageKey === 'function' ? tenantStorageKey(TEAM_STORAGE_KEY) : TEAM_STORAGE_KEY;
        localStorage.setItem(key, JSON.stringify(App.teamMembers));
    } catch (e) { /* ignore */ }
    if (typeof applyTierMeta === 'function') applyTierMeta();
    if (typeof updateSeatMeterUI === 'function') updateSeatMeterUI();
    renderUserSwitchMenu();
}

function seatTypeLabel(type) {
    if (type === 'admin') return '관리자';
    if (type === 'viewer') return '뷰어 (읽기전용)';
    return '멤버';
}

function inviteTeamMember() {
    var name = (document.getElementById('team-invite-name') || {}).value || '';
    var email = (document.getElementById('team-invite-email') || {}).value || '';
    var role = (document.getElementById('team-invite-role') || {}).value || '운영팀';
    var seatType = (document.getElementById('team-invite-seat') || {}).value || 'member';
    name = name.trim();
    email = email.trim();
    if (!name || !email) {
        showToast('이름과 이메일을 입력하세요.', 'warning');
        return;
    }
    if (typeof canAddTeamSeat === 'function' && !canAddTeamSeat(seatType)) {
        var lim = typeof getTierLimits === 'function' ? getTierLimits() : { seatAddonLabel: '+5만/인·월' };
        showToast('좌석 한도에 도달했습니다. 추가 작업 좌석(' + lim.seatAddonLabel + ') 또는 플랜 업그레이드를 문의하세요.', 'warning');
        return;
    }
    var id = 'u' + Date.now().toString(36);
    var colors = ['from-cyan-500 to-blue-500', 'from-rose-500 to-pink-500', 'from-lime-500 to-green-500'];
    App.teamMembers.push({
        id: id,
        name: name,
        role: role,
        email: email,
        avatar: name.charAt(0),
        color: colors[App.teamMembers.length % colors.length],
        seatType: seatType,
        active: true
    });
    saveTeamMembers();
    addActivityLog({ userId: App.currentUserId, action: '팀원 초대', category: 'auth', type: 'info', detail: name + ' (' + seatTypeLabel(seatType) + ') 초대', meta: email + ' · 데모' });
    if (settingsActiveTab === 'team') renderSettingsPanel();
    showToast(name + '님을 초대했습니다. (데모: 즉시 활성)', 'success');
}

function toggleTeamMemberActive(userId) {
    var m = App.teamMembers.find(function(x) { return x.id === userId; });
    if (!m) return;
    if (!m.active && m.seatType !== 'viewer' && typeof canAddTeamSeat === 'function' && !canAddTeamSeat(m.seatType)) {
        showToast('활성 좌석 한도에 도달했습니다. 추가 좌석 옵션을 문의하세요.', 'warning');
        return;
    }
    if (!m.active && m.seatType === 'viewer' && typeof canAddTeamSeat === 'function' && !canAddTeamSeat('viewer')) {
        showToast('무료 뷰어 한도에 도달했습니다. 그로스는 뷰어 2인, 엔터프라이즈는 뷰어 무제한입니다.', 'warning');
        return;
    }
    m.active = !m.active;
    saveTeamMembers();
    if (settingsActiveTab === 'team') renderSettingsPanel();
    showToast(m.name + '님을 ' + (m.active ? '활성화' : '비활성화') + '했습니다.', 'info');
}

function requestSeatAddon() {
    var lim = typeof getTierLimits === 'function' ? getTierLimits() : { seatAddonPrice: 50000, seatAddonLabel: '+5만/인·월' };
    try {
        var key = 'omnify_seat_addon_' + App.tier;
        var n = parseInt(localStorage.getItem(key) || '0', 10) + 1;
        localStorage.setItem(key, String(n));
    } catch (e) { /* ignore */ }
    if (typeof applyTierMeta === 'function') applyTierMeta();
    if (settingsActiveTab === 'team') renderSettingsPanel();
    showToast('추가 좌석 1개가 반영되었습니다. (데모: ' + lim.seatAddonLabel + ')', 'success');
}

function getExportGuard() {
    return (typeof EXPORT_GUARD !== 'undefined' && EXPORT_GUARD) ? EXPORT_GUARD : {
        maxSyncRows: 50000,
        softQueueRows: 100000,
        hardRawDumpRows: 500000,
        pdfPerDay: 20,
        exportsPerMinute: 5,
        exportsPerHour: 40
    };
}

function readExportLog() {
    try {
        var raw = localStorage.getItem('omnify_export_log_v1');
        var list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
}

function writeExportLog(list) {
    try {
        var cutoff = Date.now() - 48 * 60 * 60 * 1000;
        var trimmed = (list || []).filter(function(x) { return x && x.ts >= cutoff; }).slice(-200);
        localStorage.setItem('omnify_export_log_v1', JSON.stringify(trimmed));
    } catch (e) { /* ignore */ }
}

function recordExportEvent(format, rows) {
    var list = readExportLog();
    list.push({ ts: Date.now(), format: format, rows: rows || 0 });
    writeExportLog(list);
}

function countExportsSince(msAgo, format) {
    var since = Date.now() - msAgo;
    return readExportLog().filter(function(x) {
        if (x.ts < since) return false;
        if (format && x.format !== format) return false;
        return true;
    }).length;
}

/**
 * Export abuse guard — monthly quota 없음.
 * 대용량 원시 덤프 / PDF 고빈도 / 스크래핑성 연속 Export / 서버 큐 필요 건수만 차단·안내.
 * options.estimatedRawRows: 원천 주문·로그 추정 건수(데모는 dataHubMeta.totalRows 사용)
 */
function checkExportGuard(format, aggregationRows, options) {
    options = options || {};
    var g = getExportGuard();
    var rows = aggregationRows || 0;
    var wantRaw = !!options.rawDump;

    if (wantRaw) {
        return {
            ok: false,
            code: 'RAW_DUMP',
            message: 'Export 출력 한도를 초과했습니다. 원천 주문·로그(대용량 원시 데이터)는 Omnify에서 다운로드할 수 없습니다. Cafe24·스마트스토어·쿠팡 등 해당 채널 어드민에서 직접 내려받아 주세요.'
        };
    }

    if (rows >= g.softQueueRows) {
        return {
            ok: false,
            code: 'QUEUE_REQUIRED',
            message: '요청 데이터가 ' + rows.toLocaleString() +
                '건으로 동기 Export 한도를 초과합니다. 대용량 Export는 백그라운드 생성·이메일 링크로만 제공하며, 현재는 기간·채널 필터를 좁히거나 해당 판매 채널에서 직접 다운로드해 주세요.'
        };
    }

    if (rows > g.maxSyncRows) {
        return {
            ok: false,
            code: 'SYNC_ROW_LIMIT',
            message: '한 번에 내보낼 수 있는 집계 행은 최대 ' + g.maxSyncRows.toLocaleString() +
                '건입니다. 기간·채널 필터를 좁힌 뒤 다시 시도하거나, 원천 데이터는 판매 채널에서 다운로드하세요.'
        };
    }

    if (format === 'pdf') {
        var pdfToday = countExportsSince(24 * 60 * 60 * 1000, 'pdf');
        if (pdfToday >= g.pdfPerDay) {
            return {
                ok: false,
                code: 'PDF_RATE',
                message: 'PDF Export는 하루 ' + g.pdfPerDay + '회로 제한됩니다. 화면 캡처 렌더는 서버·브라우저 부하가 큽니다. CSV·Excel로 대신 받거나 내일 다시 시도해 주세요.'
            };
        }
    }

    var perMin = countExportsSince(60 * 1000);
    if (perMin >= g.exportsPerMinute) {
        return {
            ok: false,
            code: 'BURST',
            message: '짧은 시간에 Export가 너무 많이 요청되었습니다(' + g.exportsPerMinute + '회/분). 자동화·스크래핑으로 의심되어 잠시 차단합니다. 1분 후 다시 시도해 주세요.'
        };
    }

    var perHour = countExportsSince(60 * 60 * 1000);
    if (perHour >= g.exportsPerHour) {
        return {
            ok: false,
            code: 'HOURLY_ABUSE',
            message: '시간당 Export 보호 한도(' + g.exportsPerHour + '회)에 도달했습니다. 정상 업무용 Export는 제한이 없으며, 연속·자동화 요청만 차단됩니다.'
        };
    }

    return { ok: true };
}

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
    var lim = typeof getTierLimits === 'function' ? getTierLimits() : { seatsIncluded: 2, seatAddonLabel: '+5만/인·월', dataRetentionLabel: '12개월', freeViewers: 0 };
    var quota = typeof getSeatQuota === 'function' ? getSeatQuota() : lim.seatsIncluded;
    var used = typeof countBillableSeats === 'function' ? countBillableSeats() : 0;
    var viewers = typeof countActiveViewers === 'function' ? countActiveViewers() : 0;
    var addon = typeof getSeatAddonCount === 'function' ? getSeatAddonCount() : 0;

    if (settingsActiveTab === 'team') {
        html = '<h3 class="font-bold text-sm mb-1">팀 · 작업 좌석 관리</h3>' +
            '<p class="text-xs text-gray-500 mb-4">작업 좌석 = <strong class="text-gray-400">로그인·편집이 가능한 활성 계정</strong> 수입니다. 동시 접속 인원이 아닙니다. 뷰어(읽기 전용)와 카카오 알림톡 수신자(스타터 1 · 그로스 3 · 엔터 5명 기본)는 작업 좌석에 포함되지 않습니다.</p>' +
            '<div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">' +
                '<div class="p-4 rounded-xl bg-surface border border-border">' +
                    '<p class="text-[10px] text-gray-500 mb-1">작업 좌석 (Named)</p>' +
                    '<p class="text-2xl font-extrabold">' + used + '<span class="text-sm text-gray-500 font-normal"> / ' + quota + '</span></p>' +
                    '<p class="text-[10px] text-gray-600 mt-1">기본 ' + lim.seatsIncluded + '인' + (addon ? ' + 추가 ' + addon + '인' : '') + '</p>' +
                '</div>' +
                '<div class="p-4 rounded-xl bg-surface border border-border">' +
                    '<p class="text-[10px] text-gray-500 mb-1">뷰어 (읽기 전용 · 무료)</p>' +
                    '<p class="text-2xl font-extrabold">' + viewers + '<span class="text-sm text-gray-500 font-normal"> / ' + (typeof formatViewerQuota === 'function' ? formatViewerQuota(lim) : lim.freeViewers) + '</span></p>' +
                    '<p class="text-[10px] text-gray-600 mt-1">' + (typeof isViewerUnlimited === 'function' && isViewerUnlimited() ? '엔터프라이즈 · 무제한 혜택' : (!canInviteViewer(lim) ? '스타터 · 뷰어 미포함' : '작업 좌석 미차감')) + '</p>' +
                '</div>' +
                '<div class="p-4 rounded-xl bg-surface border border-border">' +
                    '<p class="text-[10px] text-gray-500 mb-1">DataHub 보존</p>' +
                    '<p class="text-lg font-extrabold leading-tight">' + lim.dataRetentionLabel + '</p>' +
                    '<p class="text-[10px] text-gray-600 mt-1">Export 월 한도 없음 · 대용량·고빈도만 보호</p>' +
                '</div>' +
            '</div>' +
            '<div class="flex flex-wrap gap-2 mb-5">' +
                '<button type="button" onclick="requestSeatAddon()" class="text-xs font-semibold px-3 py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary/10">+ 추가 작업 좌석 (데모)</button>' +
                '<a href="index.html#pricing" target="_blank" rel="noopener" class="text-xs font-semibold px-3 py-2 rounded-lg border border-border hover:border-violet-500/40 text-gray-300">플랜 · 옵션 안내 ↗</a>' +
            '</div>' +
            '<h4 class="font-semibold text-xs text-gray-400 mb-2">팀원 목록</h4>' +
            '<div class="space-y-2 mb-5">' +
            App.teamMembers.map(function(m) {
                var seatBadge = m.seatType === 'viewer'
                    ? '<span class="text-[9px] px-1.5 py-0.5 rounded bg-surface border border-border text-gray-400">뷰어</span>'
                    : '<span class="text-[9px] px-1.5 py-0.5 rounded bg-primary/15 text-blue-300 border border-primary/25">' + seatTypeLabel(m.seatType) + '</span>';
                return '<div class="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-surface border border-border ' + (m.active === false ? 'opacity-60' : '') + '">' +
                    '<span class="w-9 h-9 rounded-full bg-gradient-to-br ' + m.color + ' flex items-center justify-center text-xs font-bold text-white shrink-0">' + m.avatar + '</span>' +
                    '<div class="flex-1 min-w-[140px]"><p class="text-sm font-semibold">' + m.name + ' ' + seatBadge + '</p>' +
                    '<p class="text-[10px] text-gray-500">' + m.role + ' · ' + (m.email || '') + '</p></div>' +
                    '<span class="text-[10px] ' + (m.active !== false ? 'text-success' : 'text-gray-500') + ' font-bold">' + (m.active !== false ? '활성' : '비활성') + '</span>' +
                    '<button type="button" onclick="toggleTeamMemberActive(\'' + m.id + '\')" class="text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-border hover:border-primary/40">' + (m.active !== false ? '비활성화' : '활성화') + '</button>' +
                '</div>';
            }).join('') +
            '</div>' +
            '<h4 class="font-semibold text-xs text-gray-400 mb-2">팀원 초대</h4>' +
            '<div class="p-4 rounded-xl border border-dashed border-border space-y-3">' +
                '<div class="settings-row">' +
                    '<div><label class="settings-label">이름</label><input id="team-invite-name" type="text" class="settings-input" placeholder="홍길동"></div>' +
                    '<div><label class="settings-label">이메일</label><input id="team-invite-email" type="email" class="settings-input" placeholder="name@company.co.kr"></div>' +
                '</div>' +
                '<div class="settings-row">' +
                    '<div><label class="settings-label">역할</label><input id="team-invite-role" type="text" class="settings-input" value="운영팀"></div>' +
                    '<div><label class="settings-label">계정 유형</label><select id="team-invite-seat" class="settings-input">' +
                        '<option value="member">멤버 — 작업 좌석 1</option>' +
                        '<option value="admin">관리자 — 작업 좌석 1</option>' +
                        (typeof canInviteViewer === 'function' && canInviteViewer(lim) ? '<option value="viewer">뷰어 — 읽기전용 (무료·작업좌석 미차감)</option>' : '') +
                    '</select></div>' +
                '</div>' +
                '<button type="button" onclick="inviteTeamMember()" class="text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-white">초대 보내기</button>' +
                '<p class="text-[10px] text-gray-600">작업 좌석 초과 시 ' + lim.seatAddonLabel + ' · 뷰어: 스타터 0 / 그로스 2 / 엔터 무제한 · 쓰지 않는 계정은 비활성 시 좌석 반환</p>' +
            '</div>';
    }

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

    if (settingsActiveTab === 'appearance') {
        if (!s.appearance) s.appearance = getSettingsDefaults().appearance;
        var ap = normalizeAppearance(s.appearance);
        html = '<h3 class="font-bold text-sm mb-1">외관 · 톤앤매너</h3>' +
            '<p class="text-xs text-gray-500 mb-5">다크/라이트 모드와 브랜드 톤을 선택합니다. <strong class="text-gray-400">배경·본문·보조텍스트 대비는 테마가 고정 보장</strong>하고, 톤은 Primary/Accent 강조색만 바꿉니다.</p>' +
            '<h4 class="font-semibold text-xs text-gray-400 mb-2">화면 모드</h4>' +
            '<div class="flex flex-wrap gap-3 mb-6">' +
                '<button type="button" class="appearance-mode-btn' + (ap.mode === 'dark' ? ' active' : '') + '" onclick="previewAppearance(\'dark\')">' +
                    '<input type="radio" name="set-appearance-mode" id="set-appearance-mode" value="dark" ' + (ap.mode === 'dark' ? 'checked' : '') + ' class="sr-only">' +
                    '<p class="text-sm font-bold mb-1">다크 모드</p>' +
                    '<p class="text-[11px] text-gray-500">야간·집중형 · 기본</p>' +
                '</button>' +
                '<button type="button" class="appearance-mode-btn' + (ap.mode === 'light' ? ' active' : '') + '" onclick="previewAppearance(\'light\')">' +
                    '<input type="radio" name="set-appearance-mode" value="light" ' + (ap.mode === 'light' ? 'checked' : '') + ' class="sr-only">' +
                    '<p class="text-sm font-bold mb-1">라이트 모드</p>' +
                    '<p class="text-[11px] text-gray-500">주간·인쇄 친화 · 고대비</p>' +
                '</button>' +
            '</div>' +
            '<h4 class="font-semibold text-xs text-gray-400 mb-2">템플릿 톤앤매너</h4>' +
            '<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-4">' +
            APPEARANCE_TONES.map(function(t) {
                return '<button type="button" class="appearance-swatch' + (ap.tone === t.id ? ' active' : '') + '" onclick="previewAppearance(null,\'' + t.id + '\')">' +
                    '<input type="radio" name="set-appearance-tone" value="' + t.id + '" ' + (ap.tone === t.id ? 'checked' : '') + ' class="sr-only">' +
                    '<div class="swatch-bar" style="--sw1:' + t.sw1 + ';--sw2:' + t.sw2 + '"></div>' +
                    '<p class="text-sm font-bold">' + t.label + '</p>' +
                    '<p class="text-[11px] text-gray-500 mt-0.5">' + t.desc + '</p>' +
                '</button>';
            }).join('') +
            '</div>' +
            '<div class="appearance-preview" aria-live="polite">' +
                '<p class="pv-title">미리보기 · 가독성 체크</p>' +
                '<p class="pv-muted">본문·보조 텍스트가 배경과 구분되는지 확인하세요. 톤은 강조색만 변경합니다.</p>' +
                '<span class="pv-btn">Primary 버튼</span>' +
            '</div>' +
            '<div class="flex flex-wrap gap-2 mt-5">' +
                '<button type="button" onclick="saveAppearanceSettings()" class="text-xs font-semibold px-4 py-2 rounded-lg bg-primary text-white">외관 저장 · 적용</button>' +
                '<button type="button" onclick="previewAppearance(\'dark\',\'ocean\'); saveAppearanceSettings()" class="text-xs font-semibold px-4 py-2 rounded-lg border border-border hover:border-primary/40">기본값 복원</button>' +
            '</div>';
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

var ARCHIVE_STORAGE_KEY = 'omnisync_archive_v2';
var COMMS_STORAGE_KEY = 'omnisync_comms_v2';
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
        { id: 'f4', name: '재고실사_체크리스트.xlsx', category: 'inventory', ext: 'xlsx', size: 512000, tags: ['재고', '사방넷'], pinned: false, uploadedBy: 'park', uploadedAt: '2026-07-05', downloads: 15, version: 'v1.2', mockContent: 'SKU,Name,Expected,Actual,Diff\nSKU-COS-001,히트세럼,24,24,0' },
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
            { id: 't5', type: 'check', from: 'choi', to: 'park', dept: '운영팀', title: '에이블리 API 토큰 갱신 확인', body: '에이블리 OAuth 토큰 7일 후 만료 예정. 자동 토큰 갱신 동작 확인 부탁드립니다.', status: 'hold', priority: 'normal', due: '2026-07-15', createdAt: '2026-07-10 08:00', unread: false, replies: [] },
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

function getTenantDriveInfo() {
    var t = (typeof App !== 'undefined' && App.tenantMeta) ? App.tenantMeta : null;
    var folderId = '';
    var folderUrl = '';
    var owner = '';
    var sharedWith = '';
    var enabled = true;
    var keyId = '';
    var company = '';
    if (t) {
        folderId = t.driveFolderId || (typeof extractDriveFolderId === 'function' ? extractDriveFolderId(t.driveFolderUrl) : '') || '';
        folderUrl = t.driveFolderUrl || '';
        owner = t.driveOwnerEmail || '';
        sharedWith = t.driveSharedWith || '';
        enabled = t.driveEnabled !== false;
        keyId = t.keyId || t.projectFolder || t.id || '';
        company = t.companyName || '';
    }
    var openUrl = '';
    if (folderUrl && /^https?:\/\//i.test(folderUrl)) {
        openUrl = folderUrl;
    } else if (folderId) {
        openUrl = 'https://drive.google.com/drive/folders/' + encodeURIComponent(folderId);
    }
    return {
        enabled: enabled,
        configured: !!(openUrl || folderId || folderUrl),
        folderId: folderId,
        folderUrl: folderUrl,
        openUrl: openUrl,
        owner: owner,
        sharedWith: sharedWith,
        keyId: keyId,
        company: company
    };
}

function openTenantDriveFolder() {
    var info = getTenantDriveInfo();
    if (!info.openUrl) {
        showToast('등록된 Drive 폴더가 없습니다. 구축 어드민에서 공유 폴더 URL을 등록해 주세요.', 'warning');
        return;
    }
    window.open(info.openUrl, '_blank', 'noopener,noreferrer');
}

function copyTenantDriveFolderLink() {
    var info = getTenantDriveInfo();
    if (!info.openUrl) {
        showToast('복사할 폴더 링크가 없습니다.', 'warning');
        return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(info.openUrl).then(function () {
            showToast('Drive 폴더 링크를 복사했습니다.', 'success');
        }).catch(function () {
            showToast(info.openUrl, 'info');
        });
    } else {
        showToast(info.openUrl, 'info');
    }
}

function escapeArchiveHtml(s) {
    return String(s || '').replace(/[&<>"']/g, function (c) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
}

function renderArchiveDrivePanel() {
    var box = document.getElementById('archive-drive-connect');
    var guide = document.getElementById('archive-drive-guide');
    var info = getTenantDriveInfo();
    var openBtn = document.getElementById('btn-archive-open-drive');
    var dzBtn = document.getElementById('btn-archive-open-drive-dz');

    function bindOpen(el) {
        if (!el) return;
        el.onclick = function (e) {
            e.preventDefault();
            openTenantDriveFolder();
        };
        el.disabled = !info.openUrl;
        el.classList.toggle('opacity-40', !info.openUrl);
        el.classList.toggle('cursor-not-allowed', !info.openUrl);
    }
    bindOpen(openBtn);
    bindOpen(dzBtn);

    if (box) {
        if (!info.enabled) {
            box.innerHTML =
                '<div class="flex items-start gap-3">' +
                '<div class="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-lg">📁</div>' +
                '<div><p class="font-bold text-sm text-amber-200">Drive 연동 미포함</p>' +
                '<p class="text-xs text-gray-400 mt-1">이 테넌트는 Drive 자료실이 꺼져 있습니다. 어드민에서 연동을 켜고 폴더를 등록하세요.</p></div></div>';
        } else if (!info.configured) {
            box.innerHTML =
                '<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">' +
                '<div class="flex items-start gap-3">' +
                '<div class="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-200 text-lg">!</div>' +
                '<div><p class="font-bold text-sm text-amber-100">공유 폴더 미등록</p>' +
                '<p class="text-xs text-gray-400 mt-0.5">구축 시 등록한 Drive 폴더 URL이 없습니다.</p>' +
                '<p class="text-[11px] text-gray-500 mt-1">어드민 → 계약 · 기본 → Google Drive 자료실에 폴더 URL을 넣어 주세요.</p></div></div>' +
                '<span class="text-[10px] px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-200 font-bold shrink-0">설정 필요</span></div>';
        } else {
            var pathLabel = info.folderId
                ? (info.keyId ? info.keyId + ' / ' : '') + info.folderId
                : (info.folderUrl || '등록된 폴더');
            box.innerHTML =
                '<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">' +
                '<div class="flex items-start gap-3 min-w-0">' +
                '<div class="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">' +
                '<svg class="w-6 h-6" viewBox="0 0 24 24"><path fill="#4285F4" d="M7.71 3.5L1.15 15l3.43 5.5h6.84l6.57-10.5L7.71 3.5z"/><path fill="#34A853" d="M16.14 15L12.58 21H5.74l3.43-5.5h6.97z"/><path fill="#FBBC04" d="M7.71 3.5h8.57L22.85 15h-6.71L7.71 3.5z"/></svg></div>' +
                '<div class="min-w-0">' +
                '<p class="font-bold text-sm">Google Drive 연동됨' +
                (info.company ? ' · ' + escapeArchiveHtml(info.company) : '') + '</p>' +
                (info.owner ? '<p class="text-xs text-gray-400 mt-0.5">소유자: ' + escapeArchiveHtml(info.owner) + '</p>' : '') +
                (info.sharedWith ? '<p class="text-xs text-gray-500">Omnify 공유 계정: ' + escapeArchiveHtml(info.sharedWith) + '</p>' : '') +
                '<p class="text-xs text-gray-500 mt-1 truncate" title="' + escapeArchiveHtml(pathLabel) + '">폴더: <span class="font-mono text-gray-300">' +
                escapeArchiveHtml(pathLabel) + '</span></p>' +
                '<p class="text-[10px] text-gray-500 mt-1">저장 비용은 고객 Google 계정 · 폴더 구조 변경은 Drive에서</p>' +
                '</div></div>' +
                '<div class="flex flex-wrap gap-2 shrink-0">' +
                '<span class="text-[10px] px-2.5 py-1 rounded-full bg-success/20 text-success font-bold self-center">연동 활성</span>' +
                '<button type="button" id="btn-archive-copy-link" class="text-[10px] font-semibold px-3 py-1.5 rounded-lg border border-border hover:border-primary/40">링크 복사</button>' +
                '<button type="button" id="btn-archive-manage" class="text-[10px] font-semibold px-3 py-1.5 rounded-lg border border-[#4285f4]/40 text-blue-300 hover:bg-[#4285f4]/10">↗ Drive에서 관리</button>' +
                '</div></div>';
            var copyBtn = document.getElementById('btn-archive-copy-link');
            var manageBtn = document.getElementById('btn-archive-manage');
            if (copyBtn) copyBtn.onclick = copyTenantDriveFolderLink;
            if (manageBtn) manageBtn.onclick = openTenantDriveFolder;
        }
    }

    if (guide) {
        guide.innerHTML =
            '<p class="text-xs font-bold text-gray-200 mb-2">폴더 커스텀 가이드 (Google Drive)</p>' +
            '<ol class="text-[11px] text-gray-400 space-y-1.5 list-decimal pl-4 leading-relaxed">' +
            '<li><button type="button" class="text-blue-300 underline underline-offset-2 hover:text-blue-200" id="btn-archive-guide-open">등록된 공유 폴더</button>를 Drive에서 엽니다.</li>' +
            '<li>하위 폴더 만들기: 우클릭 → <span class="text-gray-300">새 폴더</span> (예: 계약서 / 정산 / 디자인).</li>' +
            '<li>폴더명 변경: 폴더 선택 → 이름 바꾸기. Omnify 연동은 같은 폴더 ID를 유지합니다.</li>' +
            '<li>파일 업로드·이동도 Drive에서 진행하세요. Omnify는 조회·검색·바로가기만 제공합니다.</li>' +
            '<li>연동 폴더 자체를 바꾸려면 Omnify 담당자(어드민)에게 새 URL 등록을 요청하세요.</li>' +
            '</ol>' +
            (!info.openUrl
                ? '<p class="text-[11px] text-amber-200/90 mt-3">아직 폴더가 없어 바로가기를 열 수 없습니다. 구축 어드민에 Drive URL을 먼저 등록해 주세요.</p>'
                : '<p class="text-[11px] text-gray-500 mt-3">팁: 팀원에게는 「링크 복사」로 폴더 주소를 공유하면 됩니다.</p>');
        var gOpen = document.getElementById('btn-archive-guide-open');
        if (gOpen) {
            gOpen.onclick = openTenantDriveFolder;
            if (!info.openUrl) {
                gOpen.classList.add('opacity-50', 'pointer-events-none');
                gOpen.classList.remove('underline');
            }
        }
    }
}

function initArchiveView() {
    renderArchiveDrivePanel();
    renderArchiveStats();
    renderArchiveCatFilters();
    renderArchiveFiles();
    var dz = document.getElementById('archive-dropzone');
    if (dz) {
        dz.onclick = function (e) {
            if (e.target && (e.target.id === 'btn-archive-open-drive-dz' || e.target.closest('#btn-archive-open-drive-dz'))) return;
            openTenantDriveFolder();
        };
    }
    document.querySelectorAll('.archive-sort-btn').forEach(function(btn) {
        btn.classList.toggle('bg-surface', btn.dataset.asort === archiveFilter.sort);
        btn.classList.toggle('border-primary/40', btn.dataset.asort === archiveFilter.sort);
    });
    dgRefresh();
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
    dgRefresh();
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

function getDataHubAsOfDate() {
    var end = App.globalDateRange && App.globalDateRange.end
        ? parseYmd(App.globalDateRange.end)
        : null;
    return end || startOfDay(new Date());
}

function dataHubIsoWeek(d) {
    var date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var day = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - day);
    var yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    var week = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return { year: date.getUTCFullYear(), week: week };
}

function buildDataHubPeriodPoints(period, asOf) {
    var points = [];
    var i, d, wk, start, end, lab;

    if (period === 'daily') {
        for (i = 29; i >= 0; i--) {
            d = new Date(asOf.getFullYear(), asOf.getMonth(), asOf.getDate() - i);
            points.push({
                date: startOfDay(d),
                label: fmtDateYmd(d),
                shortLabel: (d.getMonth() + 1) + '/' + d.getDate()
            });
        }
    } else if (period === 'weekly') {
        end = startOfWeekMon(asOf);
        for (i = 15; i >= 0; i--) {
            start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - i * 7);
            wk = dataHubIsoWeek(start);
            lab = wk.year + '-W' + datePad2(wk.week);
            points.push({
                date: startOfDay(start),
                label: lab,
                shortLabel: (start.getMonth() + 1) + '/' + start.getDate() + '주'
            });
        }
    } else if (period === 'monthly') {
        for (i = 11; i >= 0; i--) {
            d = new Date(asOf.getFullYear(), asOf.getMonth() - i, 1);
            points.push({
                date: startOfDay(d),
                label: d.getFullYear() + '-' + datePad2(d.getMonth() + 1),
                shortLabel: (d.getFullYear() % 100) + '/' + datePad2(d.getMonth() + 1)
            });
        }
    } else {
        for (i = 4; i >= 0; i--) {
            d = new Date(asOf.getFullYear() - i, 0, 1);
            points.push({
                date: startOfDay(d),
                label: String(d.getFullYear()),
                shortLabel: String(d.getFullYear())
            });
        }
    }
    return points;
}

function dataHubMonthSeason(monthIndex) {
    /* 0=Jan … 화장품·패션 시즌성 */
    var season = [0.82, 0.88, 0.98, 1.02, 1.08, 1.12, 1.18, 1.05, 0.94, 1.0, 1.14, 1.22];
    return season[monthIndex] || 1;
}

function dataHubWeekdayLift(day) {
    /* 0=Sun … 주말·금요일 상승 */
    var lift = [1.12, 0.92, 0.95, 0.98, 1.0, 1.08, 1.22];
    return lift[day] || 1;
}

function dataHubHashNoise(seed) {
    var x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
}

function generateDataHubRows(period, channel) {
    var asOf = getDataHubAsOfDate();
    var points = buildDataHubPeriodPoints(period, asOf);
    var w = channel === 'all' ? 1 : getDataHubWeight(channel);
    var s = typeof getSettings === 'function' ? getSettings() : null;
    var monthlyTarget = (s && s.kpi && s.kpi.currentMonthlyRevenue) || 637500000;
    var dailyBase = monthlyTarget / 30;
    var chName = channel === 'all'
        ? '통합'
        : ((App.dataHubChannels.find(function(c) { return c.id === channel; }) || {}).name || channel);

    var daySpan = { daily: 1, weekly: 7, monthly: 30, yearly: 365 }[period] || 1;
    var trendCagr = period === 'yearly' ? 0.22 : (period === 'monthly' ? 0.18 : 0.12);
    var rows = [];
    var prevRevenue = null;
    var prevYearProxy = null;

    points.forEach(function(pt, idx) {
        var progress = points.length > 1 ? idx / (points.length - 1) : 1;
        var trend = 1 + trendCagr * (progress - 0.35);
        var season = dataHubMonthSeason(pt.date.getMonth());
        var dow = period === 'daily' ? dataHubWeekdayLift(pt.date.getDay()) : 1;
        var noise = 0.93 + dataHubHashNoise(idx * 17 + channel.length * 31 + pt.date.getMonth() * 7) * 0.14;

        /* 프로모션·시즌 피크 의사 스파이크 */
        var spike = 1;
        if (period === 'daily') {
            var day = pt.date.getDate();
            if (day === 1 || day === 11 || day === 21) spike = 1.18;
            if (pt.date.getDay() === 6 && day >= 14 && day <= 21) spike = 1.28;
        } else if (period === 'weekly' && (idx === points.length - 3 || idx === points.length - 5)) {
            spike = 1.15;
        } else if (period === 'monthly' && (pt.date.getMonth() === 6 || pt.date.getMonth() === 11)) {
            spike = 1.12;
        } else if (period === 'yearly' && pt.date.getFullYear() === asOf.getFullYear() - 1) {
            spike = 1.06;
        }

        var revenue = Math.round(dailyBase * daySpan * w * trend * season * dow * noise * spike);
        revenue = Math.max(Math.round(dailyBase * daySpan * w * 0.45), revenue);

        var aovBase = 42000 + Math.round(dataHubHashNoise(idx * 9 + 3) * 9000);
        if (period === 'yearly') aovBase = Math.round(aovBase * (1 + 0.04 * progress));
        var orders = Math.max(1, Math.round(revenue / aovBase));
        var aov = Math.round(revenue / orders);
        var margin = parseFloat((26.5 + season * 4 + dataHubHashNoise(idx * 5) * 3.5 - (dow > 1.1 ? 0.8 : 0)).toFixed(1));
        var newCustomers = Math.max(1, Math.round(orders * (0.18 + dataHubHashNoise(idx * 11) * 0.1)));
        var returnRate = parseFloat((1.2 + (period === 'daily' && pt.date.getDay() === 0 ? 0.6 : 0) + dataHubHashNoise(idx * 13) * 1.4).toFixed(1));

        var growth = 0;
        if (prevRevenue != null && prevRevenue > 0) {
            growth = parseFloat((((revenue - prevRevenue) / prevRevenue) * 100).toFixed(1));
        }

        var mom = growth;
        if (period === 'daily' || period === 'weekly') {
            /* 동일 구간 길이의 “한 달 전” 대비 근사 */
            var lookback = period === 'daily' ? 30 : 4;
            var ref = rows[idx - lookback];
            if (ref && ref.revenue > 0) {
                mom = parseFloat((((revenue - ref.revenue) / ref.revenue) * 100).toFixed(1));
            } else {
                mom = parseFloat((growth * 0.6 + (dataHubHashNoise(idx) - 0.45) * 8).toFixed(1));
            }
        }

        var yoy = parseFloat((8 + trendCagr * 40 * progress + (dataHubHashNoise(idx * 19) - 0.5) * 10).toFixed(1));
        if (period === 'yearly' && prevRevenue != null && prevRevenue > 0) {
            yoy = growth;
        } else if (period === 'monthly' && rows.length >= 1) {
            /* 단순 YoY: 시즌 대비 성장률 */
            yoy = parseFloat(((trend - 1) * 100 + (dataHubHashNoise(idx * 23) - 0.4) * 6).toFixed(1));
        } else if (prevYearProxy != null && prevYearProxy > 0 && (period === 'daily' || period === 'weekly')) {
            yoy = parseFloat((((revenue - prevYearProxy) / prevYearProxy) * 100).toFixed(1));
        }

        rows.push({
            period: pt.label,
            periodShort: pt.shortLabel,
            channel: chName,
            revenue: revenue,
            orders: orders,
            aov: aov,
            margin: margin,
            newCustomers: newCustomers,
            returnRate: returnRate,
            growth: growth,
            mom: mom,
            yoy: yoy
        });

        prevRevenue = revenue;
        prevYearProxy = Math.round(revenue / (1.12 + progress * 0.08));
    });

    return rows;
}

function getDataHubSummary(rows) {
    var totalRev = rows.reduce(function(s, r) { return s + r.revenue; }, 0);
    var totalOrders = rows.reduce(function(s, r) { return s + r.orders; }, 0);
    var avgMargin = rows.length ? rows.reduce(function(s, r) { return s + r.margin; }, 0) / rows.length : 0;
    var totalNew = rows.reduce(function(s, r) { return s + r.newCustomers; }, 0);
    var avgReturn = rows.length ? rows.reduce(function(s, r) { return s + r.returnRate; }, 0) / rows.length : 0;
    var lastGrowth = rows.length ? rows[rows.length - 1].growth : 0;

    /* 직전 구간 대비: 최근 절반 vs 이전 절반 (rows 끝 = 최신, 과거→현재 순) */
    var mid = Math.max(1, Math.ceil(rows.length / 2));
    var recent = rows.slice(-mid);
    var older = rows.slice(0, Math.max(0, rows.length - mid));
    if (!older.length && rows.length >= 2) {
        recent = [rows[rows.length - 1]];
        older = [rows[rows.length - 2]];
    }
    function avg(arr, key) {
        if (!arr.length) return 0;
        return arr.reduce(function(s, r) { return s + (Number(r[key]) || 0); }, 0) / arr.length;
    }
    function sum(arr, key) {
        return arr.reduce(function(s, r) { return s + (Number(r[key]) || 0); }, 0);
    }
    var cmp = older.length ? {
        revenue: sum(recent, 'revenue'),
        revenuePrev: sum(older, 'revenue'),
        orders: sum(recent, 'orders'),
        ordersPrev: sum(older, 'orders'),
        aov: avg(recent, 'aov'),
        aovPrev: avg(older, 'aov'),
        margin: avg(recent, 'margin'),
        marginPrev: avg(older, 'margin'),
        newCustomers: sum(recent, 'newCustomers'),
        newCustomersPrev: sum(older, 'newCustomers'),
        returnRate: avg(recent, 'returnRate'),
        returnRatePrev: avg(older, 'returnRate')
    } : null;

    return {
        revenue: totalRev,
        orders: totalOrders,
        aov: totalOrders ? Math.round(totalRev / totalOrders) : 0,
        margin: avgMargin.toFixed(1),
        newCustomers: totalNew,
        returnRate: avgReturn.toFixed(1),
        growth: lastGrowth,
        cmp: cmp,
        compareLabel: older.length ? '직전구간 대비' : ''
    };
}

function formatDataHubWon(n) {
    n = Number(n) || 0;
    var abs = Math.abs(n);
    var sign = n < 0 ? '-' : '';
    if (abs >= 100000000) return sign + '₩ ' + (abs / 100000000).toFixed(1) + '억';
    if (abs >= 10000) return sign + '₩ ' + (abs / 10000).toFixed(0) + '만';
    return App.formatWon(n);
}

/** 약식 증감: ▲12% · ▼0.3p · ▲820만 */
function formatDataHubDeltaSmart(curr, prev, kind) {
    if (prev == null || curr == null || !isFinite(prev) || !isFinite(curr)) {
        return { text: '—', cls: 'text-gray-500', title: '' };
    }
    var diff = curr - prev;
    var up = diff >= 0;
    var arrow = up ? '▲' : '▼';
    var cls = up ? 'text-success' : 'text-danger';
    if (kind === 'invert') cls = up ? 'text-danger' : 'text-success';
    var absDiff = Math.abs(diff);
    var pct = prev !== 0 ? (diff / Math.abs(prev)) * 100 : 0;
    var text;
    if (kind === 'pp') {
        text = arrow + absDiff.toFixed(1) + 'p';
    } else if (Math.abs(pct) >= 0.8 || kind === 'pct') {
        text = arrow + (Math.abs(pct) >= 10 ? Math.abs(pct).toFixed(0) : Math.abs(pct).toFixed(1)) + '%';
    } else if (kind === 'won') {
        if (absDiff >= 100000000) text = arrow + (absDiff / 100000000).toFixed(1) + '억';
        else if (absDiff >= 10000) text = arrow + Math.round(absDiff / 10000) + '만';
        else text = arrow + Math.round(absDiff).toLocaleString('ko-KR');
    } else if (kind === 'count') {
        if (absDiff >= 1000) text = arrow + (absDiff / 1000).toFixed(1) + '천';
        else text = arrow + Math.round(absDiff).toLocaleString('ko-KR');
    } else {
        text = arrow + (Math.abs(pct) >= 10 ? Math.abs(pct).toFixed(0) : Math.abs(pct).toFixed(1)) + '%';
    }
    return { text: text, cls: cls, title: 'Δ ' + (diff >= 0 ? '+' : '') + (kind === 'won' ? formatDataHubWon(diff) : diff.toFixed(2)) };
}

function renderDataHubKpis(summary) {
    var el = document.getElementById('datahub-kpis');
    if (!el) return;
    var periodNames = { daily: '일간', weekly: '주간', monthly: '월간', yearly: '연간' };
    var cmp = summary.cmp;
    var deltas = cmp ? {
        revenue: formatDataHubDeltaSmart(cmp.revenue, cmp.revenuePrev, 'won'),
        orders: formatDataHubDeltaSmart(cmp.orders, cmp.ordersPrev, 'count'),
        aov: formatDataHubDeltaSmart(cmp.aov, cmp.aovPrev, 'won'),
        margin: formatDataHubDeltaSmart(cmp.margin, cmp.marginPrev, 'pp'),
        newCustomers: formatDataHubDeltaSmart(cmp.newCustomers, cmp.newCustomersPrev, 'count'),
        returnRate: formatDataHubDeltaSmart(cmp.returnRate, cmp.returnRatePrev, 'invert')
    } : null;
    var foot = summary.compareLabel || (periodNames[dataHubFilter.period] + ' 합계');
    var kpis = [
        { label: '누적 매출', value: formatDataHubWon(summary.revenue), d: deltas && deltas.revenue },
        { label: '총 주문', value: summary.orders.toLocaleString() + '건', d: deltas && deltas.orders },
        { label: '평균 객단가', value: App.formatWon(summary.aov), d: deltas && deltas.aov },
        { label: '평균 마진율', value: summary.margin + '%', d: deltas && deltas.margin },
        { label: '신규 고객', value: summary.newCustomers.toLocaleString() + '명', d: deltas && deltas.newCustomers },
        { label: '반품률', value: summary.returnRate + '%', d: deltas && deltas.returnRate }
    ];
    el.innerHTML = kpis.map(function (k) {
        var deltaHtml = k.d
            ? '<span class="datahub-kpi-delta ' + k.d.cls + '" title="' + (k.d.title || '') + '">' + k.d.text + '</span>'
            : '';
        return '<div class="glass rounded-xl p-4 datahub-kpi-card">' +
            '<p class="text-[10px] text-gray-500 mb-1">' + k.label + '</p>' +
            '<div class="flex items-baseline gap-1.5 flex-wrap">' +
            '<p class="text-lg font-extrabold leading-none">' + k.value + '</p>' + deltaHtml +
            '</div>' +
            '<p class="text-[10px] text-gray-600 mt-1">' + foot + '</p></div>';
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

var DATAHUB_CHANNEL_COLORS = [
    '#3b82f6', '#10b981', '#f97316', '#ec4899',
    '#a78bfa', '#14b8a6', '#f59e0b', '#ef4444',
    '#60a5fa', '#84cc16', '#e879f9', '#fb7185'
];
var DATAHUB_CHANNEL_COLORS_RGBA = [
    'rgba(59,130,246,0.85)', 'rgba(16,185,129,0.85)', 'rgba(249,115,22,0.85)', 'rgba(236,72,153,0.85)',
    'rgba(167,139,250,0.85)', 'rgba(20,184,166,0.85)', 'rgba(245,158,11,0.85)', 'rgba(239,68,68,0.85)',
    'rgba(96,165,250,0.85)', 'rgba(132,204,22,0.85)', 'rgba(232,121,249,0.85)', 'rgba(251,113,133,0.85)'
];

function getDataHubShareChannels() {
    return (App.dataHubChannels || [])
        .filter(function (c) { return c.id !== 'all'; })
        .slice(0, 12);
}

function renderDataHubChannelLegend() {
    var el = document.getElementById('datahub-channel-legend');
    if (!el) return;
    var channels = getDataHubShareChannels();
    var totalW = channels.reduce(function (s, c) { return s + (Number(c.weight) || 0); }, 0) || 1;
    el.innerHTML = channels.map(function (c, i) {
        var pct = ((Number(c.weight) || 0) / totalW * 100).toFixed(0);
        var color = DATAHUB_CHANNEL_COLORS[i % DATAHUB_CHANNEL_COLORS.length];
        return '<div class="datahub-channel-legend-item" title="' + c.name + ' ' + pct + '%">' +
            '<span class="dot" style="background:' + color + '"></span>' +
            '<span class="name">' + c.name + '</span>' +
            '<span class="pct">' + pct + '%</span></div>';
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
    var unitEl = document.getElementById('datahub-chart-unit');
    if (unitEl) unitEl.textContent = '만원';
    if (descEl) descEl.textContent = App.globalDateRange.label + ' · ' + periodNames[dataHubFilter.period] + ' · ' + (dataHubFilter.channel === 'all' ? '전 채널' : App.dataHubChannels.find(function(c) { return c.id === dataHubFilter.channel; }).name) + ' 누적 스냅샷 (과거→현재)';
    dgRefresh();
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
    var guard = checkExportGuard(format, rows.length, {
        rawDump: false
    });
    if (!guard.ok) {
        showToast(guard.message, 'warning');
        addActivityLog({
            userId: App.currentUserId,
            action: 'Export 차단',
            category: 'report',
            type: 'warning',
            detail: guard.code + ' · ' + (labels[format] || format),
            meta: '보호 규칙'
        });
        return;
    }
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
        recordExportEvent(format, rows.length);
        showToast(labels[format] + ' 파일을 다운로드했습니다. (' + rows.length + '건 · 집계)', 'success');
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
            recordExportEvent('pdf', rows.length);
            showToast('PDF 리포트를 다운로드했습니다. (데모)', 'success');
        }).catch(function() {
            showToast('PDF 생성에 실패했습니다.', 'warning');
        });
    }
}

/** 데모용: 대용량 원시 덤프 차단 알럿 확인 */
function demoBlockRawExport() {
    var guard = checkExportGuard('csv', 0, {
        rawDump: true,
        estimatedRawRows: (App.dataHubMeta && App.dataHubMeta.totalRows) || 1247832
    });
    showToast(guard.message || '원시 덤프는 차단됩니다.', 'warning');
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

    var navSource = (typeof getNavGroupsForTier === 'function') ? getNavGroupsForTier() : App.navGroups;
    navSource.forEach(function(group) {
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
function toggleNotifications() {
    closePipelinePanel();
    document.getElementById('notif-panel').classList.toggle('hidden');
}
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
        var dhLabels = dataHubRowsCache.map(function(r) { return r.periodShort || r.period; });
        var tickLimit = dataHubFilter.period === 'daily' ? 10
            : (dataHubFilter.period === 'weekly' ? 8
            : (dataHubFilter.period === 'monthly' ? 12 : 5));
        App.charts.push(new Chart(dhTrend, {
            type: 'line',
            data: {
                labels: dhLabels,
                datasets: [
                    {
                        label: '매출',
                        data: dataHubRowsCache.map(function(r) { return Math.round(r.revenue / 10000); }),
                        borderColor: 'rgba(59,130,246,0.9)',
                        backgroundColor: 'rgba(59,130,246,0.12)',
                        borderWidth: 2,
                        pointRadius: dataHubFilter.period === 'daily' ? 2 : 3,
                        pointHoverRadius: 4,
                        tension: 0.28,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: '주문',
                        data: dataHubRowsCache.map(function(r) { return r.orders; }),
                        borderColor: 'rgba(16,185,129,0.9)',
                        borderWidth: 2,
                        pointRadius: dataHubFilter.period === 'daily' ? 1.5 : 2,
                        tension: 0.28,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { display: false } },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: tickLimit,
                            font: { size: 10 },
                            color: '#9ca3af'
                        }
                    },
                    y: {
                        position: 'left',
                        title: { display: true, text: '만원', font: { size: 10 }, color: '#9ca3af' },
                        ticks: { font: { size: 10 }, color: '#9ca3af' },
                        grid: { color: 'rgba(55,65,81,0.35)' }
                    },
                    y1: {
                        position: 'right',
                        grid: { drawOnChartArea: false },
                        title: { display: true, text: '건', font: { size: 10 }, color: '#9ca3af' },
                        ticks: { font: { size: 10 }, color: '#9ca3af' }
                    }
                }
            }
        }));
    }

    var dhChannel = document.getElementById('dataHubChannelChart');
    if (dhChannel) {
        var chData = getDataHubShareChannels();
        var latestRev = dataHubRowsCache.length
            ? dataHubRowsCache[dataHubRowsCache.length - 1].revenue
            : 28450000;
        var totalW = chData.reduce(function(s, c) { return s + (Number(c.weight) || 0); }, 0) || 1;
        App.charts.push(new Chart(dhChannel, {
            type: 'doughnut',
            data: {
                labels: chData.map(function(c) { return c.name; }),
                datasets: [{
                    data: chData.map(function(c) {
                        return Math.round(latestRev * ((Number(c.weight) || 0) / totalW) / 10000);
                    }),
                    backgroundColor: chData.map(function(_, i) {
                        return DATAHUB_CHANNEL_COLORS_RGBA[i % DATAHUB_CHANNEL_COLORS_RGBA.length];
                    }),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '58%',
                plugins: { legend: { display: false } },
                layout: { padding: 2 }
            }
        }));
    }
}
function switchView(targetId) {
    if (typeof isViewAllowedForTier === 'function' && !isViewAllowedForTier(targetId)) {
        showToast('Standard 플랜에서는 제공되지 않는 기능입니다.', 'warning');
        return;
    }
    App.currentView = targetId;
    var renderer = App.views[targetId];
    if (!renderer) return;
    document.getElementById('main-content').innerHTML = renderer();
    if (targetId === 'view-orders') {
        renderOrders(App.orders);
        applyPendingDrillDown();
    }
    if (targetId === 'view-inventory') {
        if (typeof initInventoryView === 'function') initInventoryView();
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
    if (typeof DashboardGuide !== 'undefined') DashboardGuide.onViewChange(targetId);
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
            closePromoPlanModal();
            if (typeof DashboardGuide !== 'undefined') DashboardGuide.close();
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
function applyTenantChrome(tenant) {
    if (!tenant) return;
    if (tenant.companyName) App.brandName = tenant.companyName;
    var nameEl = document.getElementById('sidebar-company-name');
    if (nameEl) nameEl.textContent = tenant.companyName;
    var roleEl = document.getElementById('sidebar-user-role');
    if (roleEl) roleEl.textContent = tenant.companyName + ' · 대표';
    var existing = document.getElementById('tenant-build-banner');
    if (existing) existing.remove();
    var main = document.getElementById('main-content') || document.querySelector('main');
    if (!main) return;
    var bar = document.createElement('div');
    bar.id = 'tenant-build-banner';
    bar.className = 'mx-4 mt-3 mb-0 px-4 py-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-100/90 flex flex-wrap gap-x-3 gap-y-1 items-center';
    var ch = (tenant.channels || []).length;
    bar.innerHTML = '<span class="font-bold text-emerald-300">구축 초안</span>' +
        '<span>' + (tenant.companyName || '') + '</span>' +
        '<span class="text-emerald-200/70">서비스 ' + tenant.serviceTier + (tenant.specialPricing ? ' · 청구 ' + tenant.billingPlan + '(특가)' : '') + '</span>' +
        '<span class="text-emerald-200/70">채널 ' + ch + ' · 좌석 ' + tenant.seats + ' · 알림톡 ' + tenant.briefingRecipients + '</span>' +
        '<span class="text-emerald-200/70">WMS ' + (tenant.wms === 'sabangnet' ? '사방넷(읽기)' : '없음') + '</span>' +
        '<span class="text-emerald-200/70">Drive ' + (tenant.driveEnabled && (tenant.driveFolderUrl || tenant.driveFolderId) ? '연결' : tenant.driveEnabled ? '대기' : 'off') + '</span>' +
        (tenant.custom ? '<span class="text-emerald-200/70">커스텀 ' + (typeof countCustomCompleteness === 'function' ? countCustomCompleteness(tenant.custom).pct + '%' : 'on') + '</span>' : '') +
        (tenant.custom && tenant.custom.biz && tenant.custom.biz.phase1Modules
            ? '<span class="text-amber-200/80">Phase1 ' + tenant.custom.biz.phase1Modules.length + '모듈</span>'
            : '') +
        (tenant.commercial && tenant.commercial.aopEnabled
            ? '<span class="text-amber-200/80">AOP ' + tenant.commercial.prepaidTerm + 'm</span>'
            : '') +
        (tenant.id === 'test0719'
            ? '<a class="ml-auto font-bold text-sky-300 hover:text-sky-200" href="channel-connect.html?tenant=test0719">채널 API 연동센터 →</a>'
            : '');
    main.insertBefore(bar, main.firstChild);
}

document.addEventListener('DOMContentLoaded', function() {
    var start = function () {
        if (typeof OmnifyDemoMock !== 'undefined' && OmnifyDemoMock.applyToApp) {
            OmnifyDemoMock.applyToApp(App);
            if (OmnifyDemoMock.patchDefaultFns) OmnifyDemoMock.patchDefaultFns();
        }
        if (typeof OmnifySchema !== 'undefined' && OmnifySchema.hydrateAppDemo) {
            OmnifySchema.hydrateAppDemo(App);
        }
        var tenantBoot = window.__OMNIFY_TENANT__ || (typeof resolveTenantFromQuery === 'function' ? resolveTenantFromQuery() : null);
        if (tenantBoot && typeof applyTenantToDashboardApp === 'function') {
            applyTenantToDashboardApp(tenantBoot);
        }
        loadTeamMembers();
        if (typeof applyTenantCustomAfterLoad === 'function') applyTenantCustomAfterLoad();
        if (typeof initDashboardTier === 'function') initDashboardTier();
        if (App.tenantMeta) applyTenantChrome(App.tenantMeta);
        App.demoLastRefresh = new Date();
        loadGlobalDateRange();
        loadNotificationReadState();
        loadCurrentUser();
        loadBriefingConfig();
        if (App.tierAtLeast && App.tierAtLeast('growth')) loadPromoPlans();
        loadArchive();
        if (App.tierAtLeast && App.tierAtLeast('enterprise')) {
            loadComms();
        }
        loadSettings();
        applyAppearanceSettings();
        if (typeof applyTenantCustomAfterLoad === 'function') applyTenantCustomAfterLoad();
        initDateRangePicker();
        updateCurrentUserUI();
        renderNotifications();
        initNavigation();
        initClock();
        initKeyboard();
    refreshDemoUI();
    if (typeof DashboardGuide !== 'undefined') DashboardGuide.init();
    switchView('view-dashboard');
    updateBreadcrumb('통합 대시보드', null);
    var homeBtn = document.querySelector('[data-target="view-dashboard"]');
    if (homeBtn) homeBtn.classList.add('active');
    document.addEventListener('click', function(e) {
        var p = document.getElementById('notif-panel'), b = document.getElementById('notif-btn');
        if (p && !p.contains(e.target) && b && !b.contains(e.target)) p.classList.add('hidden');
        var pipe = document.getElementById('pipeline-panel');
        var pipeBtn = document.getElementById('pipeline-btn');
        if (pipe && pipe.classList.contains('open') && !pipe.contains(e.target) && pipeBtn && !pipeBtn.contains(e.target)) {
            closePipelinePanel();
        }
        var dr = document.getElementById('date-range-wrap');
        if (dr && !dr.contains(e.target)) {
            var dm = document.getElementById('date-range-menu');
            if (dm) dm.classList.remove('open');
        }
        var us = document.getElementById('user-switch-menu');
        if (us && !e.target.closest('.p-4.border-t')) us.classList.remove('open');
    });
    if (typeof refreshPipelinePanel === 'function') refreshPipelinePanel();
    var promoCalResizeTimer;
    window.addEventListener('resize', function() {
        if (crmActiveTab !== 'calendar' || !document.getElementById('promo-calendar-grid')) return;
        clearTimeout(promoCalResizeTimer);
        promoCalResizeTimer = setTimeout(renderPromoCalendar, 150);
    });
    };

    var boot = window.__OMNIFY_BOOT__;
    if (boot && typeof boot.then === 'function') {
        boot.then(start).catch(start);
    } else {
        start();
    }
});
