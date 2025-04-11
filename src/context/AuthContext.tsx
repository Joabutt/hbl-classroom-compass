
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  accessToken?: string; // Added for Google Classroom API access
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  accessToken: string | null; // Added to expose the accessToken
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Google OAuth Client ID
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; // Replace with your Google Client ID

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('hbl-classroom-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setAccessToken(parsedUser.accessToken || null);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('hbl-classroom-user');
      }
    }
    setIsLoading(false);

    // Load the Google API client
    const loadGoogleApi = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    };

    loadGoogleApi();
  }, []);

  const login = async () => {
    setIsLoading(true);
    try {
      // Initialize Google Identity Services
      if (!window.google) {
        toast({
          title: "Google API not loaded",
          description: "Please try again in a few seconds.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const handleCredentialResponse = async (response: any) => {
        try {
          // Decode the JWT token to get user info
          const token = response.credential;
          const decodedToken = JSON.parse(atob(token.split('.')[1]));
          
          const googleUser: User = {
            id: decodedToken.sub,
            name: decodedToken.name,
            email: decodedToken.email,
            photoUrl: decodedToken.picture,
            accessToken: token
          };
          
          setUser(googleUser);
          setAccessToken(token);
          localStorage.setItem('hbl-classroom-user', JSON.stringify(googleUser));
          
          toast({
            title: "Logged in successfully",
            description: `Welcome, ${googleUser.name}!`,
          });
        } catch (error) {
          console.error('Error processing Google response:', error);
          toast({
            title: "Login failed",
            description: "Could not process Google login response.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        scope: 'email profile https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.announcements.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly',
      });

      // Render Google Sign-In button
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Try to render the Google Sign-In manually
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button')!, 
            { theme: 'outline', size: 'large', width: 380 }
          );
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Login initialization failed:', error);
      toast({
        title: "Login failed",
        description: "There was a problem initializing Google login.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('hbl-classroom-user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, accessToken }}>
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

// Add Google's type definitions
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}
