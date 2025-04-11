
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  accessToken?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Google OAuth Client ID - REPLACE THIS WITH YOUR ACTUAL CLIENT ID
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";

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
        // Make sure we're explicitly setting the access token
        if (parsedUser.accessToken) {
          setAccessToken(parsedUser.accessToken);
        } else {
          // If no token in stored user, clear the storage to force re-login
          localStorage.removeItem('hbl-classroom-user');
          setUser(null);
        }
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
      
      // Add a load event listener to verify the script loaded
      script.onload = () => {
        console.log("Google Identity Services script loaded successfully");
      };
      
      script.onerror = () => {
        console.error("Failed to load Google Identity Services script");
        toast({
          title: "Failed to load Google Sign-In",
          description: "Please check your internet connection and try again.",
          variant: "destructive",
        });
      };
    };

    loadGoogleApi();
  }, [toast]);

  const login = async () => {
    setIsLoading(true);
    try {
      console.log("Starting Google login process...");
      
      // Initialize Google Identity Services
      if (!window.google) {
        console.error("Google API not loaded. The google object is not available.");
        toast({
          title: "Google API not loaded",
          description: "Please try again in a few seconds.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Create promise to handle the Google Sign-In flow
      const tokenPromise = new Promise<string>((resolve, reject) => {
        const handleCredentialResponse = (response: any) => {
          console.log("Received credential response from Google");
          if (response && response.credential) {
            resolve(response.credential);
          } else {
            reject(new Error('Google authentication failed - no credential in response'));
          }
        };

        // These scopes are required for Google Classroom API
        const scopes = [
          'email', 
          'profile', 
          'https://www.googleapis.com/auth/classroom.courses.readonly',
          'https://www.googleapis.com/auth/classroom.announcements.readonly',
          'https://www.googleapis.com/auth/classroom.coursework.me.readonly'
        ].join(' ');

        // Initialize Google Sign-In
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            scope: scopes,
          });
          console.log("Google Sign-In initialized with scopes:", scopes);

          // Prompt the user to sign in
          window.google.accounts.id.prompt((notification: any) => {
            console.log("Google Sign-In prompt notification:", notification);
            if (notification.isNotDisplayed()) {
              console.error("Sign-In prompt not displayed, reason:", notification.getNotDisplayedReason());
              reject(new Error(`Google Sign-In prompt not displayed: ${notification.getNotDisplayedReason()}`));
            } else if (notification.isSkippedMoment()) {
              console.error("Sign-In prompt skipped, reason:", notification.getSkippedReason());
              reject(new Error(`Google Sign-In prompt skipped: ${notification.getSkippedReason()}`));
            } else if (notification.isDismissedMoment()) {
              console.error("Sign-In prompt dismissed, reason:", notification.getDismissedReason());
              reject(new Error(`Google Sign-In prompt dismissed: ${notification.getDismissedReason()}`));
            }
          });
          
          // Also try to render the button manually as a fallback
          const googleButtonDiv = document.getElementById('google-signin-button');
          if (googleButtonDiv) {
            window.google.accounts.id.renderButton(
              googleButtonDiv, 
              { theme: 'outline', size: 'large', width: 380, text: 'signin_with' }
            );
            console.log("Google Sign-In button rendered manually");
          } else {
            console.error("Google Sign-In button container not found in DOM");
          }
        } catch (initError) {
          console.error("Error during Google Sign-In initialization:", initError);
          reject(initError);
        }
      });

      try {
        // Wait for the token from Google Sign-In
        const token = await tokenPromise;
        console.log("Successfully obtained Google authentication token");
        
        // Decode the JWT token to get user info
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
      }
    } catch (error) {
      console.error('Login initialization failed:', error);
      toast({
        title: "Login failed",
        description: "There was a problem initializing Google login.",
        variant: "destructive",
      });
    } finally {
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
