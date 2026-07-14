/**
 * Omnify 공통 스키마 필드 정의 (문서용 · JSDoc)
 * 런타임 로직은 js/data-schema.js — SCHEMA_VERSION 과 동기화할 것.
 * 추후 필드 추가·변경 가능. breaking 시 VERSION minor/major 올림.
 *
 * @typedef {Object} OmnifyOrderItem
 * @property {string} sku
 * @property {string} channelSku
 * @property {string} name
 * @property {number} qty
 * @property {number} unitPrice
 * @property {number} amount
 *
 * @typedef {Object} OmnifyOrder
 * @property {string} schemaVersion
 * @property {string} id
 * @property {string} tenantId
 * @property {string} channel
 * @property {string} sourceOrderId
 * @property {string} orderedAt
 * @property {'pending'|'processing'|'shipped'|'cancelled'|'returned'} status
 * @property {string} productTitle
 * @property {number} amount  실결제액(원)
 * @property {string} currency
 * @property {number} itemCount
 * @property {OmnifyOrderItem[]} items
 * @property {string} [buyerName]
 * @property {string} [trackingNo]
 * @property {string} [carrier]
 * @property {string} [wmsRef]
 * @property {number|null} [shippingFee]
 * @property {string} syncedAt
 * @property {object|null} [source]
 *
 * @typedef {Object} OmnifyInventoryItem
 * @property {string} schemaVersion
 * @property {string} sku
 * @property {string} tenantId
 * @property {string} name
 * @property {number} total  qtyWms 우선, 없으면 sum(qtyByChannel)
 * @property {Object.<string, number>} qtyByChannel
 * @property {number|null} qtyWms
 * @property {number} safety
 * @property {'critical'|'warning'|'safe'} status
 * @property {string} syncedAt
 * @property {object|null} [source]
 */

module.exports = {
    SCHEMA_VERSION: '0.1.0'
};
