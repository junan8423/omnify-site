/**
 * Secure channel connection management for tenant dashboards.
 * GET  ?tenantId=...              connection status only
 * POST {action:save|test|sync|delete, tenantId, channel, credentials?}
 */
'use strict';

var crypto = require('crypto');
var admin = require('firebase-admin');
var integrations = require('../lib/channel-integrations');
var secretStore = require('../lib/channel-secret-store');
var syncStore = require('../lib/channel-sync-store');

function getDb() {
  if (!admin.apps.length) {
    var projectId = process.env.FIREBASE_PROJECT_ID;
    var clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    var privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!projectId || !clientEmail || !privateKey) {
      var error = new Error('Firebase env not configured');
      error.code = 'NO_FIREBASE_ENV';
      throw error;
    }
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n')
      })
    });
  }
  return admin.firestore();
}

function safeEqual(left, right) {
  var a = Buffer.from(String(left || ''));
  var b = Buffer.from(String(right || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function checkAdminAuth(req) {
  var user = process.env.ADMIN_USER || '';
  var pass = process.env.ADMIN_PASSWORD || '';
  var header = req.headers.authorization || '';
  if (!user || !pass || !header.startsWith('Basic ')) return false;
  try {
    var decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    var index = decoded.indexOf(':');
    return index > -1 && safeEqual(decoded.slice(0, index), user) && safeEqual(decoded.slice(index + 1), pass);
  } catch (e) {
    return false;
  }
}

async function authorizeTenant(req, db, tenantId) {
  if (checkAdminAuth(req)) return { admin: true };
  var token = String(req.headers['x-omnify-connect-token'] || '').trim();
  if (!token) return null;
  var testToken = process.env.TEST0719_CONNECT_TOKEN || '';
  if (tenantId === 'test0719' && testToken && safeEqual(token, testToken)) return { test: true };
  var snap = await db.collection('tenants').doc(tenantId).get();
  if (!snap.exists) return null;
  var tenant = snap.data() || {};
  return tenant.intakeToken && safeEqual(token, tenant.intakeToken) ? { tenant: true } : null;
}

function connectionId(tenantId, channel) {
  return tenantId + '__' + channel;
}

function validateId(value, label) {
  var clean = String(value || '').trim();
  if (!/^[a-zA-Z0-9_-]{2,80}$/.test(clean)) {
    var error = new Error(label + ' 형식이 올바르지 않습니다.');
    error.code = 'INVALID_ID';
    throw error;
  }
  return clean;
}

function publicConnection(doc) {
  var row = doc.data ? doc.data() : doc;
  return {
    tenantId: row.tenantId,
    channel: row.channel,
    label: (integrations.CHANNELS[row.channel] || {}).label || row.channel,
    status: row.status || 'saved',
    configured: !!row.credentialsEncrypted,
    credentialFields: row.credentialFields || [],
    lastTestAt: row.lastTestAt || '',
    lastSyncAt: row.lastSyncAt || '',
    lastSuccessAt: row.lastSuccessAt || '',
    lastError: row.lastError || '',
    lastCounts: row.lastCounts || { orders: 0, inventory: 0 },
    updatedAt: row.updatedAt || ''
  };
}

async function loadStored(db, tenantId, channel) {
  var ref = db.collection('channel_connections').doc(connectionId(tenantId, channel));
  var snap = await ref.get();
  if (!snap.exists) {
    var error = new Error('저장된 채널 연결 정보가 없습니다.');
    error.code = 'CONNECTION_NOT_FOUND';
    throw error;
  }
  var data = snap.data();
  return { ref: ref, data: data, credentials: secretStore.decrypt(data.credentialsEncrypted) };
}

async function storeRotatedCredentials(stored, rotated) {
  if (!rotated || !stored) return;
  var merged = Object.assign({}, stored.credentials, rotated);
  await stored.ref.set({
    credentialsEncrypted: secretStore.encrypt(merged),
    credentialFields: Object.keys(merged).filter(function (key) { return !!merged[key]; }),
    updatedAt: new Date().toISOString()
  }, { merge: true });
  stored.credentials = merged;
}

function sendError(res, error) {
  var known = {
    INVALID_ID: 400,
    MISSING_CREDENTIALS: 400,
    UNSUPPORTED_CHANNEL: 400,
    CONNECTION_NOT_FOUND: 404,
    PARTNER_DOC_REQUIRED: 409,
    UPSTREAM_ERROR: 502,
    UPSTREAM_TIMEOUT: 504,
    NO_ENCRYPTION_KEY: 503,
    NO_PUBLIC_BASE_URL: 503,
    NO_FIREBASE_ENV: 503
  };
  var status = known[error.code] || 500;
  if (status >= 500) console.error('[api/channel-connections]', error);
  return res.status(status).json({
    ok: false,
    code: error.code || 'SERVER_ERROR',
    error: error.message || 'Server error',
    details: error.details || undefined
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Omnify-Connect-Token');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    var db = getDb();
    var body = req.body || {};
    var tenantId = validateId((req.query && req.query.tenantId) || body.tenantId, 'tenantId');
    var authorized = await authorizeTenant(req, db, tenantId);
    if (!authorized) return res.status(401).json({ ok: false, code: 'UNAUTHORIZED', error: '연동 관리 권한이 없습니다.' });

    if (req.method === 'GET') {
      var snapshot = await db.collection('channel_connections').where('tenantId', '==', tenantId).get();
      var connections = [];
      snapshot.forEach(function (doc) { connections.push(publicConnection(doc)); });
      return res.status(200).json({
        ok: true,
        tenantId: tenantId,
        channels: integrations.CHANNELS,
        connections: connections
      });
    }

    if (req.method !== 'POST' && req.method !== 'DELETE') {
      return res.status(405).json({ ok: false, error: 'Method not allowed' });
    }

    var action = req.method === 'DELETE' ? 'delete' : String(body.action || '');
    var channel = validateId(body.channel, 'channel');
    if (!integrations.CHANNELS[channel]) {
      var unsupported = new Error('지원하지 않는 채널입니다: ' + channel);
      unsupported.code = 'UNSUPPORTED_CHANNEL';
      throw unsupported;
    }
    var ref = db.collection('channel_connections').doc(connectionId(tenantId, channel));
    var now = new Date().toISOString();

    if (action === 'save') {
      var credentials = integrations.sanitizeCredentials(channel, body.credentials);
      await ref.set({
        tenantId: tenantId,
        channel: channel,
        status: 'saved',
        credentialsEncrypted: secretStore.encrypt(credentials),
        credentialFields: Object.keys(credentials).filter(function (key) { return !!credentials[key]; }),
        lastError: '',
        createdAt: now,
        updatedAt: now
      }, { merge: true });
      return res.status(200).json({ ok: true, connection: publicConnection((await ref.get()).data()) });
    }

    if (action === 'delete') {
      await ref.delete();
      return res.status(200).json({ ok: true, tenantId: tenantId, channel: channel });
    }

    if (action === 'oauth-start') {
      if (channel !== 'cafe24') return res.status(400).json({ ok: false, error: 'Cafe24에서만 OAuth를 사용합니다.' });
      var oauthCredentials = integrations.sanitizeCredentials(channel, body.credentials);
      var publicBase = String(process.env.PUBLIC_BASE_URL || '').replace(/\/+$/, '');
      if (!/^https:\/\//.test(publicBase)) {
        var baseError = new Error('PUBLIC_BASE_URL must be an https URL');
        baseError.code = 'NO_PUBLIC_BASE_URL';
        throw baseError;
      }
      await ref.set({
        tenantId: tenantId,
        channel: channel,
        status: 'authorization_required',
        credentialsEncrypted: secretStore.encrypt(oauthCredentials),
        credentialFields: Object.keys(oauthCredentials).filter(function (key) { return !!oauthCredentials[key]; }),
        lastError: '',
        createdAt: now,
        updatedAt: now
      }, { merge: true });
      var state = crypto.randomBytes(32).toString('base64url');
      var stateHash = crypto.createHash('sha256').update(state).digest('hex');
      await db.collection('channel_oauth_states').doc(stateHash).set({
        tenantId: tenantId,
        channel: channel,
        connectionId: connectionId(tenantId, channel),
        createdAt: now,
        expiresAtMs: Date.now() + 10 * 60 * 1000
      });
      var callbackUrl = publicBase + '/api/channel-oauth-callback';
      var authorizeUrl = new URL('https://' + encodeURIComponent(oauthCredentials.mallId) + '.cafe24.com/api/v2/oauth/authorize');
      authorizeUrl.searchParams.set('response_type', 'code');
      authorizeUrl.searchParams.set('client_id', oauthCredentials.clientId);
      authorizeUrl.searchParams.set('state', state);
      authorizeUrl.searchParams.set('redirect_uri', callbackUrl);
      authorizeUrl.searchParams.set('scope', 'mall.read_order,mall.read_product,mall.read_store');
      return res.status(200).json({ ok: true, authorizeUrl: authorizeUrl.toString(), callbackUrl: callbackUrl });
    }

    var stored = null;
    var activeCredentials;
    if (body.credentials) {
      activeCredentials = integrations.sanitizeCredentials(channel, body.credentials);
    } else {
      stored = await loadStored(db, tenantId, channel);
      activeCredentials = stored.credentials;
    }

    if (action === 'test') {
      try {
        var tested = await integrations.testConnection(channel, activeCredentials);
        await storeRotatedCredentials(stored, tested.rotatedCredentials);
        if (stored) await ref.set({ status: 'connected', lastTestAt: now, lastSuccessAt: now, lastError: '', updatedAt: now }, { merge: true });
        return res.status(200).json({ ok: true, result: tested, connection: stored ? publicConnection((await ref.get()).data()) : null });
      } catch (testError) {
        if (stored) await ref.set({ status: 'error', lastTestAt: now, lastError: testError.message, updatedAt: now }, { merge: true });
        throw testError;
      }
    }

    if (action === 'sync') {
      try {
        var pulled = await integrations.pullChannel(channel, activeCredentials, body.options || {});
        await storeRotatedCredentials(stored, pulled.rotatedCredentials);
        var counts = await syncStore.writeNormalized(db, tenantId, channel, pulled);
        await ref.set({
          status: 'connected',
          lastSyncAt: now,
          lastSuccessAt: now,
          lastError: '',
          lastCounts: counts,
          updatedAt: now
        }, { merge: true });
        return res.status(200).json({ ok: true, tenantId: tenantId, channel: channel, counts: counts });
      } catch (syncError) {
        await ref.set({ status: 'error', lastSyncAt: now, lastError: syncError.message, updatedAt: now }, { merge: true });
        throw syncError;
      }
    }

    return res.status(400).json({ ok: false, error: 'action은 save, test, sync, delete 중 하나여야 합니다.' });
  } catch (error) {
    return sendError(res, error);
  }
};
