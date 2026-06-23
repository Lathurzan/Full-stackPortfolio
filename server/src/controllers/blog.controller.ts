import type { Request, Response } from "express";
import Blog from "../models/Blog.js";
import { successResponse, errorResponse } from "../utils/response.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";

export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, slug, excerpt, content, image: bodyImage, tags, status } = req.body;

    // Normalize tags: accept comma-separated string or array
    let normalizedTags: string[] = [];
    if (Array.isArray(tags)) {
      normalizedTags = tags.map((t: any) => String(t).trim()).filter(Boolean);
    } else if (typeof tags === "string" && tags.trim() !== "") {
      normalizedTags = tags.split(",").map((s) => s.trim()).filter(Boolean);
    }

    if (!title || !slug || !content) {
      return errorResponse(res, "Missing required fields", 400);
    }

    // ensure slug uniqueness
    const existing = await Blog.findOne({ slug });
    if (existing) return errorResponse(res, "Slug already exists", 409);

    // If a file was uploaded, try to upload to Cloudinary first
    let imageUrl = bodyImage || "";
    const file = (req as any).file;
    const cloudConfigured = !!(process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME);
    if (file) {
      const tempPath = file.path as string;
      if (cloudConfigured) {
        try {
          const result = await cloudinary.uploader.upload(tempPath, {
            folder: "portfolio/blogs",
            use_filename: true,
            unique_filename: false,
          });
          imageUrl = result.secure_url as string;
          try { fs.unlinkSync(tempPath); } catch (e) {}
        } catch (err) {
          // fallback to local store
          // eslint-disable-next-line no-console
          console.warn("Cloudinary upload failed for blog, using local fallback", err);
        }
      }

      if (!imageUrl) {
        // move to uploads
        const uploadsDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const destPath = path.join(uploadsDir, `${Date.now()}-${file.originalname}`);
        fs.renameSync(tempPath, destPath);
        const host = req.get("host");
        const protocol = req.protocol;
        imageUrl = `${protocol}://${host}/uploads/${path.basename(destPath)}`;
      }
    }

  const blog = await Blog.create({ title, slug, excerpt, content, image: imageUrl, tags: normalizedTags, status });

    return successResponse(res, "Blog created", blog, 201);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("createBlog error:", err);
    return errorResponse(res, "Failed to create blog", 500);
  }
};

export const getBlogs = async (_req: Request, res: Response) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return successResponse(res, "Blogs fetched", blogs);
  } catch (err) {
    return errorResponse(res, "Failed to fetch blogs", 500);
  }
};

export const getBlogById = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return errorResponse(res, "Blog not found", 404);
    return successResponse(res, "Blog fetched", blog);
  } catch (err) {
    return errorResponse(res, "Failed to fetch blog", 500);
  }
};

export const updateBlog = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const data: any = { ...req.body };
    // Normalize tags for updates as well
    if (data.tags) {
      if (Array.isArray(data.tags)) {
        data.tags = data.tags.map((t: any) => String(t).trim()).filter(Boolean);
      } else if (typeof data.tags === "string") {
        data.tags = data.tags.split(",").map((s: string) => s.trim()).filter(Boolean);
      }
    }
    const file = (req as any).file;
    const cloudConfigured = !!(process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME);
    if (file) {
      const tempPath = file.path as string;
      let imageUrl = "";
      if (cloudConfigured) {
        try {
          const result = await cloudinary.uploader.upload(tempPath, {
            folder: "portfolio/blogs",
            use_filename: true,
            unique_filename: false,
          });
          imageUrl = result.secure_url as string;
          try { fs.unlinkSync(tempPath); } catch (e) {}
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn("Cloudinary upload failed for blog update, using local fallback", err);
        }
      }

      if (!imageUrl) {
        const uploadsDir = path.join(process.cwd(), "uploads");
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const destPath = path.join(uploadsDir, `${Date.now()}-${file.originalname}`);
        fs.renameSync(tempPath, destPath);
        const host = req.get("host");
        const protocol = req.protocol;
        imageUrl = `${protocol}://${host}/uploads/${path.basename(destPath)}`;
      }
      data.image = imageUrl;
    }

    const updated = await Blog.findByIdAndUpdate(id, data, { new: true });
    return successResponse(res, "Blog updated", updated);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("updateBlog error:", err);
    return errorResponse(res, "Failed to update blog", 500);
  }
};

export const deleteBlog = async (req: Request, res: Response) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    return successResponse(res, "Blog deleted", null);
  } catch (err) {
    return errorResponse(res, "Failed to delete blog", 500);
  }
};
