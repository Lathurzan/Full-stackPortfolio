import axios from "axios"

const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
// normalize to always include a single trailing /api
const API_URL = raw.replace(/\/$/, "") + "/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Public API instance: no credentials, no Authorization header
export const publicApi = axios.create({
  baseURL: API_URL,
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const status = error?.response?.status
      if (status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("admin_token")
        window.location.href = "/admin/login"
      }
    } catch (e) {
      // ignore
    }
    return Promise.reject(error)
  }
)