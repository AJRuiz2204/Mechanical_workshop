/* eslint-disable no-unused-vars */
// Frontend: src/components/Home/Diagnostic/TechnicianDiagnosticEdit.jsx
import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getTechnicianDiagnostic, updateTechnicianDiagnostic } from "../../../services/TechnicianDiagnosticService";
import "./Diagnostic.css";

const TechnicianDiagnosticEdit = () => {
  const navigate = useNavigate();
  const { techDiagId } = useParams(); // Route: /technicianDiagnostic/edit/:techDiagId

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
        alert("Error fetching the Technician Diagnostic: " + error.message);
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
      alert("Technician Diagnostic updated successfully.");
      navigate("/diagnostic-list");
    } catch (error) {
      alert("Error updating the Technician Diagnostic: " + error.message);
    }
  };

  if (loading) {
    return <Container className="p-4 border rounded">Loading...</Container>;
  }

  return (
    <Container className="p-4 border rounded">
      <h3>Edit Technician Diagnostic</h3>
      <Form onSubmit={handleSubmit}>
        {/* Diagnostic Information */}
        <Form.Group className="mb-3">
          <Form.Label>Diagnostic ID</Form.Label>
          <Form.Control type="text" value={techDiag.diagnosticId} readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Reason for Visit</Form.Label>
          <Form.Control type="text" value={techDiag.reasonForVisit} readOnly />
        </Form.Group>

        {/* Vehicle Information */}
        <h5>Vehicle Information</h5>
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label>VIN</Form.Label>
              <Form.Control type="text" value={techDiag.vehicle?.vin || ""} readOnly />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Make</Form.Label>
              <Form.Control type="text" value={techDiag.vehicle?.make || ""} readOnly />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Model</Form.Label>
              <Form.Control type="text" value={techDiag.vehicle?.model || ""} readOnly />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Plate</Form.Label>
              <Form.Control type="text" value={techDiag.vehicle?.plate || ""} readOnly />
            </Form.Group>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label>Engine</Form.Label>
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

        {/* Editable Fields */}
        <Form.Group className="mb-3">
          <Form.Label>Mileage</Form.Label>
          <Form.Control
            type="number"
            name="mileage"
            value={techDiag.mileage}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Extended Diagnostic</Form.Label>
          <Form.Control
            as="textarea"
            rows={6}
            name="extendedDiagnostic"
            value={techDiag.extendedDiagnostic}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* Buttons */}
        <Row>
          <Col>
            <Button
              variant="secondary"
              className="me-2"
              onClick={() => navigate("/diagnostic-list")}
            >
              Cancel
            </Button>
            <Button variant="success" type="submit">
              Save Changes
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default TechnicianDiagnosticEdit;
