
import { Assignment } from "@/types/Assignment";

// Get assignments and announcements with HBL in the title or description within a date range
export const getHBLAssignments = async (
  startDate?: Date, 
  endDate?: Date,
  accessToken?: string | null
): Promise<Assignment[]> => {
  // If no access token, use mock data
  if (!accessToken) {
    console.warn("No access token provided, using mock data");
    return getMockHBLAssignments(startDate, endDate);
  }

  try {
    console.log("Attempting to fetch courses with token:", accessToken ? `${accessToken.substring(0, 10)}...` : 'none');
    // Get courses first
    const courses = await fetchCourses(accessToken);
    console.log("Successfully fetched courses:", courses.length);
    const allAssignments: Assignment[] = [];

    // For each course, fetch both assignments and announcements
    for (const course of courses) {
      try {
        // Fetch coursework
        console.log(`Fetching coursework for course ${course.id}`);
        const courseWork = await fetchCourseWork(course.id, accessToken);
        console.log(`Got ${courseWork.length} course work items for course ${course.id}`);
        const assignments = courseWork.map(work => ({
          id: work.id,
          title: work.title,
          description: work.description || '',
          dueDate: work.dueDate ? new Date(work.dueDate.year, work.dueDate.month - 1, work.dueDate.day).toISOString() : undefined,
          createdAt: work.creationTime,
          courseTitle: course.name,
          courseId: course.id,
          type: "assignment" as const,
          link: work.alternateLink
        }));

        // Fetch announcements
        console.log(`Fetching announcements for course ${course.id}`);
        const announcements = await fetchAnnouncements(course.id, accessToken);
        console.log(`Got ${announcements.length} announcements for course ${course.id}`);
        const announcementItems = announcements.map(announcement => ({
          id: announcement.id,
          title: announcement.text.substring(0, 50) + (announcement.text.length > 50 ? '...' : ''),
          description: announcement.text,
          createdAt: announcement.creationTime,
          courseTitle: course.name,
          courseId: course.id,
          type: "announcement" as const,
          link: announcement.alternateLink
        }));

        allAssignments.push(...assignments, ...announcementItems);
      } catch (error) {
        console.error(`Error fetching data for course ${course.id}:`, error);
        // Continue with other courses even if one fails
      }
    }

    // Filter by date range if provided
    let filteredAssignments = [...allAssignments];
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
  } catch (error) {
    console.error("Error fetching from Google Classroom API:", error);
    // Fallback to mock data in case of errors
    return getMockHBLAssignments(startDate, endDate);
  }
};

// Get all courses
export const getCourses = async (accessToken?: string | null): Promise<{id: string, title: string}[]> => {
  if (!accessToken) {
    console.warn("No access token provided, using mock data");
    return getMockCourses();
  }

  try {
    const courses = await fetchCourses(accessToken);
    return courses.map(course => ({
      id: course.id,
      title: course.name
    }));
  } catch (error) {
    console.error("Error fetching courses from Google Classroom API:", error);
    return getMockCourses();
  }
};

// Helper function to fetch courses from Google Classroom API
async function fetchCourses(accessToken: string) {
  try {
    console.log("Sending request to Google Classroom API for courses");
    const response = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { text: errorText };
      }
      
      console.error("API Error Response:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries([...response.headers]),
        data: errorData
      });
      
      throw new Error(`Failed to fetch courses: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log("Courses API response:", data);
    return data.courses || [];
  } catch (error) {
    console.error('Error in fetchCourses:', error);
    throw error;
  }
}

// Helper function to fetch coursework from Google Classroom API
async function fetchCourseWork(courseId: string, accessToken: string) {
  try {
    const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // 404 for coursework might just mean there's no coursework, not an error
        return [];
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to fetch coursework for ${courseId}: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.courseWork || [];
  } catch (error) {
    console.error(`Error in fetchCourseWork for course ${courseId}:`, error);
    throw error;
  }
}

// Helper function to fetch announcements from Google Classroom API
async function fetchAnnouncements(courseId: string, accessToken: string) {
  try {
    const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/announcements`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // 404 for announcements might just mean there are no announcements, not an error
        return [];
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to fetch announcements for ${courseId}: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.announcements || [];
  } catch (error) {
    console.error(`Error in fetchAnnouncements for course ${courseId}:`, error);
    throw error;
  }
}

// Mock data functions (fallback)
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

function getMockHBLAssignments(startDate?: Date, endDate?: Date): Promise<Assignment[]> {
  return new Promise(resolve => {
    setTimeout(() => {
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

      resolve(filteredAssignments);
    }, 800);
  });
}

function getMockCourses(): Promise<{id: string, title: string}[]> {
  return new Promise(resolve => {
    setTimeout(() => {
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

      resolve(uniqueCourses);
    }, 600);
  });
}
