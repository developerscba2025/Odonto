import { Router, IRouter } from 'express';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
} from '../controllers/patient.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router: IRouter = Router();

router.use(authMiddleware);

router.get('/', getAllPatients);
router.get('/:id', getPatientById);
router.post('/', createPatient);
router.patch('/:id', updatePatient);

export default router;
