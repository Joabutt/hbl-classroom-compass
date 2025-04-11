
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('hbl-classroom-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('hbl-classroom-user');
      }
    }
    setIsLoading(false);
  }, []);

  // In a real app, this would use the Google OAuth API
  // For now, we'll simulate the login with mock data
  const login = async () => {
    setIsLoading(true);
    try {
      // This is where we would integrate with actual Google Auth
      // For now, we'll use mock data
      const mockUser: User = {
        id: 'user123',
        name: 'Demo User',
        email: 'user@example.com',
        photoUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=4285F4&color=fff',
      };
      
      setUser(mockUser);
      localStorage.setItem('hbl-classroom-user', JSON.stringify(mockUser));
      
      toast({
        title: "Logged in successfully",
        description: `Welcome, ${mockUser.name}!`,
      });
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Login failed",
        description: "There was a problem logging in with Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hbl-classroom-user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
