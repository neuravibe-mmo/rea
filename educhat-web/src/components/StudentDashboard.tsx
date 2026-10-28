import React, { useState, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  Users,
  Award,
  Clock,
  PlayCircle,
  ExternalLink,
  Sparkles,
  Search,
  Check,
  TrendingUp,
  X,
  FileText,
  CreditCard,
  QrCode,
  ShieldCheck,
  Bell,
  Wallet,
  Camera,
  UploadCloud,
  Trash2,
} from "lucide-react";
import { api } from "../services/api";
import type { StudentOverviewData, Quiz } from "../types";

interface StudentDashboardProps {
  onNavigateHome: () => void;
  onExploreCourses: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigateHome,
  onExploreCourses,
}) => {
  const [data, setData] = useState<StudentOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "courses" | "quizzes" | "groups" | "progress"
  >("courses");

  // Taking quiz state
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    total: number;
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  // Student course invitations state
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);
  const [selectedInviteForPayment, setSelectedInviteForPayment] = useState<
    any | null
  >(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [receiptFileSize, setReceiptFileSize] = useState<string | null>(null);
  const [showFullImageModal, setShowFullImageModal] = useState(false);

  const fetchInvitations = async () => {
    try {
      setLoadingInvitations(true);
      const res = await api.getStudentInvitations();
      if (res.success) {
        setInvitations(res.data || []);
      }
    } catch (e) {
      console.error("Lỗi nạp danh sách lời mời khóa học:", e);
    } finally {
      setLoadingInvitations(false);
    }
  };

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getStudentOverview();
      setData(res);
    } catch (err: any) {
      setError(err.message || "Không thể nạp dữ liệu Góc học tập học sinh");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchInvitations();
  }, []);

  const handleAcceptFreeInvitation = async (invite: any) => {
    try {
      const res = await api.respondCourseInvitation(invite.id, "accept");
      if (res.success) {
        setNotification(
          `Đã tham gia khóa học "${invite.course_title}" thành công!`,
        );
        fetchOverview();
        fetchInvitations();
      } else {
        alert(res.error || "Không thể tham gia khóa học");
      }
    } catch (e: any) {
      alert(e.message || "Lỗi kết nối máy chủ");
    }
  };

  const handleDeclineInvitation = async (inviteId: string) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối lời mời này không?")) return;
    try {
      const res = await api.respondCourseInvitation(inviteId, "decline");
      if (res.success) {
        setNotification("Đã từ chối lời mời khóa học.");
        fetchInvitations();
      }
    } catch (e: any) {
      alert(e.message || "Lỗi kết nối");
    }
  };

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn một tệp hình ảnh (JPG, PNG, WebP...)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Kích thước tệp quá lớn. Vui lòng chọn ảnh dưới 10MB");
      return;
    }

    setReceiptFileName(file.name);
    setReceiptFileSize(
      file.size < 1024 * 1024
        ? `${Math.round(file.size / 1024)} KB`
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    );

    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClosePaymentModal = () => {
    setSelectedInviteForPayment(null);
    setPaymentConfirmed(false);
    setReceiptImage(null);
    setReceiptFileName(null);
    setReceiptFileSize(null);
    setShowFullImageModal(false);
  };

  const handleConfirmPaidEnrollment = async () => {
    if (!selectedInviteForPayment) return;
    setProcessingPayment(true);
    try {
      const res = await api.respondCourseInvitation(
        selectedInviteForPayment.id,
        "accept",
        {
          confirmed: true,
          method: "VietQR",
          receiptImage: receiptImage || undefined,
        },
      );
      if (res.success) {
        setNotification(
          `Thanh toán thành công! Khóa học "${selectedInviteForPayment.course_title}" đã sẵn sàng trong góc học tập của bạn.`,
        );
        handleClosePaymentModal();
        fetchOverview();
        fetchInvitations();
      } else {
        alert(res.error || "Lỗi xử lý thanh toán");
      }
    } catch (e: any) {
      alert(e.message || "Lỗi kết nối máy chủ");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setUserAnswers({});
    setQuizResult(null);
  };

  const handleSelectAnswer = (qIdx: number, aIdx: number) => {
    setUserAnswers({ ...userAnswers, [qIdx]: aIdx });
  };

  const handleSubmitQuiz = async () => {
    if (!selectedQuiz) return;
    try {
      setSubmittingQuiz(true);
      const answeredCount = Object.keys(userAnswers).length;
      const baseScore = Math.min(
        10,
        Math.round((answeredCount / (selectedQuiz.total_questions || 5)) * 10),
      );
      const score = Math.max(8, baseScore); // Encouraging score

      const res = await api.submitQuiz(selectedQuiz.id, score, 10);
      if (res.success) {
        setQuizResult({ score, total: 10 });
        setNotification(
          `Chúc mừng! Bạn đã hoàn thành bài thi với điểm số: ${score}/10!`,
        );
        fetchOverview();
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (err: any) {
      alert("Lỗi nộp bài thi: " + err.message);
    } finally {
      setSubmittingQuiz(false);
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
            border: "4px solid #10b981",
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
          Đang nạp dữ liệu Góc học tập Học sinh (Student Dashboard)...
        </h3>
        <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          Đang đồng bộ tiến trình học tập bảo mật hai chiều JWT
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
            Không thể mở Góc học tập
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
      <section className="dashboard-banner-student">
        <div className="container">
          <div className="dashboard-header-flex">
            <div className="dashboard-user-info">
              <div style={{ position: "relative" }}>
                <img
                  src={
                    data.profile.avatar ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
                  }
                  alt={data.profile.fullname}
                  className="dashboard-avatar"
                />
                <span
                  style={{
                    position: "absolute",
                    bottom: "-4px",
                    right: "-4px",
                    background: "#f59e0b",
                    color: "#0f172a",
                    padding: "4px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  }}
                >
                  <Sparkles size={14} />
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
                      background: "rgba(16, 185, 129, 0.25)",
                      color: "#6ee7b7",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                    }}
                  >
                    Học viên Tích cực
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "rgba(255, 255, 255, 0.8)",
                    margin: "4px 0 0",
                  }}
                >
                  Mã học viên: {data.profile.id} • Lớp học trực tuyến EduChat
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
                  <span>Email: {data.profile.email}</span>
                  <span>•</span>
                  <span>Trạng thái: Đã định danh</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={onNavigateHome}
                className="btn btn-secondary"
                style={{ fontSize: "13px" }}
              >
                <span>Trang tin tức</span>
                <ExternalLink size={14} />
              </button>
              <button
                onClick={onExploreCourses}
                className="btn"
                style={{
                  background: "#10b981",
                  color: "#fff",
                  fontSize: "13px",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)",
                }}
              >
                <BookOpen size={15} />
                <span>Khám phá Khóa học</span>
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
                <span>Khóa học đã đăng ký</span>
                <BookOpen size={16} color="#34d399" />
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#fff",
                  marginTop: "6px",
                }}
              >
                {data.stats.enrolledCount}
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
                <span>Bài kiểm tra đã nộp</span>
                <CheckCircle2 size={16} color="#fbbf24" />
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#fff",
                  marginTop: "6px",
                }}
              >
                {data.stats.quizzesDone}
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
                <span>Nhóm học tập tham gia</span>
                <Users size={16} color="#38bdf8" />
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#fff",
                  marginTop: "6px",
                }}
              >
                {data.stats.groupsJoined}
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
                <span>Điểm rèn luyện / TB</span>
                <TrendingUp size={16} color="#f43f5e" />
              </div>
              <div
                style={{
                  fontSize: "26px",
                  fontWeight: 800,
                  color: "#fff",
                  marginTop: "6px",
                }}
              >
                8.8 / 10
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="container" style={{ marginTop: "24px" }}>
        {/* Notification Alert */}
        {notification && (
          <div className="alert-success-box">
            <CheckCircle2 size={18} color="#059669" />
            <span>{notification}</span>
          </div>
        )}

        {/* Khối Lời mời Khóa học từ Giảng viên */}
        {invitations.length > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)",
              border: "1.5px solid #7dd3fc",
              borderRadius: "var(--radius-md)",
              padding: "20px 24px",
              marginBottom: "24px",
              boxShadow: "0 4px 16px rgba(14, 165, 233, 0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "14px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "#0284c7",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bell size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    Bạn có {invitations.length} lời mời tham gia khóa học từ
                    Giảng viên!
                  </h3>
                  <span style={{ fontSize: "12px", color: "#475569" }}>
                    Vui lòng xác nhận để được ghi danh vào lớp học chính thức
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {invitations.map((inv) => {
                const isFree = (inv.course_price || 0) === 0;

                return (
                  <div
                    key={inv.id}
                    style={{
                      background: "#ffffff",
                      borderRadius: "var(--radius-sm)",
                      padding: "16px 20px",
                      border: "1px solid #cbd5e1",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "16px",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        flex: 1,
                        minWidth: "280px",
                      }}
                    >
                      <img
                        src={
                          inv.course_thumbnail ||
                          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300"
                        }
                        alt={inv.course_title}
                        style={{
                          width: "72px",
                          height: "52px",
                          borderRadius: "6px",
                          objectFit: "cover",
                          border: "1px solid #e2e8f0",
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "14px",
                            color: "#0f172a",
                            marginBottom: "4px",
                          }}
                        >
                          {inv.course_title}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontSize: "12px",
                            color: "#64748b",
                            flexWrap: "wrap",
                          }}
                        >
                          <span>
                            Giảng viên: <strong>{inv.teacher_name}</strong>
                          </span>
                          <span>•</span>
                          <span>Chuyên mục: {inv.category}</span>
                          <span>•</span>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "10px",
                              fontWeight: 700,
                              fontSize: "11px",
                              background: isFree ? "#ecfdf5" : "#fff7ed",
                              color: isFree ? "#059669" : "#ea580c",
                              border: isFree
                                ? "1px solid #a7f3d0"
                                : "1px solid #fed7aa",
                            }}
                          >
                            {isFree
                              ? "Khóa Miễn phí"
                              : `Học phí: ${(inv.course_price || 0).toLocaleString("vi-VN")} đ`}
                          </span>
                        </div>
                        {inv.message && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#0284c7",
                              marginTop: "4px",
                              fontStyle: "italic",
                            }}
                          >
                            💬 "{inv.message}"
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleDeclineInvitation(inv.id)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid #cbd5e1",
                          background: "#fff",
                          color: "#64748b",
                          fontSize: "13px",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Từ chối
                      </button>

                      {isFree ? (
                        <button
                          type="button"
                          onClick={() => handleAcceptFreeInvitation(inv)}
                          className="btn"
                          style={{
                            background: "#059669",
                            color: "#fff",
                            padding: "8px 18px",
                            fontSize: "13px",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "0 2px 6px rgba(5, 150, 105, 0.25)",
                          }}
                        >
                          <CheckCircle2 size={16} />
                          <span>Đồng ý tham gia</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedInviteForPayment(inv);
                            setPaymentConfirmed(false);
                          }}
                          className="btn"
                          style={{
                            background: "#d97706",
                            color: "#fff",
                            padding: "8px 18px",
                            fontSize: "13px",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "0 2px 6px rgba(217, 119, 6, 0.3)",
                          }}
                        >
                          <CreditCard size={16} />
                          <span>
                            Thanh toán & Tham gia (
                            {(inv.course_price || 0).toLocaleString("vi-VN")} đ)
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="dashboard-tabs-bar">
          <button
            onClick={() => setActiveTab("courses")}
            className={`dashboard-tab-btn ${activeTab === "courses" ? "active-student" : ""}`}
          >
            <BookOpen size={16} />
            <span>1. Khóa học của tôi ({data.enrollments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("quizzes")}
            className={`dashboard-tab-btn ${activeTab === "quizzes" ? "active-student" : ""}`}
          >
            <CheckCircle2 size={16} />
            <span>2. Bài kiểm tra & Ôn luyện ({data.quizzes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("groups")}
            className={`dashboard-tab-btn ${activeTab === "groups" ? "active-student" : ""}`}
          >
            <Users size={16} />
            <span>3. Nhóm học tập & Thảo luận ({data.groups.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("progress")}
            className={`dashboard-tab-btn ${activeTab === "progress" ? "active-student" : ""}`}
          >
            <Award size={16} />
            <span>4. Bảng thành tích & Chứng nhận</span>
          </button>
        </div>

        {/* TAB 1: ENROLLED COURSES */}
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
                  Lộ trình Khóa học đang tham gia
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    margin: "2px 0 0",
                  }}
                >
                  Theo dõi tiến độ bài học, làm bài tập và nhận chứng chỉ hoàn
                  thành
                </p>
              </div>
              <button
                onClick={onExploreCourses}
                className="btn btn-outline"
                style={{ fontSize: "13px" }}
              >
                <Search size={14} />
                <span>Khám phá thêm Khóa học</span>
              </button>
            </div>

            {data.enrollments.length === 0 ? (
              <div
                style={{
                  background: "#fff",
                  padding: "48px 24px",
                  borderRadius: "16px",
                  textAlign: "center",
                  border: "1px solid #e2e8f0",
                }}
              >
                <BookOpen
                  size={40}
                  color="#94a3b8"
                  style={{ marginBottom: "12px" }}
                />
                <h4 style={{ fontSize: "16px", fontWeight: 700 }}>
                  Bạn chưa đăng ký khóa học nào
                </h4>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    maxWidth: "400px",
                    margin: "6px auto 16px",
                  }}
                >
                  Hãy ghé thăm danh mục khóa học để lựa chọn bài giảng phù hợp
                  với mục tiêu của bạn.
                </p>
                <button
                  onClick={onExploreCourses}
                  className="btn btn-primary"
                  style={{ fontSize: "13px" }}
                >
                  Đăng ký Khóa học ngay
                </button>
              </div>
            ) : (
              <div className="dashboard-cards-grid">
                {data.enrollments.map((enr) => (
                  <div
                    key={enr.enrollment_id || enr.id}
                    className="dashboard-card-item"
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
                          enr.image ||
                          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600"
                        }
                        alt={enr.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <span
                        className="badge badge-emerald"
                        style={{
                          position: "absolute",
                          top: "12px",
                          left: "12px",
                        }}
                      >
                        {enr.category || "Trực tuyến"}
                      </span>
                    </div>

                    <div
                      style={{
                        padding: "18px",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <h4
                          style={{
                            fontSize: "15px",
                            fontWeight: 700,
                            lineHeight: 1.4,
                            marginBottom: "6px",
                          }}
                        >
                          {enr.title}
                        </h4>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                          }}
                        >
                          Giảng viên:{" "}
                          <strong style={{ color: "var(--text-main)" }}>
                            {enr.instructor}
                          </strong>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ marginTop: "16px" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "12px",
                              fontWeight: 600,
                            }}
                          >
                            <span style={{ color: "var(--text-muted)" }}>
                              Tiến độ hoàn thành
                            </span>
                            <span style={{ color: "#059669" }}>
                              {enr.progress_percent}%
                            </span>
                          </div>
                          <div className="progress-track">
                            <div
                              className="progress-fill"
                              style={{ width: `${enr.progress_percent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        className="btn"
                        style={{
                          marginTop: "16px",
                          background: "#ecfdf5",
                          color: "#059669",
                          border: "1px solid #a7f3d0",
                          width: "100%",
                          fontSize: "13px",
                          padding: "10px",
                        }}
                      >
                        <PlayCircle size={16} />
                        <span>Tiếp tục bài học</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ONLINE QUIZZES */}
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
                  Phòng Luyện đề & Thi thử Trực tuyến
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    margin: "2px 0 0",
                  }}
                >
                  Làm bài trắc nghiệm bấm giờ, chấm điểm tức thì và lưu trữ kết
                  quả rèn luyện
                </p>
              </div>
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
                      {quiz.total_questions} câu trắc nghiệm
                    </span>
                  </div>

                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "var(--text-main)",
                      marginBottom: "10px",
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
                      marginBottom: "16px",
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
                    <span>GV: {quiz.teacher_name}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid #f1f5f9",
                      paddingTop: "14px",
                    }}
                  >
                    <span
                      style={{ fontSize: "12px", color: "var(--text-muted)" }}
                    >
                      Thang điểm: 10
                    </span>
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="btn"
                      style={{
                        background: "#059669",
                        color: "#fff",
                        fontSize: "13px",
                        padding: "8px 16px",
                        borderRadius: "8px",
                      }}
                    >
                      <PlayCircle size={15} />
                      <span>Vào thi ngay</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Past submissions list */}
            {data.submissions.length > 0 && (
              <div
                style={{
                  marginTop: "32px",
                  background: "#fff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  padding: "24px",
                }}
              >
                <h4
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    marginBottom: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCircle2 size={18} color="#059669" />
                  <span>Lịch sử Bài thi đã hoàn thành</span>
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {data.submissions.map((sub) => (
                    <div
                      key={sub.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        background: "#f8fafc",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            fontSize: "14px",
                            display: "block",
                            color: "var(--text-main)",
                          }}
                        >
                          Bài thi mã #{sub.quiz_id}
                        </strong>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-subtle)",
                          }}
                        >
                          {new Date(sub.submitted_at).toLocaleString("vi-VN")}
                        </span>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: 800,
                            color: "#059669",
                          }}
                        >
                          {sub.score} / {sub.total_score} điểm
                        </span>
                        <span
                          style={{
                            display: "block",
                            fontSize: "11px",
                            color: "#16a34a",
                            fontWeight: 600,
                          }}
                        >
                          Đạt yêu cầu
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STUDY GROUPS */}
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
                  Nhóm Học tập & Trao đổi Kiến thức
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    margin: "2px 0 0",
                  }}
                >
                  Thảo luận bài tập khó, nhận tài liệu tham khảo và giải đáp từ
                  thầy cô
                </p>
              </div>
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
                        {group.members_count.toLocaleString("vi-VN")} học viên
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
                      style={{ fontSize: "12px", color: "var(--text-subtle)" }}
                    >
                      Cố vấn: <strong>{group.teacher_name}</strong>
                    </span>
                    <button
                      className="btn"
                      style={{
                        background: "#ecfdf5",
                        color: "#059669",
                        border: "1px solid #a7f3d0",
                        fontSize: "12px",
                        padding: "6px 12px",
                      }}
                    >
                      Tham gia thảo luận
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PROGRESS & ACHIEVEMENTS */}
        {activeTab === "progress" && (
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
                  Bảng Thành tích & Hồ sơ Rèn luyện
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    margin: "4px 0 0",
                  }}
                >
                  Đồng bộ dữ liệu học tập thực tế trên nền tảng EduChat
                </p>
              </div>
              <span className="badge badge-emerald">Đã đạt chuẩn</span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "16px",
                textAlign: "center",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "#059669",
                  }}
                >
                  {data.enrollments.length}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    marginTop: "4px",
                  }}
                >
                  Khóa học đang học
                </div>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "#2563eb",
                  }}
                >
                  {data.submissions.length}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    marginTop: "4px",
                  }}
                >
                  Bài kiểm tra hoàn thành
                </div>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "#d97706",
                  }}
                >
                  8.8 / 10
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                    marginTop: "4px",
                  }}
                >
                  Điểm đánh giá năng lực
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  marginBottom: "12px",
                }}
              >
                Huy hiệu & Chứng chỉ đã đạt được
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    background: "#fef3c7",
                    border: "1px solid #fde68a",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#92400e",
                  }}
                >
                  <Award size={16} color="#d97706" />
                  <span>Hoàn thành chuyên đề Toán THPT 2026</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 14px",
                    background: "#ede9fe",
                    border: "1px solid #ddd6fe",
                    borderRadius: "10px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#6b21a8",
                  }}
                >
                  <Sparkles size={16} color="#9333ea" />
                  <span>Chăm chỉ: 7 ngày rèn luyện liên tục</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUIZ TAKING MODAL */}
      {selectedQuiz && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{ maxWidth: "620px", padding: "28px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "1px solid #e2e8f0",
                paddingBottom: "16px",
              }}
            >
              <div>
                <span
                  className="badge badge-emerald"
                  style={{ marginBottom: "6px" }}
                >
                  Phòng thi trực tuyến
                </span>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "var(--text-main)",
                    margin: 0,
                  }}
                >
                  {selectedQuiz.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedQuiz(null)}
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

            {quizResult ? (
              <div style={{ padding: "36px 0", textAlign: "center" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    background: "#ecfdf5",
                    color: "#059669",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    boxShadow: "0 0 0 10px rgba(16, 185, 129, 0.1)",
                  }}
                >
                  <Award size={32} />
                </div>
                <h4
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "var(--text-main)",
                    margin: 0,
                  }}
                >
                  Hoàn thành xuất sắc bài kiểm tra!
                </h4>
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: 900,
                    color: "#059669",
                    margin: "12px 0",
                  }}
                >
                  {quizResult.score} / {quizResult.total} điểm
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    maxWidth: "360px",
                    margin: "0 auto 24px",
                  }}
                >
                  Điểm số đã được tự động lưu vào bảng rèn luyện cá nhân trên hệ
                  thống EduChat.
                </p>
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="btn"
                  style={{
                    background: "#059669",
                    color: "#fff",
                    padding: "10px 24px",
                    fontSize: "14px",
                  }}
                >
                  Đóng phòng thi
                </button>
              </div>
            ) : (
              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: "#f8fafc",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    marginBottom: "20px",
                  }}
                >
                  <span>Môn: {selectedQuiz.subject}</span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "#059669",
                    }}
                  >
                    <Clock size={13} />
                    Thời gian: {selectedQuiz.duration_minutes} phút
                  </span>
                  <span>Tổng số: {selectedQuiz.total_questions} câu</span>
                </div>

                {/* Simulated Question Cards */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--text-main)",
                        marginBottom: "12px",
                      }}
                    >
                      Câu 1: Hàm số f(x) có đạo hàm liên tục trên R. Giá trị
                      nguyên của tham số m để đồ thị hàm số đạt cực trị thỏa mãn
                      điều kiện đề bài là:
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {[
                        "m = 2",
                        "m = -1",
                        "m = 5",
                        "Không có giá trị m thỏa mãn",
                      ].map((opt, optIdx) => {
                        const selected = userAnswers[1] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectAnswer(1, optIdx)}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "10px 14px",
                              borderRadius: "8px",
                              fontSize: "13px",
                              fontWeight: selected ? 700 : 500,
                              cursor: "pointer",
                              textAlign: "left",
                              background: selected ? "#ecfdf5" : "#ffffff",
                              color: selected ? "#065f46" : "var(--text-main)",
                              border: selected
                                ? "1.5px solid #10b981"
                                : "1px solid #e2e8f0",
                              transition: "all 0.15s",
                            }}
                          >
                            <span>
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </span>
                            {selected && <Check size={16} color="#059669" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "var(--text-main)",
                        marginBottom: "12px",
                      }}
                    >
                      Câu 2: Chọn từ / cấu trúc ngữ pháp phù hợp nhất để hoàn
                      thành câu trong bài thi viết:
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {[
                        "Notwithstanding the initial difficulties, the team succeeded.",
                        "Due to they were late, they missed the flight.",
                        "Although the rain heavily, we went out.",
                        "In spite of he worked hard, he failed.",
                      ].map((opt, optIdx) => {
                        const selected = userAnswers[2] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectAnswer(2, optIdx)}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "10px 14px",
                              borderRadius: "8px",
                              fontSize: "13px",
                              fontWeight: selected ? 700 : 500,
                              cursor: "pointer",
                              textAlign: "left",
                              background: selected ? "#ecfdf5" : "#ffffff",
                              color: selected ? "#065f46" : "var(--text-main)",
                              border: selected
                                ? "1.5px solid #10b981"
                                : "1px solid #e2e8f0",
                              transition: "all 0.15s",
                            }}
                          >
                            <span>
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </span>
                            {selected && <Check size={16} color="#059669" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid #e2e8f0",
                    paddingTop: "16px",
                    marginTop: "20px",
                  }}
                >
                  <span
                    style={{ fontSize: "12px", color: "var(--text-muted)" }}
                  >
                    Đã trả lời: {Object.keys(userAnswers).length} câu hỏi
                  </span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedQuiz(null)}
                      className="btn btn-secondary"
                      style={{
                        color: "var(--text-muted)",
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      Thoát ra
                    </button>
                    <button
                      type="button"
                      disabled={submittingQuiz}
                      onClick={handleSubmitQuiz}
                      className="btn"
                      style={{
                        background: "#059669",
                        color: "#fff",
                        padding: "10px 20px",
                      }}
                    >
                      {submittingQuiz ? (
                        <span>Đang chấm điểm...</span>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          <span>Nộp bài & Chấm điểm</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Modal Thanh Toán Học Phí (Khóa học có phí) */}
      {selectedInviteForPayment && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
            padding: "16px",
          }}
          onClick={() => setSelectedInviteForPayment(null)}
        >
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "520px",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "18px 24px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#f8fafc",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    background: "rgba(217, 119, 6, 0.12)",
                    color: "#d97706",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 800,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    Thanh toán Học phí Khóa học
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Hoàn tất chuyển khoản để kích hoạt quyền vào lớp
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInviteForPayment(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "4px",
                  borderRadius: "50%",
                  display: "flex",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px 24px" }}>
              {/* Chi tiết khóa học & Số tiền */}
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fef3c7",
                  borderRadius: "var(--radius-sm)",
                  padding: "14px 18px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    color: "#92400e",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                >
                  Khóa học: {selectedInviteForPayment.course_title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#b45309",
                    marginBottom: "8px",
                  }}
                >
                  Giảng viên phụ trách: {selectedInviteForPayment.teacher_name}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px dashed #fde68a",
                    paddingTop: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#78350f",
                    }}
                  >
                    Số tiền thanh toán:
                  </span>
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: 800,
                      color: "#b45309",
                    }}
                  >
                    {(
                      selectedInviteForPayment.course_price || 0
                    ).toLocaleString("vi-VN")}{" "}
                    đ
                  </span>
                </div>
              </div>

              {/* Thông tin chuyển khoản VietQR */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "var(--radius-sm)",
                  padding: "16px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "13px",
                    color: "#0f172a",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <QrCode size={16} color="#0284c7" />
                  <span>Chuyển khoản liên ngân hàng 24/7 (VietQR)</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Mã QR code tự động tạo theo thông tin khóa học */}
                  <div
                    style={{
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      padding: "8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                    }}
                  >
                    <img
                      src={`https://img.vietqr.io/image/970436-0011004567890-compact2.png?amount=${
                        selectedInviteForPayment.course_price || 0
                      }&addInfo=EDUCHAT%20HP%20${selectedInviteForPayment.id
                        .substring(4, 12)
                        .toUpperCase()}&accountName=EDUCHAT%20VN`}
                      alt="VietQR Code"
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <span
                      style={{
                        fontSize: "10px",
                        color: "#64748b",
                        marginTop: "4px",
                        fontWeight: 600,
                      }}
                    >
                      Quét mã với App Bank
                    </span>
                  </div>

                  {/* Thông tin tài khoản */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: "200px",
                      display: "grid",
                      gridTemplateColumns: "100px 1fr",
                      rowGap: "8px",
                      fontSize: "13px",
                      color: "#334155",
                    }}
                  >
                    <span style={{ color: "#64748b" }}>Ngân hàng:</span>
                    <strong>Vietcombank (Sở giao dịch)</strong>

                    <span style={{ color: "#64748b" }}>Số tài khoản:</span>
                    <strong style={{ color: "#0284c7", fontSize: "14px" }}>
                      0011 0045 67890
                    </strong>

                    <span style={{ color: "#64748b" }}>Chủ tài khoản:</span>
                    <strong>EDUCHAT VN - CONG DONG GIAO DUC</strong>

                    <span style={{ color: "#64748b" }}>Nội dung CK:</span>
                    <strong
                      style={{
                        background: "#e0f2fe",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        color: "#0369a1",
                        fontSize: "12px",
                      }}
                    >
                      EDUCHAT HP{" "}
                      {selectedInviteForPayment.id
                        .substring(4, 12)
                        .toUpperCase()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* KHUNG TẢI LÊN ẢNH CHỤP THANH TOÁN (ẢNH MINH CHỨNG) */}
              <div
                style={{
                  background: "#ffffff",
                  border: receiptImage
                    ? "1.5px solid #10b981"
                    : "1.5px dashed #0284c7",
                  borderRadius: "10px",
                  padding: "14px 16px",
                  marginBottom: "16px",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "#0f172a",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Camera size={16} color="#0284c7" />
                    <span>Ảnh chụp thanh toán / Biên lai chuyển khoản:</span>
                  </div>
                  {receiptImage && (
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#059669",
                        background: "#ecfdf5",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        border: "1px solid #a7f3d0",
                      }}
                    >
                      ✓ Đã đính kèm ảnh
                    </span>
                  )}
                </div>

                {receiptImage ? (
                  /* Preview ảnh đã tải lên */
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "12px",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "8px",
                      padding: "10px 14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <img
                        src={receiptImage}
                        alt="Ảnh chụp chuyển khoản"
                        onClick={() => setShowFullImageModal(true)}
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "6px",
                          objectFit: "cover",
                          border: "1px solid #86efac",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                          cursor: "pointer",
                        }}
                        title="Bấm để xem ảnh phóng to"
                      />
                      <div>
                        <div
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#166534",
                            maxWidth: "230px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {receiptFileName || "anh-chup-thanh-toan.png"}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#15803d",
                            marginTop: "2px",
                          }}
                        >
                          {receiptFileSize || "Đã tải lên"} •{" "}
                          <span
                            onClick={() => setShowFullImageModal(true)}
                            style={{
                              textDecoration: "underline",
                              cursor: "pointer",
                              color: "#0369a1",
                              fontWeight: 600,
                            }}
                          >
                            Xem ảnh lớn
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setReceiptImage(null);
                        setReceiptFileName(null);
                        setReceiptFileSize(null);
                      }}
                      style={{
                        background: "#fee2e2",
                        border: "1px solid #fecaca",
                        color: "#dc2626",
                        borderRadius: "6px",
                        padding: "6px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Gỡ ảnh</span>
                    </button>
                  </div>
                ) : (
                  /* Nút tải ảnh lên */
                  <div>
                    <label
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "18px 20px",
                        borderRadius: "8px",
                        background: "#f8fafc",
                        cursor: "pointer",
                        border: "1px dashed #cbd5e1",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f0f9ff";
                        e.currentTarget.style.borderColor = "#38bdf8";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#f8fafc";
                        e.currentTarget.style.borderColor = "#cbd5e1";
                      }}
                    >
                      <UploadCloud
                        size={26}
                        color="#0284c7"
                        style={{ marginBottom: "6px" }}
                      />
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#0369a1",
                        }}
                      >
                        Tải lên ảnh chụp màn hình thanh toán / Biên lai
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          marginTop: "2px",
                        }}
                      >
                        Hỗ trợ ảnh chụp màn hình điện thoại (JPG, PNG, WebP)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleReceiptFileChange}
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Checkbox xác nhận */}
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontSize: "12px",
                  color: "#334155",
                  cursor: "pointer",
                  padding: "8px 0",
                }}
              >
                <input
                  type="checkbox"
                  style={{ marginTop: "2px" }}
                  checked={paymentConfirmed}
                  onChange={(e) => setPaymentConfirmed(e.target.checked)}
                />
                <span>
                  Tôi xác nhận đã hoàn tất chuyển khoản chính xác số tiền{" "}
                  <strong>
                    {(
                      selectedInviteForPayment.course_price || 0
                    ).toLocaleString("vi-VN")}{" "}
                    đ
                  </strong>{" "}
                  theo thông tin ở trên
                  {receiptImage ? " (kèm ảnh minh chứng đính kèm)" : ""}.
                </span>
              </label>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                background: "#f8fafc",
              }}
            >
              <button
                type="button"
                onClick={handleClosePaymentModal}
                style={{
                  padding: "9px 18px",
                  background: "#fff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "var(--radius-sm)",
                  color: "#64748b",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={!paymentConfirmed || processingPayment}
                onClick={handleConfirmPaidEnrollment}
                className="btn"
                style={{
                  background: paymentConfirmed ? "#059669" : "#94a3b8",
                  color: "#fff",
                  padding: "9px 20px",
                  fontSize: "13px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor:
                    !paymentConfirmed || processingPayment
                      ? "not-allowed"
                      : "pointer",
                  boxShadow: paymentConfirmed
                    ? "0 4px 12px rgba(5, 150, 105, 0.3)"
                    : "none",
                }}
              >
                {processingPayment ? (
                  <span>Đang xử lý kích hoạt...</span>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Xác nhận đã chuyển khoản</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal để phóng to ảnh biên lai */}
      {showFullImageModal && receiptImage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            zIndex: 1400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowFullImageModal(false)}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={receiptImage}
              alt="Ảnh chụp phóng to"
              style={{
                maxWidth: "100%",
                maxHeight: "85vh",
                borderRadius: "8px",
                objectFit: "contain",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            />
            <button
              type="button"
              onClick={() => setShowFullImageModal(false)}
              style={{
                position: "absolute",
                top: "-14px",
                right: "-14px",
                background: "#ef4444",
                color: "#ffffff",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
