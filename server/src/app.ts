import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { corsOptions } from "./config/cors.js";
import errorMiddleware from "./middleware/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import aboutRoutes from "./routes/about.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import projectRoutes from "./routes/project.routes.js";
import blogRoutes from "./routes/blog.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import casestudyRoutes from "./routes/casestudy.routes.js";
import skillRoutes from "./routes/skill.routes.js";
import workExperienceRoutes from "./routes/workExperience.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import resumeRoutes from "./routes/resume.routes.js";

const app = express();

// ✅ Helmet with X-Frame-Options disabled so PDF proxy can be embedded in iframe
app.use(
  helmet({
    frameguard: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        // ✅ Allow framing from your frontend origin
        frameAncestors: ["'self'", "http://localhost:3000", process.env.CLIENT_URL || "http://localhost:3000"],
      },
    },
  })
);

app.use(corsOptions);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ success: true, message: "Portfolio API is running" });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/casestudies", casestudyRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/work-experiences", workExperienceRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resume", resumeRoutes);

app.use((req, res, next) => {
  if (req.path.startsWith("/uploads") || req.originalUrl.startsWith("/uploads")) {
    const origin = process.env.CLIENT_URL || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Range");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    if (req.method === "OPTIONS") return res.sendStatus(204);
  }
  next();
});

app.use(
  "/uploads",
  express.static("uploads", {
    setHeaders: (res) => {
      const origin = process.env.CLIENT_URL || "*";
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

app.use(errorMiddleware);

export default app;