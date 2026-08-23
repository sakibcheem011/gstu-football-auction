import { Request, Response } from 'express';
import prisma from '../../lib/prisma';
import { auctionState } from './auctionState';
import { ioInstance } from '../../sockets';
import { PlayerStatus } from '@prisma/client';

export const getPlayersForAuction = async (req: Request, res: Response): Promise<any> => {
  try {
    const players = await prisma.player.findMany({
      where: { status: PlayerStatus.UNSOLD },
      include: { positions: true, category: true }
    });
    return res.json(players);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const startAuctionForPlayer = async (req: Request, res: Response): Promise<any> => {
  try {
    const { playerId, timer } = req.body;
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { positions: true, category: true }
    });
    
    if (!player) return res.status(404).json({ error: 'Player not found' });
    if (player.status !== PlayerStatus.UNSOLD) return res.status(400).json({ error: 'Player already auctioned' });

    const config = await prisma.systemConfig.findFirst();
    const raiseTiers = await prisma.biddingRaiseTier.findMany({ orderBy: { minPct: 'asc' } });
    
    let basePrice = 500; // default fallback
    if (player.categoryId) {
      const category = await prisma.playerCategory.findUnique({ where: { id: player.categoryId } });
      if (category) basePrice = category.basePrice;
    }
    
    const totalBudget = config?.totalBudget || 1500000;
    const finalTimer = timer ? parseInt(timer, 10) : (config?.defaultTimer || 60);

    auctionState.startAuction(player, basePrice, totalBudget, raiseTiers, finalTimer);
    ioInstance.emit('auction_state_sync', auctionState.getState());
    
    return res.json({ success: true });
  } catch (error) {
    console.error('startAuctionForPlayer error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const sellPlayer = async (req: Request, res: Response): Promise<any> => {
  try {
    const state = auctionState.getState();
    if (state.status === 'IDLE' || !state.activePlayer) {
      return res.status(400).json({ error: 'No active auction' });
    }
    
    if (!state.highestBidderTeamId || state.currentBid === 0) {
      return res.status(400).json({ error: 'Cannot sell without bids. Mark as unsold instead.' });
    }

    const playerId = state.activePlayer.id;
    const teamId = state.highestBidderTeamId;
    const price = state.currentBid;

    // Transaction
    await prisma.$transaction([
      prisma.player.update({
        where: { id: playerId },
        data: { status: PlayerStatus.SOLD, teamId, soldPrice: price }
      }),
      prisma.team.update({
        where: { id: teamId },
        data: { remainingBudget: { decrement: price } }
      }),
      prisma.auctionLedgerEntry.create({
        data: { playerId, teamId, amount: price }
      })
    ]);

    auctionState.clearAuction();
    ioInstance.emit('player_sold', { playerId, teamId, price });
    ioInstance.emit('auction_state_sync', auctionState.getState());

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const markUnsold = async (req: Request, res: Response): Promise<any> => {
  try {
    const state = auctionState.getState();
    if (state.status === 'IDLE' || !state.activePlayer) {
      return res.status(400).json({ error: 'No active auction' });
    }

    const playerId = state.activePlayer.id;
    await prisma.player.update({
      where: { id: playerId },
      data: { status: PlayerStatus.UNSOLD }
    });

    auctionState.clearAuction();
    ioInstance.emit('player_unsold', { playerId });
    ioInstance.emit('auction_state_sync', auctionState.getState());

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelAuction = async (req: Request, res: Response): Promise<any> => {
  try {
    const state = auctionState.getState();
    if (state.status === 'IDLE' || !state.activePlayer) {
      return res.status(400).json({ error: 'No active auction to cancel' });
    }

    auctionState.clearAuction();
    ioInstance.emit('auction_cancelled', { message: 'Auction was cancelled by admin' });
    ioInstance.emit('auction_state_sync', auctionState.getState());

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const draftPlayer = async (req: Request, res: Response): Promise<any> => {
  try {
    const { playerId } = req.body;
    
    // In Draft Mode, the user's turn is checked by the frontend, but we also enforce it here
    const config = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
    if (!config || config.auctionMode !== 'ROUND_ROBIN' || config.draftOrder.length === 0) {
      return res.status(400).json({ error: 'Draft mode is not active or draft order is missing' });
    }

    const teamId = config.draftOrder[config.currentDraftTurn];
    
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { category: true }
    });
    
    if (!player) return res.status(404).json({ error: 'Player not found' });
    if (player.status !== PlayerStatus.UNSOLD) return res.status(400).json({ error: 'Player already drafted' });

    let price = player.category?.basePrice || 500;

    // Transaction
    await prisma.$transaction([
      prisma.player.update({
        where: { id: playerId },
        data: { status: PlayerStatus.SOLD, teamId, soldPrice: price }
      }),
      prisma.team.update({
        where: { id: teamId },
        data: { remainingBudget: { decrement: price } }
      }),
      prisma.auctionLedgerEntry.create({
        data: { playerId, teamId, amount: price }
      }),
      prisma.systemConfig.update({
        where: { id: 'singleton' },
        data: { currentDraftTurn: (config.currentDraftTurn + 1) % config.draftOrder.length }
      })
    ]);

    // Update frontend
    ioInstance.emit('player_sold', { playerId, teamId, price });
    ioInstance.emit('data_updated', { entity: 'config' });

    return res.json({ success: true, teamId });
  } catch (error) {
    console.error('draftPlayer error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

