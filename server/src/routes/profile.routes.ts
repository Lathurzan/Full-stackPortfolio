import express from "express";
import {
  getProfile,
  updateProfile,
} from "../controllers/profile.contoller.js";

const router = express.Router();
    
/**
 * Public Routes
 */
router.get("/", getProfile);

/**
 * Admin Routes
 */
router.put("/", updateProfile);

export default router;