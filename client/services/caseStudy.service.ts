import { api } from "./api";

export const caseStudyService = {
  getAll: async () => {
    try {
      const response = await api.get("/casestudies");
      return response.data;
    } catch (err) {
      console.warn("caseStudyService.getAll failed:", err);
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const response = await api.get(`/casestudies/${id}`);
      return response.data;
    } catch (err) {
      console.warn("caseStudyService.getById failed:", err);
      return null;
    }
  },

  create: async (data: unknown) => {
    try {
      const response = await api.post("/casestudies", data);
      return response.data;
    } catch (err) {
      console.warn("caseStudyService.create failed:", err);
      return null;
    }
  },

  update: async (id: string, data: unknown) => {
    try {
      const response = await api.put(`/casestudies/${id}`, data);
      return response.data;
    } catch (err) {
      console.warn("caseStudyService.update failed:", err);
      return null;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/casestudies/${id}`);
      return response.data;
    } catch (err) {
      console.warn("caseStudyService.delete failed:", err);
      return null;
    }
  },
};
