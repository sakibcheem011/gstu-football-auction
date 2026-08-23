const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fix() {
  const hash = await bcrypt.hash('password', 10);
  
  await prisma.user.updateMany({
    where: { role: 'SUPER_ADMIN' },
    data: { passwordHash: hash }
  });
  console.log('All Super Admin passwords reset to: password');
}

fix()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
