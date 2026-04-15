import { Router, IRouter } from 'express';
import { login, register, getMe, getProfessionals } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router: IRouter = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authMiddleware, getMe);
router.get('/professionals', authMiddleware, getProfessionals);

export default router;
