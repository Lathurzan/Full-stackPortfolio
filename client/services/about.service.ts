import { api, publicApi } from "./api";

export const fetchAbout = async () => {
  try {
    // Public read should not include credentials
    const res = await publicApi.get("/about");
    return res.data;
  } catch (err) {
    console.warn("fetchAbout failed:", err);
    return { title: "", body: "" };
  }
};

export const updateAbout = async (payload: { title?: string; body: string; image?: string }) => {
  try {
    // Update requires auth
    const res = await api.put("/about", payload);
    return res.data;
  } catch (err) {
    console.warn("updateAbout failed:", err);
    return null;
  }
};
