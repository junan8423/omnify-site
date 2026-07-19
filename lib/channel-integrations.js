/* Omnify server-side commerce channel connectors. Never import this file in browser code. */
'use strict';

var crypto = require('crypto');

var CHANNELS = {
  cafe24: {
    label: 'Cafe24',
    fields: ['mallId', 'clientId', 'clientSecret', 'accessToken', 'refreshToken'],
    required: ['mallId', 'clientId', 'clientSecret'],
    mode: 'oauth2'
  },
  smartstore: {
    label: '네이버 스마트스토어',
    fields: ['clientId', 'clientSecret', 'accountId', 'tokenType'],
    required: ['clientId', 'clientSecret'],
    mode: 'client_credentials'
  },
  coupang: {
    label: '쿠팡 Wing',
    fields: ['vendorId', 'accessKey', 'secretKey'],
    required: ['vendorId', 'accessKey', 'secretKey'],
    mode: 'hmac'
  },
  ably: {
    label: '에이블리',
    fields: ['sellerId', 'apiToken', 'apiBase', 'testPath', 'ordersPath'],
    required: ['sellerId', 'apiToken', 'apiBase', 'testPath'],
    mode: 'partner'
  },
  sabangnet: {
    label: '사방넷 풀필먼트',
    fields: ['companyCode', 'accessKey', 'secretKey', 'memberId', 'environment'],
    required: ['companyCode', 'accessKey', 'secretKey'],
    mode: 'hmac'
  },
  zigzag: {
    label: '지그재그(카카오스타일)',
    fields: ['accessKey', 'secretKey', 'environment'],
    required: ['accessKey', 'secretKey'],
    mode: 'hmac'
  },
  musinsa: {
    label: '무신사 파트너',
    fields: ['apiKey', 'apiBase', 'testPath', 'ordersPath'],
    required: ['apiKey', 'apiBase', 'testPath'],
    mode: 'partner'
  }
};

function cleanString(value, max) {
  return String(value == null ? '' : value).trim().slice(0, max || 500);
}

function sanitizeCredentials(channel, raw) {
  var meta = CHANNELS[channel];
  if (!meta) throw typedError('UNSUPPORTED_CHANNEL', '지원하지 않는 채널입니다: ' + channel);
  var source = raw || {};
  var result = {};
  meta.fields.forEach(function (field) {
    result[field] = cleanString(source[field], field.toLowerCase().indexOf('secret') >= 0 ? 4000 : 1000);
  });
  if (channel === 'smartstore') result.tokenType = result.tokenType === 'SELLER' ? 'SELLER' : 'SELF';
  if (channel === 'sabangnet') result.environment = result.environment === 'sandbox' ? 'sandbox' : 'live';
  if (channel === 'zigzag') result.environment = result.environment === 'dev' ? 'dev' : 'live';
  validateCredentials(channel, result);
  return result;
}

function validateCredentials(channel, credentials) {
  var meta = CHANNELS[channel];
  var missing = meta.required.filter(function (key) { return !credentials[key]; });
  if (channel === 'smartstore' && credentials.tokenType === 'SELLER' && !credentials.accountId) {
    missing.push('accountId');
  }
  if (missing.length) {
    throw typedError('MISSING_CREDENTIALS', meta.label + ' 필수 정보가 없습니다: ' + missing.join(', '));
  }
}

function typedError(code, message, details) {
  var error = new Error(message);
  error.code = code;
  if (details) error.details = details;
  return error;
}

