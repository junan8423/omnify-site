/* Omnify Demo Dashboard — 사용가이드 · FAQ 검색 (정식 대시보드 호버 툴팁 비활성)
 * 챗봇 UI: CHATBOT_UI_ENABLED=false 로 숨김 (코드·KB 유지, 추후 LLM/고도화 시 true) */
var DashboardGuide = (function () {
    var TOOLTIPS_ENABLED = false;
    /** false = FAB·모달 비표시. true 로 바꾸면 챗봇 UI 재활성 */
    var CHATBOT_UI_ENABLED = false;
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
                { q: '이 화면에서 무엇을 확인할 수 있나요?', a: '채널통합매출, 오늘의 운영 요약(주문·객단가·신규·반품), AI 예상 마감, 미처리 액션, 채널 매출 차트, 위험 재고, 프로모션 써머리·스케줄 축소판을 봅니다.' },
                { q: 'KPI 카드를 클릭하면 어떻게 되나요?', a: '다른 메뉴로 이동하지 않고 상세 내역 팝업이 열립니다. 채널 분해·발주 대기·목표 대비 등을 확인한 뒤 「출력」으로 인쇄할 수 있습니다.' },
                { q: '호버 툴팁이 없나요?', a: '정식 대시보드에서는 마우스 오버 툴팁을 제거했습니다. 기능 안내는 우측 하단 사용가이드(FAQ 검색)를 이용하세요.' },
                { q: '데모 데이터인가요?', a: '네. 체험용 목업입니다. 도입 시 채널 API·사방넷에서 수집한 정규화 데이터가 같은 레이아웃에 채워집니다.' }
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
            view: 'view-dashboard', menu: '통합 대시보드', title: '채널통합매출 KPI',
            summary: '고객사명 기준 전 채널 합산 금일 매출입니다.',
            keywords: ['매출', '통합매출', '금일', 'KPI', '채널'],
            faq: [
                { q: '클릭하면 어디로 가나요?', a: '메뉴 이동 없이 채널별 매출·비중·마진 표가 담긴 상세 팝업이 열립니다.' },
                { q: '기간은 어떻게 바꾸나요?', a: '헤더 날짜 범위(최근 7일 등)에서 변경하면 KPI·차트·팝업 수치가 함께 갱신됩니다.' },
                { q: '출력은?', a: '팝업 「출력」 또는 헤더 「리포트」로 A4 샘플 양식을 인쇄·PDF 저장할 수 있습니다.' }
            ]
        },
        'dash-kpi-ops': {
            view: 'view-dashboard', menu: '통합 대시보드', title: '오늘의 운영 요약',
            summary: '주문건수 · 객단가 · 신규회원 · 반품율을 한 카드에 요약한 운영 지표입니다.',
            keywords: ['주문', '객단가', '신규', '반품', 'AOV'],
            faq: [
                { q: '마진율은 어디에 있나요?', a: '홈 KPI에서는 제외했습니다. 「AI 수익성 분석」에서 확인하세요.' },
                { q: '클릭하면?', a: '운영 지표와 파이프라인(수집·발주대기·출고) 요약이 팝업으로 열립니다.' },
                { q: '반품율 ▼ 표시는?', a: '비교 기간 대비 개선입니다. 원인 분석은 채널 CS·반품 사유와 함께 보세요.' }
            ]
        },
        'dash-kpi-margin': {
            view: 'view-profit', menu: 'AI 수익성 분석', title: '통합 마진율',
            summary: '마진율은 홈 대신 수익성 분석 화면의 핵심 지표로 둡니다.',
            keywords: ['마진', '마진율', '수익', '실마진'],
            faq: [
                { q: '홈에서 사라졌나요?', a: '네. 홈은 운영 요약(주문·객단가·신규·반품) 중심으로 재구성했습니다.' }
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
                { q: '어떤 항목이 포함되나요?', a: '송장 미전송, 발주 승인 대기, 재고 부족 출고 지연, 위험 재고 등 운영자가 처리할 작업입니다.' },
                { q: '클릭 시 동작은?', a: '발주 대기 주문 샘플 표가 팝업으로 열립니다. 실제 발주 확정은 사방넷/채널에서 합니다.' }
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
            summary: '안전재고 이하 SKU를 우선 표시합니다. 좌측 차트 카드와 높이를 맞춥니다.',
            keywords: ['재고', '품절', '안전재고', '경보', 'SKU'],
            faq: [
                { q: 'critical과 warning 차이는?', a: 'critical은 즉시 발주가 필요한 수준, warning은 곧 안전재고 아래로 떨어질 예정인 SKU입니다.' },
                { q: '상세 재고는?', a: '카드 클릭 또는 「통합 재고」 메뉴에서 채널별 재고를 확인할 수 있습니다.' }
            ]
        },
        'dash-promo': {
            view: 'view-dashboard', menu: '통합 대시보드', title: '프로모션 현황',
            summary: '좌측 기간 써머리 + 우측 스케줄 축소판. CRM 아웃링크 없이 홈에서 확인합니다.',
            keywords: ['프로모션', 'CRM', '캠페인', '스케줄', '써머리', '캘린더'],
            faq: [
                { q: '레이아웃은?', a: '왼쪽: 진행/기획/완료 건수와 목표 대비 매출. 오른쪽: 해당 월 스케줄 축소판.' },
                { q: '왜 CRM으로 바로 안 가나요?', a: '홈에서는 현황만 요약합니다. 「상세」는 팝업, 편집은 「+ 프로모션」 또는 좌측 CRM 메뉴에서 합니다.' },
                { q: '출력은?', a: '상세 팝업 「출력」 또는 CRM 「출력 양식」을 사용하세요.' }
            ]
        },
        'dash-api-status': {
            view: 'view-api', menu: 'API 연동 상태', title: '채널 API 상태',
            summary: '홈에서는 제외. API 메뉴·헤더 파이프라인에서 확인합니다.',
            keywords: ['API', '연동', '토큰', '동기화'],
            faq: [
                { q: '홈에 없나요?', a: '네. 헤더 파이프라인 아이콘 또는 「API 연동」 메뉴를 이용하세요.' }
            ]
        },
        'dash-pipeline': {
            view: 'view-dashboard', menu: '통합 대시보드', title: '데이터 파이프라인 (헤더)',
            summary: '상단 헤더 아이콘에서 파이프라인 단계와 최근 동기화를 확인합니다.',
            keywords: ['파이프라인', '동기화', '헤더'],
            faq: [
                { q: '여는 방법?', a: '헤더의 파이프라인(흐름) 아이콘을 누르면 팝오버가 열립니다.' }
            ]
        },
        'dash-pipeline-live': {
            view: 'view-dashboard', menu: '통합 대시보드', title: '데이터 파이프라인 (헤더)',
            summary: '상단 헤더 아이콘에서 파이프라인 단계와 최근 동기화를 확인합니다.',
            keywords: ['파이프라인', '동기화', '헤더'],
            faq: [
                { q: '여는 방법?', a: '헤더의 파이프라인(흐름) 아이콘을 누르면 팝오버가 열립니다.' }
            ]
        },
        'menu-datahub': {
            view: 'view-datahub', menu: '누적 데이터 DB', title: '누적 데이터 DB',
            summary: '일/주/월/연 매출 추이·채널 비중·집계 테이블을 조회하고 CSV/Excel/PDF로 보냅니다.',
            keywords: ['DB', '데이터', '테이블', '엑셀', 'CSV', '누적', '추이', '일간', '주간', '월간', '연간'],
            faq: [
                { q: '어떤 데이터가 쌓이나요?', a: '주문·정산·재고 스냅샷·광고 성과 등 API·배치로 수집된 집계 레코드입니다(데모는 목업).' },
                { q: '매출 추이 차트는?', a: '과거→현재 순. 일간·주간·월간·연간 탭으로 단위를 바꿉니다. 시즌·요일·성장 패턴이 반영된 데모 곡선입니다.' },
                { q: '정렬·검색은?', a: '컬럼 헤더로 정렬, 상단 검색으로 기간·채널 텍스트를 필터합니다.' },
                { q: '보내기는?', a: 'CSV/Excel은 집계 테이블 다운로드, PDF는 화면 캡처형 리포트입니다. 원시 대용량 덤프는 차단됩니다.' },
                { q: '채널 비중 도넛은?', a: '최근 구간의 채널 weight 기준 비중입니다. 범례는 최대 12채널까지 표시합니다.' }
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
                { q: '리포트 다운로드는?', a: '헤더 「리포트」 또는 화면 「출력 양식」으로 A4 샘플을 인쇄·PDF 저장합니다. (주문/재고/수익/프로모션 양식 포함)' },
                { q: 'Data Hub Export와 다른가요?', a: '헤더 리포트는 요약 인쇄 양식이고, Data Hub CSV/Excel/PDF는 집계 테이블 Export입니다.' }
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
            summary: 'KPI·마진·재고·팀 좌석·광고·외관(다크/라이트) 등 시스템 기준값을 관리합니다.',
            keywords: ['설정', 'KPI', '목표', '채널', '마진', '광고', '좌석', '팀', '테마', '라이트', '다크'],
            faq: [
                { q: '탭별 역할은?', a: '「팀 · 좌석」에서 계정, KPI·마진·재고·판매처·광고 매체, 외관(테마·톤)을 설정합니다.' },
                { q: '저장은 즉시 반영되나요?', a: '데모에서는 localStorage에 저장되며 KPI·알림·테마에 반영됩니다.' },
                { q: '라이트/다크 전환은?', a: '설정 외관에서 테마를 바꾸면 전체 토큰 색이 전환됩니다. 라이트는 대비 강화 토큰을 씁니다.' },
                { q: '초기화는?', a: '설정 하단 「초기화」로 기본값 복원이 가능합니다.' }
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
            summary: '오늘·전일·주·월·연 프리셋과 직접 지정으로 전역 KPI·차트 기간을 바꿉니다.',
            keywords: ['날짜', '기간', '7일', '30일', '범위', '오늘', '어제', '이번주', '지난주', '이번달', '직접지정', '커스텀'],
            faq: [
                { q: '어디에 적용되나요?', a: '통합 대시보드 KPI·차트 배율, 누적 DB 추이 기준, 헤더 부제 등 날짜 기반 화면에 반영됩니다.' },
                { q: '프리셋에 어떤 것이 있나요?', a: '오늘·전일, 이번/지난 주, 최근 7·14일, 이번/지난달, 최근 30·90일, 올해·작년, 그리고 시작·종료 직접 지정이 있습니다.' },
                { q: '직접 지정은?', a: '기간 메뉴 → 「직접 지정」 → 시작·종료일 → 「적용」. 잘못된 순서(종료<시작)면 경고가 뜹니다.' },
                { q: '선택이 유지되나요?', a: '브라우저 localStorage에 프리셋·커스텀 날짜가 저장되어 새로고침 후에도 유지됩니다(데모).' }
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
            { sel: '#home-ops-kpi', id: 'dash-kpi-ops' },
            { sel: '.kpi-drill', id: 'dash-kpi-target', index: 2 },
            { sel: '.kpi-drill', id: 'dash-kpi-actions', index: 3 },
            { sel: '.chart-card', id: 'dash-chart', index: 0 },
            { sel: '.home-inv-alert', id: 'dash-inventory-alert' },
            { sel: '#home-promo-card', id: 'dash-promo' },
            { sel: '#pipeline-btn', id: 'dash-pipeline' },
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
        if (!TOOLTIPS_ENABLED) return;
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
        /* 정식 대시보드: 호버 ?/help 커서 표시용 클래스 미사용 */
        el.setAttribute('data-guide-id', guideId);
        function onClick(e) {
            if (e.altKey) {
                e.preventDefault();
                e.stopPropagation();
                openModal(guideId);
            }
        }
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
        var tokens = tokenize(q);
        if (!tokens.length) return 1;
        var blob = (item.title + ' ' + item.menu + ' ' + (item.summary || '') + ' ' + (item.keywords || []).join(' ') + ' ' +
            (item.faq || []).map(function (f) { return f.q + ' ' + f.a; }).join(' ')).toLowerCase();
        var score = 0;
        tokens.forEach(function (t) {
            if (blob.indexOf(t) >= 0) score += 10;
            if (item.title.toLowerCase().indexOf(t) >= 0) score += 12;
            (item.keywords || []).forEach(function (k) {
                var kl = k.toLowerCase();
                if (kl === t) score += 14;
                else if (kl.indexOf(t) >= 0 || t.indexOf(kl) >= 0) score += 7;
            });
            if (t.length >= 2) {
                if (blob.indexOf(t) >= 0) score += 2;
            }
        });
        if (modalFilterView && item.view === modalFilterView) score += 6;
        return score;
    }

    function getSynonymMap() {
        return (window.DashboardGuideKB && window.DashboardGuideKB.synonyms) || {};
    }

    var GUIDE_STOP = {
        '은': 1, '는': 1, '이': 1, '가': 1, '을': 1, '를': 1, '에': 1, '의': 1, '로': 1, '으로': 1,
        '와': 1, '과': 1, '도': 1, '만': 1, '에서': 1, '까지': 1, '부터': 1, '하다': 1, '하는': 1, '한': 1,
        '좀': 1, '혹시': 1, '알려줘': 1, '알려주세요': 1, '뭐야': 1, '무엇': 1, '어떻게': 1, '어디': 1,
        '있나요': 1, '있어요': 1, '인가요': 1, '할까': 1, '싶은': 1, '해주세요': 1, '해줘': 1,
        '설명해줘': 1, '설명': 1, '질문': 1, '궁금': 1, '대해': 1, '관련': 1, '하면': 1, '되면': 1,
        '되나': 1, '되나용': 1, '돼요': 1, '됩니다': 1, '해주세요요': 1, '부탁': 1, '입니다': 1
    };

    function normalizeQuery(raw) {
        return String(raw || '')
            .toLowerCase()
            .replace(/[?!.,，。·？！~…]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function stripKoreanEnding(token) {
        var t = String(token || '');
        if (t.length < 3) return t;
        return t
            .replace(/(으로|에서|까지|부터|이나|라도|처럼|보다)$/g, '')
            .replace(/(을|를|은|는|이|가|와|과|의|로|에|도|만|요|죠)$/g, '')
            .replace(/(인가요|하나요|되나요|할까요|인가요|가나요|하나요|인가요)$/g, '')
            .replace(/(하다|하는|하면|해서|한|됨|되는|될까)$/g, '');
    }

    function expandSynonyms(token, bag) {
        var syn = getSynonymMap();
        var t = String(token || '');
        if (!t || t.length < 2) return;
        Object.keys(syn).forEach(function (key) {
            var list = syn[key];
            var hit = list.some(function (s) {
                return s.length >= 2 && (t === s || t.indexOf(s) >= 0 || s.indexOf(t) >= 0);
            });
            if (hit) {
                bag[key] = 1;
                list.forEach(function (s) {
                    if (s.length >= 2 && s.length <= 12) bag[s] = 1;
                });
            }
        });
    }

    function tokenize(raw) {
        var q = normalizeQuery(raw);
        if (!q) return [];
        var bag = {};
        q.split(/\s+/).forEach(function (p) {
            if (!p) return;
            var stem = stripKoreanEnding(p);
            if (stem.length >= 2 && !GUIDE_STOP[stem]) bag[stem] = 1;
            if (p.length >= 2 && !GUIDE_STOP[p]) bag[p] = 1;
            expandSynonyms(p, bag);
            expandSynonyms(stem, bag);
        });
        Object.keys(getSynonymMap()).forEach(function (key) {
            getSynonymMap()[key].forEach(function (s) {
                if (s.length >= 2 && q.indexOf(s) >= 0) {
                    bag[s] = 1;
                    bag[key] = 1;
                }
            });
        });
        return Object.keys(bag).filter(function (t) {
            return t.length >= 2 && !GUIDE_STOP[t];
        });
    }

    function detectIntent(raw) {
        var q = normalizeQuery(raw);
        var patterns = (window.DashboardGuideKB && window.DashboardGuideKB.intents) || [];
        for (var i = 0; i < patterns.length; i++) {
            var p = patterns[i];
            try {
                if (p.re && new RegExp(p.re, 'i').test(q)) return p;
            } catch (e) { /* ignore bad pattern */ }
        }
        if (/^(안녕|안녕하세요|하이|헬로|hi|hello)\b/.test(q)) return { id: 'greet', type: 'greet' };
        if (/^(고마|감사|땡큐|thanks)/.test(q)) return { id: 'thanks', type: 'thanks' };
        if (/^(도움|헬프|help|메뉴|뭐\s*할\s*수)/.test(q)) return { id: 'help', type: 'help' };
        return null;
    }

    function knowledgeList() {
        var base = allGuidesList();
        var extras = (window.DashboardGuideKB && window.DashboardGuideKB.extras) || [];
        return base.concat(extras.map(function (g) {
            return {
                id: g.id, view: g.view, menu: g.menu, title: g.title,
                summary: g.summary || '', keywords: g.keywords || [], faq: g.faq || []
            };
        }));
    }

    function flattenFaqs(items) {
        var rows = [];
        items.forEach(function (item) {
            (item.faq || []).forEach(function (f, idx) {
                rows.push({
                    guideId: item.id, faqIndex: idx, view: item.view, menu: item.menu,
                    title: item.title, keywords: item.keywords || [], summary: item.summary || '',
                    q: f.q, a: f.a, aliases: f.aliases || [], steps: f.steps || null, tip: f.tip || ''
                });
            });
        });
        return rows;
    }

    function tokenOverlapRatio(aTokens, bTokens) {
        if (!aTokens.length || !bTokens.length) return 0;
        var hit = 0;
        aTokens.forEach(function (t) {
            if (bTokens.indexOf(t) >= 0) hit += 1;
        });
        return hit / Math.max(aTokens.length, 1);
    }

    function scoreFaqRow(row, tokens, rawQ) {
        var raw = normalizeQuery(rawQ);
        if (!raw) return 0;
        var qLow = row.q.toLowerCase();
        var aLow = row.a.toLowerCase();
        var titleLow = (row.title + ' ' + row.menu).toLowerCase();
        var kw = (row.keywords || []).join(' ').toLowerCase();
        var aliasBlob = (row.aliases || []).join(' ').toLowerCase();
        var compactRaw = raw.replace(/\s+/g, '');
        var compactQ = qLow.replace(/\s+/g, '');
        var score = 0;
        var qHits = 0;
        var aOnlyHits = 0;

        if (compactRaw && (compactQ.indexOf(compactRaw) >= 0 || compactRaw.indexOf(compactQ) >= 0)) score += 120;
        (row.aliases || []).forEach(function (al) {
            var c = String(al).toLowerCase().replace(/\s+/g, '');
            if (!c) return;
            if (c === compactRaw) score += 140;
            else if (compactRaw.indexOf(c) >= 0 || c.indexOf(compactRaw) >= 0) score += 70;
            else if (raw.indexOf(String(al).toLowerCase()) >= 0) score += 45;
        });

        tokens.forEach(function (t) {
            var inQ = qLow.indexOf(t) >= 0 || aliasBlob.indexOf(t) >= 0;
            var inTitle = titleLow.indexOf(t) >= 0;
            var inKw = kw.indexOf(t) >= 0;
            var inA = aLow.indexOf(t) >= 0;
            if (inQ) { score += 32; qHits += 1; }
            if (inTitle) score += 12;
            if (inKw) score += 14;
            if (inA && !inQ) { score += 4; aOnlyHits += 1; }
            else if (inA) score += 5;
            if (row.summary && row.summary.toLowerCase().indexOf(t) >= 0) score += 3;
        });

        var qTokens = tokenize(row.q + ' ' + (row.aliases || []).join(' '));
        var overlap = tokenOverlapRatio(tokens, qTokens);
        score += Math.round(overlap * 55);
        if (qHits === 0 && aOnlyHits > 0) score = Math.round(score * 0.35);
        if (qHits === 0 && !aliasBlob) score = Math.min(score, 22);

        if (modalFilterView && row.view === modalFilterView) score += 10;
        if (activeView && row.view === activeView) score += 6;
        if (/차이|비교|다른/.test(raw) && /차이|비교/.test(qLow + aliasBlob)) score += 18;
        if (/(어디|어디로|어디서)/.test(raw) && /(어디|화면|메뉴|탭)/.test(qLow + aLow)) score += 12;
        if (/(몇\s*명|한도|몇개|얼마)/.test(raw) && /(명|한도|원|개)/.test(qLow + aLow)) score += 14;
        if (/(안\s*돼|되나|가능|수정|쓰기|발주|출고)/.test(raw) && /(불가|봉쇄|원천|사방넷|조회)/.test(qLow + aLow)) score += 16;
        return score;
    }

    function searchAnswers(query, limit) {
        limit = limit || 6;
        if (!query || !String(query).trim()) return [];
        var tokens = tokenize(query);
        var rows = flattenFaqs(knowledgeList());
        var scored = rows.map(function (r) {
            return { row: r, score: scoreFaqRow(r, tokens, query) };
        }).filter(function (x) { return x.score >= 28; })
            .sort(function (a, b) { return b.score - a.score || a.row.q.length - b.row.q.length; });
        var seen = {};
        var out = [];
        scored.forEach(function (x) {
            if (seen[x.row.q]) return;
            seen[x.row.q] = 1;
            out.push(x);
        });
        return out.slice(0, limit);
    }

    function intentReply(intent) {
        if (!intent) return null;
        if (intent.type === 'greet' || intent.id === 'greet') {
            return {
                text: '안녕하세요. Omnify 사용을 도와드릴게요. 재고 검색, 좌석·뷰어, 발주 가능 여부, 브리핑, 요금제처럼 업무 질문으로 물어보시면 됩니다.',
                related: ((window.DashboardGuideKB && window.DashboardGuideKB.chips) || []).slice(0, 5).map(function (c) { return { q: c }; })
            };
        }
        if (intent.type === 'thanks' || intent.id === 'thanks') {
            return {
                text: '도움이 되었다니 다행입니다. 다른 운영 질문이 있으면 이어서 물어보세요.',
                related: [{ q: '위험 재고는 어디서 보나요?' }, { q: '기간을 직접 지정하려면?' }]
            };
        }
        if (intent.type === 'help' || intent.id === 'help') {
            return {
                text: '저는 Omnify 제품 스펙·화면 가이드를 바탕으로 답합니다. 「목록」 탭에서 메뉴별 FAQ를 보거나, 아래 추천 질문으로 시작해 보세요.',
                related: ((window.DashboardGuideKB && window.DashboardGuideKB.chips) || []).slice(0, 6).map(function (c) { return { q: c }; })
            };
        }
        if (intent.faqId) {
            var rows = flattenFaqs(knowledgeList());
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].guideId === intent.faqId || rows[i].q === intent.q) {
                    return {
                        q: rows[i].q,
                        text: composeAnswer(rows[i], intent.lead || ''),
                        menu: rows[i].menu + ' · ' + rows[i].title,
                        view: rows[i].view,
                        confidence: 92
                    };
                }
            }
        }
        if (intent.answer) {
            return {
                text: intent.answer,
                view: intent.view || null,
                menu: intent.menu || '',
                confidence: 88,
                related: (intent.related || []).map(function (q) { return { q: q }; })
            };
        }
        return null;
    }

    function composeAnswer(row, lead) {
        var parts = [];
        if (lead) parts.push(lead);
        parts.push(row.a);
        if (row.steps && row.steps.length) {
            parts.push(row.steps.map(function (s, i) { return (i + 1) + ') ' + s; }).join(' '));
        }
        if (row.tip) parts.push('Tip: ' + row.tip);
        return parts.join('\n\n');
    }

    function confidenceLabel(score) {
        if (score >= 90) return { pct: Math.min(99, Math.round(score / 1.4)), label: '높은 일치' };
        if (score >= 55) return { pct: Math.min(85, Math.round(score / 1.5)), label: '관련 답변' };
        return { pct: Math.min(55, Math.round(score / 1.8)), label: '참고 답변' };
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
            var faqHtml = (item.faq || []).map(function (f, i) {
                return '<details class="dg-faq-item"' + (expandId === item.id && i === 0 ? ' open' : '') + '>' +
                    '<summary>' + escapeHtml(f.q) + '</summary>' +
                    '<p>' + escapeHtml(f.a) + '</p></details>';
            }).join('');
            var goBtn = item.view
                ? '<button type="button" class="dg-go-btn" data-view="' + item.view + '">해당 화면으로 이동 →</button>'
                : '';
            return '<article class="dg-guide-card" data-id="' + item.id + '">' +
                '<div class="dg-guide-card-head">' +
                '<span class="dg-guide-menu">' + escapeHtml(item.menu) + '</span>' +
                '<h4>' + escapeHtml(item.title) + '</h4>' +
                '<p class="dg-guide-summary">' + escapeHtml(item.summary || '') + '</p>' +
                goBtn +
                '</div>' +
                '<div class="dg-faq-block">' + faqHtml + '</div>' +
                '</article>';
        }).join('');
        listEl.querySelectorAll('.dg-go-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                closeModal();
                if (typeof navigateTo === 'function') navigateTo(btn.dataset.view);
            });
        });
    }

    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function filterGuides(query, viewOnly) {
        var items = knowledgeList();
        if (viewOnly) {
            items = items.filter(function (it) {
                return it.view === viewOnly || it.id === MENU_GUIDE_MAP[viewOnly];
            });
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

    var guideMode = 'chat';
    var chatHistory = [];

    function setGuideMode(mode) {
        guideMode = mode === 'list' ? 'list' : 'chat';
        var chatPane = document.getElementById('dg-chat-pane');
        var listPane = document.getElementById('dg-list-pane');
        var tabChat = document.getElementById('dg-tab-chat');
        var tabList = document.getElementById('dg-tab-list');
        if (chatPane) chatPane.classList.toggle('hidden', guideMode !== 'chat');
        if (listPane) listPane.classList.toggle('hidden', guideMode !== 'list');
        if (tabChat) tabChat.classList.toggle('active', guideMode === 'chat');
        if (tabList) tabList.classList.toggle('active', guideMode === 'list');
        if (guideMode === 'list') {
            var input = document.getElementById('dg-guide-search');
            renderModal(input ? input.value : '');
        }
    }

    function renderChips() {
        var el = document.getElementById('dg-chat-chips');
        if (!el) return;
        var chips = (window.DashboardGuideKB && window.DashboardGuideKB.chips) || [];
        el.innerHTML = chips.map(function (c) {
            return '<button type="button" class="dg-chip" data-q="' + escapeHtml(c) + '">' + escapeHtml(c) + '</button>';
        }).join('');
        el.querySelectorAll('.dg-chip').forEach(function (btn) {
            btn.addEventListener('click', function () { askGuideChat(btn.getAttribute('data-q')); });
        });
    }

    function renderChatThread() {
        var el = document.getElementById('dg-chat-thread');
        if (!el) return;
        if (!chatHistory.length) {
            el.innerHTML =
                '<div class="dg-msg bot"><div class="dg-msg-bubble">' +
                '<p class="dg-msg-lead">안녕하세요. Omnify 운영 도우미입니다.</p>' +
                '<p>재고·주문·좌석·브리핑·요금처럼 <strong>실제 업무 질문</strong>으로 물어보세요. 제품 스펙 지식베이스에서 가장 가까운 안내를 골라 답합니다.</p>' +
                '<p class="dg-msg-note">로컬 스펙 매칭 엔진입니다(실시간 LLM 아님). 질문 예: 「재고 CSV 어떻게 받아요?」 「발주 여기서 되나요?」 「뷰어랑 좌석 차이」</p>' +
                '</div></div>';
            return;
        }
        el.innerHTML = chatHistory.map(function (m) {
            if (m.role === 'user') {
                return '<div class="dg-msg user"><div class="dg-msg-bubble">' + escapeHtml(m.text) + '</div></div>';
            }
            if (m.typing) {
                return '<div class="dg-msg bot"><div class="dg-msg-bubble dg-typing"><span></span><span></span><span></span></div></div>';
            }
            var extras = '';
            if (m.related && m.related.length) {
                extras += '<div class="dg-related">' + m.related.map(function (r) {
                    return '<button type="button" class="dg-related-btn" data-q="' + escapeHtml(r.q) + '">' +
                        escapeHtml(r.q) + '</button>';
                }).join('') + '</div>';
            }
            var go = m.view
                ? '<button type="button" class="dg-go-btn dg-chat-go" data-view="' + m.view + '">해당 화면으로 이동 →</button>'
                : '';
            var conf = m.confidence != null
                ? '<span class="dg-conf">' + escapeHtml(m.confLabel || (m.confidence >= 70 ? '높은 일치' : m.confidence >= 40 ? '관련 답변' : '참고 답변')) + '</span>'
                : '';
            var answerHtml = escapeHtml(m.text).replace(/\n\n/g, '</p><p class="dg-msg-a">').replace(/\n/g, '<br>');
            return '<div class="dg-msg bot"><div class="dg-msg-bubble">' +
                (m.menu ? '<span class="dg-msg-tag">' + escapeHtml(m.menu) + '</span>' : '') +
                conf +
                (m.q && m.showQ !== false ? '<p class="dg-msg-q">' + escapeHtml(m.q) + '</p>' : '') +
                '<p class="dg-msg-a">' + answerHtml + '</p>' +
                go + extras +
                '</div></div>';
        }).join('');
        el.querySelectorAll('.dg-chat-go').forEach(function (btn) {
            btn.addEventListener('click', function () {
                closeModal();
                if (typeof navigateTo === 'function') navigateTo(btn.dataset.view);
            });
        });
        el.querySelectorAll('.dg-related-btn').forEach(function (btn) {
            btn.addEventListener('click', function () { askGuideChat(btn.getAttribute('data-q')); });
        });
        el.scrollTop = el.scrollHeight;
    }

    function askGuideChat(raw) {
        var q = String(raw || '').trim();
        if (!q) return;
        setGuideMode('chat');
        chatHistory.push({ role: 'user', text: q });
        chatHistory.push({ role: 'bot', typing: true });
        renderChatThread();

        var finish = function (reply, hitCount) {
            chatHistory = chatHistory.filter(function (m) { return !m.typing; });
            chatHistory.push(reply);
            var input = document.getElementById('dg-chat-input');
            if (input) input.value = '';
            var listSearch = document.getElementById('dg-guide-search');
            if (listSearch) listSearch.value = q;
            renderChatThread();
            updateGuideCountLabel(hitCount != null ? hitCount : 0);
        };

        setTimeout(function () {
            var intent = detectIntent(q);
            var direct = intentReply(intent);
            if (direct && (intent.type === 'greet' || intent.type === 'thanks' || intent.type === 'help' || intent.answer || intent.faqId)) {
                finish({
                    role: 'bot',
                    text: direct.text,
                    q: direct.q || '',
                    showQ: !!direct.q,
                    menu: direct.menu || '',
                    view: direct.view || null,
                    confidence: direct.confidence || 90,
                    confLabel: '바로 안내',
                    related: direct.related || []
                }, direct.q ? 1 : 0);
                return;
            }

            var hits = searchAnswers(q, 6);
            if (!hits.length) {
                var suggest = ((window.DashboardGuideKB && window.DashboardGuideKB.chips) || []).slice(0, 5);
                finish({
                    role: 'bot',
                    showQ: false,
                    text: '그 문장과 정확히 맞는 스펙 답변을 아직 못 찾았습니다.\n\n키워드를 조금 바꿔 보세요. 예: 재고 CSV / 발주 가능 여부 / 좌석 뷰어 / 사방넷 / 브리핑 미리보기.\n\n「목록」 탭에서 메뉴별 FAQ를 훑어보는 것도 빠릅니다.',
                    related: suggest.map(function (c) { return { q: c }; })
                }, 0);
                return;
            }

            var best = hits[0];
            var second = hits[1];
            var conf = confidenceLabel(best.score);
            var lead = conf.pct < 70 ? '질문과 가장 가까운 안내입니다.' : '';
            var text = composeAnswer(best.row, lead);
            if (second && best.score - second.score < 12 && second.score >= 40) {
                text += '\n\n같이 보면 좋은 안내: 「' + second.row.q + '」 — ' + second.row.a;
            }

            finish({
                role: 'bot',
                q: best.row.q,
                showQ: conf.pct < 85,
                text: text,
                menu: best.row.menu + ' · ' + best.row.title,
                view: best.row.view,
                confidence: conf.pct,
                confLabel: conf.label,
                related: hits.slice(1, 4).map(function (h) { return { q: h.row.q }; })
            }, hits.length);
        }, 220 + Math.min(280, q.length * 8));
    }

    function updateGuideCountLabel(n) {
        var countEl = document.getElementById('dg-guide-count');
        if (!countEl) return;
        if (guideMode === 'chat') {
            var totalFaq = flattenFaqs(knowledgeList()).length;
            countEl.textContent = '지식 ' + totalFaq + '개 FAQ · 매칭 ' + (n != null ? n : '—') + '건';
        } else {
            countEl.textContent = n + '개 항목';
        }
    }

    function renderModal(query) {
        var items = filterGuides(query, modalFilterView || '');
        renderGuideList(items, items.length === 1 ? items[0].id : '');
        updateGuideCountLabel(items.length);
    }

    function openModal(focusGuideId, viewFilter) {
        if (!CHATBOT_UI_ENABLED) return;
        var modal = document.getElementById('dg-guide-modal');
        if (!modal) return;
        modalFilterView = viewFilter || activeView || '';
        modal.classList.add('open');
        document.body.classList.add('dg-modal-open');
        renderChips();
        updateGuideCountLabel(0);
        if (focusGuideId && getGuide(focusGuideId)) {
            setGuideMode('list');
            var g = getGuide(focusGuideId);
            var input = document.getElementById('dg-guide-search');
            if (input) input.value = g.title;
            renderModal(g.title);
            setTimeout(function () {
                var card = document.querySelector('.dg-guide-card[data-id="' + focusGuideId + '"]');
                if (card) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 80);
        } else {
            setGuideMode('chat');
            if (!chatHistory.length) renderChatThread();
            var chatInput = document.getElementById('dg-chat-input');
            if (chatInput) chatInput.focus();
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

    function applyChatbotVisibility() {
        var fab = document.getElementById('btn-open-guide');
        var modal = document.getElementById('dg-guide-modal');
        if (CHATBOT_UI_ENABLED) {
            document.body.classList.remove('dg-chatbot-off');
            if (fab) {
                fab.hidden = false;
                fab.setAttribute('aria-hidden', 'false');
                fab.style.display = '';
            }
            if (modal) modal.setAttribute('aria-hidden', modal.classList.contains('open') ? 'false' : 'true');
        } else {
            document.body.classList.add('dg-chatbot-off');
            if (fab) {
                fab.hidden = true;
                fab.setAttribute('aria-hidden', 'true');
                fab.style.display = 'none';
            }
            if (modal) {
                modal.classList.remove('open');
                modal.setAttribute('aria-hidden', 'true');
                modal.style.display = 'none';
            }
            document.body.classList.remove('dg-modal-open');
        }
    }

    function init() {
        applyChatbotVisibility();
        if (!CHATBOT_UI_ENABLED) {
            // 툴팁 바인딩만 유지(현재 TOOLTIPS_ENABLED=false). 챗봇 UI는 숨김.
            bindNavTooltips();
            bindHeaderWidgets();
            bindTooltipsForView(activeView);
            return;
        }
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
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modal && modal.classList.contains('open')) closeModal();
        });

        var tabChat = document.getElementById('dg-tab-chat');
        var tabList = document.getElementById('dg-tab-list');
        if (tabChat) tabChat.addEventListener('click', function () { setGuideMode('chat'); renderChatThread(); });
        if (tabList) tabList.addEventListener('click', function () { setGuideMode('list'); });

        var chatForm = document.getElementById('dg-chat-form');
        if (chatForm) {
            chatForm.addEventListener('submit', function (e) {
                e.preventDefault();
                var input = document.getElementById('dg-chat-input');
                askGuideChat(input ? input.value : '');
            });
        }

        var searchInput = document.getElementById('dg-guide-search');
        if (searchInput) {
            searchInput.addEventListener('input', function () { renderModal(searchInput.value); });
            searchInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    askGuideChat(searchInput.value);
                }
            });
        }
        var clearFilter = document.getElementById('dg-guide-clear-filter');
        if (clearFilter) {
            clearFilter.addEventListener('click', function () {
                modalFilterView = '';
                updateViewFilterLabel();
                if (guideMode === 'list') renderModal(searchInput ? searchInput.value : '');
            });
        }

        renderChips();
        bindNavTooltips();
        bindHeaderWidgets();
        bindTooltipsForView(activeView);
        // 챗봇 재활성(CHATBOT_UI_ENABLED=true) 시에만 안내 토스트
        if (typeof showToast === 'function' && !sessionStorage.getItem('dg_hint_shown')) {
            sessionStorage.setItem('dg_hint_shown', '1');
            setTimeout(function () {
                showToast('💡 사용 도우미에서 업무 질문을 물어볼 수 있습니다.', 'info');
            }, 1200);
        }
    }

    return {
        init: init,
        onViewChange: onViewChange,
        refresh: refresh,
        open: openModal,
        openModal: openModal,
        close: closeModal,
        closeModal: closeModal,
        ask: askGuideChat,
        getGuide: getGuide,
        isChatbotEnabled: function () { return !!CHATBOT_UI_ENABLED; }
    };
})();
