const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function add() {
  try {
    const player = await prisma.player.create({
      data: {
        name: 'Lionel Messi',
        email: 'messi@gmail.com',
        studentId: 'lm10',
        sessionId: 'clm',
        jerseyName: 'MESSI',
        imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55',
        imagePublicId: 'dummy_id',
        positions: { create: [{ position: 'ST', isPrimary: true }] }
      }
    });
    console.log('Created dummy player:', player.name);
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
add();
