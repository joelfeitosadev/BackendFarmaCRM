import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router = Router();
const controller = new ProductController();

// Static routes should go before dynamic routes
router.post('/process-abc', controller.processAbc);
router.get('/expiration-alerts', controller.getExpirationAlerts);
router.get('/restock', controller.getRestock);

// CRUD routes
router.post('/', controller.create);
router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.patch('/:id', controller.update);

export default router;
