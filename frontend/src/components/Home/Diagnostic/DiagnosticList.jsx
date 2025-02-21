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
import { getDiagnostics, deleteDiagnostic } from "../../../services/DiagnosticService";
import {
  deleteTechnicianDiagnostic,
  getTechnicianDiagnosticByDiagId,
} from "../../../services/TechnicianDiagnosticService";
import "./DiagnosticList.css";

/**
 * DiagnosticList Component
 *
 * This component displays a list of diagnostics in a table format.
 * For each diagnostic, it shows vehicle details, reason for visit, and the current status.
 *
 * Depending on whether a Technician Diagnostic exists:
 * - If present, it displays "Edit" and "Delete" buttons for the Technician Diagnostic.
 * - If absent, it displays a "Create" button to create a Technician Diagnostic and a "Delete" button to delete the Diagnostic.
 *
 * Features:
 * - Fetches diagnostics data from the backend.
 * - Checks for associated Technician Diagnostics for each diagnostic.
 * - Provides actions to create, edit, or delete Technician Diagnostics,
 *   or to delete the diagnostic entirely if no Technician Diagnostic exists.
 *
 * @returns {JSX.Element} The DiagnosticList component.
 */
const DiagnosticList = () => {
  const navigate = useNavigate();

  // State to store diagnostics data retrieved from the backend.
  const [diagnostics, setDiagnostics] = useState([]);
  // State to indicate if the data is still loading.
  const [loading, setLoading] = useState(true);
  // State to store any error messages.
  const [error, setError] = useState("");
  // Mapping of diagnostic IDs to their associated Technician Diagnostic IDs (if any).
  const [techDiagMap, setTechDiagMap] = useState({});

  /**
   * fetchData - Fetches diagnostics data and maps Technician Diagnostic IDs to each diagnostic.
   *
   * This function retrieves all diagnostics and, for each diagnostic,
   * attempts to fetch its associated Technician Diagnostic. If a Technician Diagnostic
   * is found, its ID is stored in the techDiagMap; otherwise, a null value is stored.
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      // Retrieve diagnostics data
      const diagData = await getDiagnostics();
      console.log("Diagnostic data payload:", diagData);
      setDiagnostics(diagData);

      // Build a map of diagnostic IDs to Technician Diagnostic IDs (if they exist)
      const newTechDiagMap = {};
      await Promise.all(
        diagData.map(async (diag) => {
          try {
            const techDiag = await getTechnicianDiagnosticByDiagId(diag.id);
            newTechDiagMap[diag.id] = techDiag.id;
          } catch (error) {
            // If a Technician Diagnostic is not found, map to null
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

  // Fetch data when the component mounts
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * handleDelete - Deletes the associated Technician Diagnostic.
   *
   * This function is called when the "Delete" button for a Technician Diagnostic is clicked.
   * It confirms the deletion with the user, calls the service to delete the Technician Diagnostic,
   * and then updates the state to reflect the change.
   *
   * @param {number|string} diagnosticId - The ID of the diagnostic whose Technician Diagnostic should be deleted.
   */
  const handleDelete = async (diagnosticId) => {
    const techDiagId = techDiagMap[diagnosticId];
    if (!techDiagId) return;

    const confirmDelete = window.confirm("Delete this Technician Diagnostic?");
    if (!confirmDelete) return;

    try {
      await deleteTechnicianDiagnostic(techDiagId);
      // Update the mapping to remove the Technician Diagnostic association
      setTechDiagMap((prev) => ({ ...prev, [diagnosticId]: null }));
      alert("Successfully deleted Technician Diagnostic!");
    } catch (error) {
      alert(`Delete failed: ${error.message}`);
    }
  };

  /**
   * handleDeleteDiagnostic - Deletes the diagnostic when no Technician Diagnostic exists.
   *
   * This function is called when the "Delete" button for a diagnostic without a Technician Diagnostic is clicked.
   * It confirms the deletion with the user, calls the service to delete the diagnostic,
   * and updates the state to remove the diagnostic from the list.
   *
   * @param {number|string} diagnosticId - The ID of the diagnostic to delete.
   */
  const handleDeleteDiagnostic = async (diagnosticId) => {
    const confirmDelete = window.confirm("Delete this Diagnostic?");
    if (!confirmDelete) return;

    try {
      await deleteDiagnostic(diagnosticId);
      // Remove the diagnostic from the state list
      setDiagnostics((prevDiagnostics) =>
        prevDiagnostics.filter((diag) => diag.id !== diagnosticId)
      );
      // Also remove any reference from the Technician Diagnostic map
      setTechDiagMap((prev) => {
        const newMap = { ...prev };
        delete newMap[diagnosticId];
        return newMap;
      });
      alert("Successfully deleted Diagnostic!");
    } catch (error) {
      alert(`Delete failed: ${error.message}`);
    }
  };

  // If the data is still loading, display a spinner
  if (loading) {
    return (
      <Container fluid className="p-4 diagnostic-list-container">
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4 border rounded diagnostic-list-container">
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
              <th>Owner</th>
              <th>Make</th>
              <th>Model</th>
              <th>Reason</th>
              <th>Assigned Technician</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {diagnostics.map((diag) => {
              // Determine if a Technician Diagnostic exists for the current diagnostic
              const hasTechDiag = !!techDiagMap[diag.id];
              // Concatenate the first and last name of the workshop owner, if available
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
                  <td>{diag.assignedTechnician || "N/A"}</td>
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
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            navigate(`/technicianDiagnostic/create/${diag.id}`)
                          }
                        >
                          Create
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="ms-2"
                          onClick={() => handleDeleteDiagnostic(diag.id)}
                        >
                          Delete
                        </Button>
                      </>
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
