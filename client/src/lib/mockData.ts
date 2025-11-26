import type {
  DashboardStats,
  Assignment,
  Schedule,
  Activity,
  LearningActivity,
  ProgressData,
  Course,
  User,
} from "@shared/schema";

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  activeTasks: 18,
  completedTasks: 8,
  totalScore: 132,
  performance: 1274,
};

// Mock Assignments
export const mockAssignments: Assignment[] = [
  {
    id: "1",
    title: "Complete UI Design Project",
    course: "UI Design Fundamentals",
    dueDate: "2024-01-15",
    status: "Pending",
    progress: 65,
    priority: "High",
  },
  {
    id: "2",
    title: "React Component Library",
    course: "Frontend Development",
    dueDate: "2024-01-18",
    status: "In Progress",
    progress: 40,
    priority: "Medium",
  },
  {
    id: "3",
    title: "Marketing Campaign Analysis",
    course: "Digital Marketing",
    dueDate: "2024-01-20",
    status: "Pending",
    progress: 0,
    priority: "Low",
  },
  {
    id: "4",
    title: "Copywriting Exercise",
    course: "Copywriting Basics",
    dueDate: "2024-01-12",
    status: "Completed",
    progress: 100,
    priority: "Medium",
  },
  {
    id: "5",
    title: "Advanced React Patterns",
    course: "Advanced React",
    dueDate: "2024-01-22",
    status: "In Progress",
    progress: 75,
    priority: "High",
  },
];

// Mock Schedules
export const mockSchedules: Schedule[] = [
  {
    id: "1",
    title: "UI Design Workshop",
    course: "UI Design Fundamentals",
    date: "2024-01-15",
    time: "10:00 AM",
    type: "Live Session",
  },
  {
    id: "2",
    title: "React Hooks Deep Dive",
    course: "Frontend Development",
    date: "2024-01-16",
    time: "2:00 PM",
    type: "Live Session",
  },
  {
    id: "3",
    title: "Marketing Strategy Session",
    course: "Digital Marketing",
    date: "2024-01-17",
    time: "11:00 AM",
    type: "Webinar",
  },
  {
    id: "4",
    title: "Copywriting Review",
    course: "Copywriting Basics",
    date: "2024-01-18",
    time: "3:00 PM",
    type: "Office Hours",
  },
  {
    id: "5",
    title: "Advanced Patterns Q&A",
    course: "Advanced React",
    date: "2024-01-19",
    time: "1:00 PM",
    type: "Live Session",
  },
];

// Mock Activities
export const mockActivities: Activity[] = [
  {
    id: "1",
    title: "Completed UI Design Assignment",
    description: "Submitted the final project for UI Design Fundamentals",
    timestamp: "2 hours ago",
    type: "assignment",
    course: "UI Design Fundamentals",
  },
  {
    id: "2",
    title: "Joined Live Session",
    description: "Attended React Hooks Deep Dive session",
    timestamp: "5 hours ago",
    type: "session",
    course: "Frontend Development",
  },
  {
    id: "3",
    title: "New Course Enrolled",
    description: "Started learning Advanced React Patterns",
    timestamp: "1 day ago",
    type: "enrollment",
    course: "Advanced React",
  },
  {
    id: "4",
    title: "Quiz Completed",
    description: "Scored 85% on Copywriting Basics quiz",
    timestamp: "2 days ago",
    type: "quiz",
    course: "Copywriting Basics",
  },
  {
    id: "5",
    title: "Certificate Earned",
    description: "Received certificate for Digital Marketing course",
    timestamp: "3 days ago",
    type: "certificate",
    course: "Digital Marketing",
  },
];

// Mock Learning Activity
export const mockLearningActivity: LearningActivity[] = [
  {
    id: "1",
    day: "Mon",
    uiDesign: 4,
    frontEnd: 6,
    copywriting: 2,
  },
  {
    id: "2",
    day: "Tue",
    uiDesign: 5,
    frontEnd: 4,
    copywriting: 3,
  },
  {
    id: "3",
    day: "Wed",
    uiDesign: 3,
    frontEnd: 7,
    copywriting: 1,
  },
  {
    id: "4",
    day: "Thu",
    uiDesign: 6,
    frontEnd: 5,
    copywriting: 4,
  },
  {
    id: "5",
    day: "Fri",
    uiDesign: 4,
    frontEnd: 6,
    copywriting: 2,
  },
  {
    id: "6",
    day: "Sat",
    uiDesign: 2,
    frontEnd: 3,
    copywriting: 5,
  },
  {
    id: "7",
    day: "Sun",
    uiDesign: 1,
    frontEnd: 2,
    copywriting: 3,
  },
];

// Mock Progress Data
export const mockProgressData: ProgressData[] = [
  {
    category: "UI Design",
    percentage: 75,
    color: "#3b82f6",
  },
  {
    category: "Frontend",
    percentage: 60,
    color: "#10b981",
  },
  {
    category: "Copywriting",
    percentage: 45,
    color: "#f59e0b",
  },
  {
    category: "Marketing",
    percentage: 30,
    color: "#ef4444",
  },
];

