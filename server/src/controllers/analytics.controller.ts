import type { Request, Response } from "express";
import Analytics from "../models/Analytics.js";
import { successResponse, errorResponse } from "../utils/response.js";
import mongoose from "mongoose";

// returns totals and last 30 days series grouped by type
export const getAnalytics = async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const start = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 29); // ~30 days including today

    // totals per type
    const totalsAgg = await Analytics.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    const totals: Record<string, number> = {};
    totalsAgg.forEach((t: any) => {
      totals[t._id] = t.count;
    });

    // daily series for each day in range
    const days: string[] = [];
    const seriesMap: Record<string, number[]> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      days.push(key);
    }

    // aggregate by date and type
    const seriesAgg = await Analytics.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $project: {
          type: 1,
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        },
      },
      { $group: { _id: { day: "$day", type: "$type" }, count: { $sum: 1 } } },
    ]);

    // map results
    seriesAgg.forEach((s: any) => {
      const day = s._id.day;
      const type = s._id.type;
      if (!seriesMap[type]) seriesMap[type] = Array(30).fill(0);
      const idx = days.indexOf(day);
      if (idx >= 0) seriesMap[type][idx] = s.count;
    });

    return successResponse(res, "Analytics fetched", { totals, days, series: seriesMap });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getAnalytics error", err);
    return errorResponse(res, "Failed to fetch analytics", 500);
  }
};
