/**
 * 어드민 · 팝빌 세금계산서 발행 UI
 */
(function (global) {
    'use strict';

    var API = '/api/taxinvoice';

    function $(id) { return document.getElementById(id); }

    function fmtWon(n) {
        var x = Math.round(Number(n) || 0);
        return x.toLocaleString('ko-KR') + '원';
    }

    function readTaxProfileFromForm() {
        return {
            ceoName: ($('f-tax-ceo') && $('f-tax-ceo').value.trim()) || '',
            addr: ($('f-tax-addr') && $('f-tax-addr').value.trim()) || '',
            bizType: ($('f-tax-biztype') && $('f-tax-biztype').value.trim()) || '',
            bizClass: ($('f-tax-bizclass') && $('f-tax-bizclass').value.trim()) || '',
            email: ($('f-tax-email') && $('f-tax-email').value.trim()) || '',
            contactName: ($('f-tax-contact') && $('f-tax-contact').value.trim()) || '',
            tel: ($('f-tax-tel') && $('f-tax-tel').value.trim()) || '',
            taxRegId: ($('f-tax-regid') && $('f-tax-regid').value.trim()) || '',
            invoiceeType: '사업자'
        };
    }

    function fillTaxProfileForm(tenant) {
        var tp = (tenant && tenant.taxProfile) || {};
        if ($('f-tax-ceo')) $('f-tax-ceo').value = tp.ceoName || '';
        if ($('f-tax-addr')) $('f-tax-addr').value = tp.addr || '';
        if ($('f-tax-biztype')) $('f-tax-biztype').value = tp.bizType || '';
        if ($('f-tax-bizclass')) $('f-tax-bizclass').value = tp.bizClass || '';
        if ($('f-tax-email')) $('f-tax-email').value = tp.email || (tenant && tenant.contactEmail) || '';
        if ($('f-tax-contact')) $('f-tax-contact').value = tp.contactName || (tenant && tenant.contactName) || '';
        if ($('f-tax-tel')) $('f-tax-tel').value = tp.tel || (tenant && tenant.contactPhone) || '';
        if ($('f-tax-regid')) $('f-tax-regid').value = tp.taxRegId || '';
        renderHistory(tenant);
    }

    function applyTaxProfileToTenant(tenant) {
        if (!tenant) return tenant;
        tenant.taxProfile = readTaxProfileFromForm();
        return tenant;
    }

    function mergeFormOntoTenant(tenant) {
        tenant = tenant || {};
        applyTaxProfileToTenant(tenant);
        if ($('f-company')) tenant.companyName = $('f-company').value.trim() || tenant.companyName;
        if ($('f-bizno')) tenant.businessNo = $('f-bizno').value.trim() || tenant.businessNo;
        if ($('f-contact')) tenant.contactName = $('f-contact').value.trim() || tenant.contactName;
        if ($('f-email')) tenant.contactEmail = $('f-email').value.trim() || tenant.contactEmail;
        if ($('f-phone')) tenant.contactPhone = $('f-phone').value.trim() || tenant.contactPhone;
        if ($('f-billing')) tenant.billingPlan = $('f-billing').value || tenant.billingPlan;
        if ($('f-service')) tenant.serviceTier = $('f-service').value || tenant.serviceTier;
        var setupRaw = ($('f-setup-fee') && $('f-setup-fee').value.trim()) || '';
        tenant.commercial = Object.assign({}, tenant.commercial || {}, {
            monthlyFeeMan: parseFloat(($('f-monthly-fee') && $('f-monthly-fee').value) || '0') || 0,
            setupFeeMan: setupRaw === '' ? null : (parseFloat(setupRaw) || 0),
            prepaidTerm: ($('f-prepaid') && $('f-prepaid').value) || 'none',
            discountPct: parseFloat(($('f-discount') && $('f-discount').value) || '0') || 0
        });
        return tenant;
    }

    function renderHistory(tenant) {
        var box = $('tax-history');
        if (!box) return;
        var list = (tenant && tenant.taxInvoices) || [];
        if (!list.length) {
            box.innerHTML = '<p class="muted">발행 이력이 없습니다.</p>';
            return;
        }
        box.innerHTML = '<ul class="tax-hist">' + list.map(function (r) {
            var st = r.status === 'issued' ? '발행' : (r.status === 'error' ? '실패' : (r.status || '-'));
            var amt = r.totalAmount != null ? fmtWon(r.totalAmount) : '';
            var when = (r.issuedAt || '').replace('T', ' ').slice(0, 16);
            return '<li><strong>' + st + '</strong> · ' + (r.itemName || r.itemType || '') +
                (amt ? ' · ' + amt : '') +
                (r.ntsConfirmNum ? ' · NTS ' + r.ntsConfirmNum : '') +
                '<br><span class="muted">' + when + ' · ' + (r.mgtKey || '') +
                (r.message ? ' · ' + r.message : '') + '</span></li>';
        }).join('') + '</ul>';
    }

    function setStatusHtml(html, cls) {
        var el = $('tax-issue-status');
        if (!el) return;
        el.className = 'tax-status' + (cls ? ' ' + cls : '');
        el.innerHTML = html;
    }

    function loadConfig(toast) {
        return fetch(API + '?action=status', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
            .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
            .then(function (x) {
                var badge = $('tax-config-badge');
                if (!badge) return x;
                if (!x.ok) {
                    badge.textContent = '인증 필요';
                    badge.className = 'tax-badge warn';
                    return x;
                }
                if (x.d.configured) {
                    badge.textContent = (x.d.isTest ? '팝빌 TEST' : '팝빌 LIVE') + ' · ' + (x.d.supplier.corpName || '');
                    badge.className = 'tax-badge ok';
                } else {
                    badge.textContent = '팝빌 미설정 (미리보기만)';
                    badge.className = 'tax-badge warn';
                }
                return x;
            })
            .catch(function () {
                var badge = $('tax-config-badge');
                if (badge) {
                    badge.textContent = 'API 연결 실패';
                    badge.className = 'tax-badge bad';
                }
                if (toast) toast('세금계산서 API 연결 실패', 'warning');
            });
    }

    function buildPayload(editingId, getTenantById) {
        var t = editingId && getTenantById ? getTenantById(editingId) : null;
        t = mergeFormOntoTenant(Object.assign({}, t || { id: editingId || '(draft)' }));
        if (editingId) t.id = editingId;

        var itemType = ($('tax-item-type') && $('tax-item-type').value) || 'setup';
        var purposeType = ($('tax-purpose') && $('tax-purpose').value) || '영수';
        var payload = {
            action: 'preview',
            tenantId: editingId || '',
            tenant: t,
            itemType: itemType,
            purposeType: purposeType,
            forceIssue: !!( $('tax-force') && $('tax-force').checked ),
            remark: ($('tax-remark') && $('tax-remark').value.trim()) || ''
        };
        if (itemType === 'custom') {
            var man = parseFloat(($('tax-custom-man') && $('tax-custom-man').value) || '0') || 0;
            payload.customSupplyWon = Math.round(man * 10000);
            payload.customItemName = ($('tax-custom-name') && $('tax-custom-name').value.trim()) || 'Omnify 서비스';
        }
        return payload;
    }

    function showPreviewMeta(meta, taxinvoice) {
        if (!meta) {
            setStatusHtml('미리보기 실패', 'bad');
            return;
        }
        var miss = (meta.missing || []).length
            ? '<p class="tax-miss">미비: ' + meta.missing.join(' · ') + '</p>'
            : '<p class="tax-ready">발행 가능</p>';
        setStatusHtml(
            '<strong>' + (meta.itemName || '') + '</strong> · ' + (meta.purposeType || '') + '<br>' +
            '공급가액 ' + fmtWon(meta.supplyCostTotal) +
            ' + 세액 ' + fmtWon(meta.taxTotal) +
            ' = <strong>' + fmtWon(meta.totalAmount) + '</strong><br>' +
            '공급자 ' + (meta.supplier && meta.supplier.corpName || '-') +
            ' → 공급받는자 ' + (meta.invoicee && meta.invoicee.corpName || '-') +
            ' / ' + (meta.invoicee && meta.invoicee.corpNum || '-') + '<br>' +
            '문서번호(예정) <code>' + (meta.mgtKey || '') + '</code>' +
            miss,
            meta.ready ? 'ok' : 'warn'
        );
        var pre = $('tax-preview-json');
        if (pre) pre.textContent = JSON.stringify({ meta: meta, taxinvoice: taxinvoice }, null, 2);
    }

    function wire(opts) {
        opts = opts || {};
        var toast = opts.toast || function () {};
        var getEditingId = opts.getEditingId || function () { return null; };
        var getTenantById = opts.getTenantById || function () { return null; };
        var upsertTenant = opts.upsertTenant || function () {};
        var renderList = opts.renderList || function () {};
        var refreshOpsTab = opts.refreshOpsTab || function () {};

        function syncCustomVisibility() {
            var wrap = $('tax-custom-fields');
            if (!wrap || !$('tax-item-type')) return;
            wrap.classList.toggle('hidden', $('tax-item-type').value !== 'custom');
        }

        if ($('tax-item-type')) {
            $('tax-item-type').addEventListener('change', syncCustomVisibility);
            syncCustomVisibility();
        }

        if ($('btn-tax-preview')) {
            $('btn-tax-preview').addEventListener('click', function () {
                var payload = buildPayload(getEditingId(), getTenantById);
                payload.action = 'preview';
                setStatusHtml('미리보기 생성 중…', '');
                fetch(API, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify(payload)
                }).then(function (r) {
                    return r.json().then(function (d) { return { ok: r.ok, d: d }; });
                }).then(function (x) {
                    if (!x.ok) {
                        setStatusHtml((x.d && (x.d.message || x.d.error)) || '미리보기 실패', 'bad');
                        toast('미리보기 실패', 'warning');
                        return;
                    }
                    showPreviewMeta(x.d.meta, x.d.taxinvoice);
                    if (!x.d.configured) toast('팝빌 미설정 — 초안만 확인됩니다.', 'info');
                    else toast('초안 미리보기 완료', 'success');
                }).catch(function () {
                    setStatusHtml('네트워크 오류', 'bad');
                    toast('네트워크 오류', 'warning');
                });
            });
        }

        if ($('btn-tax-issue')) {
            $('btn-tax-issue').addEventListener('click', function () {
                var id = getEditingId();
                if (!id) {
                    toast('먼저 테넌트를 저장하세요.', 'warning');
                    return;
                }
                var payload = buildPayload(id, getTenantById);
                if (!window.confirm(
                    '팝빌로 전자세금계산서를 즉시 발행할까요?\n' +
                    '품목: ' + payload.itemType + ' / ' + payload.purposeType + '\n' +
                    (payload.forceIssue ? '(지연발행 허용 ON)\n' : '') +
                    '테스트/운영 환경은 서버 POPBILL_IS_TEST 설정을 따릅니다.'
                )) return;

                // 프로필을 테넌트에 먼저 저장
                var t = getTenantById(id);
                if (t) {
                    applyTaxProfileToTenant(t);
                    t.updatedAt = new Date().toISOString();
                    upsertTenant(t);
                }

                payload.action = 'issue';
                payload.tenantId = id;
                setStatusHtml('팝빌 발행 요청 중…', '');
                var btn = $('btn-tax-issue');
                if (btn) btn.disabled = true;
                fetch(API, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify(payload)
                }).then(function (r) {
                    return r.json().then(function (d) { return { ok: r.ok, d: d }; });
                }).then(function (x) {
                    if (btn) btn.disabled = false;
                    if (!x.ok) {
                        setStatusHtml((x.d && (x.d.message || x.d.error)) || '발행 실패', 'bad');
                        toast((x.d && x.d.message) || '발행 실패', 'warning');
                        if (x.d && x.d.record) {
                            var cur = getTenantById(id);
                            if (cur) {
                                cur.taxInvoices = [x.d.record].concat(cur.taxInvoices || []);
                                upsertTenant(cur);
                                renderHistory(cur);
                            }
                        }
                        return;
                    }
                    showPreviewMeta(x.d.meta, null);
                    setStatusHtml(
                        '발행 완료 · NTS ' + ((x.d.record && x.d.record.ntsConfirmNum) || '-') +
                        '<br>문서번호 <code>' + ((x.d.record && x.d.record.mgtKey) || '') + '</code>',
                        'ok'
                    );
                    toast('세금계산서 발행 완료', 'success');
                    var cur2 = getTenantById(id);
                    if (cur2 && x.d.record) {
                        cur2.taxInvoices = [x.d.record].concat(cur2.taxInvoices || []);
                        if (!cur2.contractChecklist) cur2.contractChecklist = {};
                        cur2.contractChecklist.tax_invoice = true;
                        upsertTenant(cur2);
                        renderHistory(cur2);
                        refreshOpsTab();
                        renderList();
                    }
                }).catch(function () {
                    if (btn) btn.disabled = false;
                    setStatusHtml('네트워크 오류', 'bad');
                    toast('네트워크 오류', 'warning');
                });
            });
        }

        loadConfig(toast);
    }

    global.TaxInvoiceAdmin = {
        wire: wire,
        fillTaxProfileForm: fillTaxProfileForm,
        readTaxProfileFromForm: readTaxProfileFromForm,
        applyTaxProfileToTenant: applyTaxProfileToTenant,
        renderHistory: renderHistory,
        loadConfig: loadConfig
    };
})(typeof window !== 'undefined' ? window : this);