async function requestJson(url, options) {
  var opts = options || {};
  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, opts.timeoutMs || 15000);
  try {
    var response = await fetch(url, Object.assign({}, opts, { signal: controller.signal }));
    var text = await response.text();
    var body;
    try { body = text ? JSON.parse(text) : {}; } catch (e) { body = { raw: text.slice(0, 2000) }; }
    if (!response.ok) {
      throw typedError('UPSTREAM_ERROR', '채널 API가 HTTP ' + response.status + '를 반환했습니다.', {
        status: response.status,
        body: redactObject(body),
        traceId: response.headers.get('gncp-gw-trace-id') || response.headers.get('x-request-id') || ''
      });
    }
    return { status: response.status, body: body, headers: response.headers };
  } catch (error) {
    if (error && error.name === 'AbortError') throw typedError('UPSTREAM_TIMEOUT', '채널 API 응답 시간이 초과되었습니다.');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function redactObject(value) {
  if (Array.isArray(value)) return value.slice(0, 20).map(redactObject);
  if (!value || typeof value !== 'object') return value;
  var out = {};
  Object.keys(value).slice(0, 50).forEach(function (key) {
    if (/token|secret|password|authorization|key/i.test(key)) out[key] = '[REDACTED]';
    else out[key] = redactObject(value[key]);
  });
  return out;
}

async function cafe24Token(c) {
  if (c.accessToken) return { accessToken: c.accessToken, refreshed: false };
  if (!c.refreshToken) throw typedError('AUTHORIZATION_REQUIRED', 'Cafe24 OAuth 승인이 필요합니다.');
  var basic = Buffer.from(c.clientId + ':' + c.clientSecret).toString('base64');
  var body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: c.refreshToken });
  var result = await requestJson('https://' + encodeURIComponent(c.mallId) + '.cafe24api.com/api/v2/oauth/token', {
    method: 'POST',
    headers: { Authorization: 'Basic ' + basic, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });
  return {
    accessToken: result.body.access_token,
    refreshToken: result.body.refresh_token || c.refreshToken,
    expiresAt: result.body.expires_at || '',
    refreshed: true
  };
}

async function cafe24Request(c, path) {
  var token = await cafe24Token(c);
  var result = await requestJson('https://' + encodeURIComponent(c.mallId) + '.cafe24api.com' + path, {
    headers: { Authorization: 'Bearer ' + token.accessToken, 'Content-Type': 'application/json' }
  });
  result.rotatedCredentials = token.refreshed ? {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    expiresAt: token.expiresAt
  } : null;
  return result;
}

async function naverToken(c) {
  var bcrypt = require('bcryptjs');
  var timestamp = String(Date.now());
  var signature = Buffer.from(bcrypt.hashSync(c.clientId + '_' + timestamp, c.clientSecret)).toString('base64');
  var form = {
    client_id: c.clientId,
    timestamp: timestamp,
    client_secret_sign: signature,
    grant_type: 'client_credentials',
    type: c.tokenType || 'SELF'
  };
  if (form.type === 'SELLER') form.account_id = c.accountId;
  var result = await requestJson('https://api.commerce.naver.com/external/v1/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(form).toString()
  });
  return result.body.access_token;
}

async function naverRequest(c, path) {
  var accessToken = await naverToken(c);
  return requestJson('https://api.commerce.naver.com' + path, {
    headers: { Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json' }
  });
}

function coupangSignedHeaders(c, method, url) {
  var parsed = new URL(url);
  var signedDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '').slice(2);
  var message = signedDate + method.toUpperCase() + parsed.pathname + parsed.search.slice(1);
  var signature = crypto.createHmac('sha256', c.secretKey).update(message).digest('hex');
  return {
    Authorization: 'CEA algorithm=HmacSHA256, access-key=' + c.accessKey + ', signed-date=' + signedDate + ', signature=' + signature,
    'X-Requested-By': c.vendorId,
    'X-MARKET': 'KR',
    'Content-Type': 'application/json'
  };
}

async function coupangRequest(c, method, path, query) {
  var url = new URL('https://api-gateway.coupang.com' + path);
  Object.keys(query || {}).forEach(function (key) { url.searchParams.set(key, query[key]); });
  return requestJson(url.toString(), { method: method, headers: coupangSignedHeaders(c, method, url.toString()) });
}

function sabangnetAuth(c) {
  var date = new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, '');
  var dateKey = crypto.createHmac('sha256', c.secretKey).update(date).digest('hex');
  var signKey = crypto.createHmac('sha256', dateKey).update(c.accessKey).digest('hex');
  return {
    Authorization: c.environment === 'sandbox' ? 'API.SENDBOX-HMAC-SHA256' : 'LIVE-HMAC-SHA256',
    Credential: c.companyCode + '/' + c.accessKey + '/' + date + '/srwms_request',
    Signature: Buffer.from(signKey).toString('base64'),
    'Content-Type': 'application/json'
  };
}

