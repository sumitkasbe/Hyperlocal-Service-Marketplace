import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import BookingCard from "../../components/booking/BookingCard";
import ReviewForm from "../../Review/ReviewForm";
import { Calendar, Clock, CheckCircle, XCircle, ArrowLeft, Star } from "lucide-react";

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await api.get("/bookings/user/me");
      const bookingsData = res.data.bookings;
      
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
      
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Auto-refresh every 30 seconds when on pending/accepted tabs
  useEffect(() => {
    if (filter === 'pending' || filter === 'accepted') {
      const interval = setInterval(() => {
        fetchBookings(true);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [filter]);

  const handleCancel = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      fetchBookings(true);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const handleReviewClick = (booking) => {
    setSelectedBooking(booking);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    // Refresh bookings to update review status
    fetchBookings(true);
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  const stats = {
    pending: bookings.filter(b => b.status === 'pending').length,
    accepted: bookings.filter(b => b.status === 'accepted').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    reviewed: bookings.filter(b => b.has_review).length,
    cancelled: bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length
  };

  const handleGoBack = () => {
    navigate('/dashboard/user');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#0055b8] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg text-slate-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>

          {/* Header with Refresh Indicator */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                My Bookings
              </h1>
              <p className="text-lg text-slate-500">
                Track and manage your service bookings
              </p>
            </div>
            {refreshing && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Refreshing...</span>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Accepted</p>
                  <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Reviewed</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.reviewed}</p>
                </div>
                <Star className="w-8 h-8 text-purple-500 fill-purple-500" />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {['all', 'pending', 'accepted', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === status
                    ? 'bg-[#0055b8] text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No bookings found</h3>
              <p className="text-slate-500 mb-6">
                {filter === 'all' 
                  ? "You haven't made any bookings yet" 
                  : `No ${filter} bookings found`}
              </p>
              <button
                onClick={() => navigate('/services')}
                className="px-6 py-3 bg-[#0055b8] text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Browse Services
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map(booking => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  type="user"
                  onCancel={handleCancel}
                  onReview={handleReviewClick}
                />
              ))}
            </div>
          )}
        </div>
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

export default MyBookings;