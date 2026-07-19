/**
 * Omnify 표준 서비스 이용계약서 PDF
 * - 테넌트·상업 조건·이용약관 요지를 반영한 표준 양식
 * - 법적 효력: 양 당사자 기명·날인(또는 이에 준하는 전자서명) 완료 시 발생
 *   (본 출력물 자체만으로 자동 체결되지 않음 · 변호사 검토 권장)
 */
(function (root) {
    'use strict';

    var VAT_RATE = 0.1;

    var SUPPLIER = (root.OmnifyQuotePdf && root.OmnifyQuotePdf.SUPPLIER) || {
        companyName: 'JK글로벌컴퍼니',
        ceo: '(주)JK글로벌컴퍼니',
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
        return d.getFullYear() + '년 ' + pad(d.getMonth() + 1) + '월 ' + pad(d.getDate()) + '일';
    }

    function todayIso(d) {
        d = d || new Date();
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    function planLabel(p) {
        var m = { starter: 'Starter', growth: 'Growth', enterprise: 'Enterprise' };
        return m[p] || (p || '-');
    }

    function formatWon(n) {
        if (n == null || !isFinite(n)) return '별도 협의';
        return Math.round(n).toLocaleString('ko-KR') + '원';
    }

    function manToWon(man) {
        if (man == null || man === '' || !isFinite(Number(man))) return null;
        return Math.round(Number(man) * 10000);
    }

    function contractNo(tenant, d) {
        d = d || new Date();
        var key = (tenant && (tenant.keyId || tenant.projectFolder || tenant.id)) || 'draft';
        key = String(key).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 16) || 'draft';
        return 'CTR-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + key.toUpperCase();
    }

    function channelLabels(tenant) {
        var ids = (tenant && tenant.channels) || [];
        var map = {};
        if (typeof CHANNEL_CATALOG !== 'undefined') {
            CHANNEL_CATALOG.forEach(function (c) { map[c.id] = c.label; });
        }
        if (!ids.length) return '계약 시 확정된 채널';
        return ids.map(function (id) { return map[id] || id; }).join(', ');
    }

    function payable(tenant) {
        if (root.OmnifyQuotePdf && typeof root.OmnifyQuotePdf.calcPayableAmounts === 'function') {
            return root.OmnifyQuotePdf.calcPayableAmounts(tenant);
        }
        var com = (tenant && tenant.commercial) || {};
        var setup = manToWon(com.setupFeeMan);
        var monthly = manToWon(com.monthlyFeeMan);
        var months = com.prepaidTerm === '12' ? 12 : com.prepaidTerm === '6' ? 6 : 0;
        var pct = Number(com.discountPct) || 0;
        var maint = monthly;
        if (monthly != null && months) {
            maint = Math.round(monthly * months * (100 - pct) / 100);
        }
        var supply = (setup || 0) + (maint || 0);
        var has = setup != null || maint != null;
        return {
            lines: [],
            supplySum: has ? supply : null,
            vatSum: has ? Math.round(supply * VAT_RATE) : null,
            grandTotal: has ? supply + Math.round(supply * VAT_RATE) : null,
            prepaidMonths: months,
            monthlyWon: monthly,
            setupWon: setup,
            maintWon: maint
        };
    }

    function sealSvg() {
        if (root.OmnifyQuotePdf && root.OmnifyQuotePdf.SUPPLIER) {
            /* reuse visual from quote module via rebuild */
        }
        var co = SUPPLIER.companyName;
        var ceo = SUPPLIER.ceo;
        return '<svg class="seal" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="72" height="72" aria-label="직인">' +
            '<circle cx="60" cy="60" r="56" fill="none" stroke="#c62828" stroke-width="3.5"/>' +
            '<circle cx="60" cy="60" r="48" fill="none" stroke="#c62828" stroke-width="1.5"/>' +
            '<text x="60" y="40" text-anchor="middle" fill="#c62828" font-size="10" font-weight="700" ' +
            'font-family="Malgun Gothic, Apple SD Gothic Neo, sans-serif">' + esc(co) + '</text>' +
            '<text x="60" y="68" text-anchor="middle" fill="#c62828" font-size="18" font-weight="800" ' +
            'font-family="Malgun Gothic, Apple SD Gothic Neo, sans-serif">' + esc(ceo) + '</text>' +
            '<text x="60" y="92" text-anchor="middle" fill="#c62828" font-size="12" font-weight="700" ' +
            'font-family="Malgun Gothic, Apple SD Gothic Neo, sans-serif">印</text>' +
            '</svg>';
    }

    function blankBuyerSeal() {
        return '<div class="buyer-seal">갑 직인</div>';
    }

    function buildContractHtml(tenant, opts) {
        opts = opts || {};
        tenant = tenant || {};
        var d = opts.date || new Date();
        var com = tenant.commercial || {};
        var pay = payable(tenant);
        var setupWon = manToWon(com.setupFeeMan);
        var monthlyWon = manToWon(com.monthlyFeeMan);
        var special = !!tenant.specialPricing || (tenant.billingPlan !== tenant.serviceTier);
        var refund = com.refundPolicyText ||
            (typeof REFUND_POLICY_TEXT !== 'undefined' ? REFUND_POLICY_TEXT :
                '중도 해지 시 할인 전 정상가(월 이용료)를 기준으로 사용 기간만큼 차감한 뒤 잔액을 환불합니다. 초기 구축비는 환불 대상이 아닙니다.');
        var start = tenant.contractStart || todayIso(d);
        var end = tenant.contractEnd || '';
        var goLive = (tenant.custom && tenant.custom.biz && tenant.custom.biz.goLiveDate) || '';
        var customer = tenant.companyName || '(고객사 상호)';
        var contact = [tenant.contactName, tenant.contactEmail, tenant.contactPhone].filter(Boolean).join(' / ') || '(담당자 기재)';
        var preview = (typeof absolutePreviewUrl === 'function'
            ? absolutePreviewUrl(tenant.infra && tenant.infra.previewPath)
            : (tenant.infra && tenant.infra.previewPath)) || '-';
        var no = contractNo(tenant, d);
        var prepaidNote = pay.prepaidMonths
            ? (pay.prepaidMonths + '개월 일시납 · 할인 ' + (com.discountPct || 0) + '% 적용')
            : '월납';

        var feeRows =
            '<tr><td>초기 구축비</td><td class="nowrap">' + esc(formatWon(setupWon)) + '</td><td class="nowrap">' +
            esc(setupWon != null ? formatWon(Math.round(setupWon * VAT_RATE)) : '-') + '</td><td>1회 · 비환불</td></tr>' +
            '<tr><td>월 유지비 / 구독료 (' + esc(planLabel(tenant.billingPlan)) + ')</td><td class="nowrap">' +
            esc(formatWon(monthlyWon)) + '</td><td class="nowrap">' +
            esc(monthlyWon != null ? formatWon(Math.round(monthlyWon * VAT_RATE)) : '-') +
            '</td><td>' + esc(prepaidNote) + '</td></tr>';

        if (pay.prepaidMonths && pay.supplySum != null) {
            var maintOnly = (pay.monthlyWon != null)
                ? Math.round(pay.monthlyWon * pay.prepaidMonths * (100 - (Number(com.discountPct) || 0)) / 100)
                : null;
            feeRows += '<tr><td>일시납 구독 공급가 (실납)</td><td class="nowrap">' + esc(formatWon(maintOnly)) +
                '</td><td class="nowrap">' + esc(maintOnly != null ? formatWon(Math.round(maintOnly * VAT_RATE)) : '-') +
                '</td><td>' + pay.prepaidMonths + '개월분</td></tr>';
        }

        return '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8">' +
            '<title>Omnify_표준계약서_' + esc(customer) + '_' + todayIso(d) + '</title>' +
            '<style>' +
            '@page{size:A4;margin:12mm 12mm}' +
            '*{box-sizing:border-box}' +
            'body{margin:0;font-family:"Malgun Gothic","Apple SD Gothic Neo",Pretendard,sans-serif;' +
            'color:#111;font-size:10px;line-height:1.4;background:#fff}' +
            '.toolbar{display:flex;gap:8px;justify-content:flex-end;margin-bottom:8px;position:sticky;top:0;' +
            'background:#fff;padding:6px 0;z-index:2}' +
            '.toolbar button{font:inherit;font-size:12px;font-weight:700;padding:7px 12px;border:1px solid #111;' +
            'background:#111;color:#fff;border-radius:6px;cursor:pointer}' +
            '.toolbar button.ghost{background:#fff;color:#111}' +
            '.sheet{max-width:186mm;margin:0 auto}' +
            'h1{margin:0;font-size:17px;text-align:center;letter-spacing:.08em}' +
            '.sub{text-align:center;color:#555;font-size:9px;margin:3px 0 8px}' +
            '.notice{border:1px solid #999;background:#fafafa;padding:6px 8px;font-size:8.5px;margin:0 0 8px;color:#333}' +
            '.meta{display:flex;justify-content:space-between;margin-bottom:8px;font-size:9px}' +
            '.art{margin:0 0 7px}' +
            '.art h2{margin:0 0 3px;font-size:10.5px;border-bottom:1px solid #ccc;padding-bottom:2px}' +
            '.art p,.art li{margin:2px 0;font-size:9.5px;word-break:keep-all}' +
            '.art ol{margin:2px 0 0;padding-left:16px}' +
            'table.fee{width:100%;border-collapse:collapse;margin:4px 0 6px;table-layout:fixed}' +
            'table.fee th,table.fee td{border:1px solid #333;padding:3px 5px;font-size:9px;vertical-align:middle}' +
            'table.fee th{background:#f3f4f6;font-weight:700}' +
            '.nowrap{white-space:nowrap;text-align:right;font-variant-numeric:tabular-nums}' +
            'table.parties{width:100%;border-collapse:collapse;margin:6px 0}' +
            'table.parties td{border:1px solid #333;padding:6px 8px;width:50%;vertical-align:top;font-size:9.5px}' +
            'table.parties .ttl{font-weight:800;margin-bottom:4px;font-size:10px}' +
            '.sign-row{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}' +
            '.sign-box{border:1px solid #333;padding:8px;min-height:120px;position:relative}' +
            '.sign-box .who{font-weight:800;margin-bottom:6px}' +
            '.sign-box .line{margin-top:28px;border-bottom:1px solid #111}' +
            '.sign-box .cap{margin-top:3px;font-size:9px}' +
            '.seal{position:absolute;right:8px;top:28px;opacity:.92}' +
            '.buyer-seal{position:absolute;right:10px;top:36px;width:64px;height:64px;border:1.5px dashed #999;' +
            'border-radius:50%;display:flex;align-items:center;justify-content:center;color:#999;font-size:10px}' +
            '.muted{color:#666;font-size:8.5px}' +
            '@media print{.toolbar{display:none!important} body{print-color-adjust:exact;-webkit-print-color-adjust:exact}}' +
            '</style></head><body><div class="sheet">' +
            '<div class="toolbar">' +
            '<button type="button" class="ghost" onclick="window.close()">닫기</button>' +
            '<button type="button" onclick="window.print()">PDF로 저장 / 인쇄</button>' +
            '</div>' +
            '<h1>Omnify 서비스 이용계약서</h1>' +
            '<p class="sub">표준계약서 · ' + esc(SUPPLIER.brand) + ' 멀티채널 커맨드 센터</p>' +
            '<p class="notice"><strong>효력 안내:</strong> 본 문서는 대시보드에 등록된 계약·요금 조건을 반영한 <strong>표준계약서 양식</strong>입니다. ' +
            '갑·을의 <strong>기명·날인(또는 전자서명)</strong>이 완료된 때에 계약으로서의 효력이 발생합니다. ' +
            '특수 조건이 있는 경우 서면 특약 또는 변호사 검토를 권장합니다.</p>' +
            '<div class="meta"><div>계약번호 <strong>' + esc(no) + '</strong></div><div>작성일 <strong>' +
            esc(todayYmd(d)) + '</strong></div></div>' +

            '<div class="art"><h2>제1조 (당사자)</h2>' +
            '<p>본 계약은 다음 당사자 사이에 Omnify 서비스 이용에 관하여 체결한다.</p>' +
            '<table class="parties"><tr>' +
            '<td><div class="ttl">갑 (이용자 · 고객)</div>' +
            '상호: ' + esc(customer) + '<br>' +
            '담당/연락: ' + esc(contact) + '<br>' +
            (tenant.businessNo ? ('사업자등록번호: ' + esc(tenant.businessNo) + '<br>') : '') +
            '키 ID: ' + esc(tenant.keyId || tenant.projectFolder || '-') +
            '</td>' +
            '<td><div class="ttl">을 (공급자 · 회사)</div>' +
            '상호: ' + esc(SUPPLIER.companyName) + '<br>' +
            '대표자: ' + esc(SUPPLIER.ceo) + '<br>' +
            '사업자등록번호: ' + esc(SUPPLIER.businessNo) + '<br>' +
            '소재지: ' + esc(SUPPLIER.address) + '<br>' +
            '이메일: ' + esc(SUPPLIER.email) +
            '</td></tr></table></div>' +

            '<div class="art"><h2>제2조 (목적)</h2>' +
            '<p>본 계약은 을이 갑에게 Omnify(옴니파이) 이커머스 데이터 통합·대시보드·운영 지원 서비스(이하 “서비스”)를 제공하고, ' +
            '갑이 그 대가(초기 구축비 및 구독료)를 지급함에 있어 필요한 권리·의무를 정함을 목적으로 한다.</p></div>' +

            '<div class="art"><h2>제3조 (서비스 범위)</h2><ol>' +
            '<li>청구 플랜: <strong>' + esc(planLabel(tenant.billingPlan)) + '</strong>' +
            (special ? ' (특가) · 실제 서비스 티어: <strong>' + esc(planLabel(tenant.serviceTier)) + '</strong>' : '') + '</li>' +
            '<li>작업 좌석: ' + esc(tenant.seats != null ? tenant.seats : '-') +
            '석 · 알림톡 수신: ' + esc(tenant.briefingRecipients != null ? tenant.briefingRecipients : '-') + '명</li>' +
            '<li>연동 채널: ' + esc(channelLabels(tenant)) + '</li>' +
            '<li>재고·WMS: ' + esc(tenant.wms || '해당 없음') +
            (tenant.inventoryWrite ? ' · 쓰기 범위 별도 합의' : ' · 표준은 읽기(조회) 중심') + '</li>' +
            '<li>대시보드 초안 URL: ' + esc(preview) + '</li>' +
            (goLive ? ('<li>Go-live 목표일: ' + esc(goLive) + '</li>') : '') +
            '<li>신규 채널 추가·대규모 로직 변경 등 범위 외 개발은 별도 견적·합의로 진행한다.</li>' +
            '</ol></div>' +

            '<div class="art"><h2>제4조 (대금 및 세금)</h2>' +
            '<p>금액은 공급가액이며, 부가가치세 10%가 별도로 가산된다.</p>' +
            '<table class="fee"><thead><tr><th>항목</th><th>공급가액</th><th>부가세</th><th>비고</th></tr></thead><tbody>' +
            feeRows + '</tbody></table>' +
            (pay.grandTotal != null
                ? ('<p>계약 시점 납입 기준 합계(구축비' + (pay.prepaidMonths ? '+일시납 구독' : '') +
                    '): 공급가 <strong>' + esc(formatWon(pay.supplySum)) + '</strong> · 부가세 <strong>' +
                    esc(formatWon(pay.vatSum)) + '</strong> · <strong>총 ' + esc(formatWon(pay.grandTotal)) +
                    '</strong> (부가세 포함)</p>')
                : '') +
            '<ol>' +
            '<li>갑은 세금계산서 발행에 필요한 정보를 을에게 제공하고, 을은 구축비 입금 확인 전 세금계산서 발행 절차를 진행할 수 있다.</li>' +
            '<li>결제 지연 시 을은 사전 통지 후 서비스 제공을 일시 중단할 수 있다.</li>' +
            '</ol></div>' +

            '<div class="art"><h2>제5조 (계약 기간)</h2><ol>' +
            '<li>계약 시작일: ' + esc(start) + (end ? (' · 종료(예정)일: ' + esc(end)) : ' · 종료일: 별도 합의 또는 해지 시까지') + '</li>' +
            '<li>월납의 경우 당사자가 해지하지 않는 한 동일 조건으로 월 단위 자동 갱신되는 것으로 본다. 일시납은 해당 선납 기간 종료 시 별도 합의한다.</li>' +
            '</ol></div>' +

            '<div class="art"><h2>제6조 (해지 및 환불)</h2><ol>' +
            '<li>갑은 해지 희망일 10일 전까지 이메일(' + esc(SUPPLIER.email) + ') 또는 서면으로 해지를 통보한다.</li>' +
            '<li>' + esc(refund) + '</li>' +
            '<li>당월 서비스가 이미 개시된 경우 당월 구독료는 원칙적으로 환불되지 않는다(선납·특약 시 해당 약정 우선).</li>' +
            '</ol></div>' +

            '<div class="art"><h2>제7조 (유지보수 · 면책)</h2><ol>' +
            '<li>을은 모니터링, API 오류 복구, 대시보드 표기 오류 수정 등 통상적 유지보수를 수행한다.</li>' +
            '<li>외부 플랫폼(네이버·쿠팡 등) API 정책 변경, 점검, 네트워크 장애 등 을의 합리적 통제 범위를 벗어난 사유로 인한 중단에 대해 을은 책임을 지지 않는다.</li>' +
            '<li>갑이 제공한 API 키·계정·데이터 오류로 인한 결과에 대한 책임은 갑에게 있다.</li>' +
            '</ol></div>' +

            '<div class="art"><h2>제8조 (개인정보 · 비밀유지)</h2>' +
            '<p>을은 서비스 제공 목적 범위에서 갑의 데이터를 처리하며, Omnify 개인정보처리방침 및 관련 법령을 준수한다. ' +
            '양 당사자는 본 계약 이행 중 지득한 상대방의 영업상 비밀을 계약 종료 후에도 제3자에게 누설하지 않는다.</p></div>' +

            '<div class="art"><h2>제9조 (준거법 · 분쟁)</h2>' +
            '<p>본 계약은 대한민국 법률에 따르며, 분쟁 발생 시 을의 본점 소재지 관할 법원을 제1심 전속 관할로 한다.</p></div>' +

            '<div class="art"><h2>제10조 (기타)</h2><ol>' +
            '<li>본 계약에 정하지 않은 사항은 Omnify 서비스 이용약관 및 상관례에 따른다.</li>' +
            '<li>본 계약과 견적서·특약 문서가 충돌하는 경우, 후에 기명·날인한 특약 또는 별도 합의서가 우선한다.</li>' +
            '<li>본 계약서는 2부를 작성하여 갑·을이 각 1부씩 보관한다(전자본 포함 가능).</li>' +
            '</ol></div>' +

            '<p class="muted">첨부: 견적서(해당 시) · 대시보드 상업 조건 스냅샷 · 이용약관(https://omnify.kr/legal.html)</p>' +

            '<p style="text-align:center;margin:10px 0 6px;font-size:10px">본 계약의 성립을 증명하기 위하여 당사자가 기명·날인한다.</p>' +
            '<div class="sign-row">' +
            '<div class="sign-box"><div class="who">갑 (이용자)</div>' +
            esc(customer) + blankBuyerSeal() +
            '<div class="line"></div><div class="cap">대표 또는 권한자 ______________ (인)</div></div>' +
            '<div class="sign-box"><div class="who">을 (공급자)</div>' +
            esc(SUPPLIER.companyName) + sealSvg() +
            '<div class="line"></div><div class="cap">대표 ' + esc(SUPPLIER.ceo) + ' (인)</div></div>' +
            '</div>' +

            '</div>' +
            '<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},280)});<\/script>' +
            '</body></html>';
    }

    function openContractPdf(tenant) {
        var html = buildContractHtml(tenant);
        var w = window.open('', '_blank');
        if (!w) return { ok: false, error: 'popup_blocked' };
        w.document.open();
        w.document.write(html);
        w.document.close();
        try { w.focus(); } catch (e) { /* ignore */ }
        return { ok: true };
    }

    root.OmnifyContractPdf = {
        buildContractHtml: buildContractHtml,
        openContractPdf: openContractPdf,
        contractNo: contractNo
    };
})(typeof window !== 'undefined' ? window : this);
