import { api } from "./api";

export const authService = {
  login: async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    // server response shape: { success, message, data: { token, user } }
    // Some endpoints may return { data } or { data: { token, user } }
    const payload = response?.data?.data ?? response?.data;
    return payload;
  } catch (err: any) {
    // Re-throw with normalized message for the UI
    const msg = err?.response?.data?.message || err?.message || "Login failed";
    throw new Error(String(msg));
  }
  },

  logout: () => {
    localStorage.removeItem("admin_token");
  },
};