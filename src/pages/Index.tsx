
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate('/dashboard');
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-hbl-gray">
      <div className="text-center max-w-2xl px-4 py-8 animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-hbl-lightBlue flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-hbl-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight mb-3 text-gray-900">
          HBL Classroom Compass
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Stay on top of your Home Based Learning assignments and announcements 
          from Google Classroom with our easy-to-use tracking tool.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/login')} 
            className="px-8 py-6 bg-hbl-blue hover:bg-hbl-blue/90"
            size="lg"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              "Get Started"
            )}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/dashboard')} 
            className="px-8 py-6"
            size="lg"
          >
            View Demo
          </Button>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-4">
            <div className="rounded-full bg-hbl-lightBlue w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-hbl-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Track Assignments</h3>
            <p className="text-gray-600">Never miss an HBL assignment again with our easy-to-use tracking system.</p>
          </div>
          
          <div className="p-4">
            <div className="rounded-full bg-hbl-lightBlue w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-hbl-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Date Filtering</h3>
            <p className="text-gray-600">Easily filter assignments by date range to focus on what's important now.</p>
          </div>
          
          <div className="p-4">
            <div className="rounded-full bg-hbl-lightBlue w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-hbl-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">HBL Notifications</h3>
            <p className="text-gray-600">Get notified about new Home Based Learning announcements and assignments.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
