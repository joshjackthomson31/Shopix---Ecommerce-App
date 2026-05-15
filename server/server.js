// Import dependencies
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import config from './config/index.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Import error handler
import { notFound, errorHandler } from './middleware/errorHandler.js';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connectDB();

// Create Express app
const app = express();

// ============ MIDDLEWARE ============
// Middleware are functions that run BEFORE your routes

// Set secure HTTP headers — allow images from Unsplash and self (uploaded files)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://images.unsplash.com'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Enable CORS — restrict to the configured frontend origin (never allow all in production)
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Parse JSON bodies — limit size to prevent large-payload DoS attacks
app.use(express.json({ limit: '10kb' }));

// Serve uploaded files as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============ ROUTES ============

// Test route - just to check if server is working (only in development)
if (config.isDev) {
  app.get('/', (req, res) => {
    res.json({
      message: 'E-Commerce API is running!',
      version: '1.0.0'
    });
  });
}

// Health check endpoint — used by deployment platforms to verify the app is alive
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (register, login)
app.use('/api/auth', authRoutes);

// Product routes (CRUD)
app.use('/api/products', productRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// Upload route (for product images)
app.use('/api/upload', uploadRoutes);

// ============ PRODUCTION — SERVE REACT BUILD ============
// In production, Express serves the React frontend (no separate Vite dev server)
if (config.isProd) {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Any route that isn't an API route → serve React's index.html (for client-side routing)
  // Express 5 requires named wildcard parameter instead of bare '*'
  app.get('{*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// ============ ERROR HANDLING ============
// Must be after all routes

// Handle 404 - Route not found
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============ START SERVER ============
app.listen(config.port, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
});
