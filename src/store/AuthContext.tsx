import * as authApi from '@/lib/api/auth';
import { AuthUser } from '@/lib/api/auth';
import { ApiError } from '@/lib/apiClient';
import { clearToken, getToken, setToken } from '@/lib/tokenStorage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextData {
  user: AuthUser | null;
  isLoading: boolean; // true while checking for an existing session on app start
  login: (email: string, password: string) => Promise<void>;
  signup: (input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app start, check if we already have a valid token saved from a
  // previous session and restore the user without asking them to log in again.
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) {
          setIsLoading(false);
          return;
        }
        const result = await authApi.validateToken();
        setUser(result.user);
      } catch (err) {
        // Token missing/expired/invalid - clear it and require login
        await clearToken();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    await setToken(result.token);
    setUser(result.user);
  };

  const signup = async (input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    const result = await authApi.signup(input);
    await setToken(result.token);
    setUser(result.user);
  };

  const logout = async () => {
    await clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { ApiError };
