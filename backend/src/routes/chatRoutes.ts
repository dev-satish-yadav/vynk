import { Router } from 'express';
import { ChatController } from '../controllers/chatController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Protect all chat routes with JWT middleware
router.use(authenticateToken as any);

router.get('/conversations', ChatController.getConversations as any);
router.post('/conversations', ChatController.createConversation as any);
router.get('/conversations/:conversationId/messages', ChatController.getMessages as any);
router.post('/messages', ChatController.sendMessage as any);
router.post('/conversations/:conversationId/read', ChatController.markAsRead as any);

export default router;
