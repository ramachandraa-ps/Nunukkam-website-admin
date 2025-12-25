import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { User, LoginRequest, ChangePasswordRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (data: ForgotPasswordRequest) => Promise<{ success: boolean; message: string }>;
  verifyResetToken: (token: string) => Promise<boolean>;
  resetPassword: (token: string, data: ResetPasswordRequest) => Promise<{ success: boolean; message: string }>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from stored data
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();
        if (storedUser && authService.isAuthenticated()) {
          setUser(storedUser);
          // Optionally verify token by calling /me endpoint
          try {
            const response = await authService.me();
            if (response.success && response.data) {
              setUser(response.data.user);
            }
          } catch {
            // Token might be invalid, clear everything
            await authService.logout();
            setUser(null);
          }
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (data: LoginRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(data);

      if (response.success && response.data) {
        // Backend returns: { user: {...}, tokens: { accessToken, refreshToken } }
        setUser(response.data.user as User);
        return true;
      } else {
        setError(response.error?.message || 'Login failed');
        return false;
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      const errorMessage = axiosError.response?.data?.error?.message || 'Invalid credentials';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authService.changePassword(data);
      return { success: response.success, message: response.message || 'Password changed successfully' };
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      return {
        success: false,
        message: axiosError.response?.data?.error?.message || 'Failed to change password'
      };
    }
  }, []);

  const forgotPassword = useCallback(async (data: ForgotPasswordRequest): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authService.forgotPassword(data);
      return { success: true, message: response.message || 'Reset link sent if email exists' };
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      return {
        success: false,
        message: axiosError.response?.data?.error?.message || 'Failed to send reset link'
      };
    }
  }, []);

  const verifyResetToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await authService.verifyResetToken(token);
      return response.success;
    } catch {
      return false;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, data: ResetPasswordRequest): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await authService.resetPassword(token, data);
      return { success: response.success, message: response.message || 'Password reset successfully' };
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: { message?: string } } } };
      return {
        success: false,
        message: axiosError.response?.data?.error?.message || 'Failed to reset password'
      };
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authService.me();
      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch {
      // Silent fail
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    isLoading,
    error,
    login,
    logout,
    changePassword,
    forgotPassword,
    verifyResetToken,
    resetPassword,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
