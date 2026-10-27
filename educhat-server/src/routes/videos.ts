import { Router, Request, Response } from "express";
import { db } from "../db/database.js";

export const videosRouter = Router();

// GET /api/videos
videosRouter.get("/", (_req: Request, res: Response): any => {
  try {
    const videos = db
      .prepare("SELECT * FROM videos ORDER BY created_at DESC")
      .all();
    return res.json({ success: true, data: videos });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
