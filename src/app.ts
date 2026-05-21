import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';

// Import Routes
import patientRoutes from './routes/patient.routes';
import productRoutes from './routes/product.routes';
import serviceRoutes from './routes/service.routes';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/patients', patientRoutes);
app.use('/products', productRoutes);
app.use('/services', serviceRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
