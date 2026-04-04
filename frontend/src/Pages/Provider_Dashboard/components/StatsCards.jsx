import { useState, useEffect } from "react";
import { ClipboardList, CheckCircle, Activity } from "lucide-react";
import api from "../../../api/axios";

const StatsCards = () => {
  const [stats, setStats] = useState({
    pending: 0,
    completed: 0,
    accepted: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/bookings/provider/me");
      const bookings = res.data.bookings;
      
      setStats({
        pending: bookings.filter(b => b.status === 'pending').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        accepted: bookings.filter(b => b.status === 'accepted').length
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Pending Services",
      value: stats.pending,
      icon: ClipboardList,
      color: "text-orange-500",
      bg: "bg-orange-50",
      shadow: "shadow-[0_20px_50px_rgba(249,115,22,0.2)]",
    },
    {
      title: "Active Orders",
      value: stats.accepted,
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-50",
      shadow: "shadow-[0_20px_50px_rgba(37,99,235,0.2)]",
    },
    {
      title: "Completed Services",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      shadow: "shadow-[0_20px_50px_rgba(16,185,129,0.2)]",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-[32px] p-8 border border-slate-100 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-slate-200 rounded"></div>
                <div className="h-8 w-16 bg-slate-300 rounded"></div>
              </div>
              <div className="w-14 h-14 bg-slate-200 rounded-[20px]"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="group relative bg-white rounded-[32px] p-8 border border-slate-100 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Colorful Shadow Layer */}
            <div
              className={`absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${item.shadow} pointer-events-none`}
            />

            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">
                  {item.title}
                </p>
                <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">
                  {item.value}
                </h3>
              </div>

              {/* Icon Container with Rotation Animation */}
              <div
                className={`w-14 h-14 rounded-[20px] flex items-center justify-center ${item.bg} ${item.color} transition-transform duration-500 group-hover:rotate-12`}
              >
                <Icon className="w-7 h-7" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;