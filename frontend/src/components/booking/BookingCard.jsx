import { Link } from "react-router-dom";
import { Calendar, ChevronRight, Star } from "lucide-react";

const BookingCard = ({ booking, type = "user", onCancel, onReview }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-700 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleReviewClick = (e) => {
    e.preventDefault(); // Prevent navigation to details page
    e.stopPropagation(); // Stop event bubbling
    if (onReview) {
      onReview(booking);
    }
  };

  const handleCancelClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onCancel) {
      onCancel(booking.id);
    }
  };

  return (
    <div className="block bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-200 group">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Left Section - Service Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <Link to={`/bookings/${booking.id}`} className="hover:underline">
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {booking.service_name || booking.title}
              </h3>
            </Link>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
            
            {/* Review Badge - Show if already reviewed */}
            {booking.has_review && (
              <span className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                <Star className="w-3 h-3 fill-purple-700" />
                Reviewed
              </span>
            )}
          </div>

          {/* Provider/User Info */}
          {type === "user" ? (
            <Link to={`/bookings/${booking.id}`} className="hover:underline">
              <p className="text-slate-600 mb-3">
                Provider: <span className="font-medium">{booking.provider_name || 'Provider'}</span>
              </p>
            </Link>
          ) : (
            <Link to={`/bookings/${booking.id}`} className="hover:underline">
              <p className="text-slate-600 mb-3">
                Customer: <span className="font-medium">{booking.user_name}</span>
              </p>
            </Link>
          )}

          {/* Date and Price Row */}
          <div className="flex items-center gap-4 text-sm">
            <Link to={`/bookings/${booking.id}`} className="flex items-center gap-1 text-slate-500 hover:text-slate-700">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(booking.booking_date || booking.created_at)}</span>
            </Link>
            <Link to={`/bookings/${booking.id}`} className="text-lg font-bold text-slate-900">
              ₹{booking.price}
            </Link>
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Review Button - Show for completed bookings that haven't been reviewed */}
          {type === "user" && booking.status === 'completed' && !booking.has_review && (
            <button
              onClick={handleReviewClick}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>Review</span>
            </button>
          )}

          {/* Cancel Button - Show for pending/accepted bookings */}
          {type === "user" && (booking.status === 'pending' || booking.status === 'accepted') && onCancel && (
            <button
              onClick={handleCancelClick}
              className="px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
            >
              Cancel
            </button>
          )}

          {/* Details Button */}
          <Link
            to={`/bookings/${booking.id}`}
            className="p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
            title="View Details"
          >
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;