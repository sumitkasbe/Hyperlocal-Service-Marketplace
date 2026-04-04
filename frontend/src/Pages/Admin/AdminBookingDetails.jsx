import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminAPI } from "../../api/admin";
import { ArrowLeft, Calendar, Clock, MapPin, User, Phone, Mail, CreditCard } from "lucide-react";

const AdminBookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      const res = await adminAPI.getBookingDetails(id);
      setBooking(res.data.booking);
    } catch (error) {
      console.error("Error fetching booking details:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "accepted": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Booking not found</p>
        <button
          onClick={() => navigate("/admin/bookings")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={() => navigate("/admin/bookings")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Bookings</span>
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Booking Details</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{booking.service_name}</h2>
              <p className="text-sm text-gray-500 mt-1">Booking ID: {booking.id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
              {booking.status?.toUpperCase()}
            </span>
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium">{new Date(booking.booking_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="font-medium">{booking.booking_time || "Not specified"}</p>
              </div>
            </div>
          </div>

          {/* Address */}
          {booking.address && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <p className="text-sm font-medium text-gray-700">Service Address</p>
              </div>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{booking.address}</p>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">Additional Notes</p>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Customer & Provider Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              Customer Details
            </h3>
            <div className="space-y-3">
              <p className="text-gray-700">
                <span className="font-medium">Name:</span> {booking.user_name}
              </p>
              <p className="text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {booking.user_email}
              </p>
              {booking.user_phone && (
                <p className="text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {booking.user_phone}
                </p>
              )}
            </div>
          </div>

          {/* Provider Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              Provider Details
            </h3>
            <div className="space-y-3">
              <p className="text-gray-700">
                <span className="font-medium">Name:</span> {booking.provider_name}
              </p>
              <p className="text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                {booking.provider_email}
              </p>
              {booking.provider_phone && (
                <p className="text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {booking.provider_phone}
                </p>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-500" />
              Payment Details
            </h3>
            <div className="space-y-3">
              <p className="text-gray-700">
                <span className="font-medium">Amount:</span> ₹{booking.price}
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Payment Status:</span>{' '}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  booking.payment_status === 'PAID' || booking.payment_status === 'COMPLETED' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {booking.payment_status || "PENDING"}
                </span>
              </p>
              <p className="text-gray-700">
                <span className="font-medium">Booking Date:</span> {new Date(booking.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookingDetails;