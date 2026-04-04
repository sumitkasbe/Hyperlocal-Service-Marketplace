import { useState, useEffect } from "react";
import { adminAPI } from "../../api/admin";
import Table from "../../components/Admin/Table";
import Modal from "../../components/Admin/Modal";
import { CheckCircle, AlertCircle } from "lucide-react";

const ComplaintHandling = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await adminAPI.getComplaints();
      setComplaints(res.data.complaints || []);
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (complaint) => {
    try {
      await adminAPI.resolveComplaint(complaint.id);
      fetchComplaints();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error resolving complaint:", error);
      alert("Failed to resolve complaint");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "resolved": return "bg-green-100 text-green-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const columns = [
    { key: "user_name", label: "Customer" },
    { key: "service_name", label: "Service" },
    { key: "provider_name", label: "Provider" },
    { key: "complaint", label: "Complaint", render: (value) => value?.substring(0, 50) + (value?.length > 50 ? "..." : "") },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value || "pending"}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, complaint) => (
        complaint.status !== "resolved" && (
          <button
            onClick={() => {
              setSelectedComplaint(complaint);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
          >
            <CheckCircle size={14} />
            Resolve
          </button>
        )
      )
    }
  ];

  if (loading) {
    return <div className="text-center py-10">Loading complaints...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Complaint Handling</h1>
      <p className="text-gray-500 mb-6">Review and resolve customer complaints</p>

      <Table data={complaints} columns={columns} />

      {/* Resolve Complaint Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Resolve Complaint"
        maxWidth="md"
      >
        {selectedComplaint && (
          <>
            <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Complaint Details</p>
                  <p className="text-sm text-yellow-700 mt-1">{selectedComplaint.complaint}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>Customer:</strong> {selectedComplaint.user_name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Service:</strong> {selectedComplaint.service_name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Provider:</strong> {selectedComplaint.provider_name}
              </p>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleResolve(selectedComplaint)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Mark as Resolved
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ComplaintHandling;