import cors from 'cors';

// CORS configuration for local development
export const corsMiddleware = cors({
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://127.0.0.1:5173',
    'http://localhost:3000', // Alternative ports
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
});