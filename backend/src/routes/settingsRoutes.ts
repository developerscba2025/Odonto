import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { getClinicSettings, updateClinicSettings } from '../controllers/settingsController';

const router = Router();

router.get('/clinic', authenticateJWT, getClinicSettings);
router.put('/clinic', authenticateJWT, requireRole(['ADMIN']), updateClinicSettings);

export default router;
