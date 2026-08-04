import { Router } from 'express';
import { getConfig, updateConfig } from './config.controller';
import { requireAuth } from '../../middleware/auth';

const router = Router();

router.get('/', getConfig);
router.put('/', requireAuth, updateConfig);

export default router;
