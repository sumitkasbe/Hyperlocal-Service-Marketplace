import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  AlertCircle,
  Settings,
  DollarSign,
  BarChart3,
  X,
} from "lucide-react";

const menuItems = [
  { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/providers", icon: Users, label: "Providers" },
  { path: "/admin/bookings", icon: Calendar, label: "Bookings" },
  { path: "/admin/complaints", icon: AlertCircle, label: "Complaints" },
  { path: "/admin/payments", icon: DollarSign, label: "Payments" },
  { path: "/admin/categories", icon: Settings, label: "Categories" },
  { path: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

const Sidebar = ({ isOpen, onClose }) => {
  const SidebarContent = () => (
    <div className="h-full bg-white shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">RepairWalla</h1>
        <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 mx-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          © 2024 RepairWalla Admin
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar; // ← Make sure this line exists