/**
 * Omnify 고객 온보딩 수집 (공개 제출 · 어드민 조회)
 * GET  ?token=xxx          → 공개: 메타 + 기존 제출본
 * GET  (Basic Auth)        → 어드민: 전체 목록
 * POST { token, intake }   → 공개: 고객 제출 저장
 */
var admin = require('firebase-admin');

function getDb() {
  if (!admin.apps.length) {
    var projectId = process.env.FIREBASE_PROJECT_ID;
    var clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    var privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!projectId || !clientEmail || !privateKey) {
      var err = new Error('Firebase env not configured');
      err.code = 'NO_FIREBASE_ENV';
      throw err;
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

function checkAdminAuth(req) {
  var user = process.env.ADMIN_USER || '';
  var pass = process.env.ADMIN_PASSWORD || '';
  if (!user || !pass) return false;
  var header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) return false;
  try {
    var decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    var idx = decoded.indexOf(':');
    if (idx < 0) return false;
    return decoded.slice(0, idx) === user && decoded.slice(idx + 1) === pass;
  } catch (e) {
    return false;
  }
}

function unauthorized(res) {
  res.setHeader('WWW-Authenticate', 'Basic realm="Omnify Internal Admin", charset="UTF-8"');
  return res.status(401).json({ error: 'Unauthorized' });
}

function stripUndefined(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function findTenantByToken(db, token) {
  return db.collection('tenants').where('intakeToken', '==', token).limit(1).get()
    .then(function (snap) {
      if (snap.empty) return null;
      var doc = snap.docs[0];
      return { id: doc.id, data: doc.data() };
    });
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  var db;
  try {
    db = getDb();
  } catch (e) {
    return res.status(503).json({
      error: e.code === 'NO_FIREBASE_ENV' ? 'Firebase env not configured' : (e.message || 'Firestore init failed')
    });
  }

  var intakes = db.collection('intakes');

  try {
    if (req.method === 'GET') {
      var token = String((req.query && req.query.token) || '').trim();
      if (token) {
        var found = await findTenantByToken(db, token);
        if (!found) {
          return res.status(404).json({ error: 'invalid_token', message: '유효하지 않거나 만료된 수집 링크입니다.' });
        }
        var intakeSnap = await intakes.doc(token).get();
        var intake = intakeSnap.exists ? intakeSnap.data() : null;
        var t = found.data || {};
        return res.status(200).json({
          ok: true,
          meta: {
            token: token,
            tenantId: found.id,
            companyName: t.companyName || '',
            keyId: t.keyId || t.projectFolder || '',
            serviceTier: t.serviceTier || '',
            billingPlan: t.billingPlan || '',
            channelsHint: t.channels || []
          },
          intake: intake
        });
      }

      if (!checkAdminAuth(req)) return unauthorized(res);
      var all = await intakes.orderBy('submittedAt', 'desc').limit(100).get().catch(function () {
        return intakes.limit(100).get();
      });
      var list = [];
      all.forEach(function (doc) {
        list.push(Object.assign({ token: doc.id }, doc.data()));
      });
      list.sort(function (a, b) {
        return String(b.submittedAt || '').localeCompare(String(a.submittedAt || ''));
      });
      return res.status(200).json({ backend: 'firestore', count: list.length, intakes: list });
    }

    if (req.method === 'POST') {
      var body = req.body || {};
      var postToken = String(body.token || '').trim();
      var payload = body.intake || body.data || null;
      if (!postToken || !payload || typeof payload !== 'object') {
        return res.status(400).json({ error: 'token and intake required' });
      }
      var tenantHit = await findTenantByToken(db, postToken);
      if (!tenantHit) {
        return res.status(404).json({ error: 'invalid_token' });
      }
      var now = new Date().toISOString();
      var record = stripUndefined({
        token: postToken,
        tenantId: tenantHit.id,
        companyName: tenantHit.data.companyName || payload.companyName || '',
        keyId: tenantHit.data.keyId || tenantHit.data.projectFolder || '',
        intake: payload,
        submittedAt: now,
        updatedAt: now,
        status: 'submitted'
      });
      await intakes.doc(postToken).set(record, { merge: true });
      await db.collection('tenants').doc(tenantHit.id).set({
        customerIntake: {
          status: 'submitted',
          submittedAt: now,
          token: postToken
        },
        updatedAt: now
      }, { merge: true });
      return res.status(200).json({ ok: true, submittedAt: now, tenantId: tenantHit.id });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('[intake]', e);
    return res.status(500).json({ error: e.message || 'server error' });
  }
};
