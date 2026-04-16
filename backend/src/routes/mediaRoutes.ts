import { Router } from 'express';
import { uploadMiddleware, uploadFile } from '../controllers/mediaController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Middleware de autenticación global para archivos clínicos
router.use(authenticateJWT);

router.post('/upload', uploadMiddleware, uploadFile);

export default router;
