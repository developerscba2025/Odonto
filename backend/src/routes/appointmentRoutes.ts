import { Router } from 'express';
import { 
  getAllAppointments, 
  createAppointment, 
  updateAppointment, 
  deleteAppointment 
} from '../controllers/appointmentController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAllAppointments);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
