import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../../Utils/auth";
import api from "../../../api/axios";
import { User, Mail, Phone, Calendar, Shield } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth/login");
        return;
      }

      // Change this line - use /user/me instead of /user/profile
      const response = await api.get("/user/me");
      setUser(response.data.user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback to localStorage if API fails
      const userData = getUser();
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 group"
        >
          <svg
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>Back</span>
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>

          {/* Avatar */}
          <div className="relative px-8 pb-8">
            <div className="flex justify-between items-start">
              <div className="relative -mt-16">
                <div className="w-32 h-32 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-xl">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                      {user?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium capitalize">
                  <Shield className="w-3.5 h-3.5" />
                  {user?.role || "User"}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="mt-4">
              <h1 className="text-2xl font-bold text-slate-900">
                {user?.name}
              </h1>
              <p className="text-slate-500 mt-1">
                Member since {formatDate(user?.created_at)}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <Mail className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Email Address</p>
                  <p className="text-sm font-medium text-slate-800">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <Phone className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Phone Number</p>
                  <p className="text-sm font-medium text-slate-800">
                    {user?.phone || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Account Created</p>
                  <p className="text-sm font-medium text-slate-800">
                    {formatDate(user?.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-400">Account Type</p>
                  <p className="text-sm font-medium text-slate-800 capitalize">
                    {user?.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={() => {
                  if (user?.role === "provider") {
                    navigate("/provider/profile");
                  } else {
                    navigate("/profile/edit");
                  }
                }}
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
