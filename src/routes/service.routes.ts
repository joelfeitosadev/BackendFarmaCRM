import { Router } from 'express';
import { ServiceController } from '../controllers/service.controller';

const router = Router();
const controller = new ServiceController();

router.post('/', controller.create);
router.get('/:id', controller.getById);
router.put('/:id/move', controller.move);
router.post('/:id/prescription', controller.addPrescription);

export default router;
