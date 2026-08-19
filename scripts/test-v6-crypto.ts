import { hashPassword, verifyPasswordDetails, verifyPassword } from "../lib/crypto";
import { pbkdf2Sync, randomBytes } from "crypto";

async function testCrypto() {
  console.log("--- Test 1 : Hachage scrypt standard ---");
  const pwd = "MyStrongPassword2026!";
  const hash = hashPassword(pwd);
  console.log("Hash généré:", hash);
  if (!hash.startsWith("scrypt:")) {
    throw new Error("Le hash doit débuter par 'scrypt:'");
  }

  const checkValid = verifyPasswordDetails(pwd, hash);
  console.log("Vérification mot de passe valide:", checkValid);
  if (!checkValid.valid || checkValid.needsRehash) {
    throw new Error("Échec vérification scrypt valide");
  }

  const checkInvalid = verifyPassword(pwd + "_wrong", hash);
  console.log("Vérification mot de passe faux:", checkInvalid);
  if (checkInvalid) {
    throw new Error("Un mauvais mot de passe ne doit pas être valide");
  }

  console.log("\n--- Test 2 : Rétrocompatibilité PBKDF2 (legacy) & auto-rehash ---");
  const legacySalt = randomBytes(16).toString("hex");
  const legacyHash = pbkdf2Sync(pwd, legacySalt, 1000, 64, "sha512").toString("hex");
  const legacyStored = `${legacySalt}:${legacyHash}`;
  console.log("Hash legacy:", legacyStored);

  const checkLegacy = verifyPasswordDetails(pwd, legacyStored);
  console.log("Résultat vérification legacy:", checkLegacy);
  if (!checkLegacy.valid || !checkLegacy.needsRehash) {
    throw new Error("Le hash legacy doit être valide ET signaler needsRehash: true");
  }

  console.log("\n✅ Tous les tests cryptographiques V6 sont passés avec succès !");
}

testCrypto().catch((err) => {
  console.error("❌ Erreur test crypto:", err);
  process.exit(1);
});
