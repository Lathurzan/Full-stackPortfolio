import Project from "../models/Project.js";

export const projectService = {
  getAll: async () => {
    return await Project.find();
  },

  getById: async (id: string) => {
    return await Project.findById(id);
  },

  create: async (data: any) => {
    return await Project.create(data);
  },

  update: async (id: string, data: any) => {
    return await Project.findByIdAndUpdate(id, data, { new: true });
  },

  delete: async (id: string) => {
    return await Project.findByIdAndDelete(id);
  },
};