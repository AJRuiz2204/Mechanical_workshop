/* eslint-disable no-unused-vars */
// src/components/Diagnostic/DiagnosticList.jsx
import React, { useEffect, useState } from "react";
import { Table, Form, Button, Container } from "react-bootstrap";
import { getDiagnostics } from "../../../services/DiagnosticService";

const DiagnosticList = () => {
  const [diagnostics, setDiagnostics] = useState([]);
  const [filteredDiagnostics, setFilteredDiagnostics] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Cargar diagnósticos al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDiagnostics();
        setDiagnostics(data);
        setFilteredDiagnostics(data);
      } catch (error) {
        alert(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Búsqueda local (por assignedTechnician, reasonForVisit, etc.)
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDiagnostics(diagnostics);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      const result = diagnostics.filter((d) => {
        const technician = d.assignedTechnician.toLowerCase();
        const reason = d.reasonForVisit.toLowerCase();
        // O filtrar por VehicleId convertido a string si quieres
        return technician.includes(lowerTerm) || reason.includes(lowerTerm);
      });
      setFilteredDiagnostics(result);
    }
  }, [searchTerm, diagnostics]);

  return (
    <Container className="p-4 border rounded">
      <h3>DIAGNOSTIC LIST</h3>

      {/* Search */}
      <Form.Group controlId="search" className="mb-3">
        <Form.Label>Search by Technician or Reason</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter search term..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      {/* Table */}
      {loading ? (
        <div>Loading...</div>
      ) : filteredDiagnostics.length === 0 ? (
        <div>No se encontraron diagnósticos.</div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th></th>
              <th>VehicleId</th>
              <th>Técnico</th>
              <th>Razón</th>
              <th>Fecha Creación</th>
            </tr>
          </thead>
          <tbody>
            {filteredDiagnostics.map((diag) => (
              <tr key={diag.id}>
                <td>
                  <Form.Check type="checkbox" />
                </td>
                <td>{diag.vehicleId}</td>
                <td>{diag.assignedTechnician}</td>
                <td>{diag.reasonForVisit}</td>
                <td>{new Date(diag.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default DiagnosticList;
