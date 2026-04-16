import { Router } from 'express';
import { getStats, getDailyAlert } from '../controllers/dashboardController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/stats', getStats);
router.get('/daily-alert', getDailyAlert);

export default router;
