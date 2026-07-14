/**
 * Omnify 상세 리포트 — DB 집계 기반 + 기간 선택
 */
(function (global) {
    'use strict';

    var REF = new Date(2026, 6, 10); /* 데모 기준일 */

    var PERIOD_PRESETS = [
        { id: 'today', label: '당일', hint: '기준일 하루' },
        { id: 'yesterday', label: '전일', hint: '기준일 하루 전' },
        { id: 'this_week', label: '금주', hint: '월~기준일' },
        { id: 'last_week', label: '전주', hint: '직전 주간(월~일)' },
        { id: 'this_month', label: '금월', hint: '1일~기준일' },
        { id: 'last_month', label: '전월', hint: '지난달 전체' },
        { id: 'last7', label: '최근 7일', hint: '롤링 7일' },
        { id: 'last30', label: '최근 30일', hint: '롤링 30일' },
        { id: 'custom', label: '일자 커스텀', hint: '시작~종료 직접 지정' }
    ];

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function fmtWon(n) {
        n = Math.round(Number(n) || 0);
        if (Math.abs(n) >= 100000000) return '₩ ' + (n / 100000000).toFixed(1) + '억';
        if (Math.abs(n) >= 10000) return '₩ ' + Math.round(n / 10000).toLocaleString('ko-KR') + '만';
        return '₩ ' + n.toLocaleString('ko-KR');
    }

    function pad(n) { return String(n).padStart(2, '0'); }

    function ymd(d) {
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    function addDays(d, n) {
        var x = new Date(d.getTime());
        x.setDate(x.getDate() + n);
        return x;
    }

    function startOfWeekMon(d) {
        var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        var day = (x.getDay() + 6) % 7;
        x.setDate(x.getDate() - day);
        return x;
    }

    function resolvePeriod(presetId, customFrom, customTo) {
        var end = new Date(REF.getTime());
        var start = new Date(REF.getTime());
        var cmpEnd, cmpStart;
        var label = '';
        var gran = 'daily';

        if (presetId === 'today') {
            start = end; label = '당일 (' + ymd(end) + ')';
            cmpEnd = addDays(end, -1); cmpStart = cmpEnd;
        } else if (presetId === 'yesterday') {
            end = addDays(REF, -1); start = end; label = '전일 (' + ymd(end) + ')';
            cmpEnd = addDays(end, -1); cmpStart = cmpEnd;
        } else if (presetId === 'this_week') {
            start = startOfWeekMon(REF); label = '금주 (' + ymd(start) + ' ~ ' + ymd(end) + ')';
            cmpEnd = addDays(start, -1); cmpStart = startOfWeekMon(cmpEnd);
        } else if (presetId === 'last_week') {
            var thisMon = startOfWeekMon(REF);
            end = addDays(thisMon, -1); start = startOfWeekMon(end);
            label = '전주 (' + ymd(start) + ' ~ ' + ymd(end) + ')';
            cmpEnd = addDays(start, -1); cmpStart = startOfWeekMon(cmpEnd);
        } else if (presetId === 'this_month') {
            start = new Date(REF.getFullYear(), REF.getMonth(), 1);
            label = '금월 (' + ymd(start) + ' ~ ' + ymd(end) + ')';
            cmpEnd = addDays(start, -1);
            cmpStart = new Date(cmpEnd.getFullYear(), cmpEnd.getMonth(), 1);
            gran = 'daily';
        } else if (presetId === 'last_month') {
            end = new Date(REF.getFullYear(), REF.getMonth(), 0);
            start = new Date(end.getFullYear(), end.getMonth(), 1);
            label = '전월 (' + ymd(start) + ' ~ ' + ymd(end) + ')';
            cmpEnd = addDays(start, -1);
            cmpStart = new Date(cmpEnd.getFullYear(), cmpEnd.getMonth(), 1);
            gran = 'daily';
        } else if (presetId === 'last7') {
            start = addDays(REF, -6); label = '최근 7일 (' + ymd(start) + ' ~ ' + ymd(end) + ')';
            cmpEnd = addDays(start, -1); cmpStart = addDays(cmpEnd, -6);
        } else if (presetId === 'last30') {
            start = addDays(REF, -29); label = '최근 30일 (' + ymd(start) + ' ~ ' + ymd(end) + ')';
            cmpEnd = addDays(start, -1); cmpStart = addDays(cmpEnd, -29);
            gran = 'daily';
        } else if (presetId === 'custom') {
            var f = customFrom ? new Date(customFrom + 'T00:00:00') : addDays(REF, -6);
            var t = customTo ? new Date(customTo + 'T00:00:00') : REF;
            if (f > t) { var tmp = f; f = t; t = tmp; }
            start = f; end = t;
            label = '커스텀 (' + ymd(start) + ' ~ ' + ymd(end) + ')';
            var span = Math.max(1, Math.round((end - start) / 86400000) + 1);
            cmpEnd = addDays(start, -1);
            cmpStart = addDays(cmpEnd, -(span - 1));
            gran = span > 45 ? 'weekly' : 'daily';
        } else {
            start = addDays(REF, -6); label = '최근 7일';
            cmpEnd = addDays(start, -1); cmpStart = addDays(cmpEnd, -6);
        }

        var days = Math.max(1, Math.round((end - start) / 86400000) + 1);
        if (days > 14 && gran === 'daily') gran = days > 60 ? 'monthly' : 'daily';
        return {
            id: presetId,
            label: label,
            start: start,
            end: end,
            startStr: ymd(start),
            endStr: ymd(end),
            cmpStart: cmpStart,
            cmpEnd: cmpEnd,
            cmpStartStr: ymd(cmpStart),
            cmpEndStr: ymd(cmpEnd),
            days: days,
            gran: gran,
            cmpLabel: '직전 동기간 대비'
        };
    }

    function dayIndexFromLabel(periodLabel) {
        /* daily labels: 2026-07-10 */
        var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(periodLabel);
        if (!m) return null;
        return new Date(+m[1], +m[2] - 1, +m[3]);
    }

    function filterRowsByRange(rows, start, end) {
        return rows.filter(function (r) {
            var d = dayIndexFromLabel(r.period);
            if (!d) return true; /* weekly/monthly: keep scaled set */
            return d >= start && d <= end;
        });
    }

    function buildHubBundle(range) {
        var channel = 'all';
        var gran = range.days <= 16 ? 'daily' : (range.days <= 90 ? 'weekly' : 'monthly');
        var rows = [];
        var cmpRows = [];
        if (typeof generateDataHubRows === 'function') {
            rows = generateDataHubRows(gran, channel);
            if (gran === 'daily') {
                rows = filterRowsByRange(rows, range.start, range.end);
                cmpRows = generateDataHubRows('daily', channel);
                cmpRows = filterRowsByRange(cmpRows, range.cmpStart, range.cmpEnd);
            } else {
                /* 스케일: 기간 일수에 비례 슬라이스 */
                var take = Math.min(rows.length, Math.max(3, Math.ceil(range.days / (gran === 'weekly' ? 7 : 30))));
                rows = rows.slice(0, take);
                cmpRows = generateDataHubRows(gran, channel).slice(take, take * 2);
                if (!cmpRows.length) cmpRows = generateDataHubRows(gran, channel).slice(0, take).map(function (r) {
                    return Object.assign({}, r, {
                        revenue: Math.round(r.revenue * 0.92),
                        orders: Math.max(1, Math.round(r.orders * 0.93)),
                        newCustomers: Math.max(0, Math.round(r.newCustomers * 0.9))
                    });
                });
            }
        }
        if (!rows.length && typeof generateDataHubRows === 'function') {
            rows = generateDataHubRows('daily', channel).slice(0, Math.min(7, range.days));
        }
        var summary = typeof getDataHubSummary === 'function' ? getDataHubSummary(rows) : null;
        var cmpSummary = cmpRows.length && typeof getDataHubSummary === 'function' ? getDataHubSummary(cmpRows) : null;
        return { gran: gran, rows: rows, cmpRows: cmpRows, summary: summary, cmpSummary: cmpSummary };
    }

    function deltaPct(curr, prev) {
        if (prev == null || !isFinite(prev) || prev === 0) return null;
        return ((curr - prev) / Math.abs(prev)) * 100;
    }

    function deltaHtml(curr, prev, kind) {
        if (prev == null || curr == null || !isFinite(prev)) return '<span class="delta flat">—</span>';
        var diff = curr - prev;
        var up = diff >= 0;
        var arrow = up ? '▲' : '▼';
        var cls = up ? 'up' : 'down';
        if (kind === 'invert') cls = up ? 'down' : 'up'; /* 반품률 등 */
        var text;
        if (kind === 'pp') {
            text = arrow + Math.abs(diff).toFixed(1) + 'p';
        } else {
            var pct = deltaPct(curr, prev);
            if (pct != null && Math.abs(pct) >= 0.5) {
                text = arrow + (Math.abs(pct) >= 10 ? Math.abs(pct).toFixed(0) : Math.abs(pct).toFixed(1)) + '%';
            } else if (kind === 'won') {
                text = arrow + fmtWon(Math.abs(diff)).replace(/^₩\s*/, '');
            } else {
                text = arrow + Math.abs(Math.round(diff)).toLocaleString('ko-KR');
            }
        }
        return '<span class="delta ' + cls + '">' + esc(text) + '</span>';
    }

    function insightBullets(bundle, range, m) {
        var bullets = [];
        var s = bundle.summary || {};
        var c = bundle.cmpSummary;
        var rows = bundle.rows || [];
        if (rows.length) {
            var best = rows.reduce(function (a, b) { return a.revenue > b.revenue ? a : b; }, rows[0]);
            var worst = rows.reduce(function (a, b) { return a.revenue < b.revenue ? a : b; }, rows[0]);
            bullets.push('최고 구간 <strong>' + esc(best.period) + '</strong> (' + esc(fmtWon(best.revenue)) + '), 최저 <strong>' + esc(worst.period) + '</strong> (' + esc(fmtWon(worst.revenue)) + ').');
        }
        if (c) {
            var rp = deltaPct(s.revenue, c.revenue);
            if (rp != null) {
                bullets.push('매출은 직전 동기간 대비 <strong>' + (rp >= 0 ? '+' : '') + rp.toFixed(1) + '%</strong> ' + (rp >= 0 ? '성장' : '감소') + '했습니다.');
            }
            var mp = parseFloat(s.margin) - parseFloat(c.margin);
            if (isFinite(mp)) {
                bullets.push('평균 마진율 ' + esc(s.margin) + '% (' + (mp >= 0 ? '+' : '') + mp.toFixed(1) + 'p).');
            }
        }
        var channels = (global.App && App.dataHubChannels) ? App.dataHubChannels.filter(function (x) { return x.id !== 'all'; }) : [];
        if (channels.length) {
            var top = channels.slice().sort(function (a, b) { return b.weight - a.weight; })[0];
            bullets.push('채널 매출 비중 1위는 <strong>' + esc(top.name) + '</strong> (' + Math.round(top.weight * 100) + '%).');
        }
        var atRisk = (global.App && App.inventory) ? App.inventory.filter(function (i) { return i.status !== 'safe'; }).length : 0;
        if (atRisk) bullets.push('위험 재고 <strong>' + atRisk + 'SKU</strong> — 발주·안전재고 점검 권장.');
        var pending = (m && m.pendingShipments != null) ? m.pendingShipments : 0;
        if (pending) bullets.push('미처리 발주 <strong>' + pending + '건</strong> — 출고 SLA 확인.');
        if (!bullets.length) bullets.push('선택 기간 기준 집계가 준비되었습니다.');
        return bullets;
    }

    function buildDetailedBody(type, range, bundle) {
        var m = {};
        try { if (typeof getMockMetrics === 'function') m = getMockMetrics() || {}; } catch (e) { /* ignore */ }
        var s = bundle.summary || {};
        var c = bundle.cmpSummary;
        var brand = (global.App && App.brandName) || m.companyName || '고객사';
        var viewHint = type === 'auto' ? '종합' : type;

        var kpiBlock =
            '<div class="kpi">' +
            '<div><div class="l">누적 매출</div><div class="v">' + esc(fmtWon(s.revenue || m.dailyRevenue || 0)) + '</div>' +
            (c ? '<div class="d">' + deltaHtml(s.revenue, c.revenue, 'won') + ' ' + esc(range.cmpLabel) + '</div>' : '') + '</div>' +
            '<div><div class="l">주문</div><div class="v">' + esc((s.orders != null ? s.orders : m.orderCount || 0).toLocaleString('ko-KR')) + '건</div>' +
            (c ? '<div class="d">' + deltaHtml(s.orders, c.orders, 'count') + '</div>' : '') + '</div>' +
            '<div><div class="l">객단가</div><div class="v">' + esc(fmtWon(s.aov || m.aov || 0)) + '</div>' +
            (c ? '<div class="d">' + deltaHtml(s.aov, c.aov, 'won') + '</div>' : '') + '</div>' +
            '<div><div class="l">평균 마진</div><div class="v">' + esc((s.margin != null ? s.margin : m.marginGlobal) || '-') + '%</div>' +
            (c ? '<div class="d">' + deltaHtml(parseFloat(s.margin), parseFloat(c.margin), 'pp') + '</div>' : '') + '</div>' +
            '<div><div class="l">신규 고객</div><div class="v">' + esc((s.newCustomers != null ? s.newCustomers : 0).toLocaleString('ko-KR')) + '</div>' +
            (c ? '<div class="d">' + deltaHtml(s.newCustomers, c.newCustomers, 'count') + '</div>' : '') + '</div>' +
            '<div><div class="l">반품률</div><div class="v">' + esc((s.returnRate != null ? s.returnRate : m.returnRate) || '-') + '%</div>' +
            (c ? '<div class="d">' + deltaHtml(parseFloat(s.returnRate), parseFloat(c.returnRate), 'invert') + '</div>' : '') + '</div>' +
            '</div>';

        var channels = (global.App && App.dataHubChannels) ? App.dataHubChannels.filter(function (x) { return x.id !== 'all'; }) : [];
        var totalW = channels.reduce(function (a, x) { return a + x.weight; }, 0) || 1;
        var baseRev = s.revenue || m.dailyRevenue || 28450000;
        var chRows = channels.map(function (ch) {
            var rev = Math.round(baseRev * (ch.weight / totalW));
            return '<tr><td>' + esc(ch.name) + '</td><td class="r">' + esc(fmtWon(rev)) + '</td><td class="r">' +
                Math.round(ch.weight * 100) + '%</td></tr>';
        }).join('');

        var dbRows = (bundle.rows || []).slice(0, 16).map(function (r) {
            var gCls = r.growth >= 0 ? 'up' : 'down';
            return '<tr><td>' + esc(r.period) + '</td><td>' + esc(r.channel) + '</td><td class="r">' + esc(fmtWon(r.revenue)) +
                '</td><td class="r">' + r.orders.toLocaleString('ko-KR') + '</td><td class="r">' + esc(fmtWon(r.aov)) +
                '</td><td class="r">' + r.margin + '%</td><td class="r">' + r.returnRate + '%</td>' +
                '<td class="r"><span class="delta ' + gCls + '">' + (r.growth >= 0 ? '+' : '') + r.growth + '%</span></td></tr>';
        }).join('');

        var orderRows = ((global.App && App.orders) || []).slice(0, 10).map(function (o) {
            return '<tr><td>' + esc(o.id) + '</td><td>' + esc(o.channel) + '</td><td>' + esc(o.product || o.productTitle) +
                '</td><td class="r">' + esc(fmtWon(o.amount)) + '</td><td>' + esc(o.status) + '</td></tr>';
        }).join('');

        var invRows = ((global.App && App.inventory) || []).filter(function (i) { return i.status !== 'safe'; }).slice(0, 8).map(function (i) {
            return '<tr><td>' + esc(i.sku) + '</td><td>' + esc(i.name) + '</td><td class="r">' + esc(i.total) +
                '</td><td class="r">' + esc(i.safety) + '</td><td>' + esc(i.status) + '</td></tr>';
        }).join('');

        var promoList = (typeof promoPlans !== 'undefined' && promoPlans) ? promoPlans : [];
        var promoRows = promoList.map(function (p) {
            return '<tr><td>' + esc(p.title || p.label) + '</td><td>' + esc(p.status) + '</td><td>' +
                esc((p.startDate || '') + ' ~ ' + (p.endDate || '')) + '</td><td class="r">' +
                esc(fmtWon(p.kpi && p.kpi.targetRevenue)) + '</td><td class="r">' +
                esc(fmtWon(p.kpi && p.kpi.actualRevenue)) + '</td></tr>';
        }).join('');

        var bullets = insightBullets(bundle, range, m).map(function (b) {
            return '<li>' + b + '</li>';
        }).join('');

        var focusNote = '';
        if (type === 'orders') focusNote = '<p class="note">포커스: 주문·발주 현황</p>';
        if (type === 'inventory') focusNote = '<p class="note">포커스: 재고 경보</p>';
        if (type === 'profit') focusNote = '<p class="note">포커스: 수익성·마진</p>';
        if (type === 'promo') focusNote = '<p class="note">포커스: 프로모션</p>';

        return focusNote +
            '<p class="range-pill">기간 ' + esc(range.label) + ' · 비교 ' + esc(range.cmpStartStr) + ' ~ ' + esc(range.cmpEndStr) +
            ' · 집계 ' + esc(bundle.gran) + ' · ' + esc(brand) + ' · ' + esc(viewHint) + '</p>' +
            '<h2>1. 핵심 KPI</h2>' + kpiBlock +
            '<h2>2. 인사이트</h2><ul class="insight">' + bullets + '</ul>' +
            '<h2>3. 채널별 매출 비중 (DB)</h2>' +
            '<table><thead><tr><th>채널</th><th class="r">추정 매출</th><th class="r">비중</th></tr></thead><tbody>' +
            (chRows || '<tr><td colspan="3">채널 데이터 없음</td></tr>') + '</tbody></table>' +
            '<h2>4. 누적 DB 추이 (' + esc(bundle.gran) + ')</h2>' +
            '<table><thead><tr><th>기간</th><th>채널</th><th class="r">매출</th><th class="r">주문</th><th class="r">객단가</th><th class="r">마진</th><th class="r">반품</th><th class="r">전기</th></tr></thead><tbody>' +
            (dbRows || '<tr><td colspan="8">해당 기간 집계 없음</td></tr>') + '</tbody></table>' +
            '<h2>5. 주문 샘플</h2>' +
            '<table><thead><tr><th>주문</th><th>채널</th><th>상품</th><th class="r">금액</th><th>상태</th></tr></thead><tbody>' +
            (orderRows || '<tr><td colspan="5">없음</td></tr>') + '</tbody></table>' +
            '<h2>6. 위험 재고</h2>' +
            '<table><thead><tr><th>SKU</th><th>상품</th><th class="r">실재고</th><th class="r">안전</th><th>상태</th></tr></thead><tbody>' +
            (invRows || '<tr><td colspan="5">위험 재고 없음</td></tr>') + '</tbody></table>' +
            '<h2>7. 프로모션</h2>' +
            '<table><thead><tr><th>프로모션</th><th>상태</th><th>기간</th><th class="r">목표</th><th class="r">실적</th></tr></thead><tbody>' +
            (promoRows || '<tr><td colspan="5">등록 없음</td></tr>') + '</tbody></table>' +
            '<h2>8. 운영 보조 지표</h2>' +
            '<table><thead><tr><th>항목</th><th class="r">값</th></tr></thead><tbody>' +
            '<tr><td>미처리 액션</td><td class="r">' + esc(String(m.pendingActions != null ? m.pendingActions : '-')) + '건</td></tr>' +
            '<tr><td>발주 대기</td><td class="r">' + esc(String(m.pendingShipments != null ? m.pendingShipments : '-')) + '건</td></tr>' +
            '<tr><td>위험 재고</td><td class="r">' + esc(String(m.atRiskInventory != null ? m.atRiskInventory : '-')) + '건</td></tr>' +
            '<tr><td>월 예상 마감</td><td class="r">' + esc(m.monthlyTargetFormatted || '-') + '</td></tr>' +
            '<tr><td>평균 ROAS</td><td class="r">' + esc(m.avgRoas != null ? m.avgRoas + 'x' : '-') + '</td></tr>' +
            '</tbody></table>';
    }

    function buildPrintHtml(title, bodyHtml) {
        var brand = (global.App && App.brandName) || 'Omnify';
        var when = new Date().toLocaleString('ko-KR');
        return '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1">' +
            '<title>' + esc(title) + '</title>' +
            '<style>' +
            '@page{size:A4;margin:12mm}' +
            'body{font-family:"Malgun Gothic",Pretendard,sans-serif;color:#111;font-size:11.5px;line-height:1.45;margin:0;padding:16px;background:#fff}' +
            '.sheet{max-width:860px;margin:0 auto}' +
            'h1{font-size:18px;margin:0 0 4px}' +
            '.meta{color:#666;font-size:11px;margin-bottom:10px}' +
            'h2{font-size:12.5px;margin:14px 0 6px;border-bottom:1px solid #ddd;padding-bottom:3px}' +
            'table{width:100%;border-collapse:collapse;margin:4px 0 8px;font-size:11px}' +
            'th,td{border:1px solid #ddd;padding:5px 6px;text-align:left}' +
            'th{background:#f5f5f5;font-size:10px}' +
            'td.r,th.r{text-align:right}' +
            '.kpi{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 10px}' +
            '.kpi>div{flex:1;min-width:118px;border:1px solid #e5e5e5;border-radius:6px;padding:8px}' +
            '.kpi .l{font-size:10px;color:#666}.kpi .v{font-size:14px;font-weight:800;margin-top:2px}' +
            '.kpi .d{font-size:10px;margin-top:3px}' +
            '.delta.up{color:#059669;font-weight:700}.delta.down{color:#dc2626;font-weight:700}.delta.flat{color:#888}' +
            '.insight{margin:4px 0 8px 18px;padding:0}' +
            '.insight li{margin:3px 0}' +
            '.range-pill{display:inline-block;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:999px;padding:3px 10px;font-size:10px;color:#334155;margin:4px 0 8px}' +
            '.note{font-size:11px;color:#2563eb;margin:0 0 6px}' +
            '.foot{margin-top:14px;font-size:10px;color:#888;border-top:1px solid #eee;padding-top:8px}' +
            '.noprint{margin:0 0 14px;display:flex;gap:8px}' +
            '.noprint button{font:inherit;font-size:13px;padding:8px 14px;border-radius:6px;border:1px solid #ccc;background:#f8f8f8;cursor:pointer}' +
            '.noprint button.primary{background:#2563eb;color:#fff;border-color:#2563eb}' +
            '@media print{.noprint{display:none!important}body{padding:0}}' +
            '</style></head><body><div class="sheet">' +
            '<div class="noprint"><button type="button" class="primary" onclick="window.print()">인쇄 / PDF 저장</button>' +
            '<button type="button" onclick="window.close()">닫기</button></div>' +
            '<h1>' + esc(title) + '</h1>' +
            '<p class="meta">' + esc(brand) + ' · 출력 ' + esc(when) + ' · Omnify DB 기반 상세 리포트</p>' +
            bodyHtml +
            '<p class="foot">집계는 누적 데이터 DB(목업) + 운영 KPI를 합성한 샘플입니다. 실연동 시 동일 스키마로 채워집니다.</p>' +
            '</div></body></html>';
    }

    function openPrintWindow(title, bodyHtml) {
        var html = buildPrintHtml(title, bodyHtml);
        var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var w = window.open(url, '_blank');
        if (!w) {
            URL.revokeObjectURL(url);
            openInlinePreview(title, html);
            return null;
        }
        try { w.focus(); } catch (e) { /* ignore */ }
        setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e2) { /* ignore */ } }, 120000);
        return w;
    }

    function openInlinePreview(title, html) {
        var existing = document.getElementById('omnify-report-preview');
        if (existing) existing.remove();
        var wrap = document.createElement('div');
        wrap.id = 'omnify-report-preview';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.72);display:flex;align-items:stretch;justify-content:center;padding:2vh 1rem;';
        var frame = document.createElement('iframe');
        frame.title = title || '리포트';
        frame.style.cssText = 'width:min(920px,100%);height:96vh;border:0;border-radius:12px;background:#fff;';
        frame.srcdoc = html;
        var closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.textContent = '×';
        closeBtn.style.cssText = 'position:absolute;top:12px;right:16px;width:36px;height:36px;border:0;border-radius:8px;background:#111827;color:#fff;font-size:22px;cursor:pointer;';
        closeBtn.onclick = function () { wrap.remove(); };
        wrap.onclick = function (ev) { if (ev.target === wrap) wrap.remove(); };
        wrap.appendChild(closeBtn);
        wrap.appendChild(frame);
        document.body.appendChild(wrap);
        if (typeof showToast === 'function') showToast('팝업이 차단되어 화면 내 미리보기로 열었습니다.', 'info');
    }

    function closePeriodModal() {
        var el = document.getElementById('omnify-report-period-modal');
        if (el) el.remove();
    }

    function generateAndOpen(type, presetId, customFrom, customTo) {
        var range = resolvePeriod(presetId, customFrom, customTo);
        var bundle = buildHubBundle(range);
        var body = buildDetailedBody(type, range, bundle);
        var brand = (global.App && App.brandName) || '고객사';
        var title = brand + ' · 운영 상세 리포트';
        openPrintWindow(title, body);
        closePeriodModal();
    }

    function openPeriodModal(type) {
        closePeriodModal();
        var t = type || 'auto';
        var modal = document.createElement('div');
        modal.id = 'omnify-report-period-modal';
        modal.style.cssText = 'position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.65);display:flex;align-items:flex-start;justify-content:center;padding:8vh 1rem 2rem;';
        modal.onclick = function (ev) { if (ev.target === modal) closePeriodModal(); };

        var chips = PERIOD_PRESETS.map(function (p, i) {
            return '<button type="button" class="orp-chip' + (p.id === 'last7' ? ' on' : '') + '" data-period="' + p.id + '">' +
                '<span class="lab">' + esc(p.label) + '</span><span class="hint">' + esc(p.hint) + '</span></button>';
        }).join('');

        modal.innerHTML =
            '<div class="orp-sheet" onclick="event.stopPropagation()" style="width:min(560px,100%);background:#0f172a;border:1px solid #334155;border-radius:14px;padding:1.1rem 1.15rem 1.2rem;color:#e5e7eb;font-family:Pretendard,Malgun Gothic,sans-serif;box-shadow:0 24px 60px rgba(0,0,0,.45)">' +
            '<div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px">' +
            '<div><p style="margin:0;font-size:11px;color:#94a3b8;font-weight:700;letter-spacing:.04em">REPORT</p>' +
            '<h3 style="margin:2px 0 0;font-size:17px;font-weight:800">리포트 기간 선택</h3>' +
            '<p style="margin:6px 0 0;font-size:12px;color:#94a3b8;line-height:1.4">누적 DB·주문·재고·프로모션을 합친 상세 리포트입니다.</p></div>' +
            '<button type="button" id="orp-close" style="border:0;background:#1e293b;color:#cbd5e1;width:32px;height:32px;border-radius:8px;font-size:18px;cursor:pointer">×</button></div>' +
            '<div class="orp-chips" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">' + chips + '</div>' +
            '<div id="orp-custom" style="display:none;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
            '<label style="font-size:11px;color:#94a3b8">시작일<input id="orp-from" type="date" value="2026-07-01" style="display:block;width:100%;margin-top:4px;padding:8px;border-radius:8px;border:1px solid #334155;background:#020617;color:#e5e7eb"></label>' +
            '<label style="font-size:11px;color:#94a3b8">종료일<input id="orp-to" type="date" value="2026-07-10" style="display:block;width:100%;margin-top:4px;padding:8px;border-radius:8px;border:1px solid #334155;background:#020617;color:#e5e7eb"></label>' +
            '</div>' +
            '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">' +
            '<button type="button" id="orp-cancel" style="padding:9px 14px;border-radius:9px;border:1px solid #334155;background:transparent;color:#cbd5e1;font-weight:600;cursor:pointer">취소</button>' +
            '<button type="button" id="orp-go" style="padding:9px 16px;border-radius:9px;border:0;background:#2563eb;color:#fff;font-weight:700;cursor:pointer">리포트 생성</button>' +
            '</div></div>' +
            '<style>' +
            '.orp-chip{text-align:left;padding:10px 10px;border-radius:10px;border:1px solid #334155;background:#111827;color:#e5e7eb;cursor:pointer}' +
            '.orp-chip .lab{display:block;font-size:12px;font-weight:700}.orp-chip .hint{display:block;font-size:10px;color:#94a3b8;margin-top:2px}' +
            '.orp-chip.on{border-color:#3b82f6;background:rgba(37,99,235,.18)}' +
            '@media(max-width:560px){.orp-chips{grid-template-columns:1fr 1fr!important}}' +
            '</style>';

        document.body.appendChild(modal);
        var selected = 'last7';
        function syncCustom() {
            var box = document.getElementById('orp-custom');
            if (box) box.style.display = selected === 'custom' ? 'grid' : 'none';
        }
        modal.querySelectorAll('.orp-chip').forEach(function (btn) {
            btn.addEventListener('click', function () {
                selected = btn.getAttribute('data-period');
                modal.querySelectorAll('.orp-chip').forEach(function (b) { b.classList.toggle('on', b === btn); });
                syncCustom();
            });
        });
        document.getElementById('orp-close').onclick = closePeriodModal;
        document.getElementById('orp-cancel').onclick = closePeriodModal;
        document.getElementById('orp-go').onclick = function () {
            var from = (document.getElementById('orp-from') || {}).value;
            var to = (document.getElementById('orp-to') || {}).value;
            try {
                generateAndOpen(t, selected, from, to);
            } catch (err) {
                if (typeof showToast === 'function') showToast('리포트 생성 중 오류가 발생했습니다.', 'danger');
                try { console.error(err); } catch (e) { /* ignore */ }
            }
        };
    }

    /** 섹션별 현실적 출력 양식 (기간 모달 없이 바로 인쇄) */
    function statusKo(st) {
        var map = {
            pending: '발주대기', processing: '처리중', shipped: '출고완료',
            critical: '품절임박', warning: '주의', safe: '안전',
            active: '진행중', planning: '기획', completed: '완료'
        };
        return map[st] || st || '-';
    }

    function formDocMeta(docNo) {
        var brand = (global.App && App.brandName) || '고객사';
        var when = new Date().toLocaleString('ko-KR');
        return '<div class="form-head">' +
            '<div><div class="doc-type">Omnify 업무 출력 양식</div><div class="doc-brand">' + esc(brand) + '</div></div>' +
            '<div class="doc-meta">문서번호 ' + esc(docNo) + '<br>출력일시 ' + esc(when) + '</div></div>';
    }

    function formSignBlock() {
        return '<div class="sign-row">' +
            '<div class="sign-box"><span>작성</span><em></em></div>' +
            '<div class="sign-box"><span>검토</span><em></em></div>' +
            '<div class="sign-box"><span>승인</span><em></em></div></div>';
    }

    function buildFormHtml(title, bodyHtml, docNo) {
        var brand = (global.App && App.brandName) || 'Omnify';
        return '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">' +
            '<title>' + esc(title) + '</title><style>' +
            '@page{size:A4;margin:12mm}' +
            'body{font-family:"Malgun Gothic",sans-serif;color:#111;font-size:11px;line-height:1.4;margin:0;padding:14px;background:#fff}' +
            '.sheet{max-width:860px;margin:0 auto}' +
            '.form-head{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #111;padding-bottom:8px;margin-bottom:12px}' +
            '.doc-type{font-size:10px;color:#666;letter-spacing:.06em;text-transform:uppercase}' +
            '.doc-brand{font-size:18px;font-weight:800;margin-top:2px}' +
            '.doc-meta{font-size:10px;color:#555;text-align:right;line-height:1.5}' +
            'h1{font-size:16px;margin:0 0 4px}' +
            '.sub{color:#555;font-size:11px;margin:0 0 12px}' +
            'h2{font-size:12px;margin:14px 0 6px;border-left:3px solid #2563eb;padding-left:8px}' +
            'table{width:100%;border-collapse:collapse;margin:4px 0 8px}' +
            'th,td{border:1px solid #ccc;padding:5px 6px}' +
            'th{background:#f3f4f6;font-size:10px;font-weight:700}' +
            'td.r,th.r{text-align:right}td.c,th.c{text-align:center}' +
            '.sum{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 12px}' +
            '.sum>div{flex:1;min-width:110px;border:1px solid #ddd;padding:8px;border-radius:4px}' +
            '.sum .l{font-size:10px;color:#666}.sum .v{font-size:14px;font-weight:800;margin-top:2px}' +
            '.badge{display:inline-block;padding:1px 6px;border-radius:3px;font-size:10px;font-weight:700;border:1px solid #ddd}' +
            '.badge.warn{background:#fff7ed;color:#c2410c;border-color:#fed7aa}' +
            '.badge.danger{background:#fef2f2;color:#b91c1c;border-color:#fecaca}' +
            '.badge.ok{background:#ecfdf5;color:#047857;border-color:#a7f3d0}' +
            '.note{font-size:10px;color:#666;background:#f8fafc;border:1px solid #e2e8f0;padding:8px;margin:8px 0;border-radius:4px}' +
            '.sign-row{display:flex;gap:10px;margin-top:22px}' +
            '.sign-box{flex:1;border:1px solid #bbb;height:72px;position:relative;border-radius:2px}' +
            '.sign-box span{position:absolute;top:4px;left:6px;font-size:10px;color:#666}' +
            '.sign-box em{position:absolute;bottom:6px;right:8px;font-style:normal;font-size:10px;color:#999}' +
            '.foot{margin-top:12px;font-size:9px;color:#888;border-top:1px solid #eee;padding-top:6px}' +
            '.noprint{margin:0 0 12px;display:flex;gap:8px}' +
            '.noprint button{font:inherit;padding:8px 14px;border-radius:6px;border:1px solid #ccc;background:#f8f8f8;cursor:pointer}' +
            '.noprint button.primary{background:#2563eb;color:#fff;border-color:#2563eb}' +
            '@media print{.noprint{display:none!important}body{padding:0}}' +
            '</style></head><body><div class="sheet">' +
            '<div class="noprint"><button type="button" class="primary" onclick="window.print()">인쇄 / PDF 저장</button>' +
            '<button type="button" onclick="window.close()">닫기</button></div>' +
            formDocMeta(docNo) +
            '<h1>' + esc(title) + '</h1>' +
            bodyHtml + formSignBlock() +
            '<p class="foot">' + esc(brand) + ' · Omnify 운영 출력 샘플 · 실무 서식 참고용 (데모 데이터)</p>' +
            '</div></body></html>';
    }

    function openFormWindow(title, bodyHtml, docNo) {
        var html = buildFormHtml(title, bodyHtml, docNo);
        var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var w = window.open(url, '_blank');
        if (!w) {
            URL.revokeObjectURL(url);
            openInlinePreview(title, html);
            return null;
        }
        try { w.focus(); } catch (e) { /* ignore */ }
        setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e2) { /* ignore */ } }, 120000);
        return w;
    }

    function formOrders() {
        var m = {};
        try { if (typeof getMockMetrics === 'function') m = getMockMetrics() || {}; } catch (e) { /* ignore */ }
        var brand = m.companyName || (global.App && App.brandName) || '고객사';
        var p = m.pipeline || {};
        var orders = (global.App && App.orders) || [];
        var rows = orders.map(function (o, i) {
            return '<tr><td class="c">' + (i + 1) + '</td><td>' + esc(o.id) + '</td><td>' + esc(o.channel) +
                '</td><td>' + esc(o.product || o.productTitle) + '</td><td class="r">' + esc(fmtWon(o.amount)) +
                '</td><td class="c">' + esc(statusKo(o.status)) + '</td><td class="c">' + esc(o.time || '-') + '</td>' +
                '<td class="c">□</td></tr>';
        }).join('');
        var body =
            '<p class="sub">기준일 2026-07-10 · 채널 통합 주문 미러 · 발주·출고는 원천(사방넷/채널)에서 처리</p>' +
            '<div class="sum">' +
            '<div><div class="l">금일 수집</div><div class="v">' + esc(String(p.collected != null ? p.collected : '-')) + '건</div></div>' +
            '<div><div class="l">발주 대기</div><div class="v">' + esc(String(p.pending != null ? p.pending : '-')) + '건</div></div>' +
            '<div><div class="l">처리 중</div><div class="v">' + esc(String(p.processing != null ? p.processing : '-')) + '건</div></div>' +
            '<div><div class="l">출고 완료</div><div class="v">' + esc(String(p.shipped != null ? p.shipped : '-')) + '건</div></div></div>' +
            '<h2>주문 목록 (검수 · 출고 체크용)</h2>' +
            '<table><thead><tr><th class="c">No</th><th>주문번호</th><th>채널</th><th>상품명</th><th class="r">결제금액</th><th class="c">상태</th><th class="c">수집</th><th class="c">확인</th></tr></thead><tbody>' +
            (rows || '<tr><td colspan="8">주문 없음</td></tr>') + '</tbody></table>' +
            '<p class="note">※ Omnify는 상태 조회·동기화만 제공합니다. 발주 확정·송장 전송은 사방넷 또는 채널 어드민에서 수행하세요.</p>';
        openFormWindow(brand + ' 주문 · 발주 현황표', body, 'ORD-' + ymd(REF).replace(/-/g, ''));
    }

    function formInventory() {
        var brand = (global.App && App.brandName) || '고객사';
        var inv = (global.App && App.inventory) || [];
        var atRisk = inv.filter(function (i) { return i.status !== 'safe'; });
        var rows = inv.map(function (i, n) {
            var badge = i.status === 'critical' ? 'danger' : (i.status === 'warning' ? 'warn' : 'ok');
            return '<tr><td class="c">' + (n + 1) + '</td><td>' + esc(i.sku) + '</td><td>' + esc(i.name) +
                '</td><td class="r">' + esc(i.total) + '</td><td class="r">' + esc(i.safety) +
                '</td><td class="c"><span class="badge ' + badge + '">' + esc(statusKo(i.status)) + '</span></td>' +
                '<td class="c">□ 발주</td></tr>';
        }).join('');
        var riskRows = atRisk.map(function (i) {
            return '<tr><td>' + esc(i.sku) + '</td><td>' + esc(i.name) + '</td><td class="r">' + esc(i.total) +
                '</td><td class="r">' + esc(i.safety) + '</td><td class="c">' + esc(statusKo(i.status)) + '</td></tr>';
        }).join('');
        var body =
            '<p class="sub">기준일 2026-07-10 · 사방넷 실재고 + 채널 재고 조회 스냅샷</p>' +
            '<div class="sum">' +
            '<div><div class="l">전체 SKU</div><div class="v">' + inv.length + '</div></div>' +
            '<div><div class="l">위험 재고</div><div class="v">' + atRisk.length + '</div></div>' +
            '<div><div class="l">품절임박</div><div class="v">' + inv.filter(function (i) { return i.status === 'critical'; }).length + '</div></div>' +
            '<div><div class="l">주의</div><div class="v">' + inv.filter(function (i) { return i.status === 'warning'; }).length + '</div></div></div>' +
            '<h2>위험 재고 우선 조치</h2>' +
            '<table><thead><tr><th>SKU</th><th>상품명</th><th class="r">실재고</th><th class="r">안전</th><th class="c">등급</th></tr></thead><tbody>' +
            (riskRows || '<tr><td colspan="5">위험 재고 없음</td></tr>') + '</tbody></table>' +
            '<h2>전체 재고 목록</h2>' +
            '<table><thead><tr><th class="c">No</th><th>SKU</th><th>상품명</th><th class="r">실재고</th><th class="r">안전</th><th class="c">상태</th><th class="c">조치</th></tr></thead><tbody>' +
            (rows || '<tr><td colspan="7">데이터 없음</td></tr>') + '</tbody></table>' +
            '<p class="note">※ Omnify는 재고 Source of Truth가 아닙니다. 수량 수정·출고 확정은 원천 WMS/채널에서 처리합니다.</p>';
        openFormWindow(brand + ' 통합 재고 현황표', body, 'INV-' + ymd(REF).replace(/-/g, ''));
    }

    function formPromo() {
        var brand = (global.App && App.brandName) || '고객사';
        var list = (typeof promoPlans !== 'undefined' && promoPlans) ? promoPlans : [];
        if (!list.length && typeof loadPromoPlans === 'function') {
            try { loadPromoPlans(); list = promoPlans || []; } catch (e) { list = []; }
        }
        var rows = list.map(function (p, i) {
            var tgt = p.kpi && p.kpi.targetRevenue ? p.kpi.targetRevenue : 0;
            var act = p.kpi && p.kpi.actualRevenue ? p.kpi.actualRevenue : 0;
            var pct = tgt ? Math.round(act / tgt * 100) : 0;
            return '<tr><td class="c">' + (i + 1) + '</td><td>' + esc(p.title || p.label) + '</td><td class="c">' + esc(statusKo(p.status)) +
                '</td><td>' + esc((p.startDate || '') + ' ~ ' + (p.endDate || '')) + '</td><td>' + esc((p.channels || []).join(', ')) +
                '</td><td class="r">' + esc(fmtWon(tgt)) + '</td><td class="r">' + esc(fmtWon(act)) +
                '</td><td class="c">' + pct + '%</td></tr>';
        }).join('');
        var active = list.filter(function (p) { return p.status === 'active'; }).length;
        var body =
            '<p class="sub">프로모션 기획 · KPI 실적 기록 양식 · 실행은 외부 도구(솔라피/채널 등)</p>' +
            '<div class="sum">' +
            '<div><div class="l">전체</div><div class="v">' + list.length + '</div></div>' +
            '<div><div class="l">진행중</div><div class="v">' + active + '</div></div>' +
            '<div><div class="l">기획</div><div class="v">' + list.filter(function (p) { return p.status === 'planning'; }).length + '</div></div>' +
            '<div><div class="l">완료</div><div class="v">' + list.filter(function (p) { return p.status === 'completed'; }).length + '</div></div></div>' +
            '<h2>프로모션 일정 · 성과</h2>' +
            '<table><thead><tr><th class="c">No</th><th>프로모션</th><th class="c">상태</th><th>기간</th><th>채널</th><th class="r">목표매출</th><th class="r">실적</th><th class="c">달성</th></tr></thead><tbody>' +
            (rows || '<tr><td colspan="8">등록된 프로모션 없음</td></tr>') + '</tbody></table>' +
            '<p class="note">※ 발송·전환 실적은 외부 실행 후 Omnify에 기록합니다. 본 양식은 기획 회의·성과 리뷰용입니다.</p>';
        openFormWindow(brand + ' 프로모션 기획 · 성과표', body, 'PRM-' + ymd(REF).replace(/-/g, ''));
    }

    function formProfit() {
        var m = {};
        try { if (typeof getMockMetrics === 'function') m = getMockMetrics() || {}; } catch (e) { /* ignore */ }
        var brand = m.companyName || (global.App && App.brandName) || '고객사';
        var names = ['Cafe24', '스마트스토어', '쿠팡', '에이블리'];
        var margins = m.channelMargins || [];
        var chRows = names.map(function (name, i) {
            var v = margins[i] != null ? margins[i] : '-';
            return '<tr><td>' + name + '</td><td class="r">' + esc(v) + '%</td><td class="c">' +
                (typeof v === 'number' && v < (m.targetMargin || 30) ? '<span class="badge warn">목표 미달</span>' : '<span class="badge ok">양호</span>') +
                '</td></tr>';
        }).join('');
        var body =
            '<p class="sub">AI 수익성 분석 요약 · 광고 ROAS · 채널 마진 (설정 연동 목업)</p>' +
            '<div class="sum">' +
            '<div><div class="l">월 순이익</div><div class="v">' + esc(m.netProfitFormatted || '-') + '</div></div>' +
            '<div><div class="l">통합 마진</div><div class="v">' + esc(m.marginGlobal != null ? m.marginGlobal + '%' : '-') + '</div></div>' +
            '<div><div class="l">목표 마진</div><div class="v">' + esc(m.targetMargin != null ? m.targetMargin + '%' : '-') + '</div></div>' +
            '<div><div class="l">평균 ROAS</div><div class="v">' + esc(m.avgRoas != null ? m.avgRoas + 'x' : '-') + '</div></div></div>' +
            '<h2>채널별 마진</h2>' +
            '<table><thead><tr><th>채널</th><th class="r">마진율</th><th class="c">판정</th></tr></thead><tbody>' + chRows + '</tbody></table>' +
            '<h2>운영 메모</h2>' +
            '<table><thead><tr><th>항목</th><th>내용</th></tr></thead><tbody>' +
            '<tr><td>AI 절감 제안</td><td>' + esc(m.aiSavingsFormatted || '-') + ' (광고비 최적화 추정)</td></tr>' +
            '<tr><td>쿠팡 마진</td><td>' + esc(m.coupangMargin != null ? m.coupangMargin + '%' : '-') +
            (m.coupangDrop != null ? ' (변동 ' + m.coupangDrop + '%p)' : '') + '</td></tr>' +
            '<tr><td>월 광고비</td><td>' + esc(fmtWon(m.monthlyAdSpend || 0)) + '</td></tr>' +
            '</tbody></table>' +
            '<p class="note">※ 본 표는 경영·마케팅 회의용 요약입니다. 세무·회계 장부와 수치가 다를 수 있습니다.</p>';
        openFormWindow(brand + ' 수익성 분석 요약표', body, 'PRF-' + ymd(REF).replace(/-/g, ''));
    }

    function openForm(type) {
        try {
            if (type === 'orders') return formOrders();
            if (type === 'inventory') return formInventory();
            if (type === 'promo') return formPromo();
            if (type === 'profit') return formProfit();
            return formOrders();
        } catch (err) {
            if (typeof showToast === 'function') showToast('출력 양식 생성 중 오류가 발생했습니다.', 'danger');
            try { console.error('[OmnifyReportPrint.openForm]', err); } catch (e) { /* ignore */ }
        }
    }

    /** type: dashboard | orders | inventory | profit | promo | auto — 기간 모달 후 상세 출력 */
    function openReport(type) {
        openPeriodModal(type || 'auto');
    }

    /** 기간 없이 바로 생성 (기존 호출 호환) */
    function openReportDirect(type, presetId) {
        generateAndOpen(type || 'auto', presetId || 'last7');
    }

    global.OmnifyReportPrint = {
        openReport: openReport,
        openReportDirect: openReportDirect,
        openForm: openForm,
        PERIOD_PRESETS: PERIOD_PRESETS
    };
})(typeof window !== 'undefined' ? window : this);
