import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  Users,
  Clock,
  BookOpen,
  Award,
  PlayCircle,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Lock,
  MessageSquare,
  Sparkles,
  Share2,
  Bookmark,
  ChevronRight,
  FileText,
  Video,
} from "lucide-react";
import { api } from "../services/api";
import type { User } from "../types";

interface CourseDetailPageProps {
  course: any | null;
  currentUser: User | null;
  onBack: () => void;
  onOpenTeacherWorkspace?: (course: any) => void;
  onEnrollSuccess?: () => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  course,
  currentUser,
  onBack,
  onOpenTeacherWorkspace,
  onEnrollSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "syllabus" | "reviews"
  >("overview");
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolledSuccessMsg, setEnrolledSuccessMsg] = useState<string | null>(
    null,
  );

  // Preview video state
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  // Reviews list
  const [reviews, setReviews] = useState([
    {
      id: "rev_1",
      name: "ThS. Hoàng Thị Lan",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
      rating: 5,
      date: "3 ngày trước",
      comment:
        "Khóa học rất thực chiến, các tài liệu hướng dẫn xây dựng bài giảng SCORM theo chuẩn Công văn 5512 áp dụng được ngay vào giảng dạy tại trường.",
    },
    {
      id: "rev_2",
      name: "Thầy Đỗ Minh Tuấn",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
      rating: 5,
      date: "1 tuần trước",
      comment:
        "Nội dung bài giảng chỉn chu, thầy giảng giải trực quan và nhiệt tình giải đáp thắc mắc của giáo viên trong diễn đàn.",
    },
  ]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!course) return;
    setCourseData(course);
    setActiveTab("overview");
    setEnrolledSuccessMsg(null);
    setPreviewVideoUrl(null);

    // Scroll to top when page loads
    window.scrollTo({ top: 0, behavior: "smooth" });

    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.getCourseDetail(course.id);
        if (res) {
          setCourseData(res);
        }
      } catch (e) {
        console.error("Lỗi nạp chi tiết khóa học:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [course]);

  if (!course) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        <h3>Không tìm thấy thông tin khóa học</h3>
        <button
          onClick={onBack}
          className="btn btn-primary"
          style={{ marginTop: "16px" }}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const isTeacher =
    Boolean(onOpenTeacherWorkspace) ||
    (currentUser &&
      (currentUser.role === "teacher" ||
        currentUser.role === "Giảng viên" ||
        currentUser.role === "admin" ||
        currentUser.fullname === course.instructor));

  const handleEnroll = async () => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để đăng ký tham gia khóa học này!");
      return;
    }
    try {
      setEnrolling(true);
      setTimeout(() => {
        setIsEnrolled(true);
        setEnrolling(false);
        setEnrolledSuccessMsg(
          "Chúc mừng bạn đã ghi danh khóa học thành công! Bạn có thể bắt đầu học ngay.",
        );
        if (onEnrollSuccess) onEnrollSuccess();
      }, 700);
    } catch (err: any) {
      alert("Lỗi đăng ký khóa học: " + err.message);
      setEnrolling(false);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const rev = {
      id: "rev_" + Date.now(),
      name: currentUser ? currentUser.fullname : "Học viên EduChat",
      avatar:
        currentUser?.avatar ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
      rating: 5,
      date: "Vừa xong",
      comment: newComment.trim(),
    };
    setReviews([rev, ...reviews]);
    setNewComment("");
  };

  const lessons = courseData?.lessons || [
    {
      id: "lsn_1",
      title:
        "Bài 1: Tổng quan về Thiết kế Bài giảng E-learning Chuẩn Quốc tế (SCORM/xAPI)",
      duration: "12:45",
      is_free_preview: 1,
      video_url:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
    {
      id: "lsn_2",
      title: "Bài 2: Cấu trúc kịch bản sư phạm hiện đại theo Thông tư Bộ GD&ĐT",
      duration: "18:20",
      is_free_preview: 1,
      video_url:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    },
    {
      id: "lsn_3",
      title:
        "Bài 3: Nguyên tắc phối màu, Typography và đồ họa trực quan trong bài giảng số",
      duration: "24:10",
      is_free_preview: 0,
      video_url: "",
    },
    {
      id: "lsn_4",
      title:
        "Bài 4: Kỹ thuật xây dựng câu hỏi tương tác H5P và trắc nghiệm gamification",
      duration: "19:50",
      is_free_preview: 0,
      video_url: "",
    },
    {
      id: "lsn_5",
      title:
        "Bài 5: Xuất bản, tích hợp LMS EduChat và đo lường mức độ tương tác học viên",
      duration: "16:30",
      is_free_preview: 0,
      video_url: "",
    },
  ];

  const priceFormatted = course.price
    ? typeof course.price === "number"
      ? course.price.toLocaleString("vi-VN") + " đ"
      : course.price
    : "399.000 đ";

  return (
    <div
      style={{
        background: "#f8fafc",
        minHeight: "100vh",
        paddingBottom: "60px",
      }}
    >
      {/* Top Breadcrumbs & Back Navigation */}
      <div
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          padding: "12px 0",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={onBack}
              style={{
                background: "none",
                border: "none",
                color: "#2563eb",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontWeight: 600,
                padding: "4px 8px",
                borderRadius: "6px",
              }}
            >
              <ArrowLeft size={16} />
              <span>Quay lại</span>
            </button>
            <span>/</span>
            <span>Trang chủ</span>
            <span>/</span>
            <span>Khóa học</span>
            <span>/</span>
            <span style={{ color: "#0f172a", fontWeight: 600 }}>
              {course.title}
            </span>
          </div>

          {/* Teacher Quick Button on Header */}
          {isTeacher && onOpenTeacherWorkspace && (
            <button
              onClick={() => onOpenTeacherWorkspace(course)}
              className="btn"
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "#0f172a",
                fontWeight: 800,
                fontSize: "12px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 2px 8px rgba(245, 158, 11, 0.3)",
              }}
            >
              <Settings size={15} />
              <span>⚙️ Bảng Quản trị & Biên tập LMS (Hướng 2)</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Banner Section */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 65%, #0f2744 100%)",
          color: "#ffffff",
          padding: "40px 0 48px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="container">
          <div style={{ maxWidth: "860px" }}>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <span
                className="badge"
                style={{
                  background: "rgba(56, 189, 248, 0.2)",
                  color: "#38bdf8",
                  border: "1px solid rgba(56, 189, 248, 0.4)",
                  padding: "4px 12px",
                  fontSize: "12px",
                }}
              >
                {course.category || "Kỹ năng sư phạm"}
              </span>
              <span
                className="badge"
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#34d399",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  padding: "4px 12px",
                  fontSize: "12px",
                }}
              >
                Đang mở tuyển sinh
              </span>
              <span
                className="badge"
                style={{
                  background: "rgba(245, 158, 11, 0.2)",
                  color: "#fbbf24",
                  border: "1px solid rgba(245, 158, 11, 0.4)",
                  padding: "4px 12px",
                  fontSize: "12px",
                }}
              >
                Chuẩn Bộ GD&ĐT
              </span>
            </div>

            <h1
              style={{
                fontSize: "32px",
                fontWeight: 800,
                lineHeight: 1.3,
                marginBottom: "16px",
                color: "#ffffff",
              }}
            >
              {course.title}
            </h1>

            <p
              style={{
                fontSize: "16px",
                lineHeight: 1.6,
                color: "rgba(255, 255, 255, 0.8)",
                marginBottom: "24px",
              }}
            >
              {course.description ||
                "Chương trình đào tạo chuyên sâu giúp giáo viên, giảng viên làm chủ công nghệ thiết kế bài giảng E-learning chuẩn quốc tế, tích hợp công cụ tương tác H5P và xuất bản SCORM tương thích 100% với LMS EduChat."}
            </p>

            {/* Quick Stats Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                flexWrap: "wrap",
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <img
                  src={
                    course.instructor_avatar ||
                    course.instructorAvatar ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                  }
                  alt={course.instructor}
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #38bdf8",
                  }}
                />
                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "rgba(255, 255, 255, 0.6)",
                      display: "block",
                    }}
                  >
                    Giảng viên chuyên môn
                  </span>
                  <strong style={{ color: "#fff", fontSize: "14px" }}>
                    {course.instructor}
                  </strong>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "#fbbf24",
                }}
              >
                <Star size={16} fill="#fbbf24" />
                <strong style={{ color: "#fff", fontSize: "15px" }}>
                  {course.rating || 4.9}
                </strong>
                <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  (120+ nhận xét)
                </span>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Users size={16} color="#38bdf8" />
                <span>
                  <strong>
                    {course.students_count
                      ? Number(course.students_count).toLocaleString("vi-VN")
                      : course.studentsCount || "1.840"}
                  </strong>{" "}
                  học viên
                </span>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Clock size={16} color="#34d399" />
                <span>
                  Thời lượng: <strong>{course.duration || "18 giờ"}</strong>
                </span>
              </div>

              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <BookOpen size={16} color="#a78bfa" />
                <span>
                  <strong>{lessons.length}</strong> bài giảng
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="container" style={{ marginTop: "32px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: "32px",
            alignItems: "start",
          }}
        >
          {/* Left Column: Tabs & Content */}
          <div>
            {/* Tabs Navigation Header */}
            <div
              style={{
                display: "flex",
                background: "#ffffff",
                borderRadius: "14px",
                padding: "6px",
                border: "1px solid #e2e8f0",
                marginBottom: "24px",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.03)",
              }}
            >
              <button
                onClick={() => setActiveTab("overview")}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: activeTab === "overview" ? "#2563eb" : "#64748b",
                  background: activeTab === "overview" ? "#eff6ff" : "none",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
              >
                <BookOpen size={16} />
                <span>1. Tổng quan & Mục tiêu</span>
              </button>

              <button
                onClick={() => setActiveTab("syllabus")}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: activeTab === "syllabus" ? "#2563eb" : "#64748b",
                  background: activeTab === "syllabus" ? "#eff6ff" : "none",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
              >
                <PlayCircle size={16} />
                <span>2. Giáo trình bài giảng ({lessons.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("reviews")}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: activeTab === "reviews" ? "#2563eb" : "#64748b",
                  background: activeTab === "reviews" ? "#eff6ff" : "none",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.2s",
                }}
              >
                <MessageSquare size={16} />
                <span>3. Đánh giá & Thảo luận ({reviews.length})</span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {/* Learning Objectives Card */}
                <div
                  className="glass-card"
                  style={{
                    padding: "28px",
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: "18px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Sparkles size={20} color="#2563eb" />
                    <span>Bạn sẽ học được những gì trong khóa học này?</span>
                  </h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    {[
                      "Thành thạo công cụ thiết kế bài giảng tương tác chuẩn e-learning quốc tế.",
                      "Nắm vững kịch bản sư phạm hiện đại theo định hướng phát triển năng lực người học.",
                      "Tự tay tích hợp các câu hỏi trắc nghiệm tương tác H5P, video tương tác sinh động.",
                      "Xuất bản gói SCORM/xAPI chuẩn hóa, tích hợp mượt mà vào hệ thống LMS EduChat.",
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "flex-start",
                          background: "#f8fafc",
                          padding: "14px",
                          borderRadius: "10px",
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        <CheckCircle2
                          size={18}
                          color="#10b981"
                          style={{ flexShrink: 0, marginTop: "2px" }}
                        />
                        <span
                          style={{
                            fontSize: "14px",
                            color: "#334155",
                            lineHeight: 1.5,
                          }}
                        >
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Course Details & Requirements */}
                <div
                  className="glass-card"
                  style={{
                    padding: "28px",
                    background: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: "16px",
                    }}
                  >
                    Mô tả khóa học chi tiết
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.7,
                      color: "#475569",
                      marginBottom: "16px",
                    }}
                  >
                    Khóa học được thiết kế đặc thù dành cho các thầy cô giáo phổ
                    thông, giảng viên đại học và các chuyên gia đào tạo mong
                    muốn nâng tầm chất lượng bài giảng trực tuyến. Nội dung khóa
                    học tập trung 80% thời lượng vào thực hành thao tác trực
                    tiếp, cung cấp kho tài nguyên template đồ họa sư phạm dựng
                    sẵn.
                  </p>
                  <p
                    style={{
                      fontSize: "14px",
                      lineHeight: 1.7,
                      color: "#475569",
                    }}
                  >
                    Sau khi hoàn thành các bài học và bài kiểm tra cuối khóa,
                    học viên sẽ được cấp Giấy chứng nhận hoàn thành chương trình
                    bồi dưỡng kỹ năng công nghệ giáo dục số từ EduChat.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: SYLLABUS LESSONS */}
            {activeTab === "syllabus" && (
              <div
                className="glass-card"
                style={{
                  padding: "28px",
                  background: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Chương trình giáo trình chi tiết
                    </h3>
                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                      Tổng cộng: {lessons.length} bài học • Thời lượng{" "}
                      {course.duration || "18 giờ"}
                    </span>
                  </div>
                  <span className="badge badge-emerald">Cập nhật 2026</span>
                </div>

                {/* Preview Video Player if opened */}
                {previewVideoUrl && (
                  <div
                    style={{
                      marginBottom: "24px",
                      borderRadius: "14px",
                      overflow: "hidden",
                      border: "1px solid #cbd5e1",
                      background: "#000",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 16px",
                        background: "#1e293b",
                        color: "#fff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "13px",
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <PlayCircle size={15} color="#38bdf8" /> Video xem trước
                        bài giảng
                      </span>
                      <button
                        onClick={() => setPreviewVideoUrl(null)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#94a3b8",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Đóng player
                      </button>
                    </div>
                    <video
                      src={previewVideoUrl}
                      controls
                      autoPlay
                      style={{
                        width: "100%",
                        maxHeight: "360px",
                        display: "block",
                      }}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {lessons.map((lesson: any, index: number) => (
                    <div
                      key={lesson.id || index}
                      style={{
                        padding: "16px 20px",
                        background: lesson.is_free_preview
                          ? "#f0fdf4"
                          : "#f8fafc",
                        border: lesson.is_free_preview
                          ? "1px solid #bbf7d0"
                          : "1px solid #e2e8f0",
                        borderRadius: "12px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                        }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "10px",
                            background: lesson.is_free_preview
                              ? "#dcfce7"
                              : "#e2e8f0",
                            color: lesson.is_free_preview
                              ? "#16a34a"
                              : "#64748b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "13px",
                          }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <strong
                            style={{
                              fontSize: "14px",
                              color: "#0f172a",
                              display: "block",
                              marginBottom: "4px",
                            }}
                          >
                            {lesson.title}
                          </strong>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontSize: "12px",
                              color: "#64748b",
                            }}
                          >
                            <Clock size={12} />
                            <span>{lesson.duration || "15:00"}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {lesson.is_free_preview ? (
                          <button
                            onClick={() =>
                              setPreviewVideoUrl(
                                lesson.video_url ||
                                  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                              )
                            }
                            className="btn btn-secondary"
                            style={{
                              fontSize: "12px",
                              padding: "6px 14px",
                              background: "#ffffff",
                              color: "#16a34a",
                              borderColor: "#86efac",
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <PlayCircle size={14} />
                            <span>Học thử miễn phí</span>
                          </button>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "12px",
                              color: "#94a3b8",
                            }}
                          >
                            <Lock size={14} />
                            <span>Đã khóa</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: REVIEWS */}
            {activeTab === "reviews" && (
              <div
                className="glass-card"
                style={{
                  padding: "28px",
                  background: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#0f172a",
                    marginBottom: "20px",
                  }}
                >
                  Đánh giá từ cộng đồng học viên ({reviews.length})
                </h3>

                {/* Form Add Review */}
                <form
                  onSubmit={handleAddReview}
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "28px",
                    paddingBottom: "24px",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Chia sẻ nhận xét hoặc đặt câu hỏi chuyên môn cho giảng viên..."
                    className="form-input"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ flexShrink: 0 }}
                  >
                    Gửi nhận xét
                  </button>
                </form>

                {/* Reviews List */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      style={{
                        padding: "18px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <img
                            src={rev.avatar}
                            alt={rev.name}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                          <div>
                            <strong
                              style={{
                                fontSize: "14px",
                                color: "#0f172a",
                                display: "block",
                              }}
                            >
                              {rev.name}
                            </strong>
                            <span
                              style={{ fontSize: "11px", color: "#94a3b8" }}
                            >
                              {rev.date}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            color: "#fbbf24",
                            gap: "2px",
                          }}
                        >
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={14} fill="#fbbf24" />
                          ))}
                        </div>
                      </div>
                      <p
                        style={{
                          fontSize: "14px",
                          color: "#475569",
                          margin: 0,
                          lineHeight: 1.6,
                        }}
                      >
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Pricing & Action Sidebar */}
          <div style={{ position: "sticky", top: "20px" }}>
            <div
              className="glass-card"
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
              }}
            >
              {/* Course Thumbnail */}
              <div style={{ position: "relative", height: "190px" }}>
                <img
                  src={
                    course.image ||
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600"
                  }
                  alt={course.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
                  <button
                    onClick={() =>
                      setPreviewVideoUrl(
                        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                      )
                    }
                    style={{
                      background: "rgba(255, 255, 255, 0.9)",
                      border: "none",
                      color: "#2563eb",
                      padding: "10px 18px",
                      borderRadius: "30px",
                      fontWeight: 700,
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    <PlayCircle size={18} />
                    <span>Xem giới thiệu</span>
                  </button>
                </div>
              </div>

              <div style={{ padding: "24px" }}>
                {/* Price Display */}
                <div style={{ marginBottom: "20px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      display: "block",
                    }}
                  >
                    Học phí trọn khóa (Ưu đãi):
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "10px",
                      marginTop: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "28px",
                        fontWeight: 800,
                        color: "#2563eb",
                      }}
                    >
                      {priceFormatted}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#94a3b8",
                        textDecoration: "line-through",
                      }}
                    >
                      {course.originalPrice || "799.000 đ"}
                    </span>
                  </div>
                </div>

                {/* Enrollment Success Msg */}
                {enrolledSuccessMsg && (
                  <div
                    style={{
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      color: "#166534",
                      padding: "12px",
                      borderRadius: "10px",
                      fontSize: "13px",
                      marginBottom: "16px",
                      lineHeight: 1.5,
                    }}
                  >
                    ✓ {enrolledSuccessMsg}
                  </div>
                )}

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {isTeacher ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          background: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          color: "#1e40af",
                          padding: "12px 14px",
                          borderRadius: "10px",
                          fontSize: "13px",
                          lineHeight: 1.5,
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                        }}
                      >
                        <ShieldCheck
                          size={18}
                          color="#2563eb"
                          style={{ flexShrink: 0, marginTop: "2px" }}
                        />
                        <span>
                          Bạn đang xem khóa học với tư cách{" "}
                          <strong>Giảng viên chuyên môn</strong> phụ trách khóa
                          học này.
                        </span>
                      </div>

                      {onOpenTeacherWorkspace && (
                        <button
                          onClick={() => onOpenTeacherWorkspace(course)}
                          className="btn"
                          style={{
                            background:
                              "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                            color: "#0f172a",
                            fontWeight: 800,
                            fontSize: "14px",
                            padding: "14px",
                            borderRadius: "12px",
                            border: "none",
                            boxShadow: "0 4px 14px rgba(245, 158, 11, 0.35)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            cursor: "pointer",
                          }}
                        >
                          <Settings size={18} />
                          <span>
                            ⚙️ Vào Bảng Quản trị & Biên tập LMS (Hướng 2)
                          </span>
                        </button>
                      )}
                    </div>
                  ) : (
                    /* FOR STUDENT: Enroll */
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling || isEnrolled}
                      className="btn btn-primary"
                      style={{
                        width: "100%",
                        padding: "14px",
                        fontSize: "15px",
                        fontWeight: 700,
                        borderRadius: "12px",
                      }}
                    >
                      {enrolling
                        ? "Đang ghi danh..."
                        : isEnrolled
                          ? "Đã đăng ký thành công"
                          : "Đăng ký Khóa học ngay"}
                    </button>
                  )}
                </div>

                {/* Perks list */}
                <div
                  style={{
                    marginTop: "24px",
                    paddingTop: "20px",
                    borderTop: "1px solid #f1f5f9",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    fontSize: "13px",
                    color: "#475569",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <ShieldCheck size={18} color="#10b981" />
                    <span>Chứng chỉ số xác thực chính quy</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Clock size={18} color="#2563eb" />
                    <span>Học online mọi lúc mọi nơi</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Award size={18} color="#f59e0b" />
                    <span>Tài liệu & Template bài giảng trọn đời</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
