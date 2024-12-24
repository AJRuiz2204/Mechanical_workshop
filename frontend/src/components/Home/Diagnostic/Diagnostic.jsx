/* eslint-disable no-unused-vars */
// src/components/Diagnostic/Diagnostic.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Container, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getVehicleById } from "../../../services/VehicleService"; // Ajusta la ruta
import { createDiagnostic } from "../../../services/DiagnosticService"; // Ajusta la ruta

const Diagnostic = () => {
  const { id } = useParams(); // /diagnostic/:id
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState({
    id: 0,
    vin: "",
    make: "",
    model: "",
    engine: "",
    plate: "",
    state: "",
    userWorkshopId: 0,
    userWorkshop: null, // { id, name, lastName, etc. }
  });

  const [assignedTechnician, setAssignedTechnician] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [technicians, setTechnicians] = useState(["Mario Aguirre", "Jane Doe", "John Smith"]);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setErrorMessage("");
        setSuccessMessage("");

        const data = await getVehicleById(id);
        // data es un VehicleReadDto: { id, vin, make, model, ..., userWorkshopId, userWorkshop }
        setVehicle(data);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!assignedTechnician.trim()) {
      setErrorMessage("Debes asignar un técnico.");
      return;
    }
    if (!reasonForVisit.trim()) {
      setErrorMessage("La razón de visita es obligatoria.");
      return;
    }

    const payload = {
      vehicleId: vehicle.id, // Debe existir en Vehicles
      assignedTechnician,
      reasonForVisit,
    };

    try {
      await createDiagnostic(payload);
      setSuccessMessage("El diagnóstico se ha registrado correctamente.");
      // Opcional: navegar a otra vista o limpiar campos
      // navigate("/diagnostics-list");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <Container className="p-4 border rounded bg-light">
      <h3>Módulo de Diagnóstico</h3>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <h5>Información del Vehículo</h5>
      <Row className="mb-3">
        <Col md={2}>
          <Form.Group>
            <Form.Label>VIN</Form.Label>
            <Form.Control type="text" value={vehicle.vin} readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Marca</Form.Label>
            <Form.Control type="text" value={vehicle.make} readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Modelo</Form.Label>
            <Form.Control type="text" value={vehicle.model} readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Motor</Form.Label>
            <Form.Control type="text" value={vehicle.engine} readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Placa</Form.Label>
            <Form.Control type="text" value={vehicle.plate} readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Dueño (UserWorkshop)</Form.Label>
            {vehicle.userWorkshop ? (
              <Form.Control
                type="text"
                value={`${vehicle.userWorkshop.name} ${vehicle.userWorkshop.lastName}`}
                readOnly
              />
            ) : (
              <Form.Control type="text" value="Desconocido" readOnly />
            )}
          </Form.Group>
        </Col>
      </Row>

      <Form onSubmit={handleSubmit}>
        <h5>Información de Diagnóstico</h5>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Asignar Técnico</Form.Label>
              <Form.Select
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                required
              >
                <option value="">-- Seleccionar --</option>
                {technicians.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Razón de Visita</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end">
          <Button variant="secondary" className="me-2" onClick={() => navigate("/vehicle-list")}>
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
