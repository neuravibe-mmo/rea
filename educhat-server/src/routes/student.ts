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

// GET /api/student/invitations - Get pending course invitations for current student
studentRouter.get(
  "/invitations",
  (req: AuthenticatedRequest, res: Response): any => {
    try {
      const studentId = req.user!.id;
      const invitations = db
        .prepare(`
          SELECT ci.*, c.title as course_title, c.thumbnail as course_thumbnail, 
                 c.price as original_course_price, c.duration, c.category, c.level,
                 u.fullname as teacher_name, u.avatar as teacher_avatar
          FROM course_invitations ci
          JOIN courses c ON ci.course_id = c.id
          JOIN users u ON ci.teacher_id = u.id
          WHERE ci.student_id = ? AND ci.status = 'pending'
          ORDER BY ci.created_at DESC
        `)
        .all(studentId);

      return res.json({ success: true, data: invitations });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// POST /api/student/invitations/:id/respond - Respond to invitation (Accept or Decline)
studentRouter.post(
  "/invitations/:id/respond",
  (req: AuthenticatedRequest, res: Response): any => {
    try {
      const studentId = req.user!.id;
      const { id: invitationId } = req.params;
      const { action, paymentDetails } = req.body; // action: 'accept' | 'decline'

      const invitation = db
        .prepare(`
          SELECT ci.*, c.title as course_title, c.price as current_course_price, u.fullname as teacher_name
          FROM course_invitations ci
          JOIN courses c ON ci.course_id = c.id
          JOIN users u ON ci.teacher_id = u.id
          WHERE ci.id = ? AND ci.student_id = ?
        `)
        .get(invitationId, studentId) as any;

      if (!invitation) {
        return res
          .status(404)
          .json({ success: false, error: "Không tìm thấy lời mời hợp lệ" });
      }

      if (action === "decline") {
        db.prepare(
          "UPDATE course_invitations SET status = 'declined', responded_at = CURRENT_TIMESTAMP WHERE id = ?",
        ).run(invitationId);
        return res.json({
          success: true,
          message: "Bạn đã từ chối lời mời tham gia khóa học",
        });
      }

      if (action === "accept") {
        const price =
          invitation.course_price ?? invitation.current_course_price ?? 0;
        const isPaidCourse = price > 0;

        // Nếu khóa có phí, kiểm tra paymentDetails
        if (isPaidCourse && (!paymentDetails || !paymentDetails.confirmed)) {
          return res.status(400).json({
            success: false,
            error:
              "Khóa học này có học phí. Vui lòng hoàn tất thanh toán trước khi tham gia.",
            requiresPayment: true,
            price,
          });
        }

        const enrollId = `enr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

        const enrollTransaction = db.transaction(() => {
          // 1. Cập nhật trạng thái lời mời thành accepted
          db.prepare(
            "UPDATE course_invitations SET status = 'accepted', responded_at = CURRENT_TIMESTAMP WHERE id = ?",
          ).run(invitationId);

          // 2. Thêm vào bảng enrollments
          db.prepare(`
            INSERT INTO enrollments (id, user_id, course_id, progress_percent, status, enrolled_at)
            VALUES (?, ?, ?, 0, 'active', CURRENT_TIMESTAMP)
            ON CONFLICT(id) DO NOTHING
          `).run(enrollId, studentId, invitation.course_id);

          // 3. Tăng sĩ số học viên của khóa học
          db.prepare(
            "UPDATE courses SET students_count = students_count + 1 WHERE id = ?",
          ).run(invitation.course_id);

          // 4. Gửi thông báo xác nhận ngược lại cho Giảng viên
          const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const studentName = req.user!.fullname;
          db.prepare(`
            INSERT INTO notifications (id, user_id, type, title, content, data, is_read)
            VALUES (?, ?, 'invitation_accepted', ?, ?, ?, 0)
          `).run(
            notifId,
            invitation.teacher_id,
            `Học viên đã đồng ý tham gia lớp học`,
            `Học viên ${studentName} đã ${
              isPaidCourse ? "hoàn tất học phí và " : ""
            }đồng ý tham gia khóa học "${invitation.course_title}".`,
            JSON.stringify({
              courseId: invitation.course_id,
              studentId,
              enrollId,
            }),
          );
        });

        enrollTransaction();

        return res.json({
          success: true,
          message: isPaidCourse
            ? "Thanh toán thành công! Bạn đã chính thức được ghi danh vào khóa học."
            : "Bạn đã tham gia khóa học thành công!",
          data: { courseId: invitation.course_id, enrollmentId: enrollId },
        });
      }

      return res
        .status(400)
        .json({ success: false, error: "Hành động không hợp lệ" });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// GET /api/student/notifications - Get student notifications
studentRouter.get(
  "/notifications",
  (req: AuthenticatedRequest, res: Response): any => {
    try {
      const studentId = req.user!.id;
      const notifications = db
        .prepare(`
          SELECT * FROM notifications 
          WHERE user_id = ? 
          ORDER BY created_at DESC LIMIT 30
        `)
        .all(studentId);

      const unreadCount = (
        db
          .prepare(
            "SELECT count(*) as c FROM notifications WHERE user_id = ? AND is_read = 0",
          )
          .get(studentId) as any
      ).c;

      return res.json({ success: true, data: notifications, unreadCount });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);

// POST /api/student/notifications/read-all - Mark all as read
studentRouter.post(
  "/notifications/read-all",
  (req: AuthenticatedRequest, res: Response): any => {
    try {
      const studentId = req.user!.id;
      db.prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(
        studentId,
      );
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },
);
