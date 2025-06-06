import axios from 'axios';

// Use Vite environment variables (VITE_ prefix for client-side)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export const sustainabilityAPI = {
  calculateIndex: (data) => api.post('/api/calculate', data),
  getIndicators: () => api.get('/api/indicators'),
  getExample: () => api.get('/api/example'),
  getWeights: () => api.get('/api/weights'),
  healthCheck: () => api.get('/health'),
  analyzeArea: (data) => api.post('/api/geographic/analyze-area', data),
  calculateWithMap: (data) => api.post('/api/geographic/calculate-with-map', data),
  checkGEEStatus: () => api.get('/api/geographic/gee-status'),
};

export default api;