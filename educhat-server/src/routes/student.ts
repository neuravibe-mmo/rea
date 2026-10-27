import { Router, Response } from "express";
import { db } from "../db/database.js";
import {
  authenticateToken,
  requireRole,
  AuthenticatedRequest,
} from "../middleware/auth.js";

export const studentRouter = Router();

// Apply JWT authentication & role checking
studentRouter.use(authenticateToken);
studentRouter.use(requireRole(["student", "teacher", "admin"]));

// GET /api/student/overview - Get Student Dashboard data
studentRouter.get(
  "/overview",
  (req: AuthenticatedRequest, res: Response): any => {
    try {
      const studentId = req.user!.id;

      // Enrolled courses
      const enrollments = db
        .prepare(`
      SELECT e.id as enrollment_id, e.progress_percent, e.enrolled_at, c.*
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.user_id = ?
      ORDER BY e.enrolled_at DESC
    `)
        .all(studentId);

      // Available quizzes
      const quizzes = db
        .prepare("SELECT * FROM quizzes ORDER BY created_at DESC")
        .all();

      // Student quiz submissions
      const submissions = db
        .prepare(
          "SELECT * FROM quiz_submissions WHERE student_id = ? ORDER BY submitted_at DESC",
        )
        .all(studentId);

      // Study groups
      const groups = db
        .prepare("SELECT * FROM study_groups ORDER BY members_count DESC")
        .all();

      return res.json({
        success: true,
        data: {
          profile: req.user,
          stats: {
            enrolledCount: enrollments.length,
            quizzesDone: submissions.length,
            groupsJoined: groups.length,
          },
          enrollments,
          quizzes,
          submissions,
          groups,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// POST /api/student/enroll - Enroll into a course
studentRouter.post(
  "/enroll",
  (req: AuthenticatedRequest, res: Response): any => {
    try {
      const { course_id } = req.body;
      if (!course_id)
        return res
          .status(400)
          .json({ success: false, error: "Thiếu mã khóa học" });

      const existing = db
        .prepare(
          "SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?",
        )
        .get(req.user!.id, course_id);
      if (existing) {
        return res.json({
          success: true,
          message: "Bạn đã đăng ký khóa học này rồi",
        });
      }

      const id = "enr_" + Date.now();
      db.prepare(`
      INSERT INTO enrollments (id, user_id, course_id, progress_percent, status)
      VALUES (?, ?, ?, 0, 'active')
    `).run(id, req.user!.id, course_id);

      // Increment students count
      db.prepare(
        "UPDATE courses SET students_count = students_count + 1 WHERE id = ?",
      ).run(course_id);

      return res
        .status(201)
        .json({ success: true, message: "Đăng ký khóa học thành công" });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// POST /api/student/quizzes/:id/submit - Submit quiz test
studentRouter.post(
  "/quizzes/:id/submit",
  (req: AuthenticatedRequest, res: Response): any => {
    try {
      const quizId = req.params.id;
      const { score = 8.5 } = req.body;

      const quiz = db.prepare("SELECT * FROM quizzes WHERE id = ?").get(quizId);
      if (!quiz)
        return res
          .status(404)
          .json({ success: false, error: "Không tìm thấy bài kiểm tra" });

      const submissionId = "sub_" + Date.now();
      db.prepare(`
      INSERT INTO quiz_submissions (id, quiz_id, student_id, student_name, score, max_score)
      VALUES (?, ?, ?, ?, ?, 10)
    `).run(submissionId, quizId, req.user!.id, req.user!.fullname, score);

      return res.status(201).json({
        success: true,
        message: "Nộp bài kiểm tra thành công",
        data: { score, max_score: 10, submitted_at: new Date().toISOString() },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);
