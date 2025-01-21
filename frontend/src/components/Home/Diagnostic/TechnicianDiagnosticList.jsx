/* eslint-disable no-unused-vars */
// src/components/Diagnostic/TechnicianDiagnosticList.jsx
import React, { useEffect, useState } from "react";
import { Table, Button, Container, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getDiagnosticsByTechnician } from "../../../services/DiagnosticService";

/**
 * Component that displays the list of diagnostics assigned to a technician.
 */
const TechnicianDiagnosticList = () => {
  const navigate = useNavigate();

  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTechnicianDiagnostics = async () => {
      try {
        setLoading(true);
        setError("");

        const userString = localStorage.getItem("user");
        if (!userString) {
          setError("User not found in localStorage.");
          setDiagnostics([]);
          return;
        }

        const user = JSON.parse(userString);
        const { name, lastName, profile } = user;

        if (profile !== "Technician") {
          setError("User is not authorized to view this section.");
          setDiagnostics([]);
          return;
        }

        const data = await getDiagnosticsByTechnician(name, lastName);
        setDiagnostics(data);
      } catch (error) {
        setError(error.message || "Error fetching diagnostics.");
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicianDiagnostics();
  }, []);

  const handleViewDetails = (id) => {
    navigate(`/technicianDiagnostic/${id}`); // Updated with backticks
  };

  return (
    <Container className="p-4 border rounded bg-light">
      <h3>My Diagnostics</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "200px" }}
        >
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          {diagnostics.length === 0 ? (
            <Alert variant="info">You have no assigned diagnostics.</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>VIN</th>
                  <th>Make</th>
                  <th>Model</th>
                  <th>Reason for Visit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {diagnostics.map((diag) => (
                  <tr key={diag.id}>
                    <td>{diag.id}</td>
                    <td>{diag.vehicle?.vin || "N/A"}</td>
                    <td>{diag.vehicle?.make || "N/A"}</td>
                    <td>{diag.vehicle?.model || "N/A"}</td>
                    <td>{diag.reasonForVisit}</td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleViewDetails(diag.id)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </Container>
  );
};

export default TechnicianDiagnosticList;
