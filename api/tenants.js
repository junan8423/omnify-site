/**
 * Omnify 테넌트 CRUD — Firestore (firebase-admin)
 * GET  ?id=  → 단건 (대시보드 미리보기용, 공개 읽기)
 * GET         → 전체 목록 (Basic Auth)
 * PUT         → upsert { tenant } (Basic Auth)
 * DELETE ?id= → 삭제 (Basic Auth)
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

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
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

  var col = db.collection('tenants');

  try {
    if (req.method === 'GET') {
      var id = (req.query && req.query.id) || '';
      if (id) {
        var snap = await col.doc(String(id)).get();
        if (!snap.exists) {
          return res.status(404).json({ error: 'not found', id: id });
        }
        return res.status(200).json({ tenant: snap.data() });
      }
      if (!checkAdminAuth(req)) return unauthorized(res);
      var all = await col.get();
      var tenants = [];
      all.forEach(function (doc) {
        tenants.push(doc.data());
      });
      tenants.sort(function (a, b) {
        return String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || ''));
      });
      return res.status(200).json({ backend: 'firestore', count: tenants.length, tenants: tenants });
    }

    if (req.method === 'PUT') {
      if (!checkAdminAuth(req)) return unauthorized(res);
      var body = req.body || {};
      var tenant = body.tenant || body;
      if (!tenant || !tenant.id) {
        return res.status(400).json({ error: 'tenant.id required' });
      }
      var clean = stripUndefined(tenant);
      clean.updatedAt = clean.updatedAt || new Date().toISOString();
      await col.doc(String(clean.id)).set(clean, { merge: false });
      return res.status(200).json({ ok: true, id: clean.id });
    }

    if (req.method === 'DELETE') {
      if (!checkAdminAuth(req)) return unauthorized(res);
      var delId = (req.query && req.query.id) || (req.body && req.body.id) || '';
      if (!delId) {
        return res.status(400).json({ error: 'id required' });
      }
      await col.doc(String(delId)).delete();
      return res.status(200).json({ ok: true, id: delId });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/tenants]', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
};
