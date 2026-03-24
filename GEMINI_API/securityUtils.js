import CryptoJS from 'crypto-js';
import "dotenv/config";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_for_ramadan_portfolio_123';

/**
 * تشفير النص باستخدام AES (CryptoJS)
 */
export function encrypt(text) {
    if (!text) return text;
    try {
        return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    } catch (e) {
        console.error("Encryption error:", e);
        return text;
    }
}

/**
 * فك تشفير النص باستخدام AES (CryptoJS)
 */
export function decrypt(cipherText) {
    if (!cipherText) return cipherText;
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText || cipherText; // لو فشل فك التشفير يرجع النص كما هو (أمان إضافي)
    } catch (e) {
        console.error("Decryption error:", e);
        return cipherText;
    }
}
