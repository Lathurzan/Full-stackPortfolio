import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    // Use configured MONGO_URI when provided. In development, fall back to a
    // local MongoDB instance so write operations persist without requiring
    // the environment to be fully configured.
    let uri = env.MONGO_URI;
    if (!uri || uri.includes("your_mongodb_atlas_url") || uri.trim() === "") {
      if (env.NODE_ENV === "production") {
        console.error("MONGO_URI not configured in production — aborting DB connect.");
        throw new Error("MONGO_URI not configured");
      }
      uri = "mongodb://127.0.0.1:27017/portfolio";
      console.warn(`MONGO_URI not set; falling back to local MongoDB at ${uri}`);
    }

    // Validate scheme
    if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
      throw new Error("MONGO_URI has invalid scheme. Must start with mongodb:// or mongodb+srv://");
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    if (env.NODE_ENV === "production") {
      process.exit(1);
    }
  }
};

export const isDbConnected = () => {
  // mongoose.connection.readyState === 1 means connected
  return mongoose.connection.readyState === 1;
};
