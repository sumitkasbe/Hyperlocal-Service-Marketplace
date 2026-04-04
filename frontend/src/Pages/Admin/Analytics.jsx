import { useState, useEffect } from "react";
import { adminAPI } from "../../api/admin";
import { TrendingUp, TrendingDown, Calendar, DollarSign } from "lucide-react";

const Analytics = () => {
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      const res = await adminAPI.getRevenue();
      setRevenue(res.data.revenue);
    } catch (error) {
      console.error("Error fetching revenue:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading analytics...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
      <p className="text-gray-500 mb-6">Platform performance metrics</p>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">₹{revenue?.total_revenue?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-500">This Month</p>
          </div>
          <p className="text-3xl font-bold text-green-600">₹{revenue?.monthly_revenue?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-500">This Week</p>
          </div>
          <p className="text-3xl font-bold text-yellow-600">₹{revenue?.weekly_revenue?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-gray-500">Today</p>
          </div>
          <p className="text-3xl font-bold text-purple-600">₹{revenue?.daily_revenue?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Growth Indicators */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Growth Indicators</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-2">Monthly Growth</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {revenue?.monthly_revenue && revenue?.total_revenue 
                  ? Math.round((revenue.monthly_revenue / revenue.total_revenue) * 100) 
                  : 0}%
              </span>
              <span className="text-sm text-green-600">of total revenue</span>
            </div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ 
                  width: `${revenue?.monthly_revenue && revenue?.total_revenue 
                    ? (revenue.monthly_revenue / revenue.total_revenue) * 100 
                    : 0}%` 
                }}
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">Weekly Contribution</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {revenue?.weekly_revenue && revenue?.monthly_revenue 
                  ? Math.round((revenue.weekly_revenue / revenue.monthly_revenue) * 100) 
                  : 0}%
              </span>
              <span className="text-sm text-blue-600">of this month</span>
            </div>
            <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full"
                style={{ 
                  width: `${revenue?.weekly_revenue && revenue?.monthly_revenue 
                    ? (revenue.weekly_revenue / revenue.monthly_revenue) * 100 
                    : 0}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;