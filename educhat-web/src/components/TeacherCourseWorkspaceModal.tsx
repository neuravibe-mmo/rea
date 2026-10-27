import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Users,
  Video,
  FileText,
  Settings,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Save,
  Check,
  Search,
} from "lucide-react";
import { api } from "../services/api";

interface TeacherCourseWorkspaceModalProps {
  course: any | null;
  onClose: () => void;
  onBackToDetail: (course: any) => void;
  onCourseUpdated?: () => void;
}

export const TeacherCourseWorkspaceModal: React.FC<
  TeacherCourseWorkspaceModalProps
> = ({ course, onClose, onBackToDetail, onCourseUpdated }) => {
  const [activeTab, setActiveTab] = useState<
    "curriculum" | "students" | "quizzes" | "settings"
  >("curriculum");
  const [lessons, setLessons] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

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
  const [settingsDuration, setSettingsDuration] = useState("12 giờ");
  const [settingsLevel, setSettingsLevel] = useState("Cơ bản đến Nâng cao");
  const [settingsCategory, setSettingsCategory] = useState("Kỹ năng sư phạm");
  const [savingSettings, setSavingSettings] = useState(false);

  // Notification
  const [notification, setNotification] = useState<string | null>(null);

  const fetchCourseDetails = async () => {
    if (!course) return;
    try {
      setLoading(true);
      const detail = await api.getCourseDetail(course.id);
      if (detail && detail.lessons) {
        setLessons(detail.lessons);
      }

      const enrolledStudents = await api.getCourseStudents(course.id);
      setStudents(enrolledStudents);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!course) return;
    setSettingsTitle(course.title || "");
    setSettingsPrice(course.price || 399000);
    setSettingsDuration(course.duration || "12 giờ");
    setSettingsLevel(course.level || "Cơ bản đến Nâng cao");
    setSettingsCategory(course.category || "Kỹ năng sư phạm");
    fetchCourseDetails();
  }, [course]);

  if (!course) return null;

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;
    try {
      setAddingLesson(true);
      const res = await api.addCourseLesson(course.id, {
        title: newLessonTitle.trim(),
        duration: newLessonDuration,
        video_url: newLessonVideoUrl,
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
        setNotification("Cập nhật thông tin khóa học thành công!");
        if (onCourseUpdated) onCourseUpdated();
        setTimeout(() => setNotification(null), 4000);
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
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{
          maxWidth: "960px",
          width: "95%",
          maxHeight: "92vh",
          padding: 0,
          borderRadius: "20px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Workspace Top Header */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e3a8a 100%)",
            color: "#ffffff",
            padding: "20px 28px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <button
              onClick={() => onBackToDetail(course)}
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                border: "none",
                color: "#fff",
                padding: "8px 12px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <ArrowLeft size={14} />
              <span>Xem trang Giới thiệu (Hướng 1)</span>
            </button>

            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  className="badge"
                  style={{
                    background: "rgba(245, 158, 11, 0.25)",
                    color: "#fbbf24",
                    border: "1px solid rgba(245, 158, 11, 0.4)",
                    fontSize: "10px",
                  }}
                >
                  LMS Teacher Workspace
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  Mã KH: {course.id}
                </span>
              </div>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  margin: "4px 0 0",
                  color: "#fff",
                }}
              >
                {settingsTitle || course.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
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
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Workspace Tab Bar */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid #e2e8f0",
            background: "#f8fafc",
            padding: "0 28px",
          }}
        >
          <button
            onClick={() => setActiveTab("curriculum")}
            style={{
              padding: "14px 20px",
              fontSize: "14px",
              fontWeight: 700,
              color: activeTab === "curriculum" ? "#4f46e5" : "#64748b",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "curriculum"
                  ? "3px solid #4f46e5"
                  : "3px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Video size={16} />
            <span>1. Giáo trình bài giảng ({lessons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("students")}
            style={{
              padding: "14px 20px",
              fontSize: "14px",
              fontWeight: 700,
              color: activeTab === "students" ? "#4f46e5" : "#64748b",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "students"
                  ? "3px solid #4f46e5"
                  : "3px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Users size={16} />
            <span>2. Danh sách Học viên ({students.length || "1.840"})</span>
          </button>

          <button
            onClick={() => setActiveTab("quizzes")}
            style={{
              padding: "14px 20px",
              fontSize: "14px",
              fontWeight: 700,
              color: activeTab === "quizzes" ? "#4f46e5" : "#64748b",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "quizzes"
                  ? "3px solid #4f46e5"
                  : "3px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle2 size={16} />
            <span>3. Bài kiểm tra đính kèm</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            style={{
              padding: "14px 20px",
              fontSize: "14px",
              fontWeight: 700,
              color: activeTab === "settings" ? "#4f46e5" : "#64748b",
              background: "none",
              border: "none",
              borderBottom:
                activeTab === "settings"
                  ? "3px solid #4f46e5"
                  : "3px solid transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Settings size={16} />
            <span>4. Cài đặt Lớp học</span>
          </button>
        </div>

        {/* Workspace Body Content */}
        <div
          style={{
            padding: "28px",
            overflowY: "auto",
            flex: 1,
            maxHeight: "calc(92vh - 200px)",
          }}
        >
          {notification && (
            <div className="alert-success-box" style={{ marginBottom: "20px" }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>{notification}</span>
            </div>
          )}

          {/* TAB 1: CURRICULUM MANAGEMENT */}
          {activeTab === "curriculum" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: 800,
                      color: "var(--text-main)",
                      margin: 0,
                    }}
                  >
                    Quản lý Chương mục & Video Bài giảng
                  </h4>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      margin: "4px 0 0",
                    }}
                  >
                    Tải lên bài giảng video, cấu hình xem thử miễn phí cho học
                    viên
                  </p>
                </div>
                <button
                  onClick={() => setShowAddLessonForm(!showAddLessonForm)}
                  className="btn btn-primary"
                  style={{ fontSize: "13px", padding: "9px 16px" }}
                >
                  <Plus size={15} />
                  <span>
                    {showAddLessonForm ? "Đóng form" : "Thêm Bài giảng mới"}
                  </span>
                </button>
              </div>

              {/* Add Lesson Form */}
              {showAddLessonForm && (
                <form
                  onSubmit={handleAddLesson}
                  style={{
                    background: "#f8fafc",
                    border: "1.5px dashed #cbd5e1",
                    borderRadius: "14px",
                    padding: "20px",
                    marginBottom: "24px",
                  }}
                >
                  <h5
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      margin: "0 0 12px",
                      color: "#1e293b",
                    }}
                  >
                    Biên soạn bài giảng mới
                  </h5>

                  <div style={{ marginBottom: "12px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        fontWeight: 700,
                        marginBottom: "4px",
                      }}
                    >
                      Tiêu đề bài giảng *
                    </label>
                    <input
                      type="text"
                      required
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      placeholder="VD: Bài 6: Đóng gói chuẩn SCORM và đưa lên hệ thống LMS"
                      className="form-input"
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 2fr",
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
                          marginBottom: "4px",
                        }}
                      >
                        Thời lượng (phút:giây)
                      </label>
                      <input
                        type="text"
                        value={newLessonDuration}
                        onChange={(e) => setNewLessonDuration(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "12px",
                          fontWeight: 700,
                          marginBottom: "4px",
                        }}
                      >
                        Đường dẫn Video bài giảng (MP4/HLS)
                      </label>
                      <input
                        type="text"
                        value={newLessonVideoUrl}
                        onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <input
                      type="checkbox"
                      id="isFreePreview"
                      checked={isFreePreview}
                      onChange={(e) => setIsFreePreview(e.target.checked)}
                      style={{ width: "16px", height: "16px" }}
                    />
                    <label
                      htmlFor="isFreePreview"
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--text-main)",
                        cursor: "pointer",
                      }}
                    >
                      Cho phép học thử miễn phí (Free Preview)
                    </label>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "10px",
                    }}
                  >
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
                      {addingLesson ? "Đang lưu..." : "Lưu vào khóa học"}
                    </button>
                  </div>
                </form>
              )}

              {/* Lessons List */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
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
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <span
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: "#e0e7ff",
                          color: "#4f46e5",
                          fontWeight: 800,
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <strong
                          style={{
                            fontSize: "14px",
                            color: "var(--text-main)",
                            display: "block",
                          }}
                        >
                          {lsn.title}
                        </strong>
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                          }}
                        >
                          Thời lượng: {lsn.duration}{" "}
                          {lsn.is_free_preview ? "• Xem thử miễn phí" : ""}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      {lsn.is_free_preview ? (
                        <span
                          className="badge badge-emerald"
                          style={{ fontSize: "10px" }}
                        >
                          Xem thử
                        </span>
                      ) : null}
                      <button
                        onClick={() => handleDeleteLesson(lsn.id)}
                        style={{
                          background: "#fee2e2",
                          border: "none",
                          color: "#dc2626",
                          padding: "6px",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                        title="Xóa bài giảng"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: STUDENTS MANAGEMENT */}
          {activeTab === "students" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <h4
                    style={{
                      fontSize: "16px",
                      fontWeight: 800,
                      color: "var(--text-main)",
                      margin: 0,
                    }}
                  >
                    Danh sách Học viên Ghi danh
                  </h4>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--text-muted)",
                      margin: "4px 0 0",
                    }}
                  >
                    Theo dõi tiến trình bài học và tình trạng hoàn thành của học
                    viên
                  </p>
                </div>

                <div style={{ position: "relative", minWidth: "260px" }}>
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Tìm theo tên học viên hoặc email..."
                    className="form-input"
                    style={{ paddingLeft: "36px", fontSize: "13px" }}
                  />
                  <Search
                    size={15}
                    color="#94a3b8"
                    style={{ position: "absolute", left: "12px", top: "14px" }}
                  />
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    background: "#f8fafc",
                    borderRadius: "12px",
                  }}
                >
                  <Users
                    size={32}
                    color="#94a3b8"
                    style={{ marginBottom: "8px" }}
                  />
                  <p
                    style={{
                      fontSize: "14px",
                      color: "var(--text-muted)",
                      margin: 0,
                    }}
                  >
                    Học viên ghi danh: <strong>1.840 học sinh</strong> đang theo
                    học trên hệ thống.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "13px",
                      textAlign: "left",
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
                        }}
                      >
                        <th style={{ padding: "12px 18px" }}>Học viên</th>
                        <th style={{ padding: "12px 18px" }}>Email</th>
                        <th style={{ padding: "12px 18px" }}>
                          Tiến độ hoàn thành
                        </th>
                        <th style={{ padding: "12px 18px" }}>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((st) => (
                        <tr
                          key={st.enrollment_id || st.user_id}
                          style={{ borderBottom: "1px solid #f1f5f9" }}
                        >
                          <td
                            style={{
                              padding: "12px 18px",
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <img
                              src={
                                st.avatar ||
                                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"
                              }
                              alt={st.fullname}
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                            <strong>{st.fullname}</strong>
                          </td>
                          <td
                            style={{
                              padding: "12px 18px",
                              color: "var(--text-muted)",
                            }}
                          >
                            {st.email}
                          </td>
                          <td style={{ padding: "12px 18px" }}>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <div
                                className="progress-track"
                                style={{ width: "100px", margin: 0 }}
                              >
                                <div
                                  className="progress-fill"
                                  style={{
                                    width: `${st.progress_percent || 65}%`,
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 700,
                                  color: "#059669",
                                }}
                              >
                                {st.progress_percent || 65}%
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 18px" }}>
                            <span
                              className="badge badge-emerald"
                              style={{ fontSize: "10px" }}
                            >
                              Đang học
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUIZ ASSIGNMENT */}
          {activeTab === "quizzes" && (
            <div>
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "var(--text-main)",
                  margin: "0 0 4px",
                }}
              >
                Gắn Bài Kiểm Tra & Đánh Giá Tốt Nghiệp Khóa Học
              </h4>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  margin: "0 0 20px",
                }}
              >
                Học viên bắt buộc phải hoàn thành bài thi đạt thang điểm tối
                thiểu để được cấp chứng nhận
              </p>

              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span
                    className="badge badge-blue"
                    style={{ marginBottom: "6px" }}
                  >
                    Đề thi trắc nghiệm đã gắn
                  </span>
                  <h5 style={{ fontSize: "15px", fontWeight: 700, margin: 0 }}>
                    Bài kiểm tra Đánh giá Năng lực Sư phạm Số & E-learning (20
                    câu trắc nghiệm)
                  </h5>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "var(--text-muted)",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    Thời gian làm bài: 45 phút • Thang điểm: 10 (Yêu cầu tối
                    thiểu: 7.0 điểm)
                  </span>
                </div>
                <span className="badge badge-emerald">Đang kích hoạt</span>
              </div>
            </div>
          )}

          {/* TAB 4: COURSE SETTINGS */}
          {activeTab === "settings" && (
            <form onSubmit={handleSaveSettings} style={{ maxWidth: "600px" }}>
              <h4
                style={{
                  fontSize: "16px",
                  fontWeight: 800,
                  color: "var(--text-main)",
                  margin: "0 0 16px",
                }}
              >
                Cài đặt & Thông số Khóa học
              </h4>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 700,
                    marginBottom: "6px",
                  }}
                >
                  Tiêu đề Khóa học
                </label>
                <input
                  type="text"
                  required
                  value={settingsTitle}
                  onChange={(e) => setSettingsTitle(e.target.value)}
                  className="form-input"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                  marginBottom: "16px",
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
                    Học phí (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={settingsPrice}
                    onChange={(e) =>
                      setSettingsPrice(parseInt(e.target.value) || 0)
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
                    Thời lượng dự kiến
                  </label>
                  <input
                    type="text"
                    value={settingsDuration}
                    onChange={(e) => setSettingsDuration(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
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
                    Cấp độ học viên
                  </label>
                  <input
                    type="text"
                    value={settingsLevel}
                    onChange={(e) => setSettingsLevel(e.target.value)}
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
                    Chuyên mục
                  </label>
                  <select
                    value={settingsCategory}
                    onChange={(e) => setSettingsCategory(e.target.value)}
                    className="form-input"
                  >
                    <option value="Kỹ năng sư phạm">Kỹ năng sư phạm</option>
                    <option value="Toán học & Khoa học">
                      Toán học & Khoa học
                    </option>
                    <option value="Ngoại ngữ">Ngoại ngữ</option>
                    <option value="Công nghệ GD">Công nghệ GD</option>
                  </select>
                </div>
              </div>

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
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
