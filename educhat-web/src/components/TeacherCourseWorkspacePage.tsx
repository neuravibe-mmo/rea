import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Users,
  Video,
  FileText,
  Settings,
  CheckCircle2,
  Clock,
  Save,
  Check,
  Search,
  BookOpen,
  Award,
  ExternalLink,
  Eye,
  AlertCircle,
  Sparkles,
  UserPlus,
  X,
} from "lucide-react";
import { api } from "../services/api";

interface TeacherCourseWorkspacePageProps {
  course: any | null;
  onBackToDetail: (course: any) => void;
  onBackToTeacherConsole: () => void;
  onCourseUpdated?: () => void;
}

export const TeacherCourseWorkspacePage: React.FC<
  TeacherCourseWorkspacePageProps
> = ({ course, onBackToDetail, onBackToTeacherConsole, onCourseUpdated }) => {
  const [activeTab, setActiveTab] = useState<
    "curriculum" | "students" | "quizzes" | "settings"
  >("curriculum");
  const [lessons, setLessons] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courseRating, setCourseRating] = useState<number>(
    course?.rating || 5.0,
  );
  const [loading, setLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  // Add Student modal UI state
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    cccd: "",
    role: "Học viên chính thức",
    initialProgress: 0,
    sendNotification: true,
  });

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // UI sẵn sàng. Logic ghi danh / gọi API backend sẽ được bạn tự code xử lý sau.
    setShowAddStudentModal(false);
  };

  // New Lesson form
  const [showAddLessonForm, setShowAddLessonForm] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonDuration, setNewLessonDuration] = useState("15:00");
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState(
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  );
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);

  // Settings form
  const [settingsTitle, setSettingsTitle] = useState("");
  const [settingsPrice, setSettingsPrice] = useState(399000);
  const [settingsDuration, setSettingsDuration] = useState("18 giờ");
  const [settingsLevel, setSettingsLevel] = useState("Cơ bản đến Nâng cao");
  const [settingsCategory, setSettingsCategory] = useState("Kỹ năng sư phạm");
  const [savingSettings, setSavingSettings] = useState(false);

  // Notification
  const [notification, setNotification] = useState<string | null>(null);

  const fetchCourseDetails = async () => {
    if (!course) return;
    try {
      setLoading(true);
      // 1. Fetch Course details & lessons
      const courseRes = await api.getCourseDetail(course.id);
      if (courseRes) {
        if (courseRes.rating) setCourseRating(courseRes.rating);
        if (courseRes.lessons) setLessons(courseRes.lessons);
        setSettingsTitle(courseRes.title || course.title);
        setSettingsPrice(courseRes.price || 399000);
        setSettingsDuration(courseRes.duration || "18 giờ");
        setSettingsLevel(courseRes.level || "Cơ bản đến Nâng cao");
        setSettingsCategory(courseRes.category || "Kỹ năng sư phạm");
      }

      // 2. Fetch Students enrolled
      const studentsRes = await api.getCourseStudents(course.id);
      if (Array.isArray(studentsRes)) {
        setStudents(studentsRes);
      } else if (studentsRes && studentsRes.students) {
        setStudents(studentsRes.students);
      }
    } catch (e) {
      console.error("Lỗi nạp dữ liệu workspace:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDetails();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [course]);

  if (!course) {
    return (
      <div style={{ padding: "80px 20px", textAlign: "center" }}>
        <h3>Không tìm thấy khóa học cần quản trị</h3>
        <button
          onClick={onBackToTeacherConsole}
          className="btn btn-primary"
          style={{ marginTop: "16px" }}
        >
          Về LMS Giảng viên
        </button>
      </div>
    );
  }

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) {
      alert("Vui lòng nhập tiêu đề bài học!");
      return;
    }

    try {
      setAddingLesson(true);
      const res = await api.addCourseLesson(course.id, {
        title: newLessonTitle.trim(),
        duration: newLessonDuration || "15:00",
        video_url: newLessonVideoUrl || "",
        is_free_preview: isFreePreview,
      });

      if (res.success) {
        setNotification("Đã thêm bài giảng mới vào giáo trình thành công!");
        setNewLessonTitle("");
        setShowAddLessonForm(false);
        fetchCourseDetails();
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (err: any) {
      alert("Lỗi thêm bài giảng: " + err.message);
    } finally {
      setAddingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài giảng này khỏi khóa học?"))
      return;
    try {
      const res = await api.deleteCourseLesson(course.id, lessonId);
      if (res.success) {
        setNotification("Đã xóa bài giảng khỏi giáo trình.");
        fetchCourseDetails();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err: any) {
      alert("Lỗi xóa bài giảng: " + err.message);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await api.updateCourse(course.id, {
        title: settingsTitle,
        price: Number(settingsPrice),
        duration: settingsDuration,
        level: settingsLevel,
        category: settingsCategory,
      });

      if (res.success) {
        setNotification("Đã cập nhật thiết lập khóa học thành công!");
        if (onCourseUpdated) onCourseUpdated();
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (err: any) {
      alert("Lỗi cập nhật: " + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullname?.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email?.toLowerCase().includes(studentSearch.toLowerCase()),
  );

  return (
    <div
      style={{
        background: "#f8fafc",
        minHeight: "100vh",
        paddingBottom: "80px",
      }}
    >
      {/* Top Breadcrumb & Navigation Bar */}
      <div
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          padding: "12px 0",
        }}
      >
        <div
          className="container-wide"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
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
              onClick={onBackToTeacherConsole}
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
              <span>LMS Giảng viên</span>
            </button>
            <span>/</span>
            <span>Quản lý Khóa học</span>
            <span>/</span>
            <span style={{ color: "#0f172a", fontWeight: 600 }}>
              {course.title}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {/* Transition button back to Direction 1 */}
            <button
              onClick={() => onBackToDetail(course)}
              className="btn btn-secondary"
              style={{
                fontSize: "12px",
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "#eff6ff",
                color: "#2563eb",
                borderColor: "#bfdbfe",
                fontWeight: 600,
              }}
            >
              <Eye size={15} />
              <span>← Xem trang Giới thiệu khóa học</span>
            </button>

            <button
              onClick={onBackToTeacherConsole}
              className="btn btn-secondary"
              style={{
                fontSize: "12px",
                padding: "8px 14px",
                background: "#f1f5f9",
                color: "#475569",
              }}
            >
              Về bảng điều khiển
            </button>
          </div>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e3a8a 100%)",
          color: "#ffffff",
          padding: "36px 0 40px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div className="container-wide">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "20px",
            }}
          >
            <div style={{ maxWidth: "1040px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                <span
                  className="badge"
                  style={{
                    background: "#f59e0b",
                    color: "#0f172a",
                    fontWeight: 800,
                    fontSize: "11px",
                    padding: "4px 10px",
                  }}
                >
                  LMS TEACHER WORKSPACE
                </span>
                <span
                  style={{
                    color: "rgba(255, 255, 255, 0.7)",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                >
                  Mã lớp: {course.id}
                </span>
                <span
                  className="badge"
                  style={{
                    background: "rgba(16, 185, 129, 0.2)",
                    color: "#34d399",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    fontSize: "11px",
                  }}
                >
                  Đang hoạt động
                </span>
              </div>

              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: 800,
                  margin: 0,
                  lineHeight: 1.35,
                  color: "#fff",
                }}
              >
                {course.title}
              </h1>

              <p
                style={{
                  fontSize: "14px",
                  color: "rgba(255, 255, 255, 0.8)",
                  marginTop: "10px",
                }}
              >
                Biên soạn chương trình, theo dõi tiến độ học tập của từng học
                viên và cấu hình bài thi đánh giá chuẩn CV 5512.
              </p>
            </div>

            {/* Quick KPI Stat Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                background: "rgba(255, 255, 255, 0.08)",
                padding: "16px",
                borderRadius: "14px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <div style={{ textAlign: "center", padding: "0 12px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    color: "rgba(255, 255, 255, 0.7)",
                    display: "block",
                  }}
                >
                  Bài giảng
                </span>
                <strong style={{ fontSize: "20px", color: "#38bdf8" }}>
                  {lessons.length}
                </strong>
              </div>
              <div
                style={{
                  textAlign: "center",
                  padding: "0 12px",
                  borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRight: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "rgba(255, 255, 255, 0.7)",
                    display: "block",
                  }}
                >
                  Học viên
                </span>
                <strong style={{ fontSize: "20px", color: "#34d399" }}>
                  {students.length.toLocaleString("vi-VN")}
                </strong>
              </div>
              <div style={{ textAlign: "center", padding: "0 12px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    color: "rgba(255, 255, 255, 0.7)",
                    display: "block",
                  }}
                >
                  Đánh giá
                </span>
                <strong style={{ fontSize: "20px", color: "#fbbf24" }}>
                  {courseRating.toFixed(1)} ★
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="container-wide" style={{ marginTop: "28px" }}>
        {/* Notification Toast */}
        {notification && (
          <div
            style={{
              padding: "14px 20px",
              background: "#dcfce7",
              color: "#15803d",
              borderRadius: "12px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              border: "1px solid #86efac",
              fontWeight: 600,
              fontSize: "14px",
              boxShadow: "0 4px 12px rgba(22, 163, 74, 0.15)",
            }}
          >
            <CheckCircle2 size={18} />
            <span>{notification}</span>
          </div>
        )}

        {/* Workspace Navigation Tabs */}
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
            onClick={() => setActiveTab("curriculum")}
            style={{
              flex: 1,
              padding: "12px 18px",
              fontSize: "14px",
              fontWeight: 700,
              color: activeTab === "curriculum" ? "#2563eb" : "#64748b",
              background: activeTab === "curriculum" ? "#eff6ff" : "none",
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
            <Video size={16} />
            <span>1. Giáo trình bài giảng ({lessons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("students")}
            style={{
              flex: 1,
              padding: "12px 18px",
              fontSize: "14px",
              fontWeight: 700,
              color: activeTab === "students" ? "#2563eb" : "#64748b",
              background: activeTab === "students" ? "#eff6ff" : "none",
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
            <Users size={16} />
            <span>2. Danh sách Học viên ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("quizzes")}
            style={{
              flex: 1,
              padding: "12px 18px",
              fontSize: "14px",
              fontWeight: 700,
              color: activeTab === "quizzes" ? "#2563eb" : "#64748b",
              background: activeTab === "quizzes" ? "#eff6ff" : "none",
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
            <FileText size={16} />
            <span>3. Bài kiểm tra đính kèm</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            style={{
              flex: 1,
              padding: "12px 18px",
              fontSize: "14px",
              fontWeight: 700,
              color: activeTab === "settings" ? "#2563eb" : "#64748b",
              background: activeTab === "settings" ? "#eff6ff" : "none",
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
            <Settings size={16} />
            <span>4. Cài đặt Lớp học & Học phí</span>
          </button>
        </div>

        {/* TAB 1: CURRICULUM EDITOR */}
        {activeTab === "curriculum" && (
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
                  Danh sách Bài giảng trong Giáo trình
                </h3>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Thêm, xóa hoặc chỉnh sửa nội dung video bài giảng hiển thị cho
                  học viên
                </span>
              </div>

              <button
                onClick={() => setShowAddLessonForm(!showAddLessonForm)}
                className="btn btn-primary"
                style={{ fontSize: "13px" }}
              >
                <Plus size={16} />
                <span>
                  {showAddLessonForm ? "Đóng form" : "Thêm bài giảng mới"}
                </span>
              </button>
            </div>

            {/* Collapsible Add Lesson Form */}
            {showAddLessonForm && (
              <form
                onSubmit={handleAddLesson}
                style={{
                  padding: "20px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "14px",
                  marginBottom: "24px",
                }}
              >
                <h4
                  style={{
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "#166534",
                    marginBottom: "16px",
                  }}
                >
                  Soạn bài giảng mới
                </h4>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "16px",
                    marginBottom: "14px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        marginBottom: "6px",
                      }}
                    >
                      Tiêu đề bài học:
                    </label>
                    <input
                      type="text"
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      placeholder="VD: Bài 6: Tối ưu tương tác với bộ công cụ H5P..."
                      className="form-input"
                      required
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 600,
                        marginBottom: "6px",
                      }}
                    >
                      Thời lượng ước tính:
                    </label>
                    <input
                      type="text"
                      value={newLessonDuration}
                      onChange={(e) => setNewLessonDuration(e.target.value)}
                      placeholder="VD: 18:30"
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "12px",
                      fontWeight: 600,
                      marginBottom: "6px",
                    }}
                  >
                    URL Video bài giảng (MP4 / HLS / YouTube):
                  </label>
                  <input
                    type="url"
                    value={newLessonVideoUrl}
                    onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="form-input"
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isFreePreview}
                      onChange={(e) => setIsFreePreview(e.target.checked)}
                      style={{
                        width: "16px",
                        height: "16px",
                        accentColor: "#16a34a",
                      }}
                    />
                    <span>
                      Cho phép học viên học thử miễn phí (Free Preview)
                    </span>
                  </label>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setShowAddLessonForm(false)}
                      className="btn btn-secondary"
                      style={{ fontSize: "13px" }}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={addingLesson}
                      className="btn btn-primary"
                      style={{ fontSize: "13px" }}
                    >
                      {addingLesson ? "Đang lưu..." : "Lưu vào giáo trình"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Lessons Table */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson.id || idx}
                  style={{
                    padding: "16px 20px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
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
                        background: "#e2e8f0",
                        color: "#475569",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: "13px",
                      }}
                    >
                      {idx + 1}
                    </div>

                    <div>
                      <strong
                        style={{
                          fontSize: "14px",
                          color: "#0f172a",
                          display: "block",
                        }}
                      >
                        {lesson.title}
                      </strong>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          fontSize: "12px",
                          color: "#64748b",
                          marginTop: "4px",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Clock size={12} /> {lesson.duration || "15:00"}
                        </span>
                        {lesson.is_free_preview ? (
                          <span
                            className="badge badge-emerald"
                            style={{ fontSize: "10px" }}
                          >
                            Học thử miễn phí
                          </span>
                        ) : (
                          <span
                            className="badge"
                            style={{
                              fontSize: "10px",
                              background: "#f1f5f9",
                              color: "#64748b",
                            }}
                          >
                            Khóa học viên
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteLesson(lesson.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ef4444",
                      padding: "8px",
                      cursor: "pointer",
                      borderRadius: "8px",
                    }}
                    title="Xóa bài học"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: STUDENTS ROSTER */}
        {activeTab === "students" && (
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
                flexWrap: "wrap",
                gap: "12px",
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
                  Danh sách Học viên Ghi danh ({students.length})
                </h3>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Theo dõi tiến trình bài học và tình trạng hoàn thành của từng
                  học viên
                </span>
              </div>

              {/* Search & Add Student button */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ position: "relative", width: "260px" }}>
                  <Search
                    size={15}
                    color="#94a3b8"
                    style={{ position: "absolute", left: "12px", top: "12px" }}
                  />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Tìm theo tên học viên hoặc email..."
                    className="form-input"
                    style={{ paddingLeft: "36px", fontSize: "13px" }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(true)}
                  className="btn btn-primary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 18px",
                    fontSize: "13px",
                    fontWeight: 600,
                    borderRadius: "var(--radius-sm)",
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 6px rgba(14, 165, 233, 0.25)",
                    cursor: "pointer",
                  }}
                >
                  <UserPlus size={16} />
                  <span>Thêm học viên mới</span>
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                      textAlign: "left",
                    }}
                  >
                    <th style={{ padding: "12px 16px", color: "#64748b" }}>
                      HỌC VIÊN
                    </th>
                    <th style={{ padding: "12px 16px", color: "#64748b" }}>
                      EMAIL
                    </th>
                    <th style={{ padding: "12px 16px", color: "#64748b" }}>
                      TIẾN ĐỘ HOÀN THÀNH
                    </th>
                    <th style={{ padding: "12px 16px", color: "#64748b" }}>
                      TRẠNG THÁI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          padding: "24px",
                          textAlign: "center",
                          color: "#94a3b8",
                        }}
                      >
                        Chưa có học viên nào khớp với tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => (
                      <tr
                        key={st.enrollment_id || st.id || st.user_id}
                        style={{ borderBottom: "1px solid #f1f5f9" }}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <img
                              src={
                                st.avatar ||
                                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
                              }
                              alt={st.fullname}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                            <strong style={{ color: "#0f172a" }}>
                              {st.fullname}
                            </strong>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", color: "#64748b" }}>
                          {st.email}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                                height: "8px",
                                background: "#e2e8f0",
                                borderRadius: "4px",
                                overflow: "hidden",
                                maxWidth: "160px",
                              }}
                            >
                              <div
                                style={{
                                  width: `${st.progress || 65}%`,
                                  height: "100%",
                                  background: "#10b981",
                                  borderRadius: "4px",
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontWeight: 700,
                                color: "#0f172a",
                                fontSize: "12px",
                              }}
                            >
                              {st.progress || 65}%
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span className="badge badge-emerald">Đang học</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: QUIZZES */}
        {activeTab === "quizzes" && (
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
                  Đề thi & Đánh giá Cuối khóa
                </h3>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Học viên đạt trên 70% điểm sẽ được cấp chứng chỉ tự động
                </span>
              </div>
              <button
                onClick={() =>
                  alert(
                    "Tính năng tạo đề trắc nghiệm H5P mới đang hoạt động trong LMS.",
                  )
                }
                className="btn btn-primary"
                style={{ fontSize: "13px" }}
              >
                <Plus size={16} />
                <span>Gắn đề thi mới</span>
              </button>
            </div>

            <div
              style={{
                padding: "20px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <strong
                  style={{
                    fontSize: "15px",
                    color: "#0f172a",
                    display: "block",
                  }}
                >
                  Bài kiểm tra trắc nghiệm: Kỹ thuật xây dựng bài giảng SCORM
                  chuẩn CV 5512
                </strong>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  25 câu hỏi trắc nghiệm • Thời gian: 45 phút • Điểm chuẩn đạt:
                  7.0/10
                </span>
              </div>
              <span className="badge badge-blue">Đang mở bài thi</span>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === "settings" && (
          <form
            onSubmit={handleSaveSettings}
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
              Cài đặt & Thiết lập Khóa học
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "8px",
                  }}
                >
                  Tên khóa học:
                </label>
                <input
                  type="text"
                  value={settingsTitle}
                  onChange={(e) => setSettingsTitle(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "8px",
                  }}
                >
                  Học phí khóa học (VNĐ):
                </label>
                <input
                  type="number"
                  value={settingsPrice}
                  onChange={(e) => setSettingsPrice(Number(e.target.value))}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "24px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "8px",
                  }}
                >
                  Thời lượng khóa học:
                </label>
                <input
                  type="text"
                  value={settingsDuration}
                  onChange={(e) => setSettingsDuration(e.target.value)}
                  className="form-input"
                  placeholder="VD: 18 giờ"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "8px",
                  }}
                >
                  Danh mục chuyên ngành:
                </label>
                <input
                  type="text"
                  value={settingsCategory}
                  onChange={(e) => setSettingsCategory(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
              }}
            >
              <button
                type="submit"
                disabled={savingSettings}
                className="btn btn-primary"
                style={{
                  padding: "10px 24px",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Save size={16} />
                <span>{savingSettings ? "Đang lưu..." : "Lưu thay đổi"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Modal Thêm Học Viên Mới (Giao diện dựng sẵn) */}
      {showAddStudentModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
          onClick={() => setShowAddStudentModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "540px",
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
                    background: "rgba(14, 165, 233, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UserPlus size={20} color="#0284c7" />
                </div>
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: 0,
                    }}
                  >
                    Thêm Học Viên Mới
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      margin: "2px 0 0",
                    }}
                  >
                    Ghi danh vào khóa:{" "}
                    <strong>{course?.title || "Khóa học"}</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
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

            {/* Modal Body / Form */}
            <form onSubmit={handleAddStudentSubmit} style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Họ và tên học viên{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.fullname}
                    onChange={(e) =>
                      setNewStudentForm({
                        ...newStudentForm,
                        fullname: e.target.value,
                      })
                    }
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="form-input"
                    style={{ width: "100%", fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: "6px",
                    }}
                  >
                    Email học viên <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newStudentForm.email}
                    onChange={(e) =>
                      setNewStudentForm({
                        ...newStudentForm,
                        email: e.target.value,
                      })
                    }
                    placeholder="hocvien@example.com"
                    className="form-input"
                    style={{ width: "100%", fontSize: "14px" }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={newStudentForm.phone}
                      onChange={(e) =>
                        setNewStudentForm({
                          ...newStudentForm,
                          phone: e.target.value,
                        })
                      }
                      placeholder="0912 345 678"
                      className="form-input"
                      style={{ width: "100%", fontSize: "14px" }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Số CCCD / Mã định danh
                    </label>
                    <input
                      type="text"
                      value={newStudentForm.cccd}
                      onChange={(e) =>
                        setNewStudentForm({
                          ...newStudentForm,
                          cccd: e.target.value,
                        })
                      }
                      placeholder="00120000xxxx"
                      className="form-input"
                      style={{ width: "100%", fontSize: "14px" }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Phân loại học viên
                    </label>
                    <select
                      value={newStudentForm.role}
                      onChange={(e) =>
                        setNewStudentForm({
                          ...newStudentForm,
                          role: e.target.value,
                        })
                      }
                      className="form-input"
                      style={{ width: "100%", fontSize: "13px" }}
                    >
                      <option value="Học viên chính thức">
                        Học viên chính thức
                      </option>
                      <option value="Học viên dự thính">
                        Học viên dự thính
                      </option>
                      <option value="Học viên học bổng">
                        Học viên học bổng
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: "6px",
                      }}
                    >
                      Tiến độ ban đầu (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newStudentForm.initialProgress}
                      onChange={(e) =>
                        setNewStudentForm({
                          ...newStudentForm,
                          initialProgress: Number(e.target.value),
                        })
                      }
                      className="form-input"
                      style={{ width: "100%", fontSize: "14px" }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    background: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "var(--radius-sm)",
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "12px",
                      color: "#166534",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={newStudentForm.sendNotification}
                      onChange={(e) =>
                        setNewStudentForm({
                          ...newStudentForm,
                          sendNotification: e.target.checked,
                        })
                      }
                    />
                    <span>
                      Gửi email thông báo kích hoạt khóa học và hướng dẫn đăng
                      nhập
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "24px",
                  paddingTop: "16px",
                  borderTop: "1px solid #e2e8f0",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  style={{
                    padding: "9px 18px",
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "var(--radius-sm)",
                    color: "#475569",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    padding: "9px 20px",
                    fontSize: "13px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                >
                  <UserPlus size={16} />
                  <span>Xác nhận thêm học viên</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
