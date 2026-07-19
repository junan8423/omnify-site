(function () {
  'use strict';

  var params = new URLSearchParams(location.search);
  var tenantId = params.get('tenant') || params.get('id') || 'test0719';
  var statusMap = {};
  var channelDefs = [
    {
      id: 'cafe24', label: 'Cafe24', auth: 'OAuth 2.0',
      desc: '관리자 API OAuth 토큰으로 주문을 수집합니다. 앱 Redirect URI 등록이 선행되어야 합니다.',
      fields: [
        ['mallId', '쇼핑몰 ID', 'text'], ['clientId', 'Client ID', 'text'],
        ['clientSecret', 'Client Secret', 'password'], ['accessToken', 'Access Token', 'password'],
        ['refreshToken', 'Refresh Token', 'password']
      ]
    },
    {
      id: 'smartstore', label: '네이버 스마트스토어', auth: 'Client Credentials',
      desc: '커머스 API 전자서명으로 토큰을 발급하고 변경 주문을 수집합니다.',
      fields: [
        ['clientId', '애플리케이션 ID', 'text'], ['clientSecret', '애플리케이션 시크릿', 'password'],
        ['tokenType', '토큰 유형', 'select', [['SELF', '내 스토어(SELF)'], ['SELLER', '대행사 판매자(SELLER)']]],
        ['accountId', 'API 연동용 판매자 ID', 'text']
      ]
    },
    {
      id: 'coupang', label: '쿠팡 Wing', auth: 'HMAC-SHA256',
      desc: 'Wing에서 발급한 Vendor ID와 OpenAPI 키로 주문서를 수집합니다. Vercel 고정 IP 허용이 필요할 수 있습니다.',
      fields: [
        ['vendorId', '업체코드(Vendor ID)', 'text'], ['accessKey', 'Access Key', 'text'],
        ['secretKey', 'Secret Key', 'password']
      ]
    },
    {
      id: 'ably', label: '에이블리', auth: '파트너 API',
      desc: '셀러스 계정 API Token과 계약 후 제공된 API 주소가 필요합니다. 공개되지 않은 경로를 임의 추정하지 않습니다.',
      fields: [
        ['sellerId', '셀러 ID', 'text'], ['apiToken', 'API Token', 'password'],
        ['apiBase', '파트너 API Base URL', 'url'], ['testPath', '연결 확인 경로', 'text'],
        ['ordersPath', '주문 조회 경로', 'text']
      ]
    },
    {
      id: 'sabangnet', label: '사방넷 풀필먼트', auth: 'HMAC-SHA256',
      desc: '사방넷 풀필먼트 API 2.0 재고를 수집합니다. 발급 키와 호출 서버 IP를 사방넷에 등록해야 합니다.',
      fields: [
        ['companyCode', '회사코드', 'text'], ['accessKey', 'API Access Key', 'text'],
        ['secretKey', 'API Secret Key', 'password'], ['memberId', '고객사 ID(물류사 권한 시)', 'text'],
        ['environment', '환경', 'select', [['live', 'LIVE'], ['sandbox', 'Sandbox']]]
      ]
    },
    {
      id: 'zigzag', label: '지그재그(카카오스타일)', auth: 'HMAC 서명',
      desc: '카카오스타일 파트너센터 > 스토어 정보 관리 > 상품/주문 API에서 발급한 Access Key·Secret Key로 주문을 수집합니다.',
      fields: [
        ['accessKey', 'Access Key', 'text'], ['secretKey', 'Secret Key', 'password'],
        ['environment', '환경', 'select', [['live', 'LIVE'], ['dev', 'Dev(알파)']]]
      ]
    },
    {
      id: 'musinsa', label: '무신사 파트너', auth: '파트너 API Key',
      desc: '파트너센터 > 업체정보 > API 연동 정보의 API 인증키가 필요합니다. 공개 문서가 없어 계약 시 안내받은 API 주소·경로를 함께 입력해야 합니다.',
      fields: [
        ['apiKey', 'API 인증키', 'password'], ['apiBase', '파트너 API Base URL', 'url'],
        ['testPath', '연결 확인 경로', 'text'], ['ordersPath', '주문 조회 경로', 'text']
      ]
    }
  ];

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
    });
  }

  function fieldHtml(channelId, field) {
    var name = field[0];
    var id = channelId + '-' + name;
    var full = field[2] === 'url' || name === 'ordersPath' || name === 'refreshToken';
    if (field[2] === 'select') {
      return '<div class="field' + (full ? ' full' : '') + '"><label for="' + id + '">' + escapeHtml(field[1]) + '</label><select id="' + id + '" data-field="' + name + '">' +
        field[3].map(function (option) { return '<option value="' + escapeHtml(option[0]) + '">' + escapeHtml(option[1]) + '</option>'; }).join('') +
        '</select></div>';
    }
    return '<div class="field' + (full ? ' full' : '') + '"><label for="' + id + '">' + escapeHtml(field[1]) + '</label><input id="' + id + '" data-field="' + name + '" type="' + field[2] + '" autocomplete="off"></div>';
  }

  function cardHtml(def) {
    var status = statusMap[def.id] || {};
    var state = status.status || '미설정';
    var configured = !!status.configured;
    var meta = [];
    if (status.lastTestAt) meta.push('마지막 테스트 ' + formatTime(status.lastTestAt));
    if (status.lastSyncAt) meta.push('마지막 동기화 ' + formatTime(status.lastSyncAt));
    if (status.lastCounts) meta.push('주문 ' + (status.lastCounts.orders || 0) + ' · 재고 ' + (status.lastCounts.inventory || 0));
    if (status.lastError) meta.push('오류: ' + status.lastError);
    return '<article class="card" data-channel="' + def.id + '">' +
      '<div class="card-head"><div class="title">' + def.label + '</div><span class="badge ' + escapeHtml(status.status || '') + '">' + escapeHtml(state) + '</span></div>' +
      '<p class="desc">' + escapeHtml(def.desc) + '</p>' +
      '<div class="fields">' + def.fields.map(function (field) { return fieldHtml(def.id, field); }).join('') + '</div>' +
      '<div class="actions">' +
        '<button type="button" class="btn primary" data-action="save">암호화 저장</button>' +
        (def.id === 'cafe24' ? '<button type="button" class="btn" data-action="oauth-start">OAuth 승인 시작</button>' : '') +
        '<button type="button" class="btn" data-action="test">연결 테스트</button>' +
        '<button type="button" class="btn" data-action="sync"' + (configured ? '' : ' disabled') + '>저장값 즉시 동기화</button>' +
        '<button type="button" class="btn danger" data-action="delete"' + (configured ? '' : ' disabled') + '>연결 삭제</button>' +
      '</div><div class="meta">' + escapeHtml(meta.join(' · ')) + '</div></article>';
  }

  function render() {
    document.getElementById('tenant-label').textContent = tenantId;
    document.getElementById('dashboard-link').href = 'demo-dashboard.html?tenant=' + encodeURIComponent(tenantId) + '&tier=enterprise';
    document.getElementById('channel-grid').innerHTML = channelDefs.map(cardHtml).join('');
  }

  function formatTime(value) {
    var date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toLocaleString('ko-KR');
  }

  function token() {
    return document.getElementById('connect-token').value.trim();
  }

  async function api(method, body) {
    if (!token()) throw new Error('연동 관리 토큰을 입력해 주세요.');
    try { sessionStorage.setItem('omnify_connect_token_' + tenantId, token()); } catch (e) { /* ignore */ }
    var response = await fetch('/api/channel-connections?tenantId=' + encodeURIComponent(tenantId), {
      method: method,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-Omnify-Connect-Token': token()
      },
      body: body ? JSON.stringify(body) : undefined
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      var error = new Error(data.error || ('HTTP ' + response.status));
      error.details = data.details;
      throw error;
    }
    return data;
  }

  function credentialsFrom(card) {
    var credentials = {};
    card.querySelectorAll('[data-field]').forEach(function (input) {
      credentials[input.getAttribute('data-field')] = input.value.trim();
    });
    return credentials;
  }

  function hasEnteredCredentials(card) {
    return Array.prototype.some.call(card.querySelectorAll('input[data-field]'), function (input) {
      return !!input.value.trim();
    });
  }

  function setBusy(card, busy) {
    card.classList.toggle('loading', busy);
  }

  var toastTimer;
  function showResult(message, isError) {
    var element = document.getElementById('result');
    element.textContent = message;
    element.className = 'result show' + (isError ? ' error' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { element.className = 'result'; }, isError ? 9000 : 4500);
  }

  async function loadStatus() {
    var data = await api('GET');
    statusMap = {};
    (data.connections || []).forEach(function (row) { statusMap[row.channel] = row; });
    render();
    showResult('연동 상태를 불러왔습니다.');
  }

  async function handleAction(button) {
    var card = button.closest('[data-channel]');
    var channel = card.getAttribute('data-channel');
    var action = button.getAttribute('data-action');
    var payload = { action: action, tenantId: tenantId, channel: channel };
    if (action === 'save' || action === 'oauth-start' || (action === 'test' && (hasEnteredCredentials(card) || !statusMap[channel] || !statusMap[channel].configured))) {
      payload.credentials = credentialsFrom(card);
    }
    if (action === 'delete' && !confirm('저장된 ' + channel + ' 자격증명을 삭제할까요?')) return;
    setBusy(card, true);
    try {
      var data = await api(action === 'delete' ? 'DELETE' : 'POST', payload);
      if (action === 'oauth-start') {
        location.href = data.authorizeUrl;
        return;
      }
      if (data.connection) statusMap[channel] = data.connection;
      if (action === 'delete') delete statusMap[channel];
      if (action === 'sync') {
        statusMap[channel] = Object.assign({}, statusMap[channel], {
          status: 'connected',
          configured: true,
          lastSyncAt: new Date().toISOString(),
          lastCounts: data.counts
        });
      }
      render();
      var messages = {
        save: '자격증명을 암호화해 저장했습니다.',
        test: '실제 채널 API 연결에 성공했습니다.',
        sync: '동기화가 완료되었습니다. 주문 ' + ((data.counts || {}).orders || 0) + '건 · 재고 ' + ((data.counts || {}).inventory || 0) + '건',
        delete: '연결 정보가 삭제되었습니다.'
      };
      showResult(messages[action] || '완료했습니다.');
    } catch (error) {
      var detail = error.details && error.details.body ? '\n' + JSON.stringify(error.details.body) : '';
      showResult(error.message + detail, true);
      setBusy(card, false);
    }
  }

  document.getElementById('load-status').addEventListener('click', function () {
    loadStatus().catch(function (error) { showResult(error.message, true); });
  });
  document.getElementById('channel-grid').addEventListener('click', function (event) {
    var button = event.target.closest('button[data-action]');
    if (button) handleAction(button);
  });
  try { document.getElementById('connect-token').value = sessionStorage.getItem('omnify_connect_token_' + tenantId) || ''; } catch (e) { /* ignore */ }
  render();
  if (params.get('oauth')) {
    showResult(params.get('message') || (params.get('oauth') === 'success' ? 'OAuth 승인이 완료되었습니다.' : 'OAuth 승인에 실패했습니다.'), params.get('oauth') !== 'success');
  }
}());
