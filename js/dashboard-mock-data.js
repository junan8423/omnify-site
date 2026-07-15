/**
 * Omnify 데모 대시보드 — 현실감 있는 목업 데이터셋
 * dashboard-app.js 로드 후 적용 (hydrateAppDemo 직전)
 */
(function (global) {
    'use strict';

    var DEMO_DATE = '2026-07-10';

    var PRODUCTS = [
        { sku: 'SKU-COS-001', name: '코스메 히트 세럼 50ml', price: 45000 },
        { sku: 'SKU-COS-002', name: '비건 수분 크림 100ml', price: 38000 },
        { sku: 'SKU-COS-003', name: '시카 리페어 크림 50ml', price: 42000 },
        { sku: 'SKU-COS-004', name: '글로우 업 세럼 30ml', price: 52000 },
        { sku: 'SKU-COS-005', name: '선크림 SPF50+ 60ml', price: 32000 },
        { sku: 'SKU-COS-006', name: '비건 히알루론산 토너 200ml', price: 28000 },
        { sku: 'SKU-COS-007', name: '비타민C 앰플 20ml', price: 48000 },
        { sku: 'SKU-COS-008', name: '클렌징 폼 150ml 2개입', price: 24000 },
        { sku: 'SKU-COS-009', name: '수분 마스크팩 10매', price: 19000 },
        { sku: 'SKU-COS-010', name: '옴므 올인원 로션 200ml', price: 29000 },
        { sku: 'SKU-COS-011', name: '레티놀 나이트 크림 50ml', price: 56000 },
        { sku: 'SKU-COS-012', name: '립 플럼핑 틴트 #03', price: 18000 },
        { sku: 'SKU-COS-013', name: '바디 로션 화이트머스크 300ml', price: 22000 },
        { sku: 'SKU-COS-014', name: '아이크림 15ml', price: 36000 },
        { sku: 'SKU-COS-015', name: '미셀라 클렌징 워터 400ml', price: 21000 },
        { sku: 'SKU-COS-016', name: '시카 패드 60매', price: 27000 },
        { sku: 'SKU-COS-017', name: '헤어 에센스 미스트 120ml', price: 25000 },
        { sku: 'SKU-COS-018', name: '네일 케어 세트', price: 15000 },
        { sku: 'SKU-COS-019', name: '선스틱 SPF50+ 19g', price: 26000 },
        { sku: 'SKU-COS-020', name: '핸드크림 3종 기프트세트', price: 34000 },
        { sku: 'SKU-SET-101', name: '시카 리페어 크림 기획세트', price: 62000 },
        { sku: 'SKU-SET-102', name: '여름 루틴 3종 세트', price: 78000 },
        { sku: 'SKU-SET-103', name: '히트 세럼 + 크림 듀오', price: 69000 }
    ];

    var CHANNELS = [
        { id: 'cafe24', prefix: 'C24', weight: 32 },
        { id: 'smartstore', prefix: 'NS', weight: 28 },
        { id: 'coupang', prefix: 'CP', weight: 25 },
        { id: 'ably', prefix: 'AB', weight: 15 }
    ];

    function pad(n, w) {
        var s = String(n);
        while (s.length < (w || 2)) s = '0' + s;
        return s;
    }

    function pickChannel(i) {
        var r = (i * 37 + 11) % 100;
        var acc = 0;
        for (var c = 0; c < CHANNELS.length; c++) {
            acc += CHANNELS[c].weight;
            if (r < acc) return CHANNELS[c];
        }
        return CHANNELS[0];
    }

    function buildOrders(count) {
        var list = [];
        var seq = 892;
        for (var i = 0; i < count; i++) {
            var ch = pickChannel(i);
            var p1 = PRODUCTS[i % PRODUCTS.length];
            var extras = (i % 5 === 0) ? 2 : (i % 3 === 0) ? 1 : 0;
            var product = extras
                ? (p1.name + ' 외 ' + extras + '건')
                : p1.name;
            var amount = p1.price + extras * (18000 + (i % 7) * 1000) - (i % 4) * 500;
            var h = 22 - Math.floor(i / 8);
            var m = 58 - (i % 8) * 7;
            var s = (14 + i * 13) % 60;
            if (m < 0) { h -= 1; m += 60; }
            if (h < 8) h = 8 + (i % 4);
            var statusRoll = i % 10;
            var status = statusRoll < 2 ? 'pending' : statusRoll < 4 ? 'processing' : 'shipped';
            var idNum = pad(seq - i, 4);
            list.push({
                id: 'ORD-20260710-' + idNum,
                channel: ch.id,
                product: product,
                productTitle: product,
                amount: amount,
                status: status,
                time: pad(h) + ':' + pad(m) + ':' + pad(s),
                sourceOrderId: ch.prefix + '-' + idNum,
                buyerName: ['김*현', '박*연', '이*호', '최*지', '정*우', '한*영'][i % 6]
            });
        }
        return list;
    }

    function buildInventory() {
        return [
            { sku: 'SKU-COS-001', name: '코스메 히트 세럼 50ml', qtyWms: 24, qtyByChannel: { cafe24: 10, smartstore: 8, coupang: 4, ably: 2 }, safety: 50 },
            { sku: 'SKU-COS-002', name: '비건 수분 크림 100ml', qtyWms: 850, qtyByChannel: { cafe24: 300, smartstore: 280, coupang: 190, ably: 90 }, safety: 100 },
            { sku: 'SKU-COS-003', name: '시카 리페어 크림 50ml', qtyWms: 42, qtyByChannel: { cafe24: 15, smartstore: 12, coupang: 10, ably: 5 }, safety: 60 },
            { sku: 'SKU-COS-004', name: '글로우 업 세럼 30ml', qtyWms: 320, qtyByChannel: { cafe24: 100, smartstore: 90, coupang: 80, ably: 50 }, safety: 80 },
            { sku: 'SKU-COS-005', name: '선크림 SPF50+ 60ml', qtyWms: 156, qtyByChannel: { cafe24: 50, smartstore: 45, coupang: 40, ably: 21 }, safety: 70 },
            { sku: 'SKU-COS-006', name: '비건 히알루론산 토너 200ml', qtyWms: 512, qtyByChannel: { cafe24: 180, smartstore: 160, coupang: 120, ably: 52 }, safety: 90 },
            { sku: 'SKU-COS-007', name: '비타민C 앰플 20ml', qtyWms: 18, qtyByChannel: { cafe24: 6, smartstore: 5, coupang: 4, ably: 3 }, safety: 40 },
            { sku: 'SKU-COS-008', name: '클렌징 폼 150ml 2개입', qtyWms: 440, qtyByChannel: { cafe24: 160, smartstore: 140, coupang: 100, ably: 50 }, safety: 80 },
            { sku: 'SKU-COS-009', name: '수분 마스크팩 10매', qtyWms: 280, qtyByChannel: { cafe24: 100, smartstore: 90, coupang: 60, ably: 30 }, safety: 100 },
            { sku: 'SKU-COS-010', name: '옴므 올인원 로션 200ml', qtyWms: 210, qtyByChannel: { cafe24: 70, smartstore: 65, coupang: 50, ably: 25 }, safety: 60 },
            { sku: 'SKU-COS-011', name: '레티놀 나이트 크림 50ml', qtyWms: 76, qtyByChannel: { cafe24: 28, smartstore: 22, coupang: 18, ably: 8 }, safety: 55 },
            { sku: 'SKU-COS-012', name: '립 플럼핑 틴트 #03', qtyWms: 9, qtyByChannel: { cafe24: 3, smartstore: 3, coupang: 2, ably: 1 }, safety: 40 },
            { sku: 'SKU-COS-013', name: '바디 로션 화이트머스크 300ml', qtyWms: 380, qtyByChannel: { cafe24: 130, smartstore: 120, coupang: 90, ably: 40 }, safety: 70 },
            { sku: 'SKU-COS-014', name: '아이크림 15ml', qtyWms: 55, qtyByChannel: { cafe24: 20, smartstore: 15, coupang: 12, ably: 8 }, safety: 50 },
            { sku: 'SKU-COS-015', name: '미셀라 클렌징 워터 400ml', qtyWms: 620, qtyByChannel: { cafe24: 220, smartstore: 190, coupang: 150, ably: 60 }, safety: 90 },
            { sku: 'SKU-COS-016', name: '시카 패드 60매', qtyWms: 140, qtyByChannel: { cafe24: 50, smartstore: 40, coupang: 35, ably: 15 }, safety: 80 },
            { sku: 'SKU-COS-017', name: '헤어 에센스 미스트 120ml', qtyWms: 260, qtyByChannel: { cafe24: 90, smartstore: 80, coupang: 60, ably: 30 }, safety: 50 },
            { sku: 'SKU-COS-019', name: '선스틱 SPF50+ 19g', qtyWms: 118, qtyByChannel: { cafe24: 40, smartstore: 35, coupang: 28, ably: 15 }, safety: 55 },
            { sku: 'SKU-SET-101', name: '시카 리페어 크림 기획세트', qtyWms: 112, qtyByChannel: { cafe24: 40, smartstore: 35, coupang: 25, ably: 12 }, safety: 40 },
            { sku: 'SKU-SET-102', name: '여름 루틴 3종 세트', qtyWms: 33, qtyByChannel: { cafe24: 12, smartstore: 10, coupang: 8, ably: 3 }, safety: 45 }
        ];
    }

    function buildNotifications() {
        return [
            { id: 'n1', type: 'danger', title: '품절 임박 경보', desc: '코스메 히트 세럼 50ml — 잔여 24개 (안전재고 50 미만)', time: '3분 전', action: 'view-inventory' },
            { id: 'n2', type: 'danger', title: '재고 위험 · 립 틴트', desc: '립 플럼핑 틴트 #03 — 잔여 9개 / 안전 40', time: '12분 전', action: 'view-inventory' },
            { id: 'n3', type: 'warning', title: 'API 토큰 만료 예정', desc: '에이블리 OAuth 토큰 — 7일 후 만료 (자동 갱신 예약됨)', time: '1시간 전', action: 'view-api' },
            { id: 'n4', type: 'success', title: '아침 브리핑 발송 완료', desc: '카카오톡 데일리 리포트 — 어제 마진율 31.8% · 위험재고 6건 전달', time: '오늘 08:30', action: 'view-briefing' },
            { id: 'n5', type: 'warning', title: '발주 대기 알림', desc: '에이블리·Cafe24 송장 전송 대기 — 184건 미처리', time: '10:15', action: 'view-orders' },
            { id: 'n6', type: 'warning', title: '마진율 하락 감지', desc: '쿠팡 채널 마진율 28.1% → 24.3% (광고비 증가)', time: '09:42', action: 'view-profit' },
            { id: 'n7', type: 'info', title: '프로모션 KPI 업데이트', desc: '여름 시즌오프 알림톡 — 목표 대비 매출 92% 달성', time: '09:10', action: 'view-crm' },
            { id: 'n8', type: 'success', title: '동기화 완료', desc: '전 채널 주문·재고 동기화 — 1,248건 수집 (42초)', time: '08:05', action: 'view-api' },
            { id: 'n9', type: 'info', title: '신규 요청서', desc: '김지현 → 박서연 · 에이블리 송장 184건 일괄 전송', time: '어제 16:20', action: 'view-comms' },
            { id: 'n10', type: 'warning', title: '비타민C 앰플 주의', desc: '잔여 18개 / 안전재고 40 — 주말 프로모션 대비 발주 권고', time: '어제 14:05', action: 'view-inventory' },
            { id: 'n11', type: 'info', title: '주간 리포트 준비됨', desc: '7월 2주차 옴니채널 매출 PDF · 자료실에 업로드', time: '어제 11:30', action: 'view-archive' },
            { id: 'n12', type: 'success', title: 'A/B 테스트 종료', desc: '알림톡 A안 전환율 4.8%로 우수 — 캠페인에 반영 완료', time: '2일 전', action: 'view-crm' }
        ];
    }

    function buildActivityLogs() {
        return [
            { id: 1, userId: 'kim', action: '로그인', category: 'auth', type: 'success', detail: '대시보드 로그인 성공', meta: 'IP 211.234.**.45 · Chrome', time: '23:15:22', ago: '5분 전', date: DEMO_DATE },
            { id: 2, userId: 'park', action: '원천 처리 안내', category: 'orders', type: 'info', detail: '에이블리 발주 대기 12건 — 사방넷/채널에서 처리 안내', meta: 'ORD-BATCH-0710-12', time: '23:08:14', ago: '12분 전', date: DEMO_DATE },
            { id: 3, userId: 'lee', action: 'CRM 캠페인', category: 'crm', type: 'info', detail: '여름 시즌 오프 알림톡 캠페인 KPI 갱신', meta: '타겟 8,420명 · 전환 412', time: '22:54:03', ago: '26분 전', date: DEMO_DATE },
            { id: 4, userId: 'choi', action: '안전재고 경보값', category: 'inventory', type: 'info', detail: '코스메 히트 세럼 Omnify 경보 기준 50→60 (원천 수량 변경 없음)', meta: 'SKU-COS-001', time: '22:41:55', ago: '39분 전', date: DEMO_DATE },
            { id: 5, userId: 'kim', action: '리포트 다운로드', category: 'report', type: 'info', detail: '7월 2주차 옴니채널 매출 PDF 생성', meta: '파일 2.8MB', time: '22:30:00', ago: '51분 전', date: DEMO_DATE },
            { id: 6, userId: 'park', action: '수동 동기화', category: 'sync', type: 'success', detail: '전 채널 주문 수동 동기화 실행', meta: '1,248건 수집 완료', time: '21:15:33', ago: '2시간 전', date: DEMO_DATE },
            { id: 7, userId: 'lee', action: '광고 예산 변경', category: 'marketing', type: 'warning', detail: 'Meta Ads 일 예산 ₩50만 → ₩65만 증액', meta: 'ROAS 3.2x 기준', time: '18:22:10', ago: '5시간 전', date: DEMO_DATE },
            { id: 8, userId: 'choi', action: '고객 응대', category: 'cs', type: 'info', detail: '스마트스토어 문의 7건 · 쿠팡 4건 처리 완료', meta: '평균 응답 3.8분', time: '17:05:44', ago: '6시간 전', date: DEMO_DATE },
            { id: 9, userId: 'kim', action: 'API 설정', category: 'system', type: 'danger', detail: '에이블리 OAuth 토큰 수동 갱신 시도', meta: '자동 토큰 갱신 예약', time: '15:30:00', ago: '8시간 전', date: DEMO_DATE },
            { id: 10, userId: 'park', action: '재고 실사 반영', category: 'inventory', type: 'info', detail: '선크림·선스틱 채널 재고 스냅샷 대조 완료', meta: '차이 0건', time: '14:12:40', ago: '9시간 전', date: DEMO_DATE },
            { id: 11, userId: 'lee', action: '프로모션 기획', category: 'crm', type: 'info', detail: '주말 플래시 세일 기획안 등록 (7/12–7/13)', meta: '목표 매출 ₩4,800만', time: '13:05:18', ago: '10시간 전', date: DEMO_DATE },
            { id: 12, userId: 'jung', action: '정산 대사', category: 'report', type: 'info', detail: '쿠팡 6월 정산 대사표 업로드', meta: '자료실 · xlsx 1.6MB', time: '11:40:02', ago: '12시간 전', date: DEMO_DATE },
            { id: 13, userId: 'park', action: '로그인', category: 'auth', type: 'success', detail: '대시보드 로그인 성공', meta: 'IP 175.223.**.12 · Safari', time: '09:02:18', ago: '14시간 전', date: DEMO_DATE },
            { id: 14, userId: 'lee', action: '로그인', category: 'auth', type: 'success', detail: '대시보드 로그인 성공', meta: 'IP 121.132.**.88 · Chrome', time: '08:45:00', ago: '14시간 전', date: DEMO_DATE },
            { id: 15, userId: 'choi', action: '로그인', category: 'auth', type: 'success', detail: '대시보드 로그인 성공', meta: 'IP 58.224.**.03 · Edge', time: '08:38:11', ago: '15시간 전', date: DEMO_DATE },
            { id: 16, userId: 'kim', action: '브리핑 확인', category: 'system', type: 'info', detail: '데일리 카카오 브리핑 수신 · 마진·위험재고 확인', meta: '알림톡 · 김지현', time: '08:31:05', ago: '15시간 전', date: DEMO_DATE },
            { id: 17, userId: 'park', action: '송장 배치', category: 'orders', type: 'warning', detail: '에이블리 송장 64건 원천 전송 후 미러 갱신', meta: '잔여 120건', time: '08:18:44', ago: '15시간 전', date: DEMO_DATE },
            { id: 18, userId: 'kim', action: '브리핑 설정', category: 'system', type: 'info', detail: '데일리 카카오 브리핑 항목 2개 추가', meta: 'AI 예상 매출 · ROAS 알림', time: '16:20', ago: '어제', date: '2026-07-09' },
            { id: 19, userId: 'lee', action: 'A/B 결과 기록', category: 'crm', type: 'success', detail: '알림톡 A/B — A안 우수 (전환 4.8% vs 3.1%)', meta: '캠페인 PRM-0710-AB', time: '15:05', ago: '어제', date: '2026-07-09' },
            { id: 20, userId: 'jung', action: '마진 리뷰', category: 'report', type: 'warning', detail: '쿠팡 광고비 비중 상승으로 순마진 점검', meta: '마진 24.3%', time: '14:22', ago: '어제', date: '2026-07-09' },
            { id: 21, userId: 'choi', action: 'CS 템플릿', category: 'cs', type: 'info', detail: '시즌오프 반품·교환 응대 템플릿 초안 작성', meta: '3종', time: '11:50', ago: '어제', date: '2026-07-09' },
            { id: 22, userId: 'park', action: '재고 발주 요청', category: 'inventory', type: 'danger', detail: '히트 세럼·비타민C 앰플 긴급 발주 요청서 작성', meta: '리드타임 5일', time: '10:15', ago: '어제', date: '2026-07-09' },
            { id: 23, userId: 'kim', action: '팀 초대', category: 'auth', type: 'info', detail: '정하윤(재무) 멤버 좌석 활성화', meta: 'seat · member', time: '09:40', ago: '어제', date: '2026-07-09' },
            { id: 24, userId: 'lee', action: '광고 입찰', category: 'marketing', type: 'info', detail: '네이버 SA 키워드 15개 CPC 조정', meta: '평균 CPC -8%', time: '18:30', ago: '2일 전', date: '2026-07-08' },
            { id: 25, userId: 'park', action: '채널 점검', category: 'sync', type: 'success', detail: 'Cafe24 Enterprise Webhook 수신 지연 해소 확인', meta: '지연 0건', time: '16:10', ago: '2일 전', date: '2026-07-08' },
            { id: 26, userId: 'choi', action: '고객 응대', category: 'cs', type: 'info', detail: '배송지연 문의 12건 처리 · 안내톡 발송', meta: '평균 응답 5분', time: '14:00', ago: '2일 전', date: '2026-07-08' },
            { id: 27, userId: 'jung', action: '리포트 공유', category: 'report', type: 'info', detail: '6월 손익 요약 드라이브 공유', meta: '경영회의용', time: '11:20', ago: '2일 전', date: '2026-07-08' },
            { id: 28, userId: 'kim', action: '설정 변경', category: 'system', type: 'info', detail: '월 매출 KPI 목표 8.5억 유지 · 일 주문 목표 1,500', meta: '설정 > KPI', time: '09:05', ago: '2일 전', date: '2026-07-08' }
        ];
    }

    function buildSyncHistory() {
        return [
            { time: '23:08:05', channel: 'Cafe24', icon: '☁️', job: '주문 · 재고 동기화', status: 'success', records: 428, duration: '42초' },
            { time: '23:08:12', channel: '스마트스토어', icon: '🛒', job: '주문 동기화', status: 'success', records: 312, duration: '38초' },
            { time: '23:07:55', channel: '쿠팡', icon: '📦', job: '주문 · 정산 동기화', status: 'success', records: 287, duration: '51초' },
            { time: '23:07:40', channel: '에이블리', icon: '👗', job: '주문 · 송장 동기화', status: 'warn', records: 184, duration: '1m 12s', note: '송장 대기 184건' },
            { time: '22:38:02', channel: 'Cafe24', icon: '☁️', job: '상품·재고 스냅샷', status: 'success', records: 128, duration: '19초' },
            { time: '22:08:11', channel: '스마트스토어', icon: '🛒', job: '문의(Q&A) 동기화', status: 'success', records: 47, duration: '12초' },
            { time: '21:35:44', channel: '에이블리', icon: '👗', job: 'OAuth 토큰 갱신', status: 'success', records: 1, duration: '2초' },
            { time: '20:05:18', channel: '쿠팡', icon: '📦', job: '재고 스냅샷', status: 'success', records: 118, duration: '27초' },
            { time: '18:02:33', channel: 'Cafe24', icon: '☁️', job: '주문 · 재고 동기화', status: 'success', records: 415, duration: '39초' },
            { time: '15:30:00', channel: '에이블리', icon: '👗', job: 'OAuth 수동 갱신', status: 'warn', records: 1, duration: '4초', note: '만료 임박 · 자동 예약 유지' },
            { time: '12:08:20', channel: '전체', icon: '🔄', job: '반나절 배치 동기화', status: 'success', records: 986, duration: '2m 08s' },
            { time: '08:30:00', channel: '전체', icon: '💬', job: '데일리 브리핑 발송', status: 'success', records: 1, duration: '3초' },
            { time: '08:05:11', channel: '전체', icon: '🔄', job: '아침 풀 동기화', status: 'success', records: 1248, duration: '2m 41s' },
            { time: '어제 23:10', channel: '쿠팡', icon: '📦', job: '정산 대사', status: 'success', records: 1, duration: '1m 05s' },
            { time: '어제 18:22', channel: '스마트스토어', icon: '🛒', job: '주문 동기화', status: 'success', records: 298, duration: '35초' },
            { time: '어제 09:00', channel: '전체', icon: '💬', job: '데일리 브리핑 발송', status: 'success', records: 1, duration: '3초' }
        ];
    }

    function buildApiChannels() {
        return [
            { name: 'Cafe24 Enterprise', icon: '☁️', status: 'live', tokenExpiry: '45일 후', lastSync: '1분 전', orders: 428 },
            { name: '네이버 스마트스토어', icon: '🛒', status: 'live', tokenExpiry: '22일 후', lastSync: '2분 전', orders: 312 },
            { name: '쿠팡 Wing', icon: '📦', status: 'live', tokenExpiry: '18일 후', lastSync: '3분 전', orders: 287 },
            { name: '에이블리', icon: '👗', status: 'warn', tokenExpiry: '7일 후', lastSync: '5분 전', orders: 221 }
        ];
    }

    function buildTeamMembers() {
        return [
            { id: 'kim', name: '김지현', role: '대표', email: 'kim@sample.co.kr', avatar: '김', color: 'from-primary to-accent', seatType: 'admin', active: true },
            { id: 'park', name: '박서연', role: '운영팀', email: 'park@sample.co.kr', avatar: '박', color: 'from-emerald-500 to-teal-500', seatType: 'member', active: true },
            { id: 'lee', name: '이준호', role: '마케팅', email: 'lee@sample.co.kr', avatar: '이', color: 'from-violet-500 to-purple-500', seatType: 'member', active: true },
            { id: 'choi', name: '최민지', role: 'CS팀', email: 'choi@sample.co.kr', avatar: '최', color: 'from-orange-500 to-amber-500', seatType: 'member', active: true },
            { id: 'jung', name: '정하윤', role: '재무', email: 'jung@sample.co.kr', avatar: '정', color: 'from-sky-500 to-blue-600', seatType: 'viewer', active: true }
        ];
    }

    function buildArchiveDefaults() {
        return [
            { id: 'f1', name: '2026_하반기_사업계획서.pdf', category: 'report', ext: 'pdf', size: 2457600, tags: ['전략', '2026'], pinned: true, uploadedBy: 'kim', uploadedAt: '2026-07-01', downloads: 12, version: 'v2.1', mockContent: '(주)SAMPLE 2026 하반기 사업계획서\n\n1. 옴니채널 매출 목표: 8.5억\n2. 신규 채널: 지그재그 검토\n3. 마진율 목표: 32%' },
            { id: 'f2', name: '7월_2주차_옴니채널_매출리포트.xlsx', category: 'report', ext: 'xlsx', size: 2143200, tags: ['매출', '7월'], pinned: true, uploadedBy: 'park', uploadedAt: '2026-07-08', downloads: 34, version: 'v1.2', mockContent: 'Date,Channel,Revenue,Orders\n2026-07-07,Cafe24,4120000,468\n2026-07-07,Smartstore,2980000,341\n2026-07-07,Coupang,2650000,302\n2026-07-07,Ably,1180000,156' },
            { id: 'f3', name: '6월_손익_요약_경영회의.pdf', category: 'report', ext: 'pdf', size: 1872000, tags: ['손익', '경영'], pinned: true, uploadedBy: 'jung', uploadedAt: '2026-07-03', downloads: 19, version: 'v1.0', mockContent: '6월 순매출 6.12억 · 총마진 31.4% · 광고비 0.84억' },
            { id: 'f4', name: '상품촬영_가이드라인.pdf', category: 'marketing', ext: 'pdf', size: 5242880, tags: ['촬영', '브랜드'], pinned: false, uploadedBy: 'lee', uploadedAt: '2026-06-15', downloads: 8, version: 'v3.0', mockContent: '상품 촬영 가이드라인\n- 배경: 화이트/뉴트럴\n- 해상도: 2000x2000 이상' },
            { id: 'f5', name: '재고실사_체크리스트_0705.xlsx', category: 'inventory', ext: 'xlsx', size: 712000, tags: ['재고', '사방넷'], pinned: false, uploadedBy: 'park', uploadedAt: '2026-07-05', downloads: 21, version: 'v1.3', mockContent: 'SKU,Name,Expected,Actual,Diff\nSKU-COS-001,히트세럼,24,24,0\nSKU-COS-007,비타C앰플,18,18,0\nSKU-COS-012,립틴트,9,9,0' },
            { id: 'f6', name: 'Cafe24_API_연동매뉴얼.pdf', category: 'manual', ext: 'pdf', size: 3145728, tags: ['API', 'Cafe24'], pinned: false, uploadedBy: 'kim', uploadedAt: '2026-05-20', downloads: 6, version: 'v1.5', mockContent: 'Cafe24 Enterprise API 연동 매뉴얼\nOAuth 2.0 인증 절차...' },
            { id: 'f7', name: '여름시즌_알림톡_템플릿.zip', category: 'marketing', ext: 'zip', size: 8388608, tags: ['CRM', '알림톡'], pinned: false, uploadedBy: 'lee', uploadedAt: '2026-06-28', downloads: 11, version: 'v1.1', mockContent: '여름시즌 알림톡 템플릿 패키지 (목업)' },
            { id: 'f8', name: '쿠팡_6월_정산대사.xlsx', category: 'report', ext: 'xlsx', size: 1650000, tags: ['정산', '쿠팡'], pinned: false, uploadedBy: 'jung', uploadedAt: '2026-07-09', downloads: 7, version: 'v1.0', mockContent: 'Settlement,Amount,Fee,Net\n2026-06,265400000,31848000,233552000' },
            { id: 'f9', name: 'CS_시즌오프_응대템플릿.docx', category: 'manual', ext: 'docx', size: 420000, tags: ['CS', '템플릿'], pinned: false, uploadedBy: 'choi', uploadedAt: '2026-07-09', downloads: 5, version: 'v0.9', mockContent: '반품·교환·배송지연 응대 문구 3종' },
            { id: 'f10', name: '주말플래시_크리에이티브.zip', category: 'marketing', ext: 'zip', size: 12582912, tags: ['광고', '배너'], pinned: false, uploadedBy: 'lee', uploadedAt: '2026-07-10', downloads: 3, version: 'v1.0', mockContent: '주말 플래시 배너·상세컷 세트' },
            { id: 'f11', name: '사방넷_WMS_운영가이드.pdf', category: 'manual', ext: 'pdf', size: 2780000, tags: ['WMS', '사방넷'], pinned: false, uploadedBy: 'park', uploadedAt: '2026-06-02', downloads: 14, version: 'v2.0', mockContent: '사방넷 읽기 연동 · 실재고 기준 경보' },
            { id: 'f12', name: '브랜드_톤앤매너_가이드.pdf', category: 'marketing', ext: 'pdf', size: 4560000, tags: ['브랜드'], pinned: false, uploadedBy: 'lee', uploadedAt: '2026-05-08', downloads: 22, version: 'v4.1', mockContent: 'SAMPLE 코스메틱 톤앤매너 · 카피 가이드' }
        ];
    }

    function buildCommsDefaults() {
        return {
            threads: [
                { id: 't1', type: 'request', from: 'kim', to: 'park', dept: '운영팀', title: '에이블리 송장 184건 일괄 전송', body: '에이블리 채널 미처리 송장 184건 금일 중 일괄 전송 부탁드립니다. Wing/사방넷 연동 확인 후 처리해주세요. 우선순위는 오늘 오전 입고분입니다.', status: 'progress', priority: 'high', due: DEMO_DATE, createdAt: DEMO_DATE + ' 09:15', unread: true, replies: [
                    { id: 'r1', userId: 'park', text: '확인했습니다. 14:00까지 120건 처리 완료 예정입니다.', time: DEMO_DATE + ' 09:32' },
                    { id: 'r2', userId: 'kim', text: '감사합니다. 나머지는 내일 오전까지 진행해주세요.', time: DEMO_DATE + ' 10:05' },
                    { id: 'r2b', userId: 'park', text: 'Cafe24 대기분도 같이 묶어 처리 중입니다. 진행률 68%입니다.', time: DEMO_DATE + ' 15:40' }
                ]},
                { id: 't2', type: 'request', from: 'lee', to: 'choi', dept: 'CS팀', title: '스마트스토어 CS 템플릿 업데이트', body: '여름 시즌 오프·주말 플래시 관련 CS 응대 템플릿 3종 업데이트 필요합니다. 자료실 가이드 참고 부탁드립니다.', status: 'request', priority: 'normal', due: '2026-07-11', createdAt: DEMO_DATE + ' 11:20', unread: true, replies: [] },
                { id: 't3', type: 'agenda', from: 'park', to: 'all', dept: '운영팀', title: '주간 재고 실사 결과 공유', body: '금주 재고 실사 결과를 자료실에 업로드했습니다. 품절 임박 6건(히트세럼·비타C·립틴트 등) 확인 — 긴급 발주 요청 드립니다.', status: 'done', priority: 'normal', due: '2026-07-09', createdAt: '2026-07-09 16:45', unread: false, replies: [
                    { id: 'r3', userId: 'kim', text: '발주 승인했습니다. Cafe24·쿠팡 우선 보충 진행해주세요.', time: '2026-07-09 17:10' },
                    { id: 'r3b', userId: 'park', text: '발주서 사방넷 반영 완료. ETA 7/15입니다.', time: '2026-07-09 18:02' }
                ]},
                { id: 't4', type: 'request', from: 'kim', to: 'lee', dept: '마케팅', title: '쿠팡 채널 ROAS 개선안 검토', body: '쿠팡 마진율 4.2%p 하락. Meta 광고 예산 재배분안 검토 후 수요일 회의 전 공유 부탁합니다. 정하윤 님 정산 데이터도 참고해 주세요.', status: 'progress', priority: 'high', due: '2026-07-12', createdAt: DEMO_DATE + ' 14:00', unread: true, replies: [
                    { id: 'r4', userId: 'lee', text: '데이터 분석 중입니다. Meta 15% 감액 + 네이버 SA 10% 증액안 초안 작성 중.', time: DEMO_DATE + ' 15:30' },
                    { id: 'r4b', userId: 'jung', text: '6월 정산 기준 쿠팡 광고비 비중 12.1%→14.8%입니다. 표 첨부는 자료실에 올렸습니다.', time: DEMO_DATE + ' 16:05' }
                ]},
                { id: 't5', type: 'check', from: 'choi', to: 'park', dept: '운영팀', title: '에이블리 API 토큰 갱신 확인', body: '에이블리 OAuth 토큰 7일 후 만료 예정. 자동 토큰 갱신 동작 확인 부탁드립니다.', status: 'hold', priority: 'normal', due: '2026-07-15', createdAt: DEMO_DATE + ' 08:00', unread: false, replies: [] },
                { id: 't6', type: 'request', from: 'jung', to: 'kim', dept: '대표', title: '7월 경영회의 자료 확정', body: '손익 요약·채널별 마진·광고 ROAS 슬라이드 초안 검토 부탁드립니다. 회의는 7/11 오전입니다.', status: 'request', priority: 'high', due: '2026-07-11', createdAt: DEMO_DATE + ' 10:40', unread: true, replies: [
                    { id: 'r6', userId: 'kim', text: '마진 차트만 어제 버전으로 교체해 주세요. 나머지는 OK입니다.', time: DEMO_DATE + ' 11:05' }
                ]},
                { id: 't7', type: 'agenda', from: 'lee', to: 'all', dept: '마케팅', title: '주말 플래시 세일 킥오프', body: '7/12–13 플래시 세일 실행 체크리스트입니다. 재고·CS·광고 입찰 각자 확인 부탁합니다.', status: 'progress', priority: 'high', due: '2026-07-12', createdAt: DEMO_DATE + ' 13:20', unread: true, replies: [
                    { id: 'r7', userId: 'park', text: '위험 SKU 6건 별도 한도 설정해 두었습니다.', time: DEMO_DATE + ' 13:45' },
                    { id: 'r7b', userId: 'choi', text: 'CS 템플릿 초안 자료실에 올렸습니다. 리뷰 부탁드려요.', time: DEMO_DATE + ' 14:10' }
                ]},
                { id: 't8', type: 'check', from: 'park', to: 'lee', dept: '마케팅', title: '히트 세럼 프로모션 재고 한도', body: '히트 세럼 잔여 24개입니다. 알림톡/배너 노출 한도 조정 여부 확인 부탁합니다.', status: 'done', priority: 'normal', due: DEMO_DATE, createdAt: '2026-07-09 19:00', unread: false, replies: [
                    { id: 'r8', userId: 'lee', text: '오늘부터 메인 배너에서 제외하고 세트 상품으로 대체했습니다.', time: DEMO_DATE + ' 08:50' }
                ]}
            ],
            agenda: [
                { id: 'a1', date: DEMO_DATE, dept: '운영팀', title: '에이블리 송장 일괄 처리', owner: 'park', done: false },
                { id: 'a2', date: DEMO_DATE, dept: '마케팅', title: 'Meta 광고 예산 재배분안', owner: 'lee', done: false },
                { id: 'a3', date: DEMO_DATE, dept: '재무', title: '쿠팡 정산 대사 최종 확인', owner: 'jung', done: false },
                { id: 'a4', date: '2026-07-11', dept: 'CS팀', title: 'CS 템플릿 업데이트', owner: 'choi', done: false },
                { id: 'a5', date: '2026-07-11', dept: '대표', title: '주간 옴니채널 리뷰 미팅', owner: 'kim', done: false },
                { id: 'a6', date: '2026-07-11', dept: '대표', title: '7월 경영회의 자료 확정', owner: 'jung', done: false },
                { id: 'a7', date: '2026-07-12', dept: '마케팅', title: '주말 플래시 킥오프', owner: 'lee', done: false },
                { id: 'a8', date: '2026-07-09', dept: '운영팀', title: '주간 재고 실사', owner: 'park', done: true },
                { id: 'a9', date: '2026-07-09', dept: '마케팅', title: '알림톡 A/B 결과 반영', owner: 'lee', done: true }
            ],
            readIds: []
        };
    }

    function applyToApp(App) {
        if (!App) return;
        App.demoDate = DEMO_DATE;
        App.totalSkuCount = 128;
        App.unreadNotifications = 12;
        App.mockPipeline = { collected: 1248, pending: 184, processing: 67, shipped: 997 };
        App.orders = buildOrders(48);
        App.inventory = buildInventory();
        App.notifications = buildNotifications();
        App.activityLogs = buildActivityLogs();
        App.syncHistory = buildSyncHistory();
        App.apiChannels = buildApiChannels();
        App.teamMembers = buildTeamMembers();
        App.dataHubMeta = Object.assign({}, App.dataHubMeta || {}, {
            totalRows: 1247832,
            lastIngest: DEMO_DATE + ' 23:08'
        });
    }

    function patchDefaultFns() {
        if (typeof global.getArchiveDefaults === 'function') {
            global.getArchiveDefaults = buildArchiveDefaults;
        }
        if (typeof global.getCommsDefaults === 'function') {
            global.getCommsDefaults = buildCommsDefaults;
        }
    }

    global.OmnifyDemoMock = {
        DEMO_DATE: DEMO_DATE,
        applyToApp: applyToApp,
        patchDefaultFns: patchDefaultFns,
        buildArchiveDefaults: buildArchiveDefaults,
        buildCommsDefaults: buildCommsDefaults
    };
})(typeof window !== 'undefined' ? window : this);
