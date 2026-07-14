/**
 * Omnify 견적서 PDF 양식 — 납입액(원)·부가세·총계 · 대표 직인
 */
(function (root) {
    'use strict';

    var VAT_RATE = 0.1;

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

    /** 만원 → 원 */
    function manToWon(man) {
        if (man == null || man === '' || !isFinite(Number(man))) return null;
        return Math.round(Number(man) * 10000);
    }

    function formatWon(n) {
        if (n == null || !isFinite(n)) return '-';
        return Math.round(n).toLocaleString('ko-KR') + '원';
    }

    function vatOf(supply) {
        return Math.round(Number(supply || 0) * VAT_RATE);
    }

    /** 기본 대표 직인 (원형 스탬프 SVG) */
    function defaultSealSvg() {
        var co = OMNIFY_SUPPLIER.companyName;
        var ceo = OMNIFY_SUPPLIER.ceo;
        return '<svg class="seal" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="64" height="64" aria-label="직인">' +
            '<circle cx="60" cy="60" r="56" fill="none" stroke="#c62828" stroke-width="3.5"/>' +
            '<circle cx="60" cy="60" r="48" fill="none" stroke="#c62828" stroke-width="1.5"/>' +
            '<text x="60" y="40" text-anchor="middle" fill="#c62828" font-size="10.5" font-weight="700" ' +
            'font-family="Malgun Gothic, Apple SD Gothic Neo, sans-serif">' + esc(co) + '</text>' +
            '<text x="60" y="68" text-anchor="middle" fill="#c62828" font-size="20" font-weight="800" ' +
            'font-family="Malgun Gothic, Apple SD Gothic Neo, sans-serif">' + esc(ceo) + '</text>' +
            '<text x="60" y="92" text-anchor="middle" fill="#c62828" font-size="13" font-weight="700" ' +
            'font-family="Malgun Gothic, Apple SD Gothic Neo, sans-serif">印</text>' +
            '</svg>';
    }

    /** 저장된 견적 텍스트 → 본문 HTML (1페이지용 밀집) */
    function bodyFromQuoteText(text) {
        var raw = String(text || '').trim();
        if (!raw) return '<p class="muted">견적 내용이 없습니다.</p>';
        var skipHead = /^(고객사|청구 플랜|서비스 티어|작업 좌석|채널|초기 구축비|월 유지비|결제 주기|일시납|미리보기)/;
        var lines = raw.split(/\n/).map(function (l) { return l.replace(/\s+$/, ''); }).filter(Boolean);
        var html = [];
        var inList = false;
        lines.forEach(function (line) {
            if (/^\[Omnify 견적/.test(line) || line === '[Omnify 견적 요약]') return;
            if (/^\[.+\]$/.test(line.trim())) {
                if (inList) { html.push('</ul>'); inList = false; }
                html.push('<h3>' + esc(line.replace(/^\[|\]$/g, '')) + '</h3><ul>');
                inList = true;
                return;
            }
            if (skipHead.test(line)) return;
            if (!inList) { html.push('<ul>'); inList = true; }
            html.push('<li>' + esc(line) + '</li>');
        });
        if (inList) html.push('</ul>');
        return html.length ? '<div class="sec body-compact">' + html.join('') + '</div>' : '<p class="muted">견적 상세는 상단 품목표·총계를 참고하세요.</p>';
    }

    /**
     * 실제 납입 기준 금액 산출
     * - 구축비: setupFeeMan → 원
     * - 유지비: 일시납이면 할인 적용 합계, 아니면 월 1회분
     */
    function calcPayableAmounts(tenant) {
        var com = (tenant && tenant.commercial) || {};
        var setupWon = manToWon(com.setupFeeMan);
        var monthlyMan = Number(com.monthlyFeeMan);
        var monthlyWon = isFinite(monthlyMan) ? manToWon(monthlyMan) : null;

        var prepaidMonths = 0;
        if (com.prepaidTerm === '12') prepaidMonths = 12;
        else if (com.prepaidTerm === '6') prepaidMonths = 6;

        var discountPct = Number(com.discountPct) || 0;
        var maintWon = null;
        var maintLabel = '월 유지비';
        var maintQty = '1개월';
        var maintNote = '월납';

        if (monthlyWon != null) {
            if (prepaidMonths > 0) {
                var list = monthlyWon * prepaidMonths;
                maintWon = Math.round(list * (100 - discountPct) / 100);
                maintLabel = '유지비 (' + prepaidMonths + '개월 일시납)';
                maintQty = prepaidMonths + '개월';
                maintNote = discountPct ? ('할인 ' + discountPct + '% 반영') : '일시납';
            } else {
                maintWon = monthlyWon;
                maintLabel = '월 유지비 (' + planLabel(tenant.billingPlan) + ')';
                maintQty = '1개월';
                maintNote = '월납';
            }
        }

        var lines = [];
        if (setupWon != null) {
            lines.push({
                name: '초기 구축비 (Omnify 대시보드 구축)',
                qty: '1식',
                supply: setupWon,
                vat: vatOf(setupWon),
                note: '부가세 별도'
            });
        } else {
            lines.push({
                name: '초기 구축비',
                qty: '1식',
                supply: null,
                vat: null,
                note: '별도 견적'
            });
        }
        if (maintWon != null) {
            lines.push({
                name: maintLabel,
                qty: maintQty,
                supply: maintWon,
                vat: vatOf(maintWon),
                note: maintNote
            });
        }

        var supplySum = 0;
        var vatSum = 0;
        var hasAmount = false;
        lines.forEach(function (l) {
            if (l.supply != null) {
                supplySum += l.supply;
                vatSum += l.vat;
                hasAmount = true;
            }
        });

        return {
            lines: lines,
            supplySum: hasAmount ? supplySum : null,
            vatSum: hasAmount ? vatSum : null,
            grandTotal: hasAmount ? supplySum + vatSum : null,
            prepaidMonths: prepaidMonths,
            monthlyWon: monthlyWon
        };
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
        var pay = calcPayableAmounts(tenant);

        var tableHtml = pay.lines.map(function (r, i) {
            var supplyTxt = r.supply != null ? formatWon(r.supply) : '별도 견적';
            var vatTxt = r.vat != null ? formatWon(r.vat) : '-';
            return '<tr>' +
                '<td class="c">' + (i + 1) + '</td>' +
                '<td>' + esc(r.name) + '</td>' +
                '<td class="c">' + esc(r.qty) + '</td>' +
                '<td class="r">' + esc(supplyTxt) + '</td>' +
                '<td class="r">' + esc(vatTxt) + '</td>' +
                '<td>' + esc(r.note) + '</td>' +
                '</tr>';
        }).join('');

        var totalBlock = '';
        if (pay.supplySum != null) {
            totalBlock =
                '<table class="totals">' +
                '<tr><th>공급가액 합계</th><td class="r">' + esc(formatWon(pay.supplySum)) + '</td>' +
                '<th>부가세 (10%)</th><td class="r">' + esc(formatWon(pay.vatSum)) + '</td></tr>' +
                '<tr class="grand"><th colspan="2">납입 총액 (부가세 포함)</th><td class="r" colspan="2">' +
                esc(formatWon(pay.grandTotal)) + '</td></tr>' +
                '</table>';
        }

        var body = bodyFromQuoteText(quoteText || tenant.quoteText || '');
        var seal = defaultSealSvg();
        var previewUrl = (typeof absolutePreviewUrl === 'function'
            ? absolutePreviewUrl(tenant.infra && tenant.infra.previewPath)
            : (tenant.infra && tenant.infra.previewPath)) || '-';

        return '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">' +
            '<title>Omnify 견적서_' + esc(customer) + '_' + ymd + '</title>' +
            '<style>' +
            '@page{size:A4;margin:8mm 10mm}' +
            '*{box-sizing:border-box}' +
            'html,body{margin:0;height:100%}' +
            'body{font-family:"Malgun Gothic","Apple SD Gothic Neo",Pretendard,sans-serif;' +
            'color:#111;font-size:9.5px;line-height:1.32;background:#fff}' +
            '.toolbar{display:flex;gap:8px;justify-content:flex-end;margin-bottom:6px;' +
            'position:sticky;top:0;background:#fff;padding:6px 0;z-index:2}' +
            '.toolbar button{font:inherit;font-size:12px;font-weight:700;padding:7px 12px;' +
            'border:1px solid #111;background:#111;color:#fff;border-radius:6px;cursor:pointer}' +
            '.toolbar button.ghost{background:#fff;color:#111}' +
            '.page{width:100%;max-width:190mm;margin:0 auto;' +
            'height:calc(297mm - 16mm);overflow:hidden}' +
            '.sheet-inner{width:100%}' +
            'h1{margin:0;font-size:17px;letter-spacing:.14em;text-align:center}' +
            '.sub{text-align:center;color:#555;margin:1px 0 5px;font-size:9px}' +
            '.meta{display:flex;justify-content:space-between;margin-bottom:6px;font-size:9px}' +
            '.meta strong{font-weight:700}' +
            '.parties{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px}' +
            '.box{border:1px solid #222;padding:5px 7px}' +
            '.box h2{margin:0 0 4px;font-size:10px;border-bottom:1px solid #ddd;padding-bottom:2px}' +
            '.box dl{margin:0;display:grid;grid-template-columns:58px 1fr;gap:1px 6px}' +
            '.box dt{color:#666;font-weight:600}' +
            '.box dd{margin:0;font-weight:600;word-break:break-all}' +
            'table.items{width:100%;border-collapse:collapse;margin:0 0 5px}' +
            'table.items th,table.items td{border:1px solid #333;padding:3px 5px;vertical-align:middle}' +
            'table.items th{background:#f3f4f6;font-size:8.5px;font-weight:700}' +
            'table.items .c{text-align:center} table.items .r{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}' +
            'table.totals{width:100%;border-collapse:collapse;margin:0 0 6px}' +
            'table.totals th,table.totals td{border:1px solid #222;padding:4px 6px;font-size:10px}' +
            'table.totals th{text-align:left;background:#f9fafb;font-weight:700}' +
            'table.totals .r{text-align:right;font-weight:700;font-variant-numeric:tabular-nums}' +
            'table.totals tr.grand th,table.totals tr.grand td{background:#111;color:#fff;font-size:11px}' +
            '.badge{display:inline-block;border:1px solid #111;padding:0 4px;font-size:8px;margin-left:3px}' +
            '.sec{margin:0 0 4px}' +
            '.sec h3,.body-compact h3{margin:3px 0 1px;font-size:9.5px;border-left:2px solid #111;padding-left:5px}' +
            '.body-compact ul,.sec ul{margin:0;padding-left:14px}' +
            '.body-compact li,.sec li{margin:0;word-break:keep-all}' +
            '.muted{color:#666}' +
            '.foot{margin-top:4px;border-top:1px solid #ccc;padding-top:4px;display:grid;' +
            'grid-template-columns:1.2fr .8fr;gap:8px;align-items:end}' +
            '.sign{text-align:center;position:relative}' +
            '.sign .co{font-size:11px;font-weight:800;margin-bottom:2px}' +
            '.sign-block{position:relative;display:inline-block;min-width:130px;padding:2px}' +
            '.sign .line{border-bottom:1px solid #111;width:100%;margin:22px auto 2px}' +
            '.sign .who{font-size:9px}' +
            '.seal{position:absolute;right:0;top:-4px;opacity:.9;pointer-events:none;width:64px;height:64px}' +
            '.note{font-size:8px;color:#444;margin:0;line-height:1.35}' +
            '@media print{' +
            '.toolbar{display:none!important}' +
            'body{print-color-adjust:exact;-webkit-print-color-adjust:exact}' +
            '.page{height:277mm;max-height:277mm}' +
            '}' +
            '</style></head><body>' +
            '<div class="toolbar">' +
            '<button type="button" class="ghost" onclick="window.close()">닫기</button>' +
            '<button type="button" onclick="window.__omnifyPrint&&window.__omnifyPrint()">PDF로 저장 / 인쇄</button>' +
            '</div>' +
            '<div class="page"><div class="sheet-inner">' +
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
            '<dt>미리보기</dt><dd>' + esc(previewUrl) + '</dd>' +
            '</dl></div></div>' +
            '<table class="items"><thead><tr>' +
            '<th style="width:28px">No</th><th>품목</th><th style="width:64px">수량/기간</th>' +
            '<th style="width:92px">공급가액</th><th style="width:78px">부가세</th><th style="width:64px">비고</th>' +
            '</tr></thead><tbody>' + tableHtml + '</tbody></table>' +
            totalBlock +
            '<div class="sec"><h3>견적 상세 · 약관</h3></div>' + body +
            '<div class="foot">' +
            '<div><p class="note">※ 공급가액 기준 부가세 10% 별도 · 납입 총액은 부가세 포함.<br>' +
            '※ 견적 유효기간: 발행일로부터 30일.<br>' +
            '※ 중도 해지 시 할인 전 정상가(월 이용료) 기준 사용분 차감 후 잔액 환불 · 초기 구축비 비환불.</p></div>' +
            '<div class="sign"><div class="co">' + esc(OMNIFY_SUPPLIER.companyName) + '</div>' +
            '<div class="sign-block">' + seal +
            '<div class="line"></div>' +
            '<div class="who">대표 ' + esc(OMNIFY_SUPPLIER.ceo) + ' (인)</div>' +
            '</div></div>' +
            '</div></div></div>' +
            '<script>' +
            'function fitOnePage(){' +
            'var page=document.querySelector(".page");' +
            'var inner=document.querySelector(".sheet-inner");' +
            'if(!page||!inner)return 1;' +
            'inner.style.transform="none";inner.style.width="100%";' +
            'var avail=page.clientHeight||inner.scrollHeight;' +
            'var need=inner.scrollHeight;' +
            'if(need<=avail||!need)return 1;' +
            'var s=Math.max(0.68,Math.min(1,avail/need));' +
            'inner.style.transformOrigin="top left";' +
            'inner.style.transform="scale("+s+")";' +
            'inner.style.width=(100/s)+"%";' +
            'return s;' +
            '}' +
            'window.__omnifyPrint=function(){fitOnePage();setTimeout(function(){window.print()},80);};' +
            'window.addEventListener("load",function(){fitOnePage();setTimeout(function(){window.print()},320);});' +
            'window.addEventListener("beforeprint",fitOnePage);' +
            '<\/script>' +
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
        VAT_RATE: VAT_RATE,
        calcPayableAmounts: calcPayableAmounts,
        formatWon: formatWon,
        buildQuoteDocumentHtml: buildQuoteDocumentHtml,
        openQuotePdf: openQuotePdf,
        quoteNo: quoteNo
    };
})(typeof window !== 'undefined' ? window : this);
