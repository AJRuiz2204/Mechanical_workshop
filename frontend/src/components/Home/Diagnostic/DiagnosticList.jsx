/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Container,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import { getDiagnostics } from "../../../services/DiagnosticService";
import { useNavigate } from "react-router-dom";
import {
  deleteTechnicianDiagnostic,
  getTechnicianDiagnosticByDiagId,
} from "../../../services/TechnicianDiagnosticService";

/**
 * DiagnosticList Component.
 * Displays a list of diagnostics with actions based on technician diagnostics.
 *
 * @component
 * @example
 * return (<DiagnosticList />)
 */
const DiagnosticList = () => {
  const navigate = useNavigate();
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [techDiagMap, setTechDiagMap] = useState({});

  /**
   * Fetch diagnostics and their corresponding technician diagnostics.
   *
   * @async
   * @function fetchData
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      // Retrieve diagnostics data.
      const diagData = await getDiagnostics();
      setDiagnostics(diagData);

      // Retrieve technician diagnostics for each diagnostic.
      const newTechDiagMap = {};
      await Promise.all(
        diagData.map(async (diag) => {
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
      setError(error.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  // Run fetchData on component mount.
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * Handle deletion of a technician diagnostic.
   *
   * @async
   * @function handleDelete
   * @param {number|string} diagnosticId - The id of the diagnostic to delete.
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
    <Container className="p-4 border rounded">
      <h3>Diagnostic List</h3>
      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : diagnostics.length === 0 ? (
        <Alert variant="info">No diagnostics found</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>VIN</th>
              <th>Make</th>
              <th>Model</th>
              <th>Reason</th>
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

export default DiagnosticList;
