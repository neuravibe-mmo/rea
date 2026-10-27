import { Router, Request, Response } from "express";
import { db } from "../db/database.js";
import jwt from "jsonwebtoken";
import { z } from "zod";

export const authRouter = Router();
const JWT_SECRET =
  process.env.JWT_SECRET || "educhat-super-secure-secret-key-2026";

const registerSchema = z.object({
  fullname: z.string().min(2, "Họ và tên tối thiểu 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  phone: z.string().optional(),
  cccd: z.string().optional(),
  role: z.enum(["student", "teacher"]).default("student"),
});

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

// POST /api/auth/register
authRouter.post("/register", (req: Request, res: Response): any => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error.errors[0].message,
      });
    }

    const { fullname, email, password, phone, cccd, role } = parseResult.data;

    // Check existing email
    const existing = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Email này đã được đăng ký tài khoản trên hệ thống",
      });
    }

    const id = "usr_" + Date.now();
    const avatar =
      role === "teacher"
        ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
        : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200";

    db.prepare(`
      INSERT INTO users (id, email, password, fullname, phone, cccd, role, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      email,
      password,
      fullname,
      phone || "",
      cccd || "",
      role,
      avatar,
    );

    const token = jwt.sign({ id, email, role, fullname }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản EduChat thành công",
      token,
      user: { id, email, fullname, role, avatar, phone, cccd },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/auth/login
authRouter.post("/login", (req: Request, res: Response): any => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: parseResult.error.errors[0].message,
      });
    }

    const { email, password } = parseResult.data;
    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email) as any;

    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        error: "Email hoặc mật khẩu không chính xác",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullname: user.fullname,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        cccd: user.cccd,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/auth/me
authRouter.get("/me", (req: Request, res: Response): any => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, error: "Chưa cung cấp token" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db
      .prepare(
        "SELECT id, email, fullname, role, avatar, phone, cccd, bio, created_at FROM users WHERE id = ?",
      )
      .get(decoded.id) as any;

    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "Không tìm thấy người dùng" });
    }

    return res.json({ success: true, user });
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, error: "Token hết hạn hoặc không hợp lệ" });
  }
});
