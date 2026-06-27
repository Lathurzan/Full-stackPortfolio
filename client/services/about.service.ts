import { api } from "./api";

export const fetchAbout = async () => {
  try {
    const res = await api.get("/about");
    return res.data;
  } catch (err) {
    console.warn("fetchAbout failed:", err);
    return { title: "", body: "" };
  }
};

export const updateAbout = async (payload: { title?: string; body: string; image?: string }) => {
  try {
    const res = await api.put("/about", payload);
    return res.data;
  } catch (err) {
    console.warn("updateAbout failed:", err);
    return null;
  }
};
