import { api } from "./api";

export const projectService = {
  getAll: async () => {
    try {
      const response = await api.get("/projects");
      return response.data;
    } catch (err) {
      console.warn("projectService.getAll failed:", err);
      return [];
    }
  },

  getBySlug: async (slug: string) => {
    try {
      const response = await api.get(`/projects/${slug}`);
      return response.data;
    } catch (err) {
      console.warn("projectService.getBySlug failed:", err);
      return null;
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (err) {
      console.warn("projectService.getById failed:", err);
      return null;
    }
  },

  create: async (data: unknown) => {
    try {
      const response = await api.post("/projects", data);
      return response.data;
    } catch (err) {
      console.warn("projectService.create failed:", err);
      return null;
    }
  },

  update: async (id: string, data: unknown) => {
    try {
      const response = await api.put(`/projects/${id}`, data);
      return response.data;
    } catch (err) {
      console.warn("projectService.update failed:", err);
      return null;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (err) {
      console.warn("projectService.delete failed:", err);
      return null;
    }
  },
};