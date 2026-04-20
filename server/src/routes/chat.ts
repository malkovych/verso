import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { sendMessage, getConversations, getHistory } from '../controllers/chat.js';

const router = Router();

router.use(authMiddleware as any);
router.post('/message', sendMessage as any);
router.get('/conversations', getConversations as any);
router.get('/history/:conversationId', getHistory as any);

export default router;
