import { api, publicApi } from "./api";

export const fetchProfile = async () => {
  try {
    // Public profile fetch should not include credentials by default.
    const res = await publicApi.get(`/profile`);
    return res.data;
  } catch (err: any) {
    console.error("fetchProfile error:", err?.message || err);
    return { success: false, message: err?.message || "Network error", data: null };
  }
};

export const updateProfile = async (payload: any) => {
  try {
    const res = await api.put(`/profile`, payload);
    return res.data;
  } catch (err: any) {
    console.error("updateProfile error:", err?.message || err);
    return { success: false, message: err?.message || "Network error", data: null };
  }
};