import { Outlet, Navigate, useLocation } from "react-router-dom";
import { getToken, getUser } from "../Utils/auth";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";

const DashboardLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = getToken();
    const userData = getUser();

    if (token && userData) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    setIsLoading(false);
  }, [location]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#0055b8] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-slate-500 mt-4 font-bold tracking-tight">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;