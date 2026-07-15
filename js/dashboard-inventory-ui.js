/**
 * Omnify 통합 재고 조회 UX
 * — 검색 · 정렬 · 필터 · 관심목록 · CSV · 물류 담당자 편의 기능
 */
(function (global) {
    'use strict';

    var WATCH_KEY = 'omnify_inv_watch_v1';

    var invState = {
        search: '',
        status: 'all',
        sortField: 'priority',
        sortDir: 'asc',
        pinRisk: true,
        compact: false,
        lowCoverOnly: false
    };

    var STATUS_ORDER = { critical: 0, warning: 1, safe: 2 };

    function loadWatch() {
        try {
            var raw = localStorage.getItem(WATCH_KEY);
            var list = raw ? JSON.parse(raw) : [];
            return Array.isArray(list) ? list : [];
        } catch (e) {
            return [];
        }
    }

    function saveWatch(list) {
        try {
            localStorage.setItem(WATCH_KEY, JSON.stringify(list.slice(0, 200)));
        } catch (e) { /* ignore */ }
    }

    function isWatched(sku) {
        return loadWatch().indexOf(sku) >= 0;
    }

    function toggleWatch(sku) {
        sku = String(sku || '').trim();
        if (!sku) return;
        var list = loadWatch();
        var i = list.indexOf(sku);
        if (i >= 0) list.splice(i, 1);
        else list.unshift(sku);
        saveWatch(list);
        // 관심 필터 중이면 목록에서 빠질 수 있으므로 전체 갱신, 아니면 해당 버튼만 갱신해 스크롤·순서 유지
        if (invState.status === 'watch') {
            renderInventoryTable();
        } else {
            updateWatchButton(sku, i < 0);
            updateInvSummary();
            syncWatchAllCheckbox();
        }
        if (typeof showToast === 'function') {
            showToast(i >= 0 ? '관심 SKU에서 제거했습니다.' : '관심 SKU에 추가했습니다. · ' + sku, 'success');
        }
    }

    /** 현재 필터된 목록 기준 관심 전체선택 / 전부해제 */
    function toggleWatchAllVisible(forceSelect) {
        var rows = getFilteredSorted();
        if (!rows.length) {
            if (typeof showToast === 'function') showToast('선택할 SKU가 없습니다.', 'info');
            syncWatchAllCheckbox();
            return;
        }
        var watchedCount = rows.filter(function (r) { return r.watched; }).length;
        var selectAll = forceSelect != null ? !!forceSelect : watchedCount < rows.length;
        var list = loadWatch();
        var visible = {};
        rows.forEach(function (r) { visible[r.sku] = 1; });

        if (selectAll) {
            rows.forEach(function (r) {
                if (list.indexOf(r.sku) < 0) list.unshift(r.sku);
            });
            saveWatch(list);
            renderInventoryTable();
            if (typeof showToast === 'function') {
                showToast('현재 목록 ' + rows.length + '건을 관심 SKU로 선택했습니다.', 'success');
            }
        } else {
            list = list.filter(function (sku) { return !visible[sku]; });
            saveWatch(list);
            renderInventoryTable();
            if (typeof showToast === 'function') {
                showToast('현재 목록의 관심 선택을 모두 해제했습니다.', 'success');
            }
        }
    }

    function syncWatchAllCheckbox() {
        var el = document.getElementById('inv-watch-all');
        if (!el) return;
        var rows = getFilteredSorted();
        var watchedCount = rows.filter(function (r) { return r.watched; }).length;
        var total = rows.length;
        el.disabled = total === 0;
        el.indeterminate = total > 0 && watchedCount > 0 && watchedCount < total;
        el.checked = total > 0 && watchedCount === total;
        el.title = total === 0
            ? '선택할 SKU 없음'
            : (el.checked ? '현재 목록 관심 전부 해제' : '현재 목록 관심 전체 선택');
    }

    function escapeHtmlAttr(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function escapeHtmlText(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function updateWatchButton(sku, on) {
        var rows = document.querySelectorAll('#inventory-tbody tr[data-sku]');
        var row = null;
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].getAttribute('data-sku') === sku) { row = rows[i]; break; }
        }
        if (!row) {
            renderInventoryTable();
            return;
        }
        var btn = row.querySelector('.inv-watch-btn');
        if (!btn) return;
        btn.classList.toggle('on', !!on);
        btn.textContent = on ? '★' : '☆';
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }

    function bindInventoryTableActions() {
        var tbody = document.getElementById('inventory-tbody');
        if (!tbody || tbody.dataset.invBound === '1') return;
        tbody.dataset.invBound = '1';
        tbody.addEventListener('click', function (e) {
            var btn = e.target && e.target.closest ? e.target.closest('[data-action]') : null;
            if (!btn || !tbody.contains(btn)) return;
            var action = btn.getAttribute('data-action');
            var sku = btn.getAttribute('data-sku') || '';
            if (action === 'watch') {
                e.preventDefault();
                e.stopPropagation();
                toggleWatch(sku);
            } else if (action === 'copy-sku') {
                e.preventDefault();
                e.stopPropagation();
                copyInventorySku(sku);
            }
        });
    }

    function hashStr(s) {
        var h = 0;
        for (var i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
        return Math.abs(h);
    }

    function enrichRow(raw) {
        var total = Number(raw.total != null ? raw.total : raw.qtyWms) || 0;
        var safety = Number(raw.safety) || 0;
        var cafe24 = Number(raw.cafe24) || 0;
        var smartstore = Number(raw.smartstore) || 0;
        var coupang = Number(raw.coupang) || 0;
        var ably = Number(raw.ably) || 0;
        var channelSum = cafe24 + smartstore + coupang + ably;
        var gap = Math.max(0, safety - total);
        var fillPct = safety > 0 ? Math.round((total / safety) * 100) : 100;
        var dailyVel = 2 + (hashStr(raw.sku || raw.name || '') % 18);
        var daysCover = dailyVel > 0 ? +(total / dailyVel).toFixed(1) : 99;
        var mismatch = Math.abs(channelSum - total) > 0;
        var status = raw.status || 'safe';
        var watched = isWatched(raw.sku);
        // 관심 여부는 정렬에 넣지 않음 — ★ 토글 시 행이 위로 밀려 "위에서부터 선택"처럼 보이는 버그 방지
        var priority = (STATUS_ORDER[status] != null ? STATUS_ORDER[status] : 9) * 10000
            - gap * 10
            + Math.min(999, daysCover * 10);
        return {
            sku: raw.sku,
            name: raw.name,
            total: total,
            safety: safety,
            cafe24: cafe24,
            smartstore: smartstore,
            coupang: coupang,
            ably: ably,
            channelSum: channelSum,
            gap: gap,
            fillPct: fillPct,
            dailyVel: dailyVel,
            daysCover: daysCover,
            mismatch: mismatch,
            status: status,
            watched: watched,
            priority: priority
        };
    }

    function getEnrichedInventory() {
        return (App.inventory || []).map(enrichRow);
    }

    function getFilteredSorted() {
        var q = (invState.search || '').trim().toLowerCase();
        var list = getEnrichedInventory().filter(function (r) {
            if (invState.status === 'at_risk' && r.status === 'safe') return false;
            if (invState.status === 'critical' && r.status !== 'critical') return false;
            if (invState.status === 'warning' && r.status !== 'warning') return false;
            if (invState.status === 'safe' && r.status !== 'safe') return false;
            if (invState.status === 'mismatch' && !r.mismatch) return false;
            if (invState.status === 'watch' && !r.watched) return false;
            if (invState.lowCoverOnly && r.daysCover >= 7) return false;
            if (q) {
                var hay = (r.sku + ' ' + r.name).toLowerCase();
                if (hay.indexOf(q) < 0) return false;
            }
            return true;
        });

        var field = invState.sortField;
        var dir = invState.sortDir === 'asc' ? 1 : -1;
        list.sort(function (a, b) {
            if (invState.pinRisk && field !== 'priority') {
                var sa = STATUS_ORDER[a.status] != null ? STATUS_ORDER[a.status] : 9;
                var sb = STATUS_ORDER[b.status] != null ? STATUS_ORDER[b.status] : 9;
                if (sa !== sb) return sa - sb;
            }
            var av = a[field];
            var bv = b[field];
            if (typeof av === 'string') {
                av = av.toLowerCase();
                bv = String(bv || '').toLowerCase();
                if (av < bv) return -1 * dir;
                if (av > bv) return 1 * dir;
                return a.sku < b.sku ? -1 : 1;
            }
            av = Number(av) || 0;
            bv = Number(bv) || 0;
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
            return a.sku < b.sku ? -1 : 1;
        });
        return list;
    }

    function formatCover(days) {
        if (days < 3) return { text: days + '일', cls: 'text-danger font-bold' };
        if (days < 7) return { text: days + '일', cls: 'text-warning font-semibold' };
        if (days < 14) return { text: days + '일', cls: 'text-gray-300' };
        return { text: days + '일', cls: 'text-success' };
    }

    function sortGlyph(field) {
        if (invState.sortField !== field) return '';
        return invState.sortDir === 'asc' ? ' ↑' : ' ↓';
    }

    function updateSortHeaders() {
        document.querySelectorAll('.inv-sort-btn').forEach(function (btn) {
            var field = btn.dataset.sort;
            var label = btn.dataset.label || field;
            var active = invState.sortField === field;
            btn.classList.toggle('active', active);
            btn.textContent = label + (active ? sortGlyph(field) : '');
            btn.setAttribute('aria-sort', active ? (invState.sortDir === 'asc' ? 'ascending' : 'descending') : 'none');
        });
    }

    function updateFilterChips() {
        document.querySelectorAll('[data-inv-status]').forEach(function (btn) {
            btn.classList.toggle('active', btn.getAttribute('data-inv-status') === invState.status);
        });
        var pin = document.getElementById('inv-pin-risk');
        if (pin) pin.checked = !!invState.pinRisk;
        var compact = document.getElementById('inv-compact');
        if (compact) compact.checked = !!invState.compact;
        var low = document.getElementById('inv-low-cover');
        if (low) low.checked = !!invState.lowCoverOnly;
        var table = document.getElementById('inventory-table');
        if (table) table.classList.toggle('inv-compact', !!invState.compact);
        var search = document.getElementById('inv-search-input');
        if (search && search.value !== invState.search) search.value = invState.search;
    }

    function updateInvSummary() {
        var all = getEnrichedInventory();
        var atRisk = all.filter(function (r) { return r.status !== 'safe'; });
        var critical = all.filter(function (r) { return r.status === 'critical'; });
        var mismatch = all.filter(function (r) { return r.mismatch; });
        var lowCover = all.filter(function (r) { return r.daysCover < 7; });
        var gapSum = atRisk.reduce(function (s, r) { return s + r.gap; }, 0);
        var watch = all.filter(function (r) { return r.watched; });
        var filtered = getFilteredSorted();

        var setText = function (id, val) {
            var el = document.getElementById(id);
            if (el) el.textContent = val;
        };
        setText('inv-kpi-total', String(all.length));
        setText('inv-kpi-risk', String(atRisk.length));
        setText('inv-kpi-gap', gapSum.toLocaleString('ko-KR'));
        setText('inv-kpi-low', String(lowCover.length));
        setText('inv-kpi-mismatch', String(mismatch.length));
        setText('inv-kpi-watch', String(watch.length));
        setText('inv-result-count', filtered.length.toLocaleString('ko-KR'));
        setText('inv-result-total', all.length.toLocaleString('ko-KR'));
        setText('inv-critical-count', String(critical.length));

        var hint = document.getElementById('inv-filter-hint');
        if (hint) {
            var parts = [];
            if (invState.status !== 'all') {
                var labels = {
                    at_risk: '위험만', critical: '품절임박', warning: '주의', safe: '안전',
                    mismatch: '채널불일치', watch: '관심 SKU'
                };
                parts.push(labels[invState.status] || invState.status);
            }
            if (invState.lowCoverOnly) parts.push('가용량 7일↓');
            if (invState.search) parts.push('"' + invState.search + '"');
            hint.textContent = parts.length ? '필터: ' + parts.join(' · ') : '전체 재고 표시 중';
        }
    }

    function renderInventoryTable() {
        var tbody = document.getElementById('inventory-tbody');
        if (!tbody) return;
        var list = getFilteredSorted();
        updateFilterChips();
        updateSortHeaders();
        updateInvSummary();

        if (!list.length) {
            tbody.innerHTML = '<tr><td colspan="12" class="px-5 py-16 text-center text-sm text-gray-500">' +
                '<p class="font-semibold text-gray-300 mb-1">조건에 맞는 SKU가 없습니다</p>' +
                '<p class="text-xs">검색어·필터를 완화하거나 <button type="button" class="text-primary underline" onclick="resetInventoryFilters()">필터 초기화</button>를 눌러 주세요.</p>' +
                '</td></tr>';
            bindInventoryTableActions();
            syncWatchAllCheckbox();
            return;
        }

        var py = invState.compact ? 'py-2' : 'py-3.5';
        tbody.innerHTML = list.map(function (r) {
            var cover = formatCover(r.daysCover);
            var rowCls = 'table-row inv-row';
            if (r.status === 'critical') rowCls += ' inv-row-critical';
            else if (r.status === 'warning') rowCls += ' inv-row-warn';
            var barW = Math.min(100, r.fillPct);
            var barCls = r.status === 'critical' ? 'bg-danger' : r.status === 'warning' ? 'bg-warning' : 'bg-success';
            var mismatchBadge = r.mismatch
                ? '<span class="inv-mismatch-badge" title="채널 합계 ' + r.channelSum + ' ≠ 실재고 ' + r.total + '">불일치</span>'
                : '';
            return '<tr class="' + rowCls + '" data-sku="' + escapeHtmlAttr(r.sku) + '">' +
                '<td class="px-3 ' + py + ' text-center">' +
                '<button type="button" class="inv-watch-btn' + (r.watched ? ' on' : '') + '" data-sku="' + escapeHtmlAttr(r.sku) + '" data-action="watch" title="관심 SKU" aria-label="관심" aria-pressed="' + (r.watched ? 'true' : 'false') + '">' +
                (r.watched ? '★' : '☆') + '</button></td>' +
                '<td class="px-3 ' + py + '">' +
                '<button type="button" class="font-mono text-xs text-primary/90 hover:underline inv-sku-btn" data-sku="' + escapeHtmlAttr(r.sku) + '" data-action="copy-sku" title="클릭하여 SKU 복사">' + escapeHtmlText(r.sku) + '</button>' +
                mismatchBadge +
                '</td>' +
                '<td class="px-4 ' + py + '">' +
                '<p class="font-medium text-gray-100 leading-snug">' + escapeHtmlText(r.name) + '</p>' +
                '<div class="inv-fill-track mt-1.5" title="실재고/안전재고 ' + r.fillPct + '%">' +
                '<div class="inv-fill-bar ' + barCls + '" style="width:' + barW + '%"></div></div>' +
                '</td>' +
                '<td class="px-3 ' + py + ' text-center font-bold tabular-nums ' +
                (r.status === 'critical' ? 'text-danger' : r.status === 'warning' ? 'text-warning' : 'text-white') + '">' +
                r.total.toLocaleString('ko-KR') + '</td>' +
                '<td class="px-2 ' + py + ' text-center text-gray-400 tabular-nums">' + r.cafe24.toLocaleString('ko-KR') + '</td>' +
                '<td class="px-2 ' + py + ' text-center text-gray-400 tabular-nums">' + r.smartstore.toLocaleString('ko-KR') + '</td>' +
                '<td class="px-2 ' + py + ' text-center text-gray-400 tabular-nums">' + r.coupang.toLocaleString('ko-KR') + '</td>' +
                '<td class="px-2 ' + py + ' text-center text-gray-400 tabular-nums">' + r.ably.toLocaleString('ko-KR') + '</td>' +
                '<td class="px-3 ' + py + ' text-center text-gray-500 tabular-nums">' + r.safety.toLocaleString('ko-KR') + '</td>' +
                '<td class="px-3 ' + py + ' text-center tabular-nums ' + (r.gap > 0 ? 'text-danger font-semibold' : 'text-gray-600') + '">' +
                (r.gap > 0 ? '+' + r.gap.toLocaleString('ko-KR') : '—') + '</td>' +
                '<td class="px-3 ' + py + ' text-center"><span class="' + cover.cls + ' text-xs tabular-nums">' + cover.text + '</span>' +
                '<p class="text-[9px] text-gray-600 mt-0.5">일 ~' + r.dailyVel + '</p></td>' +
                '<td class="px-3 ' + py + ' text-center">' + App.statusBadge(r.status) + '</td>' +
                '</tr>';
        }).join('');
        bindInventoryTableActions();
        syncWatchAllCheckbox();
    }

    function setInventoryStatusFilter(status) {
        if (status === 'low_cover') {
            invState.status = 'all';
            invState.lowCoverOnly = true;
            invState.sortField = 'daysCover';
            invState.sortDir = 'asc';
        } else {
            invState.status = status || 'all';
            if (status === 'all') invState.lowCoverOnly = false;
        }
        renderInventoryTable();
    }

    function focusInventoryGapSort() {
        invState.status = 'at_risk';
        invState.lowCoverOnly = false;
        invState.sortField = 'gap';
        invState.sortDir = 'desc';
        renderInventoryTable();
    }

    function setInventorySearch(q) {
        invState.search = q || '';
        renderInventoryTable();
    }

    function sortInventory(field) {
        if (invState.sortField === field) {
            invState.sortDir = invState.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
            invState.sortField = field;
            invState.sortDir = (field === 'name' || field === 'sku' || field === 'priority') ? 'asc' : 'desc';
            if (field === 'daysCover' || field === 'fillPct' || field === 'total') invState.sortDir = 'asc';
            if (field === 'gap') invState.sortDir = 'desc';
        }
        renderInventoryTable();
    }

    function resetInventoryFilters() {
        invState.search = '';
        invState.status = 'all';
        invState.lowCoverOnly = false;
        invState.sortField = 'priority';
        invState.sortDir = 'asc';
        renderInventoryTable();
        var input = document.getElementById('inv-search-input');
        if (input) {
            input.value = '';
            input.focus();
        }
        if (typeof showToast === 'function') showToast('재고 필터를 초기화했습니다.', 'info');
    }

    function toggleInventoryPinRisk(checked) {
        invState.pinRisk = !!checked;
        renderInventoryTable();
    }

    function toggleInventoryCompact(checked) {
        invState.compact = !!checked;
        renderInventoryTable();
    }

    function toggleInventoryLowCover(checked) {
        invState.lowCoverOnly = !!checked;
        renderInventoryTable();
    }

    function copyInventorySku(sku) {
        var done = function () {
            if (typeof showToast === 'function') showToast('SKU 복사됨: ' + sku, 'success');
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(sku).then(done).catch(function () {
                window.prompt('SKU 복사', sku);
            });
        } else {
            window.prompt('SKU 복사', sku);
            done();
        }
    }

    function exportInventoryCSV() {
        var list = getFilteredSorted();
        var header = 'SKU,상품명,사방넷실재고,Cafe24,스마트스토어,쿠팡,에이블리,채널합,안전재고,부족분,예상가용량(일),일판매추정,상태,채널불일치,관심\n';
        var body = list.map(function (r) {
            return [
                r.sku,
                '"' + String(r.name).replace(/"/g, '""') + '"',
                r.total, r.cafe24, r.smartstore, r.coupang, r.ably, r.channelSum,
                r.safety, r.gap, r.daysCover, r.dailyVel, r.status,
                r.mismatch ? 'Y' : 'N',
                r.watched ? 'Y' : 'N'
            ].join(',');
        }).join('\n');
        var blob = new Blob(['\uFEFF' + header + body], { type: 'text/csv;charset=utf-8;' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'omnify_inventory_' + new Date().toISOString().slice(0, 10) + '.csv';
        a.click();
        if (typeof showToast === 'function') {
            showToast('재고 CSV ' + list.length + '건을 다운로드했습니다.', 'success');
        }
        if (typeof addActivityLog === 'function') {
            addActivityLog({
                userId: App.currentUserId,
                action: 'CSV 내보내기',
                category: 'inventory',
                type: 'info',
                detail: '통합 재고 ' + list.length + '건 CSV 다운로드',
                meta: '필터 반영'
            });
        }
    }

    function focusInventorySearch() {
        var input = document.getElementById('inv-search-input');
        if (input) {
            input.focus();
            input.select();
        }
    }

    function buildInventoryShellHtml() {
        var m = typeof getMockMetrics === 'function' ? getMockMetrics() : { atRiskInventory: 0, totalSku: 0 };
        var pol = (typeof INVENTORY_POLICY !== 'undefined' && INVENTORY_POLICY) ? INVENTORY_POLICY : null;
        return '' +
'<div id="view-inventory" class="view-section fade-in max-w-[1400px] mx-auto space-y-5">' +
'  <div class="flex flex-col lg:flex-row justify-between items-start gap-4">' +
'    <div>' +
'      <h2 class="text-xl font-bold">' + (pol ? pol.title : '통합 재고 (조회)') + '</h2>' +
'      <p class="text-sm text-gray-400 mt-1">' + (pol ? pol.subtitle : '사방넷 실재고 + 채널 재고 조회') +
'       <span class="demo-pill">데모</span></p>' +
'      <p class="text-[11px] text-gray-500 mt-1.5" id="inv-filter-hint">전체 재고 표시 중</p>' +
'    </div>' +
'    <div class="flex flex-wrap gap-2">' +
'      <button type="button" onclick="exportInventoryCSV()" class="text-xs font-semibold px-3 py-2 rounded-lg border border-border hover:border-primary/40 transition-colors">CSV 내보내기</button>' +
'      <button type="button" onclick="typeof OmnifyReportPrint!==\'undefined\'&&OmnifyReportPrint.openForm(\'inventory\')" class="text-xs font-semibold px-3 py-2 rounded-lg border border-border hover:border-primary/40 transition-colors">출력 양식</button>' +
'      <button type="button" onclick="openInventorySourceHint()" class="text-xs font-semibold px-3 py-2 rounded-lg border border-border hover:border-primary/40 transition-colors">원천 시스템 안내</button>' +
'      <button type="button" onclick="blockInventoryWrite(\'재고 수량 수정\')" class="text-xs font-semibold px-3 py-2 rounded-lg border border-warning/40 text-warning/90 hover:bg-warning/10">재고 수정 (봉쇄)</button>' +
'    </div>' +
'  </div>' +

'  <div class="glass rounded-xl p-4 border border-warning/25 bg-warning/5" id="inventory-policy-banner">' +
'    <p class="text-sm text-gray-200"><span class="font-bold text-warning">' + (pol ? pol.bannerLead : 'Omnify는 재고 Source of Truth가 아닙니다.') + '</span> ' + (pol ? pol.bannerBody : '') + '</p>' +
'    <p class="text-[11px] text-gray-500 mt-1.5">조회·경보·CSV만 제공 · 수량 쓰기·출고 확정은 원천(사방넷/채널)에서 처리</p>' +
'  </div>' +

'  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" id="inv-kpi-grid">' +
'    <button type="button" class="inv-kpi-card glass rounded-xl p-4 text-left" data-inv-status="all" onclick="setInventoryStatusFilter(\'all\')">' +
'      <p class="text-[10px] text-gray-500 mb-1">조회 SKU</p><p class="text-2xl font-extrabold" id="inv-kpi-total">' + (App.inventory || []).length + '</p></button>' +
'    <button type="button" class="inv-kpi-card glass rounded-xl p-4 text-left border border-danger/25" data-inv-status="at_risk" onclick="setInventoryStatusFilter(\'at_risk\')">' +
'      <p class="text-[10px] text-gray-500 mb-1">위험 재고</p><p class="text-2xl font-extrabold text-danger" id="inv-kpi-risk">' + m.atRiskInventory + '</p></button>' +
'    <button type="button" class="inv-kpi-card glass rounded-xl p-4 text-left" onclick="focusInventoryGapSort()">' +
'      <p class="text-[10px] text-gray-500 mb-1">부족 합계</p><p class="text-2xl font-extrabold text-warning" id="inv-kpi-gap">—</p><p class="text-[9px] text-gray-600 mt-0.5">안전 − 실재고</p></button>' +
'    <button type="button" class="inv-kpi-card glass rounded-xl p-4 text-left" onclick="setInventoryStatusFilter(\'low_cover\')">' +
'      <p class="text-[10px] text-gray-500 mb-1">가용량 7일↓</p><p class="text-2xl font-extrabold" id="inv-kpi-low">—</p></button>' +
'    <button type="button" class="inv-kpi-card glass rounded-xl p-4 text-left" data-inv-status="mismatch" onclick="setInventoryStatusFilter(\'mismatch\')">' +
'      <p class="text-[10px] text-gray-500 mb-1">채널 불일치</p><p class="text-2xl font-extrabold text-warning" id="inv-kpi-mismatch">—</p></button>' +
'    <button type="button" class="inv-kpi-card glass rounded-xl p-4 text-left" data-inv-status="watch" onclick="setInventoryStatusFilter(\'watch\')">' +
'      <p class="text-[10px] text-gray-500 mb-1">관심 SKU</p><p class="text-2xl font-extrabold text-primary" id="inv-kpi-watch">0</p></button>' +
'  </div>' +

'  <div class="glass rounded-xl overflow-hidden" id="inv-table-panel">' +
'    <div class="inv-toolbar p-3 sm:p-4 border-b border-border space-y-3">' +
'      <div class="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">' +
'        <div class="relative flex-1 max-w-xl">' +
'          <input id="inv-search-input" type="search" autocomplete="off" placeholder="SKU · 상품명 검색  (/ 로 포커스)" ' +
'            class="w-full bg-dark border border-border rounded-lg pl-9 pr-9 py-2.5 text-sm text-gray-200 outline-none focus:border-primary" ' +
'            oninput="setInventorySearch(this.value)">' +
'          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" aria-hidden="true">⌕</span>' +
'          <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 hover:text-white px-1.5 py-0.5 rounded border border-transparent hover:border-border" onclick="resetInventoryFilters()" title="필터 초기화">초기화</button>' +
'        </div>' +
'        <div class="flex flex-wrap items-center gap-3 text-[11px] text-gray-400">' +
'          <label class="inline-flex items-center gap-1.5 cursor-pointer select-none"><input id="inv-pin-risk" type="checkbox" class="rounded" checked onchange="toggleInventoryPinRisk(this.checked)"> 위험 상단 고정</label>' +
'          <label class="inline-flex items-center gap-1.5 cursor-pointer select-none"><input id="inv-low-cover" type="checkbox" class="rounded" onchange="toggleInventoryLowCover(this.checked)"> 가용량 7일↓</label>' +
'          <label class="inline-flex items-center gap-1.5 cursor-pointer select-none"><input id="inv-compact" type="checkbox" class="rounded" onchange="toggleInventoryCompact(this.checked)"> 콤팩트</label>' +
'        </div>' +
'      </div>' +
'      <div class="flex flex-wrap gap-1.5" id="inv-status-chips">' +
'        <button type="button" class="inv-chip active" data-inv-status="all" onclick="setInventoryStatusFilter(\'all\')">전체</button>' +
'        <button type="button" class="inv-chip" data-inv-status="at_risk" onclick="setInventoryStatusFilter(\'at_risk\')">위험</button>' +
'        <button type="button" class="inv-chip" data-inv-status="critical" onclick="setInventoryStatusFilter(\'critical\')">품절 임박</button>' +
'        <button type="button" class="inv-chip" data-inv-status="warning" onclick="setInventoryStatusFilter(\'warning\')">주의</button>' +
'        <button type="button" class="inv-chip" data-inv-status="safe" onclick="setInventoryStatusFilter(\'safe\')">안전</button>' +
'        <button type="button" class="inv-chip" data-inv-status="mismatch" onclick="setInventoryStatusFilter(\'mismatch\')">채널 불일치</button>' +
'        <button type="button" class="inv-chip" data-inv-status="watch" onclick="setInventoryStatusFilter(\'watch\')">★ 관심</button>' +
'      </div>' +
'      <div class="flex flex-wrap justify-between items-center gap-2 text-[11px] text-gray-500">' +
'        <span><strong class="text-gray-300" id="inv-result-count">0</strong> / <span id="inv-result-total">0</span>건 · 품절임박 <strong class="text-danger" id="inv-critical-count">0</strong></span>' +
'        <span class="text-gray-600">★ 헤더 = 현재목록 전체선택/해제 · SKU 클릭 = 복사</span>' +
'      </div>' +
'    </div>' +

'    <div class="overflow-x-auto inv-table-scroll">' +
'      <table class="w-full text-sm" id="inventory-table">' +
'        <thead class="text-gray-500 text-xs border-b border-border bg-surface/80 sticky top-0 z-10">' +
'          <tr>' +
'            <th class="px-3 py-3 text-center font-medium w-11" title="관심 전체선택/해제">' +
'              <label class="inv-watch-all-wrap inline-flex flex-col items-center gap-0.5 cursor-pointer">' +
'                <input type="checkbox" id="inv-watch-all" class="rounded inv-watch-all" aria-label="현재 목록 관심 전체선택 또는 전부해제" onchange="toggleInventoryWatchAll(this.checked)">' +
'                <span class="text-[9px] font-bold text-gray-500 leading-none">★</span>' +
'              </label>' +
'            </th>' +
'            <th class="px-3 py-3 text-left font-medium"><button type="button" class="inv-sort-btn" data-sort="sku" data-label="SKU" onclick="sortInventory(\'sku\')">SKU</button></th>' +
'            <th class="px-4 py-3 text-left font-medium min-w-[180px]"><button type="button" class="inv-sort-btn" data-sort="name" data-label="상품명" onclick="sortInventory(\'name\')">상품명</button></th>' +
'            <th class="px-3 py-3 text-center font-medium"><button type="button" class="inv-sort-btn" data-sort="total" data-label="사방넷" onclick="sortInventory(\'total\')">사방넷</button></th>' +
'            <th class="px-2 py-3 text-center font-medium"><button type="button" class="inv-sort-btn" data-sort="cafe24" data-label="Cafe24" onclick="sortInventory(\'cafe24\')">Cafe24</button></th>' +
'            <th class="px-2 py-3 text-center font-medium"><button type="button" class="inv-sort-btn" data-sort="smartstore" data-label="스마트" onclick="sortInventory(\'smartstore\')">스마트</button></th>' +
'            <th class="px-2 py-3 text-center font-medium"><button type="button" class="inv-sort-btn" data-sort="coupang" data-label="쿠팡" onclick="sortInventory(\'coupang\')">쿠팡</button></th>' +
'            <th class="px-2 py-3 text-center font-medium"><button type="button" class="inv-sort-btn" data-sort="ably" data-label="에이블리" onclick="sortInventory(\'ably\')">에이블리</button></th>' +
'            <th class="px-3 py-3 text-center font-medium"><button type="button" class="inv-sort-btn" data-sort="safety" data-label="안전*" onclick="sortInventory(\'safety\')">안전*</button></th>' +
'            <th class="px-3 py-3 text-center font-medium"><button type="button" class="inv-sort-btn" data-sort="gap" data-label="부족" onclick="sortInventory(\'gap\')">부족</button></th>' +
'            <th class="px-3 py-3 text-center font-medium"><button type="button" class="inv-sort-btn" data-sort="daysCover" data-label="가용량" onclick="sortInventory(\'daysCover\')">가용량</button></th>' +
'            <th class="px-3 py-3 text-center font-medium"><button type="button" class="inv-sort-btn" data-sort="priority" data-label="상태" onclick="sortInventory(\'priority\')">상태</button></th>' +
'          </tr>' +
'        </thead>' +
'        <tbody class="divide-y divide-border" id="inventory-tbody"></tbody>' +
'      </table>' +
'    </div>' +
'    <p class="text-[10px] text-gray-600 px-5 py-3 border-t border-border">* 안전재고 = Omnify 경보 기준값 · 가용량 = 실재고 ÷ 추정 일판매(데모) · 채널 불일치 = 채널 합 ≠ 사방넷 실재고 · 이 화면은 조회 전용입니다.</p>' +
'  </div>' +
'</div>';
    }

    function initInventoryView() {
        invState.search = '';
        invState.status = 'all';
        invState.lowCoverOnly = false;
        // keep pin/compact user prefs in session
        renderInventoryTable();
        bindInventoryTableActions();
        requestAnimationFrame(function () {
            var input = document.getElementById('inv-search-input');
            if (input && window.innerWidth >= 768) input.focus();
        });
    }

    // Keyboard: `/` focuses search on inventory view
    if (typeof document !== 'undefined') {
        document.addEventListener('keydown', function (e) {
            if (typeof App === 'undefined' || App.currentView !== 'view-inventory') return;
            if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
                var tag = (e.target && e.target.tagName) || '';
                if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return;
                e.preventDefault();
                focusInventorySearch();
            }
            if (e.key === 'Escape') {
                var input = document.getElementById('inv-search-input');
                if (input && document.activeElement === input && invState.search) {
                    invState.search = '';
                    input.value = '';
                    renderInventoryTable();
                }
            }
        });
    }

    global.buildInventoryShellHtml = buildInventoryShellHtml;
    global.initInventoryView = initInventoryView;
    global.renderInventoryTable = renderInventoryTable;
    global.setInventoryStatusFilter = setInventoryStatusFilter;
    global.focusInventoryGapSort = focusInventoryGapSort;
    global.setInventorySearch = setInventorySearch;
    global.sortInventory = sortInventory;
    global.resetInventoryFilters = resetInventoryFilters;
    global.toggleInventoryPinRisk = toggleInventoryPinRisk;
    global.toggleInventoryCompact = toggleInventoryCompact;
    global.toggleInventoryLowCover = toggleInventoryLowCover;
    global.toggleInventoryWatch = toggleWatch;
    global.toggleInventoryWatchAll = toggleWatchAllVisible;
    global.copyInventorySku = copyInventorySku;
    global.exportInventoryCSV = exportInventoryCSV;
    global.focusInventorySearch = focusInventorySearch;
})(typeof window !== 'undefined' ? window : this);
