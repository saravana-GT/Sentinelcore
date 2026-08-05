import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export const session = {
  clear() {
    ["token", "refreshToken", "organizationId", "username", "role"].forEach((key) => localStorage.removeItem(key));
  },
  save(auth) {
    localStorage.setItem("token", auth.token);
    localStorage.setItem("username", auth.username || "");
    localStorage.setItem("role", auth.role || "");
    if (auth.refreshToken) localStorage.setItem("refreshToken", auth.refreshToken);
    if (auth.organizationId) localStorage.setItem("organizationId", auth.organizationId);
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const organizationId = localStorage.getItem("organizationId");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (organizationId) config.headers["x-org-id"] = organizationId;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.error || error.response?.data?.message || error.message || "Request failed";
    if (status === 401) {
      session.clear();
      if (window.location.pathname !== "/") window.location.assign("/");
    }
    if (status === 403) window.dispatchEvent(new CustomEvent("api:forbidden", { detail: message }));
    return Promise.reject(Object.assign(error, { userMessage: message }));
  }
);

export const apiClient = {
  login: (payload) => api.post("/api/auth/login", payload),
  register: (payload) => api.post("/api/auth/register", payload),
  dashboard: () => api.get("/api/dashboard"),
  complianceDashboard: () => api.get("/api/compliance/dashboard"),
  complianceMatrix: (params) => api.get("/api/compliance-matrix", { params }),
  control: (id) => api.get(`/api/control/${id}`),
  updateControlStatus: (id, status) => api.put(`/api/control/${id}/status`, { status })
};

export default api;
