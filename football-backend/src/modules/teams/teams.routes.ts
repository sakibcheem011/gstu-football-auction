import { Router } from 'express';
import { 
  createTeam, getTeams, deleteTeam,
  getPendingManagers, approveManager, updateManager,
  getWishlist, toggleWishlist, uploadTeamLogo
} from './teams.controller';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
import { requireAuth, requireRole } from '../../middleware/auth';
import { requirePhase } from '../../middleware/phase';
import { Role, Phase } from '@prisma/client';

const router = Router();

router.get('/', getTeams);
router.get('/pending-managers', requireAuth, requireRole([Role.SUPER_ADMIN]), getPendingManagers);
router.post('/approve-manager', requireAuth, requireRole([Role.SUPER_ADMIN]), requirePhase([Phase.SETUP]), approveManager);
router.post('/', requireAuth, requireRole([Role.SUPER_ADMIN]), requirePhase([Phase.SETUP]), createTeam);
router.put('/:id/manager', requireAuth, requireRole([Role.SUPER_ADMIN]), updateManager);
router.delete('/:id', requireAuth, requireRole([Role.SUPER_ADMIN]), deleteTeam);

router.post('/:id/logo', requireAuth, requireRole([Role.SUPER_ADMIN, Role.TEAM_MANAGER]), upload.single('image'), uploadTeamLogo);

// Wishlist
router.get('/wishlist', requireAuth, requireRole([Role.TEAM_MANAGER]), getWishlist);
router.post('/wishlist/toggle', requireAuth, requireRole([Role.TEAM_MANAGER]), toggleWishlist);

export default router;
