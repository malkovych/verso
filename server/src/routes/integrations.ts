import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getStatus,
  googleAuth, googleCallback, googleDisconnect,
  trelloAuth, trelloDisconnect,
  hubstaffConnect, hubstaffDisconnect,
} from '../controllers/integrations.js';

const router = Router();

router.use(authMiddleware as any);
router.get('/status', getStatus as any);

router.get('/google/auth', googleAuth as any);
router.get('/google/callback', googleCallback as any);
router.post('/google/disconnect', googleDisconnect as any);

router.get('/trello/auth', trelloAuth as any);
router.post('/trello/disconnect', trelloDisconnect as any);

router.post('/hubstaff/connect', hubstaffConnect as any);
router.post('/hubstaff/disconnect', hubstaffDisconnect as any);

export default router;
