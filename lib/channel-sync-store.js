'use strict';

var crypto = require('crypto');

function cleanNormalized(row) {
  var copy = Object.assign({}, row);
  delete copy.raw;
  return copy;
}

async function writeNormalized(db, tenantId, channel, data) {
  var rows = [];
  (data.orders || []).forEach(function (row) { rows.push({ kind: 'order', row: cleanNormalized(row) }); });
  (data.inventory || []).forEach(function (row) { rows.push({ kind: 'inventory', row: cleanNormalized(row) }); });
  var now = new Date().toISOString();
  for (var offset = 0; offset < rows.length; offset += 400) {
    var batch = db.batch();
    rows.slice(offset, offset + 400).forEach(function (item) {
      var externalId = String(item.row.externalId || '');
      if (!externalId) return;
      var id = crypto.createHash('sha256').update(tenantId + '|' + channel + '|' + externalId).digest('hex');
      var collection = item.kind === 'order' ? 'normalized_orders' : 'normalized_inventory';
      batch.set(db.collection(collection).doc(id), Object.assign({}, item.row, {
        tenantId: tenantId,
        sourceChannel: channel,
        syncedAt: now
      }), { merge: true });
    });
    await batch.commit();
  }
  return { orders: (data.orders || []).length, inventory: (data.inventory || []).length };
}

module.exports = { writeNormalized: writeNormalized };
