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
  links: {},
  customLinks: [],
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
    // Build an update object only from provided properties to allow partial updates
    const {
      title,
      body,
      image,
      role,
      headerRole,
      subDescription,
      links,
      customLinks,
    } = req.body;

    // If the client explicitly provided `body`, validate it. Otherwise allow partial updates
    if (Object.prototype.hasOwnProperty.call(req.body, "body")) {
      if (!body || String(body).trim() === "") {
        return errorResponse(res, "Profile description is required", 400);
      }
    }

    const update: any = {};
    if (Object.prototype.hasOwnProperty.call(req.body, "title")) update.title = title;
    if (Object.prototype.hasOwnProperty.call(req.body, "body")) update.body = body;
    if (Object.prototype.hasOwnProperty.call(req.body, "image")) update.image = image;
    if (Object.prototype.hasOwnProperty.call(req.body, "role")) update.role = role;
    if (Object.prototype.hasOwnProperty.call(req.body, "headerRole")) update.headerRole = headerRole;
    if (Object.prototype.hasOwnProperty.call(req.body, "subDescription")) update.subDescription = subDescription;
    if (Object.prototype.hasOwnProperty.call(req.body, "links")) update.links = links || {};
    if (Object.prototype.hasOwnProperty.call(req.body, "customLinks")) update.customLinks = customLinks || [];

    const profile = await Profile.findOneAndUpdate({}, update, {
      new: true,
      upsert: true,
      runValidators: true,
    });

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