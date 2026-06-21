import { Router } from "express";
import multer from "multer";
import { uploadFile } from "../controllers/upload.controller.js";

const router = Router();
const upload = multer({ dest: "tmp/" });

router.post("/", upload.single("file"), uploadFile);

export default router;
