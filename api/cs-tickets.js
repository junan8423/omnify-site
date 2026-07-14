/**
 * Omnify CS / 기능오류 접수 API
 * POST  — 대시보드에서 공개 접수 (auth 없음)
 * GET   — 목록 (Basic Auth)
 * PATCH — 상태 변경 (Basic Auth)
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

function normalizeTicket(raw) {
    var t = raw || {};
    var allowed = { bug: 1, improve: 1, cs: 1, other: 1 };
    var cat = allowed[t.category] ? t.category : 'other';
    var status = { open: 1, reviewing: 1, done: 1, closed: 1 }[t.status] ? t.status : 'open';
    return {
        id: String(t.id || ''),
        category: cat,
        title: String(t.title || '').slice(0, 120),
        body: String(t.body || '').slice(0, 4000),
        contact: String(t.contact || '').slice(0, 120),
        company: String(t.company || '').slice(0, 80),
        tenantKey: String(t.tenantKey || '').slice(0, 80),
        page: String(t.page || '').slice(0, 120),
        view: String(t.view || '').slice(0, 80),
        userName: String(t.userName || '').slice(0, 80),
        status: status,
        adminNote: String(t.adminNote || '').slice(0, 500),
        createdAt: t.createdAt || new Date().toISOString(),
        updatedAt: t.updatedAt || new Date().toISOString()
    };
}

module.exports = async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
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
            error: e.code === 'NO_FIREBASE_ENV' ? 'Firebase env not configured' : (e.message || 'Firestore init failed'),
            hint: 'localStorage fallback on client'
        });
    }

    var col = db.collection('cs_tickets');

    try {
        if (req.method === 'POST') {
            var body = req.body || {};
            if (body.hp) {
                /* honeypot */
                return res.status(200).json({ ok: true, id: 'ignored' });
            }
            if (!body.title || !body.body) {
                return res.status(400).json({ error: 'title and body required' });
            }
            var id = 'cs_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
            var ticket = normalizeTicket(Object.assign({}, body, {
                id: id,
                status: 'open',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }));
            await col.doc(id).set(ticket);
            return res.status(201).json({ ok: true, ticket: ticket });
        }

        if (req.method === 'GET') {
            if (!checkAdminAuth(req)) return unauthorized(res);
            var all = await col.orderBy('createdAt', 'desc').limit(200).get();
            var tickets = [];
            all.forEach(function (doc) {
                tickets.push(doc.data());
            });
            return res.status(200).json({ backend: 'firestore', count: tickets.length, tickets: tickets });
        }

        if (req.method === 'PATCH') {
            if (!checkAdminAuth(req)) return unauthorized(res);
            var patch = req.body || {};
            var tid = String(patch.id || '');
            if (!tid) return res.status(400).json({ error: 'id required' });
            var ref = col.doc(tid);
            var snap = await ref.get();
            if (!snap.exists) return res.status(404).json({ error: 'not found' });
            var cur = snap.data() || {};
            var next = normalizeTicket(Object.assign({}, cur, {
                status: patch.status != null ? patch.status : cur.status,
                adminNote: patch.adminNote != null ? patch.adminNote : cur.adminNote,
                updatedAt: new Date().toISOString()
            }));
            next.id = tid;
            next.createdAt = cur.createdAt || next.createdAt;
            await ref.set(next, { merge: true });
            return res.status(200).json({ ok: true, ticket: next });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (e) {
        return res.status(500).json({ error: e.message || 'server error' });
    }
};
