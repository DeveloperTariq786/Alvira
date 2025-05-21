/**
 * Application configuration based on environment
 */

const environments = {
  development: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    cacheDuration: 5 * 60 * 1000, // 5 minutes
  },
  test: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    cacheDuration: 0, // No caching in test
  },
  production: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || '/api', // In production, use relative URL to same domain
    cacheDuration: 15 * 60 * 1000, // 15 minutes
  }
};

// Default to development if not defined
const environment = process.env.NEXT_PUBLIC_APP_ENV || 'development';

// Export the config for the current environment
export default environments[environment] || environments.development;

// Helper function to log based on environment
export const logger = {
  log: (...args) => {
    if (environment !== 'production') {
      console.log(...args);
    }
  },
  error: (...args) => {
    console.error(...args);
  },
  warn: (...args) => {
    console.warn(...args);
  },
  info: (...args) => {
    if (environment !== 'production') {
      console.info(...args);
    }
  }
}; 