import cors from "cors";
import { env } from "./env.js";

// More permissive CORS for local development and to ensure preflight requests succeed.
const allowedOrigin = env.CLIENT_URL || "http://localhost:3000";

export const corsOptions = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, mobile apps, or server-to-server)
    if (!origin) return callback(null, true);
    // Accept the configured client origin or allow localhost during development
    if (origin === allowedOrigin || origin.startsWith("http://localhost")) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  preflightContinue: false,
  optionsSuccessStatus: 200,
});