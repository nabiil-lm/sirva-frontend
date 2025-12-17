import apiClient from '@/lib/api-client';
import { AxiosError } from 'axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
}

export interface AuthError {
  message: string;
  statusCode: number;
}

interface ErrorResponse {
  detail?: string;
  message?: string;
  non_field_errors?: string[];
  [key: string]: string | string[] | undefined;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('Logging in with:', credentials.email);
      
      const payload = {
        email: credentials.email,
        password: credentials.password
      };

      // Calculate root URL (remove /api from the end) to target /auth/login/
      // This ensures we hit http://localhost:8080/auth/login/ instead of http://localhost:8080/api/auth/login/
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
      const rootUrl = apiUrl.replace(/\/api\/?$/, '/');

      const response = await apiClient.post<LoginResponse>(
        'auth/login/', 
        payload,
        { baseURL: rootUrl }
      );
      
      // CRITICAL FIX: Validate that we actually got a token
      if (!response.data || !response.data.token) {
        throw { 
          message: 'Invalid server response. Please check your connection.', 
          statusCode: 500 
        };
      }
      
      console.log('Login response:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('Login error details:', error);
      
      // Check if it's our custom error object
      const customError = error as Record<string, unknown>;
      if (customError && customError.message && customError.statusCode) {
        throw customError;
      }

      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as ErrorResponse | undefined;
      
      let message = 'Login failed. Please try again.';
      
      // Robust error extraction for Django DRF
      if (errorData) {
        if (typeof errorData === 'string') {
            // Handle HTML response (e.g. 500 error page)
            message = `Server Error (${axiosError.response?.status})`;
        } else if (errorData.detail) {
            message = errorData.detail;
        } else if (errorData.message) {
            message = errorData.message;
        } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
            message = errorData.non_field_errors[0];
        } else {
            // Try to find the first error message in a field error dictionary
            const firstKey = Object.keys(errorData)[0];
            if (firstKey && Array.isArray(errorData[firstKey])) {
                message = `${firstKey}: ${errorData[firstKey][0]}`;
            } else if (firstKey && typeof errorData[firstKey] === 'string') {
                message = errorData[firstKey];
            }
        }
      } else if (axiosError.message) {
        message = axiosError.message;
      }
      
      const statusCode = axiosError.response?.status || 500;
      throw { message, statusCode } as AuthError;
    }
  }

  async logout(): Promise<void> {
    try {
      // Optional: Call backend logout if needed
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getMe() {
    try {
      const response = await apiClient.get('/auth/users/me/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

const authService = new AuthService();
export default authService;
