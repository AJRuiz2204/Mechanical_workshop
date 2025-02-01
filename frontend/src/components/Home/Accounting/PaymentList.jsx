/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Table, Alert } from "react-bootstrap";
import { getAllPayments } from "../../../services/accountReceivableService";
import { Link } from "react-router-dom";

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const data = await getAllPayments();
      console.log("Pagos cargados:", data);
      setPayments(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.message || "Error fetching payments");
      setLoading(false);
    }
  };

  // Agrupar pagos por cliente usando payment.customer.id
  const groupedPayments = payments.reduce((groups, payment) => {
    const customerId = payment.customer ? payment.customer.id : "unknown";
    if (!groups[customerId]) {
      groups[customerId] = [];
    }
    groups[customerId].push(payment);
    return groups;
  }, {});

  if (loading) {
    return <div>Cargando pagos...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Historial de Pagos por Cliente</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Vehículo</th>
            <th>Saldo Inicial</th>
            <th>Total Pagado</th>
            <th>Saldo Pendiente</th>
            <th>N° de Pagos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupedPayments).length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No se encontraron pagos.
              </td>
            </tr>
          ) : (
            Object.keys(groupedPayments).map((customerId) => {
              const clientPayments = groupedPayments[customerId];
              const totalPaid = clientPayments.reduce(
                (sum, payment) => sum + Number(payment.amount),
                0
              );
              const remainingBalance = clientPayments[0].remainingBalance || 0;
              const initialBalance = clientPayments[0].initialBalance || 0;
              const clientName =
                clientPayments[0].customer?.fullName || "Sin cliente";
              const vehicleInfo = clientPayments[0].vehicle
                ? `${clientPayments[0].vehicle.make} ${clientPayments[0].vehicle.model} (${clientPayments[0].vehicle.year}) - ${clientPayments[0].vehicle.vin}`
                : "Sin vehículo";

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
                      Descargar PDF
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
