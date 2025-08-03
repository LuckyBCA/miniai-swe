import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

// This seed script is a placeholder.
// User creation is handled by Clerk authentication.
// You can add custom seeding logic here if needed in the future.
export async function main() {
  console.log("Starting seed...");
  // Add any future seeding logic here
  console.log("Seed finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });