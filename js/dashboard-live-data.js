(function () {
  'use strict';

  function normalizeStatus(value) {
    var status = String(value || '').toUpperCase();
    if (/SHIP|DELIVER|COMPLETE|DONE/.test(status)) return 'shipped';
    if (/PAY|ACCEPT|READY|PROCESS|PREPARE/.test(status)) return 'processing';
    return 'pending';
  }

  function mapOrder(row) {
    var date = new Date(row.orderedAt);
    var time = isNaN(date.getTime()) ? String(row.orderedAt || '').slice(11, 19) : date.toLocaleTimeString('ko-KR', { hour12: false });
    return {
      id: row.externalId || '',
      sourceOrderId: row.externalId || '',
      channel: row.channel || '',
      product: (row.channel || '채널') + ' 실연동 주문',
      productTitle: (row.channel || '채널') + ' 실연동 주문',
      amount: Number(row.amount || 0),
      status: normalizeStatus(row.status),
      sourceStatus: row.status || '',
      time: time,
      buyerName: row.buyerName || ''
    };
  }

  function mapInventory(row) {
    return {
      sku: row.sku || row.externalId || '',
      name: '사방넷 출고상품 #' + (row.sku || row.externalId || ''),
      qtyWms: Number(row.available || row.total || 0),
      qtyByChannel: { cafe24: 0, smartstore: 0, coupang: 0, ably: 0, zigzag: 0, musinsa: 0 },
      safety: Math.max(10, Math.round(Number(row.available || 0) * 0.2)),
      allocated: Number(row.allocated || 0),
      damaged: Number(row.damaged || 0),
      liveSource: row.channel || 'sabangnet'
    };
  }

  async function loadLiveData() {
    var tenantId = new URLSearchParams(location.search).get('tenant');
    if (!tenantId || !window.App) return;
    var token = '';
    try { token = sessionStorage.getItem('omnify_connect_token_' + tenantId) || ''; } catch (e) { /* ignore */ }
    if (!token) {
      if (tenantId === 'test0719' && typeof showToast === 'function') {
        showToast('실데이터를 보려면 채널 연동센터에서 토큰 인증 후 대시보드를 여세요.', 'warning');
      }
      return;
    }
    var response = await fetch('/api/channel-data?tenantId=' + encodeURIComponent(tenantId), {
      credentials: 'same-origin',
      headers: { 'X-Omnify-Connect-Token': token }
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(data.error || ('HTTP ' + response.status));

    if (data.orders && data.orders.length) App.orders = data.orders.map(mapOrder);
    if (data.inventory && data.inventory.length) App.inventory = data.inventory.map(mapInventory);
    App.liveData = {
      enabled: true,
      tenantId: tenantId,
      orders: (data.orders || []).length,
      inventory: (data.inventory || []).length,
      loadedAt: new Date().toISOString()
    };
    if (typeof updateNavBadges === 'function') updateNavBadges();
    if (typeof switchView === 'function' && App.currentView) switchView(App.currentView);
    if (typeof showToast === 'function') {
      showToast('실연동 데이터 적용 · 주문 ' + App.liveData.orders + '건 · 재고 ' + App.liveData.inventory + '건', 'success');
    }
  }

  function start() {
    var attempts = 0;
    function waitForDashboard() {
      attempts += 1;
      if (!window.App || !App.currentView) {
        if (attempts < 40) setTimeout(waitForDashboard, 250);
        return;
      }
      loadLiveData().catch(function (error) {
        if (typeof showToast === 'function') showToast('실연동 데이터 로드 실패: ' + error.message, 'warning');
      });
    }
    setTimeout(waitForDashboard, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
}());
