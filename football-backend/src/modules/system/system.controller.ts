import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import cloudinary from '../../lib/cloudinary';
import { ioInstance } from '../../sockets';

export const level1Reset = async (req: Request, res: Response): Promise<any> => {
  try {
    await prisma.$transaction(async (tx) => {
      // Clear all stats, matches, fixtures
      await tx.playerMatchStat.deleteMany();
      await tx.match.deleteMany();
      await tx.fixture.deleteMany();
      
      // Detach all players from teams and reset status
      await tx.player.updateMany({
        data: { teamId: null, status: 'UNSOLD', currentBid: null }
      });
      
      // Reset teams' budget
      const config = await tx.systemConfig.findUnique({ where: { id: 'singleton' } });
      const baseBudget = config?.totalBudget || 1500000;
      await tx.team.updateMany({
        data: { remainingBudget: baseBudget }
      });
      
      // Clear auction logs
      await tx.auctionLedgerEntry.deleteMany();

      // Set phase back to AUCTION
      await tx.systemConfig.update({
        where: { id: 'singleton' },
        data: { currentPhase: 'AUCTION' }
      });
    });
    
    ioInstance.emit('data_updated', { entity: 'system' });
    return res.json({ message: 'Level 1: Economy & Tournament Wiper executed successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const level2Reset = async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. Fetch all players to get Cloudinary public IDs
    const players = await prisma.player.findMany();
    
    // 2. Delete images from Cloudinary concurrently
    const deletePromises = players
      .filter(p => p.imagePublicId)
      .map(p => cloudinary.uploader.destroy(p.imagePublicId!).catch(console.error));
    await Promise.all(deletePromises);
    
    // 3. Database transaction
    await prisma.$transaction(async (tx) => {
      // Clear stats, matches, fixtures
      await tx.playerMatchStat.deleteMany();
      await tx.match.deleteMany();
      await tx.fixture.deleteMany();
      
      // Clear auction logs
      await tx.auctionLedgerEntry.deleteMany();
      
      // Delete all players (and their positions by cascade)
      await tx.player.deleteMany();
      
      // Delete PLAYER users
      await tx.user.deleteMany({ where: { role: 'PLAYER' } });
      
      // Reset teams' budget
      const config = await tx.systemConfig.findUnique({ where: { id: 'singleton' } });
      const baseBudget = config?.totalBudget || 1500000;
      await tx.team.updateMany({
        data: { remainingBudget: baseBudget }
      });

      // Set phase back to REGISTRATION
      await tx.systemConfig.update({
        where: { id: 'singleton' },
        data: { currentPhase: 'REGISTRATION' }
      });
    });
    
    ioInstance.emit('data_updated', { entity: 'system' });
    return res.json({ message: 'Level 2: Complete Roster Wipe executed successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const level3Reset = async (req: Request, res: Response): Promise<any> => {
  try {
    // Same as Level 2 but we also wipe Managers, Teams, Categories, and configs
    const players = await prisma.player.findMany();
    const deletePromises = players
      .filter(p => p.imagePublicId)
      .map(p => cloudinary.uploader.destroy(p.imagePublicId!).catch(console.error));
    await Promise.all(deletePromises);
    
    await prisma.$transaction(async (tx) => {
      await tx.playerMatchStat.deleteMany();
      await tx.match.deleteMany();
      await tx.fixture.deleteMany();
      await tx.auctionLedgerEntry.deleteMany();
      await tx.player.deleteMany();
      await tx.team.deleteMany();
      await tx.playerCategory.deleteMany();
      
      // Delete ALL users except SUPER_ADMIN
      await tx.user.deleteMany({
        where: { role: { not: 'SUPER_ADMIN' } }
      });
      
      // Reset phase to SETUP
      await tx.systemConfig.update({
        where: { id: 'singleton' },
        data: { currentPhase: 'SETUP' }
      });
    });
    
    ioInstance.emit('data_updated', { entity: 'system' });
    return res.json({ message: 'Level 3: Nuclear Reset executed successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