// Mock Courses
export const mockCourses: Course[] = [
  {
    id: "1",
    title: "UI Design Fundamentals",
    instructor: "Sarah Johnson",
    category: "Design",
    description: "Learn the fundamentals of UI design and create beautiful interfaces",
    thumbnail: "/api/placeholder/400/300",
    duration: "8 weeks",
    progress: 75,
    totalLessons: 24,
    completedLessons: 18,
    status: "In Progress",
  },
  {
    id: "2",
    title: "Frontend Development",
    instructor: "Michael Chen",
    category: "Development",
    description: "Master modern frontend development with React and TypeScript",
    thumbnail: "/api/placeholder/400/300",
    duration: "10 weeks",
    progress: 60,
    totalLessons: 30,
    completedLessons: 18,
    status: "In Progress",
  },
  {
    id: "3",
    title: "Advanced React",
    instructor: "David Kim",
    category: "Development",
    description: "Deep dive into advanced React patterns and performance optimization",
    thumbnail: "/api/placeholder/400/300",
    duration: "6 weeks",
    progress: 40,
    totalLessons: 18,
    completedLessons: 7,
    status: "In Progress",
  },
  {
    id: "4",
    title: "Digital Marketing",
    instructor: "Emily Rodriguez",
    category: "Marketing",
    description: "Learn digital marketing strategies and tools",
    thumbnail: "/api/placeholder/400/300",
    duration: "8 weeks",
    progress: 100,
    totalLessons: 20,
    completedLessons: 20,
    status: "Completed",
  },
  {
    id: "5",
    title: "Copywriting Basics",
    instructor: "James Wilson",
    category: "Writing",
    description: "Master the art of persuasive copywriting",
    thumbnail: "/api/placeholder/400/300",
    duration: "6 weeks",
    progress: 85,
    totalLessons: 15,
    completedLessons: 13,
    status: "In Progress",
  },
  {
    id: "6",
    title: "Data Science Fundamentals",
    instructor: "Lisa Anderson",
    category: "Data",
    description: "Introduction to data science and analytics",
    thumbnail: "/api/placeholder/400/300",
    duration: "12 weeks",
    progress: 0,
    totalLessons: 36,
    completedLessons: 0,
    status: "Not Started",
  },
];

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    username: "john_doe",
    email: "john.doe@example.com",
    role: "student",
    avatar: "/api/placeholder/40/40",
    fullName: "John Doe",
  },
  {
    id: "2",
    username: "jane_smith",
    email: "jane.smith@example.com",
    role: "student",
    avatar: "/api/placeholder/40/40",
    fullName: "Jane Smith",
  },
  {
    id: "3",
    username: "sarah_johnson",
    email: "sarah.johnson@example.com",
    role: "instructor",
    avatar: "/api/placeholder/40/40",
    fullName: "Sarah Johnson",
  },
  {
    id: "4",
    username: "michael_chen",
    email: "michael.chen@example.com",
    role: "instructor",
    avatar: "/api/placeholder/40/40",
    fullName: "Michael Chen",
  },
  {
    id: "5",
    username: "emily_rodriguez",
    email: "emily.rodriguez@example.com",
    role: "instructor",
    avatar: "/api/placeholder/40/40",
    fullName: "Emily Rodriguez",
  },
  {
    id: "6",
    username: "david_kim",
    email: "david.kim@example.com",
    role: "instructor",
    avatar: "/api/placeholder/40/40",
    fullName: "David Kim",
  },
  {
    id: "7",
    username: "alex_brown",
    email: "alex.brown@example.com",
    role: "student",
    avatar: "/api/placeholder/40/40",
    fullName: "Alex Brown",
  },
  {
    id: "8",
    username: "maria_garcia",
    email: "maria.garcia@example.com",
    role: "student",
    avatar: "/api/placeholder/40/40",
    fullName: "Maria Garcia",
  },
];

// Mock data map for API endpoints
export const mockDataMap: Record<string, any> = {
  "/api/stats": mockDashboardStats,
  "/api/assignments": mockAssignments,
  "/api/schedules": mockSchedules,
  "/api/activities": mockActivities,
  "/api/learning-activity": mockLearningActivity,
  "/api/progress": mockProgressData,
  "/api/courses": mockCourses,
  "/api/users": mockUsers,
};

// Helper function to simulate API delay
export function delay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mock API function
export async function mockApiRequest(endpoint: string): Promise<any> {
  await delay(300); // Simulate network delay
  
  // Handle dynamic routes like /api/courses/:id
  if (endpoint.startsWith("/api/courses/")) {
    const id = endpoint.split("/").pop();
    const course = mockCourses.find((c) => c.id === id);
    return course || null;
  }
  
  if (endpoint.startsWith("/api/users/")) {
    const id = endpoint.split("/").pop();
    const user = mockUsers.find((u) => u.id === id);
    return user || null;
  }
  
  if (endpoint.startsWith("/api/assignments/")) {
    const id = endpoint.split("/").pop();
    const assignment = mockAssignments.find((a) => a.id === id);
    return assignment || null;
  }
  
  if (endpoint.startsWith("/api/schedules/")) {
    const id = endpoint.split("/").pop();
    const schedule = mockSchedules.find((s) => s.id === id);
    return schedule || null;
  }
  
  // Return data for static endpoints
  return mockDataMap[endpoint] || null;
}

