/* eslint-disable no-unused-vars */
// Frontend: src/components/Diagnostic/Diagnostic.jsx

import React, { useState, useEffect } from "react";
import { Form, Button, Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { createDiagnostic } from "../../../services/DiagnosticService";
import { getVehicleById } from "../../../services/VehicleService";
import "./Diagnostic.css";

const Diagnostic = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Ensure your route is /diagnostic/:id

  // State for the vehicle
  const [vehicle, setVehicle] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    reasonForVisit: "",
    assignedTechnician: "", // Added to include the assigned technician
  });

  // State for error and success messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Loading state
  const [loading, setLoading] = useState(true);

  // Fetch vehicle information when the component mounts
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
        setErrorMessage("Error fetching vehicle information: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Form validation
    if (!formData.assignedTechnician.trim()) {
      setErrorMessage("You must assign a technician.");
      return;
    }
    if (!formData.reasonForVisit.trim()) {
      setErrorMessage("Reason for visit is required.");
      return;
    }

    // Payload to create the diagnostic
    const diagnosticData = {
      vehicleId: parseInt(id, 10),
      assignedTechnician: formData.assignedTechnician.trim(),
      reasonForVisit: formData.reasonForVisit.trim(),
    };

    try {
      await createDiagnostic(diagnosticData);
      setSuccessMessage("Diagnostic created successfully.");
      // Redirect to the diagnostics list after creation
      navigate("/diagnostic-list");
    } catch (error) {
      setErrorMessage("Error creating diagnostic: " + error.message);
    }
  };

  if (loading) {
    return (
      <Container className="p-4 border rounded">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  if (!vehicle) {
    return (
      <Container className="p-4 border rounded">
        <Alert variant="danger">Unable to load vehicle information.</Alert>
        <Button variant="secondary" onClick={() => navigate("/diagnostic-list")}>
          Back to Diagnostics List
        </Button>
      </Container>
    );
  }

  return (
    <Container className="p-4 border rounded bg-light">
      <h3>Create Diagnostic</h3>

      {/* Display error or success messages */}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Vehicle Information (read-only) */}
      <h5>Vehicle Information</h5>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="vin">
            <Form.Label>VIN</Form.Label>
            <Form.Control type="text" value={vehicle.vin} readOnly />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="make">
            <Form.Label>Make</Form.Label>
            <Form.Control type="text" value={vehicle.make} readOnly />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="model">
            <Form.Label>Model</Form.Label>
            <Form.Control type="text" value={vehicle.model} readOnly />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={4}>
          <Form.Group controlId="engine">
            <Form.Label>Engine</Form.Label>
            <Form.Control type="text" value={vehicle.engine} readOnly />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group controlId="plate">
            <Form.Label>Plate</Form.Label>
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

      {/* Diagnostic Form */}
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="assignedTechnician">
              <Form.Label>Assign Technician</Form.Label>
              <Form.Select
                name="assignedTechnician"
                value={formData.assignedTechnician}
                onChange={handleChange}
                required
              >
                <option value="">-- Select --</option>
                {/* You can populate this list dynamically if necessary */}
                <option value="Mario Aguirre">Mario Aguirre</option>
                <option value="Jane Doe">Jane Doe</option>
                <option value="John Smith">John Smith</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="reasonForVisit">
              <Form.Label>Reason for Visit</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="reasonForVisit"
                placeholder="Enter the reason for the visit"
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
            Cancel
          </Button>
          <Button variant="success" type="submit">
            Save Diagnostic
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default Diagnostic;
