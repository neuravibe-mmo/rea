import { Router, Response } from "express";
import { db } from "../db/database.js";
import {
  authenticateToken,
  requireRole,
  AuthenticatedRequest,
} from "../middleware/auth.js";

export const teacherRouter = Router();

// Apply JWT authentication & role checking
teacherRouter.use(authenticateToken);
teacherRouter.use(requireRole(["teacher", "admin"]));

// GET /api/teacher/overview - Get Teacher Console Dashboard data
teacherRouter.get(
  "/overview",
  (req: AuthenticatedRequest, res: Response): any => {
    try {
      const teacherId = req.user!.id;
      const teacherName = req.user!.fullname;

      // Courses by this teacher
      const courses = db
        .prepare(
          "SELECT * FROM courses WHERE instructor = ? ORDER BY created_at DESC",
        )
        .all(teacherName);
      const totalStudents = courses.reduce(
        (acc: number, c: any) => acc + (c.students_count || 0),
        0,
      );

      // Quizzes created
      const quizzes = db
        .prepare(
          "SELECT * FROM quizzes WHERE teacher_id = ? OR teacher_name = ? ORDER BY created_at DESC",
        )
        .all(teacherId, teacherName);

      // Documents uploaded
      const documents = db
        .prepare(
          "SELECT * FROM documents WHERE author_name = ? ORDER BY created_at DESC",
        )
        .all(teacherName);

      // Study groups managed
      const groups = db
        .prepare(
          "SELECT * FROM study_groups WHERE teacher_id = ? OR teacher_name = ? ORDER BY created_at DESC",
        )
        .all(teacherId, teacherName);

      return res.json({
        success: true,
        data: {
          profile: req.user,
          stats: {
            coursesCount: courses.length,
            totalStudents,
            quizzesCount: quizzes.length,
            documentsCount: documents.length,
            groupsCount: groups.length,
          },
          courses,
          quizzes,
          documents,
          groups,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// POST /api/teacher/courses - Create a new course
teacherRouter.post(
  "/courses",
  (req: AuthenticatedRequest, res: Response): any => {
    try {
      const { title, category, price, duration, level } = req.body;
      if (!title)
        return res
          .status(400)
          .json({ success: false, error: "Tiêu đề khóa học là bắt buộc" });

      const id = "crs_" + Date.now();
      const slug =
        title.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();

      db.prepare(`
      INSERT INTO courses (id, title, slug, instructor, instructor_avatar, thumbnail, price, original_price, duration, category, level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        id,
        title,
        slug,
        req.user!.fullname,
        req.user!.avatar ||
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800",
        price || 299000,
        (price || 299000) * 1.5,
        duration || "20 giờ học",
        category || "Kỹ năng sư phạm",
        level || "Mọi trình độ",
      );

      const newCourse = db
        .prepare("SELECT * FROM courses WHERE id = ?")
        .get(id);
      return res
        .status(201)
        .json({
          success: true,
          message: "Tạo khóa học thành công",
          data: newCourse,
        });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// POST /api/teacher/quizzes - Create a new quiz/test
teacherRouter.post(
  "/quizzes",
  (req: AuthenticatedRequest, res: Response): any => {
    try {
      const { title, subject, duration_minutes, total_questions, course_id } =
        req.body;
      if (!title)
        return res
          .status(400)
          .json({ success: false, error: "Tiêu đề bài kiểm tra là bắt buộc" });

      const id = "qz_" + Date.now();
      db.prepare(`
      INSERT INTO quizzes (id, title, course_id, teacher_id, teacher_name, duration_minutes, total_questions, subject)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        id,
        title,
        course_id || null,
        req.user!.id,
        req.user!.fullname,
        duration_minutes || 45,
        total_questions || 20,
        subject || "Toán học",
      );

      const newQuiz = db.prepare("SELECT * FROM quizzes WHERE id = ?").get(id);
      return res
        .status(201)
        .json({
          success: true,
          message: "Tạo bài kiểm tra thành công",
          data: newQuiz,
        });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// POST /api/teacher/documents - Upload pedagogical material
teacherRouter.post(
  "/documents",
  (req: AuthenticatedRequest, res: Response): any => {
    try {
      const { title, category, file_type, file_size } = req.body;
      if (!title)
        return res
          .status(400)
          .json({ success: false, error: "Tiêu đề tài liệu là bắt buộc" });

      const id = "doc_" + Date.now();
      db.prepare(`
      INSERT INTO documents (id, title, file_type, file_size, category, author_name, download_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
        id,
        title,
        file_type || "PDF",
        file_size || "2.5 MB",
        category || "Giáo án điện tử",
        req.user!.fullname,
        "/downloads/tai-lieu-su-pham.pdf",
      );

      const newDoc = db.prepare("SELECT * FROM documents WHERE id = ?").get(id);
      return res
        .status(201)
        .json({
          success: true,
          message: "Đăng tải tài liệu thành công",
          data: newDoc,
        });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// POST /api/teacher/groups - Create a study group
teacherRouter.post(
  "/groups",
  (req: AuthenticatedRequest, res: Response): any => {
    try {
      const { name, description, subject } = req.body;
      if (!name)
        return res
          .status(400)
          .json({ success: false, error: "Tên nhóm học tập là bắt buộc" });

      const id = "grp_" + Date.now();
      db.prepare(`
      INSERT INTO study_groups (id, name, description, teacher_id, teacher_name, members_count, subject)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
        id,
        name,
        description || "Nhóm học tập chuyên đề EduChat",
        req.user!.id,
        req.user!.fullname,
        1,
        subject || "Chung",
      );

      const newGroup = db
        .prepare("SELECT * FROM study_groups WHERE id = ?")
        .get(id);
      return res
        .status(201)
        .json({
          success: true,
          message: "Tạo nhóm học tập thành công",
          data: newGroup,
        });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);
