/**
 * Omnify 구축 어드민 — 계약 · 커스텀 → 대시보드 초안 · 인프라 파이프라인
 */
(function () {
    var editingId = null;
    var activeTab = 'basic';

    function $(id) { return document.getElementById(id); }

    function toast(msg, type) {
        var el = $('admin-toast');
        if (!el) return;
        el.textContent = msg;
        el.className = 'admin-toast show ' + (type || 'info');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { el.classList.remove('show'); }, 2800);
    }

    function escapeHtml(s) {
        return String(s || '').replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
    }

    function selectedChannels() {
        return Array.prototype.slice.call(document.querySelectorAll('input[name="channel"]:checked'))
            .map(function (c) { return c.value; });
    }

    function switchTab(tab) {
        activeTab = tab;
        document.querySelectorAll('.tab-btn').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
        });
        document.querySelectorAll('.tab-panel').forEach(function (panel) {
            panel.classList.toggle('active', panel.id === 'tab-' + tab);
        });
        if (tab === 'custom') {
            syncChannelCustomGrid();
            updateCustomChecklist();
        }
        if (tab === 'ops') {
            refreshOpsTab();
        }
    }

    function syncPrepaidDefaults() {
        var term = $('f-prepaid').value;
        if (term === '12') $('f-discount').value = 10;
        else if (term === '6') $('f-discount').value = 5;
        else $('f-discount').value = 0;
        updatePrepaidSummary();
    }

    function updatePrepaidSummary() {
        var commercial = {
            monthlyFeeMan: parseFloat($('f-monthly-fee').value) || 0,
            prepaidTerm: $('f-prepaid').value,
            discountPct: parseFloat($('f-discount').value) || 0
        };
        var calc = calcPrepaidTotals(commercial);
        var el = $('prepaid-summary');
        if (!el) return;
        if (!calc.months) {
            el.textContent = '일시납 없음 · 월 ' + commercial.monthlyFeeMan + '만원';
            return;
        }
        el.textContent = calc.months + '개월 · 정상 ' + calc.listTotal + '만원 → 결제 ' + calc.payTotal + '만원 (절약 ' + calc.save + '만원)';
    }

    function syncFeesFromBilling() {
        var plan = $('f-billing').value;
        if (!$('f-monthly-fee').dataset.touched) {
            $('f-monthly-fee').value = PLAN_MONTHLY_MAN[plan] != null ? PLAN_MONTHLY_MAN[plan] : 30;
        }
        if (!$('f-setup-fee').dataset.touched) {
            var setup = PLAN_SETUP_MAN[plan];
            $('f-setup-fee').value = setup != null ? setup : '';
        }
        updatePrepaidSummary();
    }

    function readCommercialForm() {
        var setupRaw = $('f-setup-fee').value.trim();
        return {
            monthlyFeeMan: parseFloat($('f-monthly-fee').value) || 0,
            setupFeeMan: setupRaw === '' ? null : (parseFloat(setupRaw) || 0),
            prepaidTerm: $('f-prepaid').value || 'none',
            discountPct: parseFloat($('f-discount').value) || 0,
            aopEnabled: $('f-prepaid').value === '6' || $('f-prepaid').value === '12',
            refundPolicyKey: 'normal_deduct',
            refundPolicyText: typeof REFUND_POLICY_TEXT !== 'undefined' ? REFUND_POLICY_TEXT : '',
            notes: $('f-commercial-notes').value.trim()
        };
    }

    function fillCommercialForm(com, billingPlan) {
        com = com || defaultCommercial({ billingPlan: billingPlan || 'growth' });
        $('f-monthly-fee').value = com.monthlyFeeMan != null ? com.monthlyFeeMan : '';
        $('f-setup-fee').value = com.setupFeeMan != null ? com.setupFeeMan : '';
        $('f-prepaid').value = com.prepaidTerm || 'none';
        $('f-discount').value = com.discountPct != null ? com.discountPct : 0;
        $('f-commercial-notes').value = com.notes || '';
        updatePrepaidSummary();
    }

    function renderChecklist(containerId, defs, state, nameAttr) {
        var box = $(containerId);
        if (!box) return;
        state = mergeChecklist(defs, state);
        box.innerHTML = defs.map(function (d) {
            return '<label><input type="checkbox" name="' + nameAttr + '" value="' + d.id + '"' +
                (state[d.id] ? ' checked' : '') + '> ' + escapeHtml(d.label) + '</label>';
        }).join('');
    }

    function readChecklist(nameAttr, defs) {
        var state = defaultChecklistState(defs);
        document.querySelectorAll('input[name="' + nameAttr + '"]').forEach(function (el) {
            state[el.value] = el.checked;
        });
        return state;
    }

    function formatQuoteUpdatedAt(iso) {
        if (!iso) return '';
        try {
            var d = new Date(iso);
            if (isNaN(d.getTime())) return '';
            var pad = function (n) { return n < 10 ? '0' + n : String(n); };
            return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
                ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
        } catch (e) {
            return '';
        }
    }

    function updateQuoteStatus(tenant, dirty) {
        var el = $('quote-status');
        if (!el) return;
        if (!tenant || tenant.id === '(draft)') {
            el.textContent = '초안 · 저장하려면 테넌트 생성 필요';
            el.className = 'quote-status dirty';
            return;
        }
        if (dirty) {
            el.textContent = '수정됨 · 저장 필요';
            el.className = 'quote-status dirty';
            return;
        }
        if (tenant.quoteText) {
            el.textContent = '저장됨' + (tenant.quoteUpdatedAt ? ' · ' + formatQuoteUpdatedAt(tenant.quoteUpdatedAt) : '');
            el.className = 'quote-status saved';
            return;
        }
        el.textContent = '자동 생성 · 미저장';
        el.className = 'quote-status';
    }

    function getQuoteEditorText() {
        var el = $('quote-preview');
        return el ? String(el.value || '') : '';
    }

    function setQuoteEditorText(text) {
        var el = $('quote-preview');
        if (el) el.value = text != null ? text : '';
    }

    function refreshQuotePreview(tenant, opts) {
        opts = opts || {};
        var el = $('quote-preview');
        if (!el) return;
        if (!tenant) {
            setQuoteEditorText('');
            el.placeholder = '테넌트를 저장·선택하면 견적이 표시됩니다.';
            updateQuoteStatus(null, false);
            return;
        }
        if (!opts.force && tenant.quoteText) {
            setQuoteEditorText(tenant.quoteText);
            updateQuoteStatus(tenant, false);
            return;
        }
        setQuoteEditorText(buildQuoteText(tenant));
        updateQuoteStatus(tenant, !!(opts.force && tenant.quoteText));
    }

    function ensureIntakeToken(tenant) {
        if (!tenant) return '';
        if (tenant.intakeToken && String(tenant.intakeToken).length >= 8) return tenant.intakeToken;
        var tok = 'in_' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 8);
        tenant.intakeToken = tok;
        tenant.updatedAt = new Date().toISOString();
        upsertTenant(tenant);
        return tok;
    }

    function intakePublicUrl(token) {
        var origin = (window.location && window.location.origin && window.location.protocol !== 'file:')
            ? window.location.origin
            : 'https://omnify.kr';
        return origin.replace(/\/$/, '') + '/intake.html?token=' + encodeURIComponent(token);
    }

    function refreshIntakePanel(tenant) {
        var st = $('intake-status');
        var pre = $('intake-preview');
        if (!st || !pre) return;
        if (!tenant || tenant.id === '(draft)') {
            st.textContent = '테넌트 저장 후 수집 링크를 발급할 수 있습니다.';
            pre.textContent = '제출 전입니다.';
            return;
        }
        var tok = tenant.intakeToken || '';
        var url = tok ? intakePublicUrl(tok) : '(링크 복사 시 자동 발급)';
        var ci = tenant.customerIntake || {};
        st.innerHTML = '상태: <strong>' + (ci.status === 'submitted' ? '제출됨' : '대기') + '</strong>' +
            (ci.submittedAt ? ' · ' + String(ci.submittedAt).replace('T', ' ').slice(0, 16) : '') +
            '<br><span class="muted" style="word-break:break-all">' + escapeHtml(url) + '</span>';
        if (ci.status !== 'submitted' || !tok) {
            pre.textContent = '아직 고객 제출이 없습니다. 링크를 보내 주세요.';
            return;
        }
        pre.textContent = '불러오는 중…';
        fetch('/api/intake?token=' + encodeURIComponent(tok), { credentials: 'omit' })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                if (!d || !d.intake || !d.intake.intake) {
                    pre.textContent = '제출 기록 없음';
                    return;
                }
                pre.textContent = JSON.stringify(d.intake.intake, null, 2);
            })
            .catch(function () {
                pre.textContent = '조회 실패 — 네트워크/배포 상태를 확인하세요.';
            });
    }

    function copyIntakeLink() {
        if (!editingId) {
            toast('먼저 테넌트를 저장·선택하세요.', 'warning');
            return;
        }
        var t = getTenantById(editingId);
        if (!t) return;
        var tok = ensureIntakeToken(t);
        var url = intakePublicUrl(tok);
        refreshIntakePanel(t);
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function () {
                toast('수집 링크가 복사되었습니다. 고객에게 전달하세요.', 'success');
            }).catch(function () {
                toast(url, 'info');
            });
        } else {
            toast(url, 'info');
        }
    }

    function exportContractPdf() {
        var t = editingId ? getTenantById(editingId) : null;
        if (!t) {
            try {
                var form = readForm();
                if (form.companyName) {
                    t = buildTenantDraft(form);
                    t.id = '(draft)';
                }
            } catch (e) { /* ignore */ }
        }
        if (!t || !t.companyName) {
            toast('계약서를 만들 고객사·요금 정보가 없습니다.', 'warning');
            return;
        }
        if (!window.OmnifyContractPdf || !OmnifyContractPdf.openContractPdf) {
            toast('표준계약서 모듈을 불러오지 못했습니다.', 'warning');
            return;
        }
        var result = OmnifyContractPdf.openContractPdf(t);
        if (!result || !result.ok) {
            toast('팝업이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요.', 'warning');
            return;
        }
        toast('인쇄 창에서 「PDF로 저장」·양측 기명·날인 후 효력', 'success');
    }

    function exportQuotePdf() {
        var text = getQuoteEditorText().trim();
        if (!text) {
            toast('견적 내용이 비어 있습니다. 저장·생성 후 PDF를 출력하세요.', 'warning');
            return;
        }
        var t = editingId ? getTenantById(editingId) : null;
        if (!t) {
            try {
                var form = readForm();
                if (form.companyName) {
                    t = buildTenantDraft(form);
                    t.id = '(draft)';
                }
            } catch (e) { /* ignore */ }
        }
        if (!t) {
            toast('견적서에 넣을 고객사 정보가 없습니다.', 'warning');
            return;
        }
        if (!window.OmnifyQuotePdf || !OmnifyQuotePdf.openQuotePdf) {
            toast('견적서 PDF 모듈을 불러오지 못했습니다.', 'warning');
            return;
        }
        var result = OmnifyQuotePdf.openQuotePdf(t, text);
        if (!result || !result.ok) {
            toast('팝업이 차단되었습니다. 브라우저에서 팝업을 허용해 주세요.', 'warning');
            return;
        }
        toast('인쇄 창에서 「PDF로 저장」을 선택하세요.', 'success');
    }

    function saveQuoteText() {
        if (!editingId) {
            toast('먼저 테넌트를 생성·저장하세요.', 'warning');
            return;
        }
        var t = getTenantById(editingId);
        if (!t) return;
        var text = getQuoteEditorText().trim();
        if (!text) {
            toast('견적 내용이 비어 있습니다.', 'warning');
            return;
        }
        t.quoteText = text;
        t.quoteUpdatedAt = new Date().toISOString();
        t.updatedAt = t.quoteUpdatedAt;
        upsertTenant(t);
        renderList();
        updateQuoteStatus(t, false);
        toast('견적이 저장되었습니다.', 'success');
    }

    function refreshOpsTab() {
        var t = editingId ? getTenantById(editingId) : null;
        if (t) {
            renderChecklist('contract-checklist', CONTRACT_CHECKLIST_DEFS, t.contractChecklist, 'contract-check');
            renderChecklist('ops-checklist', OPS_CHECKLIST_DEFS, t.opsChecklist, 'ops-check');
            $('f-ops-notes').value = t.opsNotes || '';
            refreshQuotePreview(t);
            refreshIntakePanel(t);
            if (typeof TaxInvoiceAdmin !== 'undefined' && TaxInvoiceAdmin.fillTaxProfileForm) {
                TaxInvoiceAdmin.fillTaxProfileForm(t);
            }
        } else {
            renderChecklist('contract-checklist', CONTRACT_CHECKLIST_DEFS, {}, 'contract-check');
            renderChecklist('ops-checklist', OPS_CHECKLIST_DEFS, {}, 'ops-check');
            $('f-ops-notes').value = '';
            refreshIntakePanel(null);
            if (typeof TaxInvoiceAdmin !== 'undefined' && TaxInvoiceAdmin.fillTaxProfileForm) {
                TaxInvoiceAdmin.fillTaxProfileForm(null);
            }
            var draft = null;
            try {
                var form = readForm();
                if (form.companyName) {
                    draft = buildTenantDraft(form);
                    draft.id = '(draft)';
                }
            } catch (e) { /* ignore */ }
            refreshQuotePreview(draft);
        }
    }

    function saveOpsOnly() {
        if (!editingId) {
            toast('먼저 테넌트를 생성·저장하세요.', 'warning');
            return;
        }
        var t = getTenantById(editingId);
        if (!t) return;
        t.contractChecklist = readChecklist('contract-check', CONTRACT_CHECKLIST_DEFS);
        t.opsChecklist = readChecklist('ops-check', OPS_CHECKLIST_DEFS);
        t.opsNotes = $('f-ops-notes').value.trim();
        if (typeof TaxInvoiceAdmin !== 'undefined' && TaxInvoiceAdmin.applyTaxProfileToTenant) {
            TaxInvoiceAdmin.applyTaxProfileToTenant(t);
        }
        var quote = getQuoteEditorText().trim();
        if (quote) {
            t.quoteText = quote;
            t.quoteUpdatedAt = new Date().toISOString();
        }
        t.updatedAt = new Date().toISOString();
        upsertTenant(t);
        renderList();
        refreshOpsTab();
        toast('체크리스트 · 견적 · 메모 저장됨', 'success');
    }

    function readCustomForm() {
        var channels = selectedChannels();
        var weights = {};
        var urls = {};
        var margins = { global: parseFloat($('c-margin-global').value) || 0 };
        channels.forEach(function (id) {
            var w = document.getElementById('cw-' + id);
            var u = document.getElementById('cu-' + id);
            var m = document.getElementById('cm-' + id);
            weights[id] = w ? parseInt(w.value, 10) || 0 : 0;
            urls[id] = u ? u.value.trim() : '';
            margins[id] = m ? parseFloat(m.value) || 0 : 30;
        });
        var briefingItems = {};
        document.querySelectorAll('input[name="brief-item"]').forEach(function (el) {
            briefingItems[el.value] = el.checked;
        });
        var phase1 = Array.prototype.slice.call(document.querySelectorAll('input[name="phase1"]:checked'))
            .map(function (el) { return el.value; });

        return {
            brand: {
                displayName: $('c-display').value.trim(),
                legalName: $('c-legal').value.trim(),
                titleSuffix: $('c-title-suffix').value.trim() || '커맨드 센터'
            },
            biz: {
                monthlyGmvEok: parseFloat($('c-gmv').value) || 0,
                homeMallSharePct: parseFloat($('c-mall-share').value) || 0,
                avgOrderValue: parseInt($('c-aov').value, 10) || 0,
                goLiveDate: $('c-golive').value || '',
                phase1Modules: phase1,
                customRequests: $('c-requests').value.trim(),
                buildNotes: $('c-build-notes').value.trim()
            },
            kpi: {
                monthlyTargetEok: parseFloat($('c-target-eok').value) || 0,
                currentRevenueEok: parseFloat($('c-current-eok').value) || 0,
                dailyOrderTarget: parseInt($('c-daily-orders').value, 10) || 0,
                targetMargin: parseFloat($('c-target-margin').value) || 0,
                targetRoas: parseFloat($('c-target-roas').value) || 0
            },
            margins: margins,
            channelWeights: weights,
            channelAdminUrls: urls,
            inventory: {
                defaultSafetyDays: parseInt($('c-safety-days').value, 10) || 14,
                defaultReorderPoint: parseInt($('c-reorder').value, 10) || 50,
                defaultLeadTimeDays: parseInt($('c-lead').value, 10) || 7,
                autoAlertEnabled: $('c-auto-alert').checked
            },
            briefing: {
                sendTime: $('c-brief-time').value || '08:30',
                items: briefingItems,
                recipientsText: $('c-brief-recipients').value.trim()
            },
            team: {
                seedText: $('c-team').value.trim()
            },
            ads: {
                monthlyBudgetMan: parseInt($('c-ad-budget').value, 10) || 0,
                mediaText: $('c-ad-media').value.trim()
            }
        };
    }

    function fillCustomForm(custom, channels) {
        custom = mergeCustomConfig(defaultCustomConfig({ companyName: $('f-company').value, channels: channels || selectedChannels() }), custom || null);
        $('c-display').value = custom.brand.displayName || '';
        $('c-legal').value = custom.brand.legalName || '';
        $('c-title-suffix').value = custom.brand.titleSuffix || '커맨드 센터';
        $('c-gmv').value = custom.biz.monthlyGmvEok || '';
        $('c-mall-share').value = custom.biz.homeMallSharePct != null ? custom.biz.homeMallSharePct : 50;
        $('c-aov').value = custom.biz.avgOrderValue || '';
        $('c-golive').value = custom.biz.goLiveDate || '';
        $('c-requests').value = custom.biz.customRequests || '';
        $('c-build-notes').value = custom.biz.buildNotes || '';
        document.querySelectorAll('input[name="phase1"]').forEach(function (el) {
            el.checked = (custom.biz.phase1Modules || []).indexOf(el.value) >= 0;
        });
        $('c-target-eok').value = custom.kpi.monthlyTargetEok || '';
        $('c-current-eok').value = custom.kpi.currentRevenueEok || '';
        $('c-daily-orders').value = custom.kpi.dailyOrderTarget || '';
        $('c-target-margin').value = custom.kpi.targetMargin || '';
        $('c-target-roas').value = custom.kpi.targetRoas || '';
        $('c-margin-global').value = (custom.margins && custom.margins.global) || '';
        $('c-safety-days').value = custom.inventory.defaultSafetyDays;
        $('c-reorder').value = custom.inventory.defaultReorderPoint;
        $('c-lead').value = custom.inventory.defaultLeadTimeDays;
        $('c-auto-alert').checked = custom.inventory.autoAlertEnabled !== false;
        $('c-brief-time').value = custom.briefing.sendTime || '08:30';
        document.querySelectorAll('input[name="brief-item"]').forEach(function (el) {
            el.checked = custom.briefing.items[el.value] !== false;
        });
        $('c-brief-recipients').value = custom.briefing.recipientsText || '이름|역할|전화';
        $('c-team').value = custom.team.seedText || '이름|역할|admin\n이름|역할|member';
        $('c-ad-budget').value = custom.ads.monthlyBudgetMan || '';
        $('c-ad-media').value = custom.ads.mediaText || '매체명|유형|50\n매체명|유형|35\n매체명|유형|40';
        syncChannelCustomGrid(custom);
        updateCustomChecklist();
    }

    var weightBalanceQuiet = false;

    function channelWeightInputs() {
        return selectedChannels().map(function (id) {
            return document.getElementById('cw-' + id);
        }).filter(Boolean);
    }

    function updateChannelWeightSum() {
        var el = $('channel-weight-sum');
        if (!el) return;
        var inputs = channelWeightInputs();
        if (!inputs.length) {
            el.innerHTML = '비중 합 <strong>—</strong>';
            el.className = 'weight-sum';
            return;
        }
        var sum = 0;
        inputs.forEach(function (inp) { sum += parseFloat(inp.value) || 0; });
        sum = Math.round(sum * 10) / 10;
        var ok = Math.abs(sum - 100) < 0.6;
        el.innerHTML = '비중 합 <strong>' + sum + '</strong>%';
        el.className = 'weight-sum ' + (ok ? 'ok' : 'bad');
    }

    /** 위에서부터 index까지 고정 → 아래 행에 나머지(100−합) 균등 배분 */
    function redistributeWeightsFrom(index) {
        if (weightBalanceQuiet) return;
        var inputs = channelWeightInputs();
        if (!inputs.length) {
            updateChannelWeightSum();
            return;
        }
        if (index < 0 || index >= inputs.length - 1) {
            updateChannelWeightSum();
            return;
        }
        var locked = 0;
        for (var i = 0; i <= index; i++) {
            locked += Math.max(0, parseFloat(inputs[i].value) || 0);
        }
        var rest = Math.max(0, Math.round((100 - locked) * 10) / 10);
        var below = inputs.length - index - 1;
        var each = Math.floor(rest / below);
        var rem = Math.round((rest - each * below) * 10) / 10;
        weightBalanceQuiet = true;
        for (var j = 0; j < below; j++) {
            var v = each + (j === below - 1 ? rem : 0);
            inputs[index + 1 + j].value = v;
        }
        weightBalanceQuiet = false;
        updateChannelWeightSum();
    }

    function syncChannelCustomGrid(custom) {
        var box = $('channel-custom-grid');
        if (!box) return;
        var channels = selectedChannels();
        custom = custom || {
            channelWeights: evenChannelWeights(channels),
            channelAdminUrls: {},
            margins: {}
        };
        if (!channels.length) {
            box.innerHTML = '<p class="muted">기본 탭에서 채널을 먼저 선택하세요.</p>';
            updateChannelWeightSum();
            return;
        }
        var nameMap = {};
        CHANNEL_CATALOG.forEach(function (c) { nameMap[c.id] = c.label; });
        box.innerHTML = channels.map(function (id) {
            var w = (custom.channelWeights && custom.channelWeights[id] != null)
                ? custom.channelWeights[id]
                : (evenChannelWeights(channels)[id] || 0);
            var url = (custom.channelAdminUrls && custom.channelAdminUrls[id]) || CHANNEL_ADMIN_URL_DEFAULTS[id] || '';
            var m = (custom.margins && custom.margins[id] != null) ? custom.margins[id] : 30;
            return '<div class="weight-row">' +
                '<div><span class="ch-name">' + escapeHtml(nameMap[id] || id) + '</span>' +
                '<label class="field" style="margin:0"><span>비중 %</span><input id="cw-' + id + '" type="number" min="0" max="100" value="' + w + '"></label></div>' +
                '<label class="field" style="margin:0"><span>마진 %</span><input id="cm-' + id + '" type="number" min="0" max="100" step="0.1" value="' + m + '"></label>' +
                '<label class="field" style="margin:0"><span>어드민 URL</span><input id="cu-' + id + '" type="text" value="' + escapeHtml(url) + '"></label>' +
                '</div>';
        }).join('');
        channels.forEach(function (id, idx) {
            var wInp = document.getElementById('cw-' + id);
            if (wInp) {
                wInp.addEventListener('input', function () {
                    redistributeWeightsFrom(idx);
                    updateCustomChecklist();
                });
                wInp.addEventListener('change', function () {
                    redistributeWeightsFrom(idx);
                    updateCustomChecklist();
                });
            }
        });
        box.querySelectorAll('input').forEach(function (inp) {
            if (inp.id && inp.id.indexOf('cw-') === 0) return;
            inp.addEventListener('input', updateCustomChecklist);
        });
        updateChannelWeightSum();
    }

    function updateCustomChecklist() {
        var custom = readCustomForm();
        if (!$('c-display').value.trim() && $('f-company').value.trim()) {
            custom.brand.displayName = $('f-company').value.trim();
        }
        var comp = countCustomCompleteness(custom);
        var el = $('custom-completeness');
        if (el) el.innerHTML = '커스텀 완성도: <strong>' + comp.pct + '%</strong> (' + comp.done + '/' + comp.total + ')';
        var list = $('custom-checklist');
        if (!list) return;
        var rows = [
            ['브랜드 표시명', !!(custom.brand.displayName || $('f-company').value.trim())],
            ['월 매출 목표', custom.kpi.monthlyTargetEok > 0],
            ['비즈니스/오픈일', !!(custom.biz.monthlyGmvEok > 0 || custom.biz.goLiveDate)],
            ['채널 비중', Object.keys(custom.channelWeights).length > 0],
            ['브리핑 시각·항목', !!custom.briefing.sendTime],
            ['팀 시드', !!custom.team.seedText],
            ['커스텀 요청서', !!custom.biz.customRequests],
            ['Phase1 모듈', !!(custom.biz.phase1Modules && custom.biz.phase1Modules.length)]
        ];
        list.innerHTML = '<ul class="prov-steps">' + rows.map(function (r) {
            return '<li class="prov-' + (r[1] ? 'done' : 'pending') + '"><span class="prov-ico">' + (r[1] ? '✓' : '·') + '</span>' +
                '<div><p class="prov-label">' + r[0] + '</p></div></li>';
        }).join('') + '</ul>';
    }

    function updateNamingPreview() {
        var el = $('naming-preview');
        if (!el) return;
        var email = normalizeContactEmail($('f-email').value);
        var en = $('f-company-en').value.trim();
        var ko = $('f-company').value.trim();
        var keyEl = $('f-key-id');
        var key = '';
        if (keyEl && keyEl.dataset.touched) {
            key = normalizeKeyId(keyEl.value);
            keyEl.value = key;
        } else if (keyEl) {
            key = typeof suggestKeyId === 'function' ? suggestKeyId(en, ko, editingId) : '';
            keyEl.value = key;
        }
        var ok = isValidKeyId(key);
        var mailNote = (email && isConsumerEmail(email)) ? ' · 개인메일은 연락처만' : '';
        var clash = ok && findTenantByKeyId(key, editingId);
        el.textContent = (ok ? '사용: 폴더·키 = ' + key : '키 ID 형식 오류 (영문 시작 · a-z0-9_-)') +
            (clash ? ' · ⚠ 이미 사용 중: ' + clash.companyName : '') +
            ' · 연락 ' + (email || '(미입력)') + mailNote;
        el.style.color = (!ok || clash) ? '#fcd34d' : '';
    }

    function readForm() {
        var channels = selectedChannels();
        var custom = readCustomForm();
        if (!custom.brand.displayName) custom.brand.displayName = $('f-company').value.trim();
        if (!custom.brand.legalName) custom.brand.legalName = $('f-company').value.trim();
        var email = normalizeContactEmail($('f-email').value);
        var keyId = normalizeKeyId($('f-key-id').value);
        return {
            companyName: $('f-company').value.trim(),
            companyNameEn: $('f-company-en').value.trim(),
            businessNo: $('f-bizno').value.trim(),
            contactName: $('f-contact').value.trim(),
            contactEmail: email,
            keyId: keyId,
            contactPhone: $('f-phone').value.trim(),
            projectFolder: keyId,
            accountOwner: $('f-account-owner').value.trim() || 'JK',
            lifecycle: $('f-lifecycle').value || 'draft',
            health: $('f-health').value || 'green',
            nextAction: $('f-next-action').value.trim(),
            contractStart: $('f-contract-start').value || '',
            contractEnd: $('f-contract-end').value || '',
            billingPlan: $('f-billing').value,
            serviceTier: $('f-service').value,
            specialPricing: $('f-special').checked,
            seats: parseInt($('f-seats').value, 10) || 0,
            briefingRecipients: parseInt($('f-briefing').value, 10) || 0,
            channels: channels,
            wms: $('f-wms').value,
            inventoryWrite: $('f-inv-write').checked,
            skuApprox: parseInt($('f-sku').value, 10) || 0,
            driveEnabled: $('f-drive-on').checked,
            driveFolderUrl: $('f-drive-url').value.trim(),
            driveFolderId: typeof extractDriveFolderId === 'function'
                ? extractDriveFolderId($('f-drive-url').value.trim())
                : '',
            driveOwnerEmail: $('f-drive-owner').value.trim(),
            driveSharedWith: $('f-drive-shared').value.trim(),
            notes: $('f-notes').value.trim(),
            commercial: readCommercialForm(),
            opsChecklist: document.querySelectorAll('input[name="ops-check"]').length
                ? readChecklist('ops-check', OPS_CHECKLIST_DEFS)
                : undefined,
            contractChecklist: document.querySelectorAll('input[name="contract-check"]').length
                ? readChecklist('contract-check', CONTRACT_CHECKLIST_DEFS)
                : undefined,
            opsNotes: $('f-ops-notes') ? $('f-ops-notes').value.trim() : '',
            taxProfile: (typeof TaxInvoiceAdmin !== 'undefined' && TaxInvoiceAdmin.readTaxProfileFromForm)
                ? TaxInvoiceAdmin.readTaxProfileFromForm()
                : undefined,
            custom: custom
        };
    }

    function fillForm(t) {
        editingId = t ? t.id : null;
        $('form-title').textContent = t ? '계약 수정 · 재구축' : '신규 계약 등록';
        $('f-company').value = t ? t.companyName : '';
        $('f-company-en').value = t ? (t.companyNameEn || '') : '';
        $('f-bizno').value = t ? (t.businessNo || '') : '';
        $('f-contact').value = t ? (t.contactName || '') : '';
        $('f-email').value = t ? (t.contactEmail || '') : '';
        $('f-phone').value = t ? (t.contactPhone || '') : '';
        $('f-key-id').value = t ? (t.keyId || t.projectFolder || '') : '';
        $('f-key-id').dataset.touched = t && (t.keyId || t.projectFolder) ? '1' : '';
        $('f-account-owner').value = t ? (t.accountOwner || 'JK') : 'JK';
        $('f-lifecycle').value = t ? (t.lifecycle || 'draft') : 'draft';
        $('f-health').value = t ? (t.health || 'green') : 'green';
        $('f-next-action').value = t ? (t.nextAction || '') : '';
        $('f-contract-start').value = t ? (t.contractStart || '') : '';
        $('f-contract-end').value = t ? (t.contractEnd || '') : '';
        $('f-billing').value = t ? t.billingPlan : 'growth';
        $('f-service').value = t ? t.serviceTier : 'enterprise';
        $('f-special').checked = t ? !!t.specialPricing : false;
        $('f-seats').value = t ? t.seats : 10;
        $('f-briefing').value = t ? t.briefingRecipients : 5;
        $('f-wms').value = t ? t.wms : 'sabangnet';
        $('f-inv-write').checked = t ? !!t.inventoryWrite : false;
        $('f-sku').value = t ? (t.skuApprox || '') : '';
        $('f-drive-on').checked = t ? !!t.driveEnabled : true;
        $('f-drive-url').value = t ? (t.driveFolderUrl || t.driveFolderId || '') : '';
        $('f-drive-owner').value = t ? (t.driveOwnerEmail || '') : '';
        $('f-drive-shared').value = t
            ? (t.driveSharedWith || (typeof DEFAULT_OMNIFY_DRIVE_SHARE_EMAIL !== 'undefined' ? DEFAULT_OMNIFY_DRIVE_SHARE_EMAIL : ''))
            : (typeof DEFAULT_OMNIFY_DRIVE_SHARE_EMAIL !== 'undefined' ? DEFAULT_OMNIFY_DRIVE_SHARE_EMAIL : '');
        $('f-notes').value = t ? (t.notes || '') : '';
        document.querySelectorAll('input[name="channel"]').forEach(function (c) {
            c.checked = t ? (t.channels || []).indexOf(c.value) >= 0 : false;
        });
        $('btn-submit').textContent = t ? '저장 후 재구축 실행' : '초안 생성 · 인프라 자동 구축';
        syncDefaultsFromTier(false);
        syncDriveSection();
        fillCommercialForm(t && t.commercial ? t.commercial : null, t ? t.billingPlan : $('f-billing').value);
        if ($('f-ops-notes')) $('f-ops-notes').value = t ? (t.opsNotes || '') : '';
        fillCustomForm(t && t.custom ? t.custom : null, t ? t.channels : selectedChannels());
        updateNamingPreview();
        refreshIntakePanel(t);
        if (typeof TaxInvoiceAdmin !== 'undefined' && TaxInvoiceAdmin.fillTaxProfileForm) {
            TaxInvoiceAdmin.fillTaxProfileForm(t);
        }
        if (activeTab === 'ops') refreshOpsTab();
        else refreshQuotePreview(t);
    }

    function syncDefaultsFromTier(force) {
        var tier = $('f-service').value;
        var seatsDefault = tier === 'enterprise' ? 10 : tier === 'growth' ? 5 : 2;
        var briefDefault = typeof defaultBriefingLimit === 'function' ? defaultBriefingLimit(tier) : 1;
        if (force || !$('f-seats').dataset.touched) $('f-seats').value = seatsDefault;
        if (force || !$('f-briefing').dataset.touched) $('f-briefing').value = briefDefault;
        if (force || !$('f-drive-on').dataset.touched) {
            $('f-drive-on').checked = true;
        }
        syncDriveSection();
    }

    function syncDriveSection() {
        var on = $('f-drive-on').checked;
        ['f-drive-url', 'f-drive-owner', 'f-drive-shared'].forEach(function (id) {
            var el = $(id);
            if (el) el.disabled = !on;
        });
    }

    function statusBadge(st) {
        var map = {
            draft: ['draft', '초안'],
            ready: ['ready', '구축완료'],
            error: ['error', '오류'],
            pending: ['pending', '대기'],
            building: ['building', '구축중'],
            live: ['live', '운영중'],
            paused: ['paused', '일시중단'],
            ended: ['ended', '종료']
        };
        var m = map[st] || ['pending', st || '-'];
        return '<span class="badge ' + m[0] + '">' + m[1] + '</span>';
    }

    function renderPortfolio() {
        var statsEl = $('portfolio-stats');
        var body = $('portfolio-body');
        if (!body) return;
        var list = loadTenants();
        var q = ($('pf-search') && $('pf-search').value || '').trim().toLowerCase();
        var lf = $('pf-lifecycle') && $('pf-lifecycle').value;
        var plan = $('pf-plan') && $('pf-plan').value;
        var health = $('pf-health') && $('pf-health').value;

        var counts = { total: list.length, live: 0, building: 0, ready: 0, risk: 0 };
        list.forEach(function (t) {
            if (t.lifecycle === 'live') counts.live++;
            if (t.lifecycle === 'building') counts.building++;
            if (t.lifecycle === 'ready') counts.ready++;
            if (t.health === 'red' || t.health === 'yellow') counts.risk++;
        });
        if (statsEl) {
            statsEl.innerHTML =
                '<div class="stat-pill"><span class="n">' + counts.total + '</span><span class="l">전체 업체</span></div>' +
                '<div class="stat-pill"><span class="n">' + counts.live + '</span><span class="l">운영중</span></div>' +
                '<div class="stat-pill"><span class="n">' + counts.building + '</span><span class="l">구축중</span></div>' +
                '<div class="stat-pill"><span class="n">' + counts.ready + '</span><span class="l">구축완료</span></div>' +
                '<div class="stat-pill"><span class="n">' + counts.risk + '</span><span class="l">주의·위험</span></div>';
        }

        var filtered = list.filter(function (t) {
            if (lf && t.lifecycle !== lf) return false;
            if (plan && t.billingPlan !== plan) return false;
            if (health && t.health !== health) return false;
            if (q) {
                var hay = [t.companyName, t.companyNameEn, t.keyId, t.contactEmail, t.projectFolder, t.id, t.nextAction]
                    .join(' ').toLowerCase();
                if (hay.indexOf(q) < 0) return false;
            }
            return true;
        });

        if (!filtered.length) {
            body.innerHTML = '<tr><td colspan="9" class="muted">' +
                (list.length ? '필터에 맞는 업체가 없습니다.' : '등록된 업체가 없습니다. 아래에서 신규 계약을 등록하세요.') +
                '</td></tr>';
            return;
        }

        body.innerHTML = filtered.map(function (t) {
            var ops = checklistProgress(OPS_CHECKLIST_DEFS, t.opsChecklist);
            var con = checklistProgress(CONTRACT_CHECKLIST_DEFS, t.contractChecklist);
            var lifeOpts = LIFECYCLE_DEFS.map(function (d) {
                return '<option value="' + d.id + '"' + (t.lifecycle === d.id ? ' selected' : '') + '>' + d.label + '</option>';
            }).join('');
            var healthOpts = HEALTH_DEFS.map(function (d) {
                return '<option value="' + d.id + '"' + (t.health === d.id ? ' selected' : '') + '>' + d.label + '</option>';
            }).join('');
            var key = t.keyId || t.projectFolder || '-';
            return '<tr data-id="' + escapeHtml(t.id) + '">' +
                '<td><strong>' + escapeHtml(t.companyName) + '</strong><br><span class="muted">#' + escapeHtml(t.id) +
                (t.accountOwner ? ' · ' + escapeHtml(t.accountOwner) : '') + '</span></td>' +
                '<td class="mono">' + escapeHtml(key) + '</td>' +
                '<td class="mono">' + escapeHtml(t.contactEmail || '-') + '</td>' +
                '<td>' + escapeHtml(t.billingPlan) +
                (t.specialPricing ? '<br><span class="muted">서비스 ' + escapeHtml(t.serviceTier) + '</span>' : '') + '</td>' +
                '<td><select class="inline" data-pf="lifecycle">' + lifeOpts + '</select></td>' +
                '<td><span class="health-dot health-' + escapeHtml(t.health || 'green') + '"></span>' +
                '<select class="inline" data-pf="health">' + healthOpts + '</select></td>' +
                '<td><input class="inline" data-pf="nextAction" type="text" value="' + escapeHtml(t.nextAction || '') + '" placeholder="다음 액션"></td>' +
                '<td><span class="muted">계약 ' + con.pct + '% · 구축 ' + ops.pct + '%</span><br>' +
                statusBadge(t.status) + '</td>' +
                '<td class="tenant-actions">' +
                '<button type="button" class="btn-sm" data-pf-act="edit">수정</button>' +
                '<button type="button" class="btn-sm" data-pf-act="open">대시보드</button>' +
                '<button type="button" class="btn-sm" data-pf-act="save">저장</button>' +
                '</td></tr>';
        }).join('');
    }

    function patchTenantFromPortfolioRow(row) {
        var id = row.getAttribute('data-id');
        var t = getTenantById(id);
        if (!t) return null;
        var life = row.querySelector('[data-pf="lifecycle"]');
        var health = row.querySelector('[data-pf="health"]');
        var next = row.querySelector('[data-pf="nextAction"]');
        if (life) t.lifecycle = life.value;
        if (health) t.health = health.value;
        if (next) t.nextAction = next.value.trim();
        t.updatedAt = new Date().toISOString();
        upsertTenant(t);
        return t;
    }

    function renderList() {
        var list = loadTenants();
        var el = $('tenant-list');
        var empty = $('tenant-empty');
        if (!list.length) {
            el.innerHTML = '';
            empty.classList.remove('hidden');
            renderPortfolio();
            return;
        }
        empty.classList.add('hidden');
        el.innerHTML = list.map(function (t) {
            var ch = (t.channels || []).length;
            var comp = t.custom ? countCustomCompleteness(t.custom) : { pct: 0 };
            return '<article class="tenant-card" data-id="' + t.id + '">' +
                '<div class="tenant-card-top">' +
                '<div><h3>' + escapeHtml(t.companyName) + '</h3>' +
                '<p class="muted">키 ' + escapeHtml(t.keyId || t.projectFolder || '-') +
                '<br>메일 ' + escapeHtml(t.contactEmail || '-') +
                '<br>청구 ' + t.billingPlan + ' · 서비스 ' + t.serviceTier +
                (t.specialPricing ? ' · 특수가격' : '') + '</p></div>' +
                statusBadge(t.lifecycle || t.status) +
                '</div>' +
                '<p class="meta">채널 ' + ch + ' · 좌석 ' + t.seats +
                ' · 커스텀 ' + comp.pct + '%' +
                (t.commercial && t.commercial.aopEnabled ? ' · AOP ' + t.commercial.prepaidTerm + 'm' : '') +
                ' · 구축 ' + checklistProgress(OPS_CHECKLIST_DEFS, t.opsChecklist).pct + '%</p>' +
                '<div class="tenant-actions">' +
                '<button type="button" class="btn-sm" data-act="open">대시보드</button>' +
                '<button type="button" class="btn-sm" data-act="edit">수정</button>' +
                '<button type="button" class="btn-sm" data-act="rebuild">재구축</button>' +
                '<button type="button" class="btn-sm danger" data-act="del">삭제</button>' +
                '</div></article>';
        }).join('');
        renderPortfolio();
    }

    function renderProvision(tenant) {
        var box = $('provision-panel');
        if (!tenant) {
            box.innerHTML = '<p class="muted">계약을 등록하면 구축 단계가 여기에 표시됩니다.</p>';
            return;
        }
        var steps = (tenant.provision && tenant.provision.steps) || [];
        var overall = tenant.provision ? tenant.provision.status : '-';
        box.innerHTML = '<div class="prov-head"><strong>' + escapeHtml(tenant.companyName) + '</strong>' +
            '<span class="badge ' + (overall === 'ready' ? 'ready' : overall === 'error' ? 'error' : 'pending') + '">' + overall + '</span></div>' +
            '<ol class="prov-steps">' + steps.map(function (s) {
                var icon = s.status === 'done' ? '✓' : s.status === 'skipped' ? '–' : s.status === 'pending' ? '·' : '!';
                return '<li class="prov-' + s.status + '"><span class="prov-ico">' + icon + '</span>' +
                    '<div><p class="prov-label">' + escapeHtml(s.label) + '</p>' +
                    '<p class="muted">' + escapeHtml(s.message || s.detail) + '</p></div></li>';
            }).join('') + '</ol>' +
            (tenant.status === 'ready'
                ? '<a class="btn primary block" target="_blank" rel="noopener" href="' + tenant.infra.previewPath + '">구축된 대시보드 초안 열기 →</a>'
                : '');
    }

    function createOrUpdate() {
        var form = readForm();
        if (!form.companyName) {
            toast('고객사명을 입력하세요.', 'warning');
            switchTab('basic');
            return;
        }
        if (!isValidKeyId(form.keyId)) {
            toast('키 ID를 입력하세요. (영문 시작 · a-z 0-9 _ -)', 'warning');
            switchTab('basic');
            $('f-key-id').focus();
            return;
        }
        if (!isValidContactEmail(form.contactEmail)) {
            toast('연락 이메일을 올바르게 입력하세요.', 'warning');
            switchTab('basic');
            return;
        }
        var keyId = normalizeKeyId(form.keyId);
        var keyClash = findTenantByKeyId(keyId, editingId);
        if (keyClash) {
            toast('이미 사용 중인 키 ID입니다: ' + keyClash.companyName, 'warning');
            switchTab('basic');
            $('f-key-id').focus();
            return;
        }
        if (!form.channels.length) {
            toast('채널을 1개 이상 선택하세요.', 'warning');
            switchTab('basic');
            return;
        }
        if (isConsumerEmail(form.contactEmail)) {
            toast('개인메일은 연락처로만 저장됩니다. 식별은 키 ID를 사용합니다.', 'info');
        }

        var tenant;
        if (editingId) {
            tenant = getTenantById(editingId);
            if (!tenant) {
                toast('대상을 찾을 수 없습니다.', 'warning');
                return;
            }
            Object.assign(tenant, {
                companyName: form.companyName,
                companyNameEn: form.companyNameEn,
                businessNo: form.businessNo,
                contactName: form.contactName,
                contactEmail: form.contactEmail,
                keyId: keyId,
                contactPhone: form.contactPhone,
                projectFolder: keyId,
                accountOwner: form.accountOwner,
                lifecycle: form.lifecycle === 'draft' ? 'building' : form.lifecycle,
                health: form.health,
                nextAction: form.nextAction,
                contractStart: form.contractStart,
                contractEnd: form.contractEnd,
                billingPlan: form.billingPlan,
                serviceTier: form.serviceTier,
                specialPricing: form.specialPricing,
                seats: form.seats,
                briefingRecipients: form.briefingRecipients,
                channels: form.channels,
                channelCount: form.channels.length,
                wms: form.wms,
                inventoryWrite: form.inventoryWrite,
                skuApprox: form.skuApprox,
                driveEnabled: form.driveEnabled,
                driveFolderUrl: form.driveFolderUrl,
                driveFolderId: form.driveFolderId || (typeof extractDriveFolderId === 'function' ? extractDriveFolderId(form.driveFolderUrl) : ''),
                driveOwnerEmail: form.driveOwnerEmail,
                driveSharedWith: form.driveSharedWith,
                notes: form.notes,
                commercial: defaultCommercial(form),
                opsChecklist: mergeChecklist(OPS_CHECKLIST_DEFS, form.opsChecklist || tenant.opsChecklist),
                contractChecklist: mergeChecklist(CONTRACT_CHECKLIST_DEFS, form.contractChecklist || tenant.contractChecklist),
                opsNotes: form.opsNotes != null ? form.opsNotes : (tenant.opsNotes || ''),
                taxProfile: form.taxProfile || tenant.taxProfile || {},
                custom: mergeCustomConfig(defaultCustomConfig(form), form.custom),
                updatedAt: new Date().toISOString(),
                status: 'draft',
                provision: {
                    status: 'pending',
                    steps: PROVISION_STEPS.map(function (s) {
                        return { id: s.id, label: s.label, detail: s.detail, status: 'pending', at: null, message: '', operatorNote: '' };
                    }),
                    lastError: null
                },
                infra: {
                    storagePrefix: 'tenants/' + keyId,
                    webhookBase: 'https://hooks.omnify.local/' + tenant.id,
                    previewPath: 'demo-dashboard.html?tenant=' + encodeURIComponent(tenant.id) + '&tier=' + encodeURIComponent(form.serviceTier)
                }
            });
            upsertTenant(tenant);
        } else {
            tenant = buildTenantDraft(form);
            if (form.taxProfile) tenant.taxProfile = form.taxProfile;
            tenant.lifecycle = 'building';
            upsertTenant(tenant);
            editingId = tenant.id;
        }

        ensureIntakeToken(tenant);
        refreshIntakePanel(tenant);

        renderList();
        renderProvision(tenant);
        updateCustomChecklist();
        toast('파이프라인 실행 중…', 'info');
        $('btn-submit').disabled = true;

        runProvisionPipeline(tenant.id, function (t) {
            renderProvision(t);
            renderList();
        }).then(function (t) {
            if (t.lifecycle === 'building' || t.lifecycle === 'draft') t.lifecycle = 'ready';
            t.updatedAt = new Date().toISOString();
            upsertTenant(t);
            toast('대시보드 초안 구축 완료', 'success');
            $('btn-submit').disabled = false;
            fillForm(t);
            refreshOpsTab();
            renderList();
            if (TenantStore._pendingSync) {
                TenantStore._pendingSync.then(function () {
                    setStoreStatus('Firestore 저장됨 · ' + t.id, true);
                }).catch(function (err) {
                    setStoreStatus('로컬 저장됨 · 서버 동기화 실패: ' + (err && err.message ? err.message : err), false);
                });
            }
        }).catch(function () {
            toast('구축 중 오류', 'warning');
            $('btn-submit').disabled = false;
        });
    }

    function preloadGotbody() {
        fillForm(null);
        $('f-company').value = '갓바디';
        $('f-company-en').value = 'Gotbody';
        $('f-contact').value = '';
        $('f-email').value = 'ops@gotbody.example';
        $('f-key-id').value = 'omnify_gotbody';
        $('f-key-id').dataset.touched = '1';
        $('f-billing').value = 'growth';
        $('f-service').value = 'enterprise';
        $('f-special').checked = true;
        $('f-seats').value = 10;
        $('f-briefing').value = 5;
        $('f-wms').value = 'sabangnet';
        $('f-inv-write').checked = false;
        $('f-sku').value = 50;
        $('f-drive-on').checked = true;
        $('f-drive-on').dataset.touched = '1';
        $('f-drive-url').value = '';
        $('f-drive-owner').value = '';
        $('f-drive-shared').value = typeof DEFAULT_OMNIFY_DRIVE_SHARE_EMAIL !== 'undefined'
            ? DEFAULT_OMNIFY_DRIVE_SHARE_EMAIL
            : 'omnify-drive@omnify-site.iam.gserviceaccount.com';
        $('f-notes').value = '특수관계 · 서비스 Ent급 · 청구 Growth. 채널~10 · 사방넷 읽기만.';
        $('f-prepaid').value = '12';
        $('f-discount').value = 10;
        $('f-monthly-fee').value = 30;
        $('f-setup-fee').value = 300;
        $('f-commercial-notes').value = '연간 최적화 12개월 일시납 검토';
        $('f-lifecycle').value = 'building';
        $('f-health').value = 'green';
        $('f-next-action').value = 'Drive 폴더·카카오 수신자 수급';
        $('f-account-owner').value = 'JK';
        updatePrepaidSummary();
        updateNamingPreview();
        ['cafe24', 'smartstore', 'coupang', 'ably', 'zigzag', 'musinsa', 'elevenst', 'gmarket', 'auction', 'other'].forEach(function (id) {
            var el = document.querySelector('input[name="channel"][value="' + id + '"]');
            if (el) el.checked = true;
        });
        syncDriveSection();

        var custom = defaultCustomConfig({
            companyName: '갓바디',
            channels: selectedChannels()
        });
        custom.brand.displayName = '갓바디';
        custom.brand.legalName = '갓바디';
        custom.biz.monthlyGmvEok = 15;
        custom.biz.homeMallSharePct = 80;
        custom.biz.avgOrderValue = 48000;
        custom.biz.customRequests = '자사몰(Cafe24) 중심 KPI · 사방넷 읽기 재고 경보 · 브리핑에 반품률은 2차';
        custom.biz.buildNotes = '킥오프 후 Drive 폴더·카카오 수신자 리스트 수급';
        custom.biz.phase1Modules = ['dashboard', 'briefing', 'datahub', 'orders', 'inventory', 'archive', 'comms'];
        custom.kpi.monthlyTargetEok = 18;
        custom.kpi.currentRevenueEok = 14;
        custom.kpi.dailyOrderTarget = 420;
        custom.kpi.targetMargin = 34;
        custom.kpi.targetRoas = 3.2;
        custom.margins.global = 33;
        custom.channelWeights = evenChannelWeights(selectedChannels());
        if (custom.channelWeights.cafe24 != null) {
            custom.channelWeights.cafe24 = 80;
            var others = selectedChannels().filter(function (c) { return c !== 'cafe24'; });
            var rest = 20;
            var each = Math.floor(rest / Math.max(1, others.length));
            var rem = rest - each * others.length;
            others.forEach(function (id, i) {
                custom.channelWeights[id] = each + (i === 0 ? rem : 0);
            });
        }
        custom.team.seedText = '김대표|대표|admin\n운영팀장|운영|member\n물류담당|물류|member';
        custom.briefing.recipientsText = '김대표|대표|010-****-0001\n운영팀장|운영|010-****-0002';
        custom.ads.mediaText = 'Meta Ads|SNS|50\nGoogle Ads|검색|35\n네이버 검색광고|검색|40';
        fillCustomForm(custom, selectedChannels());
        switchTab('custom');
        toast('갓바디 계약·커스텀 예시가 채워졌습니다.', 'info');
    }

    function setStoreStatus(msg, ok) {
        var el = $('store-status');
        if (!el) return;
        el.textContent = msg;
        el.style.color = ok === false ? '#f59e0b' : ok === true ? '#34d399' : '';
    }

    function hydrateFromServer() {
        setStoreStatus('Firestore에서 불러오는 중…');
        return TenantStore.hydrate().then(function (list) {
            setStoreStatus('Firestore 연결됨 · ' + list.length + '건 · ' + new Date().toLocaleTimeString());
            renderList();
            return list;
        }).catch(function (err) {
            setStoreStatus('서버 연결 실패 (로컬 캐시 사용): ' + (err && err.message ? err.message : err), false);
            renderList();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        var chBox = $('channel-grid');
        var groupOrder = [
            { id: 'core', label: '핵심' },
            { id: 'market', label: '종합몰 · 오픈마켓' },
            { id: 'vertical', label: '패션 · 뷰티' },
            { id: 'department', label: '백화점 · 프리미엄' },
            { id: 'lifestyle', label: '장보기 · 리빙 · 소셜' },
            { id: 'special', label: '글로벌 · 홈쇼핑 · 소셜커머스' },
            { id: 'other', label: '기타' }
        ];
        chBox.innerHTML = groupOrder.map(function (g) {
            var items = CHANNEL_CATALOG.filter(function (c) { return (c.group || 'other') === g.id; });
            if (!items.length) return '';
            return '<div class="channel-group">' +
                '<p class="channel-group-title">' + g.label + '</p>' +
                '<div class="channel-group-list">' +
                items.map(function (c) {
                    var tier = c.apiTier || 'D';
                    var meta = typeof channelApiTierMeta === 'function' ? channelApiTierMeta(tier) : { label: tier, title: '' };
                    return '<label class="chk" title="' + escapeHtml(meta.title || '') + '">' +
                        '<input type="checkbox" name="channel" value="' + c.id + '">' +
                        '<span class="chk-label-text">' + escapeHtml(c.label) + '</span>' +
                        '<span class="api-tier api-tier-' + tier + '">API ' + escapeHtml(meta.label) + '</span>' +
                        '</label>';
                }).join('') +
                '</div></div>';
        }).join('');

        $('phase1-grid').innerHTML = CUSTOM_MODULE_OPTIONS.map(function (m) {
            return '<label class="chk"><input type="checkbox" name="phase1" value="' + m.id + '"' +
                (['dashboard', 'briefing', 'datahub', 'orders', 'inventory', 'archive'].indexOf(m.id) >= 0 ? ' checked' : '') +
                '> ' + m.label + '</label>';
        }).join('');

        $('briefing-items-grid').innerHTML = BRIEFING_CUSTOM_ITEMS.map(function (it) {
            return '<label class="chk"><input type="checkbox" name="brief-item" value="' + it.id + '" checked> ' + it.label + '</label>';
        }).join('');

        document.querySelectorAll('.tab-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                switchTab(btn.getAttribute('data-tab'));
            });
        });

        $('f-service').addEventListener('change', function () { syncDefaultsFromTier(true); });
        $('f-billing').addEventListener('change', function () { syncFeesFromBilling(); });
        $('f-seats').addEventListener('input', function () { this.dataset.touched = '1'; });
        $('f-briefing').addEventListener('input', function () { this.dataset.touched = '1'; });
        $('f-drive-on').addEventListener('change', function () {
            this.dataset.touched = '1';
            syncDriveSection();
        });
        $('f-prepaid').addEventListener('change', syncPrepaidDefaults);
        $('f-monthly-fee').addEventListener('input', function () {
            this.dataset.touched = '1';
            updatePrepaidSummary();
        });
        $('f-setup-fee').addEventListener('input', function () { this.dataset.touched = '1'; });
        $('f-discount').addEventListener('input', updatePrepaidSummary);

        $('f-company').addEventListener('input', function () {
            if (!$('c-display').dataset.touched) $('c-display').value = this.value;
            updateCustomChecklist();
        });
        $('c-display').addEventListener('input', function () {
            this.dataset.touched = '1';
            updateCustomChecklist();
        });

        chBox.addEventListener('change', function () {
            syncChannelCustomGrid();
            updateCustomChecklist();
        });

        ['c-gmv', 'c-golive', 'c-target-eok', 'c-team', 'c-requests', 'c-brief-time'].forEach(function (id) {
            var el = $(id);
            if (el) el.addEventListener('input', updateCustomChecklist);
        });
        document.querySelectorAll('input[name="phase1"], input[name="brief-item"]').forEach(function (el) {
            el.addEventListener('change', updateCustomChecklist);
        });

        $('btn-submit').addEventListener('click', function (e) {
            e.preventDefault();
            createOrUpdate();
        });
        $('btn-reset').addEventListener('click', function () {
            editingId = null;
            fillForm(null);
            $('f-seats').dataset.touched = '';
            $('f-briefing').dataset.touched = '';
            $('f-drive-on').dataset.touched = '';
            $('c-display').dataset.touched = '';
            $('f-monthly-fee').dataset.touched = '';
            $('f-setup-fee').dataset.touched = '';
            $('f-key-id').dataset.touched = '';
            syncDefaultsFromTier(true);
            syncFeesFromBilling();
            fillCustomForm(null, []);
            switchTab('basic');
            renderProvision(null);
            updateNamingPreview();
        });
        $('btn-gotbody').addEventListener('click', preloadGotbody);
        $('btn-save-ops').addEventListener('click', saveOpsOnly);
        if ($('btn-load-margin-calc')) {
            $('btn-load-margin-calc').addEventListener('click', function () {
                var payload = (window.OmnifyMarginCalc && OmnifyMarginCalc.loadApplyPayload)
                    ? OmnifyMarginCalc.loadApplyPayload()
                    : null;
                if (!payload) {
                    try {
                        payload = JSON.parse(localStorage.getItem('omnify_margin_calc_apply') || 'null');
                    } catch (e) { payload = null; }
                }
                if (!payload || payload.targetMargin == null) {
                    toast('시뮬레이터에서 「어드민에 반영 준비」를 먼저 실행하세요.', 'warning');
                    return;
                }
                $('c-target-margin').value = payload.targetMargin;
                $('c-margin-global').value = payload.globalSeed != null ? payload.globalSeed : (payload.margins && payload.margins.global) || '';
                if (payload.monthlyRevenue) {
                    var eok = Math.round((payload.monthlyRevenue / 100000000) * 100) / 100;
                    if ($('c-current-eok') && !$('c-current-eok').value) $('c-current-eok').value = eok;
                    if ($('c-gmv') && !$('c-gmv').value) $('c-gmv').value = eok;
                }
                var margins = payload.margins || {};
                var weights = payload.channelWeights || {};
                Object.keys(margins).forEach(function (id) {
                    if (id === 'global') return;
                    var chk = document.querySelector('input[name="channel"][value="' + id + '"]');
                    if (chk && !chk.checked) chk.checked = true;
                });
                syncChannelCustomGrid();
                Object.keys(margins).forEach(function (id) {
                    if (id === 'global') return;
                    var mEl = document.getElementById('cm-' + id);
                    if (mEl) mEl.value = margins[id];
                });
                Object.keys(weights).forEach(function (id) {
                    var wEl = document.getElementById('cw-' + id);
                    if (wEl) wEl.value = Math.round(weights[id]);
                });
                switchTab('custom');
                updateCustomChecklist();
                var basis = payload.targetBasis === 'afterAd' ? '광고 후' : '공헌';
                toast('계산기 반영: 목표 ' + payload.targetMargin + '% · 시드 ' + (payload.globalSeed || '') + '% (' + basis + ')', 'success');
            });
        }

        ['f-email', 'f-company', 'f-company-en'].forEach(function (id) {
            var el = $(id);
            if (el) el.addEventListener('input', updateNamingPreview);
        });
        if ($('f-key-id')) {
            $('f-key-id').addEventListener('input', function () {
                this.dataset.touched = '1';
                updateNamingPreview();
            });
            $('f-key-id').addEventListener('blur', function () {
                this.value = normalizeKeyId(this.value);
                updateNamingPreview();
            });
        }

        ['pf-search', 'pf-lifecycle', 'pf-plan', 'pf-health'].forEach(function (id) {
            var el = $(id);
            if (!el) return;
            el.addEventListener(id === 'pf-search' ? 'input' : 'change', renderPortfolio);
        });
        if ($('btn-refresh-portfolio')) {
            $('btn-refresh-portfolio').addEventListener('click', function () {
                renderPortfolio();
                toast('현황 갱신', 'info');
            });
        }
        if ($('portfolio-body')) {
            $('portfolio-body').addEventListener('click', function (e) {
                var btn = e.target.closest('[data-pf-act]');
                if (!btn) return;
                var row = btn.closest('tr[data-id]');
                if (!row) return;
                var id = row.getAttribute('data-id');
                var t = getTenantById(id);
                var act = btn.getAttribute('data-pf-act');
                if (act === 'edit' && t) {
                    fillForm(t);
                    renderProvision(t);
                    switchTab('basic');
                    window.scrollTo({ top: document.getElementById('form-title').offsetTop - 20, behavior: 'smooth' });
                } else if (act === 'open' && t && t.infra) {
                    window.open(t.infra.previewPath, '_blank');
                } else if (act === 'save') {
                    var saved = patchTenantFromPortfolioRow(row);
                    if (saved) {
                        toast('현황 저장: ' + saved.companyName, 'success');
                        renderList();
                    }
                }
            });
            $('portfolio-body').addEventListener('change', function (e) {
                if (!e.target.matches('[data-pf="lifecycle"], [data-pf="health"]')) return;
                var row = e.target.closest('tr[data-id]');
                if (!row) return;
                var saved = patchTenantFromPortfolioRow(row);
                if (saved) {
                    toast('업데이트: ' + saved.companyName, 'success');
                    renderList();
                }
            });
        }

        $('btn-copy-quote').addEventListener('click', function () {
            var text = getQuoteEditorText();
            if (!text || text.indexOf('테넌트를 저장') === 0) {
                toast('복사할 견적이 없습니다.', 'warning');
                return;
            }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(function () {
                    toast('견적 요약이 복사되었습니다.', 'success');
                }).catch(function () {
                    toast('복사 실패 — 수동 선택하세요.', 'warning');
                });
            } else {
                toast('클립보드를 지원하지 않는 환경입니다.', 'warning');
            }
        });
        if ($('btn-save-quote')) {
            $('btn-save-quote').addEventListener('click', saveQuoteText);
        }
        if ($('btn-quote-pdf')) {
            $('btn-quote-pdf').addEventListener('click', exportQuotePdf);
        }
        if ($('btn-contract-pdf')) {
            $('btn-contract-pdf').addEventListener('click', exportContractPdf);
        }
        if ($('btn-copy-intake')) {
            $('btn-copy-intake').addEventListener('click', copyIntakeLink);
        }
        if ($('btn-open-intake')) {
            $('btn-open-intake').addEventListener('click', function () {
                if (!editingId) {
                    toast('먼저 테넌트를 저장·선택하세요.', 'warning');
                    return;
                }
                var t = getTenantById(editingId);
                if (!t) return;
                var tok = ensureIntakeToken(t);
                window.open(intakePublicUrl(tok), '_blank', 'noopener');
            });
        }
        if ($('btn-view-intake')) {
            $('btn-view-intake').addEventListener('click', function () {
                if (!editingId) {
                    toast('테넌트를 선택하세요.', 'warning');
                    return;
                }
                refreshIntakePanel(getTenantById(editingId));
                toast('제출 내용을 새로고침했습니다.', 'info');
            });
        }
        $('btn-refresh-quote').addEventListener('click', function () {
            var t = editingId ? getTenantById(editingId) : null;
            if (!t) {
                try {
                    var form = readForm();
                    if (form.companyName) {
                        t = buildTenantDraft(form);
                        t.id = '(draft)';
                    }
                } catch (e) { /* ignore */ }
            }
            if (!t) {
                toast('견적을 만들 계약 정보가 없습니다.', 'warning');
                return;
            }
            refreshQuotePreview(t, { force: true });
            toast(t.quoteText ? '자동 생성됨 · 저장하면 덮어씁니다' : '견적 자동 생성', 'info');
        });
        if ($('quote-preview')) {
            $('quote-preview').addEventListener('input', function () {
                var t = editingId ? getTenantById(editingId) : null;
                updateQuoteStatus(t || { id: '(draft)' }, true);
            });
        }
        $('btn-export-tenants').addEventListener('click', function () {
            var bundle = TenantStore.exportBundle();
            var blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
            var a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'omnify-tenants-' + new Date().toISOString().slice(0, 10) + '.json';
            a.click();
            URL.revokeObjectURL(a.href);
            toast('Export 완료', 'success');
        });
        $('btn-import-tenants').addEventListener('click', function () {
            $('import-file').click();
        });
        var syncBtn = $('btn-sync-tenants');
        if (syncBtn) {
            syncBtn.addEventListener('click', function () {
                hydrateFromServer().then(function () {
                    toast('서버 목록 갱신', 'success');
                });
            });
        }
        $('import-file').addEventListener('change', function () {
            var file = this.files && this.files[0];
            if (!file) return;
            var reader = new FileReader();
            reader.onload = function () {
                try {
                    var data = JSON.parse(reader.result);
                    var n = TenantStore.importBundle(data, 'merge');
                    renderList();
                    toast(n + '건 병합 Import · 서버 동기화 중', 'success');
                    setStoreStatus('Import 후 서버 동기화 중…');
                    TenantStore.pushAll().then(function (count) {
                        setStoreStatus('Firestore 동기화 완료 · ' + count + '건', true);
                    }).catch(function (err) {
                        setStoreStatus('서버 동기화 실패: ' + (err && err.message ? err.message : err), false);
                    });
                } catch (err) {
                    toast('Import 실패: JSON을 확인하세요.', 'warning');
                }
                $('import-file').value = '';
            };
            reader.readAsText(file);
        });

        $('tenant-list').addEventListener('click', function (e) {
            var btn = e.target.closest('[data-act]');
            if (!btn) return;
            var card = btn.closest('.tenant-card');
            var id = card && card.getAttribute('data-id');
            var t = getTenantById(id);
            if (!t) return;
            var act = btn.getAttribute('data-act');
            if (act === 'open') {
                window.open(t.infra.previewPath, '_blank');
            } else if (act === 'edit') {
                fillForm(t);
                renderProvision(t);
                switchTab('basic');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (act === 'rebuild') {
                fillForm(t);
                createOrUpdate();
            } else if (act === 'del') {
                if (!confirm('「' + t.companyName + '」 테넌트를 삭제할까요?')) return;
                deleteTenant(id);
                if (editingId === id) {
                    editingId = null;
                    fillForm(null);
                    renderProvision(null);
                }
                renderList();
                toast('삭제됨', 'info');
                if (TenantStore._pendingSync) {
                    TenantStore._pendingSync.then(function () {
                        setStoreStatus('Firestore에서 삭제됨', true);
                    }).catch(function (err) {
                        setStoreStatus('삭제 서버 반영 실패: ' + (err && err.message ? err.message : err), false);
                    });
                }
            }
        });

        fillForm(null);
        syncDefaultsFromTier(true);
        syncFeesFromBilling();
        renderList();
        renderProvision(null);
        updateCustomChecklist();
        updateNamingPreview();
        renderChecklist('contract-checklist', CONTRACT_CHECKLIST_DEFS, {}, 'contract-check');
        renderChecklist('ops-checklist', OPS_CHECKLIST_DEFS, {}, 'ops-check');
        if (typeof TaxInvoiceAdmin !== 'undefined' && TaxInvoiceAdmin.wire) {
            TaxInvoiceAdmin.wire({
                toast: toast,
                getEditingId: function () { return editingId; },
                getTenantById: getTenantById,
                upsertTenant: upsertTenant,
                renderList: renderList,
                refreshOpsTab: refreshOpsTab
            });
        }
        hydrateFromServer();
    });
})();
