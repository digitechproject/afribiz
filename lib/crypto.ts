import { pbkdf2Sync, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const SCRYPT_PREFIX = "scrypt";
const SCRYPT_KEYLEN = 64;
const SCRYPT_COST = 16384; // N
const SCRYPT_BLOCK_SIZE = 8; // r
const SCRYPT_PARALLELIZATION = 1; // p

export interface PasswordVerificationResult {
  valid: boolean;
  needsRehash: boolean;
}

/**
 * Hache un mot de passe avec l'algorithme scrypt hautement sécurisé
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, SCRYPT_KEYLEN, {
    N: SCRYPT_COST,
    r: SCRYPT_BLOCK_SIZE,
    p: SCRYPT_PARALLELIZATION,
  });
  return `${SCRYPT_PREFIX}:${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Vérifie un mot de passe en temps constant avec support de la migration transparente (legacy PBKDF2 -> scrypt)
 */
export function verifyPasswordDetails(password: string, stored: string): PasswordVerificationResult {
  if (!stored || !password) {
    return { valid: false, needsRehash: false };
  }

  const parts = stored.split(":");

  // Nouveau format scrypt : "scrypt:salt:hash"
  if (parts.length === 3 && parts[0] === SCRYPT_PREFIX) {
    const [, salt, expectedHashHex] = parts;
    try {
      const derivedKey = scryptSync(password, salt, SCRYPT_KEYLEN, {
        N: SCRYPT_COST,
        r: SCRYPT_BLOCK_SIZE,
        p: SCRYPT_PARALLELIZATION,
      });
      const expectedBuffer = Buffer.from(expectedHashHex, "hex");
      const isValid =
        derivedKey.length === expectedBuffer.length &&
        timingSafeEqual(derivedKey, expectedBuffer);

      return { valid: isValid, needsRehash: false };
    } catch {
      return { valid: false, needsRehash: false };
    }
  }

  // Format historique PBKDF2 : "salt:hash" (1000 itérations)
  if (parts.length === 2) {
    const [salt, expectedHashHex] = parts;
    try {
      const derivedKey = pbkdf2Sync(password, salt, 1000, 64, "sha512");
      const expectedBuffer = Buffer.from(expectedHashHex, "hex");
      const isValid =
        derivedKey.length === expectedBuffer.length &&
        timingSafeEqual(derivedKey, expectedBuffer);

      return { valid: isValid, needsRehash: isValid };
    } catch {
      return { valid: false, needsRehash: false };
    }
  }

  return { valid: false, needsRehash: false };
}

/**
 * Wrapper de compatibilité pour tester la validité d'un mot de passe
 */
export function verifyPassword(password: string, stored: string): boolean {
  return verifyPasswordDetails(password, stored).valid;
}
