
import { createContext } from 'react';
import { AuthProvider } from './AuthContext.jsx';

export const AuthContext = createContext({ user: null, setUser: () => {} });
export { AuthProvider };
