import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  FileBadge,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import type { User } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [cccd, setCccd] = useState("");
  const [role, setRole] = useState<"Học viên" | "Giảng viên">("Học viên");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!email || !password) {
      setLoading(false);
      setError("Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    try {
      // Import dynamic api to prevent circular dependency
      const { api } = await import("../services/api");
      const res = await api.login(email, password);

      if (res.success && res.user) {
        if (res.token) localStorage.setItem("token", res.token);
        const loggedUser: User = {
          id: res.user.id,
          fullname: res.user.fullname,
          email: res.user.email,
          phone: res.user.phone || "0989 928 663",
          cccd: res.user.cccd || "001200001234",
          role: res.user.role === "teacher" ? "Giảng viên" : "Học viên",
          avatar:
            res.user.avatar ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
          joinedDate: "27/10/2026",
        };

        localStorage.setItem("user", JSON.stringify(loggedUser));
        onSuccess(loggedUser);
        onClose();
      } else {
        setError(res.error || "Đăng nhập không thành công");
      }
    } catch {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!fullname || !email || !password || !phone || !cccd) {
      setLoading(false);
      setError("Vui lòng điền đầy đủ tất cả các trường bắt buộc.");
      return;
    }
    if (cccd.length < 9) {
      setLoading(false);
      setError(
        "Số Căn cước công dân (CCCD) phải có ít nhất 9 đến 12 chữ số theo quy định.",
      );
      return;
    }

    try {
      const { api } = await import("../services/api");
      const res = await api.register({
        fullname,
        email,
        password,
        phone,
        cccd,
        role: role === "Giảng viên" ? "teacher" : "student",
      });

      if (res.success && res.user) {
        if (res.token) localStorage.setItem("token", res.token);
        const newUser: User = {
          id: res.user.id,
          fullname: res.user.fullname,
          email: res.user.email,
          phone: res.user.phone,
          cccd: res.user.cccd,
          role: role,
          avatar: res.user.avatar,
          joinedDate: "27/10/2026",
        };

        localStorage.setItem("user", JSON.stringify(newUser));
        onSuccess(newUser);
        onClose();
      } else {
        setError(res.error || "Đăng ký không thành công");
      }
    } catch {
      setError("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--border-light)",
            position: "relative",
          }}
        >
          <button
            onClick={() => {
              setIsLoginTab(true);
              setError(null);
            }}
            style={{
              flex: 1,
              padding: "18px",
              background: "none",
              border: "none",
              fontWeight: 700,
              fontSize: "15px",
              cursor: "pointer",
              color: isLoginTab ? "var(--primary)" : "var(--text-muted)",
              borderBottom: isLoginTab
                ? "2.5px solid var(--primary)"
                : "2.5px solid transparent",
              transition: "all 0.2s",
            }}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => {
              setIsLoginTab(false);
              setError(null);
            }}
            style={{
              flex: 1,
              padding: "18px",
              background: "none",
              border: "none",
              fontWeight: 700,
              fontSize: "15px",
              cursor: "pointer",
              color: !isLoginTab ? "var(--primary)" : "var(--text-muted)",
              borderBottom: !isLoginTab
                ? "2.5px solid var(--primary)"
                : "2.5px solid transparent",
              transition: "all 0.2s",
            }}
          >
            Đăng ký tài khoản MXH
          </button>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              right: "12px",
              top: "14px",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              color: "var(--text-subtle)",
              borderRadius: "50%",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {/* Badge pháp lý */}
          <div
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px",
              marginBottom: "18px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "12px",
              color: "#166534",
            }}
          >
            <ShieldCheck size={18} color="#16a34a" />
            <span>
              Mạng xã hội Giáo dục EduChat theo GP số{" "}
              <strong>380/GP-BTTTT</strong> cấp ngày 16/12/2024.
            </span>
          </div>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                color: "#b91c1c",
                padding: "10px 14px",
                borderRadius: "var(--radius-sm)",
                marginBottom: "16px",
                fontSize: "13px",
                border: "1px solid #fecaca",
              }}
            >
              {error}
            </div>
          )}

          {isLoginTab ? (
            /* Form Đăng Nhập */
            <form
              onSubmit={handleLogin}
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  Tên đăng nhập hoặc Email
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="ví dụ: giaovien@educhat.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Mail
                    size={16}
                    color="var(--text-subtle)"
                    style={{ position: "absolute", right: "14px", top: "14px" }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  Mật khẩu
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock
                    size={16}
                    color="var(--text-subtle)"
                    style={{ position: "absolute", right: "14px", top: "14px" }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "13px",
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    cursor: "pointer",
                  }}
                >
                  <input type="checkbox" defaultChecked />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <a
                  href="#forgot"
                  style={{
                    color: "var(--primary)",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Quên mật khẩu?
                </a>
              </div>

              <div
                style={{
                  background: "#f0f9ff",
                  border: "1px dashed #7dd3fc",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 12px",
                  marginTop: "4px",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    color: "#0369a1",
                    marginBottom: "6px",
                  }}
                >
                  💡 Chọn nhanh tài khoản Giáo viên:
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("kien@educhat.vn");
                      setPassword("password123");
                    }}
                    style={{
                      background:
                        email === "kien@educhat.vn" ? "#0284c7" : "#e0f2fe",
                      color: email === "kien@educhat.vn" ? "#fff" : "#0284c7",
                      border: "1px solid #bae6fd",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: 600,
                      transition: "all 0.15s ease",
                    }}
                  >
                    👨‍🏫 Nguyễn Hoàng Kiên
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("nguyenvana@educhat.vn");
                      setPassword("password123");
                    }}
                    style={{
                      background:
                        email === "nguyenvana@educhat.vn" ? "#0284c7" : "#fff",
                      color:
                        email === "nguyenvana@educhat.vn" ? "#fff" : "#334155",
                      border: "1px solid #cbd5e1",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: email === "nguyenvana@educhat.vn" ? 600 : 400,
                      transition: "all 0.15s ease",
                    }}
                  >
                    TS. Nguyễn Văn An
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("tranthimai@educhat.vn");
                      setPassword("password123");
                    }}
                    style={{
                      background:
                        email === "tranthimai@educhat.vn" ? "#0284c7" : "#fff",
                      color:
                        email === "tranthimai@educhat.vn" ? "#fff" : "#334155",
                      border: "1px solid #cbd5e1",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: email === "tranthimai@educhat.vn" ? 600 : 400,
                      transition: "all 0.15s ease",
                    }}
                  >
                    ThS. Trần Thị Mai
                  </button>
                </div>
              </div>

              {/* Khung Chọn nhanh tài khoản Học sinh / Sinh viên */}
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px dashed #86efac",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 12px",
                  marginTop: "6px",
                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    color: "#166534",
                    marginBottom: "6px",
                  }}
                >
                  🎓 Chọn nhanh tài khoản Học sinh / Sinh viên:
                </div>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("student@educhat.vn");
                      setPassword("password123");
                    }}
                    style={{
                      background:
                        email === "student@educhat.vn" ? "#16a34a" : "#dcfce7",
                      color:
                        email === "student@educhat.vn" ? "#fff" : "#15803d",
                      border: "1px solid #bbf7d0",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: 600,
                      transition: "all 0.15s ease",
                    }}
                  >
                    🧑‍🎓 Lê Hoàng Long
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("thao.nguyen@gmail.com");
                      setPassword("password123");
                    }}
                    style={{
                      background:
                        email === "thao.nguyen@gmail.com" ? "#16a34a" : "#fff",
                      color:
                        email === "thao.nguyen@gmail.com" ? "#fff" : "#334155",
                      border: "1px solid #cbd5e1",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: email === "thao.nguyen@gmail.com" ? 600 : 400,
                      transition: "all 0.15s ease",
                    }}
                  >
                    Phương Thảo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("tuananh.edu@outlook.com");
                      setPassword("password123");
                    }}
                    style={{
                      background:
                        email === "tuananh.edu@outlook.com"
                          ? "#16a34a"
                          : "#fff",
                      color:
                        email === "tuananh.edu@outlook.com"
                          ? "#fff"
                          : "#334155",
                      border: "1px solid #cbd5e1",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight:
                        email === "tuananh.edu@outlook.com" ? 600 : 400,
                      transition: "all 0.15s ease",
                    }}
                  >
                    Phạm Tuấn Anh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("mailinh.edtech@gmail.com");
                      setPassword("password123");
                    }}
                    style={{
                      background:
                        email === "mailinh.edtech@gmail.com"
                          ? "#16a34a"
                          : "#fff",
                      color:
                        email === "mailinh.edtech@gmail.com"
                          ? "#fff"
                          : "#334155",
                      border: "1px solid #cbd5e1",
                      borderRadius: "4px",
                      padding: "4px 8px",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight:
                        email === "mailinh.edtech@gmail.com" ? 600 : 400,
                      transition: "all 0.15s ease",
                    }}
                  >
                    Vũ Mai Linh
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: "13px", width: "100%", marginTop: "6px" }}
                disabled={loading}
              >
                {loading ? "Đang xác thực..." : "Đăng nhập vào EduChat"}
              </button>

              <div
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  marginTop: "8px",
                }}
              >
                Chưa có tài khoản?{" "}
                <button
                  type="button"
                  onClick={() => setIsLoginTab(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary)",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Đăng ký ngay miễn phí
                </button>
              </div>
            </form>
          ) : (
            /* Form Đăng Ký (Theo Nghị định Mạng xã hội Việt Nam) */
            <form
              onSubmit={handleRegister}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  Họ và tên <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nguyễn Văn A"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  required
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
                      marginBottom: "6px",
                    }}
                  >
                    Số điện thoại <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="0989xxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: 600,
                      marginBottom: "6px",
                    }}
                  >
                    Số CCCD/Định danh{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="12 chữ số"
                    value={cccd}
                    onChange={(e) => setCccd(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  Vai trò trong giáo dục{" "}
                  <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  className="form-input"
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as "Học viên" | "Giảng viên")
                  }
                >
                  <option value="Học viên">Học viên / Sinh viên</option>
                  <option value="Giảng viên">Giảng viên / Giáo viên</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  Địa chỉ Email <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    marginBottom: "6px",
                  }}
                >
                  Mật khẩu khởi tạo <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Ít nhất 6 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: "13px", width: "100%", marginTop: "6px" }}
                disabled={loading}
              >
                {loading ? "Đang đăng ký..." : "Hoàn tất đăng ký thành viên"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
