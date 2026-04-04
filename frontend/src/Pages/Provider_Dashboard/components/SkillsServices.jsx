import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import api from "../../../api/axios";
import AddServiceModal from "../../Services/AddServiceModal";
import EditServiceModal from "../../Services/EditServiceModal";

const SkillsServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchMyServices();
  }, []);

  const fetchMyServices = async () => {
    try {
      const res = await api.get("/provider-services/my-services");
      setServices(res.data.services);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId) => {
    if (!confirm("Are you sure you want to remove this service?")) return;
    
    try {
      await api.delete(`/provider-services/${serviceId}`);
      // Refresh list after delete
      fetchMyServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service");
    }
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Skills & Services</h3>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Service
          </button>
        </div>

        {/* Services List */}
        {services.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl">
            <p className="text-slate-500">No services added yet</p>
            <p className="text-sm text-slate-400 mt-1">
              Click "Add Service" to start offering your skills
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between bg-slate-50 p-4 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{service.service_name}</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    ₹{service.price} • {service.experience_years} years exp.
                  </p>
                  {service.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      {service.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Helper text */}
        <p className="text-sm text-slate-500 mt-6">
          Add or edit services you provide. Customers will see these on your profile.
        </p>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddServiceModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchMyServices();
          }}
        />
      )}

      {showEditModal && selectedService && (
        <EditServiceModal
          service={selectedService}
          onClose={() => {
            setShowEditModal(false);
            setSelectedService(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedService(null);
            fetchMyServices();
          }}
        />
      )}
    </>
  );
};

export default SkillsServices;