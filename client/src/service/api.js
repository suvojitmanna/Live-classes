import axios from "axios";

// Automatically sanitize Base URL
const rawBaseUrl =
  import.meta.env.VITE_BASE_URL ||
  (window.location.port === "5173"
    ? "http://localhost:5000/api"
    : `${window.location.origin}/api`);

const cleanBaseUrl = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : rawBaseUrl.replace(/\/+$/, "") + "/api";

const api = axios.create({
  baseURL: cleanBaseUrl,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.replace("/login");
    }

    return Promise.reject(error);
  },
);

export default api;
