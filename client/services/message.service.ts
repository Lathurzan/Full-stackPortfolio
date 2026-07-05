import { api } from "./api";

export const messageService = {
  list: async () => {
    try {
      const response = await api.get("/messages");
      return response.data.data as Array<{
        name: string;
        email: string;
        message: string;
      }>;
    } catch (err) {
      console.warn("messageService.list failed:", err);
      // rethrow so callers can surface errors instead of silently receiving []
      throw err;
    }
  },

  create: async (payload: { name: string; email: string; message: string }) => {
    try {
      const response = await api.post("/messages", payload);
      return response.data.data;
    } catch (err) {
      console.warn("messageService.create failed:", err);
      throw err;
    }
  },
  delete: async (id: string) => {
    try {
      const response = await api.delete(`/messages/${id}`);
      return response.data;
    } catch (err) {
      console.warn("messageService.delete failed:", err);
      throw err;
    }
  },
};