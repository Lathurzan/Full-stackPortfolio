import type { Request, Response } from "express";
import Skill from "../models/Skill.js";

export const createSkillCategory = async (req: Request, res: Response) => {
  try {
    const { category, items } = req.body || {};
    if (!category) return res.status(400).json({ success: false, message: "category is required" });
    const doc = await Skill.create({ category, items: items ?? [] });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("createSkillCategory error:", err);
    return res.status(500).json({ success: false, message: "Failed to create skill category" });
  }
};

export const getSkillCategories = async (_req: Request, res: Response) => {
  try {
    const items = await Skill.find().sort({ createdAt: 1 }).lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getSkillCategories error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch skill categories" });
  }
};

export const updateSkillCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const doc = await Skill.findByIdAndUpdate(id, req.body, { new: true, runValidators: true }).lean();
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("updateSkillCategory error:", err);
    return res.status(500).json({ success: false, message: "Failed to update skill category" });
  }
};

export const deleteSkillCategory = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const doc = await Skill.findByIdAndDelete(id).lean();
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, message: "Deleted" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("deleteSkillCategory error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete skill category" });
  }
};
