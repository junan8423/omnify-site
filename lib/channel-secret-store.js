'use strict';

var crypto = require('crypto');

function encryptionKey() {
  var secret = process.env.CHANNEL_CREDENTIALS_KEY || '';
  if (secret.length < 32) {
    var error = new Error('CHANNEL_CREDENTIALS_KEY must be at least 32 characters');
    error.code = 'NO_ENCRYPTION_KEY';
    throw error;
  }
  return crypto.createHash('sha256').update(secret).digest();
}

function encrypt(credentials) {
  var iv = crypto.randomBytes(12);
  var cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  var encrypted = Buffer.concat([cipher.update(JSON.stringify(credentials), 'utf8'), cipher.final()]);
  return {
    v: 1,
    alg: 'A256GCM',
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    data: encrypted.toString('base64')
  };
}

function decrypt(blob) {
  if (!blob || blob.v !== 1) {
    var error = new Error('Unsupported credential envelope');
    error.code = 'INVALID_CREDENTIAL_ENVELOPE';
    throw error;
  }
  var decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(blob.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(blob.tag, 'base64'));
  return JSON.parse(Buffer.concat([
    decipher.update(Buffer.from(blob.data, 'base64')),
    decipher.final()
  ]).toString('utf8'));
}

module.exports = { encrypt: encrypt, decrypt: decrypt };
