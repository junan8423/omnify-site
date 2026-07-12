/* Omnify Notice Board — public view + admin CRUD */
(function () {
    var SESSION_KEY = 'omnify_notice_admin_secret';
    var notices = [];
    var editingId = null;

    var els = {
        list: document.getElementById('notice-list'),
        empty: document.getElementById('notice-empty'),
        adminBar: document.getElementById('notice-admin-bar'),
        adminPanel: document.getElementById('notice-admin-panel'),
        loginModal: document.getElementById('notice-login-modal'),
        loginForm: document.getElementById('notice-login-form'),
        loginError: document.getElementById('notice-login-error'),
        form: document.getElementById('notice-form'),
        formTitle: document.getElementById('notice-form-title'),
        titleInput: document.getElementById('notice-title'),
        contentInput: document.getElementById('notice-content'),
        pinnedInput: document.getElementById('notice-pinned'),
        saveStatus: document.getElementById('notice-save-status'),
        adminList: document.getElementById('notice-admin-list')
    };

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function formatDate(iso) {
        if (!iso) return '';
        var p = iso.split('-');
        if (p.length === 3) return p[0] + '.' + p[1] + '.' + p[2];
        return iso;
    }

    function isAdmin() {
        return !!sessionStorage.getItem(SESSION_KEY);
    }

    function getAdminSecret() {
        return sessionStorage.getItem(SESSION_KEY) || '';
    }

    function apiBase() {
        if (location.protocol === 'file:') return null;
        return '/api/notices';
    }

    function loadNotices() {
        var base = apiBase();
        var staticUrl = 'data/notices.json';

        function apply(data) {
            notices = (data && data.notices) ? data.notices.slice() : [];
            notices.sort(function (a, b) {
                if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
                return (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || '');
            });
            renderPublic();
            if (isAdmin()) renderAdmin();
        }

        if (base) {
            return fetch(base)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data && data.notices) return apply(data);
                    return fetch(staticUrl + '?t=' + Date.now()).then(function (r) { return r.json(); }).then(apply);
                })
                .catch(function () {
                    return fetch(staticUrl).then(function (r) { return r.json(); }).then(apply);
                });
        }
        return fetch(staticUrl).then(function (r) { return r.json(); }).then(apply);
    }

    function renderPublic() {
        if (!els.list) return;
        if (!notices.length) {
            els.list.innerHTML = '';
            if (els.empty) els.empty.classList.remove('hidden');
            return;
        }
        if (els.empty) els.empty.classList.add('hidden');
        els.list.innerHTML = notices.map(function (n) {
            var pin = n.pinned ? '<span class="notice-pin">고정</span>' : '';
            var date = formatDate(n.updatedAt || n.createdAt);
            return (
                '<article class="notice-item" id="notice-' + escapeHtml(n.id) + '">' +
                '<div class="notice-item-head">' + pin +
                '<time class="notice-date" datetime="' + escapeHtml(n.updatedAt || n.createdAt || '') + '">' + escapeHtml(date) + '</time>' +
                '</div>' +
                '<h2 class="notice-item-title">' + escapeHtml(n.title) + '</h2>' +
                '<div class="notice-item-body">' + escapeHtml(n.content).replace(/\n/g, '<br>') + '</div>' +
                '</article>'
            );
        }).join('');
    }

    function renderAdmin() {
        if (!els.adminList) return;
        els.adminList.innerHTML = notices.map(function (n) {
            return (
                '<div class="notice-admin-row">' +
                '<div class="min-w-0 flex-1">' +
                '<p class="font-semibold text-sm text-white truncate">' + escapeHtml(n.title) + '</p>' +
                '<p class="text-[10px] text-gray-500">' + escapeHtml(formatDate(n.updatedAt || n.createdAt)) +
                (n.pinned ? ' · 고정' : '') + '</p>' +
                '</div>' +
                '<div class="flex gap-1.5 shrink-0">' +
                '<button type="button" class="notice-admin-btn" data-edit="' + escapeHtml(n.id) + '">수정</button>' +
                '<button type="button" class="notice-admin-btn danger" data-delete="' + escapeHtml(n.id) + '">삭제</button>' +
                '</div></div>'
            );
        }).join('');

        els.adminList.querySelectorAll('[data-edit]').forEach(function (btn) {
            btn.addEventListener('click', function () { startEdit(btn.getAttribute('data-edit')); });
        });
        els.adminList.querySelectorAll('[data-delete]').forEach(function (btn) {
            btn.addEventListener('click', function () { deleteNotice(btn.getAttribute('data-delete')); });
        });
    }

    function updateAdminUI() {
        var on = isAdmin();
        if (els.adminBar) els.adminBar.classList.toggle('hidden', !on);
        if (els.adminPanel) els.adminPanel.classList.toggle('hidden', !on);
        document.getElementById('notice-login-open').classList.toggle('hidden', on);
        if (on) renderAdmin();
    }

    function todayISO() {
        return new Date().toISOString().slice(0, 10);
    }

    function newId() {
        return 'notice-' + Date.now();
    }

    function resetForm() {
        editingId = null;
        if (els.formTitle) els.formTitle.textContent = '공지 등록';
        if (els.titleInput) els.titleInput.value = '';
        if (els.contentInput) els.contentInput.value = '';
        if (els.pinnedInput) els.pinnedInput.checked = false;
        if (els.saveStatus) els.saveStatus.textContent = '';
    }

    function startEdit(id) {
        var n = notices.find(function (x) { return x.id === id; });
        if (!n) return;
        editingId = id;
        if (els.formTitle) els.formTitle.textContent = '공지 수정';
        els.titleInput.value = n.title;
        els.contentInput.value = n.content;
        els.pinnedInput.checked = !!n.pinned;
        els.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function deleteNotice(id) {
        if (!confirm('이 공지를 삭제할까요?')) return;
        notices = notices.filter(function (n) { return n.id !== id; });
        persistNotices();
    }

    function persistNotices() {
        var base = apiBase();
        var payload = { notices: notices };

        if (!base || !isAdmin()) {
            if (els.saveStatus) els.saveStatus.textContent = '로컬 미리보기만 가능합니다. Vercel 배포 후 저장됩니다.';
            renderPublic();
            renderAdmin();
            return;
        }

        if (els.saveStatus) els.saveStatus.textContent = '저장 중…';

        fetch(base, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Secret': getAdminSecret()
            },
            body: JSON.stringify(payload)
        })
            .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
            .then(function (res) {
                if (!res.ok) throw new Error((res.data && res.data.error) || '저장 실패');
                if (els.saveStatus) els.saveStatus.textContent = '저장되었습니다.';
                renderPublic();
                renderAdmin();
                resetForm();
                setTimeout(function () {
                    if (els.saveStatus) els.saveStatus.textContent = '';
                }, 3000);
            })
            .catch(function (err) {
                if (els.saveStatus) els.saveStatus.textContent = err.message || '저장 실패';
            });
    }

    function onFormSubmit(e) {
        e.preventDefault();
        if (!isAdmin()) return;
        var title = (els.titleInput.value || '').trim();
        var content = (els.contentInput.value || '').trim();
        if (!title || !content) {
            alert('제목과 내용을 입력해 주세요.');
            return;
        }
        var now = todayISO();
        if (editingId) {
            notices = notices.map(function (n) {
                if (n.id !== editingId) return n;
                return {
                    id: n.id,
                    title: title,
                    content: content,
                    pinned: els.pinnedInput.checked,
                    createdAt: n.createdAt,
                    updatedAt: now
                };
            });
        } else {
            notices.unshift({
                id: newId(),
                title: title,
                content: content,
                pinned: els.pinnedInput.checked,
                createdAt: now,
                updatedAt: now
            });
        }
        persistNotices();
    }

    function openLogin() {
        if (els.loginModal) els.loginModal.classList.remove('hidden');
        if (els.loginError) els.loginError.textContent = '';
    }

    function closeLogin() {
        if (els.loginModal) els.loginModal.classList.add('hidden');
        if (els.loginForm) els.loginForm.reset();
    }

    function onLoginSubmit(e) {
        e.preventDefault();
        var pw = (document.getElementById('notice-login-password').value || '').trim();
        if (!pw) return;

        var base = apiBase();
        if (!base) {
            if (els.loginError) els.loginError.textContent = '로컬 파일에서는 관리자 기능을 사용할 수 없습니다. 배포된 사이트에서 이용해 주세요.';
            return;
        }

        fetch(base, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify', password: pw })
        })
            .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
            .then(function (res) {
                if (!res.ok || !res.data.ok) {
                    if (els.loginError) els.loginError.textContent = '비밀번호가 올바르지 않습니다.';
                    return;
                }
                sessionStorage.setItem(SESSION_KEY, pw);
                closeLogin();
                updateAdminUI();
                renderAdmin();
            })
            .catch(function () {
                if (els.loginError) els.loginError.textContent = '인증 요청에 실패했습니다.';
            });
    }

    function logout() {
        sessionStorage.removeItem(SESSION_KEY);
        resetForm();
        updateAdminUI();
    }

    document.getElementById('notice-login-open').addEventListener('click', openLogin);
    document.getElementById('notice-login-close').addEventListener('click', closeLogin);
    document.getElementById('notice-logout').addEventListener('click', logout);
    if (els.loginForm) els.loginForm.addEventListener('submit', onLoginSubmit);
    if (els.form) els.form.addEventListener('submit', onFormSubmit);
    document.getElementById('notice-form-cancel').addEventListener('click', resetForm);

    loadNotices().then(function () {
        updateAdminUI();
    });
})();
