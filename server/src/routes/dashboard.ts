import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getStats, getFunnelData } from '../controllers/dashboard.js';

const router = Router();

router.use(authMiddleware as any);
router.get('/stats', getStats as any);
router.get('/funnel', getFunnelData as any);

export default router;
