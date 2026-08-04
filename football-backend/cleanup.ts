import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({ where: { role: 'PLAYER' } });
  const players = await prisma.player.findMany();
  
  const playerStudentIds = players.map(p => p.studentId.toLowerCase());
  for (const u of users) {
    const studentId = u.email.split('@')[0];
    if (!playerStudentIds.includes(studentId)) {
      console.log('Deleting orphaned user:', u.email);
      await prisma.user.delete({ where: { email: u.email } });
    }
  }
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
