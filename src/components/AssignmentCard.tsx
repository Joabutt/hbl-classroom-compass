
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExternalLink, FileText } from "lucide-react";
import { Assignment } from "@/types/Assignment";
import { format } from "date-fns";

interface AssignmentCardProps {
  assignment: Assignment;
}

const AssignmentCard = ({ assignment }: AssignmentCardProps) => {
  const { title, description, dueDate, courseTitle, type, link } = assignment;

  const highlightHBL = (text: string) => {
    if (!text) return "";
    
    // Split by "HBL" (case insensitive) and join with highlighted "HBL"
    const parts = text.split(/(HBL)/i);
    
    return parts.map((part, i) => 
      part.toLowerCase() === "hbl" ? 
        <span key={i} className="bg-yellow-100 font-medium">
          {part}
        </span> : 
        part
    );
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-2">{highlightHBL(title)}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <span>{courseTitle}</span>
              <span className="mx-2">•</span>
              <Badge variant={type === "assignment" ? "default" : "secondary"}>
                {type === "assignment" ? "Assignment" : "Announcement"}
              </Badge>
            </div>
          </div>
          <div className="rounded-full p-1.5 bg-muted">
            <FileText size={16} className="text-hbl-blue" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-700 line-clamp-3">
          {highlightHBL(description)}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-0">
        <div className="text-xs text-muted-foreground">
          {dueDate ? (
            <span>Due: {format(new Date(dueDate), "MMM d, yyyy")}</span>
          ) : (
            <span>No due date</span>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
          <ExternalLink size={12} />
          Open in Classroom
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AssignmentCard;
