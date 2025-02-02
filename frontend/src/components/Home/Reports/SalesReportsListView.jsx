/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Table, Alert, Button } from "react-bootstrap";
import { getAllSalesReports } from "../../../services/salesReportService";
import { Link } from "react-router-dom";

const SalesReportsListView = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

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

  if (loading) {
    return <div>Cargando reportes...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (reports.length === 0) {
    return (
      <div className="container py-5">
        <h1>Historial de Reportes de Ventas</h1>
        <Alert variant="info">No hay reportes almacenados.</Alert>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h1>Historial de Reportes de Ventas</h1>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID Reporte</th>
            <th>Periodo</th>
            <th>Total Estimates</th>
            <th>Total Ingresos Parts</th>
            <th>Total Ingresos Labor</th>
            <th>Total Ingresos Flat Fee</th>
            <th>Total Impuestos</th>
            <th>Total Pagado</th>
            <th>Total Deuda</th>
            <th>Fecha de Creación</th>
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
                    Ver PDF
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default SalesReportsListView;
