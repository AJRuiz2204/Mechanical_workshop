/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";

const VehicleReception = () => {
  const [vehicles, setVehicles] = useState([{ vin: "", make: "", model: "", year: "", engine: "", plate: "", state: "" }]);

  const addVehicle = () => {
    setVehicles([...vehicles, { vin: "", make: "", model: "", year: "", engine: "", plate: "", state: "" }]);
  };

  const handleVehicleChange = (index, field, value) => {
    const updatedVehicles = [...vehicles];
    updatedVehicles[index][field] = value;
    setVehicles(updatedVehicles);
  };

  return (
    <Form className="p-4 border rounded">
      <h3>Gestión de Clientes y Vehículos</h3>

      {/* Datos del Cliente */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Nombre</Form.Label>
            <Form.Control type="text" placeholder="John" required />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Apellido</Form.Label>
            <Form.Control type="text" placeholder="Smith" required />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Número Primario</Form.Label>
            <Form.Control type="text" placeholder="(XXX)XXX-XXXX" required />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Label>Número Secundario</Form.Label>
            <Form.Control type="text" placeholder="(XXX)XXX-XXXX" />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Correo Electrónico</Form.Label>
            <Form.Control type="email" placeholder="example@email.com" required />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <Form.Check type="checkbox" label="No cobrar impuestos" />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Dirección</Form.Label>
            <Form.Control type="text" placeholder="123 Street Name" required />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>Ciudad</Form.Label>
            <Form.Control type="text" placeholder="City" required />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Estado</Form.Label>
            <Form.Control type="text" placeholder="State" required />
          </Form.Group>
        </Col>
        <Col md={1}>
          <Form.Group>
            <Form.Label>Código Postal</Form.Label>
            <Form.Control type="text" placeholder="ZIP" required />
          </Form.Group>
        </Col>
      </Row>

      {/* Datos del Vehículo */}
      <h4 className="mt-4">Datos del Vehículo</h4>
      {vehicles.map((vehicle, index) => (
        <div key={index} className="border rounded p-3 mb-3">
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>VIN</Form.Label>
                <Form.Control
                  type="text"
                  value={vehicle.vin}
                  onChange={(e) => handleVehicleChange(index, "vin", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Marca</Form.Label>
                <Form.Control
                  type="text"
                  value={vehicle.make}
                  onChange={(e) => handleVehicleChange(index, "make", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Modelo</Form.Label>
                <Form.Control
                  type="text"
                  value={vehicle.model}
                  onChange={(e) => handleVehicleChange(index, "model", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Año</Form.Label>
                <Form.Control
                  type="text"
                  value={vehicle.year}
                  onChange={(e) => handleVehicleChange(index, "year", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Motor</Form.Label>
                <Form.Control
                  type="text"
                  value={vehicle.engine}
                  onChange={(e) => handleVehicleChange(index, "engine", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Placa</Form.Label>
                <Form.Control
                  type="text"
                  value={vehicle.plate}
                  onChange={(e) => handleVehicleChange(index, "plate", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Estado de la Placa</Form.Label>
                <Form.Control
                  type="text"
                  value={vehicle.state}
                  onChange={(e) => handleVehicleChange(index, "state", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
        </div>
      ))}
      <Button variant="primary" onClick={addVehicle} className="mb-3">
        Agregar Vehículo
      </Button>

      {/* Botones de Guardar y Cancelar */}
      <Row>
        <Col>
          <Button variant="secondary" className="me-2">
            Cancelar
          </Button>
          <Button variant="success">Guardar</Button>
        </Col>
      </Row>
    </Form>
  );
};

export default VehicleReception;
