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
  try {
    await prisma.player.create({
      data: {
        name: 'Test',
        studentId: 'test112',
        sessionId: '2023',
        jerseyName: 'Test',
        imageUrl: 'http://test.com/img.jpg',
        imagePublicId: 'img',
        positions: {
          create: [{ position: 'CM', isPrimary: true }]
        }
      }
    });
    console.log('Success');
  } catch(e) {
    console.error(e);
  }
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
