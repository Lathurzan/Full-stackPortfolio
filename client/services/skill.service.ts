import { api } from "./api";

export const skillService = {
  getAll: async () => {
    try {
      const response = await api.get('/skills');
      return response.data;
    } catch (err) {
      console.warn('skillService.getAll failed', err);
      return null;
    }
  },

  create: async (data: unknown) => {
    try {
      const response = await api.post('/skills', data);
      return response.data;
    } catch (err) {
      console.warn('skillService.create failed', err);
      return null;
    }
  },

  update: async (id: string, data: unknown) => {
    try {
      const response = await api.put(`/skills/${id}`, data);
      return response.data;
    } catch (err) {
      console.warn('skillService.update failed', err);
      return null;
    }
  },

  delete: async (id: string) => {
    try {
      const response = await api.delete(`/skills/${id}`);
      return response.data;
    } catch (err) {
      console.warn('skillService.delete failed', err);
      return null;
    }
  }
};
