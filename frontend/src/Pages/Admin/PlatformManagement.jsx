import { useState, useEffect } from "react";
import { adminAPI } from "../../api/admin";
import Table from "../../components/Admin/Table";
import Modal from "../../components/Admin/Modal";
import { Plus, Trash2 } from "lucide-react";
    
const PlatformManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", icon: "", category: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await adminAPI.getCategories();
      setCategories(res.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!formData.name) {
      alert("Category name is required");
      return;
    }
    try {
      await adminAPI.addCategory(formData);
      setIsModalOpen(false);
      setFormData({ name: "", description: "", icon: "", category: "" });
      fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      alert(error.response?.data?.message || "Failed to add category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await adminAPI.deleteCategory(id);
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert(error.response?.data?.message || "Failed to delete category");
      }
    }
  };

  const columns = [
    { key: "name", label: "Category Name" },
    { key: "description", label: "Description", render: (value) => value || "-" },
    { key: "category", label: "Group", render: (value) => value || "General" },
    {
      key: "actions",
      label: "Actions",
      render: (_, category) => (
        <button
          onClick={() => handleDeleteCategory(category.id)}
          className="p-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
      )
    }
  ];

  if (loading) {
    return <div className="text-center py-10">Loading categories...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Service Categories</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <Table data={categories} columns={columns} />

      {/* Add Category Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Service Category"
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              placeholder="e.g., Plumbing"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              placeholder="Describe the service category..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon Name</label>
            <input
              type="text"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              placeholder="e.g., Wrench, Zap, Droplets"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              placeholder="e.g., Electrical, Plumbing"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleAddCategory}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Category
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PlatformManagement;