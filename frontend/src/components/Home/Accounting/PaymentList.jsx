/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react"; // Importing React and its hooks
import { Table, Alert, Button } from "react-bootstrap"; // Importing components from react-bootstrap
import { Link } from "react-router-dom"; // Importing Link for routing (unused in this file)
import { getAllPayments } from "../../../services/accountReceivableService"; // Service to fetch payments
import "./styles/PaymentList.css"; // Importing CSS styles
import PaymentPDFModal from "./PaymentPDFModal"; // Modal component to display/download PDF

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
  const [payments, setPayments] = useState([]); // Holds the list of payments
  const [loading, setLoading] = useState(true); // Indicates loading state
  const [error, setError] = useState(null); // Holds error message if data fetch fails
  const [searchTerm, setSearchTerm] = useState(""); // Stores the current search query
  const [showPaymentPDFModal, setShowPaymentPDFModal] = useState(false); // Controls PDF modal visibility
  const [selectedAccountPayments, setSelectedAccountPayments] = useState(null); // Stores payments for the selected account

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
      console.log("Payments loaded:", data); // Log fetched payments
      setPayments(data); // Save payments data into state
    } catch (err) {
      console.error("Error fetching payments:", err); // Log error if fetching fails
      setError(err.message || "Error fetching payments"); // Set error message in state
    } finally {
      setLoading(false); // End loading state regardless of outcome
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
    return <Alert variant="danger">{error}</Alert>; // Display error alert
  }

  return (
    <div className="container-fluid w-100 py-5">
      <h1 className="mb-4">Payment History by Account</h1>

      {/* Search field to filter payments by customer or vehicle */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by customer or vehicle"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)} // Update search term on input change
          className="form-control"
        />
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Initial Balance</th>
            <th>Total Paid</th>
            <th>Remaining Balance</th>
            <th>Number of Payments</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(filteredGroupedPayments).length === 0 ? (
            // If no payments match the filter, show a 'No payments found' row.
            <tr>
              <td colSpan="7" className="text-center">
                No payments found.
              </td>
            </tr>
          ) : (
            Object.keys(filteredGroupedPayments).map((accountId) => {
              const accountPayments = filteredGroupedPayments[accountId];
              // Calculate the total amount paid for the current account.
              const totalPaid = accountPayments.reduce(
                (sum, payment) => sum + Number(payment.amount),
                0
              );
              // Retrieve balance and customer/vehicle info from the first payment in the group.
              const remainingBalance = accountPayments[0].remainingBalance || 0;
              const initialBalance = accountPayments[0].initialBalance || 0;
              const clientName =
                accountPayments[0].customer?.fullName || "No customer";
              const vehicleInfo = accountPayments[0].vehicle
                ? `${accountPayments[0].vehicle.make} ${accountPayments[0].vehicle.model} (${accountPayments[0].vehicle.year}) - ${accountPayments[0].vehicle.vin}`
                : "No vehicle";

              return (
                <tr key={accountId}>
                  <td>{clientName}</td>
                  <td>{vehicleInfo}</td>
                  <td>${Number(initialBalance).toFixed(2)}</td>
                  <td>${totalPaid.toFixed(2)}</td>
                  <td>${Number(remainingBalance).toFixed(2)}</td>
                  <td>{accountPayments.length}</td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        handleOpenPaymentPDF(accountId, accountPayments)
                      } // Open PDF modal for the selected account
                    >
                      Download PDF
                    </Button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>

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
