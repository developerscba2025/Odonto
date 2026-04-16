import { Router } from 'express';
import { 
  getHistoryByPatient, 
  createEvolution, 
  getTreatmentPlans, 
  createTreatmentPlan 
} from '../controllers/clinicalController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/patient/:patientId', getHistoryByPatient);
router.post('/', createEvolution);
router.get('/patient/:patientId/plans', getTreatmentPlans);
router.post('/plans', createTreatmentPlan);

export default router;
