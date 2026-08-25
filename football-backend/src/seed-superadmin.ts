import prisma from './lib/prisma';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Missing SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD env variables.');
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Superadmin already exists. Updating password...');
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { passwordHash, role: 'SUPER_ADMIN' }
    });
    console.log('Superadmin updated successfully.');
  } else {
    console.log('Creating superadmin...');
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name: 'Super Admin',
        email,
        passwordHash,
        role: 'SUPER_ADMIN',
        isApproved: true
      }
    });
    console.log('Superadmin created successfully.');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());