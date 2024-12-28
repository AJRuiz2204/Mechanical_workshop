/* eslint-disable no-unused-vars */
// src/components/Diagnostic/DiagnosticList.jsx

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

  // Función para obtener la lista de diagnósticos
  const fetchDiagnostics = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getDiagnostics();
      setDiagnostics(data);
    } catch (error) {
      setError(error.message || "Error al obtener la lista de diagnósticos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  // Función para manejar la eliminación de un TechnicianDiagnostic
  const handleDeleteTechDiag = async (techDiagId) => {
    const confirmDelete = window.confirm(
      "¿Seguro que deseas eliminar este Diagnóstico Técnico?"
    );
    if (!confirmDelete) return;

    try {
      await deleteTechnicianDiagnostic(techDiagId);
      alert("Diagnóstico Técnico eliminado con éxito.");
      // Actualizar el estado local
      setDiagnostics((prevDiagnostics) =>
        prevDiagnostics.map((diag) =>
          diag.techDiagnosticId === techDiagId
            ? { ...diag, techDiagnosticId: null }
            : diag
        )
      );
    } catch (error) {
      alert(
        "Error al eliminar el Diagnóstico Técnico: " + (error.message || error)
      );
    }
  };

  return (
    <Container className="p-4 border rounded">
      <h3>Lista de Diagnósticos</h3>

      {/* Mostrar mensajes de error si existen */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Mostrar indicador de carga */}
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      ) : (
        <>
          {diagnostics.length === 0 ? (
            <Alert variant="info">No hay diagnósticos registrados.</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vehicle ID</th>
                  <th>VIN</th>
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Motivo de la Visita</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {diagnostics.map((diag) => (
                  <tr key={diag.id}>
                    <td>{diag.id}</td>
                    <td>{diag.VehicleId}</td>
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
                            Editar Diagnóstico Técnico
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() =>
                              handleDeleteTechDiag(diag.techDiagnosticId)
                            }
                          >
                            Eliminar Diagnóstico Técnico
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
                          Crear Diagnóstico Técnico
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
