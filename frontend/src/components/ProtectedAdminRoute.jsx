import { Navigate } from "react-router-dom";

const ProtectedAdminRoute = ({ children }) => {
  // Simple check
  const token = localStorage.getItem('admin_token');
  const adminStr = localStorage.getItem('admin');
  const admin = adminStr ? JSON.parse(adminStr) : null;
  
  console.log("ProtectedAdminRoute check:", {
    hasToken: !!token,
    hasAdmin: !!admin,
    role: admin?.role
  });
  
  if (!token || !admin || admin.role !== 'admin') {
    console.log("Redirecting to /admin/login");
    return <Navigate to="/admin/login" replace />;
  }
  
  console.log("Rendering admin dashboard");
  return children;
};

export default ProtectedAdminRoute;