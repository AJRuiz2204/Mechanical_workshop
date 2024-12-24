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

  // Cargar la lista de diagnósticos al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDiagnostics(); // Llamamos al servicio
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

  // Filtrar diagnósticos en tiempo real (VIN, Owner, Technician, Status)
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Si no hay búsqueda, mostramos todos
      setFilteredDiagnostics(diagnostics);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = diagnostics.filter((diag) => {
        // diag.Vehicle.Vin, diag.Vehicle.UserWorkshop.Name, diag.AssignedTechnician, diag.DiagnosticStatus
        // Asegúrate de que tu DTO contenga dichos campos
        const vin = diag.vehicle?.vin?.toLowerCase() || "";
        const ownerName = diag.vehicle?.userWorkshop
          ? `${diag.vehicle.userWorkshop.name} ${diag.vehicle.userWorkshop.lastName}`.toLowerCase()
          : "";
        const technician = diag.assignedTechnician?.toLowerCase() || "";
        const status = diag.diagnosticStatus?.toLowerCase() || ""; // si lo tienes

        return (
          vin.includes(lowerTerm) ||
          ownerName.includes(lowerTerm) ||
          technician.includes(lowerTerm) ||
          status.includes(lowerTerm)
        );
      });
      setFilteredDiagnostics(filtered);
    }
  }, [searchTerm, diagnostics]);

  return (
    <Container className="p-4 border rounded">
      <h3>DIAGNOSTIC LIST</h3>

      {/* Search Bar */}
      <Form.Group controlId="search" className="mb-3">
        <Form.Label>Search by VIN, Owner, Technician, or Status</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter search term..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      {/* Diagnostic Table */}
      {loading ? (
        <div>Loading...</div>
      ) : filteredDiagnostics.length === 0 ? (
        <div>No se encontraron diagnósticos.</div>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th></th>
              <th>VIN / Owner / Make / Model / Technician</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredDiagnostics.map((diag) => (
              <tr key={diag.id}>
                <td>
                  <Form.Check type="checkbox" />
                </td>
                <td>
                  {/* Muestra la info esencial: VIN, Owner, Make, Model, Technician */}
                  {diag.vehicle
                    ? `${diag.vehicle.vin}, ${
                        diag.vehicle.userWorkshop
                          ? diag.vehicle.userWorkshop.name
                          : "Unknown"
                      }, ${diag.vehicle.make}, ${diag.vehicle.model}, ${
                        diag.assignedTechnician
                      }`
                    : "No Vehicle Info"}
                </td>
                <td>
                  {/* Botón del estado, ejemplo: "In Progress", "Pending", etc. */}
                  {/* diag.diagnosticStatus puede ser: "Pending", "InProgress", "Completed"... */}
                  {diag.diagnosticStatus === "InProgress" ? (
                    <Button variant="primary">In Progress</Button>
                  ) : diag.diagnosticStatus === "Pending" ? (
                    <Button variant="secondary">Pending</Button>
                  ) : diag.diagnosticStatus === "Completed" ? (
                    <Button variant="success">Completed</Button>
                  ) : (
                    // Si no tienes un campo de estado, puedes dejarlo en blanco o "Not Specified"
                    <Button variant="warning">Not Specified</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default DiagnosticList;
