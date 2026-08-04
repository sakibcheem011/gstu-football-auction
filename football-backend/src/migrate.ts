import prisma from './lib/prisma';

async function main() {
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "phone" TEXT UNIQUE;`);
    console.log("Column phone added successfully!");
  } catch(e: any) {
    console.log("Maybe already exists or error: ", e.message);
  }
}

main().finally(() => prisma.$disconnect());
