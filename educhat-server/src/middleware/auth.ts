import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/database.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "educhat-super-secure-secret-key-2026";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    fullname: string;
    role: "student" | "teacher" | "admin";
    avatar?: string;
  };
}

// Xác thực JWT token hai chiều
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): any {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Vui lòng cung cấp mã xác thực JWT (Bearer Token)",
    });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: "Phiên đăng nhập đã hết hạn hoặc chữ ký JWT không hợp lệ",
      });
    }

    const user = db
      .prepare(
        "SELECT id, email, fullname, role, avatar, phone, cccd FROM users WHERE id = ?",
      )
      .get(decoded.id) as any;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Người dùng không tồn tại trong hệ thống",
      });
    }

    req.user = user;
    next();
  });
}

// Kiểm tra quyền hạn theo vai trò (Teacher / Student / Admin)
export function requireRole(
  allowedRoles: Array<"student" | "teacher" | "admin">,
) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): any => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Bạn không có quyền thực hiện chức năng này. Yêu cầu quyền: ${allowedRoles.join(", ")}`,
      });
    }
    next();
  };
}
