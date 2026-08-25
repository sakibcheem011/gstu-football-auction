import { Router } from 'express';
import { 
  getSystemConfig, updateBudget, updatePhase, updateTimerSettings, updateRosterLimits,
  getCategories, createCategory, updateCategory, deleteCategory,
  getRaiseTiers, createRaiseTier, updateRaiseTier, deleteRaiseTier,
  getSessions, createSession, deleteSession,
  updateAuctionMode, updateDraftOrder
} from './rules.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { requirePhase } from '../../middleware/phase';
import { Role, Phase } from '@prisma/client';

const router = Router();

router.get('/config', getSystemConfig);

router.put('/phase', requireAuth, requireRole([Role.SUPER_ADMIN]), updatePhase);
router.put('/budget', requireAuth, requireRole([Role.SUPER_ADMIN]), updateBudget);
router.put('/roster-limits', requireAuth, requireRole([Role.SUPER_ADMIN]), updateRosterLimits);
router.put('/timer', requireAuth, requireRole([Role.SUPER_ADMIN, Role.PODIUM_ADMIN]), updateTimerSettings);
router.put('/mode', requireAuth, requireRole([Role.SUPER_ADMIN]), updateAuctionMode);
router.put('/draft-order', requireAuth, requireRole([Role.SUPER_ADMIN, Role.PODIUM_ADMIN]), updateDraftOrder);

// Categories
router.get('/categories', getCategories);
router.post('/categories', requireAuth, requireRole([Role.SUPER_ADMIN]), createCategory);
router.put('/categories/:id', requireAuth, requireRole([Role.SUPER_ADMIN]), updateCategory);
router.delete('/categories/:id', requireAuth, requireRole([Role.SUPER_ADMIN]), deleteCategory);

// Bidding Raise Tiers
router.get('/tiers', getRaiseTiers);
router.post('/tiers', requireAuth, requireRole([Role.SUPER_ADMIN]), createRaiseTier);
router.put('/tiers/:id', requireAuth, requireRole([Role.SUPER_ADMIN]), updateRaiseTier);
router.delete('/tiers/:id', requireAuth, requireRole([Role.SUPER_ADMIN]), deleteRaiseTier);

// Sessions
router.get('/sessions', getSessions);
router.post('/sessions', requireAuth, requireRole([Role.SUPER_ADMIN]), createSession);
router.delete('/sessions/:id', requireAuth, requireRole([Role.SUPER_ADMIN]), deleteSession);

export default router;
