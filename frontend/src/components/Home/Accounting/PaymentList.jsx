/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Table, Input, Alert, Button } from "antd";
import { getAllPayments } from "../../../services/accountReceivableService";
import PaymentPDFModal from "./PaymentPDFModal";

/**
 * PaymentList Component
 *
 * This component displays a list of payments grouped by account (using the estimate ID).
 * It provides:
 * - A search field to filter by customer or vehicle.
 * - A table summarizing the payments for each account.
 * - A "Download PDF" button for each account that opens a modal showing PDF details.
 */
const PaymentList = () => {
  // Setting state for payment data, loading status, error messages, search term,
  // modal visibility, and selected account payments.
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentPDFModal, setShowPaymentPDFModal] = useState(false);
  const [selectedAccountPayments, setSelectedAccountPayments] = useState(null);

  // useEffect hook to fetch payments when the component mounts.
  useEffect(() => {
    fetchPayments();
  }, []); // Empty dependency array means this runs once after first render

  /**
   * fetchPayments:
   * Fetches all payment records from the server.
   */
  const fetchPayments = async () => {
    try {
      const data = await getAllPayments();
      console.log("Payments loaded:", data);
      setPayments(data);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.message || "Error fetching payments");
    } finally {
      setLoading(false);
    }
  };

  // Group payments by the account (using the estimate.id property).
  const groupedPayments = payments.reduce((groups, payment) => {
    // Determine account ID or use 'unknown' if not available.
    const accountId = payment.estimate?.id || "unknown";
    if (!groups[accountId]) {
      groups[accountId] = [];
    }
    groups[accountId].push(payment);
    return groups;
  }, {});

  // Filter grouped payments based on search term matching customer name or vehicle info.
  const filteredGroupedPayments = Object.keys(groupedPayments).reduce(
    (acc, accountId) => {
      const accountPayments = groupedPayments[accountId];
      const clientName = accountPayments[0].customer?.fullName || "";
      const vehicleInfo = accountPayments[0].vehicle
        ? `${accountPayments[0].vehicle.make} ${accountPayments[0].vehicle.model} (${accountPayments[0].vehicle.year}) - ${accountPayments[0].vehicle.vin}`
        : "";
      // Check if client name or vehicle info includes the search term (case insensitive)
      if (
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        acc[accountId] = accountPayments;
      }
      return acc;
    },
    {}
  );

  // Nuevo dataSource para Antd Table
  const dataSource = Object.keys(filteredGroupedPayments).map((accountId) => {
    const accountPayments = filteredGroupedPayments[accountId];
    const totalPaid = accountPayments.reduce((s, p) => s + Number(p.amount), 0);
    const initialBalance = accountPayments[0].initialBalance || 0;
    const remainingBalance = accountPayments[0].remainingBalance || 0;
    const clientName = accountPayments[0].customer?.fullName || "No customer";
    const vehicleInfo = accountPayments[0].vehicle
      ? `${accountPayments[0].vehicle.make} ${accountPayments[0].vehicle.model} (${accountPayments[0].vehicle.year}) - ${accountPayments[0].vehicle.vin}`
      : "No vehicle";
    return {
      key: accountId,
      customer: clientName,
      vehicle: vehicleInfo,
      initialBalance: initialBalance.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      remainingBalance: remainingBalance.toFixed(2),
      paymentsCount: accountPayments.length,
      accountPayments,
    };
  });

  // Columnas Antd
  const columns = [
    { title: "Customer", dataIndex: "customer", key: "customer" },
    { title: "Vehicle", dataIndex: "vehicle", key: "vehicle" },
    {
      title: "Initial Balance",
      dataIndex: "initialBalance",
      key: "initialBalance",
      render: (v) => `$${v}`,
    },
    {
      title: "Total Paid",
      dataIndex: "totalPaid",
      key: "totalPaid",
      render: (v) => `$${v}`,
    },
    {
      title: "Remaining Balance",
      dataIndex: "remainingBalance",
      key: "remainingBalance",
      render: (v) => `$${v}`,
    },
    { title: "Number of Payments", dataIndex: "paymentsCount", key: "paymentsCount" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleOpenPaymentPDF(record.key, record.accountPayments)}
        >
          Download PDF
        </Button>
      ),
    },
  ];

  /**
   * handleOpenPaymentPDF:
   * Opens the PDF modal and sets the payment data for the selected account.
   *
   * @param {string} accountId - The unique account ID (estimate.id).
   * @param {Array} accountPayments - The list of payments for that account.
   */
  const handleOpenPaymentPDF = (accountId, accountPayments) => {
    setSelectedAccountPayments(accountPayments); // Store selected account's payments
    setShowPaymentPDFModal(true); // Open the PDF modal
  };

  // Render a loading state if data is still being fetched
  if (loading) {
    return <div>Loading payments...</div>; // Display loading indicator
  }

  // Render an error message if fetching failed
  if (error) {
    return <Alert message={error} type="error" showIcon />;
  }

  return (
    <div className="container-fluid w-100 py-5">
      <h1 className="mb-4">Payment History by Account</h1>

      {/* Search field to filter payments by customer or vehicle */}
      <div className="mb-3">
        <Input
          placeholder="Search by customer or vehicle"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: "No payments found." }}
      />

      {/* Conditionally render the Payment PDF Modal if payments are selected */}
      {selectedAccountPayments && (
        <PaymentPDFModal
          show={showPaymentPDFModal} // Controls modal visibility
          onHide={() => setShowPaymentPDFModal(false)} // Function to hide the modal
          customerPayments={selectedAccountPayments} // Payment data for the selected account
        />
      )}
    </div>
  );
};

export default PaymentList;
