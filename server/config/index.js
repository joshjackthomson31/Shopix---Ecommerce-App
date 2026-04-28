import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Server configuration
 * Centralized config with defaults
 */
const config = {
  // Server
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',

  // Database
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
  jwtExpire: process.env.JWT_EXPIRE || '30d',

  // Upload
  uploadDir: 'uploads',
  maxFileSize: 5 * 1024 * 1024, // 5MB

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};

// Validate required config in production
if (config.isProd) {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export default config;
