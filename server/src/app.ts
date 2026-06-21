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

const app = express();

app.use(helmet());
app.use(corsOptions);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Portfolio API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server healthy",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/upload", uploadRoutes);

// serve uploaded files
app.use("/uploads", express.static("uploads"));

app.use(errorMiddleware);

export default app;