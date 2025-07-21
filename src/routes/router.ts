import { Router, Response, Request } from 'express';
import { authMiddleware, isAdmin } from '../middleware/auth.middleware';
import userConrtoller from '../controllers/user.controller';
import authController from '../controllers/auth.controller';
import jobController from '../controllers/job.controller';
import statusController from '../controllers/status.controller';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/refresh-token', authController.refreshToken);
router.delete('/logout', authController.logout);

router.get('/profile', authMiddleware, userConrtoller.getProfile);
router.get('/users', authMiddleware, isAdmin, userConrtoller.getUser);

// Job routes
router.get('/jobs', authMiddleware, jobController.getJobs);
router.get('/job/:jobId', authMiddleware, jobController.jobDetails);
router.post('/job', authMiddleware, jobController.submitJob);
router.put('/job/:jobId', authMiddleware, jobController.submitJob);
router.delete('/job/:jobId', authMiddleware, jobController.deleteJob);

router.get('/job-status/:statusId', authMiddleware, statusController.detailStatus);
router.post('/job-status/:jobId', authMiddleware, statusController.submitStatus);
router.put('/job-status/:jobId', authMiddleware, statusController.submitStatus);
router.delete('/job-status', authMiddleware, statusController.deleteStatus);

export default router;
