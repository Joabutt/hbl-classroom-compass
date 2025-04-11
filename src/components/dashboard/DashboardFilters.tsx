
import React from "react";
import { Search, RefreshCw } from "lucide-react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Megaphone } from "lucide-react";

interface DashboardFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleRefresh: () => void;
  setDefaultDateRange: () => void;
  isLoadingAssignments: boolean;
}

const DashboardFilters = ({
  searchQuery,
  setSearchQuery,
  dateRange,
  setDateRange,
  activeTab,
  setActiveTab,
  handleRefresh,
  setDefaultDateRange,
  isLoadingAssignments,
}: DashboardFiltersProps) => {
  return (
    <>
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
    </>
  );
};

export default DashboardFilters;
