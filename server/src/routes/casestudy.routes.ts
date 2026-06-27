import { Router } from "express";
import {
  createCaseStudy,
  getCaseStudies,
  getCaseStudyById,
  updateCaseStudy,
  deleteCaseStudy,
} from "../controllers/casestudy.controller.js";

const router = Router();

router.get("/", getCaseStudies);
router.get("/:id", getCaseStudyById);
router.post("/", createCaseStudy);
router.put("/:id", updateCaseStudy);
router.delete("/:id", deleteCaseStudy);

export default router;