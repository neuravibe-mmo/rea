import React, { useState, useEffect } from "react";
import {
  X,
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
} from "lucide-react";
import { api } from "../services/api";
import type { User } from "../types";

interface CourseDetailModalProps {
  course: any | null;
  currentUser: User | null;
  onClose: () => void;
  onOpenTeacherWorkspace?: (course: any) => void;
  onEnrollSuccess?: () => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  currentUser,
  onClose,
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
        "Khóa học rất thực chiến, các tài liệu hướng dẫn xây dựng bài giảng SCORM theo chuẩn CV 5512 áp dụng được ngay vào giảng dạy tại trường.",
    },
    {
      id: "rev_2",
      name: "Thầy Đỗ Minh Tuấn",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
      rating: 5,
      date: "1 tuần trước",
      comment:
        "Nội dung chỉn chu, thầy An giảng rất truyền cảm và nhiệt tình hỗ trợ giải đáp trong nhóm chuyên môn.",
    },
  ]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!course) return;
    setCourseData(course);
    setActiveTab("overview");
    setEnrolledSuccessMsg(null);

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

  if (!course) return null;

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
      const res = await api.enrollCourse(course.id);
      if (res.success) {
        setIsEnrolled(true);
        setEnrolledSuccessMsg(
          "Chúc mừng bạn đã đăng ký khóa học thành công! Hãy vào Góc học tập để bắt đầu.",
        );
        if (onEnrollSuccess) onEnrollSuccess();
      } else {
        alert(res.error || "Đăng ký không thành công");
      }
    } catch (err: any) {
      alert("Lỗi kết nối máy chủ: " + err.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const rev = {
      id: "rev_" + Date.now(),
      name: currentUser ? currentUser.fullname : "Học viên EduChat",
      avatar: currentUser
        ? currentUser.avatar
        : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
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
      title: "Bài 1: Tổng quan về Thiết kế Bài giảng E-learning Chuẩn Quốc tế",
      duration: "12:45",
      is_free_preview: 1,
    },
    {
      id: "lsn_2",
      title: "Bài 2: Cấu trúc kịch bản sư phạm hiện đại theo Thông tư Bộ GD&ĐT",
      duration: "18:20",
      is_free_preview: 1,
    },
    {
      id: "lsn_3",
      title:
        "Bài 3: Nguyên tắc phối màu, Typography và đồ họa trực quan trong bài giảng số",
      duration: "24:10",
      is_free_preview: 0,
    },
    {
      id: "lsn_4",
      title:
        "Bài 4: Kỹ thuật xây dựng câu hỏi tương tác H5P và trắc nghiệm gamification",
      duration: "19:50",
      is_free_preview: 0,
    },
    {
      id: "lsn_5",
      title:
        "Bài 5: Xuất bản, tích hợp LMS EduChat và đo lường mức độ tương tác học viên",
      duration: "16:30",
      is_free_preview: 0,
    },
  ];

  const priceFormatted = course.price
    ? typeof course.price === "number"
      ? course.price.toLocaleString("vi-VN") + " đ"
      : course.price
    : "399.000 đ";

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{
          maxWidth: "880px",
          width: "95%",
          maxHeight: "92vh",
          padding: 0,
          borderRadius: "20px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Modal Top Header with Background Banner */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0a192f 100%)",
            color: "#ffffff",
            padding: "24px 28px",
            position: "relative",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(255, 255, 255, 0.12)",
              border: "none",
              color: "#fff",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <X size={18} />
          </button>

          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <span
              className="badge"
              style={{
                background: "rgba(56, 189, 248, 0.2)",
                color: "#38bdf8",
                border: "1px solid rgba(56, 189, 248, 0.4)",
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
              }}
            >
              Đang mở lớp
            </span>
          </div>

          <h2
            style={{
              fontSize: "22px",
              fontWeight: 800,
              margin: 0,
              lineHeight: 1.35,
              maxWidth: "760px",
            }}
          >
            {course.title}
          </h2>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginTop: "16px",
              flexWrap: "wrap",
              fontSize: "13px",
              color: "rgba(255, 255, 255, 0.8)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <img
                src={
                  course.instructor_avatar ||
                  course.instructorAvatar ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                }
                alt={course.instructor}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #38bdf8",
                }}
              />
              <span>
                Giảng viên:{" "}
                <strong style={{ color: "#fff" }}>{course.instructor}</strong>
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: "#fbbf24",
              }}
            >
              <Star size={15} fill="#fbbf24" />
              <strong style={{ color: "#fff" }}>{course.rating || 4.9}</strong>
              <span style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                (120+ đánh giá)
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Users size={15} color="#38bdf8" />
              <span>
                {course.students_count
                  ? Number(course.students_count).toLocaleString("vi-VN")
                  : course.studentsCount || "1.840"}{" "}
                học viên
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={15} color="#34d399" />
              <span>{course.duration || "12 giờ học"}</span>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e2e8f0",
            background: "#f8fafc",
            padding: "0 28px",
          }}
        >
          <button
            onClick={() => setActiveTab("overview")}
            style={{
              padding: "14px 20px",
              fontSize: "14px",
              fontWeight: 700,
              color: activeTab === "overview" ? "#2563eb" : "#64748b",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "overview"
                  ? "3px solid #2563eb"
                  : "3px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <BookOpen size={16} />
            <span>Tổng quan & Mục tiêu</span>
          </button>

          <button
            onClick={() => setActiveTab("syllabus")}
            style={{
              padding: "14px 20px",
              fontSize: "14px",
              fontWeight: 700,
              color: activeTab === "syllabus" ? "#2563eb" : "#64748b",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "syllabus"
                  ? "3px solid #2563eb"
                  : "3px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <PlayCircle size={16} />
            <span>Giáo trình bài giảng ({lessons.length} bài)</span>
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            style={{
              padding: "14px 20px",
              fontSize: "14px",
              fontWeight: 700,
              color: activeTab === "reviews" ? "#2563eb" : "#64748b",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "reviews"
                  ? "3px solid #2563eb"
                  : "3px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <MessageSquare size={16} />
            <span>Đánh giá & Bình luận ({reviews.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div
          style={{
            padding: "28px",
            overflowY: "auto",
            flex: 1,
            maxHeight: "calc(92vh - 240px)",
          }}
        >
          {enrolledSuccessMsg && (
            <div className="alert-success-box" style={{ marginBottom: "20px" }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>{enrolledSuccessMsg}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "24px" }}
            >
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "14px",
                  padding: "20px",
                }}
              >
                <h4
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    color: "#1e3a8a",
                    margin: "0 0 10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Sparkles size={18} color="#2563eb" />
                  <span>Bạn sẽ học được những gì từ khóa học này?</span>
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "10px",
                    fontSize: "13px",
                    color: "#1e293b",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      color="#10b981"
                      style={{ flexShrink: 0, marginTop: "2px" }}
                    />
                    <span>
                      Nắm vững chuẩn đóng gói bài giảng điện tử SCORM, xAPI và
                      HTML5.
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      color="#10b981"
                      style={{ flexShrink: 0, marginTop: "2px" }}
                    />
                    <span>
                      Kỹ thuật xây dựng hoạt động tương tác sôi nổi,
                      gamification trắc nghiệm.
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      color="#10b981"
                      style={{ flexShrink: 0, marginTop: "2px" }}
                    />
                    <span>
                      Thiết kế kịch bản giảng dạy đa phương tiện đúng chuẩn Công
                      văn 5512 Bộ GD&ĐT.
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px",
                    }}
                  >
                    <CheckCircle2
                      size={16}
                      color="#10b981"
                      style={{ flexShrink: 0, marginTop: "2px" }}
                    />
                    <span>
                      Nhận chứng chỉ hoàn thành khóa học có chữ ký số xác thực
                      từ EduChat.
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "var(--text-main)",
                    marginBottom: "8px",
                  }}
                >
                  Mô tả chi tiết khóa học
                </h4>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--text-muted)",
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                >
                  Khóa học được thiết kế dành riêng cho đội ngũ giáo viên, giảng
                  viên và các chuyên gia phát triển nội dung giáo dục số. Trang
                  bị toàn diện tư duy sư phạm ứng dụng công nghệ, hướng dẫn từng
                  bước từ khâu lên ý tưởng kịch bản đến hoàn thiện sản phẩm bài
                  giảng số đạt giải cao trong các kỳ thi giáo viên dạy giỏi các
                  cấp.
                </p>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "var(--text-main)",
                    marginBottom: "8px",
                  }}
                >
                  Đối tượng phù hợp
                </h4>
                <ul
                  style={{
                    paddingLeft: "20px",
                    fontSize: "14px",
                    color: "var(--text-muted)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  <li>
                    Giáo viên mầm non, tiểu học, THCS và THPT muốn đổi mới
                    phương pháp giảng dạy số.
                  </li>
                  <li>
                    Giảng viên đại học, cao đẳng đang phát triển học phần trực
                    tuyến (Blended Learning).
                  </li>
                  <li>
                    Học sinh, sinh viên sư phạm chuẩn bị hành trang kỹ năng số
                    trước khi ra trường.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: SYLLABUS */}
          {activeTab === "syllabus" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  Tổng cộng: {lessons.length} bài học •{" "}
                  {course.duration || "12 giờ"} học tập trực tuyến
                </span>
                <span className="badge badge-emerald">Cập nhật 2026</span>
              </div>

              {lessons.map((lsn: any, idx: number) => (
                <div
                  key={lsn.id || idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 18px",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: lsn.is_free_preview ? "#eff6ff" : "#f8fafc",
                        color: lsn.is_free_preview ? "#2563eb" : "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {lsn.is_free_preview ? (
                        <PlayCircle size={20} />
                      ) : (
                        <Lock size={18} />
                      )}
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: 700,
                          color: "var(--text-main)",
                          display: "block",
                        }}
                      >
                        {lsn.title}
                      </span>
                      <span
                        style={{ fontSize: "12px", color: "var(--text-muted)" }}
                      >
                        Thời lượng: {lsn.duration || "15:00"}
                      </span>
                    </div>
                  </div>

                  <div>
                    {lsn.is_free_preview ? (
                      <span
                        className="badge"
                        style={{
                          background: "#ecfdf5",
                          color: "#059669",
                          border: "1px solid #a7f3d0",
                          fontSize: "11px",
                        }}
                      >
                        Học thử miễn phí
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "12px",
                          color: "var(--text-subtle)",
                          fontWeight: 600,
                        }}
                      >
                        Đã khóa
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: REVIEWS & COMMENTS */}
          {activeTab === "reviews" && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Form add comment */}
              <form
                onSubmit={handleAddReview}
                style={{ display: "flex", gap: "10px" }}
              >
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Chia sẻ nhận xét hoặc đặt câu hỏi cho giảng viên..."
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

              {/* Review cards */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                }}
              >
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      padding: "16px",
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "14px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
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
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <strong
                          style={{
                            fontSize: "13px",
                            color: "var(--text-main)",
                          }}
                        >
                          {rev.name}
                        </strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <div style={{ display: "flex", color: "#fbbf24" }}>
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={13} fill="#fbbf24" />
                          ))}
                        </div>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--text-subtle)",
                          }}
                        >
                          {rev.date}
                        </span>
                      </div>
                    </div>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--text-muted)",
                        margin: 0,
                        lineHeight: 1.5,
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

        {/* Modal Bottom Footer Actions */}
        <div
          style={{
            padding: "18px 28px",
            background: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "12px",
                color: "var(--text-subtle)",
                display: "block",
              }}
            >
              Học phí trọn khóa:
            </span>
            <span
              style={{ fontSize: "22px", fontWeight: 800, color: "#2563eb" }}
            >
              {priceFormatted}
            </span>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {/* BUTTON TRANSITION TO DIRECTION 2 (TEACHER WORKSPACE) */}
            {isTeacher && onOpenTeacherWorkspace && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTeacherWorkspace(course);
                }}
                className="btn"
                style={{
                  background:
                    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  color: "#0f172a",
                  fontWeight: 800,
                  fontSize: "13px",
                  padding: "11px 20px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 14px rgba(245, 158, 11, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Settings size={16} />
                <span>⚙️ Bảng Quản trị & Biên tập Khóa học</span>
              </button>
            )}

            {/* Student action */}
            {!isTeacher && (
              <button
                onClick={handleEnroll}
                disabled={enrolling || isEnrolled}
                className="btn btn-primary"
                style={{
                  padding: "11px 24px",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                {enrolling
                  ? "Đang ghi danh..."
                  : isEnrolled
                    ? "Đã đăng ký thành công"
                    : "Đăng ký Khóa học ngay"}
              </button>
            )}

            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{
                color: "var(--text-muted)",
                background: "#f1f5f9",
                border: "1px solid #e2e8f0",
                fontSize: "13px",
                padding: "11px 18px",
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
