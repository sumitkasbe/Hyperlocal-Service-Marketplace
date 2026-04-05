import axios from "axios";
import { getToken } from "../Utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
});

// Auto attach JWT - Check for both user and admin tokens
api.interceptors.request.use((config) => {
  // First, check for admin token (used for admin dashboard)
  const adminToken = localStorage.getItem('admin_token');
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
    return config;
  }
  
  // If no admin token, check for regular user token
  const userToken = getToken();
  if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }
  
  return config;
});

export default api;