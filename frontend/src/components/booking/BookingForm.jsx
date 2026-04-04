import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../api/axios";
import { Calendar, Clock, MapPin, FileText, ArrowLeft } from "lucide-react";
import { useToast } from "../../context/ToastContext";

const BookingForm = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { provider, service } = location.state || {};

  const [formData, setFormData] = useState({
    booking_date: "",
    booking_time: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  if (!provider || !service) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">No provider or service selected</p>
          <button
            onClick={() => navigate("/services")}
            className="mt-4 px-6 py-2 bg-[#0055b8] text-white rounded-xl hover:bg-blue-700"
          >
            Browse Services
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        service_id: service.id,
        provider_id: provider.id,
        booking_date: formData.booking_date || null,
        booking_time: formData.booking_time || null,
        address: formData.address || null,
        notes: formData.notes || null,
      };

      console.log("Sending booking request:", requestData);
      const res = await api.post("/bookings", requestData);
      console.log("Booking created:", res.data);

      // Show success toast
      showToast(
        `Booking confirmed for ${service.name}! Redirecting to your bookings...`,
        "success"
      );

      // Navigate to my bookings page after a short delay
      setTimeout(() => {
        navigate("/my-bookings");
      }, 1500);
    } catch (error) {
      console.error("Booking error:", error);
      const errorMessage = error.response?.data?.message || "Failed to create booking";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Providers</span>
        </button>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0055b8] to-blue-600 px-8 py-6">
            <h1 className="text-2xl font-bold text-white">Complete Your Booking</h1>
            <p className="text-blue-100 mt-1">Fill in the details to confirm</p>
          </div>

          {/* Service & Provider Summary */}
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {service.name?.charAt(0) || "S"}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">{service.name}</h2>
                <p className="text-slate-500">Provider: {provider.name}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-bold text-[#0055b8]">
                    ₹{provider.price}
                  </span>
                  <span className="text-sm text-slate-500">/session</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Date <span className="text-slate-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="date"
                  name="booking_date"
                  value={formData.booking_date}
                  onChange={handleChange}
                  min={minDate}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            {/* Time Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Time <span className="text-slate-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <select
                  name="booking_time"
                  value={formData.booking_time}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition appearance-none bg-white"
                >
                  <option value="">Select a time slot</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Service Address <span className="text-slate-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Enter your address"
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition resize-none"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Additional Notes <span className="text-slate-400 text-xs">(optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Any special instructions for the provider"
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition resize-none"
                />
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-slate-50 rounded-xl p-6 mt-6">
              <h3 className="font-bold text-slate-900 mb-4">Price Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Service Price</span>
                  <span>₹{provider.price}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Fee</span>
                  <span>₹20</span>
                </div>
                <div className="border-t border-slate-200 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Total</span>
                    <span>₹{parseFloat(provider.price) + 20}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#0055b8] text-white rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-[0.99] shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Booking...</span>
                </div>
              ) : (
                "Confirm Booking"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;