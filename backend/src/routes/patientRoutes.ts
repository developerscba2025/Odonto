import { Router } from 'express';
import { 
  getAllPatients, 
  getPatientById, 
  createPatient, 
  updatePatient, 
  deletePatient 
} from '../controllers/patientController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT); // Proteger todas las rutas de pacientes

router.get('/', getAllPatients);
router.get('/:id', getPatientById);
router.post('/', createPatient);
router.put('/:id', updatePatient);
router.delete('/:id', deletePatient);

export default router;
