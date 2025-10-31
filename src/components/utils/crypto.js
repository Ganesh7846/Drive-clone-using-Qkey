// src/utils/crypto.js
// QKey (simulated) + wrap-with-password (PBKDF2-SHA256) + AES-GCM

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// helpers
function b64(bytes) {
  return btoa(String.fromCharCode(...new Uint8Array(bytes)));
}
function b64ToBytes(b64str) {
  const bin = atob(b64str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// PBKDF2 deriveKey (returns CryptoKey for AES-GCM wrapping)
async function deriveKeyFromPassphrase(passphrase, saltBytes, iterations = 250000) {
  const passKey = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: saltBytes,
      iterations,
    },
    passKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Generate a simulated QKey (raw bytes + imported CryptoKey)
async function generateQuantumKey() {
  const qKeyBytes = crypto.getRandomValues(new Uint8Array(32)); // raw 256-bit
  // import for file encryption; not extractable (safer), but we still have raw bytes to wrap
  const qCryptoKey = await crypto.subtle.importKey(
    "raw",
    qKeyBytes,
    { name: "AES-GCM" },
    false, // keep non-extractable for use (we keep raw bytes separately for wrapping)
    ["encrypt", "decrypt"]
  );
  return { qKeyBytes, qCryptoKey };
}

/**
 * Encrypt file with QKey + wrap QKey with password
 * Returns: { encryptedBlob, meta }
 * meta contains: iv_b64 (file), wrapped_key_b64, key_wrap_iv_b64, salt_b64, iters, kdf
 */
export async function encryptFile(file, passphrase) {
  // 1) generate QKey for file encryption
  const { qKeyBytes, qCryptoKey } = await generateQuantumKey();

  // 2) encrypt file with QKey
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plainBuf = await file.arrayBuffer();
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    qCryptoKey,
    plainBuf
  );
  const encryptedBlob = new Blob([cipherBuf], { type: "application/octet-stream" });

  // 3) derive wrapping key from passphrase
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const wrapKey = await deriveKeyFromPassphrase(passphrase, salt, 250000);

  // 4) wrap (encrypt) the raw qKeyBytes using derived wrapKey (use its own IV)
  const keyWrapIv = crypto.getRandomValues(new Uint8Array(12));
  const wrappedKeyBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: keyWrapIv },
    wrapKey,
    qKeyBytes.buffer // encrypt raw bytes
  );

  // 5) meta (store only wrapped key, salt, iterations, IVs — NOT raw key)
  const meta = {
    alg: "AES-GCM",
    kdf: "PBKDF2-SHA256",
    iters: 250000,
    iv_b64: b64(iv),                // file IV
    wrapped_key_b64: b64(wrappedKeyBuf),
    key_wrap_iv_b64: b64(keyWrapIv),// IV used to wrap the QKey
    salt_b64: b64(salt),
    originalName: file.name,
    originalType: file.type || "application/octet-stream",
    originalSize: file.size,
    key_source: "QKey (simulated) + password-wrapped",
  };

  return { encryptedBlob, meta };
}

/**
 * Decrypt given cipher bytes using metadata and passphrase
 * Usage: plainBytes = await decryptBytes(cipherBytes, meta, passphrase)
 */
export async function decryptBytes(cipherBytes, meta, passphrase) {
  
  if (!meta.kdf || !meta.kdf.startsWith("PBKDF2")) {
    throw new Error("Unsupported KDF in metadata");
  }
  
  // 1) derive wrap key from passphrase using stored salt/iters
  const salt = b64ToBytes(meta.salt_b64);
  const wrapKey = await deriveKeyFromPassphrase(passphrase, salt, meta.iters || 250000);

  // 2) decrypt wrapped QKey
  const wrappedKeyBytes = b64ToBytes(meta.wrapped_key_b64);
  const keyWrapIv = b64ToBytes(meta.key_wrap_iv_b64);
  let rawQKeyBuf;
  try {
    rawQKeyBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: keyWrapIv },
      wrapKey,
      wrappedKeyBytes
    );
  } catch (e) {
    throw new Error("Invalid password or wrapped key tampered");
  }

  // 3) import raw QKey bytes as AES-GCM key for file decryption
  const rawQKey = new Uint8Array(rawQKeyBuf);
  const qCryptoKey = await crypto.subtle.importKey(
    "raw",
    rawQKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );

  // 4) decrypt the file ciphertext
  const iv = b64ToBytes(meta.iv_b64);
  const plainBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    qCryptoKey,
    cipherBytes
  );

  return new Uint8Array(plainBuf);
}
