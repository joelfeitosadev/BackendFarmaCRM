import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';

const router = Router();
const patientController = new PatientController();

// Static routes BEFORE /:id to avoid route conflict
router.get('/churn', patientController.getChurn);
router.get('/continuous-use', patientController.getContinuousUse);

router.post('/', patientController.create);
router.get('/', patientController.getAll);
router.get('/:id', patientController.getById);
router.patch('/:id', patientController.update);
router.put('/:id/consent', patientController.updateConsent);
router.get('/:id/ltv', patientController.getLtv);

export default router;
