import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../api/admin";
import Table from "../../components/Admin/Table";

const BookingMonitoring = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const res = await adminAPI.getBookings(filter);
      setBookings(res.data.bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "accepted": return "bg-blue-100 text-blue-700";
      case "completed": return "bg-green-100 text-green-700";
      case "cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const columns = [
    { key: "service_name", label: "Service" },
    { key: "user_name", label: "Customer" },
    { key: "provider_name", label: "Provider" },
    { key: "price", label: "Amount", render: (value) => `₹${value}` },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: "payment_status",
      label: "Payment",
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === "PAID" || value === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
        }`}>
          {value}
        </span>
      )
    }
  ];

  const handleRowClick = (booking) => {
    navigate(`/admin/bookings/${booking.id}`);
  };

  const filters = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  if (loading) {
    return <div className="text-center py-10">Loading bookings...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Booking Monitoring</h1>
      
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table Component with Row Click */}
      <Table 
        data={bookings} 
        columns={columns} 
        onRowClick={handleRowClick}
      />
    </div>
  );
};

export default BookingMonitoring;