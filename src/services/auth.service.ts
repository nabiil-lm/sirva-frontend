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
    first_name?: string; // Changed from name
    last_name?: string;  // Added last_name
    role?: string;
    avatar?: string;
    preferences?: {
      darkMode?: boolean;
      emailNotifs?: boolean;
      securityAlerts?: boolean;
      language?: string;
    };
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'AM' | 'SO';
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
  preferences?: Record<string, string | number | boolean | null>;
  avatar?: File;
}

export interface ChangePasswordRequest {
  new_password: string;
  re_new_password: string;
  current_password: string;
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

  async register(data: RegisterRequest): Promise<void> {
    try {
      // Use default apiClient which points to /api
      // This will result in POST /api/auth/users/ which matches Djoser endpoint
      await apiClient.post(
        'auth/users/', 
        data
      );
    } catch (error: unknown) {
      console.error('Registration error details:', error);
      
      const axiosError = error as AxiosError;
      const errorData = axiosError.response?.data as ErrorResponse | undefined;
      
      // Debug log to see the exact validation error from backend
      if (errorData) {
        console.error('Validation Errors:', JSON.stringify(errorData, null, 2));
      }
      
      let message = 'Registration failed. Please try again.';
      const statusCode = axiosError.response?.status || 500;

      if (errorData) {
        // Extract field-specific errors if available
        if (Array.isArray(errorData)) {
            message = errorData[0];
        } else {
            if (errorData.email) message = `Email: ${Array.isArray(errorData.email) ? errorData.email[0] : errorData.email}`;
            else if (errorData.password) message = `Password: ${Array.isArray(errorData.password) ? errorData.password[0] : errorData.password}`;
            else if (errorData.non_field_errors) message = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors;
            else if (typeof errorData === 'string') message = errorData;
            // Handle array of errors for other fields
            else {
               const firstKey = Object.keys(errorData)[0];
               if (firstKey) {
                   const val = errorData[firstKey];
                   message = `${firstKey}: ${Array.isArray(val) ? val[0] : val}`;
               }
            }
        }
      }

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

  async updateProfile(data: UpdateProfileRequest): Promise<Record<string, unknown>> {
    const formData = new FormData();
    if (data.first_name) formData.append('first_name', data.first_name);
    if (data.last_name) formData.append('last_name', data.last_name);
    if (data.email) formData.append('email', data.email);
    if (data.preferences) formData.append('preferences', JSON.stringify(data.preferences));
    if (data.avatar) formData.append('avatar', data.avatar);

    const response = await apiClient.patch('/auth/users/me/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiClient.post('/auth/users/set_password/', data);
  }
}

const authService = new AuthService();
export default authService;
