import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { list, create, remove, update } from '../controllers/knowledgeBase.js';

const router = Router();

router.use(authMiddleware as any);
router.get('/', list as any);
router.post('/', create as any);
router.delete('/:id', remove as any);
router.put('/:id', update as any);

export default router;
