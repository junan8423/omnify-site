/**
 * Omnify 고객 온보딩 수집 폼
 * URL: intake.html?token=XXXX
 */
(function () {
    'use strict';

    var API = '/api/intake';
    var token = '';
    var meta = null;
    var GROUPS = {
        core: '핵심 채널',
        market: '종합몰 · 오픈마켓',
        vertical: '패션 · 뷰티',
        department: '백화점 · 프리미엄',
        lifestyle: '장보기 · 리빙 · 소셜',
        special: '글로벌 · 홈쇼핑 · 소셜',
        other: '기타'
    };

    function $(id) { return document.getElementById(id); }

    function qsToken() {
        var m = /[?&]token=([^&]+)/.exec(location.search);
        return m ? decodeURIComponent(m[1]) : '';
    }

    function toast(msg, ok) {
        var el = $('toast');
        if (!el) return;
        el.textContent = msg;
        el.className = 'toast show' + (ok ? ' ok' : '');
        clearTimeout(toast._t);
        toast._t = setTimeout(function () { el.classList.remove('show'); }, 2800);
    }

    function tip(html) {
        return '<p class="tip"><span class="tip-lab">TIP</span> ' + html + '</p>';
    }

    function reqMark() {
        return '<span class="req">필수</span>';
    }

    function optMark() {
        return '<span class="opt">선택</span>';
    }

    function renderChannels() {
        var box = $('ch-grid');
        if (!box || typeof CHANNEL_CATALOG === 'undefined') {
            box.innerHTML = '<p class="err">채널 목록을 불러오지 못했습니다.</p>';
            return;
        }
        var by = {};
        CHANNEL_CATALOG.forEach(function (c) {
            var g = c.group || 'other';
            if (!by[g]) by[g] = [];
            by[g].push(c);
        });
        var html = '';
        Object.keys(GROUPS).forEach(function (g) {
            if (!by[g] || !by[g].length) return;
            html += '<div class="ch-group"><p class="ch-group-t">' + GROUPS[g] + '</p><div class="ch-list">';
            by[g].forEach(function (c) {
                html += '<label class="ch-item"><input type="checkbox" name="channel" value="' + c.id + '">' +
                    '<span>' + c.label + '</span></label>';
            });
            html += '</div></div>';
        });
        box.innerHTML = html;
        box.querySelectorAll('input[name="channel"]').forEach(function (el) {
            el.addEventListener('change', function () {
                el.closest('.ch-item').classList.toggle('is-on', el.checked);
                syncChannelApiBlocks();
            });
        });
    }

    function selectedChannels() {
        return Array.prototype.slice.call(document.querySelectorAll('input[name="channel"]:checked'))
            .map(function (el) { return el.value; });
    }

    function channelLabel(id) {
        var hit = (typeof CHANNEL_CATALOG !== 'undefined' ? CHANNEL_CATALOG : [])
            .filter(function (c) { return c.id === id; })[0];
        return hit ? hit.label : id;
    }

    function syncChannelApiBlocks() {
        var box = $('ch-api-blocks');
        var ids = selectedChannels();
        if (!ids.length) {
            box.innerHTML = '<p class="muted">위에서 판매채널을 선택하면, 채널별 API 입력란이 나타납니다.</p>';
            return;
        }
        box.innerHTML = ids.map(function (id) {
            return '<div class="api-card" data-ch="' + id + '">' +
                '<p class="api-title">' + channelLabel(id) + ' API ' + reqMark() + '</p>' +
                tip('셀러센터·파트너센터에서 「API / 개발자」 메뉴의 키·토큰을 복사해 붙여넣으세요. 잘 모르면 <strong>발급 화면 캡처 + 담당자 연락처</strong>만 적어도 됩니다.') +
                '<label class="field"><span>Mall / Vendor / 판매자 ID</span><input type="text" data-f="sellerId" placeholder="예: mall_id / A00123456"></label>' +
                '<label class="field"><span>API Key 또는 Client ID</span><input type="text" data-f="apiKey" placeholder="발급받은 키"></label>' +
                '<label class="field"><span>Secret / Access Token</span><input type="text" data-f="secret" placeholder="시크릿 또는 액세스 토큰"></label>' +
                '<label class="field"><span>메모 (선택)</span><input type="text" data-f="note" placeholder="예: 유효기간 2026-12, 담당 김OO"></label>' +
                '</div>';
        }).join('');
    }

    function readChannelApis() {
        var out = {};
        document.querySelectorAll('.api-card').forEach(function (card) {
            var id = card.getAttribute('data-ch');
            out[id] = {
                sellerId: (card.querySelector('[data-f="sellerId"]') || {}).value || '',
                apiKey: (card.querySelector('[data-f="apiKey"]') || {}).value || '',
                secret: (card.querySelector('[data-f="secret"]') || {}).value || '',
                note: (card.querySelector('[data-f="note"]') || {}).value || ''
            };
        });
        return out;
    }

    function fillChannelApis(apis) {
        if (!apis) return;
        Object.keys(apis).forEach(function (id) {
            var card = document.querySelector('.api-card[data-ch="' + id + '"]');
            if (!card) return;
            var a = apis[id] || {};
            var map = { sellerId: a.sellerId, apiKey: a.apiKey, secret: a.secret, note: a.note };
            Object.keys(map).forEach(function (k) {
                var el = card.querySelector('[data-f="' + k + '"]');
                if (el && map[k] != null) el.value = map[k];
            });
        });
    }

    function readForm() {
        var driveOn = $('drive-on').checked;
        return {
            companyName: $('company').value.trim(),
            contactName: $('contact-name').value.trim(),
            contactPhone: $('contact-phone').value.trim(),
            contactEmail: $('contact-email').value.trim(),
            businessNo: $('bizno').value.trim(),
            channels: selectedChannels(),
            channelApis: readChannelApis(),
            drive: {
                enabled: driveOn,
                folderUrl: $('drive-url').value.trim(),
                ownerEmail: $('drive-owner').value.trim(),
                sharedOk: $('drive-shared-ok').checked
            },
            wms: {
                useSabangnet: $('wms-yes').checked,
                note: $('wms-note').value.trim()
            },
            kpi: {
                monthlyRevenueEok: $('kpi-revenue').value.trim(),
                targetMargin: $('kpi-margin').value.trim(),
                cogsPct: $('kpi-cogs').value.trim(),
                dailyOrders: $('kpi-orders').value.trim()
            },
            briefing: {
                recipients: $('brief-recipients').value.trim(),
                sendTime: $('brief-time').value || '08:30'
            },
            ads: {
                monthlyBudgetMan: $('ad-budget').value.trim(),
                mediaText: $('ad-media').value.trim()
            },
            notes: $('extra-notes').value.trim()
        };
    }

    function validate(data) {
        if (!data.companyName) return '회사명(상호)을 입력해 주세요.';
        if (!data.contactName) return '담당자 이름을 입력해 주세요.';
        if (!data.contactPhone && !data.contactEmail) return '전화 또는 이메일 중 하나는 필수입니다.';
        if (!data.channels.length) return '판매채널을 1개 이상 선택해 주세요.';
        var missingApi = data.channels.some(function (id) {
            var a = data.channelApis[id] || {};
            return !(a.sellerId || a.apiKey || a.secret || a.note);
        });
        if (missingApi) return '선택한 채널마다 API 정보(또는 메모)를 최소 1칸 입력해 주세요.';
        if (data.drive.enabled) {
            if (!data.drive.folderUrl) return 'Drive 폴더 URL/ID를 입력해 주세요.';
            if (!data.drive.sharedOk) return 'Omnify 계정을 폴더에 공유했는지 체크해 주세요.';
        }
        if (!data.briefing.recipients) return '알림톡 수신자(최소 1명)를 입력해 주세요.';
        return '';
    }

    function applyIntake(intake) {
        if (!intake) return;
        $('company').value = intake.companyName || meta.companyName || '';
        $('contact-name').value = intake.contactName || '';
        $('contact-phone').value = intake.contactPhone || '';
        $('contact-email').value = intake.contactEmail || '';
        $('bizno').value = intake.businessNo || '';
        (intake.channels || []).forEach(function (id) {
            var el = document.querySelector('input[name="channel"][value="' + id + '"]');
            if (el) el.checked = true;
        });
        syncChannelApiBlocks();
        fillChannelApis(intake.channelApis);
        if (intake.drive) {
            $('drive-on').checked = !!intake.drive.enabled;
            $('drive-url').value = intake.drive.folderUrl || '';
            $('drive-owner').value = intake.drive.ownerEmail || '';
            $('drive-shared-ok').checked = !!intake.drive.sharedOk;
            toggleDrive();
        }
        if (intake.wms) {
            $('wms-yes').checked = !!intake.wms.useSabangnet;
            $('wms-no').checked = !intake.wms.useSabangnet;
            $('wms-note').value = intake.wms.note || '';
        }
        if (intake.kpi) {
            $('kpi-revenue').value = intake.kpi.monthlyRevenueEok || '';
            $('kpi-margin').value = intake.kpi.targetMargin || '';
            $('kpi-cogs').value = intake.kpi.cogsPct || '';
            $('kpi-orders').value = intake.kpi.dailyOrders || '';
        }
        if (intake.briefing) {
            $('brief-recipients').value = intake.briefing.recipients || '';
            $('brief-time').value = intake.briefing.sendTime || '08:30';
        }
        if (intake.ads) {
            $('ad-budget').value = intake.ads.monthlyBudgetMan || '';
            $('ad-media').value = intake.ads.mediaText || '';
        }
        $('extra-notes').value = intake.notes || '';
    }

    function toggleDrive() {
        $('drive-fields').classList.toggle('hidden', !$('drive-on').checked);
    }

    function setStatus(html, cls) {
        var el = $('form-status');
        if (!el) return;
        el.innerHTML = html;
        el.className = 'status ' + (cls || '');
    }

    function load() {
        token = qsToken();
        if (!token) {
            $('boot').classList.add('hidden');
            $('blocked').classList.remove('hidden');
            return;
        }
        fetch(API + '?token=' + encodeURIComponent(token), { credentials: 'omit' })
            .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
            .then(function (x) {
                if (!x.ok) {
                    $('boot').classList.add('hidden');
                    $('blocked').classList.remove('hidden');
                    $('blocked-msg').textContent = (x.d && x.d.message) || '링크가 올바르지 않습니다. Omnify 담당자에게 새 링크를 요청해 주세요.';
                    return;
                }
                meta = x.d.meta;
                $('boot').classList.add('hidden');
                $('form-wrap').classList.remove('hidden');
                $('heading-co').textContent = meta.companyName || '고객사';
                $('company').value = meta.companyName || '';
                if (meta.channelsHint && meta.channelsHint.length) {
                    meta.channelsHint.forEach(function (id) {
                        var el = document.querySelector('input[name="channel"][value="' + id + '"]');
                        if (el) el.checked = true;
                    });
                    syncChannelApiBlocks();
                }
                if (x.d.intake && x.d.intake.intake) {
                    applyIntake(x.d.intake.intake);
                    setStatus('이전에 제출하신 내용이 있습니다. 수정 후 다시 저장할 수 있습니다. (제출: ' +
                        (x.d.intake.submittedAt || '').replace('T', ' ').slice(0, 16) + ')', 'ok');
                }
            })
            .catch(function () {
                $('boot').classList.add('hidden');
                $('blocked').classList.remove('hidden');
                $('blocked-msg').textContent = '서버에 연결하지 못했습니다. 잠시 후 다시 시도하거나 담당자에게 문의해 주세요.';
            });
    }

    function submit() {
        var data = readForm();
        var err = validate(data);
        if (err) {
            toast(err);
            setStatus(err, 'bad');
            return;
        }
        var btn = $('btn-submit');
        btn.disabled = true;
        btn.textContent = '저장 중…';
        fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ token: token, intake: data })
        }).then(function (r) {
            return r.json().then(function (d) { return { ok: r.ok, d: d }; });
        }).then(function (x) {
            btn.disabled = false;
            btn.textContent = '저장 · 제출하기';
            if (!x.ok) {
                toast((x.d && x.d.error) || '저장 실패');
                setStatus('저장에 실패했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.', 'bad');
                return;
            }
            toast('제출 완료! Omnify에서 바로 확인할 수 있습니다.', true);
            setStatus('제출이 완료되었습니다. 담당자가 내용을 검토합니다. · ' +
                (x.d.submittedAt || '').replace('T', ' ').slice(0, 19), 'ok');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }).catch(function () {
            btn.disabled = false;
            btn.textContent = '저장 · 제출하기';
            toast('네트워크 오류');
            setStatus('네트워크 오류로 저장되지 않았습니다.', 'bad');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        renderChannels();
        syncChannelApiBlocks();
        $('drive-on').addEventListener('change', toggleDrive);
        toggleDrive();
        $('btn-submit').addEventListener('click', submit);
        load();
    });
})();
