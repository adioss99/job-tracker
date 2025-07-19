import { Router, Response, Request } from 'express';
import { authMiddleware, isAdmin } from '../middleware/auth.middleware'; 
import { getUser, getProfile } from '../controllers/user.controller';
import { register, login, refreshToken, logout } from '../controllers/auth.controller';
import jobController from '../controllers/job.controller';

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

// Job routes
router.get('/jobs', authMiddleware, jobController.getJob);
router.get('/job/:jobId', authMiddleware, jobController.jobDetails);
router.post('/job/:method', authMiddleware, jobController.submitJob);
router.put('/job/:method/:jobId', authMiddleware, jobController.submitJob);
router.delete('/job/:jobId', authMiddleware, jobController.deleteJob);

export default router;
