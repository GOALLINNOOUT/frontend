

import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import api from '../utils/api';


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Try to fetch user from backend session or localStorage
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/api/users/me', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => {
          if (res && res.email) setUser(res);
          else setUser(null);
        })
        .catch(() => setUser(null));
    } else {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
