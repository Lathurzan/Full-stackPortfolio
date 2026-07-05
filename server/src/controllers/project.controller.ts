import type { Request, Response } from "express";
import Project from "../models/Project.js";

export const createProject = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    if (!body.title || !body.description) {
      return res.status(400).json({ success: false, message: "title and description are required" });
    }

    // Normalize fields
    const normalizeArrayField = (v: any) => {
      if (!v) return [];
      if (Array.isArray(v)) return v.filter(Boolean);
      if (typeof v === 'string') return v.split(',').map((s) => s.trim()).filter(Boolean);
      return [];
    };

    const payload: any = {
      title: String(body.title),
      slug: body.slug || "",
      description: String(body.description),
      image: body.image || "",
      techStack: normalizeArrayField(body.techStack),
  // Support both `category` as string/array and `categories` array from the client.
  category: normalizeArrayField(body.categories ?? body.category),
      startDate: body.startDate || "",
      endDate: body.endDate || "",
      keyFeatures: normalizeArrayField(body.keyFeatures),
      highlights: body.highlights || "",
      githubUrl: body.githubUrl || body.gitLink || "",
      liveUrl: body.liveUrl || body.liveLink || "",
      status: body.status || "Draft",
      suggestedCategory: body.suggestedCategory || "",
      suggestedDescription: body.suggestedDescription || "",
    };

    const project = await Project.create(payload);

    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    console.error("createProject error:", error);
    return res.status(500).json({ success: false, message: "Failed to create project" });
  }
};

export const getProjects = async (_req: Request, res: Response) => {
  try {
  const projects = await Project.find().sort({ createdAt: -1 }).lean();
  return res.json({ success: true, data: projects });
  } catch (error) {
  console.error("getProjects error:", error);
  return res.status(500).json({ success: false, message: "Failed to fetch projects" });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
  const project = await Project.findById(req.params.id).lean();
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  return res.json({ success: true, data: project });
  } catch (error) {
  console.error("getProjectById error:", error);
  return res.status(500).json({ success: false, message: "Failed to fetch project" });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const body = req.body || {};

    const normalizeArrayField = (v: any) => {
      if (!v) return [];
      if (Array.isArray(v)) return v.filter(Boolean);
      if (typeof v === 'string') return v.split(',').map((s) => s.trim()).filter(Boolean);
      return [];
    };

    const update: any = {};
    if (Object.prototype.hasOwnProperty.call(body, 'title')) update.title = body.title;
    if (Object.prototype.hasOwnProperty.call(body, 'slug')) update.slug = body.slug;
    if (Object.prototype.hasOwnProperty.call(body, 'description')) update.description = body.description;
    if (Object.prototype.hasOwnProperty.call(body, 'image')) update.image = body.image;
    if (Object.prototype.hasOwnProperty.call(body, 'techStack')) update.techStack = normalizeArrayField(body.techStack);
  if (Object.prototype.hasOwnProperty.call(body, 'category') || Object.prototype.hasOwnProperty.call(body, 'categories')) update.category = normalizeArrayField(body.categories ?? body.category);
    if (Object.prototype.hasOwnProperty.call(body, 'startDate')) update.startDate = body.startDate;
    if (Object.prototype.hasOwnProperty.call(body, 'endDate')) update.endDate = body.endDate;
    if (Object.prototype.hasOwnProperty.call(body, 'keyFeatures')) update.keyFeatures = normalizeArrayField(body.keyFeatures);
    if (Object.prototype.hasOwnProperty.call(body, 'highlights')) update.highlights = body.highlights;
    if (Object.prototype.hasOwnProperty.call(body, 'githubUrl') || Object.prototype.hasOwnProperty.call(body, 'gitLink')) update.githubUrl = body.githubUrl || body.gitLink;
    if (Object.prototype.hasOwnProperty.call(body, 'liveUrl') || Object.prototype.hasOwnProperty.call(body, 'liveLink')) update.liveUrl = body.liveUrl || body.liveLink;
    if (Object.prototype.hasOwnProperty.call(body, 'status')) update.status = body.status;
    if (Object.prototype.hasOwnProperty.call(body, 'suggestedCategory')) update.suggestedCategory = body.suggestedCategory;
    if (Object.prototype.hasOwnProperty.call(body, 'suggestedDescription')) update.suggestedDescription = body.suggestedDescription;

    const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).lean();
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    return res.json({ success: true, data: project });
  } catch (error) {
  console.error("updateProject error:", error);
  return res.status(500).json({ success: false, message: "Failed to update project" });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
  const doc = await Project.findByIdAndDelete(req.params.id).lean();
  if (!doc) return res.status(404).json({ success: false, message: "Project not found" });
  return res.json({ success: true, message: "Project deleted" });
  } catch (error) {
  console.error("deleteProject error:", error);
  return res.status(500).json({ success: false, message: "Failed to delete project" });
  }
};