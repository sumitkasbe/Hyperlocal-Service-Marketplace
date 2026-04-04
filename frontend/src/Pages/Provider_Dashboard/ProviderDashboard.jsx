import { useState, useEffect } from "react";
import HeaderBar from "./components/HeaderBar";
import NewOrderCard from "./components/NewOrderCard";
import StatsCards from "./components/StatsCards";
import EarningsCard from "./components/EarningsCard";
import SkillsManager from "./components/SkillsServices";
import CompletedOrders from "./components/CompletedOrders";
import ReviewsPreview from "./components/ReviewsPreview";
import { Navigate, Link } from "react-router-dom";
import { getUser } from "../../Utils/auth";
import api from "../../api/axios";
import { AlertCircle, CheckCircle, XCircle, Clock, X } from "lucide-react";

const ProviderDashboard = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [providerStatus, setProviderStatus] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [profileData, setProfileData] = useState(null);
  
  // State for banner visibility
  const [showRejectedBanner, setShowRejectedBanner] = useState(true);
  const [showPendingBanner, setShowPendingBanner] = useState(true);
  const [showApprovedBanner, setShowApprovedBanner] = useState(true);

  useEffect(() => {
    const fetchProviderData = async () => {
      const userData = getUser();
      setUser(userData);
      
      if (userData && userData.role === "provider") {
        try {
          const response = await api.get("/provider/profile");
          setProviderStatus(response.data.provider.provider_status);
          setRejectionReason(response.data.provider.rejection_reason);
          setProfileData(response.data.provider);
        } catch (error) {
          console.error("Error fetching provider status:", error);
        }
      }
      setLoading(false);
    };
    
    fetchProviderData();
  }, []);

  // Auto-dismiss banners after 5 seconds
  useEffect(() => {
    if (providerStatus === 'rejected' && showRejectedBanner) {
      const timer = setTimeout(() => setShowRejectedBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [providerStatus, showRejectedBanner]);

  useEffect(() => {
    if (providerStatus === 'pending' && showPendingBanner) {
      const timer = setTimeout(() => setShowPendingBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [providerStatus, showPendingBanner]);

  useEffect(() => {
    if (providerStatus === 'approved' && showApprovedBanner) {
      const timer = setTimeout(() => setShowApprovedBanner(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [providerStatus, showApprovedBanner]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  if (user.role !== "provider") {
    return <Navigate to="/dashboard/user" />;
  }

  const isRejected = providerStatus === 'rejected';
  const isPending = providerStatus === 'pending';
  const isApproved = providerStatus === 'approved';

  // Create enriched user data for display
  const enrichedUser = {
    ...user,
    title: "Service Provider",
    rating: "4.6",
    avatar: profileData?.avatar_url,
    phone: profileData?.phone,
    bio: profileData?.bio,
    city: profileData?.city,
    experience_years: profileData?.experience_years
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        
        {/* REJECTED STATUS BANNER - Auto dismiss after 5 seconds */}
        {isRejected && showRejectedBanner && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm relative animate-in slide-in-from-top duration-300">
            <button
              onClick={() => setShowRejectedBanner(false)}
              className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-4 pr-8">
              <div className="flex-shrink-0">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800">Account Rejected</h3>
                <p className="text-red-700 mt-1">
                  {rejectionReason || "Your provider application has been rejected."}
                </p>
                <div className="mt-4 flex gap-3">
                  <Link
                    to="/provider/profile"
                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Update Information & Resubmit
                  </Link>
                  <Link
                    to="/contact-support"
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PENDING VERIFICATION BANNER - Auto dismiss after 5 seconds */}
        {isPending && showPendingBanner && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-5 shadow-sm relative animate-in slide-in-from-top duration-300">
            <button
              onClick={() => setShowPendingBanner(false)}
              className="absolute top-4 right-4 text-yellow-400 hover:text-yellow-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-4 pr-8">
              <div className="flex-shrink-0">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-800">Verification Pending</h3>
                <p className="text-yellow-700 mt-1">
                  Your account is under review. This usually takes 24-48 hours. You'll be notified once verified.
                </p>
                <div className="mt-4">
                  <Link
                    to="/provider/profile"
                    className="px-4 py-2 bg-yellow-600 text-white rounded-xl text-sm font-medium hover:bg-yellow-700 transition-colors"
                  >
                    Check Status
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APPROVED BANNER - Auto dismiss after 5 seconds */}
        {isApproved && showApprovedBanner && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-2xl p-5 shadow-sm relative animate-in slide-in-from-top duration-300">
            <button
              onClick={() => setShowApprovedBanner(false)}
              className="absolute top-4 right-4 text-green-400 hover:text-green-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-start gap-4 pr-8">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-800">Account Verified!</h3>
                <p className="text-green-700 mt-1">
                  Your account has been approved. You can now accept bookings and start earning!
                </p>
              </div>
            </div>
          </div>
        )}

        <HeaderBar
          isOnline={isOnline}
          onToggle={() => setIsOnline(!isOnline)}
          user={enrichedUser}
        />

        {/* Show LIMITED content for pending/rejected providers */}
        {(isPending || isRejected) ? (
          <div className="mt-10 text-center py-16 bg-white rounded-3xl border border-gray-200">
            {isPending ? (
              <>
                <Clock className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Under Review</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  Your account is pending verification. You'll get full access once your documents are verified.
                </p>
                <Link
                  to="/provider/profile"
                  className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                >
                  Check Verification Status
                </Link>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Not Active</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                  Your provider account has been rejected. Please update your information to resubmit for review.
                </p>
                <Link
                  to="/provider/profile"
                  className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
                >
                  Update Profile
                </Link>
              </>
            )}
          </div>
        ) : (
          /* FULL Dashboard Content - Only for approved providers */
          <>
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column (8 units) */}
              <div className="lg:col-span-8 space-y-8">
                {isOnline && <NewOrderCard />}
                <StatsCards />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <CompletedOrders />
                  <ReviewsPreview />
                </div>
              </div>

              {/* Right Column (4 units) */}
              <div className="lg:col-span-4 space-y-8">
                <EarningsCard />
                <SkillsManager />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;