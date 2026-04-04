import { CalendarDays, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import BookingCard from "../../../components/booking/BookingCard";
import ReviewForm from "../../../Review/ReviewForm";

const RecentBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchRecentBookings = async () => {
    try {
      const res = await api.get("/bookings/user/me");
      const bookingsData = res.data.bookings || [];
      
      // Check which completed bookings have reviews
      const completedBookings = bookingsData.filter(b => b.status === 'completed');
      
      if (completedBookings.length > 0) {
        // Fetch review status for each completed booking
        const reviewPromises = completedBookings.map(booking =>
          api.get(`/reviews/booking/${booking.id}`).catch(() => ({ data: { hasReview: false } }))
        );
        
        const reviewResults = await Promise.all(reviewPromises);
        
        // Add has_review flag to each booking
        reviewResults.forEach((result, index) => {
          const bookingIndex = bookingsData.findIndex(b => b.id === completedBookings[index].id);
          if (bookingIndex !== -1) {
            bookingsData[bookingIndex].has_review = result.data?.hasReview || false;
          }
        });
      }
      
      // Get only first 3 most recent
      setBookings(bookingsData.slice(0, 3));
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentBookings();
  }, []);

  const handleViewHistory = () => {
    navigate("/my-bookings");
  };

  const handleReviewClick = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    // Refresh bookings to update review status
    fetchRecentBookings();
  };

  return (
    <>
      <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Recent Bookings
          </h2>
          <button 
            onClick={handleViewHistory}
            className="text-[#0055b8] font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all"
          >
            View History <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard 
                key={booking.id} 
                booking={booking} 
                type="user"
                onReview={handleReviewClick}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <CalendarDays className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No bookings yet</h3>
            <p className="text-slate-500 mt-1 max-w-xs">
              When you book a service, it will appear here for you to track and manage.
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <ReviewForm
          booking={selectedBooking}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedBooking(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  );
};

export default RecentBookings;