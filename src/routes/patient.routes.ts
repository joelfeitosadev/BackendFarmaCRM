import { Router } from 'express';
import { PatientController } from '../controllers/patient.controller';

const router = Router();
const patientController = new PatientController();

router.post('/', patientController.create);
router.get('/', patientController.getAll);
router.get('/:id', patientController.getById);
router.patch('/:id', patientController.update);

export default router;
