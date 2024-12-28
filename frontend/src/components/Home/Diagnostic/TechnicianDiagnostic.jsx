/* eslint-disable no-unused-vars */
// src/components/Diagnostic/TechnicianDiagnostic.jsx

import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { createTechnicianDiagnostic, getTechnicianDiagnostic, updateTechnicianDiagnostic } from "../../../services/TechnicianDiagnosticService";
import { getDiagnosticById } from "../../../services/DiagnosticService";
import "./Diagnostic.css";

const TechnicianDiagnostic = () => {
  const navigate = useNavigate();
  const { diagnosticId, techDiagId } = useParams(); // Rutas: create/:diagnosticId y edit/:techDiagId

  // Determinar el modo: creación o edición
  const isEditMode = Boolean(techDiagId);

  // Estado para el diagnóstico relacionado
  const [diagnostic, setDiagnostic] = useState(null);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    mileage: "",
    extendedDiagnostic: "",
  });

  // Estado para mensajes de error y éxito
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Estado de carga
  const [loading, setLoading] = useState(true);

  // Obtener información del diagnóstico al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setErrorMessage("");
        setSuccessMessage("");

        if (isEditMode) {
          // Modo edición: Obtener TechnicianDiagnostic
          const techDiag = await getTechnicianDiagnostic(techDiagId);
          setFormData({
            mileage: techDiag.mileage,
            extendedDiagnostic: techDiag.extendedDiagnostic,
          });
          // Obtener el diagnóstico relacionado
          const diag = await getDiagnosticById(techDiag.diagnosticId);
          setDiagnostic(diag);
        } else {
          // Modo creación: Obtener el diagnóstico relacionado
          const diag = await getDiagnosticById(diagnosticId);
          setDiagnostic(diag);
        }
      } catch (error) {
        setErrorMessage(error.message || "Error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [diagnosticId, techDiagId, isEditMode]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validaciones básicas
    if (!formData.mileage) {
      setErrorMessage("El kilometraje es obligatorio.");
      return;
    }

    if (!formData.extendedDiagnostic.trim()) {
      setErrorMessage("El diagnóstico extendido es obligatorio.");
      return;
    }

    // Convertir mileage a número
    const mileageNumber = parseInt(formData.mileage, 10);
    if (isNaN(mileageNumber)) {
      setErrorMessage("El kilometraje debe ser un número válido.");
      return;
    }

    // Payload para TechnicianDiagnostic
    const techDiagData = {
      mileage: mileageNumber,
      extendedDiagnostic: formData.extendedDiagnostic.trim(),
    };

    try {
      if (isEditMode) {
        // Modo edición: Actualizar el TechnicianDiagnostic existente
        await updateTechnicianDiagnostic(techDiagId, techDiagData);
        setSuccessMessage("Diagnóstico Técnico actualizado con éxito.");
      } else {
        // Modo creación: Crear un nuevo TechnicianDiagnostic
        const payload = {
          diagnosticId: diagnostic.id,
          ...techDiagData,
        };
        await createTechnicianDiagnostic(payload);
        setSuccessMessage("Diagnóstico Técnico creado con éxito.");
      }
      // Redirigir a la lista de diagnósticos después de guardar
      navigate("/diagnostic-list");
    } catch (error) {
      setErrorMessage("Error al guardar el Diagnóstico Técnico: " + error.message);
    }
  };

  if (loading) {
    return (
      <Container className="p-4 border rounded">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (!diagnostic) {
    return (
      <Container className="p-4 border rounded">
        <Alert variant="danger">No se pudo cargar la información del diagnóstico.</Alert>
        <Button variant="secondary" onClick={() => navigate("/diagnostic-list")}>
          Volver a la Lista de Diagnósticos
        </Button>
      </Container>
    );
  }

  return (
    <Container className="p-4 border rounded bg-light">
      <h3>{isEditMode ? "Editar Diagnóstico Técnico" : "Asignar Diagnóstico Técnico"}</h3>

      {/* Mostrar mensajes de error o éxito */}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Información del Vehículo (read-only) */}
      <h5>Información del Vehículo</h5>
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group controlId="vin">
            <Form.Label>VIN</Form.Label>
            <Form.Control type="text" value={diagnostic.vehicle?.vin || "N/A"} readOnly />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="make">
            <Form.Label>Marca</Form.Label>
            <Form.Control type="text" value={diagnostic.vehicle?.make || "N/A"} readOnly />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="model">
            <Form.Label>Modelo</Form.Label>
            <Form.Control type="text" value={diagnostic.vehicle?.model || "N/A"} readOnly />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="plate">
            <Form.Label>Placa</Form.Label>
            <Form.Control type="text" value={diagnostic.vehicle?.plate || "N/A"} readOnly />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group controlId="engine">
            <Form.Label>Motor</Form.Label>
            <Form.Control type="text" value={diagnostic.vehicle?.engine || "N/A"} readOnly />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Control type="text" value={diagnostic.vehicle?.status || "N/A"} readOnly />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="reasonForVisit">
            <Form.Label>Motivo de la Visita</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={diagnostic.reasonForVisit || "N/A"}
              readOnly
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Formulario de TechnicianDiagnostic */}
      <Form onSubmit={handleSubmit}>
        <h5>Información del Diagnóstico Técnico</h5>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="mileage">
              <Form.Label>Kilometraje del Vehículo</Form.Label>
              <Form.Control
                type="number"
                placeholder="Ingrese el kilometraje"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="extendedDiagnostic">
              <Form.Label>Diagnóstico Extendido</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Problemas reportados, pruebas realizadas, recomendaciones..."
                name="extendedDiagnostic"
                value={formData.extendedDiagnostic}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end">
          <Button variant="secondary" className="me-2" onClick={() => navigate("/diagnostic-list")}>
            Cancelar
          </Button>
          <Button variant="success" type="submit">
            {isEditMode ? "Guardar Cambios" : "Guardar Diagnóstico Técnico"}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default TechnicianDiagnostic;
