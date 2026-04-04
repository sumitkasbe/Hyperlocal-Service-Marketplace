import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getUser } from "../../Utils/auth";
import {
  User, LogOut, ChevronDown, Settings,
  Star, Briefcase, Calendar
} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const user = getUser();
  const isLoggedIn = !!user;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    return parts.length === 1
      ? parts[0].charAt(0).toUpperCase()
      : (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  const getAvatarColor = (name = "User") => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-green-500 to-green-600",
      "from-purple-500 to-purple-600",
      "from-pink-500 to-pink-600",
      "from-indigo-500 to-indigo-600",
      "from-teal-500 to-teal-600",
      "from-orange-500 to-orange-600",
      "from-red-500 to-red-600",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash = hash & hash;
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Active link style helper
  const navLink = (path) => {
    const isActive = location.pathname === path;
    return `text-sm font-medium transition ${
      isActive
        ? "text-blue-600 border-b-2 border-blue-600 pb-0.5"
        : "text-gray-600 hover:text-blue-600"
    }`;
  };

  const initials = getInitials(user?.name);
  const avatarColor = getAvatarColor(user?.name);
  const dashboardPath = user?.role === "user" ? "/dashboard/user" : "/dashboard/provider";

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          to={isLoggedIn ? dashboardPath : "/"}
          className="flex items-center gap-2 shrink-0"
        >
          <div className="w-3 h-3 bg-blue-600 rounded-full" />
          <span className="text-xl font-semibold tracking-wide text-gray-800 font-['Poppins',sans-serif]">
            RepairWalla
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {!isLoggedIn ? (
            /* ── NOT LOGGED IN ── */
            <>
              <Link to="/auth/login" className="text-gray-600 hover:text-blue-600 font-medium transition text-sm">
                Sign In
              </Link>
              <Link
                to="/auth/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm hover:bg-indigo-500 transition"
              >
                Get Started
              </Link>
            </>
          ) : (
            /* ── LOGGED IN ── */
            <>
              {/* Dashboard */}
              <Link to={dashboardPath} className={navLink(dashboardPath)}>
                Dashboard
              </Link>

              {/* Booking Queue (provider) / My Bookings (user) */}
              {/* {user?.role === "provider" ? (
                <Link to="/provider/queue" className={navLink("/provider/queue")}>
                  Booking Queue
                </Link>
              ) : (
                <Link to="/my-bookings" className={navLink("/my-bookings")}>
                  My Bookings
                </Link>
              )} */}

              {/* Services */}
              <Link to="/services" className={navLink("/services")}>
                Services
              </Link>

              {/* ── Profile Dropdown ── */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-8 h-8 bg-gradient-to-br ${avatarColor} rounded-full flex items-center justify-center text-white text-sm font-bold`}
                    >
                      {initials}
                    </div>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 truncate">{user?.name || "User"}</p>
                      <p className="text-sm text-slate-500 truncate">{user?.email}</p>
                      <span className={`inline-block mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                        user?.role === "provider"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-green-50 text-green-600"
                      }`}>
                        {user?.role}
                      </span>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">

                      {/* My Profile */}
                      <Link
                        to={user?.role === "user" ? "/profile" : "/provider/profile"}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        <span>My Profile</span>
                      </Link>

                      {/* My Reviews — user only */}
                      {/* {user?.role === "user" && (
                        <Link
                          to="/my-reviews"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Star className="w-4 h-4 text-gray-400" />
                          <span>My Reviews</span>
                        </Link>
                      )} */}

                      {/* Booking Queue — provider only */}
                      {user?.role === "provider" && (
                        <Link
                          to="/provider/queue"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Booking Queue</span>
                        </Link>
                      )}

                      {/* My Services — provider only */}
                      {user?.role === "provider" && (
                        <Link
                          to="/provider/services"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <Briefcase className="w-4 h-4 text-gray-400" />
                          <span>My Services</span>
                        </Link>
                      )}

                      {/* Settings */}
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-100 pt-2">
                      <button
                        onClick={() => { setIsOpen(false); handleLogout(); }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;