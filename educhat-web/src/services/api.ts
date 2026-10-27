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
};
