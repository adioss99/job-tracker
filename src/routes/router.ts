import { Router, Response, Request } from 'express';
import { getUser, getProfile } from '../controllers/user.controller';
import { register, login, refreshToken, logout } from '../controllers/auth.controller';
import { authMiddleware, isAdmin } from '../middleware/auth.middleware'; 

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
}); 

router.post('/register', register);
router.post('/login', login);
router.get('/refresh-token', refreshToken);
router.post('/logout', authMiddleware, logout);

router.get('/profile', authMiddleware, getProfile);
router.get('/users', authMiddleware, isAdmin, getUser);

export default router;
