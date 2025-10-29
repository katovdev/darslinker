// API Configuration for different environments
export const getApiUrl = () => {
  // Check if we're in development (localhost)
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (isDevelopment) {
    // Use local backend in development
    return 'http://localhost:5002/api';
  } else {
    // Use production backend in production
    return 'https://darslinker-7.onrender.com/api';
  }
};

// Export the API URL
export const API_URL = getApiUrl();