import { Router, Request, Response } from "express";
import { db } from "../db/database.js";

export const statsRouter = Router();

// GET /api/stats
statsRouter.get("/", (_req: Request, res: Response): any => {
  try {
    const userCount = (
      db.prepare("SELECT count(*) as c FROM users").get() as any
    ).c;
    const teacherCount = (
      db
        .prepare("SELECT count(*) as c FROM users WHERE role = 'teacher'")
        .get() as any
    ).c;
    const articleCount = (
      db.prepare("SELECT count(*) as c FROM articles").get() as any
    ).c;
    const courseCount = (
      db.prepare("SELECT count(*) as c FROM courses").get() as any
    ).c;
    const docCount = (
      db.prepare("SELECT count(*) as c FROM documents").get() as any
    ).c;

    return res.json({
      success: true,
      stats: {
        members: 120500 + userCount,
        teachers: 1520 + teacherCount,
        courses: 450 + courseCount,
        articles: articleCount,
        documents: 15800 + docCount,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
