import type { Request, Response } from "express";
import fs from "fs";
import path from "path";
import http from "http";
import https from "https";
import Profile from "../models/profile.js";
import cloudinary from "../config/cloudinary.js";
import { successResponse, errorResponse } from "../utils/response.js";

/**
 * Upload Resume
 */
export const uploadResume = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // -------------------------
    // Direct URL
    // -------------------------
    const directUrl = req.body?.url || req.body?.resume || null;

    if (directUrl) {
      let resumeUrl = String(directUrl);

      if (resumeUrl.startsWith("/")) {
        resumeUrl = `${req.protocol}://${req.get("host")}${resumeUrl}`;
      } else if (!/^https?:\/\//i.test(resumeUrl)) {
        resumeUrl = `${req.protocol}://${req.get(
          "host"
        )}/uploads/${resumeUrl}`;
      }

      const profile = await Profile.findOneAndUpdate(
        {},
        { $set: { resume: resumeUrl } },
        {
          new: true,
          upsert: true,
        }
      );

      return successResponse(res, "Resume saved", {
        resume: (profile as any).resume,
      });
    }

    // -------------------------
    // Upload File
    // -------------------------
    const file = (req as any).file;

    if (!file) {
      return errorResponse(res, "No file uploaded", 400);
    }

    // -------------------------
    // Always store resume locally so the proxy can serve it directly.
    // Cloudinary raw-resource delivery URLs require account-level auth tokens
    // to fetch server-side, which makes proxying impossible without that key.
    // Local storage is simpler, reliable, and the proxy serves it correctly.
    // -------------------------
    let resumeUrl: string | null = null;

    const uploadsDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.originalname}`;
    const destination = path.join(uploadsDir, filename);
    fs.renameSync(file.path, destination);
    resumeUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;

    const profile = await Profile.findOneAndUpdate(
      {},
      {
        $set: {
          resume: resumeUrl,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return successResponse(res, "Resume uploaded", {
      resume: (profile as any).resume,
    });
  } catch (error) {
    console.error(error);

    return errorResponse(res, "Failed to upload resume", 500);
  }
};

/**
 * Get Resume
 */
export const getResume = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const profile = await Profile.findOne();

    let resume = (profile as any)?.resume || null;

    if (!resume) {
      return successResponse(res, "No resume found", {
        resume: null,
      });
    }

    if (typeof resume === "string") {
      if (resume.startsWith("/")) {
        resume = `${req.protocol}://${req.get("host")}${resume}`;
      } else if (!/^https?:\/\//i.test(resume)) {
        resume = `${req.protocol}://${req.get(
          "host"
        )}/uploads/${resume}`;
      }
    }

    return successResponse(res, "Resume fetched", {
      resume,
    });
  } catch (error) {
    console.error(error);

    return errorResponse(res, "Failed to fetch resume", 500);
  }
};

/**
 * Delete Resume
 */
export const deleteResume = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const profile = await Profile.findOne();

    if (!profile) {
      return successResponse(res, "No resume found", {
        resume: "",
      });
    }

    const resume = (profile as any).resume as string | null;

    if (resume) {
      // Local File
      if (resume.includes("/uploads/")) {
        const parts = resume.split("/uploads/");
        const filename = parts[1];

        if (filename) {
          const filepath = path.join(
            process.cwd(),
            "uploads",
            filename
          );

          try {
            if (fs.existsSync(filepath)) {
              fs.unlinkSync(filepath);
            }
          } catch {}
        }
      }

      // Cloudinary
      if (resume.includes("res.cloudinary.com")) {
        const match = resume.match(
          /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^./?]+)?$/
        );

        if (match?.[1]) {
          try {
            await cloudinary.uploader.destroy(match[1], {
              resource_type: "raw",
            });
          } catch {}
        }
      }
    }

    (profile as any).resume = "";

    await profile.save();

    return successResponse(res, "Resume deleted", {
      resume: "",
    });
  } catch (error) {
    console.error(error);

    return errorResponse(res, "Failed to delete resume", 500);
  }
};

/**
 * Proxy Resume — stream local or remote resume to the client and set headers
 * that allow embedding. Returns an HTML fallback when the remote responds
 * 401/403 so the browser doesn't log a network error.
 */
export const proxyResume = async (req: Request, res: Response): Promise<void> => {
  try {
    const profile = await Profile.findOne();
    const resume = (profile as any)?.resume as string | null;

    if (!resume) {
      res.status(404).json({ message: "No resume found" });
      return;
    }

    // Build absolute URL for stored resume
    let fileUrl = resume.startsWith("http") ? resume : `${req.protocol}://${req.get("host")}${resume}`;

    // ?dl=1 → attachment (triggers browser download); default → inline (preview)
    const isDownload = req.query.dl === "1";
    const disposition = isDownload
      ? "attachment; filename=Lathurzan-Subatharan-resume.pdf"
      : "inline; filename=Lathurzan-Subatharan-resume.pdf";

    // If file is stored locally under /uploads, serve it directly
    if (fileUrl.includes("/uploads/")) {
      const filename = path.basename(fileUrl);
      const full = path.join(process.cwd(), "uploads", filename);
      if (fs.existsSync(full)) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", disposition);
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.sendFile(full);
        return;
      }
    }

    // For Cloudinary: generate a signed URL using the Cloudinary SDK.
    // A signed URL embeds a request signature that bypasses Cloudinary's
    // strict delivery / access-control settings (which cause 401 on plain URLs).

    // Cloudinary raw resources require an account-level auth-token key for
    // server-side delivery (all signed URL variants return 401 without it).
    // Cloudinary also sets X-Frame-Options: SAMEORIGIN which blocks iframes.
    // For legacy Cloudinary URLs already in the database, return a friendly
    // HTML page with an "Open in new tab" link — no 401/frame-block error.
    // For NEW uploads we always use local storage so this path is rarely hit.
    if (fileUrl.includes("res.cloudinary.com")) {
      const safeUrl = fileUrl.replace(/"/g, "%22");
      const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Resume</title></head><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:2rem;color:#111;background:#fff"><p style="font-size:1rem">Inline preview is unavailable for this resume. <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline">Open in new tab ↗</a></p><p style="font-size:.85rem;color:#555;margin-top:1rem">To enable inline preview, delete the current resume and re-upload it — new uploads are stored locally and preview instantly.</p></body></html>`;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(200).send(html);
      return;
    }

    const getter = fileUrl.startsWith("https") ? https.get : http.get;

    getter(fileUrl, (fileRes: any) => {
      if (!fileRes.statusCode || fileRes.statusCode >= 400) {
        const originalUrl = String(resume.startsWith("http") ? resume : `${req.protocol}://${req.get("host")}${resume}`);
        const safeUrl = originalUrl.replace(/"/g, "%22");
        const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Resume</title></head><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:2rem;color:#111;background:#fff"><p>Unable to preview resume inline. <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color:#2563eb;text-decoration:underline">Open in new tab</a></p></body></html>`;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.status(200).send(html);
        return;
      }

      const remoteCt = (fileRes.headers && fileRes.headers["content-type"]) || "application/pdf";
      res.setHeader("Content-Type", remoteCt);
      res.setHeader("Content-Disposition", disposition);
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      fileRes.pipe(res);
    }).on("error", (e: any) => {
      console.error("Proxy error:", e);
      if (!res.headersSent) res.status(500).json({ message: "Failed to stream resume" });
    });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ message: "Failed to proxy resume" });
  }
};