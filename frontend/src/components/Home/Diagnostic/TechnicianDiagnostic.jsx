/* eslint-disable no-unused-vars */
import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

const TechnicianDiagnostic = () => {
  return (
    <div className="p-4 border rounded">
      <h3>TECHNICIAN DIAGNOSTIC</h3>

      {/* Vehicle Information */}
      <h5>Vehicle Information</h5>
      <Row className="mb-3">
        <Col md={2}>
          <Form.Group controlId="vin">
            <Form.Label>VIN</Form.Label>
            <Form.Control type="text" placeholder="Text box" readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="make">
            <Form.Label>Make</Form.Label>
            <Form.Control type="text" placeholder="Text box" readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="model">
            <Form.Label>Model</Form.Label>
            <Form.Control type="text" placeholder="Text box" readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="plate">
            <Form.Label>Plate</Form.Label>
            <Form.Control type="text" placeholder="Text box" readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group controlId="engine">
            <Form.Label>Engine</Form.Label>
            <Form.Control type="text" placeholder="Text box" readOnly />
          </Form.Group>
        </Col>
      </Row>

      {/* Diagnostic Information */}
      <h5>Diagnostic Information</h5>
      <Form.Group controlId="reason" className="mb-3">
        <Form.Label>Reason for Visit</Form.Label>
        <Form.Control type="text" placeholder="CHANGE ENGINE OIL PAN" readOnly />
      </Form.Group>

      <Form.Group controlId="mileage" className="mb-3">
        <Form.Label>Vehicle Mileage</Form.Label>
        <Form.Control type="number" placeholder="Text box" required />
      </Form.Group>

      <Form.Group controlId="extended-diagnostic" className="mb-3">
        <Form.Label>Extended Diagnostic</Form.Label>
        <Form.Control as="textarea" rows={6} placeholder="Reported issues, tests conducted, recommendations..." required />
      </Form.Group>

      {/* Buttons */}
      <Row>
        <Col>
          <Button variant="secondary" className="me-2">
            Cancel
          </Button>
          <Button variant="success">Save</Button>
        </Col>
      </Row>
    </div>
  );
};

export default TechnicianDiagnostic;
