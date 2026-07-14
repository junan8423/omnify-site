/**
 * 어드민 항목별 접근 권한
 * ceo(대표) / ops(구축·운영) / sales(영업)
 * Storage: omnify_admin_role
 */
(function (global) {
    'use strict';

    var KEY = 'omnify_admin_role';
    var ROLES = {
        ceo: { id: 'ceo', label: '대표', desc: '전체 + 영업이익 특수항목' },
        ops: { id: 'ops', label: '구축·운영', desc: '계약·구축·수집 (특수항목 제외)' },
        sales: { id: 'sales', label: '영업', desc: '계약·견적·수집 (구축 일부·특수항목 제외)' }
    };

    /** data-admin-perm 값 → 허용 역할 */
    var PERM_ROLES = {
        ceo: ['ceo'],
        special_profit: ['ceo'],
        ops: ['ceo', 'ops'],
        sales: ['ceo', 'ops', 'sales'],
        all: ['ceo', 'ops', 'sales']
    };

    function getRole() {
        try {
            var r = localStorage.getItem(KEY) || 'ceo';
            return ROLES[r] ? r : 'ceo';
        } catch (e) {
            return 'ceo';
        }
    }

    function setRole(role) {
        if (!ROLES[role]) role = 'ceo';
        try { localStorage.setItem(KEY, role); } catch (e) { /* ignore */ }
        applyDom();
        return role;
    }

    function can(perm) {
        var need = PERM_ROLES[perm] || PERM_ROLES.all;
        return need.indexOf(getRole()) >= 0;
    }

    function applyDom() {
        var role = getRole();
        document.querySelectorAll('[data-admin-perm]').forEach(function (el) {
            var perm = el.getAttribute('data-admin-perm') || 'all';
            var ok = can(perm);
            el.classList.toggle('admin-perm-locked', !ok);
            if (ok) {
                el.style.removeProperty('display');
            } else {
                el.style.display = 'none';
            }
        });
        var sel = document.getElementById('admin-role-select');
        if (sel) sel.value = role;
        var lab = document.getElementById('admin-role-label');
        if (lab) lab.textContent = ROLES[role].label + ' 권한';
        var hint = document.getElementById('admin-role-hint');
        if (hint) hint.textContent = ROLES[role].desc;
    }

    function wire() {
        var sel = document.getElementById('admin-role-select');
        if (sel) {
            sel.value = getRole();
            sel.addEventListener('change', function () {
                setRole(sel.value);
                if (typeof toast === 'function') toast('접근 역할: ' + ROLES[sel.value].label, 'info');
            });
        }
        applyDom();
    }

    global.AdminAccess = {
        ROLES: ROLES,
        getRole: getRole,
        setRole: setRole,
        can: can,
        applyDom: applyDom,
        wire: wire
    };
})(typeof window !== 'undefined' ? window : this);
