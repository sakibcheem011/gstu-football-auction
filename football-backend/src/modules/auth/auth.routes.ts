import { Router } from 'express';
import { login, getMe, createStaff, getStaff, deleteStaff, registerManager } from './auth.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

router.post('/login', login);
router.post('/register-manager', registerManager);
router.get('/me', requireAuth, getMe);

// Staff management (Super Admin only)
router.post('/staff', requireAuth, requireRole([Role.SUPER_ADMIN]), createStaff);
router.get('/staff', requireAuth, requireRole([Role.SUPER_ADMIN]), getStaff);
router.delete('/staff/:id', requireAuth, requireRole([Role.SUPER_ADMIN]), deleteStaff);

export default router;
