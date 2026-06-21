import type { Request, Response } from "express";
import Message from "../models/Message.js";
import { successResponse, errorResponse } from "../utils/response.js";

export const listMessages = async (_req: Request, res: Response) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    return successResponse(res, "Messages fetched", messages);
  } catch (err) {
    return errorResponse(res, "Failed to fetch messages", 500);
  }
};

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return errorResponse(res, "Missing fields", 400);
    }

    const m = await Message.create({ name, email, message });
    return successResponse(res, "Message created", m, 201);
  } catch (err) {
    return errorResponse(res, "Failed to create message", 500);
  }
};

