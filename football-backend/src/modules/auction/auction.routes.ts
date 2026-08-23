import { Router } from 'express';
import { getPlayersForAuction, startAuctionForPlayer, sellPlayer, markUnsold, cancelAuction, draftPlayer } from './auction.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { requirePhase } from '../../middleware/phase';
import { Role, Phase } from '@prisma/client';

const router = Router();

// We can allow TEAM_MANAGER and admins to get list of players for auction
router.get('/players', requireAuth, getPlayersForAuction);

// Only admins can control auction flow
router.post('/start', requireAuth, requireRole([Role.SUPER_ADMIN, Role.PODIUM_ADMIN]), requirePhase([Phase.AUCTION]), startAuctionForPlayer);
router.post('/sell', requireAuth, requireRole([Role.SUPER_ADMIN, Role.PODIUM_ADMIN]), requirePhase([Phase.AUCTION]), sellPlayer);
router.post('/unsold', requireAuth, requireRole([Role.SUPER_ADMIN, Role.PODIUM_ADMIN]), requirePhase([Phase.AUCTION]), markUnsold);
router.post('/cancel', requireAuth, requireRole([Role.SUPER_ADMIN, Role.PODIUM_ADMIN]), requirePhase([Phase.AUCTION]), cancelAuction);

// Draft player (Round Robin) - Managers and Admins can draft if it's the manager's turn
router.post('/draft', requireAuth, requireRole([Role.SUPER_ADMIN, Role.PODIUM_ADMIN, Role.TEAM_MANAGER]), requirePhase([Phase.AUCTION]), draftPlayer);

export default router;
