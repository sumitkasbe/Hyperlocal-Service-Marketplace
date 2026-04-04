import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { getUser } from "../../Utils/auth";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock as PendingIcon,
  Star,
} from "lucide-react";

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const user = getUser();

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      // You'll need to create this GET endpoint in your backend
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      if (error.response?.status === 404) {
        navigate("/bookings");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (action) => {
    setActionLoading(true);
    try {
      const endpoint = `/bookings/${id}/${action}`;
      const res = await api.patch(endpoint);

      if (res.data.success) {
        // Refresh booking details
        fetchBookingDetails();
      }
    } catch (error) {
      console.error(`Error ${action} booking:`, error);
      alert(error.response?.data?.message || `Failed to ${action} booking`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <PendingIcon className="w-5 h-5 text-yellow-500" />;
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "accepted":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "Not specified";
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#0055b8] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg text-slate-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-slate-500">Booking not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2 bg-[#0055b8] text-white rounded-xl hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isUser = user?.role === "user";
  const isProvider = user?.role === "provider";
  const canCancel = isUser && ["pending", "accepted"].includes(booking.status);
  const canAccept = isProvider && booking.status === "pending";
  const canReject = isProvider && booking.status === "pending";
  const canComplete = isProvider && booking.status === "accepted";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Bookings</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0055b8] to-blue-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Booking Details</h1>
              <div
                className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${getStatusColor(booking.status)}`}
              >
                {getStatusIcon(booking.status)}
                <span>
                  {booking.status.charAt(0).toUpperCase() +
                    booking.status.slice(1)}
                </span>
              </div>
            </div>
            <p className="text-blue-100 mt-1">
              Booking ID: {booking.id?.substring(0, 8)}...
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Service Info */}
            <div className="bg-slate-50 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Service Details
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {booking.title?.charAt(0) || "S"}
                  </span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    {booking.title}
                  </h3>
                  <p className="text-slate-500">by {booking.provider_name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl font-bold text-[#0055b8]">
                      ₹{booking.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Customer Info */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Customer Information
                </h2>
                <div className="space-y-3">
                  <p className="text-slate-700">
                    <span className="font-medium">Name:</span>{" "}
                    {booking.user_name}
                  </p>
                  <p className="text-slate-700 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {booking.user_email}
                  </p>
                  {booking.user_phone && (
                    <p className="text-slate-700 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {booking.user_phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Schedule Info */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Schedule
                </h2>
                <div className="space-y-3">
                  <p className="text-slate-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {formatDate(booking.booking_date || booking.created_at)}
                  </p>
                  <p className="text-slate-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {formatTime(booking.booking_time)}
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            {booking.address && (
              <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Service Address
                </h2>
                <p className="text-slate-700">{booking.address}</p>
              </div>
            )}

            {/* Notes */}
            {booking.notes && (
              <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-bold text-slate-900 mb-2">
                  Additional Notes
                </h2>
                <p className="text-slate-700">{booking.notes}</p>
              </div>
            )}

            {/* Price Summary */}
            <div className="bg-slate-50 rounded-2xl p-6 mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Price Summary
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Service Price</span>
                  <span>₹{booking.price}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Fee</span>
                  <span>₹20</span>
                </div>
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Total</span>
                    <span>₹{parseFloat(booking.price) + 20}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              {canCancel && (
                <button
                  onClick={() => handleStatusUpdate("cancel")}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Cancel Booking
                </button>
              )}

              {canAccept && (
                <button
                  onClick={() => handleStatusUpdate("accept")}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Accept Booking
                </button>
              )}

              {canReject && (
                <button
                  onClick={() => handleStatusUpdate("reject")}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Reject Booking
                </button>
              )}

              {canComplete && (
                <button
                  onClick={() => handleStatusUpdate("complete")}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;  