async function sabangnetRequest(c, path, query) {
  var host = c.environment === 'sandbox' ? 'https://sandbox.api.sbfulfillment.co.kr' : 'https://napi.sbfulfillment.co.kr';
  var url = new URL(host + path);
  Object.keys(query || {}).forEach(function (key) {
    if (query[key] !== '' && query[key] != null) url.searchParams.set(key, query[key]);
  });
  return requestJson(url.toString(), { headers: sabangnetAuth(c) });
}

async function ablyRequest(c, path) {
  var base = c.apiBase.replace(/\/+$/, '');
  var target = path.charAt(0) === '/' ? path : '/' + path;
  return requestJson(base + target, {
    headers: { Authorization: 'Bearer ' + c.apiToken, 'X-Seller-Id': c.sellerId, Accept: 'application/json' }
  });
}

/* 지그재그(카카오스타일) Open API: GraphQL + Authorization "CEA ..." 헤더
   서명 = HMAC-SHA1(secretKey, "<밀리초 타임스탬프>.<공백을 한 칸으로 축약한 쿼리>") hex */
function zigzagAuthorization(c, query) {
  var signedDate = Date.now();
  var message = signedDate + '.' + query.replace(/\s+/g, ' ');
  var signature = crypto.createHmac('sha1', c.secretKey).update(message).digest('hex');
  return 'CEA algorithm=HmacSHA256, access-key=' + c.accessKey + ', signed-date=' + signedDate + ', signature=' + signature;
}

async function zigzagRequest(c, query, variables) {
  var host = c.environment === 'dev' ? 'https://openapi.alpha.zigzag.kr' : 'https://openapi.zigzag.kr';
  var normalizedQuery = query.replace(/\s+/g, ' ').trim();
  var result = await requestJson(host + '/1/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: zigzagAuthorization(c, normalizedQuery)
    },
    body: JSON.stringify({ query: normalizedQuery, variables: variables || {} })
  });
  var errors = result.body && result.body.errors;
  if (errors && errors.length) {
    var code = (errors[0].extensions && errors[0].extensions.code) || errors[0].message || 'zigzag_error';
    throw typedError('UPSTREAM_ERROR', '지그재그 API 오류: ' + cleanString(errors[0].message, 200), { code: cleanString(code, 120) });
  }
  return result;
}

/* 무신사 파트너센터 API: 공개 개발자 문서가 없어 파트너 계약 시 받은 API 주소·경로를 그대로 사용 */
async function musinsaRequest(c, path) {
  var base = c.apiBase.replace(/\/+$/, '');
  var target = path.charAt(0) === '/' ? path : '/' + path;
  return requestJson(base + target, {
    headers: { 'api-key': c.apiKey, Authorization: 'Bearer ' + c.apiKey, Accept: 'application/json' }
  });
}

function kstDate(daysAgo) {
  var date = new Date(Date.now() + 9 * 60 * 60 * 1000 - (daysAgo || 0) * 86400000);
  return date.toISOString().slice(0, 10);
}

async function testConnection(channel, credentials) {
  var c = sanitizeCredentials(channel, credentials);
  var result;
  if (channel === 'cafe24') {
    result = await cafe24Request(c, '/api/v2/oauth/token/scopes');
  } else if (channel === 'smartstore') {
    var token = await naverToken(c);
    return { ok: true, channel: channel, message: '인증 토큰 발급 성공', evidence: { tokenIssued: !!token } };
  } else if (channel === 'coupang') {
    result = await coupangRequest(c, 'GET', '/v2/providers/openapi/apis/api/v4/vendors/' + encodeURIComponent(c.vendorId) + '/returnShippingCenters', {});
  } else if (channel === 'sabangnet') {
    result = await sabangnetRequest(c, '/v2/inventory/stocks', { member_id: c.memberId, page: 1 });
  } else if (channel === 'ably') {
    result = await ablyRequest(c, c.testPath);
  } else if (channel === 'zigzag') {
    result = await zigzagRequest(c, 'query { shop { shop_id shop_name } }');
    var shopInfo = result.body && result.body.data && result.body.data.shop;
    return {
      ok: true,
      channel: channel,
      message: '지그재그 스토어 인증에 성공했습니다' + (shopInfo && shopInfo.shop_name ? ': ' + shopInfo.shop_name : '.'),
      evidence: { shopId: shopInfo ? String(shopInfo.shop_id || '') : '' }
    };
  } else if (channel === 'musinsa') {
    result = await musinsaRequest(c, c.testPath);
  }
  return {
    ok: true,
    channel: channel,
    message: CHANNELS[channel].label + ' 연결에 성공했습니다.',
    evidence: { status: result.status, response: summarizeResponse(result.body) },
    rotatedCredentials: result.rotatedCredentials || null
  };
}

async function pullChannel(channel, credentials, options) {
  var c = sanitizeCredentials(channel, credentials);
  var opts = options || {};
  var result;
  if (channel === 'cafe24') {
    var start = encodeURIComponent((opts.startDate || kstDate(1)) + ' 00:00:00');
    result = await cafe24Request(c, '/api/v2/admin/orders?start_date=' + start + '&limit=100&embed=items');
    return { orders: normalizeCafe24Orders(result.body), inventory: [], rawCount: countRows(result.body), rotatedCredentials: result.rotatedCredentials };
  }
  if (channel === 'smartstore') {
    var changedFrom = encodeURIComponent((opts.startDate || kstDate(1)) + 'T00:00:00.000+09:00');
    result = await naverRequest(c, '/external/v1/pay-order/seller/product-orders/last-changed-statuses?lastChangedFrom=' + changedFrom);
    return { orders: normalizeNaverOrders(result.body), inventory: [], rawCount: countRows(result.body) };
  }
  if (channel === 'coupang') {
    result = await coupangRequest(c, 'GET', '/v2/providers/openapi/apis/api/v5/vendors/' + encodeURIComponent(c.vendorId) + '/ordersheets', {
      createdAtFrom: opts.startDate || kstDate(1),
      createdAtTo: opts.endDate || kstDate(0),
      status: opts.status || 'ACCEPT',
      maxPerPage: 50
    });
    return { orders: normalizeCoupangOrders(result.body), inventory: [], rawCount: countRows(result.body) };
  }
  if (channel === 'sabangnet') {
    result = await sabangnetRequest(c, '/v2/inventory/stocks', { member_id: c.memberId, page: opts.page || 1 });
    return { orders: [], inventory: normalizeSabangnetInventory(result.body), rawCount: countRows(result.body) };
  }
  if (channel === 'ably') {
    if (!c.ordersPath) throw typedError('PARTNER_DOC_REQUIRED', '에이블리 주문 API 경로가 필요합니다. 계약 후 받은 파트너 문서의 경로를 입력하세요.');
    result = await ablyRequest(c, c.ordersPath);
    return { orders: normalizeGenericOrders(result.body, 'ably'), inventory: [], rawCount: countRows(result.body) };
  }
  if (channel === 'zigzag') {
    var fromYmd = Number((opts.startDate || kstDate(1)).replace(/-/g, ''));
    var toYmd = Number((opts.endDate || kstDate(0)).replace(/-/g, ''));
    result = await zigzagRequest(c,
      'query OrderItems($from: Int, $to: Int, $limit: Int!, $skip: Int!) {' +
      ' order_item_list(date_ymd_from: $from, date_ymd_to: $to, limit_count: $limit, skip_count: $skip) {' +
      ' total_count item_list { order_item_number status quantity total_amount date_created' +
      ' order { order_number date_paid orderer { name } } } } }',
      { from: fromYmd, to: toYmd, limit: 100, skip: 0 });
    return { orders: normalizeZigzagOrders(result.body), inventory: [], rawCount: countRows(result.body) };
  }
  if (channel === 'musinsa') {
    if (!c.ordersPath) throw typedError('PARTNER_DOC_REQUIRED', '무신사 주문 API 경로가 필요합니다. 파트너센터 계약 후 안내받은 경로를 입력하세요.');
    result = await musinsaRequest(c, c.ordersPath);
    return { orders: normalizeGenericOrders(result.body, 'musinsa'), inventory: [], rawCount: countRows(result.body) };
  }
  throw typedError('UNSUPPORTED_CHANNEL', '지원하지 않는 채널입니다.');
}

