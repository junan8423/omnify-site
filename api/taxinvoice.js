/**
 * Omnify · Popbill 전자세금계산서 API
 *
 * GET  ?action=status                 → 연동 설정 여부(시크릿 미노출)
 * POST { action:'preview', tenantId?, tenant?, itemType, ... }
 * POST { action:'issue',   tenantId?, tenant?, itemType, forceIssue?, purposeType?, ... }
 * POST { action:'info',    mgtKey }   → 팝빌 상태 조회
 *
 * 환경변수:
 *   POPBILL_LINK_ID, POPBILL_SECRET_KEY, POPBILL_IS_TEST
 *   POPBILL_CORP_NUM, POPBILL_CORP_NAME, POPBILL_CEO_NAME
 *   POPBILL_ADDR, POPBILL_BIZ_TYPE, POPBILL_BIZ_CLASS
 *   POPBILL_CONTACT_NAME, POPBILL_TEL, POPBILL_EMAIL, POPBILL_USER_ID
 *   ADMIN_USER, ADMIN_PASSWORD
 *   FIREBASE_* (발행 이력 저장)
 */
var admin = require('firebase-admin');
var draft = require('../lib/taxinvoice-draft');

var _taxSvc = null;
var _popbillReady = false;
var _popbillError = null;

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

function popbillConfigured() {
  return !!(process.env.POPBILL_LINK_ID && process.env.POPBILL_SECRET_KEY && process.env.POPBILL_CORP_NUM);
}

function getTaxService() {
  if (_taxSvc) return _taxSvc;
  if (!popbillConfigured()) {
    var e = new Error('Popbill env not configured');
    e.code = 'NO_POPBILL_ENV';
    throw e;
  }
  try {
    var popbill = require('popbill');
    if (!_popbillReady) {
      popbill.config({
        LinkID: process.env.POPBILL_LINK_ID,
        SecretKey: process.env.POPBILL_SECRET_KEY,
        IsTest: String(process.env.POPBILL_IS_TEST || 'true').toLowerCase() !== 'false',
        IPRestrictOnOff: true,
        UseStaticIP: false,
        UseLocalTimeYN: true,
        defaultErrorHandler: function (Error) {
          console.error('[popbill]', Error && Error.code, Error && Error.message);
        }
      });
      _popbillReady = true;
    }
    _taxSvc = popbill.TaxinvoiceService();
    return _taxSvc;
  } catch (err) {
    _popbillError = err;
    throw err;
  }
}

function promisify(fn) {
  return new Promise(function (resolve, reject) {
    fn(function (result) { resolve(result); }, function (err) { reject(err); });
  });
}

function registIssue(taxinvoice, opts) {
  opts = opts || {};
  var svc = getTaxService();
  var corpNum = draft.digitsOnly(process.env.POPBILL_CORP_NUM);
  var userId = process.env.POPBILL_USER_ID || '';
  return promisify(function (ok, fail) {
    svc.registIssue(
      corpNum,
      taxinvoice,
      false,
      !!opts.forceIssue,
      opts.memo || 'Omnify admin issue',
      opts.emailSubject || '',
      '',
      userId,
      ok,
      fail
    );
  });
}

function getInfo(mgtKey) {
  var svc = getTaxService();
  var corpNum = draft.digitsOnly(process.env.POPBILL_CORP_NUM);
  var userId = process.env.POPBILL_USER_ID || '';
  return promisify(function (ok, fail) {
    svc.getInfo(corpNum, 'SELL', mgtKey, userId, ok, fail);
  });
}

function stripUndefined(obj) {
  return JSON.parse(JSON.stringify(obj));
}

async function loadTenant(db, tenantId) {
  if (!tenantId) return null;
  var snap = await db.collection('tenants').doc(String(tenantId)).get();
  if (!snap.exists) return null;
  return snap.data();
}

async function appendIssueHistory(db, tenantId, record) {
  if (!tenantId || !db) return;
  var ref = db.collection('tenants').doc(String(tenantId));
  var snap = await ref.get();
  if (!snap.exists) return;
  var data = snap.data() || {};
  var list = Array.isArray(data.taxInvoices) ? data.taxInvoices.slice() : [];
  list.unshift(record);
  if (list.length > 30) list = list.slice(0, 30);
  var checklist = Object.assign({}, data.contractChecklist || {}, { tax_invoice: true });
  await ref.set(stripUndefined({
    taxInvoices: list,
    contractChecklist: checklist,
    updatedAt: new Date().toISOString()
  }), { merge: true });
}

