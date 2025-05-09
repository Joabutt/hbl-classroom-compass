
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const { user, login, isLoading } = useAuth();
  const navigate = useNavigate();
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Only try to initialize login after a short delay
    // to ensure Google API is loaded
    if (!user && !isLoading) {
      const timer = setTimeout(() => {
        login().catch(error => {
          console.error("Login failed:", error);
          toast({
            title: "Login Error",
            description: "There was a problem signing in with Google. Please try again.",
            variant: "destructive",
          });
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user, isLoading, login, toast]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-hbl-gray">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg animate-fade-in">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-hbl-lightBlue flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-hbl-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">HBL Classroom Compass</h2>
          <p className="mt-2 text-sm text-gray-600">
            Track your Home Based Learning assignments and announcements from Google Classroom
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {isLoading ? (
            <div className="w-full flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hbl-blue"></div>
              <p className="ml-3 text-sm text-gray-600">Connecting to Google...</p>
            </div>
          ) : (
            <>
              <div id="google-signin-button" ref={googleButtonRef} className="flex justify-center"></div>
              <div className="flex justify-center">
                <button 
                  onClick={() => login()} 
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Sign in with Google
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Important</span>
            </div>
          </div>
          <p className="mt-3 text-xs text-center text-gray-500">
            This app uses Google Sign-In to access your Google Classroom data.
            <br/>Make sure to update the GOOGLE_CLIENT_ID in AuthContext.tsx with your own Client ID.
            <br/>Your data is only used within this application and is not stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
