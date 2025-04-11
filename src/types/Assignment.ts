
export type AssignmentType = "assignment" | "announcement";

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate?: string;
  createdAt: string;
  courseTitle: string;
  courseId: string;
  type: AssignmentType;
  link: string;
}
