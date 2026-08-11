import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

const DEMO_USER = {
  id: 1,
  email: 'traveler@tripnest.com',
  firstName: 'Jane',
  lastName: 'Traveler',
  role: 'TRAVELER',
  phone: '+1-555-0101',
  _demo: true
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        setUser(DEMO_USER);
      }
    } else {
      setUser(DEMO_USER);
    }
    setLoading(false);

    autoLoginIfNeeded();
  }, []);

  const autoLoginIfNeeded = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      try {
        const response = await api.post('/auth/login', {
          email: 'traveler@tripnest.com',
          password: 'traveler123'
        });
        const { token: newToken, ...userData } = response.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch (e) {
        // Backend not ready yet, keep demo user
      }
    }
  };

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, ...userData } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return response.data;
  };

  const register = async (firstName, lastName, email, password, phone) => {
    const response = await api.post('/auth/register', { firstName, lastName, email, password, phone });
    const { token, ...userData } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(DEMO_USER);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
