import { Router, Request, Response } from "express";
import { db } from "../db/database.js";

export const coursesRouter = Router();

// GET /api/courses
coursesRouter.get("/", (req: Request, res: Response): any => {
  try {
    const { category, search } = req.query;
    let query = "SELECT * FROM courses WHERE 1=1";
    const params: any[] = [];

    if (category && category !== "Tất cả") {
      query += " AND category = ?";
      params.push(category);
    }

    if (search) {
      query += " AND (title LIKE ? OR instructor LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term);
    }

    query += " ORDER BY students_count DESC";
    const courses = db.prepare(query).all(...params);

    return res.json({ success: true, data: courses });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/courses/:id - Course detail with syllabus lessons and reviews
coursesRouter.get("/:id", (req: Request, res: Response): any => {
  try {
    const { id } = req.params;
    const course = db
      .prepare("SELECT * FROM courses WHERE id = ?")
      .get(id) as any;
    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy khóa học" });
    }

    const lessons = db
      .prepare(
        "SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC",
      )
      .all(id);

    const reviews = db
      .prepare(
        "SELECT * FROM course_reviews WHERE course_id = ? ORDER BY created_at DESC",
      )
      .all(id);

    const enrollCountResult = db
      .prepare("SELECT COUNT(*) as count FROM enrollments WHERE course_id = ?")
      .get(id) as { count: number };
    const actualStudentsCount =
      enrollCountResult.count > 0
        ? enrollCountResult.count
        : course.students_count;

    let computedRating = course.rating;
    if (reviews.length > 0) {
      const sum = (reviews as any[]).reduce(
        (acc, r) => acc + (r.rating || 5),
        0,
      );
      computedRating = Number((sum / reviews.length).toFixed(1));
    }

    return res.json({
      success: true,
      data: {
        ...course,
        rating: computedRating,
        students_count: actualStudentsCount,
        lessons,
        reviews,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/courses/:id/reviews - Get reviews for a course
coursesRouter.get("/:id/reviews", (req: Request, res: Response): any => {
  try {
    const { id } = req.params;
    const reviews = db
      .prepare(
        "SELECT * FROM course_reviews WHERE course_id = ? ORDER BY created_at DESC",
      )
      .all(id);

    let avgRating = 5.0;
    if (reviews.length > 0) {
      const sum = (reviews as any[]).reduce(
        (acc, r) => acc + (r.rating || 5),
        0,
      );
      avgRating = Number((sum / reviews.length).toFixed(1));
    }

    return res.json({
      success: true,
      data: {
        reviews,
        total: reviews.length,
        averageRating: avgRating,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/courses/:id/reviews - Submit a review for a course
coursesRouter.post("/:id/reviews", (req: Request, res: Response): any => {
  try {
    const { id } = req.params;
    const { author_name, author_avatar, rating, content, user_id } = req.body;

    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Nội dung nhận xét là bắt buộc" });
    }

    const reviewId = "rev_" + Date.now();
    const cleanRating =
      Number(rating) >= 1 && Number(rating) <= 5 ? Number(rating) : 5;

    db.prepare(`
      INSERT INTO course_reviews (id, course_id, user_id, author_name, author_avatar, rating, content, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
    `).run(
      reviewId,
      id,
      user_id || null,
      author_name || "Học viên EduChat",
      author_avatar ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120",
      cleanRating,
      content.trim(),
    );

    // Update average rating on course
    const reviews = db
      .prepare("SELECT rating FROM course_reviews WHERE course_id = ?")
      .all(id) as { rating: number }[];
    const avg = reviews.reduce((a, b) => a + b.rating, 0) / reviews.length;
    db.prepare("UPDATE courses SET rating = ? WHERE id = ?").run(
      Number(avg.toFixed(1)),
      id,
    );

    const newReview = db
      .prepare("SELECT * FROM course_reviews WHERE id = ?")
      .get(reviewId);

    return res.status(201).json({
      success: true,
      message: "Gửi nhận xét thành công",
      data: newReview,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
