import type { Role } from "@/config/roles";

export interface User {
  id: string;
  email: string;
  role: Role;
  displayName: string;
  googleAccountId?: string | null;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Paginated<T> {
  data: T[];
  pagination: { page: number; limit?: number; total: number };
}

export type ProspectStatus =
  | "pendiente"
  | "entrevistado"
  | "aceptado"
  | "rechazado"
  | "alta";

export interface Prospect {
  id: string;
  studentName: string;
  birthDate?: string;
  gradeApplying: string;
  status: ProspectStatus;
  parentName?: string;
  parentEmail: string;
  parentPhone?: string;
  notes?: string;
  createdAt: string;
  history?: {
    status: ProspectStatus;
    changedAt: string;
    changedBy: string | null;
  }[];
}

export type JobApplicationStatus =
  | "recibida"
  | "en_revision"
  | "entrevistado"
  | "contratado"
  | "descartado";

export interface JobApplication {
  id: string;
  position: string;
  applicantName: string;
  email: string;
  phone?: string;
  cvUrl?: string;
  coverLetter?: string;
  status: JobApplicationStatus;
  createdAt: string;
}

export interface Student {
  id: string;
  displayName: string;
  birthDate?: string;
  institutionalEmail: string;
  googleAccountId?: string;
  courseId: string;
  courseName: string;
  enrolledAt?: string;
  parents?: { name: string; email: string; phone?: string }[];
}

export interface Course {
  id: string;
  name: string;
  year: number;
  classroomCourseId?: string;
  teacherId?: string;
  teacherName?: string;
  studentCount?: number;
  enrollmentCode?: string;
  section?: string;
}

export type AttendanceStatus = "presente" | "ausente" | "tarde";

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  studentName?: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceSummary {
  studentId: string;
  studentName: string;
  year: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  percentage: number;
  byMonth: { month: string; present: number; absent: number; late: number }[];
}

export interface MessageThread {
  id: string;
  participants: { id: string; name: string; role: Role }[];
  subject: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount?: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  body: string;
  sentAt: string;
  read?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  publishedAt?: string;
  publishAt?: string;
  visibleUntil?: string;
  author: string;
  courseId?: string;
  audience?: string[];
  status?: "programado" | "publicado" | "expirado";
}

export interface CourseWork {
  id: string;
  title: string;
  type: "task" | "exam";
  dueDate: string;
  maxPoints: number;
  state?: string;
  description?: string;
  subject?: string;
  status?: string;
}

export interface Grade {
  studentId: string;
  studentName: string;
  workId: string;
  workTitle: string;
  grade: number;
  maxPoints: number;
  state?: string;
  gradedAt?: string;
}

export interface StudentDashboard {
  student: { id: string; displayName: string; courseName: string };
  attendance: { percentage: number; absentDays: number; totalDays?: number };
  upcomingWork: CourseWork[];
  recentGrades: {
    subject: string;
    assignmentTitle?: string;
    grade: number;
    maxGrade: number;
    gradedAt?: string;
  }[];
  reminders?: string[];
}

export interface TeacherDashboard {
  teacher: { id: string; displayName: string };
  courses: {
    id: string;
    name: string;
    studentCount: number;
    pendingGrades: number;
    upcomingWork: { title: string; dueDate: string }[];
  }[];
  unreadMessages: number;
  calendarToday: { time: string; subject: string }[];
}

export interface DirectorDashboard {
  school: { totalStudents: number; totalTeachers: number; totalCourses: number };
  attendance: { todayPercentage: number; weekAverage: number };
  grades: {
    schoolAverage: number;
    bySubject: { subject: string; average: number }[];
  };
  pendingAdmissions: number;
  recentActivity: { type: string; description: string; at: string }[];
}

export interface AIAssistantResponse {
  answer: string;
  sources: {
    type: string;
    id: string;
    title?: string;
    dueDate?: string;
  }[];
}
