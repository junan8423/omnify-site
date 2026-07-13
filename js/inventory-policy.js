/**
 * Omnify 재고 · 발주 기능 정의 (제품 스펙 · 고정)
 * ------------------------------------------------
 * 원칙
 *  1) 1순위: 흩어진 주문·재고 데이터를 한곳에서 「확인」
 *  2) 액션은 오해·재고 오류 가능성이 0에 가까울 때만 제공
 *  3) 조금이라도 오류 가능성이 있으면 미제공 또는 원천 봉쇄
 *  4) Starter·Growth: 쓰기·실행 액션 완전 봉쇄
 *     Enterprise: 사방넷 범위에서만 협의·견적 후 제한 커스텀 (표준 미포함)
 *
 * 연동 범위 (단순화 · 고정)
 *  | 대상                    | 읽기 | 쓰기(재고·출고 확정) |
 *  |-------------------------|------|----------------------|
 *  | 사방넷 풀필먼트         | ✅ 표준 | ❌ 표준 봉쇄 · Ent. 협의만 |
 *  | 이지어드민              | ❌ 연동 제외 | ❌ 제외 |
 *  | 셀메이트                | ❌ 연동 제외 | ❌ 제외 |
 *  | Cafe24 등 판매 채널     | ✅ 기본 (주문·재고 조회) | ❌ 수량 직접수정 봉쇄 |
 *
 * 한 줄
 *  WMS 재고 연동 = 사방넷만 (표준은 읽기). 이지·셀메이트는 연동 제외.
 *  Cafe24 등 판매 채널은 주문·재고 조회를 기본으로 함.
 *  쓰기(수량 반영·출고 확정)는 표준 미제공 · Enterprise만 사방넷 범위에서 협의.
 *
 * Omnify가 하는 것
 *  - 사방넷 실재고 미러(고객이 사방넷 사용 시) + 채널 노출 재고 조회
 *  - 안전재고 경보 · 브리핑 · 주문 상태 미러 · 원천 바로가기
 *  - 팀 「발주 요청」공유(커뮤니케이션, 실제 출고 아님)
 *
 * Omnify가 하지 않는 것
 *  - 이지어드민·셀메이트 연동
 *  - 표준에서 재고 수량 쓰기·입고/출고/풀 WMS
 *  - 채널에 재고 수량 직접 쓰기(이중쓰기 금지)
 */
var INVENTORY_POLICY = {
    role: 'read_mirror',
    title: '통합 재고 (조회)',
    subtitle: '사방넷 실재고 + 채널 재고 조회 · 쓰기 표준 봉쇄',
    bannerLead: 'Omnify는 재고 Source of Truth가 아닙니다.',
    bannerBody: 'WMS 연동은 사방넷 풀필먼트만(표준=읽기). 이지어드민·셀메이트는 연동하지 않습니다. Cafe24 등 채널은 주문·재고 조회가 기본입니다. 수량 쓰기·출고 확정은 표준 미제공이며, Enterprise는 사방넷 범위에서만 협의합니다.',
    enterpriseCustom: {
        available: true,
        scope: '사방넷 풀필먼트 범위 · 협의·견적 후만 (표준 아님)',
        note: 'Starter·Growth 미제공. 이지·셀메이트 쓰기 커스텀도 제공하지 않음'
    },
    wmsRefs: [
        { name: '사방넷 풀필먼트', read: true, write: false, note: '표준 읽기. 쓰기=Ent. 협의만' },
        { name: '이지어드민', read: false, write: false, note: '연동 제외' },
        { name: '셀메이트', read: false, write: false, note: '연동 제외' },
        { name: 'Cafe24 등 채널', read: true, write: false, note: '주문·재고 조회 기본. 수량 쓰기 봉쇄' }
    ],
    allowed: [
        '사방넷 실재고 조회(해당 고객)',
        '채널 주문·재고 조회',
        '안전재고 경보(Omnify 기준값)',
        '브리핑·알림 경보',
        '원천 시스템 바로가기',
        '팀 내 발주·재고 요청 공유(커뮤니케이션)'
    ],
    blocked: [
        '이지어드민·셀메이트 연동',
        '재고 수량 쓰기(표준)',
        '입고·출고·로케이션 조작',
        '채널 재고 수량 직접 수정',
        '원천 발주/출고 완료 확정(표준)',
        'WMS 대체 운영'
    ]
};

function blockInventoryWrite(actionLabel) {
    var label = actionLabel || '해당 작업';
    var tip = (typeof App !== 'undefined' && App.isEnterprise)
        ? ' Enterprise는 사방넷 범위에서만 협의 후 제한 커스텀이 가능합니다.'
        : ' (표준 봉쇄 · Ent.는 사방넷만 협의)';
    showToast(
        label + '은(는) Omnify 표준에서 수행할 수 없습니다. 사방넷 또는 채널 어드민에서 처리하세요.' + tip,
        'warning'
    );
    if (typeof addActivityLog === 'function') {
        addActivityLog({
            userId: App.currentUserId,
            action: '쓰기 봉쇄',
            category: 'inventory',
            type: 'warning',
            detail: label + ' — 원천 시스템에서 처리 필요',
            meta: 'INVENTORY_POLICY'
        });
    }
}

function openInventorySourceHint() {
    showToast('재고 원천: 사방넷(실재고) · Cafe24 등 채널(노출재고). 이지·셀메이트 미연동. Omnify는 조회 전용', 'info');
}
