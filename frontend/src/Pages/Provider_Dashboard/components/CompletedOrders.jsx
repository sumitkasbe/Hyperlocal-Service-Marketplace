import { useState, useEffect } from "react";
import { CheckCircle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

const CompletedOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const fetchCompletedOrders = async () => {
    try {
      const res = await api.get("/bookings/provider/me?status=completed");
      // Get only the 3 most recent completed orders
      const recentOrders = res.data.bookings
        .sort((a, b) => new Date(b.booking_date || b.created_at) - new Date(a.booking_date || a.created_at))
        .slice(0, 3);
      setOrders(recentOrders);
    } catch (error) {
      console.error("Error fetching completed orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatOrderId = (id) => {
    return "#" + id.substring(0, 8).toUpperCase();
  };

  const handleViewAll = () => {
    // Navigate to booking queue with completed filter
    navigate("/provider/queue?status=completed");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Recent Completed Orders</h3>
          <div className="h-5 w-16 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 animate-pulse">
              <div className="flex-1">
                <div className="h-4 w-32 bg-slate-200 rounded mb-2"></div>
                <div className="h-3 w-24 bg-slate-200 rounded"></div>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 w-12 bg-slate-200 rounded"></div>
                <div className="w-5 h-5 bg-slate-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">
          Recent Completed Orders
        </h3>

        {orders.length > 0 && (
          <button 
            onClick={handleViewAll}
            className="text-sm text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium">No completed orders yet</p>
          <p className="text-sm text-slate-400 mt-1">
            Your completed services will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={() => navigate(`/bookings/${order.id}`)}
            >
              {/* Left */}
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {order.service_name || "Service"}
                </p>
                <p className="text-xs text-slate-500">
                  {formatOrderId(order.id)} • {formatDate(order.booking_date || order.created_at)}
                </p>
                {order.user_name && (
                  <p className="text-xs text-slate-400 mt-1">
                    Customer: {order.user_name}
                  </p>
                )}
              </div>

              {/* Right */}
              <div className="flex items-center gap-4">
                <p className="text-sm font-bold text-slate-900">
                  ₹{parseFloat(order.price).toFixed(2)}
                </p>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All Link at Bottom (if no orders shown) */}
      {orders.length === 0 && (
        <div className="text-center mt-6">
          <button
            onClick={handleViewAll}
            className="text-sm text-blue-600 font-semibold hover:text-blue-700"
          >
            Go to Booking Queue
          </button>
        </div>
      )}
    </div>
  );
};

export default CompletedOrders;