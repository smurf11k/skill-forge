import axios from "axios";

const api = axios.create({
  //baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  baseURL: "https://jubilant-dream-production-ca3d.up.railway.app/api",
  // hardcoded for testing, remove later
  withCredentials: true,
});

export const getToken = () => localStorage.getItem("sf_token");

export const getUser = () =>
  JSON.parse(localStorage.getItem("sf_user") || "null");

export const saveAuth = (token, user) => {
  localStorage.setItem("sf_token", token);
  localStorage.setItem("sf_user", JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem("sf_token");
  localStorage.removeItem("sf_user");
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url || "";

    // Don't auto-redirect on failed login requests
    if (status === 401 && !url.includes("/login")) {
      clearAuth();
      window.location.href = "/login";
    }

    return Promise.reject(err);
  },
);

export default api;
