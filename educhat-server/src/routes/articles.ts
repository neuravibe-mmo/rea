import { Router, Request, Response } from "express";
import { db } from "../db/database.js";

export const articlesRouter = Router();

// GET /api/articles - List articles with filtering, search, and pagination
articlesRouter.get("/", (req: Request, res: Response): any => {
  try {
    const { category, search, limit = "20", offset = "0" } = req.query;

    let query = "SELECT * FROM articles WHERE 1=1";
    const params: any[] = [];

    if (category && category !== "Tất cả") {
      query += " AND category = ?";
      params.push(category);
    }

    if (search) {
      query += " AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(Number(limit), Number(offset));

    const articles = db.prepare(query).all(...params) as any[];

    // Include comment counts
    const articlesWithComments = articles.map((art) => {
      const commentCount = db
        .prepare("SELECT count(*) as count FROM comments WHERE article_id = ?")
        .get(art.id) as { count: number };
      return {
        ...art,
        commentsCount: commentCount.count,
        readTime: "5 phút đọc",
      };
    });

    const totalCountQuery =
      category && category !== "Tất cả"
        ? "SELECT count(*) as count FROM articles WHERE category = ?"
        : "SELECT count(*) as count FROM articles";
    const totalCountParams =
      category && category !== "Tất cả" ? [category] : [];
    const total = (
      db.prepare(totalCountQuery).get(...totalCountParams) as { count: number }
    ).count;

    return res.json({
      success: true,
      data: articlesWithComments,
      total,
      hasMore: Number(offset) + articles.length < total,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/articles/:id - Get detail and comments
articlesRouter.get("/:id", (req: Request, res: Response): any => {
  try {
    const { id } = req.params;

    // Increment views
    db.prepare("UPDATE articles SET views = views + 1 WHERE id = ?").run(id);

    const article = db
      .prepare("SELECT * FROM articles WHERE id = ?")
      .get(id) as any;
    if (!article) {
      return res
        .status(404)
        .json({ success: false, error: "Bài viết không tồn tại" });
    }

    const comments = db
      .prepare(
        "SELECT * FROM comments WHERE article_id = ? ORDER BY created_at DESC",
      )
      .all(id);

    return res.json({
      success: true,
      data: {
        ...article,
        comments,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/articles/:id/like - Like an article
articlesRouter.post("/:id/like", (req: Request, res: Response): any => {
  try {
    const { id } = req.params;
    db.prepare("UPDATE articles SET likes = likes + 1 WHERE id = ?").run(id);
    const updated = db
      .prepare("SELECT likes FROM articles WHERE id = ?")
      .get(id) as any;

    return res.json({
      success: true,
      likes: updated ? updated.likes : 0,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/articles/:id/comments - Add a comment
articlesRouter.post("/:id/comments", (req: Request, res: Response): any => {
  try {
    const { id } = req.params;
    const { author_name, author_avatar, content, user_id } = req.body;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Nội dung bình luận không được để trống",
        });
    }

    const commentId = "cmt_" + Date.now();
    db.prepare(`
      INSERT INTO comments (id, article_id, user_id, author_name, author_avatar, content)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      commentId,
      id,
      user_id || "guest",
      author_name || "Khách viếng thăm",
      author_avatar ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
      content.trim(),
    );

    const newComment = db
      .prepare("SELECT * FROM comments WHERE id = ?")
      .get(commentId);

    return res.status(201).json({
      success: true,
      data: newComment,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
