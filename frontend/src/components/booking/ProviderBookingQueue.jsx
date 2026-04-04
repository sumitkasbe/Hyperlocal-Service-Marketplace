import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import BookingCard from "../../components/booking/BookingCard";
import { Bell, Clock, CheckCircle, XCircle, Calendar, ChevronRight } from "lucide-react";

const ProviderBookingQueue = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [filter, setFilter] = useState('pending');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [stats, setStats] = useState({
    pending: 0,
    accepted: 0,
    completed: 0,
    rejected: 0
  });

  // Read filter from URL on component mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = params.get('status');
    if (statusParam && ['pending', 'accepted', 'completed', 'rejected', 'all'].includes(statusParam)) {
      setFilter(statusParam);
    }
  }, [location.search]);

  const fetchBookings = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await api.get("/bookings/provider/me");
      setBookings(res.data.bookings);
      setLastUpdated(new Date());
      
      // Calculate stats
      const newStats = res.data.bookings.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      }, { pending: 0, accepted: 0, completed: 0, rejected: 0 });
      
      setStats(newStats);
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

  // Auto-refresh every 15 seconds when on pending tab
  useEffect(() => {
    if (filter === 'pending') {
      const interval = setInterval(() => {
        fetchBookings(true);
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [filter]);

  // Refresh when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      fetchBookings(true);
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleAccept = async (bookingId) => {
    setActionLoading(prev => ({ ...prev, [bookingId]: 'accept' }));
    try {
      const res = await api.patch(`/bookings/${bookingId}/accept`);
      if (res.data.success) {
        await fetchBookings(true);
      }
    } catch (error) {
      console.error("Error accepting booking:", error);
      alert(error.response?.data?.message || "Failed to accept booking");
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  const handleReject = async (bookingId) => {
    setActionLoading(prev => ({ ...prev, [bookingId]: 'reject' }));
    try {
      const res = await api.patch(`/bookings/${bookingId}/reject`);
      if (res.data.success) {
        await fetchBookings(true);
      }
    } catch (error) {
      console.error("Error rejecting booking:", error);
      alert(error.response?.data?.message || "Failed to reject booking");
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  const handleComplete = async (bookingId) => {
    setActionLoading(prev => ({ ...prev, [bookingId]: 'complete' }));
    try {
      const res = await api.patch(`/bookings/${bookingId}/complete`);
      if (res.data.success) {
        await fetchBookings(true);
      }
    } catch (error) {
      console.error("Error completing booking:", error);
      alert(error.response?.data?.message || "Failed to complete booking");
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  const handleViewDetails = (bookingId) => {
    navigate(`/bookings/${bookingId}`);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    // Update URL with status parameter
    if (newFilter === 'pending') {
      navigate('/provider/queue');
    } else {
      navigate(`/provider/queue?status=${newFilter}`);
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-[#0055b8] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg text-slate-600">Loading booking queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Refresh Info */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              Booking Queue
            </h1>
            <p className="text-lg text-slate-500">
              Manage incoming service requests
            </p>
          </div>
          <div className="flex items-center gap-4">
            {refreshing && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Refreshing...</span>
              </div>
            )}
            <div className="text-xs text-slate-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <button
              onClick={() => fetchBookings(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              disabled={refreshing}
            >
              Refresh ↻
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div 
            onClick={() => handleFilterChange('pending')}
            className={`bg-white rounded-2xl border p-6 cursor-pointer transition-all hover:shadow-md ${
              filter === 'pending' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div 
            onClick={() => handleFilterChange('accepted')}
            className={`bg-white rounded-2xl border p-6 cursor-pointer transition-all hover:shadow-md ${
              filter === 'accepted' ? 'border-green-500 ring-2 ring-green-200' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Accepted</p>
                <p className="text-3xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div 
            onClick={() => handleFilterChange('completed')}
            className={`bg-white rounded-2xl border p-6 cursor-pointer transition-all hover:shadow-md ${
              filter === 'completed' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Completed</p>
                <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div 
            onClick={() => handleFilterChange('rejected')}
            className={`bg-white rounded-2xl border p-6 cursor-pointer transition-all hover:shadow-md ${
              filter === 'rejected' ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['pending', 'accepted', 'completed', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => handleFilterChange(status)}
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

        {/* Active Filter Indicator */}
        {filter !== 'pending' && (
          <div className="mb-4 text-sm text-slate-500 flex items-center gap-2">
            <span>Showing: <span className="font-medium text-slate-700">{filter} bookings</span></span>
            <button 
              onClick={() => handleFilterChange('pending')}
              className="text-blue-600 hover:underline text-xs"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No {filter} bookings</h3>
            <p className="text-slate-500">There are no {filter} bookings to show</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{booking.service_name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'accepted' ? 'bg-green-100 text-green-700' :
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 mb-2">
                      Customer: <span className="font-medium">{booking.user_name}</span>
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(booking.booking_date || booking.created_at).toLocaleDateString()}</span>
                      </div>
                      {booking.booking_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{booking.booking_time}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 font-bold text-slate-900">
                        ₹{booking.price}
                      </div>
                    </div>

                    {booking.address && (
                      <p className="text-sm text-slate-500 mt-2">
                        📍 {booking.address}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    {booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAccept(booking.id)}
                          disabled={actionLoading[booking.id]}
                          className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] flex items-center justify-center"
                        >
                          {actionLoading[booking.id] === 'accept' ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            'Accept'
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(booking.id)}
                          disabled={actionLoading[booking.id]}
                          className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] flex items-center justify-center"
                        >
                          {actionLoading[booking.id] === 'reject' ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            'Reject'
                          )}
                        </button>
                      </>
                    )}

                    {booking.status === 'accepted' && (
                      <button
                        onClick={() => handleComplete(booking.id)}
                        disabled={actionLoading[booking.id]}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[90px] flex items-center justify-center"
                      >
                        {actionLoading[booking.id] === 'complete' ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          'Complete'
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => handleViewDetails(booking.id)}
                      className="p-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                      title="View Details"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderBookingQueue;