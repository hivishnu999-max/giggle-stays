import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) return setReady(true);
    api.me().then((r) => setUser(r.user)).catch(() => setToken(null)).finally(() => setReady(true));
  }, []);

  const finish = ({ token, user }) => {
    setToken(token);
    setUser(user);
    return user;
  };

  const value = {
    user,
    ready,
    login: async (email, password) => finish(await api.login({ email, password })),
    register: async (form) => finish(await api.register(form)),
    logout: () => { setToken(null); setUser(null); },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
