import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  ArrowLeft,
  CheckCheck,
  GraduationCap,
  Sparkles,
  Award,
  CreditCard,
  CheckCircle2,
  QrCode,
  ArrowRight,
  Clock,
  BookOpen,
  RefreshCw,
  X,
  Filter,
  ShieldCheck,
  Calendar,
  Camera,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  Eye,
} from "lucide-react";
import { api } from "../services/api";
import type { NotificationItem, User } from "../types";

interface NotificationPageProps {
  user: User | null;
  onNavigateHome: () => void;
  onNavigateTab: (tab: string) => void;
  onNotificationsChanged?: () => void;
}

export const NotificationPage: React.FC<NotificationPageProps> = ({
  user,
  onNavigateHome,
  onNavigateTab,
  onNotificationsChanged,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "unread" | "invitations"
  >("all");

  // Payment dialog state
  const [paymentInvite, setPaymentInvite] = useState<any | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState<string | null>(null);
  const [receiptFileSize, setReceiptFileSize] = useState<string | null>(null);
  const [showFullImageModal, setShowFullImageModal] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Dung lượng ảnh vượt quá 10MB. Vui lòng chọn ảnh nhẹ hơn.");
      return;
    }

    setReceiptFileName(file.name);
    setReceiptFileSize(
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`,
    );

    const reader = new FileReader();
    reader.onload = (event) => {
      setReceiptImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleClosePaymentModal = () => {
    setPaymentInvite(null);
    setPaymentConfirmed(false);
    setReceiptImage(null);
    setReceiptFileName(null);
    setReceiptFileSize(null);
  };

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [notifRes, invRes] = await Promise.all([
        api.getStudentNotifications(),
        api.getStudentInvitations().catch(() => ({ success: false, data: [] })),
      ]);

      if (notifRes.success) {
        setNotifications(notifRes.data || []);
        setUnreadCount(notifRes.unreadCount || 0);
      }
      if (invRes.success) {
        setInvitations(invRes.data || []);
      }
    } catch (err) {
      console.error("Lỗi tải thông báo:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [loadData]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
      onNotificationsChanged?.();
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: 1 } : n)),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      onNotificationsChanged?.();
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
    }
  };

  const handleAcceptFreeInvitation = async (
    invitationId: string,
    notifId?: string,
  ) => {
    try {
      const res = await api.respondCourseInvitation(invitationId, "accept");
      if (res.success) {
        setFeedback({
          type: "success",
          text: "Chúc mừng! Bạn đã tham gia khóa học thành công.",
        });
        if (notifId) await handleMarkSingleRead(notifId);
        loadData();
        onNotificationsChanged?.();
      } else {
        setFeedback({
          type: "error",
          text: res.error || "Không thể tham gia khóa học.",
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Lỗi kết nối máy chủ.",
      });
    }
  };

  const handleDeclineInvitation = async (
    invitationId: string,
    notifId?: string,
  ) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối lời mời này không?")) return;
    try {
      const res = await api.respondCourseInvitation(invitationId, "decline");
      if (res.success) {
        setFeedback({ type: "success", text: "Đã từ chối lời mời khóa học." });
        if (notifId) await handleMarkSingleRead(notifId);
        loadData();
        onNotificationsChanged?.();
      } else {
        setFeedback({ type: "error", text: res.error || "Lỗi khi từ chối." });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Lỗi kết nối máy chủ.",
      });
    }
  };

  const handleConfirmPaidEnrollment = async () => {
    if (!paymentInvite) return;
    setProcessingPayment(true);
    try {
      const res = await api.respondCourseInvitation(
        paymentInvite.id,
        "accept",
        { confirmed: true, method: "VietQR", receiptImage },
      );
      if (res.success) {
        setFeedback({
          type: "success",
          text: `Thanh toán thành công! Khóa học "${paymentInvite.course_title}" đã sẵn sàng trong Góc học tập của bạn.`,
        });
        if (paymentInvite.notifId) {
          await handleMarkSingleRead(paymentInvite.notifId);
        }
        handleClosePaymentModal();
        loadData();
        onNotificationsChanged?.();
      } else {
        alert(res.error || "Giao dịch không thành công.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi kết nối.");
    } finally {
      setProcessingPayment(false);
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === "unread") return item.is_read === 0;
    if (activeFilter === "invitations")
      return item.type === "course_invitation";
    return true;
  });

  const invitationCount = notifications.filter(
    (n) => n.type === "course_invitation",
  ).length;

  return (
    <div
      style={{
        background: "#f8fafc",
        minHeight: "100vh",
        paddingBottom: "80px",
      }}
    >
      {/* Breadcrumb Bar */}
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
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              onClick={onNavigateHome}
              style={{
                background: "none",
                border: "none",
                color: "#0284c7",
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
              <span>Trang chủ EduChat</span>
            </button>
            <span>/</span>
            <span style={{ color: "#0f172a", fontWeight: 700 }}>
              Trung tâm Thông báo
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              style={{
                background: "#f1f5f9",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 600,
                color: "#475569",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <RefreshCw
                size={14}
                style={{
                  animation: loading ? "spin 1s linear infinite" : "none",
                }}
              />
              <span>Làm mới</span>
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: "#e0f2fe",
                  color: "#0284c7",
                  border: "1px solid #bae6fd",
                  borderRadius: "6px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <CheckCheck size={14} />
                <span>Đánh dấu tất cả đã đọc</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Page Header */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0ea5e9 100%)",
          color: "#ffffff",
          padding: "36px 0 42px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="container"
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                borderRadius: "20px",
                padding: "4px 12px",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "12px",
              }}
            >
              <ShieldCheck size={14} />
              <span>Hệ thống Thông báo & Tương tác EduChat.vn</span>
            </div>

            <h1
              style={{
                fontSize: "28px",
                fontWeight: 800,
                margin: "0 0 8px",
                letterSpacing: "-0.02em",
              }}
            >
              Trung tâm Thông báo
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.9)",
                margin: 0,
                maxWidth: "600px",
                lineHeight: 1.5,
              }}
            >
              Quản lý lời mời tham gia khóa học từ giảng viên, xác nhận học phí,
              và cập nhật học liệu sư phạm theo thời gian thực.
            </p>
          </div>

          {/* Quick Stats Cards */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                padding: "14px 20px",
                minWidth: "120px",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "24px", fontWeight: 800 }}>
                {notifications.length}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.85 }}>
                Tổng thông báo
              </div>
            </div>

            <div
              style={{
                background:
                  unreadCount > 0
                    ? "rgba(239, 68, 68, 0.25)"
                    : "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(8px)",
                border:
                  unreadCount > 0
                    ? "1px solid rgba(239, 68, 68, 0.5)"
                    : "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                padding: "14px 20px",
                minWidth: "120px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 800,
                  color: unreadCount > 0 ? "#fecaca" : "#ffffff",
                }}
              >
                {unreadCount}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.85 }}>Chưa đọc</div>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "12px",
                padding: "14px 20px",
                minWidth: "140px",
                textAlign: "center",
              }}
            >
              <div
                style={{ fontSize: "24px", fontWeight: 800, color: "#fef08a" }}
              >
                {invitationCount}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.85 }}>
                Lời mời khóa học
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container" style={{ marginTop: "24px" }}>
        {/* Global Feedback Banner */}
        {feedback && (
          <div
            style={{
              padding: "14px 18px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              marginBottom: "20px",
              background: feedback.type === "success" ? "#f0fdf4" : "#fef2f2",
              color: feedback.type === "success" ? "#166534" : "#991b1b",
              border:
                feedback.type === "success"
                  ? "1px solid #bbf7d0"
                  : "1px solid #fecaca",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {feedback.type === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <X size={18} />
              )}
              <span>{feedback.text}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "inherit",
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Filter Navigation Bar */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "12px",
            padding: "14px 20px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px",
            marginBottom: "20px",
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#64748b",
                fontSize: "13px",
                fontWeight: 600,
                marginRight: "8px",
              }}
            >
              <Filter size={15} />
              <span>Lọc thông báo:</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              style={{
                padding: "8px 18px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: activeFilter === "all" ? "#0284c7" : "#f1f5f9",
                color: activeFilter === "all" ? "#ffffff" : "#475569",
                boxShadow:
                  activeFilter === "all"
                    ? "0 2px 6px rgba(2, 132, 199, 0.3)"
                    : "none",
                transition: "all 0.15s ease",
              }}
            >
              Tất cả ({notifications.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("unread")}
              style={{
                padding: "8px 18px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background: activeFilter === "unread" ? "#0284c7" : "#f1f5f9",
                color: activeFilter === "unread" ? "#ffffff" : "#475569",
                boxShadow:
                  activeFilter === "unread"
                    ? "0 2px 6px rgba(2, 132, 199, 0.3)"
                    : "none",
                transition: "all 0.15s ease",
              }}
            >
              Chưa đọc ({unreadCount})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("invitations")}
              style={{
                padding: "8px 18px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 700,
                border: "none",
                cursor: "pointer",
                background:
                  activeFilter === "invitations" ? "#0284c7" : "#f1f5f9",
                color: activeFilter === "invitations" ? "#ffffff" : "#475569",
                boxShadow:
                  activeFilter === "invitations"
                    ? "0 2px 6px rgba(2, 132, 199, 0.3)"
                    : "none",
                transition: "all 0.15s ease",
              }}
            >
              🎓 Lời mời khóa học ({invitationCount})
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (user?.role === "teacher" || user?.role === "Giảng viên") {
                onNavigateTab("teacher_console");
              } else {
                onNavigateTab("student_dashboard");
              }
            }}
            style={{
              background: "none",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              padding: "7px 16px",
              fontSize: "13px",
              fontWeight: 600,
              color: "#0369a1",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>
              {user?.role === "teacher" || user?.role === "Giảng viên"
                ? "Đến Bàn làm việc Giảng viên"
                : "Đến Góc học tập của tôi"}
            </span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Notifications List Area */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {loading ? (
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "60px 20px",
                textAlign: "center",
                color: "#64748b",
                border: "1px solid #e2e8f0",
              }}
            >
              <RefreshCw
                size={24}
                style={{
                  margin: "0 auto 12px",
                  display: "block",
                  animation: "spin 1s linear infinite",
                  color: "#0284c7",
                }}
              />
              <div style={{ fontSize: "14px", fontWeight: 600 }}>
                Đang nạp dữ liệu thông báo từ hệ thống...
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "80px 20px",
                textAlign: "center",
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div
                style={{
                  width: "68px",
                  height: "68px",
                  borderRadius: "50%",
                  background: "#f1f5f9",
                  margin: "0 auto 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                }}
              >
                <Bell size={32} />
              </div>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: 800,
                  color: "#1e293b",
                  margin: "0 0 6px",
                }}
              >
                Không có thông báo nào trong danh mục này
              </h3>
              <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
                {activeFilter === "unread"
                  ? "Bạn đã đọc hết tất cả các thông báo mới."
                  : activeFilter === "invitations"
                    ? "Hiện tại bạn không có lời mời tham gia khóa học nào đang chờ."
                    : "Mọi thông báo về khóa học, bài kiểm tra và nhóm học sẽ được cập nhật tại đây."}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              let parsedData: any = null;
              if (notif.data) {
                try {
                  parsedData = JSON.parse(notif.data);
                } catch {
                  parsedData = null;
                }
              }

              const isInvitation = notif.type === "course_invitation";
              const invitationId = parsedData?.invitationId;
              const matchingInvite = invitations.find(
                (inv) =>
                  inv.id === invitationId ||
                  inv.course_id === parsedData?.courseId,
              );
              const effectiveInvite =
                matchingInvite ||
                (invitationId
                  ? {
                      id: invitationId,
                      course_id: parsedData?.courseId,
                      course_title: parsedData?.courseTitle,
                      course_price: parsedData?.price || 0,
                      teacher_name: parsedData?.teacherName || "Giảng viên",
                    }
                  : null);

              const price =
                parsedData?.price ?? effectiveInvite?.course_price ?? 0;
              const isFree = price === 0;

              return (
                <div
                  key={notif.id}
                  onClick={() =>
                    notif.is_read === 0 && handleMarkSingleRead(notif.id)
                  }
                  style={{
                    background: notif.is_read === 0 ? "#f8fafc" : "#ffffff",
                    border:
                      notif.is_read === 0
                        ? "1.5px solid #7dd3fc"
                        : "1px solid #e2e8f0",
                    borderLeft:
                      notif.is_read === 0
                        ? "5px solid #0284c7"
                        : "5px solid #cbd5e1",
                    borderRadius: "10px",
                    padding: "20px 24px",
                    boxShadow:
                      notif.is_read === 0
                        ? "0 4px 12px rgba(2, 132, 199, 0.08)"
                        : "0 1px 3px rgba(0, 0, 0, 0.04)",
                    transition: "all 0.15s ease",
                    cursor: notif.is_read === 0 ? "pointer" : "default",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      alignItems: "flex-start",
                    }}
                  >
                    {/* Icon Badge */}
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "10px",
                        background: isInvitation
                          ? "rgba(16, 185, 129, 0.14)"
                          : notif.type === "invitation_accepted"
                            ? "rgba(245, 158, 11, 0.14)"
                            : "rgba(2, 132, 199, 0.14)",
                        color: isInvitation
                          ? "#059669"
                          : notif.type === "invitation_accepted"
                            ? "#d97706"
                            : "#0284c7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {isInvitation ? (
                        <GraduationCap size={22} />
                      ) : notif.type === "invitation_accepted" ? (
                        <Award size={22} />
                      ) : (
                        <Sparkles size={22} />
                      )}
                    </div>

                    {/* Content Box */}
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "6px",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "15px",
                              fontWeight: notif.is_read === 0 ? 800 : 700,
                              color:
                                notif.is_read === 0 ? "#0369a1" : "#0f172a",
                              margin: 0,
                              lineHeight: 1.35,
                            }}
                          >
                            {notif.title}
                          </h4>
                          {notif.is_read === 0 && (
                            <span
                              style={{
                                background: "#0284c7",
                                color: "#ffffff",
                                fontSize: "10px",
                                fontWeight: 800,
                                padding: "2px 8px",
                                borderRadius: "10px",
                              }}
                            >
                              MỚI
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            fontSize: "12px",
                            color: "#94a3b8",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          <Clock size={13} />
                          <span>{notif.created_at}</span>
                        </div>
                      </div>

                      <p
                        style={{
                          fontSize: "14px",
                          color: "#475569",
                          margin: "0 0 12px",
                          lineHeight: 1.6,
                        }}
                      >
                        {notif.content}
                      </p>

                      {/* Course Invitation Interactive Card */}
                      {isInvitation && (
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #cbd5e1",
                            borderRadius: "10px",
                            padding: "16px 20px",
                            marginTop: "10px",
                            marginBottom: "10px",
                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.02)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              flexWrap: "wrap",
                              gap: "12px",
                              marginBottom: "14px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <div
                                style={{
                                  width: "32px",
                                  height: "32px",
                                  borderRadius: "6px",
                                  background: "#f1f5f9",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#0284c7",
                                }}
                              >
                                <BookOpen size={16} />
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    color: "#0f172a",
                                  }}
                                >
                                  {parsedData?.courseTitle ||
                                    effectiveInvite?.course_title}
                                </div>
                                <div
                                  style={{ fontSize: "12px", color: "#64748b" }}
                                >
                                  Giảng viên mời:{" "}
                                  <strong>
                                    {parsedData?.teacherName ||
                                      effectiveInvite?.teacher_name}
                                  </strong>
                                </div>
                              </div>
                            </div>

                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 800,
                                padding: "4px 12px",
                                borderRadius: "20px",
                                background: isFree ? "#ecfdf5" : "#fff7ed",
                                color: isFree ? "#059669" : "#ea580c",
                                border: isFree
                                  ? "1px solid #a7f3d0"
                                  : "1px solid #fed7aa",
                              }}
                            >
                              {isFree
                                ? "Khóa Miễn phí"
                                : `Học phí: ${price.toLocaleString("vi-VN")} đ`}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          {effectiveInvite ? (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeclineInvitation(
                                    effectiveInvite.id,
                                    notif.id,
                                  );
                                }}
                                style={{
                                  padding: "8px 16px",
                                  borderRadius: "6px",
                                  border: "1px solid #cbd5e1",
                                  background: "#ffffff",
                                  color: "#64748b",
                                  fontSize: "13px",
                                  cursor: "pointer",
                                  fontWeight: 600,
                                  transition: "all 0.15s ease",
                                }}
                              >
                                Từ chối lời mời
                              </button>

                              {isFree ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAcceptFreeInvitation(
                                      effectiveInvite.id,
                                      notif.id,
                                    );
                                  }}
                                  style={{
                                    padding: "8px 22px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: "#059669",
                                    color: "#ffffff",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    boxShadow:
                                      "0 2px 8px rgba(5, 150, 105, 0.3)",
                                  }}
                                >
                                  <CheckCircle2 size={16} />
                                  <span>Đồng ý tham gia khóa học</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setPaymentInvite({
                                      ...effectiveInvite,
                                      notifId: notif.id,
                                    });
                                    setPaymentConfirmed(false);
                                  }}
                                  style={{
                                    padding: "8px 22px",
                                    borderRadius: "6px",
                                    border: "none",
                                    background: "#d97706",
                                    color: "#ffffff",
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    boxShadow:
                                      "0 2px 8px rgba(217, 119, 6, 0.3)",
                                  }}
                                >
                                  <CreditCard size={16} />
                                  <span>
                                    Thanh toán & Tham gia ngay (
                                    {price.toLocaleString("vi-VN")} đ)
                                  </span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "13px",
                                color: "#059669",
                                fontWeight: 700,
                              }}
                            >
                              <CheckCircle2 size={16} />
                              <span>Bạn đã tham gia khóa học này</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* VietQR Payment Modal Child Dialog */}
      {paymentInvite && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
            padding: "16px",
          }}
          onClick={() => setPaymentInvite(null)}
        >
          <div
            style={{
              background: "#ffffff",
              width: "100%",
              maxWidth: "520px",
              borderRadius: "14px",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #e2e8f0",
              animation: "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
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
                    Chuyển khoản VietQR để kích hoạt quyền vào lớp
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClosePaymentModal}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "4px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px 24px" }}>
              <div
                style={{
                  background: "#fffbeb",
                  border: "1px solid #fef3c7",
                  borderRadius: "8px",
                  padding: "14px 18px",
                  marginBottom: "18px",
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
                  Khóa học: {paymentInvite.course_title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#b45309",
                    marginBottom: "8px",
                  }}
                >
                  Giảng viên: {paymentInvite.teacher_name}
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
                    Học phí cần thanh toán:
                  </span>
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: 800,
                      color: "#b45309",
                    }}
                  >
                    {(paymentInvite.course_price || 0).toLocaleString("vi-VN")}{" "}
                    đ
                  </span>
                </div>
              </div>

              {/* VietQR Bank Info & Mã QR */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
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
                  <span>Quét mã VietQR hoặc Chuyển khoản 24/7</span>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {/* Mã QR code ngân hàng */}
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
                        paymentInvite.course_price || 0
                      }&addInfo=EDUCHAT%20HP%20${paymentInvite.id
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
                      {paymentInvite.id.substring(4, 12).toUpperCase()}
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

              {/* Confirmation Checkbox */}
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
                  Tôi xác nhận đã hoàn tất chuyển khoản số tiền{" "}
                  <strong>
                    {(paymentInvite.course_price || 0).toLocaleString("vi-VN")}{" "}
                    đ
                  </strong>{" "}
                  qua tài khoản ngân hàng trên
                  {receiptImage ? " (kèm ảnh minh chứng đính kèm)" : ""}.
                </span>
              </label>
            </div>

            {/* Footer */}
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
                  borderRadius: "6px",
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
                style={{
                  padding: "9px 20px",
                  background: paymentConfirmed ? "#059669" : "#cbd5e1",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: paymentConfirmed ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: paymentConfirmed
                    ? "0 2px 6px rgba(5, 150, 105, 0.3)"
                    : "none",
                }}
              >
                <CheckCircle2 size={16} />
                <span>
                  {processingPayment
                    ? "Đang ghi danh..."
                    : "Xác nhận đã chuyển khoản"}
                </span>
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
