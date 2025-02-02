/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Button, Table, Alert, Form } from "react-bootstrap";
import {
  getSalesReport,
  createSalesReport,
} from "../../../services/salesReportService";

const SalesReportAllPreviewView = () => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Estados para las fechas: startDate opcional y endDate por defecto hoy
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  useEffect(() => {
    fetchPreview();
  }, []);

  const fetchPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSalesReport(
        startDate === "" ? null : startDate,
        endDate === "" ? null : endDate
      );
      console.log("Preview obtenido:", data);
      setPreview(data);
    } catch (err) {
      console.error("Error obteniendo preview:", err);
      setError(
        err.response?.data?.message || err.message || "Error obteniendo preview"
      );
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    try {
      // Extraer y eliminar la propiedad "Details" para enviar solo el resumen
      const { details, salesReportId, ...restPreview } = preview;
      const reportToSave = { ...restPreview, Details: [] };

      const savedReport = await createSalesReport(reportToSave);
      console.log("Reporte guardado:", savedReport);
      setSuccess("Reporte guardado exitosamente.");
    } catch (err) {
      console.error("Error guardando reporte:", err);
      setError(
        err.response?.data?.message || err.message || "Error guardando reporte"
      );
    }
  };

  if (loading) return <div>Cargando preview del reporte...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!preview) return null;

  return (
    <div className="container py-5">
      <h1>Previsualización de Reporte de Ventas</h1>
      <Form className="mb-4">
        <Form.Group controlId="startDate" className="mb-3">
          <Form.Label>Fecha de Inicio (opcional)</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="endDate" className="mb-3">
          <Form.Label>Fecha de Fin</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" onClick={fetchPreview}>
          Actualizar Preview
        </Button>
      </Form>

      <Table striped bordered hover responsive className="mt-4">
        <thead>
          <tr>
            <th>Total Estimates</th>
            <th>Total Ingresos Parts</th>
            <th>Total Ingresos Labor</th>
            <th>Total Ingresos Flat Fee</th>
            <th>Total Impuestos</th>
            <th>Total Pagado</th>
            <th>Total Deuda</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${Number(preview.totalEstimates).toFixed(2)}</td>
            <td>${Number(preview.totalPartsRevenue).toFixed(2)}</td>
            <td>${Number(preview.totalLaborRevenue).toFixed(2)}</td>
            <td>${Number(preview.totalFlatFeeRevenue).toFixed(2)}</td>
            <td>${Number(preview.totalTaxCollected).toFixed(2)}</td>
            <td>${Number(preview.totalPaymentsCollected).toFixed(2)}</td>
            <td>${Number(preview.totalOutstanding).toFixed(2)}</td>
          </tr>
        </tbody>
      </Table>
      <Button variant="success" onClick={handleSave} className="mt-3">
        Guardar Reporte
      </Button>
      {success && (
        <Alert variant="success" className="mt-3">
          {success}
        </Alert>
      )}
    </div>
  );
};

export default SalesReportAllPreviewView;
