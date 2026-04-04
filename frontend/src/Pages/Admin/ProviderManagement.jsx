import { useState, useEffect } from "react";
import { adminAPI } from "../../api/admin";
import Table from "../../components/Admin/Table";
import Modal from "../../components/Admin/Modal";
import { Eye, FileText, CheckCircle, XCircle, Download } from "lucide-react";

const ProviderManagement = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [modalType, setModalType] = useState(null);
  const [viewingDocuments, setViewingDocuments] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await adminAPI.getProviders("pending");
      setProviders(res.data.providers);
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (provider) => {
    setSelectedProvider(provider);
    setModalType("approve");
    setIsModalOpen(true);
  };

  const handleReject = (provider) => {
    setSelectedProvider(provider);
    setModalType("reject");
    setIsModalOpen(true);
  };

  const handleViewDocuments = (provider) => {
    setSelectedProvider(provider);
    setViewingDocuments(true);
    setIsModalOpen(true);
  };

  const confirmApprove = async () => {
    try {
      await adminAPI.approveProvider(selectedProvider.id);
      setIsModalOpen(false);
      fetchProviders();
    } catch (error) {
      console.error("Error approving provider:", error);
      alert("Failed to approve provider");
    }
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    try {
      await adminAPI.rejectProvider(selectedProvider.id, rejectReason);
      setIsModalOpen(false);
      setRejectReason("");
      fetchProviders();
    } catch (error) {
      console.error("Error rejecting provider:", error);
      alert("Failed to reject provider");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone", render: (value) => value || "-" },
    { key: "city", label: "Location", render: (value) => value || "-" },
    {
      key: "experience_years",
      label: "Experience",
      render: (value) => (value ? `${value} years` : "-"),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}
        >
          {value || "pending"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, provider) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleViewDocuments(provider)}
            className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
            title="View Documents"
          >
            <FileText size={16} />
          </button>
          {provider.provider_status !== "approved" && (
            <>
              <button
                onClick={() => handleApprove(provider)}
                className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                title="Approve"
              >
                <CheckCircle size={16} />
              </button>
              <button
                onClick={() => handleReject(provider)}
                className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                title="Reject"
              >
                <XCircle size={16} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="text-center py-10">Loading providers...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Provider Management
      </h1>
      <p className="text-gray-500 mb-6">
        Review and manage provider registration requests
      </p>

      <Table data={providers} columns={columns} />

      {/* View Documents Modal */}
      <Modal
        isOpen={isModalOpen && viewingDocuments}
        onClose={() => {
          setIsModalOpen(false);
          setViewingDocuments(false);
        }}
        title="Provider Documents"
        maxWidth="lg"
      >
        {selectedProvider && (
          <div className="space-y-6">
            {/* Provider Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Provider Details
              </h3>
              <p className="text-sm">
                <strong>Name:</strong> {selectedProvider.name}
              </p>
              <p className="text-sm">
                <strong>Email:</strong> {selectedProvider.email}
              </p>
              <p className="text-sm">
                <strong>Phone:</strong>{" "}
                {selectedProvider.phone || "Not provided"}
              </p>
              <p className="text-sm">
                <strong>Experience:</strong>{" "}
                {selectedProvider.experience_years || 0} years
              </p>
              {selectedProvider.bio && (
                <p className="text-sm mt-2">
                  <strong>Bio:</strong> {selectedProvider.bio}
                </p>
              )}
            </div>

            {/* Documents */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText size={18} />
                Verification Documents
              </h3>

              {selectedProvider.verification_document ? (
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Document Type:{" "}
                    <strong>
                      {selectedProvider.document_type?.toUpperCase() ||
                        "ID Proof"}
                    </strong>
                  </p>
                  <a
                    href={selectedProvider.verification_document} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    <Download size={16} />
                    View/Download Document
                  </a>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" /> 
                  <p className="text-gray-500">No documents uploaded yet</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setViewingDocuments(false);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Approve/Reject Modal */}
      <Modal
        isOpen={isModalOpen && !viewingDocuments}
        onClose={() => setIsModalOpen(false)}
        title={modalType === "approve" ? "Approve Provider" : "Reject Provider"}
        maxWidth="md"
      >
        {modalType === "approve" ? (
          <>
            <p className="text-gray-600 mb-4">
              Are you sure you want to approve{" "}
              <strong>{selectedProvider?.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmApprove}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-2">
              Are you sure you want to reject{" "}
              <strong>{selectedProvider?.name}</strong>?
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              className="w-full p-3 border border-gray-200 rounded-lg mt-4 mb-4 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
              rows="3"
            />
            <div className="flex gap-3">
              <button
                onClick={confirmReject}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
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

export default ProviderManagement;
