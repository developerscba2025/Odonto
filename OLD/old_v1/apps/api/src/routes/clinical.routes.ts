import { Router } from 'express';
import { 
  getToothConditions, 
  upsertToothCondition, 
  getAttachments, 
  createAttachment, 
  deleteAttachment 
} from '../controllers/clinical.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

// Odontogram
router.get('/patients/:patientId/odontogram', getToothConditions);
router.post('/patients/:patientId/odontogram', upsertToothCondition);

// Attachments
router.get('/patients/:patientId/attachments', getAttachments);
router.post('/patients/:patientId/attachments', createAttachment);
router.delete('/attachments/:id', deleteAttachment);

export default router;
