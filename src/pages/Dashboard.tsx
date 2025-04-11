import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHBLAssignments } from "@/services/classroomService";
import { DateRange } from "react-day-picker";
import { Assignment } from "@/types/Assignment";
import { DateRangePicker } from "@/components/DateRangePicker";
import AssignmentCard from "@/components/AssignmentCard";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, FileText, Megaphone } from "lucide-react";
import { addDays, subDays } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

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
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">HBL Assignments</h1>
            <p className="text-muted-foreground">
              Track your Home Based Learning assignments and announcements
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-[1fr_200px]">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search assignments..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <DateRangePicker date={dateRange} setDate={setDateRange} />
          </div>
          
          <div className="flex items-center justify-between">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full md:w-auto"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="assignment" className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Assignments</span>
                </TabsTrigger>
                <TabsTrigger value="announcement" className="flex items-center gap-1">
                  <Megaphone className="h-3.5 w-3.5" />
                  <span>Announcements</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="hidden md:flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={setDefaultDateRange}
                className="hidden md:flex h-8"
              >
                Last 2 days
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isLoadingAssignments}
                className="h-8"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isLoadingAssignments ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          
          <div>
            {isLoadingAssignments ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div 
                    key={i} 
                    className="h-48 rounded-lg border border-gray-200 bg-white p-4 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredAssignments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredAssignments.map((assignment) => (
                  <AssignmentCard 
                    key={assignment.id} 
                    assignment={assignment}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No HBL assignments found</h3>
                <p className="text-muted-foreground mt-1 mb-4 max-w-md">
                  Try changing your search query or date range, or check back later for new assignments.
                </p>
                <Button onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
