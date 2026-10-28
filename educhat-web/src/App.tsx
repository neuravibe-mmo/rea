import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { HeroBanner } from "./components/HeroBanner";
import { AuthModal } from "./components/AuthModal";
import { ArticleModal } from "./components/ArticleModal";
import { VideoModal } from "./components/VideoModal";
import { Footer } from "./components/Footer";
import { TeacherDashboard } from "./components/TeacherDashboard";
import { StudentDashboard } from "./components/StudentDashboard";
import { CourseDetailPage } from "./components/CourseDetailPage";
import { TeacherCourseWorkspacePage } from "./components/TeacherCourseWorkspacePage";
import { NotificationPage } from "./components/NotificationPage";
import type { Article, Course, VideoShort, DocumentItem, User } from "./types";
import {
  BookOpen,
  GraduationCap,
  Play,
  FileText,
  Clock,
  Eye,
  MessageSquare,
  ArrowRight,
  Download,
  Star,
  Users,
  CheckCircle,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Search,
  Filter,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { api } from "./services/api";

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [pendingInvitations, setPendingInvitations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");

  // Real Data states loaded directly from SQLite Backend
  const [articles, setArticles] = useState<Article[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [shorts, setShorts] = useState<VideoShort[]>([]);
  const [stats, setStats] = useState<
    | {
        members: number;
        teachers: number;
        courses: number;
        documents: number;
        totalDownloads?: number;
      }
    | undefined
  >(undefined);

  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Connection & Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Video shorts modal
  const [activeVideo, setActiveVideo] = useState<VideoShort | null>(null);

  // Selected Course and Previous Tab for Page Navigation
  const [selectedCourse, setSelectedCourse] = useState<Course | any | null>(
    null,
  );
  const [previousTab, setPreviousTab] = useState("home");

  const handleOpenCourseDetail = (courseItem: any) => {
    setSelectedCourse(courseItem);
    setPreviousTab(activeTab);
    setActiveTab("course_detail");
  };

  const handleOpenCourseWorkspace = (courseItem: any) => {
    setSelectedCourse(courseItem);
    setPreviousTab(activeTab);
    setActiveTab("teacher_course_workspace");
  };

  // Fetch all datasets from Backend API
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    setConnectionError(null);

    try {
      // 1. Articles
      const articlesData = await api.getArticles();
      const mappedArticles: Article[] = articlesData.map((item: any) => ({
        id: item.id,
        title: item.title,
        summary: item.excerpt,
        content: [item.content],
        category: item.category,
        author: item.author_name,
        authorRole: item.author_role || "Chuyên gia giáo dục",
        publishedAt: item.created_at,
        timeAgo: "Gần đây",
        views: item.views,
        likes: item.likes || 0,
        commentsCount: item.commentsCount || 0,
        image: item.cover_image,
      }));
      setArticles(mappedArticles);

      // 2. Courses
      const coursesData = await api.getCourses();
      const mappedCourses: Course[] = coursesData.map((c: any) => ({
        id: c.id,
        title: c.title,
        instructor: c.instructor,
        instructorAvatar: c.instructor_avatar,
        instructorRole: "Giảng viên Chuyên môn",
        lessons: 24,
        duration: c.duration,
        rating: c.rating,
        studentsCount: c.students_count,
        price: Number(c.price).toLocaleString("vi-VN") + " đ",
        originalPrice: Number(c.original_price).toLocaleString("vi-VN") + " đ",
        image: c.thumbnail,
        badge: c.rating >= 4.9 ? "Bán chạy nhất" : undefined,
      }));
      setCourses(mappedCourses);

      // 3. Documents
      const docsData = await api.getDocuments();
      const mappedDocs: DocumentItem[] = docsData.map((d: any) => ({
        id: d.id,
        title: d.title,
        fileType: d.file_type,
        fileSize: d.file_size,
        downloads: d.downloads_count,
        category: d.category,
        author: d.author_name,
      }));
      setDocuments(mappedDocs);

      // 4. Video Shorts
      const videosData = await api.getVideos();
      const mappedVideos: VideoShort[] = videosData.map((v: any) => ({
        id: v.id,
        title: v.title,
        author: v.author,
        views: Number(v.views).toLocaleString("vi-VN") + " lượt xem",
        duration: v.duration,
        thumbnail: v.thumbnail,
        videoUrl: v.video_url,
      }));
      setShorts(mappedVideos);

      // 5. Stats
      const statsData = await api.getStats();
      if (statsData) setStats(statsData);

      setConnectionError(null);
    } catch (err: any) {
      console.error("Lỗi kết nối Backend:", err);
      setConnectionError(
        "Không thể kết nối đến máy chủ Backend (http://127.0.0.1:5001). Vui lòng kiểm tra lại dịch vụ educhat-server!",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial user JWT verification & initial data load
  useEffect(() => {
    const verifyAuthSession = async () => {
      const token =
        localStorage.getItem("token") || localStorage.getItem("educhat_token");
      if (!token) {
        setUser(null);
        localStorage.removeItem("user");
        return;
      }

      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          const verifiedUser: User = {
            id: res.user.id,
            fullname: res.user.fullname,
            email: res.user.email,
            phone: res.user.phone || "0912345678",
            cccd: res.user.cccd || "001200001234",
            role:
              res.user.role === "teacher"
                ? "Giảng viên"
                : res.user.role === "admin"
                  ? "Ban quản trị"
                  : "Học viên",
            avatar:
              res.user.avatar ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
            joinedDate: "27/10/2026",
            bio: res.user.bio,
          };
          setUser(verifiedUser);
          localStorage.setItem("user", JSON.stringify(verifiedUser));
        } else {
          // Token is invalid or expired
          localStorage.removeItem("token");
          localStorage.removeItem("educhat_token");
          localStorage.removeItem("user");
          setUser(null);
        }
      } catch (e) {
        console.warn("Không thể xác thực JWT với máy chủ backend:", e);
      }
    };

    verifyAuthSession();
    loadAllData();
  }, [loadAllData]);

  // Fetch student notifications & pending invitations
  const fetchNotificationsCount = useCallback(async () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("educhat_token");
    if (!token) {
      setUnreadNotificationsCount(0);
      setPendingInvitations([]);
      return;
    }
    try {
      const [notifRes, invRes] = await Promise.all([
        api.getStudentNotifications(),
        api.getStudentInvitations().catch(() => ({ success: false, data: [] })),
      ]);
      if (notifRes.success) {
        setUnreadNotificationsCount(notifRes.unreadCount || 0);
      }
      if (invRes.success) {
        setPendingInvitations(invRes.data || []);
      }
    } catch (e) {
      console.error("Lỗi cập nhật số thông báo:", e);
    }
  }, []);

  useEffect(() => {
    fetchNotificationsCount();
    const interval = setInterval(fetchNotificationsCount, 15000);
    return () => clearInterval(interval);
  }, [fetchNotificationsCount, user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("educhat_token");
    setUser(null);
    setUnreadNotificationsCount(0);
    setPendingInvitations([]);
    setActiveTab("home");
  };

  // Filtered articles
  const filteredArticles = articles.filter((art) => {
    const matchesCategory =
      selectedCategory === "Tất cả" || art.category === selectedCategory;
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Load more articles from backend API
  const handleLoadMore = async () => {
    try {
      const nextPage = page + 1;
      const res = await fetch(
        `http://127.0.0.1:5001/api/articles?limit=6&offset=${page * 3}`,
      );
      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        const moreArticles: Article[] = json.data.map((item: any) => ({
          id: item.id,
          title: item.title,
          summary: item.excerpt,
          content: [item.content],
          category: item.category,
          author: item.author_name,
          authorRole: item.author_role || "Chuyên gia giáo dục",
          publishedAt: item.created_at,
          timeAgo: "Gần đây",
          views: item.views,
          likes: item.likes || 0,
          commentsCount: item.commentsCount || 0,
          image: item.cover_image,
        }));
        setArticles((prev) => [...prev, ...moreArticles]);
        setPage(nextPage);
        if (!json.hasMore) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    }
  };

  const handleDownloadDocument = async (doc: DocumentItem) => {
    try {
      const { api } = await import("./services/api");
      await api.recordDownload(doc.id);
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === doc.id ? { ...d, downloads: d.downloads + 1 } : d,
        ),
      );
    } catch (err) {
      console.error(err);
    }
    alert(
      `Đang tải tệp: ${doc.title}.${doc.fileType.toLowerCase()}...\nLượt tải đã được lưu vào Database!`,
    );
  };

  const categories = [
    "Tất cả",
    "Chính sách",
    "Đề thi & Tuyển sinh",
    "Công nghệ EdTech",
    "Chương trình",
  ];

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <Header
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNotifications={() => setActiveTab("notifications")}
        unreadNotificationsCount={unreadNotificationsCount}
      />

      {/* Backend Connection Error Alert Banner */}
      {connectionError && (
        <div
          style={{
            background: "#fff1f2",
            borderBottom: "2px solid #f43f5e",
            padding: "16px 24px",
            color: "#9f1239",
            boxShadow: "0 4px 12px rgba(244, 63, 94, 0.12)",
            position: "sticky",
            top: "70px",
            zIndex: 90,
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  background: "#ffe4e6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <WifiOff size={20} color="#e11d48" />
              </div>
              <div>
                <strong
                  style={{
                    fontSize: "15px",
                    display: "block",
                    color: "#881337",
                    marginBottom: "2px",
                  }}
                >
                  Không thể kết nối đến máy chủ Backend (Port 5001)
                </strong>
                <span style={{ fontSize: "13px", color: "#be123c" }}>
                  {connectionError}
                </span>
              </div>
            </div>

            <button
              onClick={loadAllData}
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                background: "#e11d48",
                borderColor: "#be123c",
                padding: "9px 20px",
                fontSize: "13px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <RefreshCw
                size={15}
                style={{
                  animation: isLoading ? "spin 1s linear infinite" : "none",
                }}
              />
              <span>
                {isLoading ? "Đang kết nối lại..." : "Thử kết nối lại"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {/* Pending Course Invitation Notice Banner */}
        {user && pendingInvitations.length > 0 && activeTab === "home" && (
          <div
            style={{
              background: "linear-gradient(90deg, #f0f9ff 0%, #ecfdf5 100%)",
              borderBottom: "1px solid #bae6fd",
              padding: "12px 24px",
              boxShadow: "0 2px 8px rgba(2, 132, 199, 0.08)",
            }}
          >
            <div
              className="container"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "10px",
                    background: "#0284c7",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(2, 132, 199, 0.35)",
                    flexShrink: 0,
                  }}
                >
                  <Bell size={20} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Bạn có {pendingInvitations.length} lời mời tham gia khóa học
                    mới từ Giảng viên!
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#475569",
                      marginTop: "2px",
                    }}
                  >
                    Khóa học:{" "}
                    <strong style={{ color: "#0284c7" }}>
                      "{pendingInvitations[0].course_title}"
                    </strong>{" "}
                    từ <strong>{pendingInvitations[0].teacher_name}</strong>
                    {pendingInvitations.length > 1 &&
                      ` và ${pendingInvitations.length - 1} lời mời khác`}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("notifications")}
                style={{
                  background: "#0284c7",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 18px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)",
                }}
              >
                <span>Xem thông báo & Tham gia ngay</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* TAB: TRANG CHỦ */}
        {activeTab === "home" && (
          <>
            <HeroBanner
              stats={stats}
              onExplore={() => {
                const el = document.getElementById("articles-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              onJoinClick={() => {
                if (!user) setAuthModalOpen(true);
                else setActiveTab("articles");
              }}
            />

            {/* Articles Section */}
            <section id="articles-section" style={{ padding: "48px 0" }}>
              <div className="container">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    marginBottom: "28px",
                    flexWrap: "wrap",
                    gap: "16px",
                  }}
                >
                  <div>
                    <span
                      className="badge badge-blue"
                      style={{ marginBottom: "8px" }}
                    >
                      Tin tức & Bài viết sư phạm
                    </span>
                    <h2
                      style={{
                        fontSize: "28px",
                        fontWeight: 800,
                        fontFamily: "var(--font-display)",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      Tiêu Điểm Giáo Dục Việt Nam
                    </h2>
                  </div>

                  {/* Filter Pills */}
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        style={{
                          padding: "7px 14px",
                          borderRadius: "var(--radius-full)",
                          border: "1.5px solid",
                          borderColor:
                            selectedCategory === cat
                              ? "var(--primary)"
                              : "var(--border-light)",
                          background:
                            selectedCategory === cat
                              ? "var(--primary-light)"
                              : "#fff",
                          color:
                            selectedCategory === cat
                              ? "var(--primary)"
                              : "var(--text-muted)",
                          fontSize: "13px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s",
                        }}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Articles Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(360px, 1fr))",
                    gap: "24px",
                  }}
                >
                  {filteredArticles.map((art) => (
                    <article
                      key={art.id}
                      className="glass-card"
                      style={{
                        cursor: "pointer",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      onClick={() => setActiveArticle(art)}
                    >
                      <div
                        style={{
                          position: "relative",
                          height: "210px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={art.image}
                          alt={art.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.4s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = "scale(1.05)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = "scale(1)")
                          }
                        />
                        <span
                          className="badge badge-blue"
                          style={{
                            position: "absolute",
                            top: "14px",
                            left: "14px",
                          }}
                        >
                          {art.category}
                        </span>
                      </div>

                      <div
                        style={{
                          padding: "20px",
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            fontSize: "12px",
                            color: "var(--text-subtle)",
                            marginBottom: "10px",
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Clock size={13} /> {art.timeAgo}
                          </span>
                          <span>•</span>
                          <span>{art.author}</span>
                        </div>

                        <h3
                          style={{
                            fontSize: "17px",
                            fontWeight: 700,
                            lineHeight: 1.4,
                            marginBottom: "10px",
                            color: "var(--text-main)",
                            fontFamily: "var(--font-sans)",
                          }}
                        >
                          {art.title}
                        </h3>

                        <p
                          style={{
                            fontSize: "14px",
                            color: "var(--text-muted)",
                            lineHeight: 1.5,
                            marginBottom: "16px",
                            flex: 1,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {art.summary}
                        </p>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingTop: "12px",
                            borderTop: "1px solid var(--border-light)",
                            fontSize: "12px",
                            color: "var(--text-muted)",
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            <Eye size={13} /> {art.views.toLocaleString()} lượt
                            xem
                          </span>
                          <span
                            style={{
                              color: "var(--primary)",
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              gap: "4px",
                            }}
                          >
                            Đọc tiếp <ArrowRight size={13} />
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Load more button */}
                <div style={{ textAlign: "center", marginTop: "36px" }}>
                  {hasMore ? (
                    <button
                      onClick={handleLoadMore}
                      className="btn btn-outline"
                      style={{ padding: "10px 28px", fontSize: "14px" }}
                    >
                      <PlusCircle size={16} />
                      <span>Xem thêm bài viết sư phạm</span>
                    </button>
                  ) : (
                    <p
                      style={{
                        fontSize: "14px",
                        color: "var(--text-subtle)",
                        fontWeight: 600,
                      }}
                    >
                      ✓ Bạn đã xem toàn bộ bài viết mới nhất trên EduChat.vn
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Video Shorts Showcase (JWPlayer Simulation) */}
            <section
              style={{
                padding: "48px 0",
                background: "#0a192f",
                color: "#fff",
              }}
            >
              <div className="container">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "28px",
                  }}
                >
                  <div>
                    <span
                      className="badge badge-emerald"
                      style={{ marginBottom: "8px" }}
                    >
                      EduChat Shorts & Bài giảng
                    </span>
                    <h2
                      style={{
                        fontSize: "26px",
                        fontWeight: 800,
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      Video Vi Mô & Phương Pháp Giảng Dạy
                    </h2>
                  </div>
                  <span
                    style={{
                      fontSize: "13px",
                      color: "rgba(255, 255, 255, 0.65)",
                    }}
                  >
                    Tích hợp JWPlayer tối ưu hóa đường truyền
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "22px",
                  }}
                >
                  {shorts.map((vid) => (
                    <div
                      key={vid.id}
                      onClick={() => setActiveVideo(vid)}
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                        cursor: "pointer",
                        transition: "transform 0.2s",
                        position: "relative",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-4px)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "translateY(0)")
                      }
                    >
                      <div style={{ position: "relative", height: "190px" }}>
                        <img
                          src={vid.thumbnail}
                          alt={vid.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0, 0, 0, 0.35)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <div
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              background: "rgba(37, 99, 235, 0.9)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              boxShadow: "0 0 20px rgba(37, 99, 235, 0.6)",
                            }}
                          >
                            <Play
                              size={20}
                              fill="#fff"
                              color="#fff"
                              style={{ marginLeft: "3px" }}
                            />
                          </div>
                        </div>
                        <span
                          style={{
                            position: "absolute",
                            bottom: "10px",
                            right: "10px",
                            background: "rgba(0, 0, 0, 0.75)",
                            fontSize: "11px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontWeight: 600,
                          }}
                        >
                          {vid.duration}
                        </span>
                      </div>

                      <div style={{ padding: "16px" }}>
                        <h4
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            lineHeight: 1.4,
                            marginBottom: "6px",
                          }}
                        >
                          {vid.title}
                        </h4>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "rgba(255, 255, 255, 0.65)",
                          }}
                        >
                          {vid.author} • {vid.views}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Courses Showcase */}
            <section style={{ padding: "56px 0", background: "var(--bg-alt)" }}>
              <div className="container">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "32px",
                  }}
                >
                  <div>
                    <span
                      className="badge badge-purple"
                      style={{ marginBottom: "8px" }}
                    >
                      Khoá học trực tuyến Unica
                    </span>
                    <h2
                      style={{
                        fontSize: "26px",
                        fontWeight: 800,
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      Khóa Học Nổi Bật Dành Cho Thầy Cô & Học Viên
                    </h2>
                  </div>
                  <button
                    onClick={() => setActiveTab("courses")}
                    className="btn btn-outline"
                  >
                    <span>Xem tất cả khóa học</span>
                    <ArrowRight size={15} />
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(360px, 1fr))",
                    gap: "24px",
                  }}
                >
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className="glass-card"
                      onClick={() => handleOpenCourseDetail(course)}
                      style={{
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        cursor: "pointer",
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}
                    >
                      <div style={{ position: "relative", height: "180px" }}>
                        <img
                          src={course.image}
                          alt={course.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        {course.badge && (
                          <span
                            className="badge badge-orange"
                            style={{
                              position: "absolute",
                              top: "12px",
                              left: "12px",
                            }}
                          >
                            {course.badge}
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          padding: "20px",
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "12px",
                            color: "#ea580c",
                            fontWeight: 700,
                            marginBottom: "8px",
                          }}
                        >
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <span>{course.rating.toFixed(1)}</span>
                          <span
                            style={{
                              color: "var(--text-subtle)",
                              fontWeight: 400,
                            }}
                          >
                            ({course.studentsCount.toLocaleString()} học viên)
                          </span>
                        </div>

                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: 700,
                            lineHeight: 1.4,
                            marginBottom: "14px",
                            flex: 1,
                          }}
                        >
                          {course.title}
                        </h3>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "16px",
                          }}
                        >
                          <img
                            src={course.instructorAvatar}
                            alt={course.instructor}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          <div style={{ fontSize: "12px" }}>
                            <strong
                              style={{
                                display: "block",
                                color: "var(--text-main)",
                              }}
                            >
                              {course.instructor}
                            </strong>
                            <span style={{ color: "var(--text-muted)" }}>
                              {course.instructorRole}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingTop: "14px",
                            borderTop: "1px solid var(--border-light)",
                          }}
                        >
                          <div>
                            <span
                              style={{
                                fontSize: "18px",
                                fontWeight: 800,
                                color: "var(--primary)",
                              }}
                            >
                              {course.price}
                            </span>
                            <span
                              style={{
                                fontSize: "12px",
                                color: "var(--text-subtle)",
                                textDecoration: "line-through",
                                marginLeft: "8px",
                              }}
                            >
                              {course.originalPrice}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenCourseDetail(course);
                            }}
                            className="btn btn-primary"
                            style={{ padding: "8px 16px", fontSize: "13px" }}
                          >
                            Chi tiết & Đăng ký
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* TAB: BÀI VIẾT */}
        {activeTab === "articles" && (
          <div className="container" style={{ padding: "48px 20px" }}>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 800,
                marginBottom: "12px",
                fontFamily: "var(--font-display)",
              }}
            >
              Diễn Đàn Bài Viết & Bình Luận Giáo Dục
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
              Nơi các nhà giáo và học sinh trao đổi chuyên môn, cập nhật chính
              sách và đề tài nghiên cứu sư phạm.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                gap: "24px",
              }}
            >
              {filteredArticles.map((art) => (
                <article
                  key={art.id}
                  className="glass-card"
                  style={{ cursor: "pointer", overflow: "hidden" }}
                  onClick={() => setActiveArticle(art)}
                >
                  <img
                    src={art.image}
                    alt={art.title}
                    style={{
                      width: "100%",
                      height: "180px",
                      objectFit: "cover",
                    }}
                  />
                  <div style={{ padding: "20px" }}>
                    <span
                      className="badge badge-blue"
                      style={{ marginBottom: "8px" }}
                    >
                      {art.category}
                    </span>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        marginBottom: "8px",
                      }}
                    >
                      {art.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--text-muted)",
                        lineHeight: 1.5,
                      }}
                    >
                      {art.summary}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* TAB: KHÓA HỌC */}
        {activeTab === "courses" && (
          <div className="container" style={{ padding: "48px 20px" }}>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 800,
                marginBottom: "12px",
                fontFamily: "var(--font-display)",
              }}
            >
              Chương Trình Khóa Học Trực Tuyến
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
              Nâng cao năng lực chuyển đổi số, phương pháp giảng dạy tích cực và
              bồi dưỡng kiến thức thi cử.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                gap: "24px",
              }}
            >
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="glass-card"
                  onClick={() => handleOpenCourseDetail(course)}
                  style={{
                    padding: "24px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    style={{
                      width: "100%",
                      height: "180px",
                      borderRadius: "var(--radius-sm)",
                      objectFit: "cover",
                      marginBottom: "14px",
                    }}
                  />
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      marginBottom: "10px",
                    }}
                  >
                    {course.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      marginBottom: "16px",
                    }}
                  >
                    Giảng viên: {course.instructor}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <strong
                      style={{ fontSize: "18px", color: "var(--primary)" }}
                    >
                      {course.price}
                    </strong>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenCourseDetail(course);
                      }}
                      className="btn btn-primary"
                    >
                      Xem & Đăng ký
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: TÀI LIỆU */}
        {activeTab === "documents" && (
          <div className="container" style={{ padding: "48px 20px" }}>
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 800,
                marginBottom: "12px",
                fontFamily: "var(--font-display)",
              }}
            >
              Kho Học Liệu & Đề Thi Mở
            </h1>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
              Tải miễn phí các bộ tài liệu, giáo án điện tử và đề thi minh họa
              chất lượng cao.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="glass-card"
                  style={{
                    padding: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "10px",
                        background: "#fee2e2",
                        color: "#dc2626",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                      }}
                    >
                      {doc.fileType}
                    </div>
                    <div>
                      <h4
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          marginBottom: "4px",
                        }}
                      >
                        {doc.title}
                      </h4>
                      <div
                        style={{ fontSize: "12px", color: "var(--text-muted)" }}
                      >
                        Chuyên mục: {doc.category} • Dung lượng: {doc.fileSize}{" "}
                        • Lượt tải: {doc.downloads.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadDocument(doc)}
                    className="btn btn-primary"
                    style={{ padding: "10px 18px", fontSize: "13px" }}
                  >
                    <Download size={15} />
                    <span>Tải về máy</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: GIỚI THIỆU */}
        {activeTab === "about" && (
          <div
            className="container"
            style={{ padding: "48px 20px", maxWidth: "840px" }}
          >
            <h1
              style={{
                fontSize: "32px",
                fontWeight: 800,
                marginBottom: "16px",
                fontFamily: "var(--font-display)",
              }}
            >
              Về Mạng Xã Hội Giáo Dục EduChat.vn
            </h1>
            <div
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                padding: "16px",
                borderRadius: "var(--radius-md)",
                marginBottom: "24px",
              }}
            >
              <strong
                style={{
                  color: "#166534",
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                Giấy phép hoạt động Mạng xã hội:
              </strong>
              <p style={{ fontSize: "14px", color: "#15803d", margin: 0 }}>
                Giấy phép số <strong>380/GP-BTTTT</strong> do Bộ Thông tin và
                Truyền thông cấp ngày 16/12/2024.
                <br />
                Đơn vị chủ quản: CÔNG TY CỔ PHẦN TƯ VẤN DỊCH VỤ TRUYỀN THÔNG
                ATHENA.
              </p>
            </div>

            <div
              style={{
                fontSize: "15px",
                lineHeight: 1.8,
                color: "#334155",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <p>
                EduChat.vn ra đời với sứ mệnh xây dựng một môi trường mạng xã
                hội lành mạnh, chuyên sâu và thuần túy phục vụ cho ngành giáo
                dục tại Việt Nam.
              </p>
              <p>
                Tại đây, các nhà giáo, chuyên gia và học sinh có thể tự do trao
                đổi phương pháp dạy học mới, tham gia thảo luận các văn bản dự
                thảo chính sách giáo dục, và chia sẻ các nguồn học liệu số hóa
                phục vụ cộng đồng.
              </p>
              <h3
                style={{
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  marginTop: "16px",
                }}
              >
                Thông tin liên hệ & Văn phòng:
              </h3>
              <ul style={{ paddingLeft: "20px" }}>
                <li>
                  Địa chỉ: Số 4/148 Hoàng Ngân, phường Trung Hòa, quận Cầu Giấy,
                  TP Hà Nội.
                </li>
                <li>Hotline: 0989 928 663</li>
                <li>Người chịu trách nhiệm nội dung: Lê Thị Minh Hằng</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB: HỒ SƠ CÁ NHÂN */}
        {activeTab === "profile" && user && (
          <div
            className="container"
            style={{ padding: "48px 20px", maxWidth: "720px" }}
          >
            <div className="glass-card" style={{ padding: "36px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "24px",
                  marginBottom: "28px",
                }}
              >
                <img
                  src={user.avatar}
                  alt={user.fullname}
                  style={{
                    width: "84px",
                    height: "84px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid var(--primary)",
                  }}
                />
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: 800 }}>
                    {user.fullname}
                  </h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                    {user.email}
                  </p>
                  <span
                    className="badge badge-emerald"
                    style={{ marginTop: "8px" }}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  fontSize: "14px",
                }}
              >
                <div
                  style={{
                    background: "var(--bg-alt)",
                    padding: "14px",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-subtle)",
                      display: "block",
                      fontSize: "12px",
                    }}
                  >
                    Số điện thoại:
                  </span>
                  <strong>{user.phone}</strong>
                </div>
                <div
                  style={{
                    background: "var(--bg-alt)",
                    padding: "14px",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-subtle)",
                      display: "block",
                      fontSize: "12px",
                    }}
                  >
                    Số CCCD xác thực MXH:
                  </span>
                  <strong>{user.cccd}</strong>
                </div>
                <div
                  style={{
                    background: "var(--bg-alt)",
                    padding: "14px",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-subtle)",
                      display: "block",
                      fontSize: "12px",
                    }}
                  >
                    Ngày gia nhập:
                  </span>
                  <strong>{user.joinedDate}</strong>
                </div>
                <div
                  style={{
                    background: "var(--bg-alt)",
                    padding: "14px",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <span
                    style={{
                      color: "var(--text-subtle)",
                      display: "block",
                      fontSize: "12px",
                    }}
                  >
                    Trạng thái xác thực:
                  </span>
                  <strong style={{ color: "#16a34a" }}>
                    Đã xác thực danh tính MXH
                  </strong>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ marginTop: "32px", width: "100%", padding: "12px" }}
              >
                Đăng xuất tài khoản
              </button>
            </div>
          </div>
        )}

        {/* LMS TEACHER CONSOLE VIEW */}
        {activeTab === "teacher_console" && (
          <TeacherDashboard
            onNavigateHome={() => setActiveTab("home")}
            onSelectCourseDetail={handleOpenCourseDetail}
            onSelectCourseWorkspace={handleOpenCourseWorkspace}
          />
        )}

        {/* STUDENT DASHBOARD VIEW */}
        {activeTab === "student_dashboard" && (
          <StudentDashboard
            onNavigateHome={() => setActiveTab("home")}
            onExploreCourses={() => setActiveTab("courses")}
          />
        )}

        {/* COURSE DETAIL FULL-PAGE VIEW (DIRECTION 1) */}
        {activeTab === "course_detail" && selectedCourse && (
          <CourseDetailPage
            course={selectedCourse}
            currentUser={user}
            onBack={() => setActiveTab(previousTab || "courses")}
            onOpenTeacherWorkspace={
              user?.role === "teacher" ||
              user?.role === "Giảng viên" ||
              user?.role === "admin" ||
              selectedCourse.instructor === user?.fullname
                ? handleOpenCourseWorkspace
                : undefined
            }
            onEnrollSuccess={() => loadAllData()}
          />
        )}

        {/* TEACHER COURSE WORKSPACE FULL-PAGE VIEW (DIRECTION 2) */}
        {activeTab === "teacher_course_workspace" && selectedCourse && (
          <TeacherCourseWorkspacePage
            course={selectedCourse}
            onBackToDetail={handleOpenCourseDetail}
            onBackToTeacherConsole={() => setActiveTab("teacher_console")}
            onCourseUpdated={() => loadAllData()}
          />
        )}
        {/* NOTIFICATIONS FULL-PAGE VIEW */}
        {activeTab === "notifications" && (
          <NotificationPage
            user={user}
            onNavigateHome={() => setActiveTab("home")}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onNotificationsChanged={() => {
              fetchNotificationsCount();
              loadAllData();
            }}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />

      <ArticleModal
        article={activeArticle}
        onClose={() => setActiveArticle(null)}
        currentUser={user}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
}

export default App;
