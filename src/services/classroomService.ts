
import { Assignment } from "@/types/Assignment";

// Mock data for our classroom assignments and announcements
const mockAssignments: Assignment[] = [
  {
    id: "1",
    title: "Mathematics HBL Assignment - Quadratic Equations",
    description: "Complete the HBL worksheet on solving quadratic equations by factoring. Submit your work by uploading photos of your solutions.",
    dueDate: "2025-04-13T23:59:59Z",
    createdAt: "2025-04-11T10:00:00Z",
    courseTitle: "Mathematics",
    courseId: "math101",
    type: "assignment",
    link: "#"
  },
  {
    id: "2",
    title: "Science HBL - Experimental Design",
    description: "For today's HBL, design an experiment to test the effect of temperature on enzyme activity. Use the template provided.",
    dueDate: "2025-04-12T23:59:59Z",
    createdAt: "2025-04-10T09:15:00Z",
    courseTitle: "Science",
    courseId: "sci102",
    type: "assignment",
    link: "#"
  },
  {
    id: "3",
    title: "HBL Announcement - English Literature Session",
    description: "There will be an online discussion on the novel 'To Kill a Mockingbird' during tomorrow's HBL session. Please read chapters 12-15 beforehand.",
    createdAt: "2025-04-11T08:30:00Z",
    courseTitle: "English Literature",
    courseId: "eng103",
    type: "announcement",
    link: "#"
  },
  {
    id: "4",
    title: "History Research Project",
    description: "Research and create a presentation on a significant historical event from the 20th century. Minimum 10 slides.",
    dueDate: "2025-04-15T23:59:59Z",
    createdAt: "2025-04-09T14:30:00Z",
    courseTitle: "History",
    courseId: "hist104",
    type: "assignment",
    link: "#"
  },
  {
    id: "5",
    title: "Geography HBL Task - Climate Patterns",
    description: "As part of today's HBL, analyze the climate data provided and answer the questions in the worksheet.",
    dueDate: "2025-04-14T23:59:59Z",
    createdAt: "2025-04-11T11:45:00Z",
    courseTitle: "Geography",
    courseId: "geo105",
    type: "assignment",
    link: "#"
  },
  {
    id: "6",
    title: "Art Project Submission",
    description: "Submit your perspective drawing assignment. Make sure to include both rough sketches and final work.",
    dueDate: "2025-04-16T23:59:59Z",
    createdAt: "2025-04-08T15:20:00Z",
    courseTitle: "Art",
    courseId: "art106",
    type: "assignment",
    link: "#"
  },
  {
    id: "7",
    title: "Important HBL Announcement - Schedule Change",
    description: "Please note that all HBL sessions tomorrow will begin 30 minutes later than scheduled to accommodate system maintenance.",
    createdAt: "2025-04-10T16:00:00Z",
    courseTitle: "School Admin",
    courseId: "admin107",
    type: "announcement",
    link: "#"
  }
];

// Get assignments and announcements with HBL in the title or description within a date range
export const getHBLAssignments = async (
  startDate?: Date, 
  endDate?: Date
): Promise<Assignment[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 800));

  let filteredAssignments = [...mockAssignments];

  // Filter by date range if provided
  if (startDate && endDate) {
    const start = startDate.getTime();
    const end = endDate.getTime();

    filteredAssignments = filteredAssignments.filter(assignment => {
      const createdTime = new Date(assignment.createdAt).getTime();
      return createdTime >= start && createdTime <= end;
    });
  }

  // Filter by HBL keyword
  filteredAssignments = filteredAssignments.filter(assignment => {
    const titleHasHBL = assignment.title.toLowerCase().includes('hbl');
    const descriptionHasHBL = assignment.description.toLowerCase().includes('hbl');
    return titleHasHBL || descriptionHasHBL;
  });

  return filteredAssignments;
};

// Get all courses
export const getCourses = async (): Promise<{id: string, title: string}[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));

  // Extract unique courses from our assignments
  const uniqueCourses = Array.from(
    new Set(mockAssignments.map(assignment => assignment.courseId))
  ).map(courseId => {
    const course = mockAssignments.find(a => a.courseId === courseId);
    return {
      id: courseId,
      title: course?.courseTitle || ''
    };
  });

  return uniqueCourses;
};
