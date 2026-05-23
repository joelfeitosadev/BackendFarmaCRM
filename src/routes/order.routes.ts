import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';

const router = Router();
const controller = new OrderController();

router.post('/', controller.create);
router.get('/:id', controller.getById);
router.put('/:id/move', controller.move);
router.post('/:id/prescription', controller.addPrescription);

export default router;
