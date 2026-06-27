import { Router } from "express";
import {
  createWork,
  getWorks,
  getWorkById,
  updateWork,
  deleteWork,
} from "../controllers/workExperience.controller.js";

const router = Router();

router.get("/", getWorks);
router.post("/", createWork);
router.get("/:id", getWorkById);
router.put("/:id", updateWork);
router.delete("/:id", deleteWork);

export default router;
