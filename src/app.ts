import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';

import { requestLogger } from './middlewares/requestLogger';

import patientRoutes from './routes/patient.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const swaggerDocument = YAML.load(path.join(__dirname, 'docs/swagger.yaml'));

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/patients', patientRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(errorHandler);

export default app;
