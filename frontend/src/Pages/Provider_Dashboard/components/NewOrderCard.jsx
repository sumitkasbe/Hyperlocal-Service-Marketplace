import React, { useLayoutEffect, useRef, useState, useEffect } from "react";
import { MapPin, Clock, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import api from "../../../api/axios";

const NewOrderCard = () => {
  const navigate = useNavigate();
  const borderRef = useRef(null);
  const [latestOrder, setLatestOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    // Only run animation if borderRef.current exists
    if (borderRef.current) {
      gsap.to(borderRef.current, {
        backgroundPosition: "200% center",
        duration: 4,
        repeat: -1,
        ease: "none",
      });
    }

    // Cleanup function to kill animation when component unmounts
    return () => {
      if (borderRef.current) {
        gsap.killTweensOf(borderRef.current);
      }
    };
  }, [latestOrder]); // Re-run animation when latestOrder changes (ref might be reattached)

  useEffect(() => {
    fetchLatestOrder();
  }, []);

  const fetchLatestOrder = async () => {
    try {
      const res = await api.get("/bookings/provider/me?status=pending");
      if (res.data.bookings && res.data.bookings.length > 0) {
        // Get the most recent pending booking
        const sorted = res.data.bookings.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setLatestOrder(sorted[0]);
      }
    } catch (error) {
      console.error("Error fetching latest order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!latestOrder) return;
    try {
      await api.patch(`/bookings/${latestOrder.id}/accept`);
      // Refresh after accept
      fetchLatestOrder();
    } catch (error) {
      console.error("Error accepting order:", error);
    }
  };

  const handleReject = async () => {
    if (!latestOrder) return;
    try {
      await api.patch(`/bookings/${latestOrder.id}/reject`);
      // Refresh after reject
      fetchLatestOrder();
    } catch (error) {
      console.error("Error rejecting order:", error);
    }
  };

  const formatAddress = (address) => {
    if (!address) return "Address not provided";
    return address.length > 30 ? address.substring(0, 30) + "..." : address;
  };

  const formatTime = (date, time) => {
    if (!date) return "Schedule not set";
    const bookingDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (bookingDate.toDateString() === today.toDateString()) {
      return `Today • ${time || "Time TBD"}`;
    } else if (bookingDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow • ${time || "Time TBD"}`;
    } else {
      return bookingDate.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short' 
      }) + ` • ${time || "Time TBD"}`;
    }
  };

  if (loading) {
    return (
      <div className="relative p-[2px] rounded-[34px] overflow-hidden shadow-xl bg-white">
        <div className="bg-white rounded-[32px] p-8 flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!latestOrder) {
    return (
      <div className="relative p-[2px] rounded-[34px] overflow-hidden shadow-xl">
        <div
          ref={borderRef}
          className="absolute inset-0 w-[400%] h-full"
          style={{
            background: "linear-gradient(90deg, #94a3b8, #cbd5e1, #94a3b8)",
            backgroundSize: "25% 100%",
          }}
        />
        <div className="relative z-10 bg-white rounded-[32px] p-8 text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No Pending Orders</h3>
          <p className="text-slate-500">You're all caught up! New orders will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative p-[2px] rounded-[34px] overflow-hidden shadow-xl">
      <div
        ref={borderRef}
        className="absolute inset-0 w-[400%] h-full"
        style={{
          background: "linear-gradient(90deg, #f97316, #fbbf24, #f97316)",
          backgroundSize: "25% 100%",
        }}
      />

      <div className="relative z-10 bg-white rounded-[32px] p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <span className="bg-orange-100 text-orange-600 text-xs font-black uppercase px-3 py-1 rounded-full tracking-widest">
              Immediate Request
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-3 tracking-tight">
              {latestOrder.service_name || "Service Request"}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase">
              Estimated
            </p>
            <p className="text-2xl font-black text-blue-600">
              ₹{parseFloat(latestOrder.price).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-y border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <MapPin size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400">LOCATION</p>
              <p className="text-sm font-bold">{formatAddress(latestOrder.address)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400">SCHEDULE</p>
              <p className="text-sm font-bold">
                {formatTime(latestOrder.booking_date, latestOrder.booking_time)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
              <Phone size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400">CUSTOMER</p>
              <p className="text-sm font-bold">{latestOrder.user_name || "Customer"}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button 
            onClick={handleAccept}
            className="flex-1 py-4 rounded-2xl font-bold text-white bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all active:scale-95"
          >
            Accept Order
          </button>
          <button 
            onClick={handleReject}
            className="flex-1 py-4 rounded-2xl font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewOrderCard;