import { api } from "./api";

export const analyticsService = {
  getStats: async () => {
    const response = await api.get("/analytics");
    return response.data;
  },

  track: async (data: unknown) => {
    const response = await api.post("/analytics/track", data);
    return response.data;
  },
};