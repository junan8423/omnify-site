/**
 * Omnify 공통 데이터 스키마 v0.1
 * — 채널 API → 어댑터 → 이 형태 → 대시보드
 * — 버전은 SCHEMA_VERSION. 필드 추가·변경 가능 (하위 호환 권장).
 *
 * 합의 요약 (2026-07):
 * - Order = 결제/배송 묶음 1건 + items[] 라인
 * - amount = 실결제액(원), shippingFee는 P1
 * - Inventory total = qtyWms 있으면 그것, 없으면 sum(qtyByChannel)
 * - P0 SKU: 채널 SKU ≈ Omnify SKU (P1에 매핑 테이블)
 */
(function (global) {
    'use strict';

    var SCHEMA_VERSION = '0.1.0';

    var ORDER_STATUS = {
        pending: { label: '발주대기', pipeline: 'pending' },
        processing: { label: '처리중', pipeline: 'processing' },
        shipped: { label: '출고완료', pipeline: 'shipped' },
        cancelled: { label: '취소', pipeline: null },
        returned: { label: '반품', pipeline: null }
    };

    var INVENTORY_STATUS = {
        critical: { label: '위험' },
        warning: { label: '주의' },
        safe: { label: '정상' }
    };

    /** 채널별 원천 상태 → Omnify status (어댑터가 채움 · 계속 보강) */
    var STATUS_MAP = {
        cafe24: {
            'N': 'pending',
            '결제완료': 'pending',
            '배송준비중': 'processing',
            '배송중': 'shipped',
            '배송완료': 'shipped',
            '취소': 'cancelled',
            '환불': 'returned'
        },
        smartstore: {
            PAYED: 'pending',
            DELIVERING: 'processing',
            DELIVERED: 'shipped',
            CANCELED: 'cancelled',
            RETURNED: 'returned'
        },
        coupang: {
            ACCEPT: 'pending',
            INSTRUCT: 'processing',
            DEPARTURE: 'shipped',
            DELIVERED: 'shipped',
            CANCEL: 'cancelled'
        },
        sabangnet: {
            '신규주문': 'pending',
            '주문확인': 'processing',
            '출고완료': 'shipped',
            '취소': 'cancelled'
        }
    };

    function mapChannelStatus(channel, raw) {
        if (!raw) return 'pending';
        var s = String(raw);
        if (ORDER_STATUS[s]) return s;
        var map = STATUS_MAP[channel] || {};
        if (map[s]) return map[s];
        var lower = s.toLowerCase();
        if (map[lower]) return map[lower];
        return 'pending';
    }

    function calcInventoryStatus(total, safety) {
        var t = Number(total) || 0;
        var s = Number(safety) || 0;
        if (t <= 0) return 'critical';
        if (s > 0 && t < s) return 'critical';
        if (s > 0 && t < s * 1.2) return 'warning';
        return 'safe';
    }

    function sumQtyMap(qtyByChannel) {
        var sum = 0;
        if (!qtyByChannel || typeof qtyByChannel !== 'object') return 0;
        Object.keys(qtyByChannel).forEach(function (k) {
            sum += Number(qtyByChannel[k]) || 0;
        });
        return sum;
    }

    function resolveInventoryTotal(item) {
        if (item.qtyWms != null && item.qtyWms !== '' && isFinite(Number(item.qtyWms))) {
            return Number(item.qtyWms);
        }
        if (item.total != null && isFinite(Number(item.total)) && !item.qtyByChannel) {
            return Number(item.total);
        }
        return sumQtyMap(item.qtyByChannel);
    }

    /**
     * 레거시 목업/API 조각을 Order 공통형으로
     */
    function normalizeOrder(raw, opts) {
        opts = opts || {};
        raw = raw || {};
        var channel = raw.channel || opts.channel || 'other';
        var tenantId = raw.tenantId || opts.tenantId || '';
        var sourceOrderId = raw.sourceOrderId || raw.channelOrderId || raw.id || '';
        var id = raw.id;
        if (!id || String(id).indexOf(':') < 0) {
            id = [tenantId || 't', channel, sourceOrderId || ('tmp-' + Math.random().toString(36).slice(2, 8))]
                .filter(Boolean).join(':');
            // 대시보드 데모 호환: 기존 ORD-* id 유지
            if (raw.id && String(raw.id).indexOf('ORD-') === 0) id = raw.id;
        }
        var orderedAt = raw.orderedAt || raw.ordered_at || '';
        var time = raw.time || '';
        if (!orderedAt && time) {
            var today = (opts.dateBase || new Date().toISOString().slice(0, 10));
            orderedAt = today + 'T' + time + (time.length === 8 ? '' : ':00');
        }
        if (!time && orderedAt) {
            var m = /T(\d{2}:\d{2}:\d{2})/.exec(orderedAt);
            time = m ? m[1] : '';
        }
        var productTitle = raw.productTitle || raw.product || raw.title || '';
        var status = mapChannelStatus(channel, raw.statusRaw || raw.status);
        var items = Array.isArray(raw.items) ? raw.items.map(function (it, i) {
            return {
                sku: it.sku || '',
                channelSku: it.channelSku || it.sku || '',
                name: it.name || '',
                qty: Number(it.qty) || 0,
                unitPrice: Math.round(Number(it.unitPrice) || 0),
                amount: Math.round(Number(it.amount) || 0)
            };
        }) : [];

        return {
            schemaVersion: SCHEMA_VERSION,
            id: id,
            tenantId: tenantId,
            channel: channel,
            sourceOrderId: String(sourceOrderId),
            orderedAt: orderedAt,
            status: status,
            productTitle: productTitle,
            amount: Math.round(Number(raw.amount) || 0),
            currency: raw.currency || 'KRW',
            itemCount: raw.itemCount != null ? Number(raw.itemCount) : (items.length || 1),
            items: items,
            buyerName: raw.buyerName || '',
            trackingNo: raw.trackingNo || '',
            carrier: raw.carrier || '',
            wmsRef: raw.wmsRef || '',
            shippingFee: raw.shippingFee != null ? Math.round(Number(raw.shippingFee)) : null,
            syncedAt: raw.syncedAt || new Date().toISOString(),
            source: raw.source || null
        };
    }

    /** 대시보드 테이블용 (하위 호환: product, time) */
    function toOrderViewRow(order) {
        order = normalizeOrder(order);
        return Object.assign({}, order, {
            product: order.productTitle,
            time: order.time || (function () {
                var m = /T(\d{2}:\d{2}:\d{2})/.exec(order.orderedAt || '');
                return m ? m[1] : '';
            })()
        });
    }

    function normalizeInventoryItem(raw, opts) {
        opts = opts || {};
        raw = raw || {};
        var qtyByChannel = raw.qtyByChannel;
        if (!qtyByChannel || typeof qtyByChannel !== 'object') {
            qtyByChannel = {};
            ['cafe24', 'smartstore', 'coupang', 'ably', 'gmarket', 'elevenst'].forEach(function (ch) {
                if (raw[ch] != null) qtyByChannel[ch] = Number(raw[ch]) || 0;
            });
        }
        var qtyWms = raw.qtyWms != null ? Number(raw.qtyWms) : null;
        var total = resolveInventoryTotal({
            qtyWms: qtyWms != null && !isNaN(qtyWms) ? qtyWms : null,
            total: raw.total,
            qtyByChannel: qtyByChannel
        });
        // 데모: total이 명시되고 qtyWms 없으면 사방넷(실재고) 열 = total 유지
        if (qtyWms == null && raw.total != null) {
            qtyWms = Number(raw.total);
            total = qtyWms;
        }
        var safety = Number(raw.safety) || 0;
        var status = raw.status && INVENTORY_STATUS[raw.status]
            ? raw.status
            : calcInventoryStatus(total, safety);

        return {
            schemaVersion: SCHEMA_VERSION,
            sku: raw.sku || '',
            tenantId: raw.tenantId || opts.tenantId || '',
            name: raw.name || '',
            total: total,
            qtyByChannel: qtyByChannel,
            qtyWms: qtyWms,
            safety: safety,
            status: status,
            syncedAt: raw.syncedAt || new Date().toISOString(),
            source: raw.source || null
        };
    }

    /** 대시보드 테이블용 — qtyByChannel을 컬럼으로 펼침 */
    function toInventoryViewRow(item) {
        item = normalizeInventoryItem(item);
        var row = {
            sku: item.sku,
            name: item.name,
            total: item.total,
            safety: item.safety,
            status: item.status,
            qtyByChannel: item.qtyByChannel,
            qtyWms: item.qtyWms,
            syncedAt: item.syncedAt
        };
        Object.keys(item.qtyByChannel || {}).forEach(function (ch) {
            row[ch] = item.qtyByChannel[ch];
        });
        // 테이블이 기대하는 기본 4채널 기본값
        ['cafe24', 'smartstore', 'coupang', 'ably'].forEach(function (ch) {
            if (row[ch] == null) row[ch] = 0;
        });
        return row;
    }

    function buildPipeline(orders) {
        var pipe = { collected: 0, pending: 0, processing: 0, shipped: 0, cancelled: 0, returned: 0 };
        (orders || []).forEach(function (o) {
            var row = normalizeOrder(o);
            pipe.collected++;
            if (pipe[row.status] != null) pipe[row.status]++;
        });
        return pipe;
    }

    /**
     * App.orders / App.inventory 를 공통형 기준으로 정규화한 뷰 행으로 교체
     */
    function hydrateAppDemo(App) {
        if (!App) return;
        if (Array.isArray(App.orders)) {
            App.ordersCanonical = App.orders.map(function (o) { return normalizeOrder(o); });
            App.orders = App.ordersCanonical.map(toOrderViewRow);
        }
        if (Array.isArray(App.inventory)) {
            App.inventoryCanonical = App.inventory.map(function (i) { return normalizeInventoryItem(i); });
            App.inventory = App.inventoryCanonical.map(toInventoryViewRow);
        }
        if (App.mockPipeline && App.orders) {
            var p = buildPipeline(App.orders);
            // 데모 전체 건수(collected)는 샘플보다 크므로 비율만 샘플 기반으로 두지 않고
            // 기존 collected 유지, 상태 비율만 샘플에서 쓸 때는 호출측에서 선택
            App.pipelineFromSample = p;
        }
        App.dataSchemaVersion = SCHEMA_VERSION;
    }

    var OmnifySchema = {
        VERSION: SCHEMA_VERSION,
        ORDER_STATUS: ORDER_STATUS,
        INVENTORY_STATUS: INVENTORY_STATUS,
        STATUS_MAP: STATUS_MAP,
        mapChannelStatus: mapChannelStatus,
        calcInventoryStatus: calcInventoryStatus,
        normalizeOrder: normalizeOrder,
        normalizeInventoryItem: normalizeInventoryItem,
        toOrderViewRow: toOrderViewRow,
        toInventoryViewRow: toInventoryViewRow,
        buildPipeline: buildPipeline,
        hydrateAppDemo: hydrateAppDemo,
        sumQtyMap: sumQtyMap
    };

    global.OmnifySchema = OmnifySchema;
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = OmnifySchema;
    }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
