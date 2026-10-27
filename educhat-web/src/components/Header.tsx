import React, { useState, useEffect } from "react";
import {
  Search,
  User as UserIcon,
  LogOut,
  ChevronDown,
  BookOpen,
  GraduationCap,
  FileText,
  Info,
  Home,
  Shield,
  Sparkles,
} from "lucide-react";
import type { User } from "../types";

interface HeaderProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAuth,
  onLogout,
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
      ];
      const dayName = days[now.getDay()];
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hour = String(now.getHours()).padStart(2, "0");
      const minute = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(
        `${dayName}, ${day}/${month}/${year} ${hour}:${minute} (GMT+7)`,
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className="glass-header"
      style={{ position: "sticky", top: 0, zIndex: 50 }}
    >
      {/* Top Utility Bar */}
      <div
        style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          fontSize: "12px",
          color: "rgba(255, 255, 255, 0.75)",
          padding: "6px 0",
        }}
      >
        <div
          className="container-wide"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                background: "#10b981",
                borderRadius: "50%",
                boxShadow: "0 0 8px #10b981",
              }}
            />
            <span>
              Mạng xã hội Giáo dục EduChat.vn — Giấy phép MXH số 380/GP-BTTTT
            </span>
          </div>
          <div style={{ display: "none", md: "flex" } as any}>
            <span style={{ opacity: 0.9 }}>{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div
        className="container-wide"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "12px",
          paddingBottom: "12px",
          gap: "20px",
        }}
      >
        {/* Logo & Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            cursor: "pointer",
          }}
          onClick={() => onSelectTab("home")}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "var(--accent-gradient)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: "20px",
              boxShadow: "0 4px 15px rgba(37, 99, 235, 0.4)",
            }}
          >
            E
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "22px",
                  color: "#fff",
                  letterSpacing: "-0.5px",
                }}
              >
                EduChat<span style={{ color: "#38bdf8" }}>.vn</span>
              </span>
              <span
                className="badge badge-blue"
                style={{ fontSize: "10px", padding: "2px 6px" }}
              >
                MXH GD
              </span>
            </div>
            <p
              style={{
                fontSize: "11px",
                color: "rgba(255, 255, 255, 0.6)",
                letterSpacing: "0.4px",
                margin: 0,
              }}
            >
              Cộng đồng học tập & chia sẻ tri thức
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div
          style={{
            flex: "1",
            maxWidth: "420px",
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Tìm kiếm bài viết, giáo viên, khóa học..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: "100%",
              padding: "9px 16px 9px 38px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "var(--radius-full)",
              color: "#fff",
              fontSize: "13px",
              outline: "none",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.14)";
              e.currentTarget.style.borderColor = "#38bdf8";
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
            }}
          />
          <Search
            size={16}
            color="rgba(255, 255, 255, 0.5)"
            style={{ position: "absolute", left: "14px" }}
          />
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {[
            { id: "home", label: "Trang chủ", icon: Home },
            { id: "articles", label: "Bài viết", icon: BookOpen },
            { id: "courses", label: "Khóa học", icon: GraduationCap },
            { id: "documents", label: "Tài liệu", icon: FileText },
            ...(user &&
            (user.role === "teacher" ||
              user.role === "Giảng viên" ||
              user.role === "admin")
              ? [
                  {
                    id: "teacher_console",
                    label: "LMS Giảng viên",
                    icon: Sparkles,
                    highlight: true,
                  },
                ]
              : []),
            ...(user && (user.role === "student" || user.role === "Học viên")
              ? [
                  {
                    id: "student_dashboard",
                    label: "Góc học tập",
                    icon: GraduationCap,
                    highlight: true,
                  },
                ]
              : []),
            { id: "about", label: "Giới thiệu", icon: Info },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            const isHighlight = (item as any).highlight;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                style={{
                  background: active
                    ? isHighlight
                      ? "rgba(245, 158, 11, 0.25)"
                      : "rgba(56, 189, 248, 0.18)"
                    : isHighlight
                      ? "rgba(245, 158, 11, 0.12)"
                      : "transparent",
                  color: active
                    ? isHighlight
                      ? "#fbbf24"
                      : "#38bdf8"
                    : isHighlight
                      ? "#fcd34d"
                      : "rgba(255, 255, 255, 0.85)",
                  border: active
                    ? isHighlight
                      ? "1px solid #f59e0b"
                      : "1px solid rgba(56, 189, 248, 0.35)"
                    : isHighlight
                      ? "1px solid rgba(245, 158, 11, 0.3)"
                      : "1px solid transparent",
                  padding: "7px 13px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "13px",
                  fontWeight: isHighlight ? 700 : 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s",
                }}
              >
                <Icon size={15} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Auth Widget */}
        <div style={{ position: "relative" }}>
          {user ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "4px 10px 4px 4px",
                borderRadius: "var(--radius-full)",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                cursor: "pointer",
              }}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <img
                src={user.avatar}
                alt={user.fullname}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <div style={{ textAlign: "left", lineHeight: 1.2 }}>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#fff",
                    display: "block",
                  }}
                >
                  {user.fullname}
                </span>
                <span style={{ fontSize: "10px", color: "#38bdf8" }}>
                  {user.role}
                </span>
              </div>
              <ChevronDown size={14} color="#fff" />
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn btn-primary"
              style={{ padding: "8px 16px", fontSize: "13px" }}
            >
              <UserIcon size={15} />
              <span>Đăng nhập / Đăng ký</span>
            </button>
          )}

          {/* User Dropdown */}
          {user && dropdownOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "48px",
                width: "210px",
                background: "#ffffff",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                border: "1px solid var(--border-light)",
                overflow: "hidden",
                zIndex: 60,
                animation: "scaleIn 0.2s ease-out",
              }}
            >
              <div
                style={{
                  padding: "12px",
                  borderBottom: "1px solid var(--border-light)",
                  background: "#f8fafc",
                }}
              >
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text-main)",
                  }}
                >
                  {user.fullname}
                </div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                  {user.email}
                </div>
                <span
                  className="badge badge-emerald"
                  style={{ marginTop: "6px", fontSize: "10px" }}
                >
                  {user.role}
                </span>
              </div>
              {(user.role === "teacher" ||
                user.role === "Giảng viên" ||
                user.role === "admin") && (
                <button
                  onClick={() => {
                    onSelectTab("teacher_console");
                    setDropdownOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(245, 158, 11, 0.08)",
                    border: "none",
                    borderBottom: "1px solid var(--border-light)",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "#b45309",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Sparkles size={14} color="#f59e0b" />
                  <span>Bàn làm việc Giảng viên</span>
                </button>
              )}
              {(user.role === "student" || user.role === "Học viên") && (
                <button
                  onClick={() => {
                    onSelectTab("student_dashboard");
                    setDropdownOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "none",
                    borderBottom: "1px solid var(--border-light)",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    color: "#047857",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <GraduationCap size={14} color="#10b981" />
                  <span>Góc học tập Học sinh</span>
                </button>
              )}
              <button
                onClick={() => {
                  onSelectTab("profile");
                  setDropdownOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  fontSize: "13px",
                  cursor: "pointer",
                  color: "var(--text-main)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <UserIcon size={14} />
                <span>Hồ sơ cá nhân</span>
              </button>
              <button
                onClick={() => {
                  onLogout();
                  setDropdownOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  background: "none",
                  border: "none",
                  borderTop: "1px solid var(--border-light)",
                  textAlign: "left",
                  fontSize: "13px",
                  cursor: "pointer",
                  color: "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <LogOut size={14} />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
