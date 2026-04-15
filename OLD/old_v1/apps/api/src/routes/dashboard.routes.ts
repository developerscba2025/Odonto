import { Router, IRouter } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router: IRouter = Router();

router.get('/stats', authMiddleware, getDashboardStats);

export default router;
