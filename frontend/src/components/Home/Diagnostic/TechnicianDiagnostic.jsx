/* eslint-disable no-unused-vars */
import React from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import "./Diagnostic.css";

const TechnicianDiagnostic = () => {
  return (
    <div className="p-4 border rounded">
      <h3>DIAGNÓSTICO DEL TÉCNICO</h3>

      {/* Información del Vehículo */}
      <h5>Información del Vehículo</h5>
      <Row className="mb-3">
        <Col md={2}>
          <Form.Group controlId="vin">
            <Form.Label>VIN</Form.Label>
            <Form.Control type="text" placeholder="Caja de texto" readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="make">
            <Form.Label>Marca</Form.Label>
            <Form.Control type="text" placeholder="Caja de texto" readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="model">
            <Form.Label>Modelo</Form.Label>
            <Form.Control type="text" placeholder="Caja de texto" readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="plate">
            <Form.Label>Placa</Form.Label>
            <Form.Control type="text" placeholder="Caja de texto" readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="engine">
            <Form.Label>Motor</Form.Label>
            <Form.Control type="text" placeholder="Caja de texto" readOnly />
          </Form.Group>
        </Col>
      </Row>

      {/* Información del Diagnóstico */}
      <h5>Información del Diagnóstico</h5>
      <Form.Group controlId="reason" className="mb-3">
        <Form.Label>Motivo de la Visita</Form.Label>
        <Form.Control
          type="text"
          placeholder="CAMBIO DE PAN DE ACEITE DEL MOTOR"
          readOnly
        />
      </Form.Group>

      <Form.Group controlId="mileage" className="mb-3">
        <Form.Label>Kilometraje del Vehículo</Form.Label>
        <Form.Control type="number" placeholder="Caja de texto" required />
      </Form.Group>

      <Form.Group controlId="extended-diagnostic" className="mb-3">
        <Form.Label>Diagnóstico Extendido</Form.Label>
        <Form.Control
          as="textarea"
          rows={6}
          placeholder="Problemas reportados, pruebas realizadas, recomendaciones..."
          required
        />
      </Form.Group>

      {/* Botones */}
      <Row>
        <Col>
          <Button variant="secondary" className="me-2">
            Cancelar
          </Button>
          <Button variant="success">Guardar Diagnóstico</Button>
        </Col>
      </Row>
    </div>
  );
};

export default TechnicianDiagnostic;
