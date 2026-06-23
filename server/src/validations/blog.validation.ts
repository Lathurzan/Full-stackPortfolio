import type { Request, Response, NextFunction } from "express";

export const validateCreateBlog = (req: Request, res: Response, next: NextFunction) => {
  const { title, slug, content } = req.body;
  if (!title || !slug || !content) {
    return res.status(400).json({ success: false, message: "title, slug and content are required" });
  }
  next();
};

export const validateUpdateBlog = (req: Request, res: Response, next: NextFunction) => {
  // allow partial updates but validate fields when present
  const { slug } = req.body;
  if (slug && typeof slug !== "string") {
    return res.status(400).json({ success: false, message: "slug must be a string" });
  }
  next();
};
