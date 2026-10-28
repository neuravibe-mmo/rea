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
  UserPlus,
  Send,
  RefreshCw,
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

  // Course Invitation state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [eligibleStudents, setEligibleStudents] = useState<any[]>([]);
  const [searchingEligible, setSearchingEligible] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [sendingInviteId, setSendingInviteId] = useState<string | null>(null);
  const [inviteFeedback, setInviteFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [courseInvitations, setCourseInvitations] = useState<any[]>([]);
  const [invitationsTab, setInvitationsTab] = useState<"search" | "pending">(
    "search",
  );

  const loadEligibleStudents = async (query = "") => {
    if (!course?.id) return;
    setSearchingEligible(true);
    try {
      const res = await api.getEligibleStudents(course.id, query);
      if (res.success) {
        setEligibleStudents(res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearchingEligible(false);
    }
  };

  const loadCourseInvitations = async () => {
    if (!course?.id) return;
    try {
      const res = await api.getCourseInvitations(course.id);
      if (res.success) {
        setCourseInvitations(res.data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenInviteModal = () => {
    setShowInviteModal(true);
    setInviteFeedback(null);
    setInviteSearch("");
    setInvitationsTab("search");
    loadEligibleStudents("");
    loadCourseInvitations();
  };

  const handleSendInvite = async (studentId: string) => {
    if (!course?.id) return;
    setSendingInviteId(studentId);
    setInviteFeedback(null);
    try {
      const res = await api.sendCourseInvitation(
        course.id,
        studentId,
        inviteMessage,
      );
      if (res.success) {
        setInviteFeedback({
          type: "success",
          text: res.message || "Đã gửi lời mời tham gia khóa học thành công!",
        });
        loadEligibleStudents(inviteSearch);
        loadCourseInvitations();
      } else {
        setInviteFeedback({
          type: "error",
          text: res.error || "Không thể gửi lời mời",
        });
      }
    } catch (err: any) {
      setInviteFeedback({
        type: "error",
        text: err.message || "Lỗi kết nối máy chủ",
      });
    } finally {
      setSendingInviteId(null);
    }
  };

  const handleCancelInvite = async (invitationId: string) => {
    if (!course?.id) return;
    try {
      const res = await api.cancelCourseInvitation(course.id, invitationId);
      if (res.success) {
        setInviteFeedback({
          type: "success",
          text: "Đã thu hồi lời mời thành công!",
        });
        loadEligibleStudents(inviteSearch);
        loadCourseInvitations();
      }
    } catch (e) {
      console.error(e);
    }
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

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ position: "relative", minWidth: "240px" }}>
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
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "14px",
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenInviteModal}
                    className="btn btn-primary"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "9px 16px",
                      fontSize: "13px",
                      fontWeight: 600,
                      borderRadius: "var(--radius-sm)",
                      whiteSpace: "nowrap",
                      cursor: "pointer",
                    }}
                  >
                    <UserPlus size={16} />
                    <span>Mời học viên tham gia</span>
                  </button>
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

      {/* Modal Mời Học Viên Tham Gia Khóa Học */}
      {showInviteModal && (
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
          onClick={() => setShowInviteModal(false)}
        >
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "620px",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
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
                    width: "38px",
                    height: "38px",
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
                    Mời học viên tham gia khóa học
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "3px",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      Khóa: <strong>{course?.title}</strong>
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "10px",
                        fontWeight: 600,
                        background:
                          (course?.price || 0) === 0 ? "#ecfdf5" : "#fff7ed",
                        color:
                          (course?.price || 0) === 0 ? "#059669" : "#d97706",
                        border:
                          (course?.price || 0) === 0
                            ? "1px solid #a7f3d0"
                            : "1px solid #fed7aa",
                      }}
                    >
                      {(course?.price || 0) === 0
                        ? "Miễn phí (Học viên duyệt để vào)"
                        : `Có phí: ${(course?.price || 0).toLocaleString("vi-VN")} đ (Yêu cầu thanh toán)`}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
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

            {/* Sub-tabs: Tìm học viên vs Lời mời đang chờ */}
            <div
              style={{
                display: "flex",
                borderBottom: "1px solid #e2e8f0",
                background: "#ffffff",
                padding: "0 24px",
              }}
            >
              <button
                type="button"
                onClick={() => setInvitationsTab("search")}
                style={{
                  padding: "12px 16px",
                  border: "none",
                  background: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                  color:
                    invitationsTab === "search" ? "var(--primary)" : "#64748b",
                  borderBottom:
                    invitationsTab === "search"
                      ? "2px solid var(--primary)"
                      : "2px solid transparent",
                }}
              >
                Tìm & Mời học viên
              </button>
              <button
                type="button"
                onClick={() => setInvitationsTab("pending")}
                style={{
                  padding: "12px 16px",
                  border: "none",
                  background: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                  color:
                    invitationsTab === "pending" ? "var(--primary)" : "#64748b",
                  borderBottom:
                    invitationsTab === "pending"
                      ? "2px solid var(--primary)"
                      : "2px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>Lời mời đang chờ</span>
                {courseInvitations.filter((i) => i.status === "pending")
                  .length > 0 && (
                  <span
                    style={{
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: "10px",
                      padding: "1px 6px",
                      borderRadius: "10px",
                    }}
                  >
                    {
                      courseInvitations.filter((i) => i.status === "pending")
                        .length
                    }
                  </span>
                )}
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: "20px 24px",
                overflowY: "auto",
                flex: 1,
              }}
            >
              {/* Feedback Alert */}
              {inviteFeedback && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "var(--radius-sm)",
                    marginBottom: "16px",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background:
                      inviteFeedback.type === "success" ? "#f0fdf4" : "#fef2f2",
                    color:
                      inviteFeedback.type === "success" ? "#166534" : "#991b1b",
                    border:
                      inviteFeedback.type === "success"
                        ? "1px solid #bbf7d0"
                        : "1px solid #fecaca",
                  }}
                >
                  <span>{inviteFeedback.text}</span>
                  <button
                    type="button"
                    onClick={() => setInviteFeedback(null)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: "inherit",
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              {invitationsTab === "search" ? (
                <>
                  {/* Hướng dẫn nghiệp vụ */}
                  <div
                    style={{
                      background: "#f0f9ff",
                      border: "1px solid #bae6fd",
                      borderRadius: "var(--radius-sm)",
                      padding: "10px 14px",
                      fontSize: "12px",
                      color: "#0369a1",
                      marginBottom: "16px",
                    }}
                  >
                    💡 <strong>Lưu ý:</strong> Hệ thống chỉ gửi lời mời tới
                    những học viên <strong>đã có tài khoản</strong> trên
                    EduChat. Nếu học viên chưa có tài khoản, học viên cần chủ
                    động tạo tài khoản trước.
                  </div>

                  {/* Thanh tìm kiếm */}
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginBottom: "16px",
                    }}
                  >
                    <div style={{ position: "relative", flex: 1 }}>
                      <Search
                        size={15}
                        color="#94a3b8"
                        style={{
                          position: "absolute",
                          left: "12px",
                          top: "13px",
                        }}
                      />
                      <input
                        type="text"
                        value={inviteSearch}
                        onChange={(e) => {
                          setInviteSearch(e.target.value);
                          loadEligibleStudents(e.target.value);
                        }}
                        placeholder="Nhập họ tên hoặc email học viên trong hệ thống..."
                        className="form-input"
                        style={{
                          width: "100%",
                          paddingLeft: "36px",
                          fontSize: "13px",
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => loadEligibleStudents(inviteSearch)}
                      className="btn"
                      style={{
                        padding: "0 14px",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <RefreshCw size={14} />
                      <span>Làm mới</span>
                    </button>
                  </div>

                  {/* Lời nhắn kèm theo (tùy chọn) */}
                  <div style={{ marginBottom: "16px" }}>
                    <input
                      type="text"
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      placeholder="Lời nhắn kèm theo (Ví dụ: Thầy mời bạn tham gia khóa chuyên đề này...)"
                      className="form-input"
                      style={{ width: "100%", fontSize: "12px" }}
                    />
                  </div>

                  {/* Danh sách học viên khả dụng */}
                  {searchingEligible ? (
                    <div
                      style={{
                        padding: "30px",
                        textAlign: "center",
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      Đang tìm kiếm học viên trong hệ thống...
                    </div>
                  ) : eligibleStudents.length === 0 ? (
                    <div
                      style={{
                        padding: "36px 20px",
                        textAlign: "center",
                        background: "#f8fafc",
                        borderRadius: "var(--radius-md)",
                        border: "1px dashed #cbd5e1",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "#334155",
                          marginBottom: "4px",
                        }}
                      >
                        Không tìm thấy học viên phù hợp
                      </div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          maxWidth: "400px",
                          margin: "0 auto",
                        }}
                      >
                        {inviteSearch
                          ? `Không có học viên nào khớp với "${inviteSearch}". Học viên cần chủ động tạo tài khoản trên EduChat trước khi có thể nhận lời mời.`
                          : "Tất cả học viên trong hệ thống đã tham gia khóa học này hoặc chưa có học viên nào mới."}
                      </p>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "#64748b",
                        }}
                      >
                        Học viên có thể mời ({eligibleStudents.length}):
                      </div>
                      {eligibleStudents.map((st) => {
                        const isPending = st.invitation_status === "pending";
                        const isSending = sendingInviteId === st.id;

                        return (
                          <div
                            key={st.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "12px 14px",
                              background: "#f8fafc",
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid #e2e8f0",
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
                                src={
                                  st.avatar ||
                                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
                                }
                                alt={st.fullname}
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                              <div>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    fontSize: "13px",
                                    color: "#0f172a",
                                  }}
                                >
                                  {st.fullname}
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#64748b",
                                  }}
                                >
                                  {st.email} {st.phone ? `• ${st.phone}` : ""}
                                </div>
                              </div>
                            </div>

                            <div>
                              {isPending ? (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: "11px",
                                      color: "#d97706",
                                      background: "#fffbeb",
                                      padding: "3px 8px",
                                      borderRadius: "6px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Đã gửi lời mời (Chờ duyệt)
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCancelInvite(st.invitation_id)
                                    }
                                    style={{
                                      padding: "4px 8px",
                                      fontSize: "11px",
                                      color: "#ef4444",
                                      background: "none",
                                      border: "1px solid #fca5a5",
                                      borderRadius: "4px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    Thu hồi
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  disabled={isSending}
                                  onClick={() => handleSendInvite(st.id)}
                                  className="btn btn-primary"
                                  style={{
                                    padding: "6px 14px",
                                    fontSize: "12px",
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    cursor: isSending
                                      ? "not-allowed"
                                      : "pointer",
                                  }}
                                >
                                  <Send size={13} />
                                  <span>
                                    {isSending ? "Đang gửi..." : "Gửi lời mời"}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                /* Tab: Danh sách lời mời đang chờ */
                <div>
                  {courseInvitations.filter((i) => i.status === "pending")
                    .length === 0 ? (
                    <div
                      style={{
                        padding: "36px",
                        textAlign: "center",
                        color: "#64748b",
                        fontSize: "13px",
                      }}
                    >
                      Hiện không có lời mời nào đang chờ phản hồi.
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      {courseInvitations
                        .filter((i) => i.status === "pending")
                        .map((inv) => (
                          <div
                            key={inv.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "12px 14px",
                              background: "#f8fafc",
                              borderRadius: "var(--radius-sm)",
                              border: "1px solid #e2e8f0",
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
                                src={
                                  inv.student_avatar ||
                                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120"
                                }
                                alt={inv.student_name}
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "50%",
                                  objectFit: "cover",
                                }}
                              />
                              <div>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    fontSize: "13px",
                                    color: "#0f172a",
                                  }}
                                >
                                  {inv.student_name}
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "#64748b",
                                  }}
                                >
                                  {inv.student_email} • Gửi lúc:{" "}
                                  {new Date(inv.created_at).toLocaleDateString(
                                    "vi-VN",
                                  )}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleCancelInvite(inv.id)}
                              style={{
                                padding: "6px 12px",
                                fontSize: "12px",
                                color: "#ef4444",
                                background: "#fff",
                                border: "1px solid #fca5a5",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              Thu hồi lời mời
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                background: "#f8fafc",
              }}
            >
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="btn"
                style={{ padding: "8px 18px", fontSize: "13px" }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
