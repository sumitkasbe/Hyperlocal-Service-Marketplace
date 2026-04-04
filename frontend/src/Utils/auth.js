// Utils/auth.js
import api from "../api/axios";

// Set auth data
export const setAuth = (token, user) => {
  console.log("setAuth called with:", { token, user });
  
  // Store in localStorage
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Set axios default header
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Get token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Get user
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Remove auth data
export const removeAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Logout
export const logout = () => {
  removeAuth();
  window.location.href = '/auth/login';
};