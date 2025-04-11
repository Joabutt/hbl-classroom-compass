
import React from "react";
import { FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import AssignmentCard from "@/components/AssignmentCard";
import { Assignment } from "@/types/Assignment";

interface AssignmentListProps {
  isLoadingAssignments: boolean;
  filteredAssignments: Assignment[];
  handleRefresh: () => void;
}

const AssignmentList = ({
  isLoadingAssignments,
  filteredAssignments,
  handleRefresh,
}: AssignmentListProps) => {
  if (isLoadingAssignments) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i} 
            className="h-48 rounded-lg border border-gray-200 bg-white p-4 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (filteredAssignments.length > 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssignments.map((assignment) => (
          <AssignmentCard 
            key={assignment.id} 
            assignment={assignment}
          />
        ))}
      </div>
    );
  }

  return (
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
  );
};

export default AssignmentList;
