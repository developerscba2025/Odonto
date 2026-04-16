import { Router } from 'express';
import { login, getMe, getProfessionals, updateProfile, createProfessional, updateProfessional } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';


const router = Router();

router.post('/login', login);
router.get('/me', authenticateJWT, getMe);
router.get('/professionals', authenticateJWT, getProfessionals);
router.put('/profile', authenticateJWT, updateProfile);
router.post('/professionals', authenticateJWT, requireRole('ADMIN'), createProfessional);
router.patch('/professionals/:id', authenticateJWT, requireRole('ADMIN'), updateProfessional);


export default router;
