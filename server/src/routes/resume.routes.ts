import { Router } from "express";
import multer from "multer";
import { uploadResume, getResume, deleteResume } from "../controllers/resume.controller.js";

const router = Router();
const upload = multer({ dest: "tmp/" });

// POST /api/resume - accepts multipart file or { url }
router.post("/", upload.single("file"), uploadResume);
// GET /api/resume - returns saved resume URL
router.get("/", getResume);
// DELETE /api/resume - remove saved resume (admin)
router.delete("/", deleteResume);

export default router;
