import { useState, useEffect } from "react";
import { X } from "lucide-react";
import api from "../../api/axios";

const AddServiceModal = ({ onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    service_id: "",
    price: "",
    description: "",
    experience_years: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/service-categories");
      setCategories(res.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/provider-services", {
        service_id: formData.service_id,
        price: parseFloat(formData.price),
        description: formData.description,
        experience_years: parseInt(formData.experience_years) || 0,
      });
      onSuccess();
    } catch (error) {
      console.error("Error adding service:", error);
      alert(error.response?.data?.message || "Failed to add service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Add New Service</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Service Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Service Category *
            </label>
            <select
              name="service_id"
              value={formData.service_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
            >
              <option value="">Select a service</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
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
              placeholder="499"
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
              placeholder="5"
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
              placeholder="Describe your service..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition resize-none"
            />
          </div>

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
              {loading ? "Adding..." : "Add Service"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;