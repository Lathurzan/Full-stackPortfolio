import Blog from "../models/Blog.js";

export const blogService = {
  getAll: async () => {
    return await Blog.find();
  },

  getById: async (id: string) => {
    return await Blog.findById(id);
  },

  create: async (data: any) => {
    return await Blog.create(data);
  },

  update: async (id: string, data: any) => {
    return await Blog.findByIdAndUpdate(id, data, { new: true });
  },

  delete: async (id: string) => {
    return await Blog.findByIdAndDelete(id);
  },
};
