/* eslint-disable no-unused-vars */
// src/components/Home/Diagnostic/TechnicianDiagnosticEdit.jsx
import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getTechnicianDiagnostic, updateTechnicianDiagnostic } from "../../../services/TechnicianDiagnosticService";
import "./Diagnostic.css";

const TechnicianDiagnosticEdit = () => {
  const navigate = useNavigate();
  const { techDiagId } = useParams(); // Ruta: /technicianDiagnostic/edit/:techDiagId

  const [techDiag, setTechDiag] = useState({
    id: 0,
    diagnosticId: 0,
    mileage: 0,
    extendedDiagnostic: "",
    reasonForVisit: "",
    vehicleId: 0,
    vehicle: {
      id: 0,
      vin: "",
      make: "",
      model: "",
      plate: "",
      engine: "",
      status: "",
    },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechDiag = async () => {
      try {
        const data = await getTechnicianDiagnostic(techDiagId);
        setTechDiag(data);
      } catch (error) {
        alert("Error al obtener el Diagnóstico Técnico: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    if (techDiagId) {
      fetchTechDiag();
    }
  }, [techDiagId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTechDiag({ ...techDiag, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        diagnosticId: techDiag.diagnosticId,
        mileage: parseInt(techDiag.mileage, 10),
        extendedDiagnostic: techDiag.extendedDiagnostic,
      };
      await updateTechnicianDiagnostic(techDiag.id, payload);
      alert("Diagnóstico Técnico actualizado con éxito.");
      navigate("/diagnostic-list");
    } catch (error) {
      alert("Error al actualizar el Diagnóstico Técnico: " + error.message);
    }
  };

  if (loading) {
    return <Container className="p-4 border rounded">Cargando...</Container>;
  }

  return (
    <Container className="p-4 border rounded">
      <h3>Editar Diagnóstico Técnico</h3>
      <Form onSubmit={handleSubmit}>
        {/* Información del Diagnóstico */}
        <Form.Group className="mb-3">
          <Form.Label>ID Diagnostic</Form.Label>
          <Form.Control type="text" value={techDiag.diagnosticId} readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Motivo de la Visita</Form.Label>
          <Form.Control type="text" value={techDiag.reasonForVisit} readOnly />
        </Form.Group>

        {/* Información del Vehículo */}
        <h5>Información del Vehículo</h5>
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label>VIN</Form.Label>
              <Form.Control type="text" value={techDiag.vehicle?.vin || ""} readOnly />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Marca</Form.Label>
              <Form.Control type="text" value={techDiag.vehicle?.make || ""} readOnly />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Modelo</Form.Label>
              <Form.Control type="text" value={techDiag.vehicle?.model || ""} readOnly />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Placa</Form.Label>
              <Form.Control type="text" value={techDiag.vehicle?.plate || ""} readOnly />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Motor</Form.Label>
              <Form.Control type="text" value={techDiag.vehicle?.engine || ""} readOnly />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Control type="text" value={techDiag.vehicle?.status || ""} readOnly />
            </Form.Group>
          </Col>
        </Row>

        {/* Campos Editables */}
        <Form.Group className="mb-3">
          <Form.Label>Kilometraje</Form.Label>
          <Form.Control
            type="number"
            name="mileage"
            value={techDiag.mileage}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Diagnóstico Extendido</Form.Label>
          <Form.Control
            as="textarea"
            rows={6}
            name="extendedDiagnostic"
            value={techDiag.extendedDiagnostic}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Botones */}
        <Row>
          <Col>
            <Button
              variant="secondary"
              className="me-2"
              onClick={() => navigate("/diagnostic-list")}
            >
              Cancelar
            </Button>
            <Button variant="success" type="submit">
              Guardar Cambios
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default TechnicianDiagnosticEdit;
