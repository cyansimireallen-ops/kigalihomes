import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const token = localStorage.getItem('kh_token');
    const isAdminToken = localStorage.getItem('kh_scope') === 'admin';
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/users/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('kh_token');
        localStorage.removeItem('kh_scope');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, []);

  const login = (token, userData, scope = 'user') => {
    localStorage.setItem('kh_token', token);
    localStorage.setItem('kh_scope', scope);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('kh_token');
    localStorage.removeItem('kh_scope');
    setUser(null);
  };

  const updateUser = (userData) => setUser(userData);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
