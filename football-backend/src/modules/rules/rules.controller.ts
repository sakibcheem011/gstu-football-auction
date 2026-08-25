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
  // Disabled as per user request: Roster limits are now manually configured in the Admin Setup
  return;
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

export const updateRosterLimits = async (req: Request, res: Response): Promise<any> => {
  try {
    const { minRosterSize, maxRosterSize } = req.body;
    const config = await prisma.systemConfig.upsert({
      where: { id: 'singleton' },
      update: { 
        minRosterSize: minRosterSize !== undefined ? parseInt(minRosterSize) : undefined, 
        maxRosterSize: maxRosterSize !== undefined ? parseInt(maxRosterSize) : undefined
      },
      create: {
        id: 'singleton',
        totalBudget: 150000,
        minRosterSize: minRosterSize !== undefined ? parseInt(minRosterSize) : 15,
        maxRosterSize: maxRosterSize !== undefined ? parseInt(maxRosterSize) : 18
      }
    });
    ioInstance.emit('data_updated', { entity: 'config' });
    return res.json(config);
  } catch (error) {
    console.error('UPDATE ROSTER LIMITS ERROR:', error);
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

export const updateCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { name, basePrice } = req.body;
    const cat = await prisma.playerCategory.update({
      where: { id },
      data: { name, basePrice: parseInt(basePrice) }
    });
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

export const updateRaiseTier = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { minPct, maxPct, raisePct } = req.body;
    const tier = await prisma.biddingRaiseTier.update({
      where: { id },
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

// ============================================
// AUCTION MODE
// ============================================
export const updateAuctionMode = async (req: Request, res: Response): Promise<any> => {
  try {
    const { auctionMode } = req.body;
    let dataToUpdate: any = { auctionMode };
    
    if (auctionMode === 'ROUND_ROBIN') {
      const config = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
      if (!config?.draftOrder || config.draftOrder.length === 0) {
        // Generate a random draft order from approved teams
        const teams = await prisma.team.findMany();
        dataToUpdate.draftOrder = teams.map(t => t.id).sort(() => Math.random() - 0.5);
      }
    }

    const config = await prisma.systemConfig.update({
      where: { id: 'singleton' },
      data: dataToUpdate
    });
    ioInstance.emit('data_updated', { entity: 'config' });
    return res.json(config);
  } catch (error) {
    console.error('UPDATE AUCTION MODE ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateDraftOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const { draftOrder, currentDraftTurn } = req.body;
    const config = await prisma.systemConfig.update({
      where: { id: 'singleton' },
      data: { 
        ...(draftOrder !== undefined && { draftOrder }),
        ...(currentDraftTurn !== undefined && { currentDraftTurn })
      }
    });
    ioInstance.emit('data_updated', { entity: 'config' });
    return res.json(config);
  } catch (error) {
    console.error('UPDATE DRAFT ORDER ERROR:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
