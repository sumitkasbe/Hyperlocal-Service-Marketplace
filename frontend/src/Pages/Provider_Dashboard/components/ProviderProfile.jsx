import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  CheckCircle,
  XCircle,
  Upload,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Star,
  Clock,
  FileText,
  Building,
  FileCheck,
  AlertCircle,
  Download,
} from "lucide-react";
import api from "../../../api/axios";
import { getUser } from "../../../Utils/auth";

const ProviderProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({});
  const user = getUser();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/provider/profile");
      setProfile(response.data.provider);
      setFormData(response.data.provider);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed");
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("avatar", file);

    setUploading(true);
    try {
      const response = await api.post("/provider/avatar", uploadFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        setProfile((prev) => ({ ...prev, avatar_url: response.data.url }));

        // Update localStorage with new avatar URL
        const currentUser = getUser();
        const updatedUser = {
          ...currentUser,
          avatar: response.data.url,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        alert("Profile photo uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, or PDF files are allowed");
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("document", file);
    uploadFormData.append("documentType", docType);

    setUploading(true);
    try {
      const response = await api.post(
        "/provider/verification-document",
        uploadFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (response.data.success) {
        alert("Document uploaded successfully! It will be verified soon.");

        // Update localStorage with new status
        const currentUser = getUser();
        const updatedUser = {
          ...currentUser,
          provider_status: "pending",
          verified: false,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        fetchProfile(); // Refresh profile data
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      alert(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put("/provider/profile", formData);
      setProfile(formData);
      setEditing(false);

      // Update localStorage with new user data
      const currentUser = getUser();
      const updatedUser = {
        ...currentUser,
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        experience_years: formData.experience_years,
        city: formData.city,
        business_name: formData.business_name,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const getStatusBadge = () => {
    if (profile?.verified) {
      return {
        text: "Verified Provider",
        color: "bg-green-50 text-green-700",
        icon: CheckCircle,
      };
    }
    if (profile?.provider_status === "rejected") {
      return {
        text: "Verification Rejected",
        color: "bg-red-50 text-red-700",
        icon: XCircle,
      };
    }
    return {
      text: "Verification Pending",
      color: "bg-yellow-50 text-yellow-700",
      icon: Clock,
    };
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Provider Profile
          </h1>
          <button
            onClick={() => navigate("/dashboard/provider")}
            className="text-slate-600 hover:text-slate-900"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-blue-500 to-blue-600"></div>

          {/* Profile Photo */}
          <div className="relative px-8 pb-8">
            <div className="flex justify-between items-start">
              <div className="relative -mt-16">
                <div className="w-32 h-32 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-xl">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url} // Cloudinary URL
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                      {profile?.name?.charAt(0) || "P"}
                    </div>
                  )}
                </div>
                <label
                  className={`absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-slate-50 ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
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

              {/* Verification Badge */}
              <div className="mt-4">
                <div
                  className={`flex items-center gap-2 ${statusBadge.color} px-4 py-2 rounded-full`}
                >
                  <StatusIcon className="w-5 h-5" />
                  <span className="font-medium">{statusBadge.text}</span>
                </div>
                {profile?.rejection_reason && (
                  <p className="text-xs text-red-600 mt-2 max-w-xs text-right">
                    Reason: {profile.rejection_reason}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Info - same as before */}
            {editing ? (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* ... existing edit form ... */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.name || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Experience (years)
                    </label>
                    <input
                      type="number"
                      value={formData.experience_years || 0}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experience_years: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows="4"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Tell customers about yourself and your experience..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Business Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.business_name || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        business_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Your business name"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-6 py-2 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {profile?.name}
                </h2>
                <p className="text-slate-500">{profile?.email}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-400" />
                    <span>{profile?.phone || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-slate-400" />
                    <span>{profile?.city || "Not provided"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5 text-slate-400" />
                    <span>
                      {profile?.experience_years || 0} years experience
                    </span>
                  </div>
                  {profile?.business_name && (
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-slate-400" />
                      <span>{profile.business_name}</span>
                    </div>
                  )}
                </div>

                {profile?.bio && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-slate-900 mb-2">About</h3>
                    <p className="text-slate-600">{profile.bio}</p>
                  </div>
                )}

                <button
                  onClick={() => setEditing(true)}
                  className="mt-6 px-6 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Verification Documents Section */}
        {(profile?.provider_status === "pending" ||
          profile?.provider_status === "rejected") && (
          <div className="mt-8 bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              {profile?.provider_status === "rejected"
                ? "Resubmit Documents"
                : "Verification Required"}
            </h2>

            {profile?.provider_status === "rejected" && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">
                  <strong>Reason for rejection:</strong>{" "}
                  {profile?.rejection_reason ||
                    "Your application was rejected. Please upload correct documents."}
                </p>
              </div>
            )}

            <p className="text-slate-500 mb-6">
              {profile?.provider_status === "rejected"
                ? "Please upload the correct documents for verification. Your application will be reviewed again."
                : "To become a verified provider and gain customer trust, please upload your identification documents."}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Aadhar Card */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-300 transition-colors">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">
                  Aadhar Card
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Government ID proof
                </p>
                {profile?.verification_document &&
                  profile?.document_type === "aadhar" && (
                    <div className="mb-3 text-sm text-green-600 flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Already uploaded</span>
                      <a
                        href={profile.verification_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  )}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => handleDocumentUpload(e, "aadhar")}
                    disabled={uploading}
                  />
                  <span
                    className={`inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {uploading
                      ? "Uploading..."
                      : profile?.verification_document &&
                          profile?.document_type === "aadhar"
                        ? "Replace Aadhar"
                        : "Upload Aadhar"}
                  </span>
                </label>
              </div>

              {/* PAN Card */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-300 transition-colors">
                <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-900 mb-1">PAN Card</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Tax identification
                </p>
                {profile?.verification_document &&
                  profile?.document_type === "pan" && (
                    <div className="mb-3 text-sm text-green-600 flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Already uploaded</span>
                      <a
                        href={profile.verification_document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  )}
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={(e) => handleDocumentUpload(e, "pan")}
                    disabled={uploading}
                  />
                  <span
                    className={`inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {uploading
                      ? "Uploading..."
                      : profile?.verification_document &&
                          profile?.document_type === "pan"
                        ? "Replace PAN"
                        : "Upload PAN"}
                  </span>
                </label>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Why verification is important?
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Verified providers get a badge on their profile, increasing
                    customer trust and booking chances. Verification usually
                    takes 24-48 hours after document submission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Message */}
        {profile?.provider_status === "rejected" && (
          <div className="mt-8 bg-red-50 rounded-2xl border border-red-200 p-6">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">
                  Verification Rejected
                </h3>
                <p className="text-red-700 mt-1">
                  {profile?.rejection_reason ||
                    "Your application was rejected. Please contact support for more information."}
                </p>
                <button
                  onClick={() => setEditing(true)}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Update Information & Resubmit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderProfile;
