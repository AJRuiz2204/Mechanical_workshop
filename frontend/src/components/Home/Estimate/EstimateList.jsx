/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Table, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  getEstimates,
  deleteEstimate,
} from "../../../services/EstimateService";
import { createAccountReceivable } from "../../../services/accountReceivableService";
import AccountPaymentModal from "../../Home/Accounting/AccountPaymentModal";

const EstimateList = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalAccountId, setModalAccountId] = useState(null);

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const data = await getEstimates();
        setEstimates(data);
        setLoading(false);
      } catch (err) {
        setError(`Error al cargar los estimados: ${err.message}`);
        setLoading(false);
      }
    };

    fetchEstimates();
  }, []);

  const handleGenerateAccount = async (estimate) => {
    // Si el estimado ya trae la cuenta, se abre el modal directamente.
    if (estimate.accountReceivable && estimate.accountReceivable.id) {
      setModalAccountId(estimate.accountReceivable.id);
      setShowPaymentModal(true);
      return;
    }

    // Confirmar la acción de generar la cuenta.
    if (
      !window.confirm(
        `Se va a generar una cuenta por cobrar para el estimado ${estimate.id}. ¿Continuar?`
      )
    )
      return;

    try {
      const newAccount = await createAccountReceivable({
        estimateId: estimate.id,
      });
      setSuccess(
        `Cuenta por cobrar creada correctamente para el estimado ${estimate.id}.`
      );
      setModalAccountId(newAccount.id);
      setShowPaymentModal(true);
    } catch (err) {
      setError(`Error al generar la cuenta: ${err.message}`);
    }
  };

  const handleEdit = (estimate) => {
    console.log("Editing Estimate:", estimate);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Está seguro que desea eliminar este estimado?"
    );
    if (!confirmDelete) return;

    try {
      await deleteEstimate(id);
      setSuccess(`Estimado con ID ${id} eliminado correctamente.`);
      setEstimates((prev) => prev.filter((est) => est.id !== id));
    } catch (err) {
      setError(`Error eliminando el estimado: ${err.message}`);
    }
  };

  if (loading) {
    return <div>Cargando estimados...</div>;
  }

  return (
    <div className="p-4 border rounded">
      <h2>Lista de Estimados</h2>

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

      <div className="mb-3 text-end">
        <Link to="/estimate/create">
          <Button variant="primary">+ Agregar Estimado</Button>
        </Link>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>VIN del Vehículo</th>
            <th>Subtotal</th>
            <th>Impuestos</th>
            <th>Total</th>
            <th>Status</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {estimates.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No se encontraron estimados.
              </td>
            </tr>
          ) : (
            estimates.map((estimate) => (
              <tr key={estimate.id}>
                <td>{estimate.id}</td>
                <td>{estimate.vehicle?.vin || "Sin VIN"}</td>
                <td>${estimate.subtotal?.toFixed(2)}</td>
                <td>${estimate.tax?.toFixed(2)}</td>
                <td>${estimate.total?.toFixed(2)}</td>
                <td>{estimate.authorizationStatus}</td>
                <td>
                  <Link to={`/invoice/${estimate.id}`}>
                    <Button variant="info" size="sm" className="me-2">
                      Ver
                    </Button>
                  </Link>

                  <Link to={`/estimate/edit/${estimate.id}`}>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(estimate)}
                    >
                      Editar
                    </Button>
                  </Link>

                  <Button
                    variant="danger"
                    size="sm"
                    className="me-2"
                    onClick={() => handleDelete(estimate.id)}
                  >
                    Eliminar
                  </Button>

                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleGenerateAccount(estimate)}
                  >
                    {estimate.accountReceivable
                      ? "Abrir Cuenta"
                      : "Generar Cuenta"}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Modal de pagos para la cuenta individual */}
      <AccountPaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        accountId={modalAccountId}
      />
    </div>
  );
};

export default EstimateList;
