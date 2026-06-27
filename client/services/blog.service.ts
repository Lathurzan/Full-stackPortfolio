import { api } from "./api";

export const blogService = {
  getAll: async () => {
    try {
      const response = await api.get("/blogs");
      return response.data;
    } catch (err) {
      console.warn("blogService.getAll failed:", err);
      return [];
    }
  },

  getBySlug: async (slug: string) => {
    try {
      const response = await api.get(`/blogs/${slug}`);
      return response.data;
    } catch (err) {
      console.warn("blogService.getBySlug failed:", err);
      return null;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/blogs/${id}`);
      return response.data;
    } catch (err) {
      console.warn("blogService.getById failed:", err);
      return null;
    }
  },

  create: async (data: unknown) => {
    try {
      const response = await api.post("/blogs", data);
      return response.data;
    } catch (err) {
      console.warn("blogService.create failed:", err);
      return null;
    }
  },

  update: async (id: string, data: unknown) => {
    try {
      const response = await api.put(`/blogs/${id}`, data);
      return response.data;
    } catch (err) {
      console.warn("blogService.update failed:", err);
      return null;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/blogs/${id}`);
      return response.data;
    } catch (err) {
      console.warn("blogService.delete failed:", err);
      return null;
    }
  },
};