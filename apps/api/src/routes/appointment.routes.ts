import { Router, IRouter } from 'express';
import { 
  getAllAppointments, 
  createAppointment, 
  updateAppointment, 
  deleteAppointment 
} from '../controllers/appointment.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router: IRouter = Router();

router.use(authMiddleware);

router.get('/', getAllAppointments);
router.post('/', createAppointment);
router.patch('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
