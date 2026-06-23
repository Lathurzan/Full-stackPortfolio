import express from "express";
import { listMessages, createMessage, deleteMessage } from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public: create message (contact form)
router.post("/", createMessage);

// Admin: list messages
router.get("/", protect, listMessages);
// Admin: delete message
router.delete("/:id", protect, deleteMessage);

export default router;
