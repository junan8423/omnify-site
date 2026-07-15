/**
 * Omnify TIP — cinematic click-through product tour for sales.
 */
(function (global) {
    'use strict';

    var AUTO_MS = 0;
    var state = { open: false, index: 0, timer: null };

    var SLIDES = [
        {
            kicker: 'TIP 01 · HOOK',
            title: '창마다 다른 숫자,\n아침에 이미 지칩니다',
            punch: '카페24 2,180만 · 쿠팡 2,410만 · 스토어 1,960만.\n같은 어제인데 합산이 안 맞고, 회의는 숫자 다툼으로 시작됩니다.',
            hook: 'Omnify는 채널 숫자를 한 화면으로 맞춰, “어느 창이 맞냐”를 끝냅니다.',
            voice: '어제 스마트스토어랑 쿠팡 숫자가 안 맞아서 두 시간 헤맸거든요. 지금은 출근하면 화면 하나만 봐요.',
            voiceBy: '여성의류 A사 MD',
            visual: 'hook',
            accent: 'sky'
        },
        {
            kicker: 'TIP 02 · 홈',
            title: '30초면 끝나는\n통합 대시보드',
            punch: '매출 · 마진 · 주문 · 재고 경보가 한 화면.\n대표가 아침에 보는 단 하나의 홈 화면입니다.',
            hook: 'KPI를 클릭하면 상세 팝업 — 메뉴를 헤매지 않습니다.',
            voice: '미팅 전에 홈만 훑어도 “오늘은 어디가 아픈지”가 나와요. 직원한테 추가로 물어보는 일이 줄었습니다.',
            voiceBy: '뷰티 B사 대표',
            visual: 'home',
            accent: 'blue'
        },
        {
            kicker: 'TIP 03 · 브리핑',
            title: '매일 08:30,\n카카오톡으로 보고',
            punch: '매출·마진·재고·발주·ROAS를 항목 ON/OFF로 조합.\n대시보드 미리보기와 같은 내용이 그대로 발송됩니다.',
            hook: '데일리 카카오 브리핑 — “보고받는 경영”으로 전환하세요.',
            voice: '출근길 카톡에 어제 마진이 먼저 와요. 자리 앉기 전에 할 말이 정해지니까 아침이 편해졌어요.',
            voiceBy: '생활용품 C사 운영이사',
            visual: 'briefing',
            accent: 'amber'
        },
        {
            kicker: 'TIP 04 · 주문',
            title: '채널별 주문을\n한 줄로 처리',
            punch: '대기 · 출고 · 송장 · 이슈를 채널 섞임 없이 추적.\n발주 대기 건수가 숫자로 바로 보입니다.',
            hook: '주문·발주 현황 제목부터 고객사 맞춤으로 표시됩니다.',
            voice: '발주 대기가 몇 건인지 물으면 예전엔 “잠시만요”였는데, 이젠 화면 꺼내기 전에 답이 나와요.',
            voiceBy: '여성의류 A사 물류 팀장',
            visual: 'orders',
            accent: 'cyan'
        },
        {
            kicker: 'TIP 05 · 재고',
            title: '품절은 사고가 아니라\n미리 막는 경보',
            punch: '안전재고 기준 이하 SKU를 즉시 적색 알림.\n채널 재고를 따로 열어보지 않아도 됩니다.',
            hook: '통합 재고 + 자동 알림으로 기회손실을 줄입니다.',
            voice: '히트 SKU가 빠져서 광고비 날린 적이 한두 번이 아니에요. 경보 보고 선발주하는 루틴이 생겼습니다.',
            voiceBy: '코스메틱 D사 재고 담당',
            visual: 'inventory',
            accent: 'rose'
        },
        {
            kicker: 'TIP 06 · CRM',
            title: '프로모션을\n감이 아닌 스케줄로',
            punch: '좌측 요약 · 우측 캘린더로 캠페인 일정을 한눈에.\n성과까지 같은 화면에서 이어집니다.',
            hook: '기획 → 실행 → 측정이 끊기지 않는 CRM 루프.',
            voice: '일정은 캘린더에, 성과는 옆에. “그 쿠폰 어땠지?”를 찾을 때 폴더를 안 뒤지게 됐어요.',
            voiceBy: '패션 E사 그로스 마케터',
            visual: 'crm',
            accent: 'violet'
        },
        {
            kicker: 'TIP 07 · AI 수익',
            title: '광고비는 썼는데\n이익은 남았나?',
            punch: '광고 지출 vs 순이익, 채널별 마진율, ROAS.\nAI가 “어디에 깎을지”까지 짚어줍니다.',
            hook: '수익성 분석이 엑셀이 아니라 대시보드가 됩니다.',
            voice: '매출은 올랐는데 통장이 안 늘 때가 있었어요. 광고 대비 순이익이 보이니까 예산 재분배가 빨라졌습니다.',
            voiceBy: '리테일 F사 광고 실무',
            visual: 'profit',
            accent: 'emerald'
        },
        {
            kicker: 'TIP 08 · DataHub',
            title: '오늘의 숫자만이\n전부는 아닙니다',
            punch: '일·주·월·연 누적 DB, 채널 비중, 추이 차트.\n“예전엔 어땠지?”에 바로 답합니다.',
            hook: '원천 적재 데이터를 리포트·보내기까지 연결.',
            voice: '작년 같은 주차랑 비교해달라는 요청에 파일 찾지 않아요. 기간만 바꾸면 표랑 추이가 같이 나와요.',
            voiceBy: '식품 G사 경영지원',
            visual: 'datahub',
            accent: 'indigo'
        },
        {
            kicker: 'TIP 09 · API',
            title: '연동은 한 번,\n동기화는 자동으로',
            punch: '토큰 만료 · 동기화 이력 · 채널별 상태를 모니터링.\n끊김이 생기면 빨간불이 먼저 옵니다.',
            hook: '운영자가 API를 쫓아다니는 시간을 줄입니다.',
            voice: '토큰 만료를 고객 클레임으로 알던 시절이 있었어요. 지금은 빨간불이 먼저 와서 선조치합니다.',
            voiceBy: '홈리빙 H사 IT 담당',
            visual: 'api',
            accent: 'teal'
        },
        {
            kicker: 'TIP 10 · 팀 좌석',
            title: '누가 편집하고\n누가 보기만 하는지',
            punch: '작업 좌석(편집)과 뷰어(읽기 전용)를 구분합니다.\n권한 사고·동시 수정 혼란을 구조로 막습니다.',
            hook: '좌석 수 · 활성 계정 · 역할이 한 화면에서 관리됩니다.',
            voice: '대표는 편집, 디자인은 뷰어로 열어줬어요. 권한 때문에 같은 파일을 왔다 갔다 안 해도 됩니다.',
            voiceBy: '스타트업 I사 운영 리드',
            visual: 'seats',
            accent: 'slate'
        },
        {
            kicker: 'TIP 11 · 자료실',
            title: '계약서·정산본이\n채팅에 묻히지 않게',
            punch: 'Drive 연동 자료실에 태그·검색·버전 흔적이 남습니다.\n“그 파일 어디 있죠?”를 끝냅니다.',
            hook: '운영 문서가 개인 PC가 아니라 팀 공간에 쌓입니다.',
            voice: '정산본을 카톡에서 찾던 시절이 부끄러워요. 지금은 자료실에서 태그로 바로 꺼내요.',
            voiceBy: '문구 J사 경영지원',
            visual: 'archive',
            accent: 'indigo'
        },
        {
            kicker: 'TIP 12 · 커뮤니케이션',
            title: '요청·진행·완료가\n한 스레드에',
            punch: '내부 요청 티켓, 담당자, 우선순위를 한곳에서 추적합니다.\n구두로 사라지던 업무가 기록이 됩니다.',
            hook: 'CS·운영·마케팅이 같은 이슈를 서로 다른 메신저에 남기지 않습니다.',
            voice: '“그거 누가 하기로 했죠?”가 줄었어요. 스레드에 담당이랑 상태가 같이 있어요.',
            voiceBy: '키즈 K사 CS 리드',
            visual: 'comms',
            accent: 'cyan'
        },
        {
            kicker: 'TIP 13 · CLOSE',
            title: '화면을 직접 눌러보면\n말이 더 짧아집니다',
            punch: '지금 보신 장면이 곧 데모 화면입니다.\n체험에서 우리 채널에 맞는지 바로 확인해 보세요.',
            hook: '데모 체험으로 실화면을 확인하거나, 바로 상담을 남겨 주세요.',
            voice: '데모 돌려보고 “우리 채널에도 맞겠네”가 먼저 나왔어요. 도입 미팅이 제품 설명회가 아니더라고요.',
            voiceBy: '셀러 L사 도입 검토',
            visual: 'close',
            accent: 'gold',
            isFinale: true
        }
    ];

    function el(html) {
        var d = document.createElement('div');
        d.innerHTML = html.trim();
        return d.firstChild;
    }

    function visualHtml(type) {
        var map = {
            hook:
                '<div class="otip-mock otip-mock-hook-v2">' +
                '<div class="otip-before">' +
                '<p class="otip-sec-label">BEFORE · 창마다 다른 어제</p>' +
                '<div class="otip-conflict">' +
                '<div><span>Cafe24</span><b>₩2,180만</b></div>' +
                '<div class="clash"><span>쿠팡</span><b>₩2,410만</b><em>합산 불일치</em></div>' +
                '<div><span>스마트스토어</span><b>₩1,960만</b></div>' +
                '<div class="clash"><span>엑셀 수기</span><b>₩6,420만</b><em>또 다름</em></div>' +
                '</div></div>' +
                '<div class="otip-bridge">→ Omnify 단일 커맨드 센터</div>' +
                '<div class="otip-after">' +
                '<p class="otip-sec-label">AFTER · 하나로 맞춘 어제</p>' +
                '<div class="otip-unified-kpi">' +
                '<div><em>통합 매출</em><b>₩6,550만</b><i class="up">▲ 전일비 +8.2%</i></div>' +
                '<div><em>통합 마진</em><b>31.8%</b><i class="up">▲ +1.4%p</i></div>' +
                '<div><em>채널 동기화</em><b>4/4</b><i class="ok">LIVE</i></div>' +
                '</div>' +
                '<p class="otip-hook-tag">회의 시작 = 숫자 다툼 X · 액션 논의 O</p>' +
                '</div></div>',
            home:
                '<div class="otip-mock otip-mock-dash">' +
                '<div class="otip-kpi"><em>금일 매출</em><div class="otip-kpi-row"><b>₩2,480만</b><i class="up">▲12%</i></div></div>' +
                '<div class="otip-kpi"><em>통합 마진</em><div class="otip-kpi-row"><b>31.8%</b><i class="up">▲0.6%p</i></div></div>' +
                '<div class="otip-kpi warn"><em>품절 임박</em><div class="otip-kpi-row"><b>3 SKU</b><i class="down">▲2</i></div></div>' +
                '<div class="otip-kpi"><em>주문</em><div class="otip-kpi-row"><b>1,247</b><i class="up">▲9%</i></div></div>' +
                '</div>',
            briefing:
                '<div class="otip-mock otip-brief-phone">' +
                '<p class="otip-brief-cap">오늘 발송될 브리핑 미리보기 (설정 반영)</p>' +
                '<div class="otip-brief-frame">' +
                '<div class="otip-brief-top"><span class="otip-brief-avatar"></span><b>(주)SAMPLE</b></div>' +
                '<div class="otip-brief-body">' +
                '<div class="otip-brief-card">' +
                '<div class="otip-brief-badge">알림톡 도착</div>' +
                '<div class="otip-brief-inner">' +
                '<p class="k-sub">(주)SAMPLE 데일리 리포트</p>' +
                '<p class="k-head">📊 옴니채널 브리핑</p>' +
                '<p>안녕하세요, <strong>김지현 대표님</strong>!</p>' +
                '<p>어제 전 채널 통합 매출: <strong>₩2,845만</strong> (전일 대비 +8.2%)</p>' +
                '<p>통합 마진율: <strong>31.8%</strong> (목표 30%)</p>' +
                '<p><span class="k-warn">⚠️ 위험 재고 3건</span> · 히트 세럼 잔여 24개</p>' +
                '<p>📋 미처리 발주: <strong>184건</strong></p>' +
                '<p>🔗 API 상태: 전 채널 정상</p>' +
                '<p>📉 쿠팡 ROAS 주의 · 평균 ROAS <strong>3.42x</strong></p>' +
                '<div class="otip-brief-cta">대시보드 바로가기</div>' +
                '</div></div>' +
                '<p class="otip-brief-time">오전 8:30 · 수신 3명 한도</p>' +
                '</div></div></div>',
            orders:
                '<div class="otip-mock otip-mock-orders">' +
                '<div class="otip-ord-head"><span>주문번호</span><span>송장</span><span>상태</span></div>' +
                '<div class="otip-ord-row"><div><b>20260714-938271</b><em>Cafe24 · 블라우스</em></div><code>2345-6789-0123</code><span class="ok">출고완료</span></div>' +
                '<div class="otip-ord-row"><div><b>20260714-938188</b><em>쿠팡 · 데님팬츠</em></div><code>미발급</code><span class="wait">발주대기</span></div>' +
                '<div class="otip-ord-row"><div><b>20260714-937955</b><em>스마트스토어 · 원피스</em></div><code>3910-2245-7781</code><span class="ok">송장전송</span></div>' +
                '<div class="otip-ord-row hot"><div><b>발주 대기 합계</b><em>채널 통합</em></div><code>—</code><span class="hot">184건</span></div>' +
                '</div>',
            inventory:
                '<div class="otip-mock otip-mock-inv-v2">' +
                '<div class="otip-inv-alert">⚠ 안전재고 미만 3건 · 광고 SKU 포함</div>' +
                '<div class="otip-bar-row alert"><span>히트 세럼 50ml</span><div class="otip-bar"><i style="width:24%"></i></div><b class="hot">24</b><em>안전 50</em></div>' +
                '<div class="otip-bar-row alert"><span>선크림 SPF50</span><div class="otip-bar"><i style="width:16%"></i></div><b class="hot">12</b><em>안전 40</em></div>' +
                '<div class="otip-bar-row"><span>토너 250ml</span><div class="otip-bar"><i style="width:62%"></i></div><b>180</b><em>안전 80</em></div>' +
                '<div class="otip-bar-row"><span>클렌징폼 120g</span><div class="otip-bar"><i style="width:74%"></i></div><b>260</b><em>안전 100</em></div>' +
                '<div class="otip-bar-row alert"><span>아이크림 15ml</span><div class="otip-bar"><i style="width:20%"></i></div><b class="hot">18</b><em>안전 35</em></div>' +
                '<div class="otip-inv-foot"><span>채널 재고 합산 반영</span><span class="hot">선발주 추천 3 SKU</span></div>' +
                '</div>',
            crm:
                '<div class="otip-ui otip-ui-crm">' +
                '<div class="otip-ui-bar"><span>프로모션 · CRM</span><span class="otip-ui-tog"><i>월간</i><b>주간</b></span></div>' +
                '<div class="otip-ui-crm-grid">' +
                '<div class="otip-ui-pane">' +
                '<p class="otip-ui-label">진행 중 요약</p>' +
                '<p class="otip-ui-title">7월 여름 시즌 프로모션</p>' +
                '<div class="otip-ui-chips"><span class="on">진행 중</span><span>시즌 세일</span></div>' +
                '<p class="otip-ui-meta">07.10 – 07.15 · 예산 800만</p>' +
                '<p class="otip-ui-label">목표 대비</p>' +
                '<p class="otip-ui-metric">28.5%</p>' +
                '<div class="otip-ui-track"><i style="width:28%"></i></div>' +
                '<p class="otip-ui-meta">발송 8,420 · 전환 1,044 · ROAS 2.9x</p>' +
                '</div>' +
                '<div class="otip-ui-pane">' +
                '<p class="otip-ui-title sm">2026년 7월 스케줄</p>' +
                '<div class="otip-ui-week">' +
                '<div><em>월</em><strong>13</strong></div>' +
                '<div class="today"><em>화</em><strong>14</strong><span class="pill blue">시즌</span><span class="pill green">진행</span></div>' +
                '<div><em>수</em><strong>15</strong></div>' +
                '<div><em>목</em><strong>16</strong><span class="pill purple">기획</span></div>' +
                '</div>' +
                '<div class="otip-ui-event"><b>여름 시즌 프로모션</b><div class="otip-ui-chips"><span class="on">진행 중</span><span>시즌 세일</span></div><p>Cafe24 · 스마트스토어 · 알림톡</p></div>' +
                '<div class="otip-ui-event"><b>이탈 고객 복귀 캠페인</b><div class="otip-ui-chips"><span class="plan">기획 중</span><span>CRM 푸시</span></div><p>07.15 – 07.22 · 알림톡</p></div>' +
                '</div></div>' +
                '<p class="otip-ui-cap">좌측 써머리 · 우측 스케줄 · 상태 칩</p></div>',
            profit:
                '<div class="otip-ui otip-ui-profit">' +
                '<div class="otip-ui-bar"><span>AI 수익성 분석</span><span class="muted">광고 · 마진 · ROAS</span></div>' +
                '<div class="otip-ui-kpis">' +
                '<div><em>순이익</em><b>₩1.82억</b></div>' +
                '<div><em>마진율</em><b class="green">31.8%</b></div>' +
                '<div><em>ROAS</em><b class="blue">3.42x</b></div>' +
                '<div><em>AI 절감</em><b class="amber">₩420만</b></div>' +
                '</div>' +
                '<div class="otip-ui-profit-grid">' +
                '<div class="otip-ui-pane">' +
                '<p class="otip-ui-title sm">광고 지출 vs 순이익</p>' +
                '<div class="otip-ui-legend"><i class="ad"></i>광고 <i class="np"></i>순이익</div>' +
                '<div class="otip-ui-cols">' +
                '<span><i class="ad" style="height:2.4rem"></i><i class="np" style="height:4.2rem"></i></span>' +
                '<span><i class="ad" style="height:3rem"></i><i class="np" style="height:4.8rem"></i></span>' +
                '<span><i class="ad" style="height:2.2rem"></i><i class="np" style="height:3.9rem"></i></span>' +
                '<span><i class="ad" style="height:3.3rem"></i><i class="np" style="height:5.4rem"></i></span>' +
                '<span><i class="ad" style="height:2.7rem"></i><i class="np" style="height:4.5rem"></i></span>' +
                '</div></div>' +
                '<div class="otip-ui-pane">' +
                '<p class="otip-ui-title sm">채널별 마진율</p>' +
                '<div class="otip-ui-mrow"><span>Cafe24</span><div class="otip-ui-track"><i style="width:76%"></i></div><b>38%</b></div>' +
                '<div class="otip-ui-mrow"><span>스토어</span><div class="otip-ui-track"><i class="g" style="width:68%"></i></div><b>34%</b></div>' +
                '<div class="otip-ui-mrow"><span>쿠팡</span><div class="otip-ui-track"><i class="o" style="width:48%"></i></div><b class="hot">24%</b></div>' +
                '<div class="otip-ui-mrow"><span>에이블리</span><div class="otip-ui-track"><i class="p" style="width:64%"></i></div><b>32%</b></div>' +
                '<div class="otip-ui-ai">AI · 메타 예산 15% 재배분 제안</div>' +
                '</div></div>' +
                '<p class="otip-ui-cap">KPI · 이중 차트 · 채널 마진 · AI 인사이트</p></div>',
            datahub:
                '<div class="otip-ui otip-ui-db">' +
                '<div class="otip-ui-bar"><span>누적 데이터 DB</span><span class="otip-ui-tog"><b>일간</b><i>월간</i></span></div>' +
                '<div class="otip-ui-status">Firebase · omni_raw_v2 · <b>1,247,832건</b> · <em>적재 방금 전</em></div>' +
                '<div class="otip-ui-kpis dense">' +
                '<div><em>누적 매출</em><b>₩86.4억</b></div>' +
                '<div><em>총 주문</em><b>482,190</b></div>' +
                '<div><em>객단가</em><b class="blue">₩17.9천</b></div>' +
                '<div><em>평균 마진</em><b class="green">31.2%</b></div>' +
                '</div>' +
                '<div class="otip-ui-db-grid">' +
                '<div class="otip-ui-pane"><p class="otip-ui-title sm">매출 추이</p><div class="otip-ui-spark" aria-hidden="true"></div></div>' +
                '<div class="otip-ui-pane"><p class="otip-ui-title sm">채널 비중</p>' +
                '<div class="otip-ui-share"><span>Cafe24 32%</span><span>스토어 28%</span><span>쿠팡 25%</span><span>기타 15%</span></div></div>' +
                '</div>' +
                '<div class="otip-ui-table">' +
                '<div class="h"><span>기간</span><span>채널</span><span>매출</span><span>마진</span><span>대비</span></div>' +
                '<div><span>07-14</span><span>전체</span><span>₩2,480만</span><span class="green">31.8%</span><span class="blue">▲12%</span></div>' +
                '<div><span>07-13</span><span>전체</span><span>₩2,210만</span><span class="green">30.4%</span><span class="hot">▼3%</span></div>' +
                '</div>' +
                '<p class="otip-ui-cap">적재 상태 · 누적 KPI · 추이/비중 · 원천 집계</p></div>',
            api:
                '<div class="otip-mock otip-mock-api">' +
                '<div class="otip-api-row"><span>Cafe24</span><em class="live">LIVE</em></div>' +
                '<div class="otip-api-row"><span>스마트스토어</span><em class="live">LIVE</em></div>' +
                '<div class="otip-api-row"><span>쿠팡</span><em class="live">LIVE</em></div>' +
                '<div class="otip-api-row"><span>에이블리</span><em class="warn">토큰 주의</em></div>' +
                '</div>',
            seats:
                '<div class="otip-mock otip-mock-seats">' +
                '<div class="otip-seat-kpi"><div><em>작업 좌석</em><b>5 / 5</b></div><div><em>뷰어</em><b>2</b></div><div><em>활성</em><b>7명</b></div></div>' +
                '<div class="otip-seat-row"><span class="av">김</span><div><b>김지현</b><em>대표 · 관리자</em></div><i class="edit">편집</i></div>' +
                '<div class="otip-seat-row"><span class="av">이</span><div><b>이수진</b><em>운영 · 멤버</em></div><i class="edit">편집</i></div>' +
                '<div class="otip-seat-row"><span class="av">박</span><div><b>박민호</b><em>물류 · 멤버</em></div><i class="edit">편집</i></div>' +
                '<div class="otip-seat-row"><span class="av">정</span><div><b>정하늘</b><em>디자인 · 뷰어</em></div><i class="view">뷰어</i></div>' +
                '</div>',
            archive:
                '<div class="otip-mock otip-mock-archive">' +
                '<div class="otip-arch-search">파일명·태그 검색…</div>' +
                '<div class="otip-arch-row"><b>PDF</b><div><strong>2026_07_정산본_v3.pdf</strong><em>#정산 #월마감</em></div><span>어제</span></div>' +
                '<div class="otip-arch-row"><b>XLS</b><div><strong>SKU_안전재고_기준.xlsx</strong><em>#재고 #운영</em></div><span>07.12</span></div>' +
                '<div class="otip-arch-row"><b>DOC</b><div><strong>채널_프로모션_가이드.docx</strong><em>#CRM #가이드</em></div><span>07.10</span></div>' +
                '<div class="otip-arch-row"><b>PDF</b><div><strong>표준_서비스계약서.pdf</strong><em>#계약 #법무</em></div><span>07.08</span></div>' +
                '</div>',
            comms:
                '<div class="otip-mock otip-mock-comms">' +
                '<div class="otip-com-tabs"><b>요청</b><i>진행</i><i>완료</i></div>' +
                '<div class="otip-com-card"><div class="otip-com-top"><strong>쿠팡 송장 지연 건 확인</strong><span class="urgent">긴급</span></div><p>담당 박민호 · 물류 · 오늘 14:00까지</p></div>' +
                '<div class="otip-com-card"><div class="otip-com-top"><strong>시즌 세일 소재 교체</strong><span class="prog">진행</span></div><p>담당 이수진 · 마케팅 · 댓글 3</p></div>' +
                '<div class="otip-com-card"><div class="otip-com-top"><strong>안전재고 기준 수정</strong><span class="done">완료</span></div><p>담당 김지현 · 어제 마감</p></div>' +
                '</div>',
            close:
                '<div class="otip-mock otip-mock-close">' +
                '<p class="otip-close-brand">OMNIFY</p>' +
                '<p class="otip-close-tag">Your Data, Unified.</p>' +
                '<p class="otip-close-cta">데모 체험 · 상담 문의</p>' +
                '</div>'
        };
        return map[type] || '';
    }

    function buildRoot() {
        if (document.getElementById('omnify-tip-root')) return;
        var root = el(
            '<div id="omnify-tip-root" class="otip-root" hidden aria-hidden="true">' +
            '  <div class="otip-backdrop" aria-hidden="true"></div>' +
            '  <div class="otip-stage" role="dialog" aria-modal="true" aria-labelledby="otip-title">' +
            '    <div class="otip-top">' +
            '      <div class="otip-brand"><span class="otip-badge">옴니파이 TIP</span><span class="otip-progress-label" id="otip-step-label"></span></div>' +
            '      <button type="button" class="otip-close" data-otip-close aria-label="닫기">×</button>' +
            '    </div>' +
            '    <div class="otip-progress"><i id="otip-progress-bar"></i></div>' +
            '    <div class="otip-body" id="otip-body"></div>' +
            '    <div class="otip-footer">' +
            '      <button type="button" class="otip-btn ghost" id="otip-prev">이전</button>' +
            '      <div class="otip-dots" id="otip-dots"></div>' +
            '      <button type="button" class="otip-btn primary" id="otip-next">다음 TIP</button>' +
            '    </div>' +
            '  </div>' +
            '</div>'
        );
        document.body.appendChild(root);

        var dots = document.getElementById('otip-dots');
        SLIDES.forEach(function (_, i) {
            var d = document.createElement('button');
            d.type = 'button';
            d.className = 'otip-dot';
            d.setAttribute('aria-label', '슬라이드 ' + (i + 1));
            d.addEventListener('click', function () { go(i); });
            dots.appendChild(d);
        });

        document.getElementById('otip-prev').addEventListener('click', function () { go(state.index - 1); });
        document.getElementById('otip-next').addEventListener('click', function () {
            if (state.index >= SLIDES.length - 1) close();
            else go(state.index + 1);
        });
        root.querySelectorAll('[data-otip-close]').forEach(function (n) {
            n.addEventListener('click', close);
        });
        root.querySelector('.otip-stage').addEventListener('click', function (e) {
            if (e.target.closest('a, button, .otip-cta')) return;
            var rect = e.currentTarget.getBoundingClientRect();
            if (e.clientX > rect.left + rect.width * 0.55) {
                if (state.index >= SLIDES.length - 1) close();
                else go(state.index + 1);
            } else if (e.clientX < rect.left + rect.width * 0.35 && state.index > 0) {
                go(state.index - 1);
            }
        });
    }

    function render() {
        var s = SLIDES[state.index];
        var body = document.getElementById('otip-body');
        var bar = document.getElementById('otip-progress-bar');
        var label = document.getElementById('otip-step-label');
        var next = document.getElementById('otip-next');
        var prev = document.getElementById('otip-prev');
        var pct = ((state.index + 1) / SLIDES.length) * 100;

        label.textContent = (state.index + 1) + ' / ' + SLIDES.length;
        bar.style.width = pct + '%';
        prev.disabled = state.index === 0;
        next.textContent = s.isFinale ? '닫기' : '다음 TIP →';

        document.querySelectorAll('.otip-dot').forEach(function (d, i) {
            d.classList.toggle('active', i === state.index);
        });

        var ctas = s.isFinale
            ? '<div class="otip-cta">' +
              '<a class="otip-btn primary" href="demo-dashboard.html" target="_blank" rel="noopener noreferrer">대시보드 체험 열기</a>' +
              '<button type="button" class="otip-btn ghost" data-otip-contact>상담 문의로 이동</button>' +
              '</div>'
            : '';

        var voice = s.voice
            ? '<blockquote class="otip-voice">' +
              '<p>“' + s.voice + '”</p>' +
              '<footer>' + (s.voiceBy || 'Omnify 사용 고객') + '</footer>' +
              '</blockquote>'
            : '';

        body.innerHTML =
            '<div class="otip-slide accent-' + s.accent + '">' +
            '  <div class="otip-copy">' +
            '    <p class="otip-kicker">' + s.kicker + '</p>' +
            '    <h2 id="otip-title" class="otip-title">' + s.title.replace(/\n/g, '<br>') + '</h2>' +
            '    <p class="otip-punch">' + s.punch.replace(/\n/g, '<br>') + '</p>' +
            '    <p class="otip-hook">' + s.hook + '</p>' +
            ctas +
            '  </div>' +
            '  <div class="otip-visual">' + visualHtml(s.visual) + '</div>' +
            voice +
            '</div>';

        var contactBtn = body.querySelector('[data-otip-contact]');
        if (contactBtn) {
            contactBtn.addEventListener('click', function () {
                close();
                var trigger = document.querySelector('.page-tab-trigger[data-page-tab="contact"]');
                if (trigger) trigger.click();
                else if (location) location.hash = 'contact';
            });
        }

        var slide = body.querySelector('.otip-slide');
        if (slide) {
            slide.classList.remove('in');
            void slide.offsetWidth;
            slide.classList.add('in');
        }
    }

    function clearTimer() {
        if (state.timer) {
            clearTimeout(state.timer);
            state.timer = null;
        }
    }

    function scheduleAuto() {
        clearTimer();
        if (!AUTO_MS || !state.open) return;
        state.timer = setTimeout(function () {
            if (state.index >= SLIDES.length - 1) return;
            go(state.index + 1);
        }, AUTO_MS);
    }

    function go(i) {
        if (i < 0 || i >= SLIDES.length) return;
        state.index = i;
        render();
        scheduleAuto();
    }

    function open(startAt) {
        buildRoot();
        state.open = true;
        state.index = typeof startAt === 'number' ? startAt : 0;
        var root = document.getElementById('omnify-tip-root');
        root.hidden = false;
        root.setAttribute('aria-hidden', 'false');
        document.body.classList.add('otip-open');
        render();
        scheduleAuto();
        try { history.replaceState(null, '', '#omnify-tip'); } catch (e) { /* ignore */ }
    }

    function close() {
        clearTimer();
        state.open = false;
        var root = document.getElementById('omnify-tip-root');
        if (root) {
            root.hidden = true;
            root.setAttribute('aria-hidden', 'true');
        }
        document.body.classList.remove('otip-open');
        if ((location.hash || '').toLowerCase() === '#omnify-tip') {
            try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* ignore */ }
        }
    }

    function onKey(e) {
        if (!state.open) return;
        if (e.key === 'Escape') { e.preventDefault(); close(); }
        else if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            if (state.index >= SLIDES.length - 1) close();
            else go(state.index + 1);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            go(state.index - 1);
        }
    }

    function bindLaunchers() {
        document.querySelectorAll('[data-omnify-tip]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                open(0);
            });
        });
    }

    function init() {
        buildRoot();
        bindLaunchers();
        document.addEventListener('keydown', onKey);
        if ((location.hash || '').toLowerCase() === '#omnify-tip') open(0);
        window.addEventListener('hashchange', function () {
            if ((location.hash || '').toLowerCase() === '#omnify-tip') open(0);
        });
    }

    global.OmnifyTip = { open: open, close: close, init: init };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})(typeof window !== 'undefined' ? window : this);
