/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Container,
  Alert,
  Spinner,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getDiagnostics } from "../../../services/DiagnosticService";
import {
  deleteTechnicianDiagnostic,
  getTechnicianDiagnosticByDiagId,
} from "../../../services/TechnicianDiagnosticService";
import "./DiagnosticList.css";

/**
 * DiagnosticList Component
 *
 * Description:
 * Displays a list of diagnostics along with actions for technician diagnostics.
 * For each diagnostic, it shows basic vehicle and reason information and a badge
 * indicating whether a technician diagnostic exists. Depending on that status,
 * action buttons allow you to create a new technician diagnostic or edit/delete the existing one.
 *
 * Features:
 * - Fetch diagnostics from the backend.
 * - For each diagnostic, attempt to fetch the associated technician diagnostic.
 * - Display a responsive table with the diagnostics data.
 * - Provide actions (Create, Edit, Delete) for technician diagnostics.
 * - Uses Bootstrap’s components and utility classes for layout and responsiveness.
 *
 * @returns {JSX.Element} The DiagnosticList component.
 */
const DiagnosticList = () => {
  const navigate = useNavigate();
  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // techDiagMap maps each diagnostic id to its corresponding technician diagnostic id (if any)
  const [techDiagMap, setTechDiagMap] = useState({});

  /**
   * fetchData Function
   *
   * Asynchronously fetches diagnostics data and for each diagnostic,
   * retrieves its associated technician diagnostic (if available).
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      // Retrieve diagnostics data
      const diagData = await getDiagnostics();
      console.log("Payload diagnostic data:", diagData);
      setDiagnostics(diagData);

      // Retrieve technician diagnostic IDs for each diagnostic
      const newTechDiagMap = {};
      await Promise.all(
        diagData.map(async (diag) => {
          try {
            const techDiag = await getTechnicianDiagnosticByDiagId(diag.id);
            newTechDiagMap[diag.id] = techDiag.id;
          } catch (error) {
            // If not found, simply map to null
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

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * handleDelete Function
   *
   * Deletes the technician diagnostic associated with a given diagnostic.
   *
   * @param {number|string} diagnosticId - The diagnostic ID whose technician diagnostic should be deleted.
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

  // Render a loading spinner while fetching data
  if (loading) {
    return (
      <Container className="p-4 diagnostic-list-container">
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      </Container>
    );
  }

  return (
    <Container className="p-4 border rounded diagnostic-list-container">
      <h3>Diagnostic List</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {diagnostics.length === 0 ? (
        <Alert variant="info">No diagnostics found</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>VIN</th>
              <th>Owner</th> {/* Nueva columna para Owner */}
              <th>Make</th>
              <th>Model</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {diagnostics.map((diag) => {
              // Obtener si existe technician diagnostic
              const hasTechDiag = !!techDiagMap[diag.id];
              // Nueva variable para concatenar name y lastName del userWorkshop
              const workshopName = diag.vehicle?.userWorkshop 
                ? `${diag.vehicle.userWorkshop.name} ${diag.vehicle.userWorkshop.lastName}` 
                : "N/A";
              return (
                <tr key={diag.id}>
                  <td>{diag.id}</td>
                  <td>{diag.vehicle?.vin || "N/A"}</td>
                  <td>{workshopName}</td>
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
                            navigate(`/technicianDiagnostic/edit/${techDiagMap[diag.id]}`)
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
