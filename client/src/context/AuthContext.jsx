import { createContext, useContext, useState } from 'react';
import { authService } from '../services';
import catchAsync from '../utils/catchAsync';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage synchronously (no useEffect needed)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Register user (never throws - returns { success, data/error })
  const register = async (name, email, password) => {
    const result = await catchAsync(() => 
      authService.register({ name, email, password })
    )();

    if (result.success) {
      setUser(result.data);
      localStorage.setItem('user', JSON.stringify(result.data));
    }

    return result;
  };

  // Login user (never throws - returns { success, data/error })
  const login = async (email, password) => {
    const result = await catchAsync(() => 
      authService.login({ email, password })
    )();

    if (result.success) {
      setUser(result.data);
      localStorage.setItem('user', JSON.stringify(result.data));
    }

    return result;
  };

  // Logout user
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    loading: false, // No async loading needed - initialized from localStorage
    register,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
