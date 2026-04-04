import { useState, useEffect } from "react";
import { adminAPI } from "../../api/admin";
import Table from "../../components/Admin/Table";
import Modal from "../../components/Admin/Modal"; 
import { Eye } from "lucide-react";

const PaymentTransactions = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totals, setTotals] = useState({
    totalRevenue: 0,
    completedAmount: 0,
    pendingAmount: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await adminAPI.getPayments();
      const paymentsData = res.data.payments || [];
      setPayments(paymentsData);
      
      // Calculate totals safely
      let totalRevenue = 0;
      let completedAmount = 0;
      let pendingAmount = 0;
      
      paymentsData.forEach(payment => {
        const amount = parseFloat(payment.amount) || 0;
        totalRevenue += amount;
        
        const status = payment.payment_status?.toUpperCase();
        if (status === "COMPLETED" || status === "PAID") {
          completedAmount += amount;
        } else if (status === "PENDING") {
          pendingAmount += amount;
        }
      });
      
      setTotals({
        totalRevenue,
        completedAmount,
        pendingAmount
      });
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusColor = (status) => {
    const upperStatus = status?.toUpperCase();
    switch (upperStatus) {
      case "COMPLETED":
      case "PAID":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "FAILED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatAmount = (amount) => {
    return `₹${parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const columns = [
    { key: "service_name", label: "Service" },
    { key: "user_name", label: "Customer" },
    { key: "provider_name", label: "Provider" },
    { key: "amount", label: "Amount", render: (value) => formatAmount(value) },
    {
      key: "payment_status",
      label: "Status",
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(value)}`}>
          {value || "PENDING"}
        </span>
      )
    },
    {
      key: "created_at",
      label: "Date",
      render: (value) => value ? new Date(value).toLocaleDateString("en-IN") : "-"
    },
    {
      key: "actions",
      label: "",
      render: (_, payment) => (
        <button
          onClick={() => {
            setSelectedPayment(payment);
            setIsModalOpen(true);
          }}
          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Eye size={18} />
        </button>
      )
    }
  ];

  if (loading) {
    return <div className="text-center py-10">Loading payments...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Transactions</h1>
      <p className="text-gray-500 mb-6">View all payment transactions</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatAmount(totals.totalRevenue)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {formatAmount(totals.completedAmount)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {formatAmount(totals.pendingAmount)}
          </p>
        </div>
      </div>

      {payments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No payment transactions found</p>
        </div>
      ) : (
        <Table data={payments} columns={columns} />
      )}

      {/* Payment Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Payment Details"
        maxWidth="sm"
      >
        {selectedPayment && (
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-mono text-sm">{selectedPayment.id?.substring(0, 8) || '-'}...</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Booking ID</span>
              <span className="font-mono text-sm">{selectedPayment.booking_id?.substring(0, 8) || '-'}...</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Service</span>
              <span className="font-medium">{selectedPayment.service_name || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Customer</span>
              <span>{selectedPayment.user_name || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Provider</span>
              <span>{selectedPayment.provider_name || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Amount</span>
              <span className="font-bold">{formatAmount(selectedPayment.amount)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Status</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedPayment.payment_status)}`}>
                {selectedPayment.payment_status || "PENDING"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Date</span>
              <span>{selectedPayment.created_at ? new Date(selectedPayment.created_at).toLocaleString() : '-'}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentTransactions;