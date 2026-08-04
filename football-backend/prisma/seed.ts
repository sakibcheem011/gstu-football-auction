import { PrismaClient, Phase, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('superadmin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@gstu.edu' },
    update: {},
    create: {
      email: 'admin@gstu.edu',
      name: 'Super Admin',
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  await prisma.systemConfig.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      currentPhase: Phase.SETUP,
      totalBudget: 100000,
      minRosterSize: 11,
    },
  });

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
