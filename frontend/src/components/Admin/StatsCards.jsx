import { DollarSign, Users, Briefcase, Calendar, Clock, CheckCircle } from "lucide-react";

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: "Total Revenue",
      value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Total Bookings",
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active Users",
      value: stats?.activeUsers || 0,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Active Providers",
      value: stats?.activeProviders || 0,
      icon: Briefcase,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "Pending Providers",
      value: stats?.pendingProviders || 0,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Completed Services",
      value: stats?.completedServices || 0,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {card.value}
                </p>
              </div>
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;