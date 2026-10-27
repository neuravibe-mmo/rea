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
  phone: string;
  cccd: string;
  role: "Học viên" | "Giảng viên" | "Ban quản trị";
  avatar: string;
  joinedDate: string;
}
