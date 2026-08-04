import { Router } from 'express';
import { level1Reset, level2Reset, level3Reset } from './system.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// All system level resets require Super Admin
router.post('/reset/level1', requireAuth, requireRole([Role.SUPER_ADMIN]), level1Reset);
router.post('/reset/level2', requireAuth, requireRole([Role.SUPER_ADMIN]), level2Reset);
router.post('/reset/level3', requireAuth, requireRole([Role.SUPER_ADMIN]), level3Reset);

export default router;
