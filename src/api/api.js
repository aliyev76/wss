import axios from 'axios';
import { refreshAuthToken } from './auth';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Timeout after 10 seconds
});

// Add request interceptor to include token
API.interceptors.request.use((config) => {
  const sessionId = sessionStorage.getItem('sessionId');
  const authKey = `auth_${sessionId}`;
  const userData = JSON.parse(sessionStorage.getItem(authKey));

  if (userData?.token) {
    config.headers.Authorization = `Bearer ${userData.token}`;
  }

  return config;
});

// Add response interceptor to handle 401 errors
API.interceptors.response.use(
  (response) => response, // Return response if no error
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const newToken = await refreshAuthToken();
        if (newToken) {
          // Update the token in the original request
          const sessionId = sessionStorage.getItem('sessionId');
          const authKey = `auth_${sessionId}`;
          const userData = JSON.parse(sessionStorage.getItem(authKey));

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return API(originalRequest); // Retry the request
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);

        // Clear session and redirect to login if refresh fails
        sessionStorage.clear();
        window.location.href = '/login';
      }
    }

    // For other errors, propagate the error
    return Promise.reject(error);
  }
);

export default API;

