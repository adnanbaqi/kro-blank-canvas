import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { email: string; password: string; mc_name: string; hometown?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userInfo = localStorage.getItem('userInfo');

      if (!token || !userInfo) {
        setIsLoading(false);
        return;
      }

      if (token === 'guest') {
        const guestUser = JSON.parse(userInfo);
        setUser(guestUser);
        setIsLoading(false);
        return;
      }

      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking auth status:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('userInfo', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: { email: string; password: string; mc_name: string; hometown?: string }) => {
    try {
      const response = await apiService.register(userData);
      localStorage.setItem('authToken', response.access_token);
      localStorage.setItem('userInfo', JSON.stringify(response.user));
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/login');
  };

  const refreshUser = async () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return;

      const parsedUser = JSON.parse(userInfo);
      const updatedUser = await apiService.getCurrentUser(parsedUser.id);
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const isGuest = localStorage.getItem('authToken') === 'guest';

  const value = {
    user,
    isAuthenticated: !!user,
    isGuest,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
