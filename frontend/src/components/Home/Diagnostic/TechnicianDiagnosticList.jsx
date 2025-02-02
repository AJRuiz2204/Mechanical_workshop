/* eslint-disable no-unused-vars */
// src/components/Diagnostic/TechnicianDiagnosticList.jsx
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Container,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getDiagnosticsByTechnician } from "../../../services/DiagnosticService";
import {
  deleteTechnicianDiagnostic,
  getTechnicianDiagnosticByDiagId,
} from "../../../services/TechnicianDiagnosticService";

/**
 * TechnicianDiagnosticList Component
 * This component displays the list of diagnostics assigned to a technician.
 * The technician can edit or delete assigned diagnostics or create a new one if missing.
 *
 * @returns {JSX.Element}
 */
const TechnicianDiagnosticList = () => {
  const navigate = useNavigate();

  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [techDiagMap, setTechDiagMap] = useState({});

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

        // Retrieve diagnostics assigned to the technician
        const data = await getDiagnosticsByTechnician(name, lastName);
        setDiagnostics(data);

        // Retrieve TechnicianDiagnostics for each diagnostic
        const newTechDiagMap = {};
        await Promise.all(
          data.map(async (diag) => {
            try {
              const techDiag = await getTechnicianDiagnosticByDiagId(diag.id);
              newTechDiagMap[diag.id] = techDiag.id;
            } catch (error) {
              if (error.message !== "Not found") console.error(error);
              newTechDiagMap[diag.id] = null;
            }
          })
        );
        setTechDiagMap(newTechDiagMap);
      } catch (error) {
        setError(error.message || "Error fetching diagnostics.");
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicianDiagnostics();
  }, []);

  /**
   * Handles the deletion of a technician diagnostic.
   * @param {number} diagnosticId - ID of the diagnostic to delete
   */
  const handleDelete = async (diagnosticId) => {
    const techDiagId = techDiagMap[diagnosticId];
    if (!techDiagId) return;

    const confirmDelete = window.confirm("Delete this Technician Diagnostic?");
    if (!confirmDelete) return;

    try {
      await deleteTechnicianDiagnostic(techDiagId);
      setTechDiagMap((prev) => ({ ...prev, [diagnosticId]: null }));
      alert("Successfully deleted!");
    } catch (error) {
      alert(`Delete failed: ${error.message}`);
    }
  };

  return (
    <Container className="p-4 border rounded bg-light">
      <h3>My Diagnostics</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : diagnostics.length === 0 ? (
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
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {diagnostics.map((diag) => {
              const hasTechDiag = !!techDiagMap[diag.id];
              return (
                <tr key={diag.id}>
                  <td>{diag.id}</td>
                  <td>{diag.vehicle?.vin || "N/A"}</td>
                  <td>{diag.vehicle?.make || "N/A"}</td>
                  <td>{diag.vehicle?.model || "N/A"}</td>
                  <td>{diag.reasonForVisit}</td>
                  <td>
                    <Badge bg={hasTechDiag ? "success" : "danger"}>
                      {hasTechDiag ? "With Diagnostic" : "Without Diagnostic"}
                    </Badge>
                  </td>
                  <td>
                    {hasTechDiag ? (
                      <>
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() =>
                            navigate(
                              `/technicianDiagnostic/edit/${
                                techDiagMap[diag.id]
                              }`
                            )
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(diag.id)}
                        >
                          Delete
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
                        Create
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default TechnicianDiagnosticList;
