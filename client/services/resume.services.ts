import { api, publicApi } from "./api";

export async function getResume(): Promise<string | null> {
  const res = await publicApi.get("/resume");
  const payload = res?.data?.data || res?.data || null;
  return payload?.resume || payload?.url || null;
}

export async function uploadResume(file: File): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await api.post("/resume", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const payload = res?.data?.data || res?.data || null;
  return payload?.resume || payload?.url || null;
}

export async function deleteResume(): Promise<string | null> {
  const res = await api.delete("/resume");
  const payload = res?.data?.data || res?.data || null;
  return payload?.resume || null;
}