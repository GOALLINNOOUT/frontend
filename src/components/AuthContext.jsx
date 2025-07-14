

import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { get } from '../utils/api';


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Try to fetch user from backend session or localStorage
    const token = localStorage.getItem('token');
    if (token) {
      get('/users/me', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => {
          if (res && res.data && res.data.email) setUser(res.data);
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
