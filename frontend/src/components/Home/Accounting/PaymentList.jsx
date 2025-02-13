/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Table, Alert, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getAllPayments } from "../../../services/accountReceivableService";
import "./styles/PaymentList.css";
import PaymentPDFModal from "./PaymentPDFModal";

/**
 * PaymentList Component
 *
 * This component displays a list of payments grouped by customer and provides:
 * - A search field to filter by customer or vehicle.
 * - A table showing payment summary per customer.
 * - An action button ("Download PDF") for each customer that opens a modal
 *   to display a PDF with payment details.
 *
 * @returns {JSX.Element} The PaymentList component.
 */
const PaymentList = () => {
  // State to store the list of payments
  const [payments, setPayments] = useState([]);
  // Loading and error states for fetching payments
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State for the search term used to filter payments
  const [searchTerm, setSearchTerm] = useState("");
  // State to control the PaymentPDF modal visibility and store the selected customer payments
  const [showPaymentPDFModal, setShowPaymentPDFModal] = useState(false);
  const [selectedCustomerPayments, setSelectedCustomerPayments] =
    useState(null);

  /**
   * useEffect Hook:
   * Fetches all payments when the component mounts.
   */
  useEffect(() => {
    fetchPayments();
  }, []);

  /**
   * fetchPayments:
   * Fetches all payments from the server.
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

  /**
   * Groups payments by customer ID.
   */
  const groupedPayments = payments.reduce((groups, payment) => {
    const customerId = payment.customer ? payment.customer.id : "unknown";
    if (!groups[customerId]) {
      groups[customerId] = [];
    }
    groups[customerId].push(payment);
    return groups;
  }, {});

  /**
   * Filters the grouped payments based on the search term.
   */
  const filteredGroupedPayments = Object.keys(groupedPayments).reduce(
    (acc, customerId) => {
      const clientPayments = groupedPayments[customerId];
      const clientName = clientPayments[0].customer?.fullName || "";
      const vehicleInfo = clientPayments[0].vehicle
        ? `${clientPayments[0].vehicle.make} ${clientPayments[0].vehicle.model} (${clientPayments[0].vehicle.year}) - ${clientPayments[0].vehicle.vin}`
        : "";
      if (
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        acc[customerId] = clientPayments;
      }
      return acc;
    },
    {}
  );

  /**
   * handleOpenPaymentPDF:
   * Opens the PaymentPDF modal for the selected customer by setting the customer payments.
   *
   * @param {string} customerId - The customer's ID.
   * @param {Array} clientPayments - The array of payments for that customer.
   */
  const handleOpenPaymentPDF = (customerId, clientPayments) => {
    setSelectedCustomerPayments(clientPayments);
    setShowPaymentPDFModal(true);
  };

  // Display loading message while data is being fetched
  if (loading) {
    return <div>Loading payments...</div>;
  }

  // Display error message if there is an error
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Payment History by Customer</h1>

      {/* Search field */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Search by customer or vehicle"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
            <tr>
              <td colSpan="7" className="text-center">
                No payments found.
              </td>
            </tr>
          ) : (
            Object.keys(filteredGroupedPayments).map((customerId) => {
              const clientPayments = filteredGroupedPayments[customerId];
              const totalPaid = clientPayments.reduce(
                (sum, payment) => sum + Number(payment.amount),
                0
              );
              const remainingBalance = clientPayments[0].remainingBalance || 0;
              const initialBalance = clientPayments[0].initialBalance || 0;
              const clientName =
                clientPayments[0].customer?.fullName || "No customer";
              const vehicleInfo = clientPayments[0].vehicle
                ? `${clientPayments[0].vehicle.make} ${clientPayments[0].vehicle.model} (${clientPayments[0].vehicle.year}) - ${clientPayments[0].vehicle.vin}`
                : "No vehicle";

              return (
                <tr key={customerId}>
                  <td>{clientName}</td>
                  <td>{vehicleInfo}</td>
                  <td>${Number(initialBalance).toFixed(2)}</td>
                  <td>${totalPaid.toFixed(2)}</td>
                  <td>${Number(remainingBalance).toFixed(2)}</td>
                  <td>{clientPayments.length}</td>
                  <td>
                    {/* "Download PDF" button: opens the PDF modal */}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        handleOpenPaymentPDF(customerId, clientPayments)
                      }
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

      {/* PaymentPDF Modal */}
      {selectedCustomerPayments && (
        <PaymentPDFModal
          show={showPaymentPDFModal}
          onHide={() => setShowPaymentPDFModal(false)}
          customerPayments={selectedCustomerPayments}
        />
      )}
    </div>
  );
};

export default PaymentList;
