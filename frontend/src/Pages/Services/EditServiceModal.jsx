import { useState } from "react";
import { X } from "lucide-react";
import api from "../../api/axios";

const EditServiceModal = ({ service, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    price: service.price,
    description: service.description || "",
    experience_years: service.experience_years || 0,
    is_available: service.is_available,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value, 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put(`/provider-services/${service.id}`, {
        price: parseFloat(formData.price),
        description: formData.description,
        experience_years: parseInt(formData.experience_years) || 0,
        is_available: formData.is_available,
      });
      onSuccess();
    } catch (error) {
      console.error("Error updating service:", error);
      alert(error.response?.data?.message || "Failed to update service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Edit Service</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-slate-50 p-4 rounded-xl">
            <p className="font-medium text-slate-900">{service.service_name}</p>
            <p className="text-sm text-slate-500 mt-1">Category: {service.category}</p>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Price (₹) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Experience Years */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Experience (years)
            </label>
            <input
              type="number"
              name="experience_years"
              value={formData.experience_years}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition resize-none"
            />
          </div>

          {/* Availability Toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_available"
              checked={formData.is_available}
              onChange={handleChange}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">Service is available</span>
          </label>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[#0055b8] text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditServiceModal;