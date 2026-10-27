export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string[];
  category: string;
  author: string;
  authorRole: string;
  publishedAt: string;
  timeAgo: string;
  views: number;
  likes?: number;
  commentsCount: number;
  image: string;
  featured?: boolean;
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorAvatar: string;
  instructorRole: string;
  lessons: number;
  duration: string;
  rating: number;
  studentsCount: number;
  price: string;
  originalPrice: string;
  image: string;
  badge?: string;
}

export interface VideoShort {
  id: string;
  title: string;
  author: string;
  views: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  fileType: string;
  fileSize: string;
  downloads: number;
  category: string;
  author: string;
}

export interface User {
  id: string;
  fullname: string;
  email: string;
  phone?: string;
  cccd?: string;
  role:
    | "student"
    | "teacher"
    | "admin"
    | "Học viên"
    | "Giảng viên"
    | "Ban quản trị";
  avatar: string;
  joinedDate?: string;
  bio?: string;
}

export interface Quiz {
  id: string;
  title: string;
  course_id?: string;
  teacher_id: string;
  teacher_name: string;
  duration_minutes: number;
  total_questions: number;
  subject: string;
  created_at?: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  teacher_id: string;
  teacher_name: string;
  members_count: number;
  subject: string;
  created_at?: string;
}

export interface Enrollment {
  id: string;
  enrollment_id?: string;
  user_id: string;
  course_id: string;
  progress_percent: number;
  status: string;
  enrolled_at?: string;
  title?: string;
  instructor?: string;
  image?: string;
  category?: string;
  price?: number;
}

export interface QuizSubmission {
  id: string;
  quiz_id: string;
  student_id: string;
  score: number;
  total_score: number;
  submitted_at: string;
}

export interface TeacherOverviewData {
  profile: any;
  stats: {
    coursesCount: number;
    totalStudents: number;
    quizzesCount: number;
    documentsCount: number;
    groupsCount: number;
  };
  courses: any[];
  quizzes: Quiz[];
  documents: any[];
  groups: StudyGroup[];
}

export interface StudentOverviewData {
  profile: any;
  stats: {
    enrolledCount: number;
    quizzesDone: number;
    groupsJoined: number;
  };
  enrollments: any[];
  quizzes: Quiz[];
  submissions: QuizSubmission[];
  groups: StudyGroup[];
}
