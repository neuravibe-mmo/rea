const API_BASE = "http://127.0.0.1:5001/api";

export interface User {
  id: string;
  email: string;
  fullname: string;
  role: "student" | "teacher" | "admin";
  avatar: string;
  phone?: string;
  cccd?: string;
}

export const api = {
  // Authentication
  async login(
    email: string,
    password: string,
  ): Promise<{
    success: boolean;
    token?: string;
    user?: User;
    error?: string;
  }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await res.json();
  },

  async register(data: {
    fullname: string;
    email: string;
    password: string;
    phone?: string;
    cccd?: string;
    role: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  // Articles
  async getArticles(category?: string, search?: string) {
    const params = new URLSearchParams();
    if (category && category !== "Tất cả") params.append("category", category);
    if (search) params.append("search", search);

    const res = await fetch(`${API_BASE}/articles?${params.toString()}`);
    if (!res.ok) throw new Error(`Lỗi kết nối máy chủ (${res.status})`);
    const json = await res.json();
    return json.data || [];
  },

  async getArticleDetail(id: string) {
    const res = await fetch(`${API_BASE}/articles/${id}`);
    if (!res.ok) throw new Error(`Lỗi kết nối máy chủ (${res.status})`);
    const json = await res.json();
    return json.data;
  },

  async likeArticle(articleId: string) {
    const res = await fetch(`${API_BASE}/articles/${articleId}/like`, {
      method: "POST",
    });
    return await res.json();
  },

  async addComment(
    articleId: string,
    comment: {
      author_name: string;
      author_avatar: string;
      content: string;
      user_id?: string;
    },
  ) {
    const res = await fetch(`${API_BASE}/articles/${articleId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comment),
    });
    return await res.json();
  },

  // Courses
  async getCourses(category?: string, search?: string) {
    const params = new URLSearchParams();
    if (category && category !== "Tất cả") params.append("category", category);
    if (search) params.append("search", search);

    const res = await fetch(`${API_BASE}/courses?${params.toString()}`);
    if (!res.ok) throw new Error(`Lỗi kết nối máy chủ (${res.status})`);
    const json = await res.json();
    return json.data || [];
  },

  // Documents
  async getDocuments() {
    const res = await fetch(`${API_BASE}/documents`);
    if (!res.ok) throw new Error(`Lỗi kết nối máy chủ (${res.status})`);
    const json = await res.json();
    return json.data || [];
  },

  async recordDownload(id: string) {
    const res = await fetch(`${API_BASE}/documents/${id}/download`, {
      method: "POST",
    });
    return await res.json();
  },

  // Videos
  async getVideos() {
    const res = await fetch(`${API_BASE}/videos`);
    if (!res.ok) throw new Error(`Lỗi kết nối máy chủ (${res.status})`);
    const json = await res.json();
    return json.data || [];
  },

  // Stats
  async getStats() {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error(`Lỗi kết nối máy chủ (${res.status})`);
    const json = await res.json();
    return json.stats;
  },

  // Helper for Auth Token Header
  getAuthHeaders(): Record<string, string> {
    const token =
      localStorage.getItem("token") || localStorage.getItem("educhat_token");
    return token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };
  },

  async getMe() {
    const headers = this.getAuthHeaders();
    if (!headers.Authorization)
      return { success: false, error: "Chưa đăng nhập" };
    const res = await fetch(`${API_BASE}/auth/me`, { headers });
    if (!res.ok)
      return {
        success: false,
        error: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
      };
    return await res.json();
  },

  // Teacher Console LMS Endpoints
  async getTeacherOverview() {
    const res = await fetch(`${API_BASE}/teacher/overview`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok)
      throw new Error(
        `Lỗi xác thực hoặc không có quyền giảng viên (${res.status})`,
      );
    const json = await res.json();
    return json.data;
  },

  async createCourse(data: {
    title: string;
    category: string;
    price: number;
    originalPrice?: number;
    duration: string;
    level: string;
    image?: string;
  }) {
    const res = await fetch(`${API_BASE}/teacher/courses`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  async createQuiz(data: {
    title: string;
    course_id?: string;
    duration_minutes: number;
    total_questions: number;
    subject: string;
  }) {
    const res = await fetch(`${API_BASE}/teacher/quizzes`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  async createDocument(data: {
    title: string;
    file_type: string;
    file_size: string;
    category: string;
    file_url?: string;
  }) {
    const res = await fetch(`${API_BASE}/teacher/documents`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  async createGroup(data: {
    name: string;
    description: string;
    subject: string;
  }) {
    const res = await fetch(`${API_BASE}/teacher/groups`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  // Student Dashboard Endpoints
  async getStudentOverview() {
    const res = await fetch(`${API_BASE}/student/overview`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.ok) throw new Error(`Lỗi xác thực hoặc máy chủ (${res.status})`);
    const json = await res.json();
    return json.data;
  },

  async enrollCourse(course_id: string) {
    const res = await fetch(`${API_BASE}/student/enroll`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ course_id }),
    });
    return await res.json();
  },

  async submitQuiz(quiz_id: string, score: number, total_score: number = 10) {
    const res = await fetch(`${API_BASE}/student/quizzes/${quiz_id}/submit`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ score, total_score }),
    });
    return await res.json();
  },

  async getCourseDetail(id: string) {
    const res = await fetch(`${API_BASE}/courses/${id}`);
    if (!res.ok) throw new Error(`Lỗi tải chi tiết khóa học (${res.status})`);
    const json = await res.json();
    return json.data;
  },

  async getCourseReviews(courseId: string) {
    const res = await fetch(`${API_BASE}/courses/${courseId}/reviews`);
    if (!res.ok) throw new Error(`Lỗi tải đánh giá khóa học (${res.status})`);
    const json = await res.json();
    return json.data || { reviews: [], total: 0, averageRating: 5.0 };
  },

  async addCourseReview(
    courseId: string,
    review: {
      author_name?: string;
      author_avatar?: string;
      rating: number;
      content: string;
      user_id?: string;
    },
  ) {
    const res = await fetch(`${API_BASE}/courses/${courseId}/reviews`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(review),
    });
    return await res.json();
  },

  async getCourseStudents(courseId: string) {
    const res = await fetch(
      `${API_BASE}/teacher/courses/${courseId}/students`,
      {
        headers: this.getAuthHeaders(),
      },
    );
    if (!res.ok) throw new Error(`Lỗi tải danh sách học viên (${res.status})`);
    const json = await res.json();
    return json.data || [];
  },

  async addCourseLesson(
    courseId: string,
    lesson: {
      title: string;
      duration?: string;
      video_url?: string;
      is_free_preview?: boolean;
    },
  ) {
    const res = await fetch(`${API_BASE}/teacher/courses/${courseId}/lessons`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(lesson),
    });
    return await res.json();
  },

  async deleteCourseLesson(courseId: string, lessonId: string) {
    const res = await fetch(
      `${API_BASE}/teacher/courses/${courseId}/lessons/${lessonId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      },
    );
    return await res.json();
  },

  async updateCourse(
    courseId: string,
    data: {
      title?: string;
      price?: number;
      duration?: string;
      level?: string;
      category?: string;
    },
  ) {
    const res = await fetch(`${API_BASE}/teacher/courses/${courseId}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await res.json();
  },

  // Teacher Course Invitations
  async getEligibleStudents(courseId: string, query?: string) {
    const q = query ? `?q=${encodeURIComponent(query)}` : "";
    const res = await fetch(
      `${API_BASE}/teacher/courses/${courseId}/eligible-students${q}`,
      { headers: this.getAuthHeaders() },
    );
    return await res.json();
  },

  async sendCourseInvitation(
    courseId: string,
    studentId: string,
    message?: string,
  ) {
    const res = await fetch(
      `${API_BASE}/teacher/courses/${courseId}/invitations`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ studentId, message }),
      },
    );
    return await res.json();
  },

  async getCourseInvitations(courseId: string) {
    const res = await fetch(
      `${API_BASE}/teacher/courses/${courseId}/invitations`,
      { headers: this.getAuthHeaders() },
    );
    return await res.json();
  },

  async cancelCourseInvitation(courseId: string, invitationId: string) {
    const res = await fetch(
      `${API_BASE}/teacher/courses/${courseId}/invitations/${invitationId}`,
      {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      },
    );
    return await res.json();
  },

  // Student Course Invitations & Notifications
  async getStudentInvitations() {
    const res = await fetch(`${API_BASE}/student/invitations`, {
      headers: this.getAuthHeaders(),
    });
    return await res.json();
  },

  async respondCourseInvitation(
    invitationId: string,
    action: "accept" | "decline",
    paymentDetails?: {
      confirmed: boolean;
      method?: string;
      transactionId?: string;
      receiptImage?: string | null;
    },
  ) {
    const res = await fetch(
      `${API_BASE}/student/invitations/${invitationId}/respond`,
      {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ action, paymentDetails }),
      },
    );
    return await res.json();
  },

  async getStudentNotifications() {
    const res = await fetch(`${API_BASE}/student/notifications`, {
      headers: this.getAuthHeaders(),
    });
    return await res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/student/notifications/read-all`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    return await res.json();
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/student/notifications/${id}/read`, {
      method: "POST",
      headers: this.getAuthHeaders(),
    });
    return await res.json();
  },
};
