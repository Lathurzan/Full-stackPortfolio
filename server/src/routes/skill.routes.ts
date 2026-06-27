import { Router } from "express";
import {
  createSkillCategory,
  getSkillCategories,
  updateSkillCategory,
  deleteSkillCategory,
} from "../controllers/skill.controller.js";

const router = Router();

router.get("/", getSkillCategories);
router.post("/", createSkillCategory);
router.put("/:id", updateSkillCategory);
router.delete("/:id", deleteSkillCategory);

export default router;
