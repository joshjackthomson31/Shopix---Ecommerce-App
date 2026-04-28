/**
 * Client configuration
 * Centralized config with defaults
 * 
 * In Vite, env variables must be prefixed with VITE_
 * Access via: import.meta.env.VITE_VARIABLE_NAME
 */
const config = {
  // API
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  
  // Server URL for images (uploaded files)
  serverUrl: import.meta.env.VITE_SERVER_URL || 'http://localhost:5000',

  // App
  appName: import.meta.env.VITE_APP_NAME || 'E-Commerce Store',
  
  // Pagination defaults
  itemsPerPage: 12,

  // Environment
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

export default config;
