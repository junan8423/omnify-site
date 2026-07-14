/**
 * Omnify 세금계산서 초안 빌더 (Popbill Taxinvoice 객체)
 * 요금(만원) 입력값은 공급가액(부가세 별도)로 취급.
 */

function digitsOnly(s) {
  return String(s || '').replace(/\D/g, '');
}

function yyyymmdd(d) {
  d = d || new Date();
  var y = d.getFullYear();
  var m = d.getMonth() + 1;
  var day = d.getDate();
  return String(y) + (m < 10 ? '0' : '') + m + (day < 10 ? '0' : '') + day;
}

function manToWon(man) {
  var n = Number(man);
  if (!isFinite(n) || n < 0) return 0;
  return Math.round(n * 10000);
}

function vatOf(supply) {
  return Math.round(Number(supply || 0) * 0.1);
}

function calcPrepaidPayMan(commercial) {
  commercial = commercial || {};
  var months = commercial.prepaidTerm === '12' ? 12 : commercial.prepaidTerm === '6' ? 6 : 0;
  if (!months) return 0;
  var monthly = Number(commercial.monthlyFeeMan) || 0;
  var pct = Number(commercial.discountPct) || 0;
  var listTotal = monthly * months;
  return Math.round(listTotal * (100 - pct)) / 100;
}

function supplierFromEnv(env) {
  env = env || process.env;
  return {
    corpNum: digitsOnly(env.POPBILL_CORP_NUM || ''),
    corpName: env.POPBILL_CORP_NAME || 'Omnify',
    ceoName: env.POPBILL_CEO_NAME || '',
    addr: env.POPBILL_ADDR || '',
    bizType: env.POPBILL_BIZ_TYPE || '',
    bizClass: env.POPBILL_BIZ_CLASS || '',
    contactName: env.POPBILL_CONTACT_NAME || 'JK',
    tel: env.POPBILL_TEL || '',
    email: env.POPBILL_EMAIL || '',
    taxRegId: env.POPBILL_TAX_REG_ID || ''
  };
}

function invoiceeFromTenant(tenant) {
  tenant = tenant || {};
  var tp = tenant.taxProfile || {};
  return {
    type: tp.invoiceeType || '사업자',
    corpNum: digitsOnly(tp.businessNo || tenant.businessNo || ''),
    corpName: tp.corpName || tenant.companyName || '',
    ceoName: tp.ceoName || '',
    addr: tp.addr || '',
    bizType: tp.bizType || '',
    bizClass: tp.bizClass || '',
    contactName: tp.contactName || tenant.contactName || '',
    tel: tp.tel || tenant.contactPhone || '',
    email: tp.email || tenant.contactEmail || '',
    taxRegId: tp.taxRegId || ''
  };
}

/**
 * @param {'setup'|'monthly'|'prepaid'|'custom'} itemType
 * @param {object} opts { customSupplyWon?, customItemName?, writeDate?, purposeType?, remark? }
 */
function resolveLineItem(tenant, itemType, opts) {
  opts = opts || {};
  var commercial = (tenant && tenant.commercial) || {};
  var writeDate = opts.writeDate || yyyymmdd();
  var supply = 0;
  var itemName = '';
  var spec = '';

  if (itemType === 'setup') {
    supply = manToWon(commercial.setupFeeMan);
    itemName = 'Omnify 초기 구축비';
    spec = tenant.serviceTier || tenant.billingPlan || '';
  } else if (itemType === 'monthly') {
    supply = manToWon(commercial.monthlyFeeMan);
    itemName = 'Omnify 월 이용료';
    spec = (tenant.billingPlan || '') + (writeDate ? (' ' + writeDate.slice(0, 6)) : '');
  } else if (itemType === 'prepaid') {
    supply = manToWon(calcPrepaidPayMan(commercial));
    var months = commercial.prepaidTerm === '12' ? 12 : commercial.prepaidTerm === '6' ? 6 : 0;
    itemName = 'Omnify 일시납 (' + months + '개월)';
    spec = '할인 ' + (Number(commercial.discountPct) || 0) + '%';
  } else if (itemType === 'custom') {
    supply = Math.round(Number(opts.customSupplyWon) || 0);
    itemName = opts.customItemName || 'Omnify 서비스';
    spec = opts.customSpec || '';
  } else {
    var err = new Error('지원하지 않는 품목 유형: ' + itemType);
    err.code = 'BAD_ITEM';
    throw err;
  }

  var tax = vatOf(supply);
  return {
    itemType: itemType,
    itemName: itemName,
    spec: spec,
    writeDate: writeDate,
    qty: '1',
    unitCost: String(supply),
    supplyCost: String(supply),
    tax: String(tax),
    supplyCostTotal: String(supply),
    taxTotal: String(tax),
    totalAmount: String(supply + tax)
  };
}

function makeMgtKey(tenantId, itemType) {
  var tid = String(tenantId || 't').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 8);
  var short = String(itemType || 'x').slice(0, 4);
  var d = yyyymmdd();
  var r = Math.random().toString(36).slice(2, 5);
  var key = tid + '-' + short + '-' + d.slice(2) + r;
  return key.slice(0, 24);
}

