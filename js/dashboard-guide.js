/* Omnify Demo Dashboard — 사용가이드 · 카드 툴팁 */
var DashboardGuide = (function () {
    var tooltipEl = null;
    var tooltipHideTimer = null;
    var activeView = 'view-dashboard';
    var modalFilterView = '';

    var GUIDES = {
        'menu-dashboard': {
            view: 'view-dashboard', menu: '홈 · 통합 대시보드', title: '통합 대시보드',
            summary: '옴니채널 핵심 KPI·차트·경보를 한 화면에서 확인하는 홈입니다.',
            keywords: ['홈', '대시보드', 'KPI', '매출', '요약', '통합'],
            faq: [
                { q: '이 화면에서 무엇을 확인할 수 있나요?', a: '금일 매출·마진율·AI 예상 마감·미처리 액션, 채널별 매출 차트, 위험 재고, API 상태, 주문 파이프라인, CRM 요약을 한눈에 볼 수 있습니다.' },
                { q: 'KPI 카드를 클릭하면 어떻게 되나요?', a: '각 KPI는 관련 상세 화면(데이터 DB, 수익성 분석, 주문 등)으로 드릴다운됩니다. 카드에 마우스를 올리면 툴팁으로 기능 설명이 표시됩니다.' },
                { q: '데모 데이터인가요?', a: '네. 이 페이지는 체험용 목업 데이터입니다. 실제 도입 시 연동 채널 API에서 실시간으로 수집됩니다.' }
            ]
        },
        'dash-briefing': {
            view: 'view-dashboard', menu: '통합 대시보드', title: '아침 브리핑 배너',
            summary: '매일 08:30 카카오톡으로 발송된 데일리 브리핑 요약입니다.',
            keywords: ['브리핑', '카카오', '아침', '알림', '08:30'],
            faq: [
                { q: '브리핑에는 어떤 내용이 들어가나요?', a: '전일 마진율, 위험 재고 건수, 미처리 발주 등 운영자가 아침에 꼭 확인할 지표를 요약해 전달합니다.' },
                { q: '설정은 어디서 하나요?', a: '좌측 메뉴 「데일리 브리핑」에서 발송 항목·수신자·시간을 설정할 수 있습니다.' }
            ]
        },
        'dash-kpi-revenue': {
            view: 'view-dashboard', menu: '통합 대시보드', title: '옴니채널 통합 매출 KPI',
            summary: '선택한 기간 기준 전 채널 합산 매출입니다.',
            keywords: ['매출', '통합매출', '금일', 'KPI', '채널'],
            faq: [
                { q: '클릭하면 어디로 이동하나요?', a: '「누적 데이터 DB」 화면으로 이동해 채널·기간별 상세 매출을 조회할 수 있습니다.' },
                { q: '기간은 어떻게 바꾸나요?', a: '상단 헤더의 날짜 범위 버튼(최근 7일 등)에서 변경하면 KPI와 차트가 함께 갱신됩니다.' }
            ]
        },
        'dash-kpi-margin': {
            view: 'view-dashboard', menu: '통합 대시보드', title: '통합 실시간 마진율',
            summary: '채널 수수료·원가·광고비를 반영한 실마진율입니다.',
            keywords: ['마진', '마진율', '수익', '실마진'],
            faq: [
                { q: '마진율은 어떻게 계산되나요?', a: '채널별 매출에서 플랫폼 수수료, 원가, 배송·광고 비용을 차감해 산출합니다. 「AI 수익성 분석」에서 채널별 상세를 볼 수 있습니다.' },
                { q: '목표 마진은 어디서 설정하나요?', a: '「설정」 메뉴의 KPI 탭에서 목표 마진율을 지정하면 대시보드와 알림에 반영됩니다.' }
            ]
        },
        'dash-kpi-target': {
            view: 'view-dashboard', menu: '통합 대시보드', title: 'AI 예상 마감 매출',
            summary: '이번 달 누적 매출과 AI 예측을 바탕으로 한 월말 예상치입니다.',
            keywords: ['예상', '마감', '목표', 'AI', '월간'],
            faq: [
                { q: '달성률 바는 무엇을 의미하나요?', a: '설정된 월 매출 목표 대비 현재 누적·예상 달성 비율입니다.' },
                { q: '예측 모델은 무엇을 참고하나요?', a: '최근 주문 추세, 요일 패턴, 프로모션 일정 등을 반영한 데모 예측값입니다. 실제 도입 시 고객 데이터로 학습·조정됩니다.' }
            ]
        },
        'dash-kpi-actions': {
            view: 'view-dashboard', menu: '통합 대시보드', title: '미처리 액션',
            summary: '발주 대기·긴급 처리가 필요한 업무 건수입니다.',
            keywords: ['미처리', '발주', '대기', '긴급', '액션'],
            faq: [
                { q: '어떤 항목이 포함되나요?', a: '송장 미전송, 발주 승인 대기, 재고 부족으로 인한 출고 지연 등 운영자가 처리해야 할 작업입니다.' },
                { q: '클릭 시 동작은?', a: '「주문 · 발주」 화면으로 이동하며 미처리 필터가 적용됩니다.' }
            ]
        },
        'dash-chart': {
            view: 'view-dashboard', menu: '통합 대시보드', title: '채널별 매출 & ROAS 차트',
            summary: '주간/월간 채널 매출 막대와 ROAS 추이를 비교합니다.',
            keywords: ['차트', 'ROAS', '채널', '주간', '월간', '그래프'],
            faq: [
                { q: '주간/월간 전환은?', a: '차트 우측 상단 탭으로 기간 단위를 바꿀 수 있습니다.' },
                { q: 'ROAS는 무엇인가요?', a: '광고비 대비 매출 비율(Return on Ad Spend)입니다. 보라색 라인으로 표시됩니다.' }
            ]
        },
        'dash-inventory-alert': {
            view: 'view-dashboard', menu: '통합 대시보드', title: '위험 재고 경보',
            summary: '안전재고 이하 SKU를 우선 표시합니다.',
            keywords: ['재고', '품절', '안전재고', '경보', 'SKU'],
            faq: [
                { q: 'critical과 warning 차이는?', a: 'critical은 즉시 발주가 필요한 수준, warning은 곧 안전재고 아래로 떨어질 예정인 SKU입니다.' },
                { q: '상세 재고는?', a: '카드 클릭 또는 「통합 재고」 메뉴에서 채널별 재고를 확인·조정할 수 있습니다.' }
            ]
        },
        'dash-api-status': {
            view: 'view-dashboard', menu: '통합 대시보드', title: '채널 API 상태',
            summary: '각 쇼핑몰 API 연결·동기화·토큰 만료 현황입니다.',
            keywords: ['API', '연동', '토큰', '동기화', 'Cafe24', '쿠팡'],
            faq: [
                { q: 'warn 상태는 무엇인가요?', a: '토큰 만료가 임박했거나 최근 동기화 지연이 있는 채널입니다. 「API 연동 상태」에서 상세 확인·갱신할 수 있습니다.' }
            ]
        },
        'dash-pipeline': {
            view: 'view-dashboard', menu: '통합 대시보드', title: '주문 처리 파이프라인',
            summary: '수집→대기→처리→발송 단계별 주문 흐름입니다.',
            keywords: ['주문', '파이프라인', '발송', '처리', '수집'],
            faq: [
                { q: '수동 동기화는?', a: '상단 「검색」 팔레트(Ctrl+K)에서 「수동 데이터 동기화」를 실행하거나 주문 화면의 동기화 버튼을 사용합니다.' }
            ]
        },
        'menu-datahub': {
            view: 'view-datahub', menu: '누적 데이터 DB', title: '누적 데이터 DB',
            summary: '채널·기간별 원시·집계 데이터를 테이블로 조회·정렬·보냅니다.',
            keywords: ['DB', '데이터', '테이블', '엑셀', 'CSV', '누적'],
            faq: [
                { q: '어떤 데이터가 쌓이나요?', a: '주문, 정산, 재고 스냅샷, 광고 성과 등 API·배치로 수집된 레코드입니다.' },
                { q: '정렬·검색은?', a: '컬럼 헤더 클릭으로 정렬, 상단 검색창으로 SKU·주문번호 등을 필터링할 수 있습니다.' },
                { q: '보내기는?', a: 'Excel/PDF 버튼으로 현재 필터 결과를 다운로드할 수 있습니다(데모에서는 안내만 표시).' }
            ]
        },
        'menu-briefing': {
            view: 'view-briefing', menu: '데일리 브리핑', title: '데일리 브리핑',
            summary: '매일 08:30 카카오 알림톡(1인 1통). 수신 한도: 스타터 1 · 그로스 3 · 엔터 5명.',
            keywords: ['브리핑', '카카오톡', '알림톡', '아침', '리포트', '발송', '수신'],
            faq: [
                { q: '발송 항목을 고를 수 있나요?', a: '매출, 마진, 재고 경보, ROAS 등 포함할 지표를 체크박스로 선택합니다.' },
                { q: '미리보기는?', a: '설정 변경 시 우측 패널에서 실제 발송 메시지 형태를 확인할 수 있습니다.' },
                { q: '수신자는?', a: '플랜별 기본 한도: 스타터 1 · 그로스 3 · 엔터 5명(매일·1인 1통). 추가는 별도 문의. 수신자는 작업 좌석·뷰어에 포함되지 않습니다.' }
            ]
        },
        'menu-orders': {
            view: 'view-orders', menu: '주문 · 발주', title: '주문 · 발주 현황',
            summary: '채널 주문 상태를 모아 조회합니다. 발주·출고 확정은 사방넷 또는 채널 어드민에서 처리합니다.',
            keywords: ['주문', '발주', '현황', '동기화', '미처리', '봉쇄', '사방넷'],
            faq: [
                { q: '여기서 발주·출고를 끝내나요?', a: '아니요. Omnify는 상태 미러·경보·동기화만 합니다. 「원천에서 처리」는 사방넷/채널 안내이며 원천에 쓰지 않습니다.' },
                { q: '상태 필터는?', a: '대기·처리중·출고완료 등 수집된 상태를 필터링합니다.' },
                { q: '채널 색상 pill은?', a: 'C24(Cafe24), N(스마트스토어), CP(쿠팡), AB(에이블리) 등 채널을 구분합니다.' }
            ]
        },
        'menu-inventory': {
            view: 'view-inventory', menu: '통합 재고', title: '통합 재고 (조회)',
            summary: '사방넷 실재고(표준 읽기)와 Cafe24 등 채널 재고를 조회합니다. 이지어드민·셀메이트는 연동하지 않습니다.',
            keywords: ['재고', '조회', 'SKU', '안전재고', '사방넷', '채널', '봉쇄'],
            faq: [
                { q: 'Omnify가 WMS인가요?', a: '아닙니다. Omnify는 재고 Source of Truth가 아닙니다. 사방넷 실재고와 채널 노출 재고를 미러링해 보여 줍니다.' },
                { q: '이지·셀메이트는?', a: '제품 연동 대상에서 제외했습니다. WMS 연동은 사방넷만입니다.' },
                { q: '재고 수량을 여기서 고칠 수 있나요?', a: '표준은 없습니다. Enterprise는 사방넷 범위에서만 협의·견적 후 제한 커스텀을 검토할 수 있으며, 데모에는 열어 두지 않습니다.' },
                { q: '안전재고는?', a: 'Omnify 설정에 두는 「경보 기준」입니다. 사방넷 실재고와 별개이며, 알림·브리핑에만 쓰입니다.' }
            ]
        },
        'menu-comms': {
            view: 'view-comms', menu: '커뮤니케이션', title: '커뮤니케이션',
            summary: '팀 내 스레드·@멘션·업무 요청·아젠다를 관리합니다.',
            keywords: ['커뮤니케이션', '팀', '멘션', '업무요청', '스레드'],
            faq: [
                { q: '업무 요청과 일반 메시지 차이는?', a: '업무 요청은 담당자·마감·우선순위가 지정되며 완료 처리가 가능합니다.' },
                { q: '알림 배지는?', a: '미확인 스레드·멘션 수가 사이드바와 헤더에 표시됩니다.' }
            ]
        },
        'menu-crm': {
            view: 'view-crm', menu: '프로모션 기획 · 성과', title: '프로모션 기획 · 성과',
            summary: '프로모션 캘린더·목표 KPI·외부 실행 후 실적을 기록합니다. 발송은 외부 도구에서 진행합니다.',
            keywords: ['프로모션', '캘린더', 'KPI', '기획', '성과', 'A/B'],
            faq: [
                { q: '탭 구성은?', a: '「프로모션 캘린더」에서 일정을 등록·조회하고, 「기획 · KPI」에서 목표 대비 실적을 입력합니다.' },
                { q: '알림톡 발송은 여기서 하나요?', a: '아니요. 실행은 솔라피·카카오 비즈메시지 등 외부 도구에서 하고, 결과만 Omnify에 기록합니다.' },
                { q: '새 프로모션 등록은?', a: '「+ 프로모션」 또는 캘린더 「+ 일정 등록」으로 기간·채널·목표 KPI·실행 도구를 입력합니다.' }
            ]
        },
        'menu-profit': {
            view: 'view-profit', menu: 'AI 수익성 분석', title: 'AI 수익성 분석',
            summary: '채널·상품별 마진, ROAS, MoM/YoY를 AI 인사이트와 함께 분석합니다.',
            keywords: ['수익성', 'AI', '마진', 'ROAS', '분석', 'MoM', 'YoY'],
            faq: [
                { q: 'AI 인사이트는?', a: '마진 하락 채널, 광고 효율 저하 등 이상 징후를 자동 요약합니다.' },
                { q: '리포트 다운로드는?', a: '상단 또는 커맨드 팔레트에서 PDF/Excel 리포트 생성(데모: 토스트 안내).' }
            ]
        },
        'menu-api': {
            view: 'view-api', menu: 'API 연동 상태', title: 'API 연동 상태',
            summary: '쇼핑몰 API 토큰·동기화 이력·오류를 모니터링합니다.',
            keywords: ['API', '연동', '토큰', 'OAuth', '동기화', '오류'],
            faq: [
                { q: '토큰 자동 갱신은?', a: '만료 14일 전 백그라운드 자동 갱신이 시도됩니다. 「동기화 · 알림 이력」에서 갱신 결과를 확인할 수 있습니다.' },
                { q: '수동 갱신은?', a: '채널 카드의 「토큰 갱신」 버튼 또는 설정의 채널 탭에서 진행합니다.' }
            ]
        },
        'api-sync-history': {
            view: 'view-api', menu: 'API 연동 상태', title: '동기화 · 알림 이력',
            summary: '최근 24시간 채널별 주문·재고 동기화, 브리핑 발송, 토큰 갱신 이력을 테이블로 확인합니다.',
            keywords: ['동기화', '이력', '알림', '브리핑', '토큰', '갱신'],
            faq: [
                { q: '자동 동기화 주기는?', a: '주문·재고 변동은 웹훅으로 우선 반영하고, 폴링은 점검·복구용으로 최소화합니다. 데일리 브리핑은 매일 08:30 알림톡으로 발송됩니다.' },
                { q: '실패 시 알림은?', a: '연속 실패 시 카카오·이메일로 운영자에게 알림이 발송됩니다(실서비스).' }
            ]
        },
        'menu-activity': {
            view: 'view-activity', menu: '활동 이력', title: '활동 이력',
            summary: '팀원별 로그인·설정 변경·주문 처리 등 감사 로그를 조회합니다.',
            keywords: ['활동', '이력', '로그', '감사', '팀'],
            faq: [
                { q: '필터는?', a: '사용자·카테고리·검색어로 타임라인을 좁힐 수 있습니다.' },
                { q: '어떤 이벤트가 기록되나요?', a: '인증, 주문/재고/CRM 작업, 리포트 다운로드, API 설정 변경 등 주요 액션입니다.' }
            ]
        },
        'menu-settings': {
            view: 'view-settings', menu: '설정', title: '설정',
            summary: 'KPI 목표, 마진·채널, 재고 규칙, 팀·좌석, 광고 매체 등 시스템 기준값을 관리합니다.',
            keywords: ['설정', 'KPI', '목표', '채널', '마진', '광고', '좌석', '팀'],
            faq: [
                { q: '탭별 역할은?', a: '「팀 · 좌석」에서 로그인 계정을 관리하고, KPI·마진·재고·판매처·광고 매체를 설정합니다.' },
                { q: '저장은 즉시 반영되나요?', a: '데모에서는 localStorage에 저장되며 대시보드 KPI·알림 기준에 반영됩니다.' },
                { q: '초기화는?', a: '설정 화면 하단 「초기화」로 기본값 복원이 가능합니다.' }
            ]
        },
        'settings-team': {
            view: 'view-settings', menu: '설정 · 팀 · 좌석', title: '팀 · 작업 좌석 관리',
            summary: '작업 좌석(Named·편집 가능 활성 계정)과 뷰어(읽기 전용)를 관리합니다. 동시 접속이 아니라 활성 계정 수 기준입니다.',
            keywords: ['좌석', '팀', '초대', '로그인', '뷰어', 'Named', '작업좌석'],
            faq: [
                { q: '작업 좌석이란?', a: '대시보드에 로그인·편집할 수 있는 활성 계정 수입니다. 접속 중이 아니어도 활성이면 1좌석입니다.' },
                { q: '뷰어는?', a: '읽기 전용·작업 좌석 미차감. 스타터 0 · 그로스 2인 무료 · 엔터프라이즈 무제한입니다.' },
                { q: '좌석 초과 시?', a: '추가 작업 좌석 옵션(스타터 +5만/인·월) 또는 상위 플랜으로 업그레이드합니다.' },
                { q: '브리핑 수신자도 좌석인가요?', a: '아니요. 카카오 알림톡만 받는 수신자는 좌석·뷰어에 포함되지 않습니다. 기본 한도는 스타터 1 · 그로스 3 · 엔터 5명입니다.' }
            ]
        },
        'header-date-range': {
            view: null, menu: '공통 · 헤더', title: '날짜 범위 선택',
            summary: '대시보드 전역 KPI·차트·DB 조회 기간을 변경합니다.',
            keywords: ['날짜', '기간', '7일', '30일', '범위'],
            faq: [
                { q: '어디에 적용되나요?', a: '통합 대시보드 KPI, 차트, 데이터 DB, 수익성 분석 등 날짜 기반 화면 전체에 적용됩니다.' }
            ]
        },
        'header-command': {
            view: null, menu: '공통 · 헤더', title: '빠른 검색 (Ctrl+K)',
            summary: '메뉴 이동·동기화·리포트 등 자주 쓰는 명령을 빠르게 실행합니다.',
            keywords: ['검색', '단축키', 'Ctrl+K', '커맨드', '팔레트'],
            faq: [
                { q: '단축키는?', a: 'Windows: Ctrl+K, Mac: ⌘+K. Esc로 닫습니다.' },
                { q: '무엇을 찾을 수 있나요?', a: '모든 사이드 메뉴, 자료실, 쇼핑몰 어드민 링크, 동기화·리포트 액션 등입니다.' }
            ]
        },
        'header-notif': {
            view: null, menu: '공통 · 헤더', title: '알림 센터',
            summary: '재고·API·주문·마진 등 운영 알림을 모아 확인합니다.',
            keywords: ['알림', '노티', '경보', '벨'],
            faq: [
                { q: '알림 클릭 시?', a: '관련 화면(재고, API, 주문 등)으로 바로 이동합니다.' },
                { q: '알림 유형은?', a: '위험 재고, API 토큰 만료, 발주 대기, 마진 이상 등 운영 이벤트별로 분류됩니다.' },
                { q: '읽음 처리는?', a: '알림을 클릭하거나 해당 업무를 처리하면 읽음으로 표시됩니다(데모: 목업).' }
            ]
        },
        'dash-pipeline-live': {
            view: 'view-dashboard', menu: '통합 대시보드', title: '라이브 데이터 파이프라인',
            summary: 'Cron → API Sync → Parse → Firebase → 카톡까지 데이터가 흐르는 ETL·알림 파이프라인 시각화입니다.',
            keywords: ['파이프라인', 'ETL', 'Cron', 'Firebase', '동기화', '카톡', '라이브'],
            faq: [
                { q: '각 단계의 역할은?', a: 'Cron: 스케줄 트리거 · API Sync: 채널 주문·재고 수집 · Parse: 정규화·검증 · Firebase: 누적 DB 적재 · 카톡: 브리핑·알림 발송.' },
                { q: 'pulse 표시는?', a: '현재 동기화가 진행 중인 단계를 강조합니다. 데모에서는 API Sync 단계가 항상 활성 표시됩니다.' },
                { q: '오류 시 어디서 확인하나요?', a: '「API 연동 상태」의 동기화 · 알림 이력 또는 「활동 이력」에서 실패 건을 조회할 수 있습니다.' }
            ]
        },
        'dash-order-feed': {
            view: 'view-dashboard', menu: '통합 대시보드', title: '실시간 주문 피드',
            summary: '최근 수집된 주문 5건을 채널·상품·금액·상태와 함께 실시간으로 표시합니다.',
            keywords: ['주문', '피드', '실시간', '최근', '테이블'],
            faq: [
                { q: '몇 건까지 보이나요?', a: '홈에서는 최근 5건만 미리보기로 표시합니다. 「전체 보기」로 주문 · 발주 화면에서 전체 목록을 조회합니다.' },
                { q: '상태 pill 색상은?', a: '발주대기(노랑), 처리중(파랑), 출고완료(초록) 등 파이프라인 단계를 나타냅니다.' },
                { q: '자동 갱신 주기는?', a: '실제 운영 시 WebSocket 또는 30초 폴링으로 갱신됩니다. 데모는 정적 샘플입니다.' }
            ]
        },
        'datahub-status': {
            view: 'view-datahub', menu: '누적 데이터 DB', title: 'DB 동기화 상태 바',
            summary: '저장소·총 레코드·보존 기간·마지막 적재 시각을 한 줄로 표시합니다.',
            keywords: ['동기화', 'Firebase', '레코드', '적재', '보존'],
            faq: [
                { q: '동기화 정상이란?', a: '최근 배치·API 수집이 오류 없이 완료된 상태입니다. 지연 시 경고 배지로 전환됩니다.' },
                { q: '보존 기간은?', a: '계약 플랜에 따라 원시 데이터 보존 일수가 정해집니다. 집계 데이터는 더 오래 보관됩니다.' }
            ]
        },
        'datahub-filters': {
            view: 'view-datahub', menu: '누적 데이터 DB', title: '기간 · 채널 필터',
            summary: '일/주/월/연 단위와 채널별로 KPI·차트·테이블을 동시에 필터링합니다.',
            keywords: ['필터', '일간', '주간', '월간', '연간', '채널'],
            faq: [
                { q: '기간 탭을 바꾸면?', a: 'KPI 카드, 매출 추이 차트, 채널 비중 파이, 하단 데이터 테이블이 모두 선택 기간·채널에 맞게 재계산됩니다.' },
                { q: '채널 「전체」는?', a: '모든 연동 마켓의 합산 지표를 표시합니다. 개별 채널 선택 시 해당 채널만 집계됩니다.' },
                { q: '헤더 날짜 범위와 차이는?', a: '데이터 DB 필터는 집계 단위(일/주/월/연) 중심이고, 헤더 날짜는 대시보드 전역 조회 구간입니다. 둘 다 적용될 수 있습니다.' }
            ]
        },
        'datahub-kpi-row': {
            view: 'view-datahub', menu: '누적 데이터 DB', title: 'DB KPI 요약 카드',
            summary: '선택 기간·채널 기준 매출·주문·객단가·환불·ROAS·마진 등 6대 핵심 지표입니다.',
            keywords: ['KPI', '매출', '주문', '객단가', '환불', 'ROAS'],
            faq: [
                { q: '지표는 실시간인가요?', a: '집계 테이블 기준으로 Near-real-time(수분~시간 지연)입니다. 원시 주문은 더 빠르게 반영됩니다.' },
                { q: '전 기간 대비 증감은?', a: '각 카드 하단에 MoM 또는 동기간 대비 %가 표시됩니다(데모: 목업).' }
            ]
        },
        'datahub-charts': {
            view: 'view-datahub', menu: '누적 데이터 DB', title: '매출 추이 · 채널 비중 차트',
            summary: '기간별 매출·주문 추이 막대/라인과 채널별 매출 비중 도넛 차트입니다.',
            keywords: ['차트', '추이', '파이', '도넛', '채널비중'],
            faq: [
                { q: '차트 단위는?', a: '좌측은 원(만 원)과 주문 건수, 우측 파이는 선택 기간 내 채널 매출 점유율(%)입니다.' },
                { q: '데이터 출처는?', a: 'Firebase 적재 원천 + 채널 API 정산 데이터를 조인한 집계 뷰입니다.' }
            ]
        },
        'datahub-table': {
            view: 'view-datahub', menu: '누적 데이터 DB', title: '원천 데이터 테이블',
            summary: '필터된 레코드를 컬럼 정렬·페이지네이션으로 상세 조회합니다.',
            keywords: ['테이블', '정렬', '페이지', '레코드', 'SKU'],
            faq: [
                { q: '컬럼 정렬은?', a: '헤더 클릭 시 오름/내림차순 토글됩니다. 숫자·날짜 컬럼은 타입에 맞게 정렬됩니다.' },
                { q: '검색은?', a: '상단 검색창에서 SKU·주문번호·상품명 등을 부분 일치로 필터링할 수 있습니다.' }
            ]
        },
        'datahub-export': {
            view: 'view-datahub', menu: '누적 데이터 DB', title: '데이터보내기',
            summary: '현재 필터(집계) 결과를 CSV·PDF·Excel로 다운로드합니다. 월 횟수 한도는 없고, 원시 대용량·PDF 고빈도·연속 요청만 보호합니다.',
            keywords: ['CSV', 'PDF', 'Excel', '다운로드', '보내기', 'export', '보호'],
            faq: [
                { q: '월 Export 한도가 있나요?', a: '없습니다. 집계 리포트 Export는 횟수 제한이 없습니다.' },
                { q: '막히는 경우는?', a: '① 원천 주문 수십만~수백만 행 덤프 ② PDF 하루 20회 초과 ③ 분·시간당 연속 자동 Export ④ 10만 행 이상 동기 생성 요청. 이때 알럿과 함께 채널 어드민 직접 다운로드를 안내합니다.' },
                { q: '원시 데이터는?', a: 'Omnify는 집계·분석용입니다. 원천 덤프는 Cafe24·스마트스토어·쿠팡 등 판매 채널에서 받으세요.' }
            ]
        },
        'orders-pipeline-kpi': {
            view: 'view-orders', menu: '주문 · 발주', title: '주문 파이프라인 KPI',
            summary: '금일 수집·발주 대기·처리 중·출고 완료 4단계 건수를 카드로 표시합니다.',
            keywords: ['파이프라인', '수집', '발주대기', '처리중', '출고'],
            faq: [
                { q: '발주 대기와 처리 중 차이는?', a: '대기: 사방넷/채널 발주 승인 전 · 처리 중: 피킹·포장·송장 준비 중입니다.' },
                { q: '클릭 시 필터 연동은?', a: '홈 「미처리 액션」 KPI 클릭 시 이 화면으로 이동하며 발주대기 필터가 적용됩니다.' }
            ]
        },
        'orders-filters': {
            view: 'view-orders', menu: '주문 · 발주', title: '주문 상태 필터 · 검색',
            summary: '전체/발주대기/처리중/출고완료 탭과 주문번호·상품명 검색입니다.',
            keywords: ['필터', '검색', '상태', '탭'],
            faq: [
                { q: '일괄 선택은?', a: '여러 주문을 선택한 뒤 「원천에서 처리」로 안내합니다. Omnify에서 일괄 발주·송장 확정은 하지 않습니다.' },
                { q: '검색은 실시간인가요?', a: '입력 시 테이블이 즉시 필터링됩니다.' }
            ]
        },
        'orders-table': {
            view: 'view-orders', menu: '주문 · 발주', title: '주문 상세 테이블',
            summary: '주문번호·채널·상품·결제금액·상태·수집시간·액션 컬럼을 제공합니다.',
            keywords: ['테이블', '주문번호', '채널', '송장', '액션'],
            faq: [
                { q: '채널 pill은?', a: 'C24(Cafe24), N(네이버), CP(쿠팡), AB(에이블리) 등 약어로 채널을 구분합니다.' },
                { q: '수동 동기화는?', a: '우측 상단 「수동 동기화」로 채널 API에서 최신 주문을 즉시 가져옵니다.' }
            ]
        },
        'inventory-kpi': {
            view: 'view-inventory', menu: '통합 재고', title: '재고 요약 KPI',
            summary: '전체 SKU·위험·주의·정상 재고 건수와 가치를 요약합니다.',
            keywords: ['SKU', '위험', '안전재고', '가치'],
            faq: [
                { q: '위험 기준은?', a: '실재고 ≤ 안전재고×50% 는 critical, 안전재고 미만은 warning입니다.' }
            ]
        },
        'inventory-table': {
            view: 'view-inventory', menu: '통합 재고', title: 'SKU 재고 테이블',
            summary: 'SKU·채널별 재고 미러와 Omnify 안전재고 경보 상태를 조회합니다.',
            keywords: ['테이블', 'SKU', '채널재고', '조회'],
            faq: [
                { q: '채널별 수량이 다른 이유는?', a: '마켓별 예약·노출·출고 대기 수량이 다르기 때문입니다. 물류 실재고는 사방넷(실재고) 열 기준입니다.' },
                { q: '수량을 수정할 수 있나요?', a: '표준은 봉쇄입니다. 사방넷 또는 채널에서만 수정하며, Enterprise 사방넷 협의 커스텀 외에는 Omnify에서 수량을 쓰지 않습니다.' }
            ]
        },
        'crm-stats': {
            view: 'view-crm', menu: '프로모션 기획 · 성과', title: '프로모션 운영 KPI',
            summary: '진행 중·기획 중·완료 프로모션 건수와 평균 목표 달성률을 집계합니다.',
            keywords: ['프로모션', 'KPI', '달성률', '기획', '진행'],
            faq: [
                { q: '평균 달성률 계산은?', a: '실적이 입력된 프로모션의 (실제 매출 ÷ 목표 매출) 평균입니다.' },
                { q: '진행 중 건수는?', a: '상태가 「진행 중」인 캘린더 일정 수입니다. 외부 실행 여부와 무관하게 기획 상태 기준입니다.' }
            ]
        },
        'crm-execution-banner': {
            view: 'view-crm', menu: '프로모션 기획 · 성과', title: '외부 실행 안내',
            summary: '알림톡·SMS·마켓 프로모션 발송은 Omnify 밖의 전문 도구에서 진행하고, 여기서는 기획·성과만 관리합니다.',
            keywords: ['외부', '실행', '솔라피', '알림톡', '발송'],
            faq: [
                { q: '왜 직접 발송이 없나요?', a: '발송 비용·수신 동의·템플릿 심사 등은 채널별 전문 도구가 적합합니다. Omnify는 일정·KPI·성과 통합에 집중합니다.' },
                { q: '실행 도구는 어디에 적나요?', a: '프로모션 등록 시 「실행 도구」 필드에 솔라피, 카카오 비즈메시지 등 사용 도구명을 기록합니다.' }
            ]
        },
        'crm-promo-calendar': {
            view: 'view-crm', menu: '프로모션 기획 · 성과', title: '프로모션 캘린더',
            summary: '주간/월간 뷰로 프로모션·행사 일정을 등록하고 일정별 상세를 확인합니다.',
            keywords: ['캘린더', '프로모션', '주간', '월간', '일정'],
            faq: [
                { q: '주간/월간 전환은?', a: '툴바 탭으로 그리드 단위를 바꿉니다. 월간은 한눈에 분기 일정, 주간은 상세 타임라인에 적합합니다.' },
                { q: '일정 등록은?', a: '「+ 일정 등록」 또는 캘린더 셀 클릭으로 프로모션명·기간·채널·목표 KPI를 입력합니다.' },
                { q: '하단 이벤트 목록은?', a: '선택 기간 내 등록된 프로모션을 리스트로 보여주며 클릭 시 우측 사이드바에 기획 상세가 열립니다.' }
            ]
        },
        'crm-promo-kpi': {
            view: 'view-crm', menu: '프로모션 기획 · 성과', title: '기획 · KPI 성과',
            summary: '프로모션별 목표 KPI(매출·전환·ROAS 등)와 외부 실행 후 실적 결과값을 입력·비교합니다.',
            keywords: ['KPI', '목표', '실적', '성과', '기획', '외부'],
            faq: [
                { q: '목표와 실적 입력은?', a: '각 프로모션 행에서 목표값은 기획 시, 실적은 외부 도구 실행 후 KPI 탭에서 입력합니다. 달성률 바가 자동 계산됩니다.' },
                { q: 'A/B 결과는?', a: '프로모션 등록 시 A/B 기획을 켜면, 외부 실행 후 variant별 발송·전환·매출을 비교해 기록합니다.' },
                { q: '요약 KPI 카드는?', a: '상단 4카드는 전체 프로모션의 평균 달성률·진행 중 건수·총 목표 매출 등을 집계합니다.' }
            ]
        },
        'comms-stats': {
            view: 'view-comms', menu: '커뮤니케이션', title: '커뮤니케이션 KPI',
            summary: '진행 중 요청·미확인 스레드·아젠다·완료율을 요약합니다.',
            keywords: ['진행', '미확인', '아젠다', '완료율'],
            faq: [
                { q: '미확인 기준은?', a: '내가 멘션되었거나 담당인데 아직 열지 않은 스레드 수입니다.' }
            ]
        },
        'comms-agenda': {
            view: 'view-comms', menu: '커뮤니케이션', title: '주간 아젠다',
            summary: '이번 주 팀 회의·마감·체크리스트 항목을 관리합니다.',
            keywords: ['아젠다', '회의', '체크', '마감'],
            faq: [
                { q: '체크하면?', a: '완료 항목은 취소선 처리되며 상단 완료율 KPI에 반영됩니다.' },
                { q: '누가 추가하나요?', a: '모든 팀원이 아젠다 항목을 추가할 수 있습니다(데모: 로컬 데이터).' }
            ]
        },
        'comms-threads': {
            view: 'view-comms', menu: '커뮤니케이션', title: '스레드 목록',
            summary: '부서·유형별 업무 스레드와 미읽음·우선순위를 표시합니다.',
            keywords: ['스레드', '멘션', '업무요청', '부서'],
            faq: [
                { q: '부서 필터는?', a: '상단 pill로 MD·CS·물류 등 부서별 스레드를 좁힐 수 있습니다.' },
                { q: '업무 요청 생성은?', a: '「+ 새 요청」으로 담당자·마감·우선순위를 지정해 스레드를 시작합니다.' }
            ]
        },
        'comms-detail': {
            view: 'view-comms', menu: '커뮤니케이션', title: '스레드 상세 · 댓글',
            summary: '선택 스레드의 메시지 타임라인·@멘션·완료 처리를 제공합니다.',
            keywords: ['댓글', '멘션', '완료', '타임라인'],
            faq: [
                { q: '완료 처리는?', a: '업무 요청 스레드에서 「완료」 시 상태가 done으로 바뀌고 KPI에 반영됩니다.' },
                { q: '@멘션 알림은?', a: '멘션된 사용자에게 헤더 알림·사이드바 배지가 표시됩니다.' }
            ]
        },
        'profit-kpi': {
            view: 'view-profit', menu: 'AI 수익성 분석', title: '수익성 KPI 카드',
            summary: '순이익·평균 마진·ROAS·AI 절감 제안 4대 지표입니다.',
            keywords: ['순이익', '마진', 'ROAS', 'AI', '절감'],
            faq: [
                { q: '설정 연동은?', a: '「설정」 KPI 탭의 목표 ROAS·마진이 카드 하단 비교 문구에 반영됩니다.' }
            ]
        },
        'profit-spend-chart': {
            view: 'view-profit', menu: 'AI 수익성 분석', title: '광고 지출 vs 순이익 차트',
            summary: '최근 30일 광고비와 순이익 추이를 이중 축으로 비교합니다.',
            keywords: ['광고', '지출', '순이익', '차트', '30일'],
            faq: [
                { q: '이상 징후는?', a: '광고비 증가 대비 순이익 정체 구간은 AI 인사이트 패널에서 자동 코멘트됩니다.' }
            ]
        },
        'profit-margin-chart': {
            view: 'view-profit', menu: 'AI 수익성 분석', title: '채널별 마진율 차트',
            summary: '연동 채널별 실마진율을 막대 차트로 비교합니다.',
            keywords: ['채널', '마진율', '막대', '비교'],
            faq: [
                { q: '마진 하락 채널은?', a: '설정의 채널별 수수료·원가율 변경 시 차트가 갱신됩니다. 쿠팡 등 수수료 인상 채널을 주기적으로 점검하세요.' }
            ]
        },
        'profit-ai-insight': {
            view: 'view-profit', menu: 'AI 수익성 분석', title: 'AI 인사이트 패널',
            summary: '마진·ROAS 이상 채널과 광고 예산 재배분 절감액을 AI가 요약합니다.',
            keywords: ['AI', '인사이트', '재배분', '절감', '쿠팡'],
            faq: [
                { q: '신뢰할 수 있나요?', a: '데모는 규칙 기반 요약입니다. 실서비스는 과거 캠페인·계절성을 학습한 모델을 사용합니다.' },
                { q: '액션은?', a: '인사이트의 「예산 재배분 시뮬레이션」 링크로 광고 설정 화면 이동(로드맵).' }
            ]
        },
        'api-channel-card': {
            view: 'view-api', menu: 'API 연동 상태', title: '채널 API 카드',
            summary: '채널별 연결 상태·토큰 만료·마지막 동기화·금일 주문 건수입니다.',
            keywords: ['채널', '토큰', 'OAuth', '동기화', 'Cafe24', '쿠팡'],
            faq: [
                { q: '주의(warn) 상태 조치는?', a: '토큰 만료 14일 이내이거나 1시간 이상 동기화 지연 시 warn입니다. 카드에서 갱신하거나 동기화 이력에서 자동 갱신 결과를 확인하세요.' },
                { q: '금일 주문 건수는?', a: '해당 채널 API에서 오늘 수집된 주문 누적 건수입니다.' }
            ]
        },
        'activity-filters': {
            view: 'view-activity', menu: '활동 이력', title: '활동 이력 필터',
            summary: '사용자·카테고리·검색어로 감사 로그를 필터링합니다.',
            keywords: ['필터', '사용자', '카테고리', '검색', '감사'],
            faq: [
                { q: '카테고리 종류는?', a: '인증, 주문, 재고, CRM, 설정, API, 리포트 등 주요 액션 유형별로 분류됩니다.' }
            ]
        },
        'activity-timeline': {
            view: 'view-activity', menu: '활동 이력', title: '활동 타임라인',
            summary: '시간순 감사 로그와 상세 메타데이터를 표시합니다.',
            keywords: ['타임라인', '로그', '감사', '이력'],
            faq: [
                { q: '보존 기간은?', a: '엔터프라이즈 플랜 기준 1년(데모: 샘플 30건).' },
                { q: '누가 삭제할 수 있나요?', a: '감사 로그는 관리자도 삭제 불가·append-only입니다.' }
            ]
        },
        'settings-tabs': {
            view: 'view-settings', menu: '설정', title: '설정 탭 패널',
            summary: 'KPI 목표·채널 마진·재고 규칙·광고 매체·채널 URL을 탭별로 편집합니다.',
            keywords: ['KPI', '마진', '재고규칙', '광고', '채널URL'],
            faq: [
                { q: '저장 위치는?', a: '데모는 브라우저 localStorage. 실서비스는 테넌트별 클라우드 설정 저장소입니다.' },
                { q: '초기화는?', a: '하단 「기본값 복원」으로 출하 기본 설정으로 되돌립니다.' }
            ]
        },
        'briefing-config': {
            view: 'view-briefing', menu: '데일리 브리핑', title: '브리핑 발송 설정',
            summary: '포함 지표·수신자(플랜 한도)·발송 시간(08:30)을 구성합니다. 1인 1통 · 매일.',
            keywords: ['설정', '수신자', '08:30', '지표', '체크', '알림톡'],
            faq: [
                { q: '수신 한도는?', a: '스타터 1 · 그로스 3 · 엔터 5명. 한도 초과 추가는 별도 문의입니다.' },
                { q: '필수 지표는?', a: '매출·마진·미처리 발주는 기본 ON이며 해제 시 경고가 표시됩니다.' },
                { q: '테스트 발송은?', a: '「테스트 발송」으로 선택 수신자에게 미리보기합니다(데모: 토스트).' }
            ]
        },
        'briefing-recipients': {
            view: 'view-briefing', menu: '데일리 브리핑', title: '알림톡 수신자',
            summary: '플랜별 기본 수신 인원 안에서 ON/OFF합니다. 최소 1명 · 추가는 문의.',
            keywords: ['수신자', '알림톡', '한도', '1인1통'],
            faq: [
                { q: '좌석과 다른가요?', a: '다릅니다. 브리핑 수신만으로는 좌석·뷰어가 차감되지 않습니다.' }
            ]
        },
        'briefing-preview': {
            view: 'view-briefing', menu: '데일리 브리핑', title: '브리핑 메시지 미리보기',
            summary: '실제 카카오톡으로 발송될 데일리 리포트 형식을 확인합니다.',
            keywords: ['미리보기', '카카오', '메시지', '리포트'],
            faq: [
                { q: '설정 변경 시 갱신되나요?', a: '체크박스·수신자 변경 시 우측 미리보기가 실시간 재렌더됩니다.' }
            ]
        },
        'menu-archive': {
            view: 'view-archive', menu: 'Google Drive 자료실', title: 'Google Drive 자료실',
            summary: '구축 시 등록한 고객 Drive 공유 폴더로 바로가기·검색합니다. 폴더 생성·이름 변경은 Drive에서 진행합니다.',
            keywords: ['자료실', 'Drive', 'Google', '폴더', '연동', '검색', '바로가기'],
            faq: [
                { q: '어느 플랜인가요?', a: '스타터·그로스·엔터프라이즈 모두 포함입니다. 저장 용량은 고객 Google 계정 기준입니다.' },
                { q: '저장 비용은?', a: 'Google Drive 저장 용량은 고객 Google 계정 기준입니다. Omnify는 연동·검색·바로가기만 제공합니다.' },
                { q: '업로드·폴더 수정은?', a: '「Drive 폴더 열기」로 이동해 Drive에서 하위 폴더 생성·이름 변경·업로드를 하세요. Omnify 화면에서는 Drive를 직접 수정하지 않습니다.' },
                { q: '바로가기는 어디 정보?', a: '구축 어드민에 등록한 공유 폴더 URL/ID를 사용합니다.' }
            ]
        },
        'archive-drive-connect': {
            view: 'view-archive', menu: 'Google Drive 자료실', title: 'Drive 연동 · 바로가기',
            summary: '등록된 공유 폴더 정보·소유자·Omnify 공유 계정을 표시하고 Drive로 바로 엽니다.',
            keywords: ['연동', '계정', '폴더', '바로가기', '링크'],
            faq: [
                { q: '폴더를 바꾸려면?', a: 'Drive 안에서 하위 구조는 자유롭게 바꾸면 됩니다. 연동 루트 폴더 자체를 바꾸려면 어드민에 새 URL 등록이 필요합니다.' },
                { q: '링크 복사는?', a: '팀원에게 같은 Drive 폴더 주소를 공유할 때 사용합니다.' }
            ]
        },
        'archive-drive-guide': {
            view: 'view-archive', menu: 'Google Drive 자료실', title: '폴더 커스텀 가이드',
            summary: '하위 폴더 생성·이름 변경 등 Drive에서 하는 작업을 단계로 안내합니다.',
            keywords: ['가이드', '하위폴더', '이름변경', '커스텀'],
            faq: [
                { q: '이름이 바뀌면 Omnify 연동이 끊기나요?', a: '폴더 ID가 같으면 이름만 바꿔도 연동은 유지됩니다. 폴더를 새로 만들면 어드민 URL을 다시 등록해야 합니다.' }
            ]
        }
    };

    var CARD_BINDINGS = {
        'view-dashboard': [
            { sel: '.border-l-warning', id: 'dash-briefing' },
            { sel: '.kpi-drill', id: 'dash-kpi-revenue', index: 0 },
            { sel: '.kpi-drill', id: 'dash-kpi-margin', index: 1 },
            { sel: '.kpi-drill', id: 'dash-kpi-target', index: 2 },
            { sel: '.kpi-drill', id: 'dash-kpi-actions', index: 3 },
            { sel: '.chart-card', id: 'dash-chart', index: 0 },
            { sel: '#view-dashboard .grid.xl\\:grid-cols-3 > .glass.rounded-xl', id: 'dash-inventory-alert', index: 1 },
            { sel: '#view-dashboard .grid.lg\\:grid-cols-3 > .glass.rounded-xl', id: 'dash-api-status', index: 0 },
            { sel: '#view-dashboard .grid.lg\\:grid-cols-3 > .glass.rounded-xl', id: 'dash-pipeline-live', index: 1 },
            { sel: '#view-dashboard .glass.rounded-xl.overflow-hidden', id: 'dash-order-feed' }
        ],
        'view-datahub': [
            { sel: '.glass.rounded-xl.p-4.flex.flex-wrap', id: 'datahub-status' },
            { sel: '#datahub-period-tabs', id: 'datahub-filters', parent: '.glass.rounded-xl' },
            { sel: '#datahub-kpis', id: 'datahub-kpi-row' },
            { sel: '#dataHubTrendChart', id: 'datahub-charts', parent: '.chart-card' },
            { sel: '#dataHubChannelChart', id: 'datahub-charts', parent: '.chart-card' },
            { sel: '#datahub-tbody', id: 'datahub-table', parent: '.glass.overflow-hidden' },
            { sel: '#view-datahub .flex.flex-col.lg\\:flex-row .flex.flex-wrap.gap-2', id: 'datahub-export' },
            { sel: '#datahub-insight', id: 'menu-datahub' }
        ],
        'view-orders': [
            { sel: '#orders-pipeline-kpi', id: 'orders-pipeline-kpi' },
            { sel: '.glass.overflow-hidden', id: 'orders-filters', index: 0 },
            { sel: '#orders-table', id: 'orders-table', parent: '.glass.overflow-hidden' }
        ],
        'view-inventory': [
            { sel: '#inventory-policy-banner', id: 'menu-inventory' },
            { sel: '.grid.grid-cols-1.sm\\:grid-cols-3', id: 'inventory-kpi' },
            { sel: '.glass.overflow-hidden', id: 'inventory-table' }
        ],
        'view-crm': [
            { sel: '#crm-execution-banner', id: 'crm-execution-banner' },
            { sel: '#crm-stats', id: 'crm-stats' },
            { sel: '#crm-panel-calendar', id: 'crm-promo-calendar' },
            { sel: '#promo-calendar-grid', id: 'crm-promo-calendar', parent: '.promo-cal-shell' },
            { sel: '#crm-panel-kpi', id: 'crm-promo-kpi' },
            { sel: '#promo-kpi-summary', id: 'crm-promo-kpi' },
            { sel: '.crm-tab-btn', id: 'menu-crm', all: true }
        ],
        'view-briefing': [
            { sel: '#briefing-recipients-list', id: 'briefing-recipients' },
            { sel: '#briefing-config-list', id: 'briefing-config' },
            { sel: '#briefing-preview-body', id: 'briefing-preview' }
        ],
        'view-comms': [
            { sel: '#comms-stats', id: 'comms-stats' },
            { sel: '#comms-dept-filters', id: 'comms-threads' },
            { sel: '#comms-agenda-list', id: 'comms-agenda' },
            { sel: '#comms-thread-list', id: 'comms-threads' },
            { sel: '#comms-detail-panel', id: 'comms-detail' }
        ],
        'view-profit': [
            { sel: '#view-profit > .grid', id: 'profit-kpi', index: 0 },
            { sel: '#profitChart', id: 'profit-spend-chart', parent: '.chart-card' },
            { sel: '#marginChart', id: 'profit-margin-chart', parent: '.chart-card' },
            { sel: '#view-profit .bg-primary\\/10', id: 'profit-ai-insight', parent: '.glass' }
        ],
        'view-api': [
            { sel: '#view-api .grid .glass', id: 'api-channel-card', all: true },
            { sel: '#api-sync-history', id: 'api-sync-history' }
        ],
        'view-activity': [
            { sel: '#activity-user-filters', id: 'activity-filters', parent: '.glass' },
            { sel: '#activity-timeline', id: 'activity-timeline' }
        ],
        'view-settings': [
            { sel: '#settings-tabs', id: 'settings-tabs' },
            { sel: '#settings-panel', id: 'settings-team' }
        ],
        'view-archive': [
            { sel: '#archive-drive-connect', id: 'archive-drive-connect' },
            { sel: '#archive-drive-guide', id: 'archive-drive-guide' },
            { sel: '#archive-stats', id: 'menu-archive' },
            { sel: '#archive-file-grid', id: 'menu-archive' }
        ]
    };

    var MENU_GUIDE_MAP = {
        'view-dashboard': 'menu-dashboard',
        'view-datahub': 'menu-datahub',
        'view-briefing': 'menu-briefing',
        'view-orders': 'menu-orders',
        'view-inventory': 'menu-inventory',
        'view-comms': 'menu-comms',
        'view-crm': 'menu-crm',
        'view-profit': 'menu-profit',
        'view-api': 'menu-api',
        'view-activity': 'menu-activity',
        'view-settings': 'menu-settings',
        'view-archive': 'menu-archive'
    };

    function getGuide(id) {
        return GUIDES[id] || null;
    }

    function allGuidesList() {
        return Object.keys(GUIDES).map(function (id) {
            var g = GUIDES[id];
            return { id: id, view: g.view, menu: g.menu, title: g.title, summary: g.summary, keywords: g.keywords, faq: g.faq };
        });
    }

    function ensureTooltip() {
        if (tooltipEl) return tooltipEl;
        tooltipEl = document.createElement('div');
        tooltipEl.id = 'dg-tooltip';
        tooltipEl.className = 'dg-tooltip';
        tooltipEl.setAttribute('role', 'tooltip');
        tooltipEl.innerHTML = '<div class="dg-tooltip-title"></div><div class="dg-tooltip-body"></div><div class="dg-tooltip-foot">자세히: 사용가이드에서 검색</div>';
        document.body.appendChild(tooltipEl);
        tooltipEl.addEventListener('mouseenter', function () {
            if (tooltipHideTimer) clearTimeout(tooltipHideTimer);
        });
        tooltipEl.addEventListener('mouseleave', hideTooltip);
        return tooltipEl;
    }

    function showTooltip(anchor, guideId) {
        var guide = getGuide(guideId);
        if (!guide || !anchor) return;
        var el = ensureTooltip();
        el.querySelector('.dg-tooltip-title').textContent = guide.title;
        var bodyText = guide.summary;
        if (guide.faq && guide.faq[0]) {
            var hint = guide.faq[0].a;
            if (hint.length > 140) hint = hint.slice(0, 137) + '…';
            bodyText += ' ' + hint;
        }
        el.querySelector('.dg-tooltip-body').textContent = bodyText;
        var faqCount = (guide.faq || []).length;
        el.querySelector('.dg-tooltip-foot').textContent = faqCount > 1
            ? '클릭하면 FAQ ' + faqCount + '개 전체 보기'
            : '클릭하면 상세 FAQ 열기';
        el.onclick = function (ev) {
            ev.stopPropagation();
            openModal(guideId);
            hideTooltip();
        };
        el.classList.add('visible');
        el.dataset.guideId = guideId;
        var rect = anchor.getBoundingClientRect();
        var tw = el.offsetWidth || 280;
        var th = el.offsetHeight || 100;
        var left = rect.left + rect.width / 2 - tw / 2;
        var top = rect.top - th - 10;
        if (top < 12) top = rect.bottom + 10;
        if (left < 8) left = 8;
        if (left + tw > window.innerWidth - 8) left = window.innerWidth - tw - 8;
        el.style.left = left + 'px';
        el.style.top = top + 'px';
    }

    function hideTooltip() {
        if (!tooltipEl) return;
        tooltipEl.classList.remove('visible');
    }

    function scheduleHideTooltip() {
        if (tooltipHideTimer) clearTimeout(tooltipHideTimer);
        tooltipHideTimer = setTimeout(hideTooltip, 120);
    }

    function bindCard(el, guideId) {
        if (!el || el.dataset.dgBound === guideId) return;
        el.dataset.dgBound = guideId;
        el.classList.add('dg-has-guide');
        el.setAttribute('data-guide-id', guideId);
        function onEnter() {
            if (tooltipHideTimer) clearTimeout(tooltipHideTimer);
            showTooltip(el, guideId);
        }
        function onLeave() { scheduleHideTooltip(); }
        function onClick(e) {
            if (e.altKey) {
                e.preventDefault();
                e.stopPropagation();
                openModal(guideId);
            }
        }
        el.addEventListener('mouseenter', onEnter);
        el.addEventListener('mouseleave', onLeave);
        el.addEventListener('focus', onEnter);
        el.addEventListener('blur', onLeave);
        el.addEventListener('click', onClick);
    }

    function queryBindingList(viewId, binding) {
        var root = document.getElementById(viewId);
        var base = root || document;
        var sel = binding.sel;
        if (root && sel.indexOf('#' + viewId) !== 0 && sel.indexOf('#') !== 0) {
            sel = '#' + viewId + ' ' + sel;
        } else if (!root && binding.sel.indexOf('#') === 0) {
            sel = binding.sel;
        }
        var nodes = base.querySelectorAll(sel);
        if (binding.all) return Array.prototype.slice.call(nodes);
        if (binding.index != null) return nodes[binding.index] ? [nodes[binding.index]] : [];
        return nodes[0] ? [nodes[0]] : [];
    }

    function applyBinding(viewId, binding) {
        var els = queryBindingList(viewId, binding);
        els.forEach(function (el) {
            var target = el;
            if (binding.parent && target) {
                target = target.closest(binding.parent) || target;
            }
            if (target) bindCard(target, binding.id);
        });
    }

    function bindDataGuideElements(scope) {
        var root = scope || document;
        root.querySelectorAll('[data-guide]').forEach(function (el) {
            var gid = el.getAttribute('data-guide');
            if (gid && getGuide(gid)) bindCard(el, gid);
        });
    }

    function clearViewBindings(viewId) {
        var root = document.getElementById(viewId);
        if (!root) return;
        root.querySelectorAll('.dg-has-guide').forEach(function (el) {
            el.classList.remove('dg-has-guide');
            delete el.dataset.dgBound;
        });
    }

    function bindTooltipsForView(viewId) {
        clearViewBindings(viewId);
        var list = CARD_BINDINGS[viewId] || [];
        list.forEach(function (b) { applyBinding(viewId, b); });
        var root = document.getElementById(viewId);
        if (root) bindDataGuideElements(root);
        bindHeaderWidgets();
    }

    function bindHeaderWidgets() {
        var dateBtn = document.getElementById('date-range-btn');
        if (dateBtn) bindCard(dateBtn, 'header-date-range');
        var searchBtn = document.querySelector('[onclick*="openCommandPalette"]');
        if (searchBtn) bindCard(searchBtn, 'header-command');
        var notifBtn = document.getElementById('notif-btn');
        if (notifBtn) bindCard(notifBtn, 'header-notif');
    }

    function bindNavTooltips() {
        document.querySelectorAll('.nav-item[data-target]').forEach(function (btn) {
            var view = btn.dataset.target;
            var gid = MENU_GUIDE_MAP[view];
            if (gid) bindCard(btn, gid);
        });
    }

    function scoreGuide(item, q) {
        if (!q) return 1;
        var tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
        if (!tokens.length) return 1;
        var blob = (item.title + ' ' + item.menu + ' ' + item.summary + ' ' + (item.keywords || []).join(' ') + ' ' +
            (item.faq || []).map(function (f) { return f.q + ' ' + f.a; }).join(' ')).toLowerCase();
        var score = 0;
        tokens.forEach(function (t) {
            if (blob.indexOf(t) >= 0) score += 10;
            if (item.title.toLowerCase().indexOf(t) >= 0) score += 8;
            (item.keywords || []).forEach(function (k) {
                if (k.toLowerCase().indexOf(t) >= 0) score += 5;
            });
        });
        return score;
    }

    function renderGuideList(items, expandId) {
        var listEl = document.getElementById('dg-guide-list');
        var emptyEl = document.getElementById('dg-guide-empty');
        if (!listEl) return;
        if (!items.length) {
            listEl.innerHTML = '';
            if (emptyEl) emptyEl.classList.remove('hidden');
            return;
        }
        if (emptyEl) emptyEl.classList.add('hidden');
        listEl.innerHTML = items.map(function (item) {
            var open = expandId === item.id ? ' open' : '';
            var faqHtml = (item.faq || []).map(function (f, i) {
                return '<details class="dg-faq-item"' + (expandId === item.id && i === 0 ? ' open' : '') + '>' +
                    '<summary>' + escapeHtml(f.q) + '</summary>' +
                    '<p>' + escapeHtml(f.a) + '</p></details>';
            }).join('');
            var goBtn = item.view ? '<button type="button" class="dg-go-btn" data-view="' + item.view + '">해당 화면으로 이동 →</button>' : '';
            return '<article class="dg-guide-card" data-id="' + item.id + '">' +
                '<div class="dg-guide-card-head">' +
                '<span class="dg-guide-menu">' + escapeHtml(item.menu) + '</span>' +
                '<h4>' + escapeHtml(item.title) + '</h4>' +
                '<p class="dg-guide-summary">' + escapeHtml(item.summary) + '</p>' +
                goBtn +
                '</div>' +
                '<div class="dg-faq-block">' + faqHtml + '</div>' +
                '</article>';
        }).join('');
        listEl.querySelectorAll('.dg-go-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var v = btn.dataset.view;
                closeModal();
                if (typeof navigateTo === 'function') navigateTo(v);
            });
        });
    }

    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function filterGuides(query, viewOnly) {
        var items = allGuidesList();
        if (viewOnly) {
            items = items.filter(function (it) { return it.view === viewOnly || it.id === MENU_GUIDE_MAP[viewOnly]; });
        }
        if (query && query.trim()) {
            items = items.map(function (it) {
                return { item: it, score: scoreGuide(it, query.trim()) };
            }).filter(function (x) { return x.score > 0; })
                .sort(function (a, b) { return b.score - a.score; })
                .map(function (x) { return x.item; });
        } else {
            items.sort(function (a, b) {
                if (a.menu === b.menu) return a.title.localeCompare(b.title, 'ko');
                return a.menu.localeCompare(b.menu, 'ko');
            });
        }
        return items;
    }

    function renderModal(query) {
        var items = filterGuides(query, modalFilterView || '');
        var expandId = items.length === 1 ? items[0].id : '';
        renderGuideList(items, expandId);
        var countEl = document.getElementById('dg-guide-count');
        if (countEl) countEl.textContent = items.length + '개 항목';
    }

    function openModal(focusGuideId, viewFilter) {
        var modal = document.getElementById('dg-guide-modal');
        if (!modal) return;
        modalFilterView = viewFilter || activeView || '';
        modal.classList.add('open');
        document.body.classList.add('dg-modal-open');
        var input = document.getElementById('dg-guide-search');
        if (focusGuideId && getGuide(focusGuideId)) {
            var g = getGuide(focusGuideId);
            if (input) input.value = g.title;
            renderModal(g.title);
            setTimeout(function () {
                var card = document.querySelector('.dg-guide-card[data-id="' + focusGuideId + '"]');
                if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 80);
        } else {
            if (input) input.value = '';
            renderModal('');
            if (input) input.focus();
        }
        updateViewFilterLabel();
    }

    function closeModal() {
        var modal = document.getElementById('dg-guide-modal');
        if (modal) modal.classList.remove('open');
        document.body.classList.remove('dg-modal-open');
        modalFilterView = '';
        updateViewFilterLabel();
    }

    function updateViewFilterLabel() {
        var el = document.getElementById('dg-guide-view-filter');
        var clearBtn = document.getElementById('dg-guide-clear-filter');
        if (!el) return;
        if (modalFilterView && MENU_GUIDE_MAP[modalFilterView]) {
            var g = getGuide(MENU_GUIDE_MAP[modalFilterView]);
            el.textContent = '현재 화면: ' + (g ? g.menu : modalFilterView);
            el.classList.remove('hidden');
        } else if (modalFilterView) {
            el.textContent = '현재 화면만 표시 중';
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
        if (clearBtn) {
            if (modalFilterView) clearBtn.classList.remove('hidden');
            else clearBtn.classList.add('hidden');
        }
    }

    function refresh(viewId) {
        viewId = viewId || activeView;
        bindTooltipsForView(viewId);
        [120, 350, 700].forEach(function (ms) {
            setTimeout(function () { bindTooltipsForView(viewId); }, ms);
        });
    }

    function onViewChange(viewId) {
        activeView = viewId;
        requestAnimationFrame(function () { refresh(viewId); });
    }

    function init() {
        var openBtn = document.getElementById('btn-open-guide');
        if (openBtn) {
            openBtn.addEventListener('click', function () { openModal('', activeView); });
        }
        var modal = document.getElementById('dg-guide-modal');
        if (modal) {
            modal.addEventListener('click', function (e) {
                if (e.target === modal) closeModal();
            });
            var panel = modal.querySelector('.dg-guide-panel');
            if (panel) {
                panel.addEventListener('click', function (e) {
                    if (e.target.closest('[data-dg-close]')) {
                        e.preventDefault();
                        closeModal();
                        return;
                    }
                    e.stopPropagation();
                });
            }
            var closeBtn = modal.querySelector('[data-dg-close]');
            if (closeBtn) {
                closeBtn.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    closeModal();
                });
            }
        }
        var searchInput = document.getElementById('dg-guide-search');
        if (searchInput) {
            searchInput.addEventListener('input', function () { renderModal(searchInput.value); });
            searchInput.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') closeModal();
            });
        }
        var clearFilter = document.getElementById('dg-guide-clear-filter');
        if (clearFilter) {
            clearFilter.addEventListener('click', function () {
                modalFilterView = '';
                updateViewFilterLabel();
                renderModal(searchInput ? searchInput.value : '');
            });
        }
        bindNavTooltips();
        bindHeaderWidgets();
        bindTooltipsForView(activeView);
        if (typeof showToast === 'function' && !sessionStorage.getItem('dg_hint_shown')) {
            sessionStorage.setItem('dg_hint_shown', '1');
            setTimeout(function () {
                showToast('💡 카드에 마우스를 올리면 기능 안내가 표시됩니다. 우측 하단 가이드 버튼에서 전체 FAQ를 검색하세요.', 'info');
            }, 1200);
        }
    }

    return {
        init: init,
        onViewChange: onViewChange,
        refresh: refresh,
        open: openModal,
        close: closeModal,
        getGuide: getGuide
    };
})();
