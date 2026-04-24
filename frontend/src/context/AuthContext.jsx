import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'pc_token';
const USER_KEY  = 'pc_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });

  const login = (newToken, userData) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  // Call after trust level changes (email verification, transaction completion)
  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    try {
      const data = await authApi.me();
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
    } catch { /* token expired — leave state as-is */ }
  }, []);

  // Sync user data if token changes externally (e.g. another tab)
  useEffect(() => {
    const sync = () => {
      const t = localStorage.getItem(TOKEN_KEY);
      if (!t) { setToken(null); setUser(null); }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, refreshUser, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
