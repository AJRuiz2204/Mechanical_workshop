// src/components/Estimate/EstimateList.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Table, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  getEstimates,
  deleteEstimate,
} from "../../../services/EstimateService";

const EstimateList = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Carga la lista de Estimates cuando se monta el componente
  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const data = await getEstimates();
        setEstimates(data); // data es un array de EstimateFullDto
        setLoading(false);
      } catch (err) {
        setError(`Error fetching the Estimates: ${err.message}`);
        setLoading(false);
      }
    };

    fetchEstimates();
  }, []);

  // Maneja la eliminación de una Estimate
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Estimate?"
    );
    if (!confirmDelete) return;

    try {
      await deleteEstimate(id);
      setSuccess(`Estimate with ID ${id} deleted successfully.`);
      // Filtramos la lista en memoria
      setEstimates((prev) => prev.filter((est) => est.id !== id));
    } catch (err) {
      setError(`Error deleting the Estimate: ${err.message}`);
    }
  };

  if (loading) {
    return <div>Loading Estimates...</div>;
  }

  return (
    <div className="p-4 border rounded">
      <h2>Estimate List</h2>

      {/* Mensajes de error o éxito */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      {/* Botón para crear un nuevo Estimate */}
      <div className="mb-3 text-end">
        <Link to="/estimate/create">
          <Button variant="primary">+ Add New Estimate</Button>
        </Link>
      </div>

      {/* Tabla de Estimates */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Vehicle VIN</th>
            <th>Subtotal</th>
            <th>Tax</th>
            <th>Total</th>
            <th>Authorization</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {estimates.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">
                No estimates found.
              </td>
            </tr>
          ) : (
            estimates.map((estimate) => (
              <tr key={estimate.id}>
                <td>{estimate.id}</td>
                <td>{estimate.vehicle?.vin || "No VIN"}</td>
                <td>${estimate.subtotal?.toFixed(2)}</td>
                <td>${estimate.tax?.toFixed(2)}</td>
                <td>${estimate.total?.toFixed(2)}</td>
                <td>{estimate.authorizationStatus}</td>
                <td>
                  {/* Botón "View" (puedes llevarlo a un detalle o a la vista de Invoice) */}
                  <Link to={`/invoice/${estimate.id}`}>
                    <Button variant="info" size="sm" className="me-2">
                      View
                    </Button>
                  </Link>

                  {/* Botón "Edit" (si tienes una ruta /estimate/edit/:id) */}
                  <Link to={`/estimate/edit/${estimate.id}`}>
                    <Button variant="warning" size="sm" className="me-2">
                      Edit
                    </Button>
                  </Link>

                  {/* Botón "Delete" */}
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(estimate.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default EstimateList;
