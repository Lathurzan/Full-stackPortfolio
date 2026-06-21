import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";
import { successResponse, errorResponse } from "../utils/response.js";
import { isDbConnected } from "../config/db.js";

export const register = async (req: Request, res: Response) => {
  try {
  console.log("[auth.register] payload:", req.body);
    if (!isDbConnected()) {
      return errorResponse(res, "Database not connected", 503);
    }
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return errorResponse(res, "Admin already exists", 400);
    }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

  console.log("[auth.register] created user id:", user._id.toString());
    return successResponse(res, "Admin created successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, 201);
  } catch (error) {
    return errorResponse(res, "Register failed", 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    if (!isDbConnected()) {
      return errorResponse(res, "Database not connected", 503);
    }
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return errorResponse(res, "Invalid email or password", 401);
    }

    const token = generateToken(user._id.toString());

    return successResponse(res, "Login successful", {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return errorResponse(res, "Login failed", 500);
  }
};

export const getMe = async (req: Request, res: Response) => {
  return successResponse(res, "Admin profile fetched", req.user);
};