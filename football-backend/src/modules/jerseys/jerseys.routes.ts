import { Router } from 'express';
import multer from 'multer';
import { uploadJersey, getJerseys, deleteJersey, toggleVote } from './jerseys.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', requireAuth, requireRole([Role.PLAYER]), upload.single('image'), uploadJersey);
router.get('/', getJerseys); // Public
router.delete('/:id', requireAuth, requireRole([Role.SUPER_ADMIN, Role.PLAYER]), deleteJersey);
router.post('/:id/vote', requireAuth, requireRole([Role.PLAYER]), toggleVote);

export default router;