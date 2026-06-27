import type { Request, Response } from "express";
import About from "../models/About.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const getAbout = async (_req: Request, res: Response) => {
  try {
    // Return the latest about document if exists
    const about = await About.findOne().sort({ updatedAt: -1 });
    if (!about) {
      return successResponse(res, "About not set", null);
    }
    return successResponse(res, "About fetched", about);
  } catch (err) {
    return errorResponse(res, "Failed to fetch about", 500);
  }
};

export const updateAbout = async (req: Request, res: Response) => {
  try {
  const { title, body } = req.body;
  if (!body) return errorResponse(res, "Missing about body", 400);

    // Keep a single document in About: create if none, else update latest
    const existing = await About.findOne().sort({ updatedAt: -1 });
    if (!existing) {
      const created = await About.create({ title, body });
      return successResponse(res, "About created", created, 201);
    }

    existing.title = title ?? existing.title;
    existing.body = body;
    await existing.save();
    return successResponse(res, "About updated", existing);
  } catch (err) {
    return errorResponse(res, "Failed to update about", 500);
  }
};
