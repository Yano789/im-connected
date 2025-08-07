const crypto = require('crypto');

const algorithm = 'aes-256-gcm';
const key = crypto.scryptSync(process.env.ENCRYPTION_SECRET, 'salt', 32); // 32 bytes key
const ivLength = 12; // For GCM, 12 bytes is recommended

function encrypt(buffer) {
  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combine IV + encrypted data + authTag
  return Buffer.concat([iv, encrypted, authTag]);
}

function decrypt(encryptedBuffer) {
  const iv = encryptedBuffer.slice(0, ivLength);
  const authTag = encryptedBuffer.slice(-16); // Last 16 bytes
  const encryptedData = encryptedBuffer.slice(ivLength, -16);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
}

module.exports = { encrypt, decrypt };
