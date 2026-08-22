import { Router } from 'express';
import { getFixtures, createFixture, deleteFixture, updateMatchScore, updatePlayerStats, getStandings } from './tournament.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.get('/fixtures', getFixtures);
router.get('/standings', getStandings);

router.post('/fixtures', requireAuth, requireRole([Role.SUPER_ADMIN]), createFixture);
router.delete('/fixtures/:id', requireAuth, requireRole([Role.SUPER_ADMIN]), deleteFixture);
router.put('/matches/:id', requireAuth, requireRole([Role.SUPER_ADMIN]), updateMatchScore);
router.post('/matches/:matchId/stats', requireAuth, requireRole([Role.SUPER_ADMIN]), updatePlayerStats);

export default router;
