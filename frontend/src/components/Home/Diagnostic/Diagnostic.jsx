/* eslint-disable no-unused-vars */
// src/components/Diagnostic/Diagnostic.jsx

import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { createDiagnostic } from "../../../services/DiagnosticService";
import { getVehicleById } from "../../../services/VehicleService";
import "./Diagnostic.css";

const Diagnostic = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Asegúrate de que tu ruta sea /diagnostic/:id

  // Estado para el vehículo
  const [vehicle, setVehicle] = useState(null);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    reasonForVisit: "",
    assignedTechnician: "", // Agregado para incluir el técnico asignado
  });

  // Estado para mensajes de error y éxito
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Estado de carga
  const [loading, setLoading] = useState(true);

  // Obtener información del vehículo al montar el componente
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        if (!id) {
          setErrorMessage("No vehicle ID provided.");
          setLoading(false);
          return;
        }
        const data = await getVehicleById(id);
        setVehicle(data);
      } catch (error) {
        setErrorMessage("Error al obtener la información del vehículo: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

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

    // Validación del formulario
    if (!formData.assignedTechnician.trim()) {
      setErrorMessage("Debes asignar un técnico.");
      return;
    }
    if (!formData.reasonForVisit.trim()) {
      setErrorMessage("El motivo de la visita es obligatorio.");
      return;
    }

    // Payload para crear el diagnóstico
    const diagnosticData = {
      vehicleId: parseInt(id, 10),
      assignedTechnician: formData.assignedTechnician.trim(),
      reasonForVisit: formData.reasonForVisit.trim(),
    };

    try {
      await createDiagnostic(diagnosticData);
      setSuccessMessage("Diagnóstico creado con éxito.");
      // Redirigir a la lista de diagnósticos después de crear
      navigate("/diagnostic-list");
    } catch (error) {
      setErrorMessage("Error al crear el diagnóstico: " + error.message);
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

  if (!vehicle) {
    return (
      <Container className="p-4 border rounded">
        <Alert variant="danger">No se pudo cargar la información del vehículo.</Alert>
        <Button variant="secondary" onClick={() => navigate("/diagnostic-list")}>
          Volver a la Lista de Diagnósticos
        </Button>
      </Container>
    );
  }

  return (
    <Container className="p-4 border rounded bg-light">
      <h3>Crear Diagnóstico</h3>

      {/* Mostrar mensajes de error o éxito */}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Información del Vehículo (read-only) */}
      <h5>Información del Vehículo</h5>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="vin">
            <Form.Label>VIN</Form.Label>
            <Form.Control type="text" value={vehicle.vin} readOnly />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="make">
            <Form.Label>Marca</Form.Label>
            <Form.Control type="text" value={vehicle.make} readOnly />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="model">
            <Form.Label>Modelo</Form.Label>
            <Form.Control type="text" value={vehicle.model} readOnly />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="engine">
            <Form.Label>Motor</Form.Label>
            <Form.Control type="text" value={vehicle.engine} readOnly />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="plate">
            <Form.Label>Placa</Form.Label>
            <Form.Control type="text" value={vehicle.plate} readOnly />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Control type="text" value={vehicle.status} readOnly />
          </Form.Group>
        </Col>
      </Row>

      {/* Formulario de Diagnóstico */}
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="assignedTechnician">
              <Form.Label>Asignar Técnico</Form.Label>
              <Form.Select
                name="assignedTechnician"
                value={formData.assignedTechnician}
                onChange={handleChange}
                required
              >
                <option value="">-- Seleccionar --</option>
                {/* Puedes poblar esta lista dinámicamente si es necesario */}
                <option value="Mario Aguirre">Mario Aguirre</option>
                <option value="Jane Doe">Jane Doe</option>
                <option value="John Smith">John Smith</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="reasonForVisit">
              <Form.Label>Motivo de la Visita</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="reasonForVisit"
                placeholder="Ingrese el motivo de la visita"
                value={formData.reasonForVisit}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end">
          <Button
            variant="secondary"
            className="me-2"
            onClick={() => navigate("/diagnostic-list")}
          >
            Cancelar
          </Button>
          <Button variant="success" type="submit">
            Guardar Diagnóstico
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default Diagnostic;
