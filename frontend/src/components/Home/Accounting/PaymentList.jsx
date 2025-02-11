/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Table, Alert } from "react-bootstrap";
import { getAllPayments } from "../../../services/accountReceivableService";
import { Link } from "react-router-dom";
import "./styles/PaymentList.css";

/**
 * Component for displaying a list of payments grouped by customer
 * @module PaymentList
 */
const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el buscador

  /**
   * Fetches all payments when the component mounts
   */
  useEffect(() => {
    fetchPayments();
  }, []);

  /**
   * Fetches all payments from the server
   */
  const fetchPayments = async () => {
    try {
      const data = await getAllPayments();
      console.log("Payments loaded:", data);
      setPayments(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.message || "Error fetching payments");
      setLoading(false);
    }
  };

  /**
   * Groups payments by customer ID
   */
  const groupedPayments = payments.reduce((groups, payment) => {
    const customerId = payment.customer ? payment.customer.id : "unknown";
    if (!groups[customerId]) {
      groups[customerId] = [];
    }
    groups[customerId].push(payment);
    return groups;
  }, {});

  // Filtra los grupos de pagos según el término de búsqueda
  const filteredGroupedPayments = Object.keys(groupedPayments).reduce(
    (acc, customerId) => {
      const clientPayments = groupedPayments[customerId];
      const clientName = clientPayments[0].customer?.fullName || "";
      const vehicleInfo = clientPayments[0].vehicle
        ? `${clientPayments[0].vehicle.make} ${clientPayments[0].vehicle.model} (${clientPayments[0].vehicle.year}) - ${clientPayments[0].vehicle.vin}`
        : "";
      // Comprueba si alguno de los campos incluye el término de búsqueda (case-insensitive)
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

      {/* Campo de búsqueda */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Buscar por cliente o vehículo"
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
                    <Link
                      to={`/client-payment-pdf/${customerId}`}
                      className="btn btn-primary btn-sm"
                    >
                      Download PDF
                    </Link>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default PaymentList;
