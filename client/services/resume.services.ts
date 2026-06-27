import { api } from "./api"

export async function getResume() {
  // Use the authenticated axios instance but explicitly avoid sending credentials
  // for this public read to prevent 401s caused by cookies/credentials.
  const res = await api.get("/resume", { withCredentials: false })
  // normalize response shapes used across the app
  const payload = res?.data?.data || res?.data || null
  const resume = payload && (payload.resume || payload.url) ? (payload.resume || payload.url) : null
  return resume
}

export async function uploadResume(file: File) {
  const fd = new FormData()
  fd.append("file", file)

  const res = await api.post("/resume", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  })

  const payload = res?.data?.data || res?.data || null
  const resume = payload && (payload.resume || payload.url) ? (payload.resume || payload.url) : null
  return resume
}

export async function deleteResume() {
  const res = await api.delete("/resume")
  const payload = res?.data?.data || res?.data || null
  return payload && (payload.resume || null)
}
