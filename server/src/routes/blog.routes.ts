import express from "express";
import multer from "multer";
import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";

const router = express.Router();
const upload = multer({ dest: "tmp/" });

router.get("/", getBlogs);
router.get("/:id", getBlogById);
// Accept optional file upload under key 'file' and delegate upload handling to controller
router.post("/", upload.single("file"), createBlog);
router.put("/:id", upload.single("file"), updateBlog);
router.delete("/:id", deleteBlog);

export default router;
