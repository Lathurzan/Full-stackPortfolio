import type { Request, Response } from "express";
import CaseStudy from "../models/CaseStudy.js";

export const createCaseStudy = async (req: Request, res: Response) => {
  try {
    // normalize payload: accept overview -> description and technologies -> stack
    const body = { ...(req.body || {}) } as any;
    body.description = body.description || body.overview || body.summary || "";

    // normalize technologies -> stack
    if (body.technologies && !body.stack) {
      if (Array.isArray(body.technologies)) body.stack = body.technologies;
      else if (typeof body.technologies === "string")
        body.stack = body.technologies
          .toString()
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
    }

    // ensure stack is an array
    if (body.stack && typeof body.stack === "string") {
      body.stack = body.stack
        .toString()
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
    }

    // basic validation
    const title = body.title;
    const description = body.description;
    if (!title || !description) {
      return res.status(400).json({ success: false, message: "title and description are required" });
    }

    const cs = await CaseStudy.create(body);
    return res.status(201).json({ success: true, data: cs });
  } catch (err) {
    // log server-side error for debugging
    // eslint-disable-next-line no-console
    console.error("createCaseStudy error:", err);
    return res.status(500).json({ success: false, message: "Failed to create case study" });
  }
};

export const getCaseStudies = async (_req: Request, res: Response) => {
  try {
    const items = await CaseStudy.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: items });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getCaseStudies error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch case studies" });
  }
};

export const getCaseStudyById = async (req: Request, res: Response) => {
  try {
    const item = await CaseStudy.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ success: false, message: "Case study not found" });
    return res.json({ success: true, data: item });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getCaseStudyById error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch case study" });
  }
};

export const updateCaseStudy = async (req: Request, res: Response) => {
  try {
    const item = await CaseStudy.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).lean();
    if (!item) return res.status(404).json({ success: false, message: "Case study not found" });
    return res.json({ success: true, data: item });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("updateCaseStudy error:", err);
    return res.status(500).json({ success: false, message: "Failed to update case study" });
  }
};

export const deleteCaseStudy = async (req: Request, res: Response) => {
  try {
    const item = await CaseStudy.findByIdAndDelete(req.params.id).lean();
    if (!item) return res.status(404).json({ success: false, message: "Case study not found" });
    return res.json({ success: true, message: "Case study deleted" });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("deleteCaseStudy error:", err);
    return res.status(500).json({ success: false, message: "Failed to delete case study" });
  }
};