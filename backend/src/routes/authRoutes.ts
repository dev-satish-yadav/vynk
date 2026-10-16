import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticateToken as any, AuthController.getMe as any);
router.get('/users', authenticateToken as any, AuthController.searchUsers as any);
router.put('/profile', authenticateToken as any, AuthController.updateProfile as any);
router.post('/logout', authenticateToken as any, AuthController.logout as any);

export default router;
