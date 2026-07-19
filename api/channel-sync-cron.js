/**
 * Scheduled channel ingestion. Vercel Cron calls this endpoint with CRON_SECRET.
 */
'use strict';

var admin = require('firebase-admin');
var integrations = require('../lib/channel-integrations');
var secretStore = require('../lib/channel-secret-store');
var syncStore = require('../lib/channel-sync-store');

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

function isAuthorized(req) {
  var expected = process.env.CRON_SECRET || '';
  var header = req.headers.authorization || '';
  return !!expected && header === 'Bearer ' + expected;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });
  if (!isAuthorized(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  var db;
  try {
    db = getDb();
  } catch (error) {
    return res.status(503).json({ ok: false, error: error.message });
  }

  var startedAt = Date.now();
  var maxConnections = Math.max(1, Math.min(Number(process.env.CHANNEL_SYNC_BATCH_SIZE) || 20, 50));
  var snapshot = await db.collection('channel_connections').limit(maxConnections).get();
  var results = [];

  for (var i = 0; i < snapshot.docs.length; i += 1) {
    var doc = snapshot.docs[i];
    var connection = doc.data() || {};
    if (!connection.credentialsEncrypted || connection.syncDisabled) continue;
    var now = new Date().toISOString();
    try {
      var credentials = secretStore.decrypt(connection.credentialsEncrypted);
      var pulled = await integrations.pullChannel(connection.channel, credentials, {});
      var counts = await syncStore.writeNormalized(db, connection.tenantId, connection.channel, pulled);
      var update = {
        status: 'connected',
        lastSyncAt: now,
        lastSuccessAt: now,
        lastError: '',
        lastCounts: counts,
        updatedAt: now
      };
      if (pulled.rotatedCredentials) {
        update.credentialsEncrypted = secretStore.encrypt(Object.assign({}, credentials, pulled.rotatedCredentials));
      }
      await doc.ref.set(update, { merge: true });
      results.push({ tenantId: connection.tenantId, channel: connection.channel, ok: true, counts: counts });
    } catch (error) {
      await doc.ref.set({ status: 'error', lastSyncAt: now, lastError: error.message, updatedAt: now }, { merge: true });
      results.push({ tenantId: connection.tenantId, channel: connection.channel, ok: false, error: error.message });
    }
  }

  return res.status(200).json({
    ok: true,
    processed: results.length,
    failed: results.filter(function (row) { return !row.ok; }).length,
    elapsedMs: Date.now() - startedAt,
    results: results
  });
};
