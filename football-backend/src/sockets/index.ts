import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { auctionState } from '../modules/auction/auctionState';
import prisma from '../lib/prisma';

export let ioInstance: Server;

export const setupSockets = (io: Server) => {
  ioInstance = io;
  
  // Set up tick broadcast for timer
  auctionState.setOnTick((state) => {
    io.emit('auction_timer_tick', { timer: state.timer });
  });

  // Handle auto-sell when timer reaches 0
  auctionState.setOnAuctionEnd(async (state) => {
    if (!state.activePlayer) return;
    
    if (!state.highestBidderTeamId) {
      // Mark Unsold
      await prisma.player.update({
        where: { id: state.activePlayer.id },
        data: { status: 'UNSOLD' }
      });
      auctionState.clearAuction();
      io.emit('player_unsold', { playerId: state.activePlayer.id });
      io.emit('auction_state_sync', auctionState.getState());
      io.emit('data_updated', { entity: 'players' });
    } else {
      // Sell Player
      const playerId = state.activePlayer.id;
      const teamId = state.highestBidderTeamId;
      const price = state.currentBid;

      await prisma.$transaction([
        prisma.player.update({
          where: { id: playerId },
          data: { status: 'SOLD', teamId, soldPrice: price }
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
      io.emit('player_sold', { playerId, teamId, price });
      io.emit('auction_state_sync', auctionState.getState());
      io.emit('data_updated', { entity: 'players' });
    }
  });

  // Auth middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        socket.data.user = decoded;
      } catch (err) {}
    }
    next();
  });

  io.on('connection', (socket: Socket) => {
    // Send initial state to the newly connected client
    socket.emit('auction_state_sync', auctionState.getState());

    // Middleware check for Podium/Super Admin
    const requireAdmin = () => {
      const user = socket.data.user;
      return user && (user.role === 'SUPER_ADMIN' || user.role === 'PODIUM_ADMIN');
    };

    const isAuctionPhase = async () => {
      const config = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
      return config?.currentPhase === 'AUCTION';
    };

    // PODIUM ADMIN CONTROLS
    socket.on('podium_pause', async () => {
      if (!requireAdmin() || !(await isAuctionPhase())) return;
      if (auctionState.pauseAuction()) {
        io.emit('auction_state_sync', auctionState.getState());
      }
    });

    socket.on('podium_resume', async () => {
      if (!requireAdmin() || !(await isAuctionPhase())) return;
      if (auctionState.resumeAuction()) {
        io.emit('auction_state_sync', auctionState.getState());
      }
    });

    socket.on('podium_set_timer', async (data: { seconds: number }) => {
      if (!requireAdmin() || !(await isAuctionPhase())) return;
      const config = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
      if (config?.timerLocked) return;
      auctionState.setTimer(data.seconds);
      io.emit('auction_state_sync', auctionState.getState());
    });

    socket.on('podium_extend_timer', async (data: { seconds: number }) => {
      if (!requireAdmin() || !(await isAuctionPhase())) return;
      const config = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
      if (config?.timerLocked) return;
      auctionState.extendTimer(data.seconds);
      io.emit('auction_state_sync', auctionState.getState());
    });

    socket.on('podium_set_mode', async (data: { mode: 'NORMAL' | 'BLIND' }) => {
      if (!requireAdmin() || !(await isAuctionPhase())) return;
      auctionState.setMode(data.mode);
      io.emit('auction_state_sync', auctionState.getState());
    });

    socket.on('podium_rollback_bid', async () => {
      if (!requireAdmin() || !(await isAuctionPhase())) return;
      if (auctionState.rollbackLastBid()) {
        io.emit('auction_state_sync', auctionState.getState());
      }
    });
    
    socket.on('podium_manual_bid', async (data: { teamId: string, teamName: string, amount: number }) => {
      if (!requireAdmin() || !(await isAuctionPhase())) return;
      if (auctionState.placeBid(data.teamId, data.teamName, data.amount)) {
        io.emit('auction_state_sync', auctionState.getState());
      }
    });

    socket.on('place_bid', async (data: { amount: number }) => {
      const user = socket.data.user;
      if (!user || user.role !== 'TEAM_MANAGER') {
        return socket.emit('bid_error', { message: 'Unauthorized' });
      }

      if (!(await isAuctionPhase())) {
        return socket.emit('bid_error', { message: 'Auction is currently closed (Not in AUCTION phase)' });
      }
      
      const state = auctionState.getState();
      if (state.status !== 'ACTIVE' || !state.activePlayer) {
        return socket.emit('bid_error', { message: 'No active auction' });
      }

      // Check remaining budget and roster guardrails
      const team = await prisma.team.findUnique({ 
        where: { managerId: user.id },
        include: { players: true } 
      });
      if (!team) return socket.emit('bid_error', { message: 'Team not found' });

      const config = await prisma.systemConfig.findUnique({ where: { id: 'singleton' } });
      const minRosterSize = config?.minRosterSize || 15;
      const maxRosterSize = config?.maxRosterSize || 18;
      
      const currentRosterSize = team.players.length;
      
      if (currentRosterSize >= maxRosterSize) {
        return socket.emit('bid_error', { message: `Roster limit reached. You can only buy a maximum of ${maxRosterSize} players.` });
      }
      
      const lowestCategory = await prisma.playerCategory.findFirst({ orderBy: { basePrice: 'asc' } });
      const lowestBasePrice = lowestCategory?.basePrice || 0;

      const requiredPlayers = Math.max(0, minRosterSize - currentRosterSize - 1);
      const maxBidAllowed = team.remainingBudget - (requiredPlayers * lowestBasePrice);

      if (data.amount > maxBidAllowed) {
        return socket.emit('bid_error', { 
          message: `Mathematical Guardrail: You must reserve TK ${(requiredPlayers * lowestBasePrice).toLocaleString()} for your remaining ${requiredPlayers} mandatory slots. Max allowed bid: TK ${maxBidAllowed.toLocaleString()}` 
        });
      }

      if (state.mode === 'NORMAL' && data.amount <= state.currentBid && state.highestBidderTeamId !== null) {
        return socket.emit('bid_error', { message: 'Bid must be higher than current bid' });
      }

      const basePrice = state.activePlayer.category?.basePrice || 0;
      if (data.amount < basePrice) {
        return socket.emit('bid_error', { message: `Bid must be at least ${basePrice}` });
      }

      const success = auctionState.placeBid(team.id, team.name, data.amount);
      if (success) {
        // Broadcast new state
        io.emit('auction_state_sync', auctionState.getState());
      } else {
        socket.emit('bid_error', { message: 'Bid rejected' });
      }
    });
  });
};
