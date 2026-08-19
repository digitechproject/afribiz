import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "fernandohoussou@gmail.com";
  console.log(`[AfriBiz DB Cleanup] Suppression de l'utilisateur de test: ${email}...`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.log("Utilisateur non trouvé en base.");
    return;
  }

  // Delete all companies owned by this user
  // (Cascades to TenantSummary and Membership relations in Prisma)
  const deletedCompanies = await prisma.company.deleteMany({
    where: { ownerUserId: user.id },
  });

  console.log(`- ${deletedCompanies.count} entreprises supprimées.`);

  // Delete the user (Cascades to Sessions and OTPCodes)
  await prisma.user.delete({
    where: { id: user.id },
  });

  console.log("- Utilisateur, sessions et codes OTP supprimés.");
  console.log("Nettoyage de test effectué avec succès !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
