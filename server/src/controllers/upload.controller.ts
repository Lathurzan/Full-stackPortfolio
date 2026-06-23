import type { Request, Response } from "express";
import path from "path";
import fs from "fs";
import cloudinary from "../config/cloudinary.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) return errorResponse(res, "No file uploaded", 400);

    // If cloudinary configured, upload to Cloudinary and return secure URL
    const file = (req.file as any);
    if (!file) {
      // Clearer error for missing multipart file
      return errorResponse(res, "No file uploaded. Ensure the request is multipart/form-data with a 'file' field.", 400);
    }

    // If cloudinary is configured (has api key), use it
    const cloudConfigured = !!(process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME);
    if (cloudConfigured) {
      // upload from the temp path
      const tempPath = file.path as string;
      try {
        const result = await cloudinary.uploader.upload(tempPath, {
          folder: "portfolio",
          use_filename: true,
          unique_filename: false,
        });

        // remove temp file
        try {
          fs.unlinkSync(tempPath);
        } catch (e) {
          // ignore
        }

        // cloudinary returns secure_url
        const url = result.secure_url as string;
        return successResponse(res, "File uploaded", { url });
      } catch (err) {
        // fall through to local fallback
        // eslint-disable-next-line no-console
        console.warn("Cloudinary upload failed, falling back to local storage", err);
      }
    }

    // Fallback: save to local uploads folder
    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const tempPath = file.path as string;
    const originalName = file.originalname as string;
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
