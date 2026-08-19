import { DEFAULT_ROLE_PERMISSIONS } from "../lib/authz";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testAuthz() {
  console.log("--- Test 1 : Vérification de la matrice des permissions ---");

  if (!DEFAULT_ROLE_PERMISSIONS.SUPER_ADMIN.includes("*")) {
    throw new Error("SUPER_ADMIN doit posséder '*'");
  }

  if (!DEFAULT_ROLE_PERMISSIONS.ADMIN.includes("SETTINGS_UPDATE")) {
    throw new Error("ADMIN doit pouvoir SETTINGS_UPDATE");
  }

  if (DEFAULT_ROLE_PERMISSIONS.VIEWER.includes("MEMBERS_REMOVE")) {
    throw new Error("VIEWER ne doit pas pouvoir MEMBERS_REMOVE");
  }

  console.log("✅ Matrice de permissions validée !");
}

testAuthz()
  .catch((err) => {
    console.error("❌ Erreur test authz:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
