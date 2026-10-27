import React from "react";
import { ShieldCheck, Phone, MapPin, Mail, ArrowUp } from "lucide-react";

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      style={{
        background: "#0a192f",
        color: "#fff",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "48px 0 28px",
        position: "relative",
      }}
    >
      <div className="container-wide">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 0.8fr 0.8fr",
            gap: "40px",
            paddingBottom: "36px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Column 1: Giấy phép & Pháp lý */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "var(--accent-gradient)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                E
              </div>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                }}
              >
                EduChat.vn
              </span>
            </div>

            <p
              style={{
                fontSize: "13px",
                color: "rgba(255, 255, 255, 0.75)",
                lineHeight: 1.6,
                marginBottom: "16px",
              }}
            >
              <strong>
                CÔNG TY CỔ PHẦN TƯ VẤN DỊCH VỤ TRUYỀN THÔNG ATHENA
              </strong>
              <br />
              Giấy phép thiết lập Mạng xã hội số <strong>
                380/GP-BTTTT
              </strong>{" "}
              do Bộ Thông tin và Truyền thông cấp ngày 16/12/2024.
            </p>

            <div
              style={{
                fontSize: "13px",
                color: "rgba(255, 255, 255, 0.7)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <ShieldCheck size={16} color="#34d399" />
                <span>
                  Chịu trách nhiệm nội dung: <strong>Lê Thị Minh Hằng</strong>
                </span>
              </div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Phone size={16} color="#38bdf8" />
                <span>
                  Đường dây nóng: <strong>0989 928 663</strong>
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <MapPin
                  size={16}
                  color="#f472b6"
                  style={{ flexShrink: 0, marginTop: "2px" }}
                />
                <span>
                  Số 4/148 Hoàng Ngân, phường Trung Hòa, quận Cầu Giấy, TP Hà
                  Nội
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Danh mục chính */}
          <div>
            <h4
              style={{
                fontSize: "15px",
                fontWeight: 700,
                marginBottom: "16px",
                color: "#38bdf8",
              }}
            >
              Điều Hướng Nhanh
            </h4>
            <ul
              style={{
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                fontSize: "13px",
                color: "rgba(255, 255, 255, 0.75)",
              }}
            >
              <li>
                <a
                  href="#home"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  Trang chủ Mạng xã hội
                </a>
              </li>
              <li>
                <a
                  href="#articles"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  Tin tức & Bài viết Sư phạm
                </a>
              </li>
              <li>
                <a
                  href="#courses"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  Khóa học Kỹ năng số
                </a>
              </li>
              <li>
                <a
                  href="#documents"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  Thư viện Đề thi & Tài liệu mở
                </a>
              </li>
              <li>
                <a
                  href="#policy"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  Thỏa thuận sử dụng dịch vụ MXH
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Mạng lưới eCorp & Đối tác */}
          <div>
            <h4
              style={{
                fontSize: "15px",
                fontWeight: 700,
                marginBottom: "16px",
                color: "#38bdf8",
              }}
            >
              Đối Tác Giáo Dục
            </h4>
            <p
              style={{
                fontSize: "13px",
                color: "rgba(255, 255, 255, 0.7)",
                lineHeight: 1.6,
                marginBottom: "14px",
              }}
            >
              Hệ thống kết nối trực tuyến cùng các trường đại học, viện nghiên
              cứu và chuyên gia EdTech hàng đầu Việt Nam.
            </p>
            <div
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                fontSize: "12px",
              }}
            >
              <span>Liên hệ cộng tác & đăng tải khóa học:</span>
              <a
                href="mailto:contact@educhat.vn"
                style={{
                  display: "block",
                  color: "#38bdf8",
                  marginTop: "4px",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                contact@educhat.vn
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "20px",
            fontSize: "12px",
            color: "rgba(255, 255, 255, 0.5)",
          }}
        >
          <div>
            © 2026 EduChat.vn. Bản quyền thuộc CÔNG TY CỔ PHẦN TƯ VẤN DỊCH VỤ
            TRUYỀN THÔNG ATHENA.
          </div>
          <button
            onClick={scrollToTop}
            className="btn btn-secondary"
            style={{ padding: "6px 12px", fontSize: "12px" }}
          >
            <ArrowUp size={14} />
            <span>Lên đầu trang</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
