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

// GET /api/courses/:id - Course detail with syllabus lessons
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

    return res.json({
      success: true,
      data: {
        ...course,
        lessons,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
