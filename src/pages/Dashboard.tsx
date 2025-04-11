
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHBLAssignments } from "@/services/classroomService";
import { DateRange } from "react-day-picker";
import { Assignment } from "@/types/Assignment";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { subDays } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFilters from "@/components/dashboard/DashboardFilters";
import AssignmentList from "@/components/dashboard/AssignmentList";

const Dashboard = () => {
  const { user, isLoading, accessToken } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 2),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = useState("all");

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  // Fetch assignments when date range changes or when accessToken becomes available
  useEffect(() => {
    const fetchAssignments = async () => {
      if (dateRange?.from && dateRange?.to) {
        setIsLoadingAssignments(true);
        try {
          const data = await getHBLAssignments(dateRange.from, dateRange.to, accessToken);
          setAssignments(data);
          setFilteredAssignments(data);
        } catch (error) {
          console.error("Error fetching assignments:", error);
          toast({
            title: "Error",
            description: "Failed to fetch assignments. Using mock data instead.",
            variant: "destructive",
          });
        } finally {
          setIsLoadingAssignments(false);
        }
      }
    };

    fetchAssignments();
  }, [dateRange, accessToken, toast]);

  // Filter assignments based on search query and active tab
  useEffect(() => {
    let filtered = [...assignments];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        assignment => 
          assignment.title.toLowerCase().includes(query) ||
          assignment.description.toLowerCase().includes(query) ||
          assignment.courseTitle.toLowerCase().includes(query)
      );
    }
    
    // Apply tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter(assignment => assignment.type === activeTab);
    }
    
    setFilteredAssignments(filtered);
  }, [searchQuery, activeTab, assignments]);

  const handleRefresh = async () => {
    if (dateRange?.from && dateRange?.to) {
      setIsLoadingAssignments(true);
      try {
        const data = await getHBLAssignments(dateRange.from, dateRange.to, accessToken);
        setAssignments(data);
        setFilteredAssignments(data);
        toast({
          title: "Data refreshed",
          description: "Your HBL assignments have been updated.",
        });
      } catch (error) {
        console.error("Error refreshing assignments:", error);
        toast({
          title: "Error",
          description: "Failed to refresh assignments.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingAssignments(false);
      }
    }
  };

  // Set date range to last 2 days
  const setDefaultDateRange = () => {
    const today = new Date();
    setDateRange({
      from: subDays(today, 2),
      to: today,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hbl-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <main className="flex-1 container py-6 px-4 md:px-6">
        <div className="flex flex-col space-y-4 md:space-y-8">
          <DashboardHeader />
          
          <DashboardFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            dateRange={dateRange}
            setDateRange={setDateRange}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleRefresh={handleRefresh}
            setDefaultDateRange={setDefaultDateRange}
            isLoadingAssignments={isLoadingAssignments}
          />
          
          <AssignmentList
            isLoadingAssignments={isLoadingAssignments}
            filteredAssignments={filteredAssignments}
            handleRefresh={handleRefresh}
          />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