function resolveBodyTenant(body, loaded) {
  if (body && body.tenant && typeof body.tenant === 'object') {
    return Object.assign({}, loaded || {}, body.tenant);
  }
  return loaded;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!checkAdminAuth(req)) return unauthorized(res);

  var body = req.body || {};
  var action = String((req.query && req.query.action) || body.action || '').trim();

  if (req.method === 'GET' && (!action || action === 'status')) {
    var supplier = draft.supplierFromEnv();
    return res.status(200).json({
      ok: true,
      configured: popbillConfigured(),
      isTest: String(process.env.POPBILL_IS_TEST || 'true').toLowerCase() !== 'false',
      hasSdk: (function () {
        try { require.resolve('popbill'); return true; } catch (e) { return false; }
      })(),
      supplier: {
        corpNum: supplier.corpNum ? supplier.corpNum.slice(0, 3) + '****' + supplier.corpNum.slice(-2) : '',
        corpName: supplier.corpName || '',
        ceoName: supplier.ceoName ? '설정됨' : '',
        email: supplier.email || ''
      },
      popbillError: _popbillError ? String(_popbillError.message || _popbillError) : null
    });
  }

  var db = null;
  try {
    db = getDb();
  } catch (e) {
    /* preview can work without firestore if tenant payload sent */
    if (action === 'issue') {
      return res.status(503).json({
        error: e.code === 'NO_FIREBASE_ENV' ? 'Firebase env not configured' : (e.message || 'Firestore init failed')
      });
    }
  }

  try {
    if (req.method === 'POST' && action === 'preview') {
      var tenantId = body.tenantId || '';
      var loaded = db && tenantId ? await loadTenant(db, tenantId) : null;
      var tenant = resolveBodyTenant(body, loaded);
      if (!tenant || !tenant.companyName) {
        return res.status(400).json({ error: 'tenant_required', message: '테넌트 정보가 필요합니다.' });
      }
      var itemType = body.itemType || 'setup';
      var built = draft.buildTaxinvoice(tenant, itemType, {
        purposeType: body.purposeType,
        customSupplyWon: body.customSupplyWon,
        customItemName: body.customItemName,
        writeDate: body.writeDate,
        remark: body.remark,
        invoicee: body.invoicee,
        mgtKey: body.mgtKey
      });
      return res.status(200).json({
        ok: true,
        configured: popbillConfigured(),
        isTest: String(process.env.POPBILL_IS_TEST || 'true').toLowerCase() !== 'false',
        meta: built.meta,
        taxinvoice: built.taxinvoice
      });
    }

    if (req.method === 'POST' && action === 'issue') {
      if (!popbillConfigured()) {
        return res.status(503).json({
          error: 'NO_POPBILL_ENV',
          message: '팝빌 환경변수가 없습니다. POPBILL_LINK_ID / SECRET_KEY / CORP_NUM 등을 Vercel에 설정하세요.'
        });
      }
      var tenantId2 = body.tenantId || '';
      var loaded2 = db && tenantId2 ? await loadTenant(db, tenantId2) : null;
      var tenant2 = resolveBodyTenant(body, loaded2);
      if (!tenant2 || !(tenant2.id || tenantId2)) {
        return res.status(400).json({ error: 'tenant_required', message: '발행하려면 저장된 테넌트가 필요합니다.' });
      }
      if (!tenant2.id) tenant2.id = tenantId2;

      var itemType2 = body.itemType || 'setup';
      var built2 = draft.buildTaxinvoice(tenant2, itemType2, {
        purposeType: body.purposeType,
        customSupplyWon: body.customSupplyWon,
        customItemName: body.customItemName,
        writeDate: body.writeDate,
        remark: body.remark,
        invoicee: body.invoicee,
        mgtKey: body.mgtKey
      });

      if (!built2.meta.ready) {
        return res.status(400).json({
          error: 'incomplete',
          message: '필수 항목이 부족합니다: ' + built2.meta.missing.join(', '),
          meta: built2.meta
        });
      }

      var result;
      try {
        result = await registIssue(built2.taxinvoice, {
          forceIssue: !!body.forceIssue,
          memo: body.memo || ('Omnify ' + itemType2 + ' · ' + tenant2.id)
        });
      } catch (err) {
        var failRec = {
          mgtKey: built2.meta.mgtKey,
          itemType: itemType2,
          itemName: built2.meta.itemName,
          status: 'error',
          code: err && err.code,
          message: (err && err.message) || '발행 실패',
          supplyCostTotal: built2.meta.supplyCostTotal,
          taxTotal: built2.meta.taxTotal,
          totalAmount: built2.meta.totalAmount,
          purposeType: built2.meta.purposeType,
          issuedAt: new Date().toISOString()
        };
        if (db) await appendIssueHistory(db, tenant2.id, failRec).catch(function () {});
        return res.status(502).json({
          error: 'popbill_issue_failed',
          code: err && err.code,
          message: (err && err.message) || '팝빌 발행 실패',
          meta: built2.meta,
          record: failRec
        });
      }

      var okRec = {
        mgtKey: built2.meta.mgtKey,
        itemType: itemType2,
        itemName: built2.meta.itemName,
        status: 'issued',
        code: result && result.code,
        message: (result && result.message) || 'ok',
        ntsConfirmNum: (result && result.ntsConfirmNum) || '',
        supplyCostTotal: built2.meta.supplyCostTotal,
        taxTotal: built2.meta.taxTotal,
        totalAmount: built2.meta.totalAmount,
        purposeType: built2.meta.purposeType,
        isTest: String(process.env.POPBILL_IS_TEST || 'true').toLowerCase() !== 'false',
        issuedAt: new Date().toISOString()
      };
      if (db) await appendIssueHistory(db, tenant2.id, okRec);

      return res.status(200).json({
        ok: true,
        result: result,
        meta: built2.meta,
        record: okRec
      });
    }

    if ((req.method === 'POST' || req.method === 'GET') && action === 'info') {
      var mgtKey = (body.mgtKey || (req.query && req.query.mgtKey) || '').trim();
      if (!mgtKey) return res.status(400).json({ error: 'mgtKey required' });
      if (!popbillConfigured()) {
        return res.status(503).json({ error: 'NO_POPBILL_ENV' });
      }
      try {
        var info = await getInfo(mgtKey);
        return res.status(200).json({ ok: true, info: info });
      } catch (err) {
        return res.status(502).json({
          error: 'popbill_info_failed',
          code: err && err.code,
          message: (err && err.message) || '조회 실패'
        });
      }
    }

    return res.status(400).json({ error: 'unknown_action', action: action || null });
  } catch (e) {
    console.error('[taxinvoice]', e);
    return res.status(500).json({ error: e.message || 'server_error', code: e.code || null });
  }
};
