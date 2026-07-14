/**
 * Omnify CS · 기능오류 접수 (대시보드 ↔ 어드민)
 * Firestore API + localStorage 미러
 */
(function (global) {
    'use strict';

    var KEY = 'omnify_cs_tickets_v1';
    var API = '/api/cs-tickets';

    var CAT = {
        bug: { label: '기능 오류', cls: 'bug' },
        improve: { label: '개선 요청', cls: 'improve' },
        cs: { label: 'CS · 문의', cls: 'cs' },
        other: { label: '기타', cls: 'other' }
    };

    var STATUS = {
        open: { label: '접수', cls: 'open' },
        reviewing: { label: '확인중', cls: 'reviewing' },
        done: { label: '처리완료', cls: 'done' },
        closed: { label: '종료', cls: 'closed' }
    };

    function loadLocal() {
        try {
            var raw = localStorage.getItem(KEY);
            var list = raw ? JSON.parse(raw) : [];
            return Array.isArray(list) ? list : [];
        } catch (e) {
            return [];
        }
    }

    function saveLocal(list) {
        try {
            localStorage.setItem(KEY, JSON.stringify(list.slice(0, 300)));
        } catch (e) { /* ignore */ }
    }

    function upsertLocal(ticket) {
        var list = loadLocal().filter(function (t) { return t.id !== ticket.id; });
        list.unshift(ticket);
        saveLocal(list);
        return list;
    }

    function apiFetch(opts) {
        opts = opts || {};
        return fetch(API, {
            method: opts.method || 'GET',
            credentials: 'same-origin',
            headers: Object.assign(
                { Accept: 'application/json' },
                opts.body ? { 'Content-Type': 'application/json' } : {}
            ),
            body: opts.body ? JSON.stringify(opts.body) : undefined
        }).then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (data) {
                if (!res.ok) {
                    var err = new Error((data && data.error) || ('HTTP ' + res.status));
                    err.status = res.status;
                    err.data = data;
                    throw err;
                }
                return data;
            });
        });
    }

    function submit(payload) {
        var id = 'cs_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
        var ticket = {
            id: id,
            category: payload.category || 'other',
            title: String(payload.title || '').trim(),
            body: String(payload.body || '').trim(),
            contact: String(payload.contact || '').trim(),
            company: payload.company || '',
            tenantKey: payload.tenantKey || '',
            page: payload.page || (typeof location !== 'undefined' ? location.pathname : ''),
            view: payload.view || '',
            userName: payload.userName || '',
            status: 'open',
            adminNote: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        if (!ticket.title || !ticket.body) {
            return Promise.reject(new Error('제목과 내용을 입력해 주세요.'));
        }
        upsertLocal(ticket);
        return apiFetch({ method: 'POST', body: ticket }).then(function (data) {
            if (data && data.ticket) upsertLocal(data.ticket);
            return data && data.ticket ? data.ticket : ticket;
        }).catch(function () {
            /* 서버 실패 시 로컬 접수로 admin(동일 브라우저/오리진)에서 확인 가능 */
            return ticket;
        });
    }

    function list() {
        return loadLocal().slice().sort(function (a, b) {
            return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
        });
    }

    function hydrate() {
        return apiFetch({ method: 'GET' }).then(function (data) {
            var tickets = (data && data.tickets) ? data.tickets : [];
            var local = loadLocal();
            var map = {};
            tickets.concat(local).forEach(function (t) {
                if (!t || !t.id) return;
                var prev = map[t.id];
                if (!prev || String(t.updatedAt || '') >= String(prev.updatedAt || '')) map[t.id] = t;
            });
            var merged = Object.keys(map).map(function (k) { return map[k]; });
            merged.sort(function (a, b) {
                return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
            });
            saveLocal(merged);
            return merged;
        }).catch(function () {
            return list();
        });
    }

    function updateStatus(id, status, adminNote) {
        var list0 = loadLocal();
        var found = null;
        list0 = list0.map(function (t) {
            if (t.id !== id) return t;
            found = Object.assign({}, t, {
                status: status || t.status,
                adminNote: adminNote != null ? adminNote : t.adminNote,
                updatedAt: new Date().toISOString()
            });
            return found;
        });
        if (!found) return Promise.reject(new Error('접수를 찾을 수 없습니다.'));
        saveLocal(list0);
        return apiFetch({
            method: 'PATCH',
            body: { id: id, status: found.status, adminNote: found.adminNote }
        }).then(function (data) {
            if (data && data.ticket) upsertLocal(data.ticket);
            return data && data.ticket ? data.ticket : found;
        }).catch(function () {
            return found;
        });
    }

    function openCount() {
        return list().filter(function (t) { return t.status === 'open' || t.status === 'reviewing'; }).length;
    }

    global.OmnifyCs = {
        CAT: CAT,
        STATUS: STATUS,
        submit: submit,
        list: list,
        hydrate: hydrate,
        updateStatus: updateStatus,
        openCount: openCount
    };
})(typeof window !== 'undefined' ? window : this);
