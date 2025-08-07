const crypto = require('crypto');

const algorithm = 'aes-256-gcm';
// Use a default encryption secret if not provided in environment
const encryptionSecret = process.env.ENCRYPTION_SECRET || 'railway-deployment-default-secret-change-in-production-for-security-123456789abcdef';

// Validate that we have a proper encryption secret
if (!encryptionSecret || encryptionSecret.length < 16) {
  console.warn('ENCRYPTION_SECRET environment variable should be set in production');
  console.warn('Using default encryption secret - this should be changed for production');
}

// Ensure the secret is a string before passing to scryptSync
const secretString = String(encryptionSecret);
const key = crypto.scryptSync(secretString, 'salt', 32); // 32 bytes key
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
