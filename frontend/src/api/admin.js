import api from './axios';

export const adminAPI = {
  // Dashboard Stats
  getStats: () => api.get('/admin/stats'),
  
  // Provider Management
  getProviders: (status) => api.get(`/admin/providers?status=${status || 'pending'}`),
  getProvider: (id) => api.get(`/admin/providers/${id}`),
  approveProvider: (id) => api.patch(`/admin/providers/${id}/approve`),
  rejectProvider: (id, reason) => api.patch(`/admin/providers/${id}/reject`, { reason }),
  getProviderStats: () => api.get('/admin/providers/stats/summary'),
  
  // Booking Management
  getBookings: (status) => api.get(`/admin/bookings?status=${status || 'all'}`),
  getBookingDetails: (id) => api.get(`/admin/bookings/${id}`),
  
  // Complaints 
  getComplaints: () => api.get('/admin/complaints'),
  resolveComplaint: (id) => api.patch(`/admin/complaints/${id}/resolve`),
  
  // Service Categories
  getCategories: () => api.get('/admin/categories'),
  addCategory: (data) => api.post('/admin/categories', data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  
  // Payments
  getPayments: () => api.get('/admin/payments'),
  getRevenue: () => api.get('/admin/revenue'),
};