/**
 * Omnify 견적서 PDF 양식 — 브라우저 인쇄(다른 이름으로 저장 → PDF)
 */
(function (root) {
    'use strict';

    var OMNIFY_SUPPLIER = {
        companyName: 'JK글로벌컴퍼니',
        ceo: '최준환',
        businessNo: '455-03-03979',
        address: '서울특별시 송파구 중대로 207, 2층 201-J545호',
        email: 'omnify@omnify.kr',
        brand: 'Omnify'
    };

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function pad(n) {
        return n < 10 ? '0' + n : String(n);
    }

    function todayYmd(d) {
        d = d || new Date();
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    function quoteNo(tenant, d) {
        d = d || new Date();
        var key = (tenant && (tenant.keyId || tenant.projectFolder || tenant.id)) || 'draft';
        key = String(key).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16) || 'draft';
        return 'OMN-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + key.toUpperCase();
    }

    function planLabel(p) {
        var m = { starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise' };
        return m[p] || (p || '-');
    }

    /** 저장된 견적 텍스트 → 본문 HTML (빈 줄 기준 단락) */
    function bodyFromQuoteText(text) {
        var raw = String(text || '').trim();
        if (!raw) return '<p class="muted">견적 내용이 없습니다.</p>';
        var blocks = raw.split(/\n{2,}/);
        return blocks.map(function (block) {
            var lines = block.split(/\n/).map(function (l) { return l.replace(/\s+$/, ''); });
            var first = lines[0] || '';
            if (/^\[.+\]$/.test(first.trim())) {
                var title = first.replace(/^\[|\]$/g, '');
                var rest = lines.slice(1).filter(Boolean);
                return '<div class="sec"><h3>' + esc(title) + '</h3><ul>' +
                    rest.map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') +
                    '</ul></div>';
            }
            return '<div class="sec"><ul>' +
                lines.filter(Boolean).map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') +
                '</ul></div>';
        }).join('');
    }

    function feeRows(tenant) {
        var com = (tenant && tenant.commercial) || {};
        var rows = [];
        var setup = com.setupFeeMan;
        var monthly = com.monthlyFeeMan;
        if (setup != null && setup !== '') {
            rows.push({
                name: '초기 구축비 (Omnify 대시보드 구축)',
                qty: '1식',
                amount: Number(setup) + '만원',
                note: '부가세 별도'
            });
        } else {
            rows.push({
                name: '초기 구축비',
                qty: '1식',
                amount: '별도 견적',
                note: '협의'
            });
        }
        if (monthly != null && monthly !== '') {
            var term = com.prepaidTerm === '12' ? '12개월 일시납 기준 월액'
                : com.prepaidTerm === '6' ? '6개월 일시납 기준 월액'
                : '월 구독';
            rows.push({
                name: '월 유지비 (' + planLabel(tenant.billingPlan) + ')',
                qty: term,
                amount: Number(monthly) + '만원',
                note: com.discountPct ? ('일시납 할인 ' + com.discountPct + '%') : '부가세 별도'
            });
        }
        return rows;
    }

    function buildQuoteDocumentHtml(tenant, quoteText, opts) {
        opts = opts || {};
        tenant = tenant || {};
        var d = opts.date || new Date();
        var ymd = todayYmd(d);
        var no = quoteNo(tenant, d);
        var customer = tenant.companyName || '(고객사명)';
        var contact = [tenant.contactName, tenant.contactEmail, tenant.contactPhone]
            .filter(Boolean).join(' · ') || '-';
        var special = tenant.specialPricing || (tenant.billingPlan !== tenant.serviceTier);
        var rows = feeRows(tenant);
        var tableHtml = rows.map(function (r, i) {
            return '<tr><td class="c">' + (i + 1) + '</td><td>' + esc(r.name) + '</td><td class="c">' +
                esc(r.qty) + '</td><td class="r">' + esc(r.amount) + '</td><td>' + esc(r.note) + '</td></tr>';
        }).join('');

        var body = bodyFromQuoteText(quoteText || tenant.quoteText || '');

        return '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">' +
            '<title>Omnify 견적서_' + esc(customer) + '_' + ymd + '</title>' +
            '<style>' +
            '@page{size:A4;margin:14mm 16mm}' +
            '*{box-sizing:border-box}' +
            'body{margin:0;font-family:"Malgun Gothic","Apple SD Gothic Neo",Pretendard,sans-serif;' +
            'color:#111;font-size:11px;line-height:1.45;background:#fff}' +
            '.sheet{max-width:190mm;margin:0 auto}' +
            '.toolbar{display:flex;gap:8px;justify-content:flex-end;margin-bottom:12px;' +
            'position:sticky;top:0;background:#fff;padding:8px 0;z-index:2}' +
            '.toolbar button{font:inherit;font-size:12px;font-weight:700;padding:8px 14px;' +
            'border:1px solid #111;background:#111;color:#fff;border-radius:6px;cursor:pointer}' +
            '.toolbar button.ghost{background:#fff;color:#111}' +
            'h1{margin:0;font-size:22px;letter-spacing:.12em;text-align:center}' +
            '.sub{text-align:center;color:#555;margin:.25rem 0 1rem;font-size:11px}' +
            '.meta{display:flex;justify-content:space-between;margin-bottom:12px;font-size:11px}' +
            '.meta strong{font-weight:700}' +
            '.parties{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}' +
            '.box{border:1px solid #222;padding:10px 12px;min-height:118px}' +
            '.box h2{margin:0 0 8px;font-size:12px;border-bottom:1px solid #ddd;padding-bottom:4px}' +
            '.box dl{margin:0;display:grid;grid-template-columns:72px 1fr;gap:3px 8px}' +
            '.box dt{color:#666;font-weight:600}' +
            '.box dd{margin:0;font-weight:600}' +
            'table.items{width:100%;border-collapse:collapse;margin:0 0 12px}' +
            'table.items th,table.items td{border:1px solid #333;padding:6px 7px;vertical-align:top}' +
            'table.items th{background:#f3f4f6;font-size:10px;font-weight:700}' +
            'table.items .c{text-align:center} table.items .r{text-align:right;white-space:nowrap}' +
            '.badge{display:inline-block;border:1px solid #111;padding:1px 6px;font-size:10px;margin-left:4px}' +
            '.sec{margin:0 0 10px}' +
            '.sec h3{margin:0 0 4px;font-size:12px;border-left:3px solid #111;padding-left:6px}' +
            '.sec ul{margin:0;padding-left:16px}' +
            '.sec li{margin:2px 0;word-break:keep-all}' +
            '.muted{color:#666}' +
            '.foot{margin-top:16px;border-top:1px solid #ccc;padding-top:10px;display:grid;' +
            'grid-template-columns:1.2fr .8fr;gap:12px}' +
            '.sign{text-align:center;padding-top:8px}' +
            '.sign .co{font-size:13px;font-weight:800;margin-bottom:28px}' +
            '.sign .line{border-bottom:1px solid #111;width:70%;margin:0 auto 4px}' +
            '.note{font-size:10px;color:#444;margin:0}' +
            '@media print{.toolbar{display:none!important} body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}' +
            '</style></head><body><div class="sheet">' +
            '<div class="toolbar">' +
            '<button type="button" class="ghost" onclick="window.close()">닫기</button>' +
            '<button type="button" onclick="window.print()">PDF로 저장 / 인쇄</button>' +
            '</div>' +
            '<h1>견 적 서</h1>' +
            '<p class="sub">' + esc(OMNIFY_SUPPLIER.brand) + ' · 멀티채널 커맨드 센터</p>' +
            '<div class="meta"><div>견적번호 <strong>' + esc(no) + '</strong></div>' +
            '<div>견적일 <strong>' + esc(ymd) + '</strong></div></div>' +
            '<div class="parties">' +
            '<div class="box"><h2>공급자</h2><dl>' +
            '<dt>상호</dt><dd>' + esc(OMNIFY_SUPPLIER.companyName) + '</dd>' +
            '<dt>대표자</dt><dd>' + esc(OMNIFY_SUPPLIER.ceo) + '</dd>' +
            '<dt>사업자번호</dt><dd>' + esc(OMNIFY_SUPPLIER.businessNo) + '</dd>' +
            '<dt>소재지</dt><dd>' + esc(OMNIFY_SUPPLIER.address) + '</dd>' +
            '<dt>이메일</dt><dd>' + esc(OMNIFY_SUPPLIER.email) + '</dd>' +
            '</dl></div>' +
            '<div class="box"><h2>수신 · 고객</h2><dl>' +
            '<dt>상호</dt><dd>' + esc(customer) + '</dd>' +
            '<dt>담당</dt><dd>' + esc(contact) + '</dd>' +
            '<dt>청구 플랜</dt><dd>' + esc(planLabel(tenant.billingPlan)) +
            (special ? ' <span class="badge">특가</span>' : '') + '</dd>' +
            '<dt>서비스</dt><dd>' + esc(planLabel(tenant.serviceTier)) + '</dd>' +
            '<dt>좌석/수신</dt><dd>작업 ' + esc(tenant.seats != null ? tenant.seats : '-') +
            ' · 알림톡 ' + esc(tenant.briefingRecipients != null ? tenant.briefingRecipients : '-') + '</dd>' +
            '</dl></div></div>' +
            '<table class="items"><thead><tr>' +
            '<th style="width:36px">No</th><th>품목</th><th style="width:88px">수량/기간</th>' +
            '<th style="width:88px">금액</th><th style="width:90px">비고</th>' +
            '</tr></thead><tbody>' + tableHtml + '</tbody></table>' +
            '<div class="sec"><h3>견적 상세</h3></div>' + body +
            '<div class="foot">' +
            '<div><p class="note">※ 상기 금액은 부가가치세 별도입니다.<br>' +
            '※ 본 견적의 유효기간은 발행일로부터 30일입니다.<br>' +
            '※ 중도 해지 시 할인 전 정상가(월 이용료) 기준 사용분 차감 후 잔액 환불 · 초기 구축비는 비환불.</p></div>' +
            '<div class="sign"><div class="co">' + esc(OMNIFY_SUPPLIER.companyName) + '</div>' +
            '<div class="line"></div><div>대표 ' + esc(OMNIFY_SUPPLIER.ceo) + ' (인)</div></div>' +
            '</div></div>' +
            '<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},250)});<\/script>' +
            '</body></html>';
    }

    function openQuotePdf(tenant, quoteText) {
        var html = buildQuoteDocumentHtml(tenant, quoteText);
        var w = window.open('', '_blank');
        if (!w) {
            return { ok: false, error: 'popup_blocked' };
        }
        w.document.open();
        w.document.write(html);
        w.document.close();
        try { w.focus(); } catch (e) { /* ignore */ }
        return { ok: true };
    }

    root.OmnifyQuotePdf = {
        SUPPLIER: OMNIFY_SUPPLIER,
        buildQuoteDocumentHtml: buildQuoteDocumentHtml,
        openQuotePdf: openQuotePdf,
        quoteNo: quoteNo
    };
})(typeof window !== 'undefined' ? window : this);
