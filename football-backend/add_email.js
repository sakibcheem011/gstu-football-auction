const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe('ALTER TABLE "Player" ADD COLUMN email TEXT;');
  await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX "Player_email_key" ON "Player"("email");');
  console.log('Column added');
}
main().catch(console.error).finally(() => prisma.$disconnect());
