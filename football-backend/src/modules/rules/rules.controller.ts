import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { Phase } from '@prisma/client';
import { ioInstance } from '../../sockets';

export const getSystemConfig = async (req: Request, res: Response): Promise<any> => {
  try {
    let config = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
    if (!config) {
      config = await prisma.systemConfig.create({
        data: {
          id: 'singleton',
          currentPhase: Phase.SETUP,
          totalBudget: 1500000,
          minRosterSize: 15,
          maxRosterSize: 18,
          defaultTimer: 60,
          timerLocked: false
        }
      });
    }
    return res.json(config);
  } catch (error) {
    console.error('GET CONFIG ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const recalculateRosterLimits = async () => {
  try {
    const totalApprovedPlayers = await prisma.player.count({
      where: { status: { in: ['UNSOLD', 'SOLD'] } }
    });
    const totalTeams = await prisma.team.count();
    
    if (totalTeams > 0) {
      const avg = totalApprovedPlayers / totalTeams;
      const minRosterSize = Math.max(1, Math.floor(avg) - 1);
      const maxRosterSize = Math.ceil(avg) + 2; // +2 for flexibility as requested

      await prisma.systemConfig.update({
        where: { id: 'singleton' },
        data: { minRosterSize, maxRosterSize }
      });
      ioInstance.emit('data_updated', { entity: 'config' });
    }
  } catch (error) {
    console.error('Failed to recalculate roster limits', error);
  }
};

export const updateTimerSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    const { defaultTimer, timerLocked } = req.body;
    const config = await prisma.systemConfig.update({
      where: { id: 'singleton' },
      data: { 
        ...(defaultTimer !== undefined && { defaultTimer: parseInt(defaultTimer) }),
        ...(timerLocked !== undefined && { timerLocked: Boolean(timerLocked) })
      }
    });
    ioInstance.emit('data_updated', { entity: 'config' });
    return res.json(config);
  } catch (error) {
    console.error('UPDATE TIMER ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBudget = async (req: Request, res: Response): Promise<any> => {
  try {
    const { totalBudget, minRosterSize } = req.body;
    const config = await prisma.systemConfig.upsert({
      where: { id: 'singleton' },
      update: { totalBudget, minRosterSize },
      create: {
        id: 'singleton',
        currentPhase: Phase.SETUP,
        totalBudget,
        minRosterSize: minRosterSize || 15
      }
    });
    ioInstance.emit('data_updated', { entity: 'config' });
    return res.json(config);
  } catch (error) {
    console.error('UPDATE BUDGET ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePhase = async (req: Request, res: Response): Promise<any> => {
  try {
    const { phase } = req.body;
    const oldConfig = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });

    const config = await prisma.systemConfig.upsert({
      where: { id: 'singleton' },
      update: { currentPhase: phase },
      create: {
        id: 'singleton',
        currentPhase: phase,
        totalBudget: 1500000,
        minRosterSize: 15
      }
    });

    // Check if we need to reset the auction
    if (oldConfig && oldConfig.currentPhase === Phase.AUCTION && (phase === Phase.SETUP || phase === Phase.REGISTRATION)) {
      // 1. Restore team budgets
      const soldPlayers = await prisma.player.findMany({
        where: { status: 'SOLD', teamId: { not: null }, soldPrice: { not: null } }
      });
      
      for (const player of soldPlayers) {
        if (player.teamId && player.soldPrice) {
          await prisma.team.update({
            where: { id: player.teamId },
            data: { remainingBudget: { increment: player.soldPrice } }
          });
        }
      }

      // 2. Reset players
      await prisma.player.updateMany({
        data: {
          status: 'UNSOLD',
          teamId: null,
          soldPrice: null
        }
      });

      // 3. Clear ledger
      await prisma.auctionLedgerEntry.deleteMany({});
      
      // 4. Clear memory state (import auctionState from '../auction/auctionState')
      try {
        const { auctionState } = require('../auction/auctionState');
        if (auctionState) {
          auctionState.clearAuction();
          ioInstance.emit('auction_state_sync', auctionState.getState());
        }
      } catch (e) {
        console.error('Failed to clear auction state memory', e);
      }
    }
    ioInstance.emit('data_updated', { entity: 'config' });
    return res.json(config);
  } catch (error) {
    console.error('UPDATE PHASE ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ============================================
// PLAYER CATEGORIES
// ============================================
export const getCategories = async (req: Request, res: Response): Promise<any> => {
  try {
    const categories = await prisma.playerCategory.findMany({ orderBy: { basePrice: 'desc' } });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, basePrice } = req.body;
    const cat = await prisma.playerCategory.create({ data: { name, basePrice: parseInt(basePrice) } });
    return res.json(cat);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    await prisma.playerCategory.delete({ where: { id: (req.params.id as string) } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ============================================
// BIDDING RAISE TIERS
// ============================================
export const getRaiseTiers = async (req: Request, res: Response): Promise<any> => {
  try {
    const tiers = await prisma.biddingRaiseTier.findMany({ orderBy: { minPct: 'asc' } });
    return res.json(tiers);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createRaiseTier = async (req: Request, res: Response): Promise<any> => {
  try {
    const { minPct, maxPct, raisePct } = req.body;
    const tier = await prisma.biddingRaiseTier.create({
      data: { minPct: parseFloat(minPct), maxPct: parseFloat(maxPct), raisePct: parseFloat(raisePct) }
    });
    return res.json(tier);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteRaiseTier = async (req: Request, res: Response): Promise<any> => {
  try {
    await prisma.biddingRaiseTier.delete({ where: { id: (req.params.id as string) } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// ============================================
// ACADEMIC SESSIONS
// ============================================
export const getSessions = async (req: Request, res: Response): Promise<any> => {
  try {
    const sessions = await prisma.session.findMany({ orderBy: { name: 'desc' } });
    return res.json(sessions);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const createSession = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name } = req.body;
    const sess = await prisma.session.create({ data: { name, active: true } });
    return res.json(sess);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteSession = async (req: Request, res: Response): Promise<any> => {
  try {
    await prisma.session.delete({ where: { id: (req.params.id as string) } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
