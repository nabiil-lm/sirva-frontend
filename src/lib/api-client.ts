import axios from 'axios';
import Cookies from 'js-cookie';

// Ensure proper /api endpoint
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '') + '/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // CRITICAL: Allows cookies to be sent/received cross-origin
  withCredentials: true,
  // Django's default CSRF configuration
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// Request interceptor - add auth token and CSRF token
apiClient.interceptors.request.use(
  (config) => {
    // Manually ensure CSRF token is set from cookie if it exists
    const csrfToken = Cookies.get('csrftoken');
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    const token = Cookies.get('access_token');
    if (token) {
      // FIX: Django REST Framework TokenAuthentication expects "Token <token>"
      // NOT "Bearer <token>" (which is for JWT)
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token');
      // Only redirect if we are not already on the login page to avoid loops
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
