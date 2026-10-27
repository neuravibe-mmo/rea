import express, { Request, Response } from "express";
import cors from "cors";
import { initDatabase } from "./db/database.js";
import { seedData } from "./db/seed.js";
import { authRouter } from "./routes/auth.js";
import { articlesRouter } from "./routes/articles.js";
import { coursesRouter } from "./routes/courses.js";
import { documentsRouter } from "./routes/documents.js";
import { videosRouter } from "./routes/videos.js";
import { statsRouter } from "./routes/stats.js";
import { teacherRouter } from "./routes/teacher.js";
import { studentRouter } from "./routes/student.js";

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize DB and Seed
initDatabase();
seedData();

// Health Check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    app: "EduChat.vn API Backend",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Modern REST API Routes
app.use("/api/auth", authRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/documents", documentsRouter);
app.use("/api/videos", videosRouter);
app.use("/api/stats", statsRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/student", studentRouter);

// Legacy EduChat.vn PHP Query Compatibility Layer (as documented in SPEC.md)
app.all("/", (req: Request, res: Response): any => {
  const { mod, act } = req.query;

  if (mod === "archive" && act === "login") {
    // Forward to login logic
    const { email, password } = req.body;
    return res.redirect(307, "/api/auth/login");
  }

  if (mod === "archive" && act === "signup") {
    return res.redirect(307, "/api/auth/register");
  }

  if (mod === "iframe" && act === "load_more") {
    return res.redirect(307, "/api/articles?limit=6");
  }

  res.json({
    message: "Chào mừng bạn đến với EduChat.vn API Backend",
    endpoints: [
      "/api/health",
      "/api/auth/register",
      "/api/auth/login",
      "/api/auth/me",
      "/api/articles",
      "/api/courses",
      "/api/documents",
      "/api/videos",
      "/api/stats",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`[EduChat API Server] Running on http://127.0.0.1:${PORT}`);
});
