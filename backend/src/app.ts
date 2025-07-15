import express from 'express';
import helmet from 'helmet';
import { corsMiddleware } from './middleware/cors';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import ordersRouter from './routes/orders';
import surveysRouter from './routes/surveys';
import masterDataRouter from './routes/masterData';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false // Allow iframe for PDF generation
}));

// CORS middleware
app.use(corsMiddleware);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'production-survey-backend'
  });
});

// API routes
app.use('/api/orders', ordersRouter);
app.use('/api/surveys', surveysRouter);
app.use('/api/master-data', masterDataRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Production 3.0 Survey Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      orders: '/api/orders',
      surveys: '/api/surveys',
      masterData: '/api/master-data'
    }
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;