/* eslint-disable no-unused-vars */
// Frontend: src/components/Diagnostic/DiagnosticList.jsx

import React, { useEffect, useState } from "react";
import { Table, Button, Container, Alert, Spinner } from "react-bootstrap";
import { getDiagnostics } from "../../../services/DiagnosticService";
import { useNavigate } from "react-router-dom";
import { deleteTechnicianDiagnostic } from "../../../services/TechnicianDiagnosticService";

const DiagnosticList = () => {
  const navigate = useNavigate();
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDiagnostics = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getDiagnostics();
      setDiagnostics(data);
    } catch (error) {
      setError(error.message || "Error fetching the diagnostics list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleDeleteTechDiag = async (techDiagId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Technician Diagnostic?"
    );
    if (!confirmDelete) return;

    try {
      await deleteTechnicianDiagnostic(techDiagId);
      alert("Technician Diagnostic successfully deleted.");
      setDiagnostics((prevDiagnostics) =>
        prevDiagnostics.map((diag) =>
          diag.techDiagnosticId === techDiagId
            ? { ...diag, techDiagnosticId: null }
            : diag
        )
      );
    } catch (error) {
      alert(
        "Error deleting the Technician Diagnostic: " + (error.message || error)
      );
    }
  };

  return (
    <Container className="p-4 border rounded">
      <h3>Diagnostic List</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          {diagnostics.length === 0 ? (
            <Alert variant="info">There are no registered diagnostics.</Alert>
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
                      {diag.techDiagnosticId ? (
                        <>
                          <Button
                            variant="warning"
                            size="sm"
                            className="me-2"
                            onClick={() =>
                              navigate(
                                `/technicianDiagnostic/edit/${diag.techDiagnosticId}`
                              )
                            }
                          >
                            Edit Technician Diagnostic
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              handleDeleteTechDiag(diag.techDiagnosticId)
                            }
                          >
                            Delete Technician Diagnostic
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            navigate(`/technicianDiagnostic/create/${diag.id}`)
                          }
                        >
                          Create Technician Diagnostic
                        </Button>
                      )}
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

export default DiagnosticList;
