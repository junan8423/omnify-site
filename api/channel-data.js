/**
 * Authenticated normalized data feed for a tenant dashboard.
 */
'use strict';

var crypto = require('crypto');
var admin = require('firebase-admin');

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

function safeEqual(left, right) {
  var a = Buffer.from(String(left || ''));
  var b = Buffer.from(String(right || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function authorized(req, db, tenantId) {
  var token = String(req.headers['x-omnify-connect-token'] || '').trim();
  if (!token) return false;
  if (tenantId === 'test0719' && process.env.TEST0719_CONNECT_TOKEN && safeEqual(token, process.env.TEST0719_CONNECT_TOKEN)) return true;
  var snap = await db.collection('tenants').doc(tenantId).get();
  return snap.exists && !!snap.data().intakeToken && safeEqual(token, snap.data().intakeToken);
}

function maskName(value) {
  var text = String(value || '');
  return text ? text.charAt(0) + '**' : '';
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'X-Omnify-Connect-Token');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  try {
    var tenantId = String((req.query && req.query.tenantId) || '').trim();
    if (!/^[a-zA-Z0-9_-]{2,80}$/.test(tenantId)) return res.status(400).json({ ok: false, error: 'invalid tenantId' });
    var db = getDb();
    if (!await authorized(req, db, tenantId)) return res.status(401).json({ ok: false, error: 'Unauthorized' });

    var orderSnap = await db.collection('normalized_orders').where('tenantId', '==', tenantId).limit(500).get();
    var inventorySnap = await db.collection('normalized_inventory').where('tenantId', '==', tenantId).limit(500).get();
    var orders = [];
    var inventory = [];
    orderSnap.forEach(function (doc) {
      var row = doc.data();
      orders.push({
        externalId: row.externalId || '',
        channel: row.channel || row.sourceChannel || '',
        orderedAt: row.orderedAt || '',
        status: row.status || '',
        buyerName: maskName(row.buyerName),
        amount: Number(row.amount || 0),
        syncedAt: row.syncedAt || ''
      });
    });
    inventorySnap.forEach(function (doc) {
      var row = doc.data();
      inventory.push({
        externalId: row.externalId || '',
        sku: row.sku || row.externalId || '',
        channel: row.channel || row.sourceChannel || '',
        total: Number(row.total || 0),
        available: Number(row.available || 0),
        allocated: Number(row.allocated || 0),
        damaged: Number(row.damaged || 0),
        syncedAt: row.syncedAt || ''
      });
    });
    orders.sort(function (a, b) { return String(b.orderedAt).localeCompare(String(a.orderedAt)); });
    inventory.sort(function (a, b) { return String(a.sku).localeCompare(String(b.sku)); });
    return res.status(200).json({ ok: true, tenantId: tenantId, orders: orders, inventory: inventory });
  } catch (error) {
    console.error('[api/channel-data]', error);
    return res.status(500).json({ ok: false, error: error.message || 'Server error' });
  }
};
