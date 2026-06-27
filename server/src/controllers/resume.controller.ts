import type { Request, Response } from "express";
import path from "path";
import fs from "fs";
import Profile from "../models/profile.js";
import cloudinary from "../config/cloudinary.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * Upload resume (multipart file) or accept direct URL in body.url and persist to Profile.resume
 */
export const uploadResume = async (req: Request, res: Response): Promise<Response> => {
  try {
    // If a URL is provided directly in body, use it and persist
    const directUrl = req.body?.url || req.body?.resume || null;
    if (directUrl) {
      // normalize a direct URL: if relative, prefix with host/protocol
      let normalized = directUrl as string;
      if (normalized.startsWith("/")) {
        const host = req.get("host");
        const protocol = req.protocol;
        normalized = `${protocol}://${host}${normalized}`;
      } else if (!/^https?:\/\//i.test(normalized)) {
        // treat as filename -> assume uploads folder
        const host = req.get("host");
        const protocol = req.protocol;
        normalized = `${protocol}://${host}/uploads/${normalized}`;
      }

      const updated = await Profile.findOneAndUpdate(
        {},
        { $set: { resume: normalized } },
        { returnDocument: "after", upsert: true }
      );

      return successResponse(res, "Resume saved", { resume: (updated as any)?.resume });
    }

    // Otherwise expect a multipart file in req.file (multer)
    const file = (req as any).file;
    if (!file) return errorResponse(res, "No file uploaded", 400);

    // Try Cloudinary if configured
    const cloudConfigured = !!(process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME);
    let url: string | null = null;

  if (cloudConfigured) {
      const tempPath = file.path as string;
      try {
        const result: any = await cloudinary.uploader.upload(tempPath, {
          folder: "portfolio/resumes",
          use_filename: true,
          unique_filename: false,
          resource_type: "raw",
          type: "upload",
          format: "pdf",
        });

        // remove temp file
    try { fs.unlinkSync(tempPath); } catch (e) { /* ignore */ }

    url = result?.secure_url || result?.url || null;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Cloudinary upload failed, falling back to local storage", e);
      }
    }

  // Fallback: save locally
    if (!url) {
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      const tempPath = file.path as string;
      const originalName = file.originalname as string;
      const destPath = path.join(uploadsDir, `${Date.now()}-${originalName}`);
      fs.renameSync(tempPath, destPath);

      const rel = `/uploads/${path.basename(destPath)}`;
      const host = req.get("host");
      const protocol = req.protocol;
      url = `${protocol}://${host}${rel}`;
    }

    const updated = await Profile.findOneAndUpdate(
      {},
      { $set: { resume: url } },
      { returnDocument: "after", upsert: true }
    );

    return successResponse(res, "Resume uploaded", { resume: (updated as any)?.resume, url });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return errorResponse(res, "Failed to upload resume", 500);
  }
};

export const getResume = async (_req: Request, res: Response): Promise<Response> => {
  try {
    // Use request to compute absolute URL when needed
    const req = _req as Request;
    const profile = await Profile.findOne();
    let resume = (profile as any)?.resume || null;
    if (!resume) return successResponse(res, "No resume set", null);

    if (typeof resume === "string") {
      if (resume.startsWith("/")) {
        const host = req.get("host");
        const protocol = req.protocol;
        resume = `${protocol}://${host}${resume}`;
      } else if (!/^https?:\/\//i.test(resume)) {
        const host = req.get("host");
        const protocol = req.protocol;
        resume = `${protocol}://${host}/uploads/${resume}`;
      }
    }

    return successResponse(res, "Resume fetched", { resume });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return errorResponse(res, "Failed to fetch resume", 500);
  }
};

export const deleteResume = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const req = _req as Request;
    const profile = await Profile.findOne();
    if (!profile) return successResponse(res, "No resume set", null);

    const resume = (profile as any).resume as string | undefined | null;
    if (resume && typeof resume === "string") {
      // local file
      const uploadsIndex = resume.indexOf("/uploads/");
      if (uploadsIndex !== -1) {
        const filename = resume.substring(uploadsIndex + "/uploads/".length);
        const full = path.join(process.cwd(), "uploads", filename);
        try {
          if (fs.existsSync(full)) fs.unlinkSync(full);
        } catch (e) {
          // ignore filesystem errors
        }
      } else if (resume.includes("res.cloudinary.com")) {
        // attempt to delete Cloudinary raw resource (best-effort)
        try {
          // extract public id: match '/upload/(v1234/)?public_id(.ext)?'
          const m = resume.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?(?:\?.*)?$/);
          const publicId = m && m[1] ? m[1] : null;
          if (publicId) {
            await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
          }
        } catch (e) {
          // ignore cloudinary deletion errors (not fatal)
        }
      }
    }

    // clear resume field and save
    (profile as any).resume = "";
    await profile.save();

    return successResponse(res, "Resume deleted", { resume: "" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return errorResponse(res, "Failed to delete resume", 500);
  }
};
