import { Router } from 'express';
import { getAbsences, createAbsence, deleteAbsence } from '../controllers/absence.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getAbsences);
router.post('/', createAbsence);
router.delete('/:id', deleteAbsence);

export default router;
