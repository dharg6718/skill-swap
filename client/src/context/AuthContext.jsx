import { createContext, useState, useEffect } from 'react';
import { getMe, login as apiLogin, register as apiRegister } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await getMe();
          if (res.success) {
            setUser(res.data?.user || res.data);
            setIsAuthenticated(true);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Auth error', error);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    if (res.success) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data?.user || res.data);
      setIsAuthenticated(true);
    }
    return res;
  };

  const register = async (data) => {
    const res = await apiRegister(data);
    if (res.success) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data?.user || res.data);
      setIsAuthenticated(true);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
