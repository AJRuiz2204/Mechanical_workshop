/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Table, Alert, Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  getAllSalesReports,
  getSalesReport,
  createSalesReport,
} from "../../../services/salesReportService";

// Componente que muestra la vista previa y permite guardar el reporte
const SalesReportAllPreviewView = () => {
  // Estado para almacenar los datos del preview del reporte
  const [preview, setPreview] = useState(null);
  // Estado para el indicador de carga al obtener el preview
  const [loading, setLoading] = useState(true);
  // Estado para almacenar mensajes de error
  const [error, setError] = useState(null);
  // Estado para almacenar mensajes de éxito al guardar
  const [success, setSuccess] = useState(null);

  // Estados para los filtros de fechas
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  // useEffect para obtener el preview al montar el componente
  useEffect(() => {
    fetchPreview();
  }, []);

  // Función para obtener el preview del reporte según los filtros
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
      console.error("Error getting preview:", err);
      setError(
        err.response?.data?.message || err.message || "Error getting preview"
      );
    }
    setLoading(false);
  };

  // Función para guardar el reporte
  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    try {
      // Se extraen las propiedades del preview, excluyendo 'details' y 'salesReportId'
      const { details, salesReportId, ...restPreview } = preview;
      // Se arma el objeto del reporte a guardar (con un array vacío para 'Details')
      const reportToSave = { ...restPreview, Details: [] };

      const savedReport = await createSalesReport(reportToSave);
      console.log("Reporte guardado:", savedReport);
      setSuccess("Reporte guardado exitosamente.");
    } catch (err) {
      console.error("Error saving report:", err);
      setError(
        err.response?.data?.message || err.message || "Error saving report"
      );
    }
  };

  // Renderizado condicional según el estado de carga y errores
  if (loading) return <div>Loading report preview...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!preview) return null;

  return (
    <div className="mt-5">
      <h2>Vista Previa del Reporte</h2>
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
          Actualizar Vista Previa
        </Button>
      </Form>

      <Table striped bordered hover responsive className="mt-4">
        <thead>
          <tr>
            <th>Total Estimates</th>
            <th>Total Parts Revenue</th>
            <th>Total Labor Revenue</th>
            <th>Total Flat Fee Revenue</th>
            <th>Total Tax Collected</th>
            <th>Total Payments</th>
            <th>Total Outstanding</th>
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

// Componente principal que muestra el listado de reportes y, además, la vista previa (SalesReportAllPreviewView)
const SalesReportsListView = () => {
  // Estado para almacenar la lista de reportes
  const [reports, setReports] = useState([]);
  // Estado para el indicador de carga al obtener los reportes
  const [loading, setLoading] = useState(true);
  // Estado para almacenar mensajes de error
  const [error, setError] = useState(null);

  // useEffect para obtener los reportes al montar el componente
  useEffect(() => {
    fetchReports();
  }, []);

  // Función para obtener la lista de reportes
  const fetchReports = async () => {
    try {
      const data = await getAllSalesReports();
      console.log("Reportes cargados:", data);
      setReports(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(
        err.response?.data?.message || err.message || "Error fetching reports"
      );
      setLoading(false);
    }
  };

  // Renderizado condicional según el estado de carga y errores
  if (loading) {
    return <div>Loading reports...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="container py-5">
      <h1>Historial de Reportes de Ventas</h1>

      {/* Se muestra la vista previa y guardado del reporte */}
      <SalesReportAllPreviewView />

      {/* Se muestra el listado de reportes */}
      {reports.length === 0 ? (
        <Alert variant="info" className="mt-5">
          No hay reportes almacenados.
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="mt-5">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Periodo</th>
              <th>Total Estimates</th>
              <th>Total Parts Revenue</th>
              <th>Total Labor Revenue</th>
              <th>Total Flat Fee Revenue</th>
              <th>Total Tax</th>
              <th>Total Paid</th>
              <th>Total Outstanding</th>
              <th>Creation Date</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.salesReportId}>
                <td>{report.salesReportId}</td>
                <td>
                  {new Date(report.startDate).toLocaleDateString()} -{" "}
                  {new Date(report.endDate).toLocaleDateString()}
                </td>
                <td>${Number(report.totalEstimates).toFixed(2)}</td>
                <td>${Number(report.totalPartsRevenue).toFixed(2)}</td>
                <td>${Number(report.totalLaborRevenue).toFixed(2)}</td>
                <td>${Number(report.totalFlatFeeRevenue).toFixed(2)}</td>
                <td>${Number(report.totalTaxCollected).toFixed(2)}</td>
                <td>${Number(report.totalPaymentsCollected).toFixed(2)}</td>
                <td>${Number(report.totalOutstanding).toFixed(2)}</td>
                <td>{new Date(report.createdDate).toLocaleDateString()}</td>
                <td>
                  <Link to={`/sales-report-pdf/${report.salesReportId}`}>
                    <Button variant="primary" size="sm">
                      View PDF
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default SalesReportsListView;
