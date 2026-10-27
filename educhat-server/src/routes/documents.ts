import { Router, Request, Response } from "express";
import { db } from "../db/database.js";

export const documentsRouter = Router();

// GET /api/documents
documentsRouter.get("/", (req: Request, res: Response): any => {
  try {
    const { category, search } = req.query;
    let query = "SELECT * FROM documents WHERE 1=1";
    const params: any[] = [];

    if (category && category !== "Tất cả") {
      query += " AND category = ?";
      params.push(category);
    }

    if (search) {
      query += " AND (title LIKE ? OR author_name LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term);
    }

    query += " ORDER BY downloads_count DESC";
    const docs = db.prepare(query).all(...params);

    return res.json({ success: true, data: docs });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/documents/:id/download
documentsRouter.post("/:id/download", (req: Request, res: Response): any => {
  try {
    const { id } = req.params;
    db.prepare(
      "UPDATE documents SET downloads_count = downloads_count + 1 WHERE id = ?",
    ).run(id);
    const updated = db
      .prepare("SELECT downloads_count FROM documents WHERE id = ?")
      .get(id) as any;

    return res.json({
      success: true,
      downloads_count: updated ? updated.downloads_count : 0,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