function arrayAt(body, paths) {
  for (var i = 0; i < paths.length; i += 1) {
    var value = paths[i].split('.').reduce(function (current, key) { return current && current[key]; }, body);
    if (Array.isArray(value)) return value;
  }
  return [];
}

function normalizeCafe24Orders(body) {
  return arrayAt(body, ['orders']).map(function (o) {
    return { externalId: String(o.order_id || ''), channel: 'cafe24', orderedAt: o.order_date || '', status: o.order_status || '', buyerName: o.billing_name || '', amount: Number(o.actual_payment_amount || o.payment_amount || 0), raw: o };
  });
}

function normalizeNaverOrders(body) {
  return arrayAt(body, ['data.lastChangeStatuses', 'lastChangeStatuses', 'data']).map(function (o) {
    return { externalId: String(o.productOrderId || o.orderId || ''), channel: 'smartstore', orderedAt: o.lastChangedDate || o.orderDate || '', status: o.lastChangedType || o.productOrderStatus || '', buyerName: '', amount: Number(o.totalPaymentAmount || 0), raw: o };
  });
}

function normalizeCoupangOrders(body) {
  return arrayAt(body, ['data', 'data.content', 'content']).map(function (o) {
    return { externalId: String(o.orderId || o.shipmentBoxId || ''), channel: 'coupang', orderedAt: o.orderedAt || o.paidAt || '', status: o.status || '', buyerName: o.orderer && o.orderer.name || '', amount: Number(o.orderPrice || 0), raw: o };
  });
}

function normalizeGenericOrders(body, channel) {
  return arrayAt(body, ['data', 'orders', 'response.data_list']).map(function (o) {
    return { externalId: String(o.orderId || o.order_id || o.id || ''), channel: channel, orderedAt: o.orderedAt || o.created_at || o.order_date || '', status: o.status || o.order_status || '', buyerName: o.buyerName || o.buyer_name || '', amount: Number(o.amount || o.total_price || 0), raw: o };
  });
}

function normalizeZigzagOrders(body) {
  return arrayAt(body, ['data.order_item_list.item_list']).map(function (o) {
    var order = o.order || {};
    var orderedAt = o.date_created || order.date_paid;
    return {
      externalId: String(o.order_item_number || order.order_number || ''),
      channel: 'zigzag',
      orderedAt: orderedAt ? new Date(Number(orderedAt)).toISOString() : '',
      status: o.status || '',
      buyerName: (order.orderer && order.orderer.name) || '',
      amount: Number(o.total_amount || 0),
      raw: o
    };
  });
}

function normalizeSabangnetInventory(body) {
  return arrayAt(body, ['response.data_list', 'data_list']).map(function (row) {
    return { externalId: String(row.shipping_product_id || ''), sku: String(row.shipping_product_id || ''), channel: 'sabangnet', total: Number(row.total_stock || 0), available: Number(row.normal_stock || 0), allocated: Number(row.order_stock || 0), damaged: Number(row.damaged_stock || 0), raw: row };
  });
}

function countRows(body) {
  var list = arrayAt(body, ['orders', 'data', 'data.content', 'content', 'response.data_list', 'data_list', 'data.order_item_list.item_list']);
  return list.length;
}

function summarizeResponse(body) {
  var listCount = countRows(body);
  var code = body && (body.code || body.status || body.message);
  return { code: cleanString(code, 120), rowCount: listCount };
}

module.exports = {
  CHANNELS: CHANNELS,
  sanitizeCredentials: sanitizeCredentials,
  testConnection: testConnection,
  pullChannel: pullChannel,
  redactObject: redactObject
};
