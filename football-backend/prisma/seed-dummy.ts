import { Phase, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();
import prisma from '../src/lib/prisma';

async function main() {
  // Update phase to AUCTION so we can test auction
  await prisma.systemConfig.update({
    where: { id: 'singleton' },
    data: { currentPhase: Phase.AUCTION }
  });

  const passwordHash = await bcrypt.hash('manager123', 10);
  
  // Create Category if not exists
  let cat = await prisma.category.findFirst({ where: { name: 'Marquee' }});
  if (!cat) {
    cat = await prisma.category.create({ data: { name: 'Marquee', basePrice: 500 } });
  }

  // Create Manager 1
  const m1 = await prisma.user.upsert({
    where: { email: 'manager1@gstu.edu' },
    update: {},
    create: { email: 'manager1@gstu.edu', name: 'Manager One', passwordHash, role: Role.TEAM_MANAGER }
  });

  // Create Team 1
  await prisma.team.upsert({
    where: { managerId: m1.id },
    update: {},
    create: { name: 'FC Tigers', managerId: m1.id, remainingBudget: 100000 }
  });

  // Create dummy player
  await prisma.player.upsert({
    where: { studentId: 'DUMMY001' },
    update: {},
    create: {
      name: 'Lionel Messi',
      studentId: 'DUMMY001',
      sessionId: '2023-2024',
      jerseyName: 'MESSI',
      imageUrl: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg',
      imagePublicId: 'sample',
      categoryId: cat.id,
      positions: { create: [{ position: 'RW', isPrimary: true }] }
    }
  });

  console.log('Dummy teams and player seeded. Use manager1@gstu.edu / manager123 to bid.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
