import React from "react";
import { X, Play, Eye, Share2, ThumbsUp } from "lucide-react";
import type { VideoShort } from "../types";

interface VideoModalProps {
  video: VideoShort | null;
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({ video, onClose }) => {
  if (!video) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{
          maxWidth: "640px",
          background: "#000",
          color: "#fff",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.08)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#38bdf8" }}>
            EduChat Video Shorts
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#fff",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Video Player Frame */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "380px",
            background: "#0a0a0a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <video
            src={video.videoUrl}
            controls
            autoPlay
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        {/* Details Footer */}
        <div style={{ padding: "20px" }}>
          <h3
            style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}
          >
            {video.title}
          </h3>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "13px",
              color: "rgba(255, 255, 255, 0.65)",
            }}
          >
            <div>
              <strong style={{ color: "#fff" }}>{video.author}</strong> •{" "}
              {video.views}
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                className="btn btn-secondary"
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                <ThumbsUp size={14} /> Thích
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: "6px 12px", fontSize: "12px" }}
              >
                <Share2 size={14} /> Chia sẻ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
