import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/user');
          setUser(response.data);
        } catch (error) {
          console.error("Failed to fetch user", error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/login', { email, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post('/register', userData);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
