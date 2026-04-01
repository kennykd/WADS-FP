/**
 * Mock data module for Scholar's Plot Site
 * Provides realistic sample data for all entities
 * Frontend-only: imported directly by page components
 */

import {
  Task,
  StudySession,
  CalendarEvent,
  AnalyticsData,
  UserProfile,
  Notification,
  Project,
} from "@/types";

// Helper functions for relative dates
const now = new Date();
const daysFromNow = (n: number) =>
  new Date(now.getTime() + n * 24 * 60 * 60 * 1000);
const hoursFromNow = (n: number) =>
  new Date(now.getTime() + n * 60 * 60 * 1000);

// ============================================================================
// MOCK TASKS
// ============================================================================

export const mockTasks: Task[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    title: "Calculus II Problem Set 5",
    description:
      "Complete exercises 1-15 from Chapter 5. Focus on integration by parts and partial fractions.",
    deadline: daysFromNow(2),
    priority: 4.5,
    status: "In_Progress",
    attachments: ["problem-set-5.pdf", "solutions-guide.pdf"],
    reminder: "daily",
    createdAt: daysFromNow(-7),
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    title: "Data Structures Assignment 3",
    description:
      "Implement binary search tree with insert, delete, and search operations. Include unit tests.",
    deadline: daysFromNow(3),
    priority: 5,
    status: "In_Progress",
    attachments: ["assignment-spec.pdf"],
    reminder: "every-3-days",
    createdAt: daysFromNow(-5),
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    title: "Physics Lab Report",
    description: "Write lab report for experiment on simple harmonic motion.",
    deadline: daysFromNow(1),
    priority: 4,
    status: "Pending",
    reminder: "weekly",
    createdAt: daysFromNow(-10),
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    title: "English Composition Essay",
    description:
      'Write 2000-word essay on "The Role of Technology in Modern Society". Include at least 5 academic sources.',
    deadline: daysFromNow(5),
    priority: 3.5,
    status: "Pending",
    reminder: "none",
    createdAt: daysFromNow(-3),
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    title: "Web Development Project Milestone 1",
    description:
      "Complete frontend design and setup. Deploy to staging environment.",
    deadline: daysFromNow(-1),
    priority: 5,
    status: "Completed",
    completedAt: daysFromNow(-2),
    reminder: "daily",
    createdAt: daysFromNow(-14),
  },
  {
    id: "00000000-0000-4000-8000-000000000006",
    title: "Linear Algebra Midterm Review",
    description:
      "Review chapters 1-4. Practice matrix operations and eigenvalues.",
    deadline: daysFromNow(7),
    priority: 3,
    status: "Pending",
    reminder: "weekly",
    createdAt: daysFromNow(-4),
  },
  {
    id: "00000000-0000-4000-8000-000000000007",
    title: "Database Systems Project",
    description:
      "Design and implement relational database schema for e-commerce platform.",
    deadline: daysFromNow(-3),
    priority: 4.5,
    status: "Completed",
    completedAt: daysFromNow(-1),
    reminder: "every-3-days",
    createdAt: daysFromNow(-21),
  },
  {
    id: "00000000-0000-4000-8000-000000000008",
    title: "Operating Systems Assignment 2",
    description:
      "Implement process scheduling algorithms: FCFS, SJF, and Round Robin.",
    deadline: daysFromNow(4),
    priority: 2.5,
    status: "Completed",
    completedAt: daysFromNow(-5),
    reminder: "none",
    createdAt: daysFromNow(-12),
  },
  {
    id: "00000000-0000-4000-8000-000000000009",
    title: "Discrete Mathematics Problem Set",
    description: "Complete graph theory and combinatorics problems.",
    deadline: daysFromNow(6),
    priority: 2,
    status: "Pending",
    reminder: "weekly",
    createdAt: daysFromNow(-2),
  },
  {
    id: "00000000-0000-4000-8000-000000000010",
    title: "Software Engineering Documentation",
    description: "Write system design document and API specifications.",
    deadline: daysFromNow(8),
    priority: 1,
    status: "Pending",
    reminder: "none",
    createdAt: daysFromNow(-1),
  },
];

// ============================================================================
// MOCK STUDY SESSIONS
// ============================================================================

export const mockStudySessions: StudySession[] = [
  {
    id: "00000000-0000-4000-8000-000000000101",
    taskId: "00000000-0000-4000-8000-000000000001",
    taskTitle: "Calculus II Problem Set 5",
    duration: 25,
    breakDuration: 5,
    checklist: [
      {
        id: "00000000-0000-4000-8000-000000000201",
        text: "Review lecture notes on integration by parts",
        completed: true,
      },
      { id: "00000000-0000-4000-8000-000000000202", text: "Complete exercises 1-5", completed: true },
      { id: "00000000-0000-4000-8000-000000000203", text: "Complete exercises 6-10", completed: false },
      {
        id: "00000000-0000-4000-8000-000000000204",
        text: "Review partial fractions method",
        completed: false,
      },
    ],
    status: "active",
    scheduledAt: hoursFromNow(1),
  },
  {
    id: "00000000-0000-4000-8000-000000000102",
    taskId: "00000000-0000-4000-8000-000000000002",
    taskTitle: "Data Structures Assignment 3",
    duration: 50,
    breakDuration: 10,
    checklist: [
      {
        id: "00000000-0000-4000-8000-000000000205",
        text: "Implement BST insert operation",
        completed: true,
      },
      {
        id: "00000000-0000-4000-8000-000000000206",
        text: "Implement BST delete operation",
        completed: false,
      },
      {
        id: "00000000-0000-4000-8000-000000000207",
        text: "Implement BST search operation",
        completed: false,
      },
      { id: "00000000-0000-4000-8000-000000000208", text: "Write unit tests", completed: false },
    ],
    status: "pending",
    scheduledAt: daysFromNow(1),
  },
  {
    id: "00000000-0000-4000-8000-000000000103",
    taskId: "00000000-0000-4000-8000-000000000003",
    taskTitle: "Physics Lab Report",
    duration: 45,
    breakDuration: 10,
    checklist: [
      { id: "00000000-0000-4000-8000-000000000209", text: "Organize experimental data", completed: false },
      {
        id: "00000000-0000-4000-8000-000000000210",
        text: "Write introduction and methodology",
        completed: false,
      },
      {
        id: "00000000-0000-4000-8000-000000000211",
        text: "Analyze results and create graphs",
        completed: false,
      },
    ],
    status: "pending",
    scheduledAt: daysFromNow(1),
  },
  {
    id: "00000000-0000-4000-8000-000000000104",
    taskId: "00000000-0000-4000-8000-000000000004",
    taskTitle: "English Composition Essay",
    duration: 60,
    breakDuration: 15,
    checklist: [
      {
        id: "00000000-0000-4000-8000-000000000212",
        text: "Research and gather sources",
        completed: false,
      },
      { id: "00000000-0000-4000-8000-000000000213", text: "Create outline", completed: false },
      { id: "00000000-0000-4000-8000-000000000214", text: "Write first draft", completed: false },
      { id: "00000000-0000-4000-8000-000000000215", text: "Revise and proofread", completed: false },
    ],
    status: "pending",
    scheduledAt: daysFromNow(2),
  },
];

// ============================================================================
// MOCK CALENDAR EVENTS
// ============================================================================

export const mockCalendarEvents: CalendarEvent[] = [
  // Task deadlines
  {
    id: "00000000-0000-4000-8000-000000000301",
    title: "Calculus II Problem Set 5 Due",
    type: "task-deadline",
    date: daysFromNow(2),
    color: "#FF4D2E",
    taskId: "00000000-0000-4000-8000-000000000001",
  },
  {
    id: "00000000-0000-4000-8000-000000000302",
    title: "Data Structures Assignment 3 Due",
    type: "task-deadline",
    date: daysFromNow(3),
    color: "#FF4D2E",
    taskId: "00000000-0000-4000-8000-000000000002",
  },
  {
    id: "00000000-0000-4000-8000-000000000303",
    title: "Physics Lab Report Due",
    type: "task-deadline",
    date: daysFromNow(1),
    color: "#FF4D2E",
    taskId: "00000000-0000-4000-8000-000000000003",
  },
  {
    id: "00000000-0000-4000-8000-000000000304",
    title: "English Composition Essay Due",
    type: "task-deadline",
    date: daysFromNow(5),
    color: "#FF4D2E",
    taskId: "00000000-0000-4000-8000-000000000004",
  },
  {
    id: "00000000-0000-4000-8000-000000000305",
    title: "Linear Algebra Midterm Review Due",
    type: "task-deadline",
    date: daysFromNow(7),
    color: "#FF4D2E",
    taskId: "00000000-0000-4000-8000-000000000006",
  },
  {
    id: "00000000-0000-4000-8000-000000000306",
    title: "Database Systems Project Due",
    type: "task-deadline",
    date: daysFromNow(-3),
    color: "#FF4D2E",
    taskId: "00000000-0000-4000-8000-000000000007",
  },
  {
    id: "00000000-0000-4000-8000-000000000307",
    title: "Operating Systems Assignment 2 Due",
    type: "task-deadline",
    date: daysFromNow(4),
    color: "#FF4D2E",
    taskId: "00000000-0000-4000-8000-000000000008",
  },
  {
    id: "00000000-0000-4000-8000-000000000308",
    title: "Discrete Mathematics Problem Set Due",
    type: "task-deadline",
    date: daysFromNow(6),
    color: "#FF4D2E",
    taskId: "00000000-0000-4000-8000-000000000009",
  },
  {
    id: "00000000-0000-4000-8000-000000000309",
    title: "Software Engineering Documentation Due",
    type: "task-deadline",
    date: daysFromNow(8),
    color: "#FF4D2E",
    taskId: "00000000-0000-4000-8000-000000000010",
  },

  // Study sessions
  {
    id: "00000000-0000-4000-8000-000000000310",
    title: "Study: Calculus II Problem Set 5",
    type: "study-session",
    date: hoursFromNow(1),
    startTime: "14:00",
    endTime: "14:25",
    color: "#3b82f6",
    taskId: "00000000-0000-4000-8000-000000000001",
  },
  {
    id: "00000000-0000-4000-8000-000000000311",
    title: "Study: Data Structures Assignment 3",
    type: "study-session",
    date: daysFromNow(1),
    startTime: "09:00",
    endTime: "09:50",
    color: "#3b82f6",
    taskId: "00000000-0000-4000-8000-000000000002",
  },
  {
    id: "00000000-0000-4000-8000-000000000312",
    title: "Study: Physics Lab Report",
    type: "study-session",
    date: daysFromNow(1),
    startTime: "15:00",
    endTime: "15:45",
    color: "#3b82f6",
    taskId: "00000000-0000-4000-8000-000000000003",
  },
  {
    id: "00000000-0000-4000-8000-000000000313",
    title: "Study: English Composition Essay",
    type: "study-session",
    date: daysFromNow(2),
    startTime: "10:00",
    endTime: "11:00",
    color: "#3b82f6",
    taskId: "00000000-0000-4000-8000-000000000004",
  },
  {
    id: "00000000-0000-4000-8000-000000000314",
    title: "Study: Linear Algebra Review",
    type: "study-session",
    date: daysFromNow(3),
    startTime: "13:00",
    endTime: "14:00",
    color: "#3b82f6",
  },
  {
    id: "00000000-0000-4000-8000-000000000315",
    title: "Study: Discrete Mathematics",
    type: "study-session",
    date: daysFromNow(4),
    startTime: "16:00",
    endTime: "17:00",
    color: "#3b82f6",
  },
  {
    id: "00000000-0000-4000-8000-000000000316",
    title: "Study: Web Development",
    type: "study-session",
    date: daysFromNow(-1),
    startTime: "11:00",
    endTime: "12:30",
    color: "#3b82f6",
  },
  {
    id: "00000000-0000-4000-8000-000000000317",
    title: "Study: Operating Systems",
    type: "study-session",
    date: daysFromNow(2),
    startTime: "14:00",
    endTime: "15:00",
    color: "#3b82f6",
  },
  {
    id: "00000000-0000-4000-8000-000000000318",
    title: "Study: Software Engineering",
    type: "study-session",
    date: daysFromNow(5),
    startTime: "09:30",
    endTime: "10:30",
    color: "#3b82f6",
  },
  {
    id: "00000000-0000-4000-8000-000000000319",
    title: "Study: Database Systems",
    type: "study-session",
    date: daysFromNow(-2),
    startTime: "13:00",
    endTime: "14:30",
    color: "#3b82f6",
  },
  {
    id: "00000000-0000-4000-8000-000000000320",
    title: "Study: Calculus II Review",
    type: "study-session",
    date: daysFromNow(0),
    startTime: "10:00",
    endTime: "11:00",
    color: "#3b82f6",
  },
];

// ============================================================================
// MOCK ANALYTICS
// ============================================================================

export const mockAnalytics: AnalyticsData = {
  completionStats: {
    early: 8,
    onTime: 12,
    late: 3,
    pending: 7,
  },
  timeBySubject: [
    { subject: "Data Structures", hours: 12.5 },
    { subject: "Calculus II", hours: 9.0 },
    { subject: "Physics Lab", hours: 7.5 },
    { subject: "English Composition", hours: 5.0 },
    { subject: "Web Development", hours: 14.0 },
  ],
  productivityByDay: [
    { day: "Mon", score: 85, tasksCompleted: 3 },
    { day: "Tue", score: 60, tasksCompleted: 2 },
    { day: "Wed", score: 90, tasksCompleted: 4 },
    { day: "Thu", score: 45, tasksCompleted: 1 },
    { day: "Fri", score: 75, tasksCompleted: 3 },
    { day: "Sat", score: 30, tasksCompleted: 1 },
    { day: "Sun", score: 20, tasksCompleted: 0 },
  ],
  streak: 5,
  totalFocusMinutes: 840,
  totalTasksCompleted: 23,
};

// ============================================================================
// MOCK USER
// ============================================================================

export const mockUser: UserProfile = {
  uid: "mock-user-001",
  email: "student@scholar.plot",
  displayName: "Alex Scholar",
  avatarUrl: undefined,
};

// ============================================================================
// MOCK NOTIFICATIONS
// ============================================================================

export const mockNotifications: Notification[] = [
  {
    id: "00000000-0000-4000-8000-000000000401",
    taskTitle: "Calculus II Problem Set 5",
    message:
      "Your future self is already thanking you for this moment of focus.",
    deadline: daysFromNow(2),
    type: "reminder",
  },
  {
    id: "00000000-0000-4000-8000-000000000402",
    taskTitle: "Data Structures Assignment 3",
    message:
      "Every expert was once a beginner. You're building mastery right now.",
    deadline: daysFromNow(1),
    type: "deadline-approaching",
  },
  {
    id: "00000000-0000-4000-8000-000000000403",
    taskTitle: "Physics Lab Report",
    message: "The only way to do great work is to love what you do. Start now.",
    deadline: daysFromNow(1),
    type: "deadline-approaching",
  },
  {
    id: "00000000-0000-4000-8000-000000000404",
    taskTitle: "English Composition Essay",
    message: "Success is the sum of small efforts repeated day in and day out.",
    deadline: daysFromNow(5),
    type: "reminder",
  },
  {
    id: "00000000-0000-4000-8000-000000000405",
    taskTitle: "Linear Algebra Midterm Review",
    message: "You've got this! One step at a time, one problem at a time.",
    deadline: daysFromNow(7),
    type: "reminder",
  },
  {
    id: "00000000-0000-4000-8000-000000000406",
    taskTitle: "Discrete Mathematics Problem Set",
    message: "Progress over perfection. Every line of code brings you closer.",
    deadline: daysFromNow(6),
    type: "reminder",
  },
  {
    id: "00000000-0000-4000-8000-000000000407",
    taskTitle: "Operating Systems Assignment 2",
    message: "Your dedication today is the foundation of tomorrow's success.",
    deadline: daysFromNow(4),
    type: "reminder",
  },
  {
    id: "00000000-0000-4000-8000-000000000408",
    taskTitle: "Software Engineering Documentation",
    message:
      "Great things never came from comfort zones. You're doing amazing.",
    deadline: daysFromNow(8),
    type: "reminder",
  },
];

// ============================================================================
// MOCK PROJECTS
// ============================================================================

export const mockProjects: Project[] = [
  {
    id: "00000000-0000-4000-8000-000000000501",
    name: "Capstone Collaboration",
    description: "Team coordination for the semester capstone build.",
    deadline: daysFromNow(30),
    priority: 5,
    status: "active",
    ownerId: "00000000-0000-4000-8000-000000000601",
    members: [
      {
        id: "00000000-0000-4000-8000-000000000601",
        name: "Alex Scholar",
        handle: "alex@scholar.plot",
        role: "owner",
      },
      {
        id: "00000000-0000-4000-8000-000000000602",
        name: "Jamie Rivera",
        handle: "jamie@scholar.plot",
        role: "moderator",
      },
      { id: "00000000-0000-4000-8000-000000000603", name: "Sam Lee", handle: "sam", role: "member" },
      {
        id: "00000000-0000-4000-8000-000000000604",
        name: "Taylor Park",
        handle: "taylor",
        role: "member",
      },
    ],
    tasks: [
      {
        id: "00000000-0000-4000-8000-000000000701",
        title: "Finalize project scope",
        description: "Lock requirements and success criteria for the MVP.",

        priority: 5,
        status: "Pending",
        assignedTo: "00000000-0000-4000-8000-000000000603",
        createdAt: daysFromNow(-5),
      },
      {
        id: "00000000-0000-4000-8000-000000000702",
        title: "Create kanban board UI",
        description: "Build the column layout and task cards.",

        priority: 3,
        status: "In_Progress",
        assignedTo: "00000000-0000-4000-8000-000000000602",
        createdAt: daysFromNow(-4),
      },
      {
        id: "00000000-0000-4000-8000-000000000703",
        title: "Review API integration plan",
        description: "Validate endpoints and data contracts.",

        priority: 1.5,
        status: "Completed",
        assignedTo: "00000000-0000-4000-8000-000000000601",
        createdAt: daysFromNow(-8),
      },
    ],
    createdAt: daysFromNow(-10),
  },
  {
    id: "00000000-0000-4000-8000-000000000502",
    name: "Open Study Group",
    description: "Shared tasks for the weekly study group.",
    deadline: daysFromNow(14),
    priority: 3,
    status: "active",
    ownerId: "00000000-0000-4000-8000-000000000605",
    members: [
      { id: "00000000-0000-4000-8000-000000000605", name: "Riley Chen", handle: "riley", role: "owner" },
      {
        id: "00000000-0000-4000-8000-000000000606",
        name: "Priya Patel",
        handle: "priya",
        role: "moderator",
      },
      {
        id: "00000000-0000-4000-8000-000000000607",
        name: "Jordan Blake",
        handle: "jordan",
        role: "member",
      },
    ],
    tasks: [
      {
        id: "00000000-0000-4000-8000-000000000704",
        title: "Post meeting notes",
        description: "Summarize decisions and next steps.",

        priority: 3,
        status: "Pending",
        createdAt: daysFromNow(-1),
      },
      {
        id: "00000000-0000-4000-8000-000000000705",
        title: "Collect resource links",
        description: "Gather references and practice sets.",

        priority: 1.5,
        status: "In_Progress",
        assignedTo: "00000000-0000-4000-8000-000000000607",
        createdAt: daysFromNow(-2),
      },
      {
        id: "00000000-0000-4000-8000-000000000706",
        title: "Finalize agenda",
        description: "Confirm topics for the next session.",

        priority: 5,
        status: "Completed",
        assignedTo: "00000000-0000-4000-8000-000000000606",
        createdAt: daysFromNow(-4),
      },
    ],
    createdAt: daysFromNow(-3),
  },
];

