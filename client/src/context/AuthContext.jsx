import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Refs to prevent multiple simultaneous requests
  const authCheckInProgress = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    checkAuth();
    
    return () => {
      mounted.current = false;
    };
  }, []);

  const checkAuth = async () => {
    // Prevent multiple simultaneous auth checks
    if (authCheckInProgress.current) {
      return;
    }

    authCheckInProgress.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.getMe();
      if (mounted.current) {
        setUser(response.data);
      }
    } catch (error) {
      if (mounted.current) {
        setUser(null);
        setError(error.response?.data?.message || 'Authentication failed');
        // Clear invalid tokens from storage
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
        authCheckInProgress.current = false;
      }
    }
  };

  const register = async (userData) => {
    if (!mounted.current) return;

    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.register(userData);
      if (mounted.current) {
        setUser(response.data);
      }
      return response.data;
    } catch (error) {
      if (mounted.current) {
        setError(error.response?.data?.message || 'Registration failed');
      }
      throw error;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  const login = async (userData) => {
    if (!mounted.current) return;

    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(userData);
      if (mounted.current) {
        setUser(response.data);
      }
      return response.data;
    } catch (error) {
      if (mounted.current) {
        setError(error.response?.data?.message || 'Login failed');
      }
      throw error;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  };

  const logout = async () => {
    if (!mounted.current) return;

    setLoading(true);

    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      if (mounted.current) {
        setUser(null);
        setLoading(false);
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();
      }
    }
  };

  const googleAuth = () => {
    authAPI.googleAuth();
  };

  // Safe version of checkAuth that can be called externally
  const safeCheckAuth = async () => {
    if (!authCheckInProgress.current && mounted.current) {
      await checkAuth();
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    googleAuth,
    checkAuth: safeCheckAuth // Provide the safe version
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};