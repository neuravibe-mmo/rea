import React, { useState } from "react";
import {
  X,
  Clock,
  Eye,
  MessageSquare,
  Share2,
  Bookmark,
  Check,
  ThumbsUp,
  Send,
} from "lucide-react";
import type { Article, User } from "../types";

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  currentUser,
  onOpenAuth,
}) => {
  const [copied, setCopied] = useState(false);
  const [likes, setLikes] = useState(article?.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<
    Array<{
      id: string;
      user: string;
      role: string;
      text: string;
      time: string;
    }>
  >([]);
  const [newComment, setNewComment] = useState("");

  // Fetch article detail and comments from backend on mount or article change
  React.useEffect(() => {
    if (!article) return;
    setLikes(article.likes || 0);

    (async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:5001/api/articles/${article.id}`,
        );
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.likes) setLikes(json.data.likes);
          if (json.data.comments) {
            setComments(
              json.data.comments.map((c: any) => ({
                id: c.id,
                user: c.author_name,
                role:
                  c.user_id && c.user_id.includes("teacher")
                    ? "Giảng viên"
                    : "Thành viên EduChat",
                text: c.content,
                time: c.created_at
                  ? new Date(c.created_at).toLocaleString("vi-VN")
                  : "Vừa xong",
              })),
            );
          }
        }
      } catch (err) {
        console.warn("Backend unavailable, using initial comments");
      }
    })();
  }, [article]);

  if (!article) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: window.location.href,
        });
      } catch (err) {
        console.log(err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLike = async () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
      try {
        const { api } = await import("../services/api");
        await api.likeArticle(article.id);
      } catch (err) {
        console.error(err);
      }
    } else {
      setLikes(likes - 1);
      setHasLiked(false);
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    const commentText = newComment.trim();
    setNewComment("");

    // Optimistic UI
    const tempId = "c_" + Date.now();
    setComments((prev) => [
      {
        id: tempId,
        user: currentUser.fullname,
        role: currentUser.role,
        text: commentText,
        time: "Vừa xong",
      },
      ...prev,
    ]);

    try {
      const { api } = await import("../services/api");
      await api.addComment(article.id, {
        author_name: currentUser.fullname,
        author_avatar: currentUser.avatar,
        content: commentText,
        user_id: currentUser.id,
      });
    } catch (err) {
      console.error("Failed to post comment to backend:", err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: "780px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--border-light)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            background: "#fff",
            zIndex: 10,
          }}
        >
          <span className="badge badge-blue">{article.category}</span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleShare}
              className="btn"
              style={{
                padding: "6px 12px",
                fontSize: "13px",
                background: "var(--bg-alt)",
              }}
            >
              {copied ? (
                <Check size={15} color="#10b981" />
              ) : (
                <Share2 size={15} />
              )}
              <span>{copied ? "Đã sao chép liên kết" : "Chia sẻ"}</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                padding: "6px",
                cursor: "pointer",
              }}
            >
              <X size={20} color="var(--text-muted)" />
            </button>
          </div>
        </div>

        {/* Article Body */}
        <div style={{ padding: "28px 32px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 800,
              lineHeight: 1.35,
              marginBottom: "16px",
              color: "var(--text-main)",
              fontFamily: "var(--font-display)",
            }}
          >
            {article.title}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingBottom: "20px",
              marginBottom: "24px",
              borderBottom: "1px solid var(--border-light)",
              fontSize: "13px",
              color: "var(--text-muted)",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "#e0f2fe",
                  color: "#0369a1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                {article.author.charAt(0)}
              </div>
              <div>
                <strong style={{ color: "var(--text-main)", display: "block" }}>
                  {article.author}
                </strong>
                <span>{article.authorRole}</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Clock size={14} />
                {article.publishedAt}
              </span>
              <span
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Eye size={14} />
                {article.views.toLocaleString()} lượt xem
              </span>
            </div>
          </div>

          <div
            style={{
              fontSize: "16px",
              fontWeight: 600,
              lineHeight: 1.6,
              marginBottom: "24px",
              color: "var(--text-muted)",
              fontStyle: "italic",
              borderLeft: "4px solid var(--primary)",
              paddingLeft: "16px",
            }}
          >
            {article.summary}
          </div>

          <div
            style={{
              marginBottom: "24px",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
            }}
          >
            <img
              src={article.image}
              alt={article.title}
              style={{ width: "100%", height: "340px", objectFit: "cover" }}
            />
          </div>

          <div style={{ fontSize: "16px", lineHeight: 1.8, color: "#1e293b" }}>
            {article.content.map((para, i) => (
              <p key={i} style={{ marginBottom: "18px" }}>
                {para}
              </p>
            ))}
          </div>

          {/* Action bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 0",
              marginTop: "24px",
              borderTop: "1px solid var(--border-light)",
              borderBottom: "1px solid var(--border-light)",
            }}
          >
            <button
              onClick={handleLike}
              className="btn"
              style={{
                background: hasLiked ? "#eff6ff" : "var(--bg-alt)",
                color: hasLiked ? "var(--primary)" : "var(--text-muted)",
                borderColor: hasLiked ? "var(--primary)" : "transparent",
              }}
            >
              <ThumbsUp size={16} fill={hasLiked ? "var(--primary)" : "none"} />
              <span>Hữu ích ({likes})</span>
            </button>

            <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              Nguồn: Ban Biên Tập EduChat.vn (MXH Giấy phép số 380/GP-BTTTT)
            </span>
          </div>

          {/* Comment Section */}
          <div style={{ marginTop: "32px" }}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <MessageSquare size={18} color="var(--primary)" />
              <span>Thảo luận cộng đồng ({comments.length})</span>
            </h3>

            {/* Post comment input */}
            <form
              onSubmit={handleSendComment}
              style={{ display: "flex", gap: "10px", marginBottom: "24px" }}
            >
              <input
                type="text"
                className="form-input"
                placeholder={
                  currentUser
                    ? "Chia sẻ quan điểm của bạn về bài viết..."
                    : "Đăng nhập để tham gia bình luận..."
                }
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: "0 20px" }}
              >
                <Send size={16} />
              </button>
            </form>

            {/* Comments list */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {comments.length === 0 ? (
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-subtle)",
                    fontStyle: "italic",
                    textAlign: "center",
                    padding: "20px",
                    background: "var(--bg-alt)",
                    borderRadius: "var(--radius-md)",
                  }}
                >
                  Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ góc nhìn
                  của bạn!
                </p>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      background: "var(--bg-alt)",
                      padding: "14px 18px",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <strong
                          style={{
                            fontSize: "14px",
                            color: "var(--text-main)",
                          }}
                        >
                          {c.user}
                        </strong>
                        <span
                          className="badge badge-blue"
                          style={{ fontSize: "10px", padding: "1px 6px" }}
                        >
                          {c.role}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--text-subtle)",
                        }}
                      >
                        {c.time}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "var(--text-muted)",
                        lineHeight: 1.5,
                      }}
                    >
                      {c.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
