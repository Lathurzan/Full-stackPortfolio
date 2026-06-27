import type { Request, Response } from "express";
import WorkExperience from "../models/WorkExperience.js";

export const createWork = async (req: Request, res: Response) => {
  try {
    const payload = req.body || {};
    if (!payload.company || !payload.role) return res.status(400).json({ success: false, message: "company and role are required" });
    const doc = await WorkExperience.create(payload);
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("createWork error:", err);
    return res.status(500).json({ success: false, message: "Failed to create work experience" });
  }
};

export const getWorks = async (_req: Request, res: Response) => {
  try {
    const items = await WorkExperience.find().sort({ startDate: -1, createdAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getWorks error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch work experiences" });
  }
};

export const getWorkById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const doc = await WorkExperience.findById(id).lean();
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getWorkById error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch work experience" });
  }
};

export const updateWork = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const doc = await WorkExperience.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).lean();
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("updateWork error:", err);
    return res.status(500).json({ success: false, message: "Failed to update work experience" });
  }
};

export const deleteWork = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const doc = await WorkExperience.findByIdAndDelete(id).lean();
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("deleteWork error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete work experience" });
  }
};
