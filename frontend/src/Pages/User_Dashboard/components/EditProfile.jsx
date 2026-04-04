import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../../Utils/auth";
import api from "../../../api/axios";
import { useToast } from "../../../context/ToastContext";
import { Camera, User, Mail, Phone } from "lucide-react";

const EditProfile = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const userData = getUser();
    setUser(userData);
    setFormData({
      name: userData?.name || "",
      email: userData?.email || "",
      phone: userData?.phone || "",
    });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be less than 5MB", "error");
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast("Only image files are allowed", "error");
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("avatar", file);

    setUploading(true);
    try {
      const response = await api.post("/user/avatar", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        // Update localStorage with new avatar
        const currentUser = getUser();
        const updatedUser = { ...currentUser, avatar: response.data.url };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        showToast("Profile photo updated!", "success");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      showToast(
        error.response?.data?.message || "Failed to upload image",
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Change this line - use /user/me instead of /user/profile
      const response = await api.put("/user/me", formData);

      // Update localStorage
      const currentUser = getUser();
      const updatedUser = { ...currentUser, ...formData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      showToast("Profile updated successfully!", "success");

      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast(
        error.response?.data?.message || "Failed to update profile",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 transition ${
      errors[field]
        ? "border-red-500 bg-red-50"
        : "border-slate-200 focus:border-blue-500"
    }`;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/profile")}
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
          <span>Back to Profile</span>
        </button>

        {/* Edit Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
            <p className="text-blue-100 mt-1">
              Update your personal information
            </p>
          </div>

          {/* Avatar Section */}
          <div className="px-8 pt-8 pb-6 border-b border-slate-100 flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                    {user.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <label
                className={`absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {uploading ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-4 h-4 text-slate-600" />
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            <div>
              <p className="font-medium text-slate-900">Profile Photo</p>
              <p className="text-sm text-slate-500">
                Click the camera icon to upload a photo
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`${inputClass("name")} pl-12`}
                  placeholder="Your full name"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1.5">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`${inputClass("email")} pl-12`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`${inputClass("phone")} pl-12`}
                  placeholder="9876543210"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1.5">{errors.phone}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">
                Used for WhatsApp notifications
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-[#0055b8] text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
