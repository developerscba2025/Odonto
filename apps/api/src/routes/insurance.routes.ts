import { Router } from 'express';
import { getInsurances, createProvider, createPlan, deleteProvider, deletePlan } from '../controllers/insurance.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', getInsurances);
router.post('/providers', createProvider);
router.post('/plans', createPlan);
router.delete('/providers/:id', deleteProvider);
router.delete('/plans/:id', deletePlan);

export default router;
