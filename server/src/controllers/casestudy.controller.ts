import type { Request, Response } from "express";
import CaseStudy from "../models/CaseStudy.js";

export const createCaseStudy = async (req: Request, res: Response) => {
  try {
    const cs = await CaseStudy.create(req.body);
    res.status(201).json({ success: true, data: cs });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to create case study" });
  }
};

export const getCaseStudies = async (_req: Request, res: Response) => {
  try {
    const items = await CaseStudy.find();
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch case studies" });
  }
};

export const getCaseStudyById = async (req: Request, res: Response) => {
  try {
    const item = await CaseStudy.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Case study not found" });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch case study" });
  }
};

export const updateCaseStudy = async (req: Request, res: Response) => {
  try {
    const item = await CaseStudy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update case study" });
  }
};

export const deleteCaseStudy = async (req: Request, res: Response) => {
  try {
    await CaseStudy.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Case study deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete case study" });
  }
};
