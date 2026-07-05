import express from "express";
import { listMessages, createMessage, deleteMessage } from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public: create message (contact form)
router.post("/", createMessage);

// List messages (made public so UI can fetch messages)
router.get("/", listMessages);
// Admin: delete message
router.delete("/:id", protect, deleteMessage);

export default router;
