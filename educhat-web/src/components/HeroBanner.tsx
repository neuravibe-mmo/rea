import React from "react";
import {
  Sparkles,
  Users,
  Award,
  BookCheck,
  ArrowRight,
  Play,
  ShieldAlert,
} from "lucide-react";

interface HeroBannerProps {
  onExplore: () => void;
  onJoinClick: () => void;
  stats?: {
    members: number;
    teachers: number;
    courses: number;
    documents: number;
    totalDownloads?: number;
  };
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExplore,
  onJoinClick,
  stats,
}) => {
  const formatStat = (num?: number) => {
    if (num === undefined || num === null) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
    if (num >= 10000) return `${(num / 1000).toFixed(0)}K+`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K+`;
    return num.toLocaleString("vi-VN");
  };

  const members = formatStat(stats?.members);
  const teachers = formatStat(stats?.teachers);
  const courses = formatStat(stats?.courses);
  const documents = formatStat(stats?.documents);
  return (
    <section
      style={{
        background: "var(--hero-gradient)",
        color: "#fff",
        padding: "56px 0 64px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow effect background */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, rgba(10, 25, 47, 0) 70%)",
          top: "-150px",
          right: "-100px",
          pointerEvents: "none",
          borderRadius: "50%",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 10 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "40px",
            alignItems: "center",
          }}
        >
          {/* Left Text */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "var(--radius-full)",
                background: "rgba(56, 189, 248, 0.15)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                color: "#38bdf8",
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "20px",
              }}
            >
              <Sparkles size={14} />
              <span>NỀN TẢNG MẠNG XÃ HỘI GIÁO DỤC CHÍNH THỨC</span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "44px",
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: "18px",
                letterSpacing: "-1px",
              }}
            >
              Kết nối tri thức, nâng tầm{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #38bdf8, #818cf8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                thế hệ giáo dục Việt
              </span>
            </h1>

            <p
              style={{
                fontSize: "16px",
                color: "rgba(255, 255, 255, 0.8)",
                lineHeight: 1.6,
                marginBottom: "32px",
                maxWidth: "560px",
              }}
            >
              EduChat.vn là không gian học thuật mở dành cho học viên, phụ huynh
              và giáo viên toàn quốc. Thảo luận chính sách sư phạm, khám phá kho
              học liệu số và các khóa học kỹ năng kỷ nguyên AI.
            </p>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <button
                onClick={onJoinClick}
                className="btn btn-primary"
                style={{ padding: "12px 24px", fontSize: "15px" }}
              >
                <span>Tham gia cộng đồng</span>
                <ArrowRight size={16} />
              </button>
              <button
                onClick={onExplore}
                className="btn btn-secondary"
                style={{ padding: "12px 22px", fontSize: "15px" }}
              >
                <span>Khám phá bài viết & khóa học</span>
              </button>
            </div>
          </div>

          {/* Right Card Feature */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "var(--radius-lg)",
              padding: "28px",
              backdropFilter: "blur(10px)",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Award size={20} color="#38bdf8" />
              <span>EduChat.vn Trực Quan Hóa Tri Thức</span>
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#38bdf8",
                  }}
                >
                  {members}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  Thành viên học tập
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#34d399",
                  }}
                >
                  {teachers}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  Giảng viên xác thực
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#fbbf24",
                  }}
                >
                  {courses}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  Khóa học chuyên sâu
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.04)",
                  padding: "16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: 800,
                    color: "#f472b6",
                  }}
                >
                  {documents}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "rgba(255, 255, 255, 0.7)",
                  }}
                >
                  Tài liệu học tập
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "20px",
                padding: "12px",
                borderRadius: "var(--radius-sm)",
                background: "rgba(56, 189, 248, 0.1)",
                border: "1px solid rgba(56, 189, 248, 0.2)",
                fontSize: "12px",
                color: "rgba(255, 255, 255, 0.85)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <BookCheck size={16} color="#38bdf8" />
              <span>
                Dữ liệu bài giảng và chương trình học được đối soát với quy
                chuẩn Bộ GD&ĐT.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
