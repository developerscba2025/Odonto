import { Router } from 'express';
import { 
  getHistoryByPatient, 
  createEvolution, 
  getTreatmentPlans, 
  createTreatmentPlan,
  updateTreatmentPlan 
} from '../controllers/clinicalController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/patient/:patientId', getHistoryByPatient);
router.post('/', createEvolution);
router.get('/patient/:patientId/plans', getTreatmentPlans);
router.post('/plans', createTreatmentPlan);
router.put('/plans/:id', updateTreatmentPlan);

export default router;
