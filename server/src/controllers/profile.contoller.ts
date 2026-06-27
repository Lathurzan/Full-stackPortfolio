import type { Request, Response } from "express";
import Profile from "../models/profile.js";
import {
  successResponse,
  errorResponse,
} from "../utils/response.js";

/**
 * GET Profile
 */
export const getProfile = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    let profile = await Profile.findOne();

    if (!profile) {
      profile = await Profile.create({
        title: "",
        body: "",
        image: "",
        role: "",
        headerRole: "",
        subDescription: "",
      });
    }

    return successResponse(res, "Profile fetched successfully", profile);
  } catch (error) {
    console.error(error);

    return errorResponse(
      res,
      "Failed to fetch profile",
      500
    );
  }
};

/**
 * UPDATE Profile
 */
export const updateProfile = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      title,
      body,
      image,
      role,
      headerRole,
      subDescription,
    } = req.body;

    if (!body || body.trim() === "") {
      return errorResponse(
        res,
        "Profile description is required",
        400
      );
    }

    const profile = await Profile.findOneAndUpdate(
      {},
      {
        title,
        body,
        image,
        role,
        headerRole,
        subDescription,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return successResponse(
      res,
      "Profile updated successfully",
      profile
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      res,
      "Failed to update profile",
      500
    );
  }
};