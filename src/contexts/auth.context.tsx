'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userRole: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine role based on email - Moved up for use in useEffect
  const extractRoleFromEmail = (email: string): string | null => {
    const lowerEmail = email.toLowerCase();
    
    if (lowerEmail.includes('so@') || lowerEmail.includes('officer')) {
      return 'security_officer';
    }
    if (lowerEmail.includes('am@') || lowerEmail.includes('manager')) {
      return 'application_manager';
    }
    
    return null;
  };

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('access_token');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch user details to restore role and profile
        const authService = (await import('@/services/auth.service')).default;
        const userData = await authService.getMe();
        
        setUser(userData);
        
        if (userData.role) {
          setUserRole(userData.role);
        } else if (userData.email) {
          setUserRole(extractRoleFromEmail(userData.email));
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to restore session:', error);
        // If token is invalid (e.g. expired), clear it
        Cookies.remove('access_token');
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const authService = (await import('@/services/auth.service')).default;
      const response = await authService.login({ email, password });
      
      Cookies.set('access_token', response.token, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax', // Changed from strict to Lax for better dev experience
      });

      setUser(response.user || null);
      
      if (response.user?.role) {
        setUserRole(response.user.role);
      } else {
        setUserRole(extractRoleFromEmail(email));
      }
      
      setIsAuthenticated(true);
    } catch (err: unknown) {
      // Handle both Error objects and our custom AuthError object
      let errorMessage = 'Login failed. Please try again.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = (err as { message: string }).message;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const authService = (await import('@/services/auth.service')).default;
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      Cookies.remove('access_token');
      setUser(null);
      setUserRole(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        userRole,
        isLoading,
        login,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
