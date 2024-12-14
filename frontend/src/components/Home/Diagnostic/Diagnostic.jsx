/* eslint-disable no-unused-vars */
// src/components/Diagnostic/Diagnostic.jsx
import React from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import "./Diagnostic.css";

const Diagnostic = () => {
  // Datos de ejemplo para el vehículo
  const vehicle = {
    vin: "1HGCM82633A123456",
    make: "Honda",
    model: "Accord",
    engine: "1.8L",
    plate: "DEF456",
    owner: "Jane Doe",
  };

  // Lista de técnicos disponibles de ejemplo
  const technicians = ["Mario Aguirre", "Jane Doe", "John Smith"];

  return (
    <div className="p-4 border rounded">
      <h3>DIAGNOSTIC</h3>

      {/* Información del Vehículo */}
      <h5>Vehicle Information</h5>
      <Row className="mb-3">
        <Col md={2}>
          <Form.Group controlId="vin">
            <Form.Label>VIN</Form.Label>
            <Form.Control type="text" value={vehicle.vin} readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="make">
            <Form.Label>Make</Form.Label>
            <Form.Control type="text" value={vehicle.make} readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="model">
            <Form.Label>Model</Form.Label>
            <Form.Control type="text" value={vehicle.model} readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="engine">
            <Form.Label>Engine</Form.Label>
            <Form.Control type="text" value={vehicle.engine} readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="plate">
            <Form.Label>Plate</Form.Label>
            <Form.Control type="text" value={vehicle.plate} readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="owner">
            <Form.Label>Owner</Form.Label>
            <Form.Control type="text" value={vehicle.owner} readOnly />
          </Form.Group>
        </Col>
      </Row>

      {/* Información del Diagnóstico */}
      <h5>Diagnostic Information</h5>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group controlId="technician">
            <Form.Label>Assign Technician</Form.Label>
            <Form.Control as="select" disabled>
              <option>Mario Aguirre</option>
              <option>Jane Doe</option>
              <option>John Smith</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="reason">
            <Form.Label>Reason for Visit</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value="Oil leak from the engine pan."
              readOnly
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Botones */}
      <Row>
        <Col>
          <Button variant="secondary" className="me-2" disabled>
            Cancel
          </Button>
          <Button variant="success" disabled>
            Save Diagnostic
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default Diagnostic;
