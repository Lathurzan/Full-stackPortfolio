import express from "express";
import { getAbout, updateAbout } from "../controllers/about.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public: fetch about content
router.get("/", getAbout);

// Admin: update about content (dev: allow without auth)
router.put("/", updateAbout);

export default router;
