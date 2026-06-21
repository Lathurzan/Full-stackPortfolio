import type { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { successResponse, errorResponse } from "../utils/response.js";

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) return errorResponse(res, "No file uploaded", 400);

    // Ensure uploads dir exists
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    // file is saved by multer to tmp; move to uploads with original name
    const tempPath = (req.file as any).path as string;
    const originalName = (req.file as any).originalname as string;
    const destPath = path.join(uploadsDir, `${Date.now()}-${originalName}`);

    fs.renameSync(tempPath, destPath);

  const rel = `/uploads/${path.basename(destPath)}`;
  const host = req.get("host");
  const protocol = req.protocol;
  const url = `${protocol}://${host}${rel}`;
  return successResponse(res, "File uploaded", { url });
  } catch (err) {
    return errorResponse(res, "Upload failed", 500);
  }
};
