import { api } from "./api";

export const authService = {
  login: async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  // server response shape: { success, message, data: { token, user } }
  return response.data.data;
  },

  logout: () => {
    localStorage.removeItem("admin_token");
  },
};