function validateDraftParts(supplier, invoicee, line) {
  var missing = [];
  if (!supplier.corpNum || supplier.corpNum.length !== 10) missing.push('공급자 사업자번호(POPBILL_CORP_NUM)');
  if (!supplier.corpName) missing.push('공급자 상호');
  if (!supplier.ceoName) missing.push('공급자 대표자(POPBILL_CEO_NAME)');
  if (!invoicee.corpName) missing.push('공급받는자 상호');
  if (!invoicee.ceoName) missing.push('공급받는자 대표자');
  if (!invoicee.corpNum || invoicee.corpNum.length !== 10) missing.push('공급받는자 사업자번호');
  if (!invoicee.email) missing.push('공급받는자 이메일(세금계산서 수신)');
  if (!line || Number(line.supplyCostTotal) <= 0) missing.push('공급가액(품목 금액)');
  return missing;
}

/**
 * Popbill Taxinvoice 객체 + 메타 생성
 */
function buildTaxinvoice(tenant, itemType, opts) {
  opts = opts || {};
  var env = opts.env || process.env;
  var supplier = Object.assign({}, supplierFromEnv(env), opts.supplier || {});
  var invoicee = Object.assign({}, invoiceeFromTenant(tenant), opts.invoicee || {});
  var line = resolveLineItem(tenant, itemType, opts);
  var mgtKey = opts.mgtKey || makeMgtKey(tenant && tenant.id, itemType);
  var purposeType = opts.purposeType === '청구' ? '청구' : '영수';
  var missing = validateDraftParts(supplier, invoicee, line);

  var taxinvoice = {
    writeDate: line.writeDate,
    chargeDirection: '정과금',
    issueType: '정발행',
    purposeType: purposeType,
    taxType: '과세',

    invoicerCorpNum: supplier.corpNum,
    invoicerMgtKey: mgtKey,
    invoicerTaxRegID: supplier.taxRegId || '',
    invoicerCorpName: supplier.corpName,
    invoicerCEOName: supplier.ceoName,
    invoicerAddr: supplier.addr || '',
    invoicerBizType: supplier.bizType || '',
    invoicerBizClass: supplier.bizClass || '',
    invoicerContactName: supplier.contactName || '',
    invoicerTEL: supplier.tel || '',
    invoicerEmail: supplier.email || '',
    invoicerSMSSendYN: false,

    invoiceeType: invoicee.type || '사업자',
    invoiceeCorpNum: invoicee.corpNum,
    invoiceeMgtKey: '',
    invoiceeTaxRegID: invoicee.taxRegId || '',
    invoiceeCorpName: invoicee.corpName,
    invoiceeCEOName: invoicee.ceoName,
    invoiceeAddr: invoicee.addr || '',
    invoiceeBizType: invoicee.bizType || '',
    invoiceeBizClass: invoicee.bizClass || '',
    invoiceeContactName1: invoicee.contactName || '',
    invoiceeTEL1: invoicee.tel || '',
    invoiceeEmail1: invoicee.email || '',
    invoiceeSMSSendYN: false,

    supplyCostTotal: line.supplyCostTotal,
    taxTotal: line.taxTotal,
    totalAmount: line.totalAmount,
    remark1: opts.remark || ('Omnify · ' + (tenant && (tenant.keyId || tenant.id) || '')),
    remark2: '',
    remark3: '',
    businessLicenseYN: false,
    bankBookYN: false,

    detailList: [
      {
        serialNum: 1,
        purchaseDT: line.writeDate,
        itemName: line.itemName,
        spec: line.spec || '',
        qty: line.qty,
        unitCost: line.unitCost,
        supplyCost: line.supplyCost,
        tax: line.tax,
        remark: ''
      }
    ]
  };

  return {
    taxinvoice: taxinvoice,
    meta: {
      mgtKey: mgtKey,
      itemType: itemType,
      itemName: line.itemName,
      purposeType: purposeType,
      supplyCostTotal: Number(line.supplyCostTotal),
      taxTotal: Number(line.taxTotal),
      totalAmount: Number(line.totalAmount),
      missing: missing,
      ready: missing.length === 0,
      supplier: {
        corpNum: supplier.corpNum,
        corpName: supplier.corpName,
        ceoName: supplier.ceoName
      },
      invoicee: {
        corpNum: invoicee.corpNum,
        corpName: invoicee.corpName,
        ceoName: invoicee.ceoName,
        email: invoicee.email
      }
    }
  };
}

module.exports = {
  digitsOnly: digitsOnly,
  yyyymmdd: yyyymmdd,
  manToWon: manToWon,
  vatOf: vatOf,
  supplierFromEnv: supplierFromEnv,
  invoiceeFromTenant: invoiceeFromTenant,
  resolveLineItem: resolveLineItem,
  makeMgtKey: makeMgtKey,
  buildTaxinvoice: buildTaxinvoice,
  validateDraftParts: validateDraftParts
};
