import { api, publicApi } from "./api";

export const fetchLinks = async () => {
  try {
  // profile endpoint contains links data now
  const res = await publicApi.get(`/profile`);
  return res.data;
  } catch (err: any) {
    console.error("fetchLinks error:", err?.message || err);
    return { success: false, message: err?.message || "Network error", data: null };
  }
};

export const updateLinks = async (payload: any) => {
  try {
  // send updates to profile endpoint (includes links and customLinks)
  const res = await api.put(`/profile`, payload);
  return res.data;
  } catch (err: any) {
    console.error("updateLinks error:", err?.message || err);
    return { success: false, message: err?.message || "Network error", data: null };
  }
};
