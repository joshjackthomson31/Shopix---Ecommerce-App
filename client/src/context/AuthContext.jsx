import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';
import catchAsync from '../utils/catchAsync';
import safeParse from '../utils/safeParse';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage synchronously — avoids flicker on load
  const [user, setUser] = useState(() => safeParse('user'));

  // Track whether the token has been validated against the server
  const [authChecked, setAuthChecked] = useState(false);

  // On mount: silently validate the stored token with the server
  // If the token is expired or invalid, auto-logout to clear the stale session
  useEffect(() => {
    const validateToken = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setAuthChecked(true);
        return;
      }

      const result = await catchAsync(() => authService.getProfile())();
      if (!result.success) {
        // Token is invalid or expired — clear everything
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('cartItems');
      }
      setAuthChecked(true);
    };

    validateToken();
  }, []);

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

  // Logout user — also clear cart so it doesn't carry over to another user
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('cartItems');
  };

  const value = {
    user,
    authChecked,  // true once the server token validation has resolved
    register,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
