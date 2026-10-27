import React, { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  Users,
  Award,
  Plus,
  CheckCircle2,
  Clock,
  Upload,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  X,
} from "lucide-react";
import { api } from "../services/api";
import type { TeacherOverviewData } from "../types";
import { CourseDetailModal } from "./CourseDetailModal";
import { TeacherCourseWorkspaceModal } from "./TeacherCourseWorkspaceModal";

interface TeacherDashboardProps {
  onNavigateHome: () => void;
  onSelectCourseDetail?: (course: any) => void;
  onSelectCourseWorkspace?: (course: any) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onNavigateHome,
  onSelectCourseDetail,
  onSelectCourseWorkspace,
}) => {
  const [data, setData] = useState<TeacherOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "courses" | "quizzes" | "documents" | "groups" | "profile"
  >("courses");

  // Modals state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // Course Detail (Direction 1) & Workspace (Direction 2) states
  const [selectedDetailCourse, setSelectedDetailCourse] = useState<any | null>(
    null,
  );
  const [selectedWorkspaceCourse, setSelectedWorkspaceCourse] = useState<
    any | null
  >(null);

  // Form states
  const [newCourse, setNewCourse] = useState({
    title: "",
    category: "Toán học & Khoa học",
    price: 0,
    duration: "12 giờ",
    level: "Cơ bản đến Nâng cao",
  });
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    subject: "Toán học",
    duration_minutes: 45,
    total_questions: 20,
  });
  const [newDoc, setNewDoc] = useState({
    title: "",
    file_type: "PDF",
    file_size: "3.5 MB",
    category: "Giáo án",
  });
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    subject: "Phương pháp sư phạm",
  });

  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getTeacherOverview();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Không thể tải dữ liệu Giảng viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createCourse(newCourse);
      if (res.success) {
        setShowCourseModal(false);
        setActionSuccess(
          "Khóa học mới đã được phê duyệt và phát hành thành công!",
        );
        fetchOverview();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err: any) {
      alert("Lỗi tạo khóa học: " + err.message);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createQuiz(newQuiz);
      if (res.success) {
        setShowQuizModal(false);
        setActionSuccess("Bộ đề kiểm tra đánh giá đã được tạo thành công!");
        fetchOverview();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err: any) {
      alert("Lỗi tạo bài thi: " + err.message);
    }
  };

  const handleCreateDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createDocument(newDoc);
      if (res.success) {
        setShowDocModal(false);
        setActionSuccess("Tài liệu sư phạm đã được đăng tải lên kho học liệu!");
        fetchOverview();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err: any) {
      alert("Lỗi tải tài liệu: " + err.message);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createGroup(newGroup);
      if (res.success) {
        setShowGroupModal(false);
        setActionSuccess("Nhóm học tập & chuyên môn mới đã được thành lập!");
        fetchOverview();
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err: any) {
      alert("Lỗi tạo nhóm: " + err.message);
    }
  };

  if (loading) {
    return (
      <div
        className="dashboard-wrapper"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            border: "4px solid #4f46e5",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            marginBottom: "16px",
          }}
        />
        <h3
          style={{
            fontSize: "17px",
            fontWeight: 700,
            color: "var(--text-main)",
          }}
        >
          Đang nạp Bàn làm việc Giảng viên (LMS Teacher Console)...
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Đang xác thực phiên JWT hai chiều bảo mật
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        className="dashboard-wrapper"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            padding: "20px",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "14px",
            maxWidth: "460px",
            width: "100%",
            marginBottom: "16px",
          }}
        >
          <strong style={{ display: "block", marginBottom: "4px" }}>
            Không thể mở Bàn làm việc Giảng viên
          </strong>
          <span style={{ fontSize: "13px" }}>{error}</span>
        </div>
        <button onClick={onNavigateHome} className="btn btn-primary">
          Quay lại Trang chủ EduChat
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* Top Banner */}
      <section className="dashboard-banner-teacher">
        <div className="container">
          <div className="dashboard-header-flex">
            <div className="dashboard-user-info">
              <div style={{ position: "relative" }}>
                <img
                  src={
                    data.profile.avatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                  }
                  alt={data.profile.fullname}
                  className="dashboard-avatar"
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: "-4px",
                    right: "-4px",
                    background: "#10b981",
                    color: "#fff",
                    padding: "4px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  }}
                >
                  <ShieldCheck size={14} />
                </span>
              </div>
              <div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <h1
                    style={{
                      fontSize: "24px",
                      fontWeight: 800,
                      margin: 0,
                      color: "#fff",
                    }}
                  >
                    {data.profile.fullname}
                  </h1>
                  <span
                    className="badge"
                    style={{
                      background: "rgba(245, 158, 11, 0.25)",
                      color: "#fbbf24",
                      border: "1px solid rgba(245, 158, 11, 0.4)",
                    }}
                  >
                    Giảng viên Cao cấp
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255, 255, 255, 0.8)",
                    margin: "4px 0 0",
                    maxWidth: "540px",
                  }}
                >
                  {data.profile.bio ||
                    "Chuyên gia giáo dục & Đổi mới phương pháp giảng dạy"}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    fontSize: "12px",
                    color: "rgba(255, 255, 255, 0.65)",
                    marginTop: "6px",
                  }}
                >
                  <span>Mã GV: {data.profile.id}</span>
                  <span>•</span>
                  <span>Email: {data.profile.email}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={onNavigateHome}
                className="btn btn-secondary"
                style={{ fontSize: "13px" }}
              >
                <span>Xem Trang tin</span>
                <ExternalLink size={14} />
              </button>
              <button
                onClick={() => setShowCourseModal(true)}
                className="btn"
                style={{
                  background: "#f59e0b",
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: "13px",
                  boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
                }}
              >
                <Plus size={16} />
                <span>Tạo Khóa học mới</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="dashboard-metrics-grid">
            <div className="dashboard-metric-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "rgba(255, 255, 255, 0.75)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <span>Khóa học phụ trách</span>
                <BookOpen size={16} color="#fbbf24" />
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#fff",
                  marginTop: "6px",
                }}
              >
                {data.stats.coursesCount}
              </div>
            </div>

            <div className="dashboard-metric-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "rgba(255, 255, 255, 0.75)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <span>Học viên đang học</span>
                <Users size={16} color="#34d399" />
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#fff",
                  marginTop: "6px",
                }}
              >
                {data.stats.totalStudents.toLocaleString("vi-VN")}
              </div>
            </div>

            <div className="dashboard-metric-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "rgba(255, 255, 255, 0.75)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <span>Bài kiểm tra / Đề thi</span>
                <CheckCircle2 size={16} color="#38bdf8" />
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#fff",
                  marginTop: "6px",
                }}
              >
                {data.stats.quizzesCount}
              </div>
            </div>

            <div className="dashboard-metric-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "rgba(255, 255, 255, 0.75)",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <span>Nhóm chuyên môn</span>
                <MessageSquare size={16} color="#c084fc" />
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#fff",
                  marginTop: "6px",
                }}
              >
                {data.stats.groupsCount}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="container" style={{ marginTop: "24px" }}>
        {/* Success Alert */}
        {actionSuccess && (
          <div className="alert-success-box">
            <CheckCircle2 size={18} color="#059669" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="dashboard-tabs-bar">
          <button
            onClick={() => setActiveTab("courses")}
            className={`dashboard-tab-btn ${activeTab === "courses" ? "active-teacher" : ""}`}
          >
            <BookOpen size={16} />
            <span>1. Khóa học ({data.courses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("quizzes")}
            className={`dashboard-tab-btn ${activeTab === "quizzes" ? "active-teacher" : ""}`}
          >
            <CheckCircle2 size={16} />
            <span>2. Bài kiểm tra & Đánh giá ({data.quizzes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("documents")}
            className={`dashboard-tab-btn ${activeTab === "documents" ? "active-teacher" : ""}`}
          >
            <FileText size={16} />
            <span>3. Quản lý Tài liệu ({data.documents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("groups")}
            className={`dashboard-tab-btn ${activeTab === "groups" ? "active-teacher" : ""}`}
          >
            <Users size={16} />
            <span>4. Nhóm học tập & Thảo luận ({data.groups.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`dashboard-tab-btn ${activeTab === "profile" ? "active-teacher" : ""}`}
          >
            <Award size={16} />
            <span>5. Hồ sơ & Thương hiệu Chuyên môn</span>
          </button>
        </div>

        {/* TAB 1: COURSES MANAGEMENT */}
        {activeTab === "courses" && (
          <div>
            <div className="dashboard-action-bar">
              <div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--text-main)",
                    margin: 0,
                  }}
                >
                  Danh sách Khóa học giảng dạy trực tuyến
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    margin: "2px 0 0",
                  }}
                >
                  Quản lý nội dung bài giảng, bài tập đính kèm và theo dõi học
                  viên
                </p>
              </div>
              <button
                onClick={() => setShowCourseModal(true)}
                className="btn btn-primary"
                style={{ fontSize: "13px" }}
              >
                <Plus size={15} />
                <span>Soạn Khóa học mới</span>
              </button>
            </div>

            <div className="dashboard-cards-grid">
              {data.courses.map((course) => (
                <div
                  key={course.id}
                  className="dashboard-card-item"
                  onClick={() =>
                    onSelectCourseDetail
                      ? onSelectCourseDetail(course)
                      : setSelectedDetailCourse(course)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "16/9",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={
                        course.image ||
                        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600"
                      }
                      alt={course.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <span
                      className="badge badge-blue"
                      style={{
                        position: "absolute",
                        top: "12px",
                        left: "12px",
                      }}
                    >
                      {course.category}
                    </span>
                  </div>

                  <div
                    style={{
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      flex: 1,
                      justifyContent: "space-between",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        lineHeight: 1.4,
                        marginBottom: "14px",
                      }}
                    >
                      {course.title}
                    </h4>

                    <div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(3, 1fr)",
                          textAlign: "center",
                          borderTop: "1px solid #f1f5f9",
                          paddingTop: "12px",
                          gap: "8px",
                          fontSize: "12px",
                          color: "var(--text-muted)",
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              display: "block",
                              color: "var(--text-main)",
                              fontSize: "14px",
                            }}
                          >
                            {course.lessons_count || 12}
                          </strong>
                          <span>Bài giảng</span>
                        </div>
                        <div>
                          <strong
                            style={{
                              display: "block",
                              color: "var(--text-main)",
                              fontSize: "14px",
                            }}
                          >
                            {course.students_count || 0}
                          </strong>
                          <span>Học viên</span>
                        </div>
                        <div>
                          <strong
                            style={{
                              display: "block",
                              color: "#d97706",
                              fontSize: "14px",
                            }}
                          >
                            {course.rating || 4.9} ★
                          </strong>
                          <span>Đánh giá</span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "14px",
                          paddingTop: "10px",
                          borderTop: "1px solid #f1f5f9",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 800,
                            color: "#4f46e5",
                            fontSize: "14px",
                          }}
                        >
                          {course.price
                            ? `${course.price.toLocaleString("vi-VN")} đ`
                            : "Miễn phí"}
                        </span>
                        <span
                          className="badge badge-emerald"
                          style={{ fontSize: "10px" }}
                        >
                          Đang mở lớp
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginTop: "12px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectCourseDetail) {
                              onSelectCourseDetail(course);
                            } else {
                              setSelectedDetailCourse(course);
                            }
                          }}
                          className="btn"
                          style={{
                            flex: 1,
                            fontSize: "12px",
                            padding: "8px 10px",
                            background: "#eff6ff",
                            color: "#2563eb",
                            border: "1px solid #bfdbfe",
                            fontWeight: 600,
                            borderRadius: "8px",
                          }}
                        >
                          👁️ Tổng quan (H.1)
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectCourseWorkspace) {
                              onSelectCourseWorkspace(course);
                            } else {
                              setSelectedWorkspaceCourse(course);
                            }
                          }}
                          className="btn"
                          style={{
                            flex: 1,
                            fontSize: "12px",
                            padding: "8px 10px",
                            background:
                              "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            color: "#0f172a",
                            fontWeight: 700,
                            border: "none",
                            borderRadius: "8px",
                            boxShadow: "0 2px 8px rgba(245, 158, 11, 0.25)",
                          }}
                        >
                          ⚙️ Quản trị (H.2)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: QUIZZES & ASSESSMENTS */}
        {activeTab === "quizzes" && (
          <div>
            <div className="dashboard-action-bar">
              <div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--text-main)",
                    margin: 0,
                  }}
                >
                  Ngân hàng Đề kiểm tra & Đánh giá Năng lực
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    margin: "2px 0 0",
                  }}
                >
                  Thiết lập bài kiểm tra trắc nghiệm, thời gian làm bài và chấm
                  điểm tự động
                </p>
              </div>
              <button
                onClick={() => setShowQuizModal(true)}
                className="btn btn-primary"
                style={{ fontSize: "13px" }}
              >
                <Plus size={15} />
                <span>Tạo Bài thi mới</span>
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                gap: "20px",
              }}
            >
              {data.quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="dashboard-card-item"
                  style={{ padding: "20px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "10px",
                    }}
                  >
                    <span className="badge badge-blue">{quiz.subject}</span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        background: "#f1f5f9",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        color: "#475569",
                      }}
                    >
                      {quiz.total_questions} câu hỏi
                    </span>
                  </div>

                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "var(--text-main)",
                      marginBottom: "12px",
                    }}
                  >
                    {quiz.title}
                  </h4>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "12px",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Clock size={13} color="#64748b" />
                      {quiz.duration_minutes} phút
                    </span>
                    <span>•</span>
                    <span>Tự động chấm thang điểm 10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DOCUMENTS SHARING */}
        {activeTab === "documents" && (
          <div>
            <div className="dashboard-action-bar">
              <div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--text-main)",
                    margin: 0,
                  }}
                >
                  Kho Học liệu & Giáo án Sư phạm đã xuất bản
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    margin: "2px 0 0",
                  }}
                >
                  Chia sẻ giáo án điện tử, tài liệu tham khảo theo Công văn
                  5512/BGDĐT-GDTrH
                </p>
              </div>
              <button
                onClick={() => setShowDocModal(true)}
                className="btn btn-primary"
                style={{ fontSize: "13px" }}
              >
                <Upload size={15} />
                <span>Tải lên Tài liệu mới</span>
              </button>
            </div>

            <div
              style={{
                background: "#fff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                      color: "var(--text-muted)",
                      fontSize: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <th style={{ padding: "14px 20px" }}>Tên tài liệu</th>
                    <th style={{ padding: "14px 20px" }}>Định dạng</th>
                    <th style={{ padding: "14px 20px" }}>Dung lượng</th>
                    <th style={{ padding: "14px 20px" }}>Chuyên mục</th>
                    <th style={{ padding: "14px 20px" }}>Lượt tải</th>
                  </tr>
                </thead>
                <tbody>
                  {data.documents.map((doc) => (
                    <tr
                      key={doc.id}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background 0.15s",
                      }}
                    >
                      <td
                        style={{
                          padding: "16px 20px",
                          fontWeight: 600,
                          color: "var(--text-main)",
                        }}
                      >
                        {doc.title}
                      </td>
                      <td style={{ padding: "16px 20px" }}>
                        <span
                          style={{
                            background: "#fee2e2",
                            color: "#dc2626",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontWeight: 700,
                            fontSize: "11px",
                          }}
                        >
                          {doc.file_type}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "16px 20px",
                          color: "var(--text-muted)",
                        }}
                      >
                        {doc.file_size}
                      </td>
                      <td
                        style={{
                          padding: "16px 20px",
                          color: "var(--text-muted)",
                        }}
                      >
                        {doc.category}
                      </td>
                      <td
                        style={{
                          padding: "16px 20px",
                          color: "#4f46e5",
                          fontWeight: 700,
                        }}
                      >
                        {doc.downloads_count || 120} lượt
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: STUDY GROUPS */}
        {activeTab === "groups" && (
          <div>
            <div className="dashboard-action-bar">
              <div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "var(--text-main)",
                    margin: 0,
                  }}
                >
                  Nhóm Học tập & Kết nối Chuyên môn
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    margin: "2px 0 0",
                  }}
                >
                  Không gian trao đổi nghiệp vụ sư phạm, hỗ trợ học sinh và tư
                  vấn phụ huynh
                </p>
              </div>
              <button
                onClick={() => setShowGroupModal(true)}
                className="btn btn-primary"
                style={{ fontSize: "13px" }}
              >
                <Plus size={15} />
                <span>Thành lập Nhóm mới</span>
              </button>
            </div>

            <div className="dashboard-cards-grid">
              {data.groups.map((group) => (
                <div
                  key={group.id}
                  className="dashboard-card-item"
                  style={{
                    padding: "22px",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span className="badge badge-purple">
                        {group.subject}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          fontWeight: 600,
                        }}
                      >
                        <Users size={14} />
                        {group.members_count.toLocaleString("vi-VN")} thành viên
                      </span>
                    </div>

                    <h4
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "var(--text-main)",
                        margin: "12px 0 8px",
                      }}
                    >
                      {group.name}
                    </h4>

                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--text-muted)",
                        lineHeight: 1.5,
                      }}
                    >
                      {group.description}
                    </p>
                  </div>

                  <div
                    style={{
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "14px",
                      marginTop: "16px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#4f46e5",
                        fontWeight: 600,
                      }}
                    >
                      Chủ nhóm: {data.profile.fullname}
                    </span>
                    <button
                      className="btn"
                      style={{
                        background: "#ede9fe",
                        color: "#6b21a8",
                        border: "1px solid #ddd6fe",
                        fontSize: "12px",
                        padding: "6px 12px",
                      }}
                    >
                      Mở phòng thảo luận
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: TEACHER PROFILE */}
        {activeTab === "profile" && (
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              padding: "32px",
              maxWidth: "760px",
              margin: "0 auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "16px",
                marginBottom: "24px",
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "var(--text-main)",
                    margin: 0,
                  }}
                >
                  Hồ sơ Chuyên môn & Thương hiệu Cá nhân
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    margin: "4px 0 0",
                  }}
                >
                  Được xác thực danh tính định danh hai chiều với hệ thống
                  EduChat
                </p>
              </div>
              <span className="badge badge-emerald">Đã định danh CCCD</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "18px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--text-subtle)",
                    marginBottom: "4px",
                  }}
                >
                  Họ và tên
                </label>
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontWeight: 600,
                  }}
                >
                  {data.profile.fullname}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--text-subtle)",
                    marginBottom: "4px",
                  }}
                >
                  Địa chỉ Email
                </label>
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontWeight: 600,
                  }}
                >
                  {data.profile.email}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--text-subtle)",
                    marginBottom: "4px",
                  }}
                >
                  Số điện thoại
                </label>
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontWeight: 600,
                  }}
                >
                  {data.profile.phone || "0912345678"}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    color: "var(--text-subtle)",
                    marginBottom: "4px",
                  }}
                >
                  Số định danh cá nhân (CCCD)
                </label>
                <div
                  style={{
                    padding: "12px 16px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    fontWeight: 600,
                  }}
                >
                  {data.profile.cccd || "001200001234"}
                </div>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-subtle)",
                  marginBottom: "4px",
                }}
              >
                Tiểu sử Chuyên môn & Đơn vị công tác
              </label>
              <div
                style={{
                  padding: "16px",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                }}
              >
                {data.profile.bio ||
                  "Giảng viên cao cấp tại Đại học Sư phạm Hà Nội, chuyên gia đổi mới giáo dục phổ thông theo Chương trình GDPT 2018."}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CREATE COURSE MODAL */}
      {showCourseModal && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{ maxWidth: "520px", padding: "24px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "14px",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  margin: 0,
                }}
              >
                Soạn Khóa học mới
              </h3>
              <button
                onClick={() => setShowCourseModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse}>
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  Tiêu đề Khóa học *
                </label>
                <input
                  type="text"
                  required
                  value={newCourse.title}
                  onChange={(e) =>
                    setNewCourse({ ...newCourse, title: e.target.value })
                  }
                  placeholder="VD: Phương pháp Giải nhanh Toán 12 Vận dụng cao"
                  className="form-input"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "6px",
                    }}
                  >
                    Chuyên mục
                  </label>
                  <select
                    value={newCourse.category}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, category: e.target.value })
                    }
                    className="form-input"
                  >
                    <option value="Toán học & Khoa học">
                      Toán học & Khoa học
                    </option>
                    <option value="Ngoại ngữ">Ngoại ngữ</option>
                    <option value="Phương pháp sư phạm">
                      Phương pháp sư phạm
                    </option>
                    <option value="Công nghệ GD">Công nghệ GD</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "6px",
                    }}
                  >
                    Học phí (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={newCourse.price}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        price: parseInt(e.target.value) || 0,
                      })
                    }
                    className="form-input"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "6px",
                    }}
                  >
                    Thời lượng dự kiến
                  </label>
                  <input
                    type="text"
                    value={newCourse.duration}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, duration: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "6px",
                    }}
                  >
                    Cấp độ
                  </label>
                  <input
                    type="text"
                    value={newCourse.level}
                    onChange={(e) =>
                      setNewCourse({ ...newCourse, level: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="btn btn-secondary"
                  style={{
                    color: "var(--text-muted)",
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Phát hành Khóa học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE QUIZ MODAL */}
      {showQuizModal && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{ maxWidth: "520px", padding: "24px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "14px",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  margin: 0,
                }}
              >
                Tạo Bài kiểm tra & Đánh giá
              </h3>
              <button
                onClick={() => setShowQuizModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateQuiz}>
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  Tiêu đề đề thi / bài kiểm tra *
                </label>
                <input
                  type="text"
                  required
                  value={newQuiz.title}
                  onChange={(e) =>
                    setNewQuiz({ ...newQuiz, title: e.target.value })
                  }
                  placeholder="VD: Kiểm tra chuyên đề Tích phân & Ứng dụng"
                  className="form-input"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "6px",
                    }}
                  >
                    Môn học
                  </label>
                  <input
                    type="text"
                    value={newQuiz.subject}
                    onChange={(e) =>
                      setNewQuiz({ ...newQuiz, subject: e.target.value })
                    }
                    className="form-input"
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "6px",
                    }}
                  >
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    value={newQuiz.duration_minutes}
                    onChange={(e) =>
                      setNewQuiz({
                        ...newQuiz,
                        duration_minutes: parseInt(e.target.value) || 45,
                      })
                    }
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  Số lượng câu hỏi trắc nghiệm
                </label>
                <input
                  type="number"
                  value={newQuiz.total_questions}
                  onChange={(e) =>
                    setNewQuiz({
                      ...newQuiz,
                      total_questions: parseInt(e.target.value) || 20,
                    })
                  }
                  className="form-input"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowQuizModal(false)}
                  className="btn btn-secondary"
                  style={{
                    color: "var(--text-muted)",
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Tạo Đề thi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE DOCUMENT MODAL */}
      {showDocModal && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{ maxWidth: "520px", padding: "24px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "14px",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  margin: 0,
                }}
              >
                Tải lên Học liệu / Giáo án Sư phạm
              </h3>
              <button
                onClick={() => setShowDocModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDoc}>
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  Tên tài liệu / Giáo án *
                </label>
                <input
                  type="text"
                  required
                  value={newDoc.title}
                  onChange={(e) =>
                    setNewDoc({ ...newDoc, title: e.target.value })
                  }
                  placeholder="VD: Giáo án Stem Robotics Lớp 10 Chuẩn GDPT 2018"
                  className="form-input"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "6px",
                    }}
                  >
                    Định dạng tệp
                  </label>
                  <select
                    value={newDoc.file_type}
                    onChange={(e) =>
                      setNewDoc({ ...newDoc, file_type: e.target.value })
                    }
                    className="form-input"
                  >
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="PPTX">PPTX</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 700,
                      marginBottom: "6px",
                    }}
                  >
                    Chuyên mục
                  </label>
                  <select
                    value={newDoc.category}
                    onChange={(e) =>
                      setNewDoc({ ...newDoc, category: e.target.value })
                    }
                    className="form-input"
                  >
                    <option value="Giáo án">Giáo án</option>
                    <option value="Đề thi">Đề thi</option>
                    <option value="Phương pháp">Phương pháp</option>
                    <option value="Tài liệu tham khảo">
                      Tài liệu tham khảo
                    </option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="btn btn-secondary"
                  style={{
                    color: "var(--text-muted)",
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Tải lên ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE GROUP MODAL */}
      {showGroupModal && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{ maxWidth: "520px", padding: "24px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "14px",
                marginBottom: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "var(--text-main)",
                  margin: 0,
                }}
              >
                Thành lập Nhóm học tập & Thảo luận
              </h3>
              <button
                onClick={() => setShowGroupModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94a3b8",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateGroup}>
              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  Tên nhóm *
                </label>
                <input
                  type="text"
                  required
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  placeholder="VD: Câu lạc bộ Toán học & Tư duy logic THPT"
                  className="form-input"
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  Chủ đề / Chuyên đề
                </label>
                <input
                  type="text"
                  value={newGroup.subject}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, subject: e.target.value })
                  }
                  className="form-input"
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  Mô tả nhóm
                </label>
                <textarea
                  rows={3}
                  value={newGroup.description}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, description: e.target.value })
                  }
                  placeholder="Mô tả mục tiêu sinh hoạt, nội quy và đối tượng học sinh..."
                  className="form-input"
                  style={{ resize: "vertical" }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowGroupModal(false)}
                  className="btn btn-secondary"
                  style={{
                    color: "var(--text-muted)",
                    background: "#f1f5f9",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Thành lập Nhóm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COURSE DETAIL MODAL (DIRECTION 1) */}
      <CourseDetailModal
        course={selectedDetailCourse}
        currentUser={data?.profile}
        onClose={() => setSelectedDetailCourse(null)}
        onOpenTeacherWorkspace={(c) => {
          setSelectedDetailCourse(null);
          setSelectedWorkspaceCourse(c);
        }}
        onEnrollSuccess={() => fetchOverview()}
      />

      {/* TEACHER COURSE WORKSPACE MODAL (DIRECTION 2) */}
      <TeacherCourseWorkspaceModal
        course={selectedWorkspaceCourse}
        onClose={() => setSelectedWorkspaceCourse(null)}
        onBackToDetail={(c) => {
          setSelectedWorkspaceCourse(null);
          setSelectedDetailCourse(c);
        }}
        onCourseUpdated={() => fetchOverview()}
      />
    </div>
  );
};
