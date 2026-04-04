import { useState, useEffect } from "react";
import { IndianRupee, Wallet, ArrowUpRight } from "lucide-react";
import api from "../../../api/axios";
import { getUser } from "../../../Utils/auth";

const EarningsCard = () => {
  const [earnings, setEarnings] = useState({
    total: 0,
    today: 0,
    month: 0
  });
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      // Fetch all provider bookings
      const response = await api.get("/bookings/provider/me");
      const bookings = response.data.bookings;
      
      // Filter completed bookings
      const completedBookings = bookings.filter(b => b.status === 'completed');
      
      // Calculate total earnings
      const totalEarnings = completedBookings.reduce((sum, booking) => 
        sum + parseFloat(booking.price), 0
      );

      // Calculate today's earnings
      const today = new Date().toDateString();
      const todayEarnings = completedBookings
        .filter(b => new Date(b.booking_date || b.created_at).toDateString() === today)
        .reduce((sum, booking) => sum + parseFloat(booking.price), 0);

      // Calculate this month's earnings
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthEarnings = completedBookings
        .filter(b => {
          const date = new Date(b.booking_date || b.created_at);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, booking) => sum + parseFloat(booking.price), 0);

      setEarnings({
        total: totalEarnings,
        today: todayEarnings,
        month: monthEarnings
      });
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0
    });
  };

  if (loading) {
    return (
      <div className="group relative bg-white rounded-[32px] p-8 border border-slate-100">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-8">
            <div className="w-12 h-12 bg-slate-200 rounded-2xl"></div>
            <div className="w-6 h-6 bg-slate-200 rounded"></div>
          </div>
          <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
          <div className="h-10 w-32 bg-slate-300 rounded mb-8"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-slate-200 rounded-2xl"></div>
            <div className="h-16 bg-slate-200 rounded-2xl"></div>
          </div>
          <div className="h-12 bg-slate-300 rounded-2xl mt-6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white rounded-[32px] p-8 border border-slate-100 transition-all duration-500 hover:border-emerald-200">
      {/* Dynamic Glow */}
      <div className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_20px_50px_rgba(16,185,129,0.2)] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <Wallet className="w-6 h-6 text-emerald-600" />
          </div>
          <button 
            onClick={fetchEarnings}
            className="text-slate-400 hover:text-emerald-600 transition-colors"
            title="Refresh earnings"
          >
            <ArrowUpRight className="w-6 h-6" />
          </button>
        </div>

        <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">
          Total Income
        </p>
        <h2 className="text-5xl font-extrabold text-slate-900 mt-2 flex items-center tracking-tighter">
          <span className="text-emerald-600 mr-1">₹</span>
          {formatCurrency(earnings.total)}
        </h2>

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 group-hover:bg-emerald-50/50 transition-colors">
            <p className="text-xs font-bold text-slate-400 uppercase">Today</p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              ₹{formatCurrency(earnings.today)}
            </p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 group-hover:bg-blue-50/50 transition-colors">
            <p className="text-xs font-bold text-slate-400 uppercase">
              This Month
            </p>
            <p className="text-xl font-bold text-slate-900 mt-1">
              ₹{formatCurrency(earnings.month)}
            </p>
          </div>
        </div>

        <button className="w-full mt-6 py-4 rounded-2xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]">
          Withdraw Earnings
        </button>
      </div>
    </div>
  );
};

export default EarningsCard;