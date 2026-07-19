/**
 * Cafe24 OAuth callback. The one-time state binds the authorization to a tenant connection.
 */
'use strict';

var crypto = require('crypto');
var admin = require('firebase-admin');
var secretStore = require('../lib/channel-secret-store');

function getDb() {
  if (!admin.apps.length) {
    var projectId = process.env.FIREBASE_PROJECT_ID;
    var clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    var privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!projectId || !clientEmail || !privateKey) throw new Error('Firebase env not configured');
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

function redirect(res, tenantId, status, message) {
  var query = new URLSearchParams({ tenant: tenantId || 'test0719', oauth: status, message: message || '' });
  return res.redirect(302, '/channel-connect.html?' + query.toString());
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).send('Method not allowed');
  var state = String((req.query && req.query.state) || '');
  var code = String((req.query && req.query.code) || '');
  var oauthError = String((req.query && (req.query.error_description || req.query.error)) || '');
  if (!state) return redirect(res, '', 'error', 'OAuth state가 없습니다.');

  var db;
  try {
    db = getDb();
    var stateHash = crypto.createHash('sha256').update(state).digest('hex');
    var stateRef = db.collection('channel_oauth_states').doc(stateHash);
    var stateSnap = await stateRef.get();
    if (!stateSnap.exists) return redirect(res, '', 'error', '만료되었거나 이미 사용한 OAuth 요청입니다.');
    var oauthState = stateSnap.data() || {};
    if (Number(oauthState.expiresAtMs || 0) < Date.now()) {
      await stateRef.delete();
      return redirect(res, oauthState.tenantId, 'error', 'OAuth 요청이 만료되었습니다. 다시 시작해 주세요.');
    }
    if (oauthError || !code) {
      await stateRef.delete();
      return redirect(res, oauthState.tenantId, 'error', oauthError || 'Cafe24 승인이 취소되었습니다.');
    }

    var connectionRef = db.collection('channel_connections').doc(oauthState.connectionId);
    var connectionSnap = await connectionRef.get();
    if (!connectionSnap.exists) return redirect(res, oauthState.tenantId, 'error', '연결 정보를 찾을 수 없습니다.');
    var credentials = secretStore.decrypt(connectionSnap.data().credentialsEncrypted);
    var publicBase = String(process.env.PUBLIC_BASE_URL || '').replace(/\/+$/, '');
    var callbackUrl = publicBase + '/api/channel-oauth-callback';
    var tokenResponse = await fetch('https://' + encodeURIComponent(credentials.mallId) + '.cafe24api.com/api/v2/oauth/token', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(credentials.clientId + ':' + credentials.clientSecret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: callbackUrl
      }).toString()
    });
    var tokenBody = await tokenResponse.json().catch(function () { return {}; });
    if (!tokenResponse.ok || !tokenBody.access_token) {
      throw new Error(tokenBody.error_description || tokenBody.error || ('Cafe24 token HTTP ' + tokenResponse.status));
    }
    credentials.accessToken = tokenBody.access_token;
    credentials.refreshToken = tokenBody.refresh_token || '';
    var now = new Date().toISOString();
    await connectionRef.set({
      status: 'connected',
      credentialsEncrypted: secretStore.encrypt(credentials),
      credentialFields: Object.keys(credentials).filter(function (key) { return !!credentials[key]; }),
      lastSuccessAt: now,
      lastError: '',
      updatedAt: now
    }, { merge: true });
    await stateRef.delete();
    return redirect(res, oauthState.tenantId, 'success', 'Cafe24 OAuth 승인이 완료되었습니다.');
  } catch (error) {
    console.error('[api/channel-oauth-callback]', error);
    try { if (stateRef) await stateRef.delete(); } catch (cleanupError) { /* ignore */ }
    return redirect(res, '', 'error', error.message || 'OAuth 처리 실패');
  }
};
