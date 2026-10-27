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
};
