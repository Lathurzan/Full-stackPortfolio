import axios from "axios";

// Default to :5001 which is the project server port used in this workspace; override with NEXT_PUBLIC_API_URL in env.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Public API instance: does not send credentials or Authorization header.
export const publicApi = axios.create({
  baseURL: API_URL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("admin_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Global response handler: if a request returns 401, clear stored admin token and redirect to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const status = error?.response?.status;
      if (status === 401 && typeof window !== "undefined") {
        // remove invalid token
        localStorage.removeItem("admin_token");
        // redirect to admin login to re-authenticate
        window.location.href = "/admin/login";
      }
    } catch (e) {
      // ignore
    }

    return Promise.reject(error);
  }
);