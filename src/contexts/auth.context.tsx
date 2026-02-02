'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  avatar?: string;
  preferences?: {
    darkMode?: boolean;
    emailNotifs?: boolean;
    securityAlerts?: boolean;
    language?: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userRole: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>; // Added refreshUser method
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

  // Helper to fetch user data
  const fetchUserData = async () => {
    const authService = (await import('@/services/auth.service')).default;
    const userData = await authService.getMe();
    
    setUser(userData);
    
    // Store user ID for theme persistence
    if (userData.id) {
      localStorage.setItem('current_user_id', userData.id);
    }
    
    if (userData.role) {
      setUserRole(userData.role);
    } else if (userData.email) {
      setUserRole(extractRoleFromEmail(userData.email));
    }
    return userData;
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
        await fetchUserData();
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

  // Theme Management Effect - Load user's personal theme preference
  useEffect(() => {
    if (user?.id) {
      const userTheme = localStorage.getItem(`theme_${user.id}`);
      if (userTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // No user logged in, force light mode
      document.documentElement.classList.remove('dark');
    }
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const authService = (await import('@/services/auth.service')).default;
      const response = await authService.login({ email, password });
      
      console.log('[AuthContext] Login response:', { user: response.user, hasAvatar: !!response.user?.avatar });
      
      Cookies.set('access_token', response.token, {
        expires: 7,
        //secure: process.env.NODE_ENV === 'production',
        secure: false, // Keep false for non-HTTPS dev/staging

        sameSite: 'Lax',
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

  // ADD this new function to properly refresh user data
  const refreshUser = useCallback(async () => {
    console.log('[AuthContext] refreshUser called');
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        console.log('[AuthContext] No token found, cannot refresh');
        return;
      }

      // Fetch updated user data from backend
      const authService = (await import('@/services/auth.service')).default;
      const response = await authService.getCurrentUser();
      console.log('[AuthContext] User data refreshed:', { 
        email: response.email, 
        avatar: response.avatar,
        fullAvatarUrl: response.avatar ? (response.avatar.startsWith('http') ? response.avatar : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')}${response.avatar}`) : null
      });
      
      setUser(response);
    } catch (error) {
      console.error('[AuthContext] Failed to refresh user:', error);
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
      
      // Clear user-specific data
      localStorage.removeItem('current_user_id');
      
      // Force light mode on logout
      document.documentElement.classList.remove('dark');
      
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
        refreshUser,
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
