import { Router, Response, Request } from 'express';
import { isAuthenticated, isAdmin, verifyRToken } from '../middleware/auth.middleware';
import userConrtoller from '../controllers/user.controller';
import authController from '../controllers/auth.controller';
import jobController from '../controllers/job.controller';
import statusController from '../controllers/status.controller';
import dashboardController from '../controllers/dashboard.controller';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
  });
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/refresh-token', verifyRToken, authController.refreshToken);
router.delete('/logout', verifyRToken, authController.logout);

router.get('/profile', isAuthenticated, userConrtoller.getProfile);
router.get('/users', isAuthenticated, isAdmin, userConrtoller.getUser);

// Job routes
router.get('/jobs', isAuthenticated, jobController.getJobs);
router.get('/job/:jobId', isAuthenticated, jobController.jobDetails);
router.post('/job', isAuthenticated, jobController.submitJob);
router.put('/job/:jobId', isAuthenticated, jobController.submitJob);
router.delete('/job/:jobId', isAuthenticated, jobController.deleteJob);

router.get('/job-status/:statusId', isAuthenticated, statusController.detailStatus);
router.post('/job-status/:jobId', isAuthenticated, statusController.submitStatus);
router.put('/job-status/:jobId', isAuthenticated, statusController.submitStatus);
router.delete('/job-status', isAuthenticated, statusController.deleteStatus);

router.get('/dashboard', isAuthenticated, dashboardController.index);
router.get('/dashboard/chart', isAuthenticated, dashboardController.chartData);

export default router;
