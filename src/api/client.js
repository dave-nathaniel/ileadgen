import axios from 'axios';
import { storage } from '../utils/storage';
import { API_BASE_URL } from '../utils/constants';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
client.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh and insufficient credits
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 402 - Insufficient Credits
    if (error.response?.status === 402) {
      window.dispatchEvent(new CustomEvent('insufficient-credits', {
        detail: error.response.data?.detail,
      }));
      return Promise.reject(error);
    }

    // If 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = storage.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });

          const { access_token, refresh_token } = response.data;
          storage.setToken(access_token);
          storage.setRefreshToken(refresh_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear auth and redirect to login
          storage.clearAuth();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        storage.clearAuth();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default client;
