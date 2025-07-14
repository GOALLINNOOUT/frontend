

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
          console.log('AuthProvider /users/me response:', res);
          // Fix: backend returns { data: { ...user } }
          const userObj = res && res.data && res.data.data;
          if (userObj && userObj.email) setUser(userObj);
          else setUser(null);
        })
        .catch((err) => {
          console.error('AuthProvider /users/me error:', err);
          setUser(null);
        });
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
