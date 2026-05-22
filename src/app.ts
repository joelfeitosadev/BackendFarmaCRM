import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';

import { requestLogger } from './middlewares/requestLogger';

// Import Routes
import patientRoutes from './routes/patient.routes';
import productRoutes from './routes/product.routes';
import serviceRoutes from './routes/service.routes';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const swaggerDocument = YAML.load(path.join(__dirname, 'docs/swagger.yaml'));

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/patients', patientRoutes);
app.use('/products', productRoutes);
app.use('/services', serviceRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Global Error Handler
app.use(errorHandler);

export default app;
