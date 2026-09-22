import axios from "axios";
import { getToken } from "../Utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

// Automatically attach JWT
api.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("admin_token");

  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
    return config;
  }

  const userToken = getToken();

  if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }

  return config;
});

export default api;