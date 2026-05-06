import express from 'express';
import routes from './routes/index.js';
import { corsMiddleware } from './middleware/cors.middleware.js';
import { requestLogger } from './middleware/logger.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { setupSwagger } from './swagger/swagger.js';
import e from 'express';

const app = express();

// Core middlewares
app.use(corsMiddleware);
app.use(express.json());

// Logging
app.use(requestLogger);

// Basic route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Payment Processing System API',
    data: null,
    error: null,
  });
});

// Swagger documentation
setupSwagger(app);

// Routes
app.use('/api/v1', routes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    data: null,
    error: {
      code: 'NOT_FOUND',
    },
  });
});

// Error handler
app.use(errorMiddleware);

export default app;
