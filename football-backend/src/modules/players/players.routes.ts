import { Router } from 'express';
import multer from 'multer';
import { registerPlayer, getPlayers, updatePlayer, deletePlayer, getPublicPlayers } from './players.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { requirePhase } from '../../middleware/phase';
import { Phase, Role } from '@prisma/client';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', requirePhase([Phase.REGISTRATION]), upload.single('image'), registerPlayer);
router.get('/public', getPublicPlayers);
router.get('/', requireAuth, requireRole([Role.SUPER_ADMIN]), getPlayers);
router.put('/:id', requireAuth, requireRole([Role.SUPER_ADMIN]), updatePlayer);
router.delete('/:id', requireAuth, requireRole([Role.SUPER_ADMIN]), deletePlayer);

export default router;
