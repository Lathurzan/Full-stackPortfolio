import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    // If MONGO_URI is not set or left as a placeholder, skip connecting in dev.
    if (!env.MONGO_URI || env.MONGO_URI.includes("your_mongodb_atlas_url") || env.MONGO_URI.trim() === "") {
      console.warn(
        "MONGO_URI not configured or is a placeholder — skipping MongoDB connection (development mode)."
      );
      return;
    }

    // Validate scheme
    if (!env.MONGO_URI.startsWith("mongodb://") && !env.MONGO_URI.startsWith("mongodb+srv://")) {
      const err = new Error("MONGO_URI has invalid scheme. Must start with mongodb:// or mongodb+srv://");
      throw err;
    }

  const conn = await mongoose.connect(env.MONGO_URI);

  console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    // In production we should exit, but during local dev prefer to continue
    // so the server can run without a database for frontend/dev work.
    if (env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

export const isDbConnected = () => {
  // mongoose.connection.readyState === 1 means connected
  return mongoose.connection.readyState === 1;
};
