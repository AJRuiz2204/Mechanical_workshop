/* eslint-disable no-unused-vars */
// Frontend: src/components/Diagnostic/TechnicianDiagnostic.jsx
import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { createTechnicianDiagnostic, getTechnicianDiagnostic, updateTechnicianDiagnostic } from "../../../services/TechnicianDiagnosticService";
import { getDiagnosticById } from "../../../services/DiagnosticService";
import "./Diagnostic.css";

const TechnicianDiagnostic = () => {
  const navigate = useNavigate();
  const { diagnosticId, techDiagId } = useParams(); // Routes: create/:diagnosticId and edit/:techDiagId

  // Determine the mode: creation or editing
  const isEditMode = Boolean(techDiagId);

  // State for the related diagnostic
  const [diagnostic, setDiagnostic] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    mileage: "",
    extendedDiagnostic: "",
  });

  // State for error and success messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Loading state
  const [loading, setLoading] = useState(true);

  // Fetch diagnostic information when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setErrorMessage("");
        setSuccessMessage("");

        if (isEditMode) {
          // Edit mode: Get TechnicianDiagnostic
          const techDiag = await getTechnicianDiagnostic(techDiagId);
          setFormData({
            mileage: techDiag.mileage,
            extendedDiagnostic: techDiag.extendedDiagnostic,
          });
          // Get the related diagnostic
          const diag = await getDiagnosticById(techDiag.diagnosticId);
          setDiagnostic(diag);
        } else {
          // Creation mode: Get the related diagnostic
          const diag = await getDiagnosticById(diagnosticId);
          setDiagnostic(diag);
        }
      } catch (error) {
        setErrorMessage(error.message || "Error loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [diagnosticId, techDiagId, isEditMode]);

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

    // Basic validations
    if (!formData.mileage) {
      setErrorMessage("Mileage is required.");
      return;
    }

    if (!formData.extendedDiagnostic.trim()) {
      setErrorMessage("Extended diagnostic is required.");
      return;
    }

    // Convert mileage to number
    const mileageNumber = parseInt(formData.mileage, 10);
    if (isNaN(mileageNumber)) {
      setErrorMessage("Mileage must be a valid number.");
      return;
    }

    // Payload for TechnicianDiagnostic
    const techDiagData = {
      mileage: mileageNumber,
      extendedDiagnostic: formData.extendedDiagnostic.trim(),
    };

    try {
      if (isEditMode) {
        // Edit mode: Update the existing TechnicianDiagnostic
        await updateTechnicianDiagnostic(techDiagId, techDiagData);
        setSuccessMessage("Technician Diagnostic updated successfully.");
      } else {
        // Creation mode: Create a new TechnicianDiagnostic
        const payload = {
          diagnosticId: diagnostic.id,
          ...techDiagData,
        };
        await createTechnicianDiagnostic(payload);
        setSuccessMessage("Technician Diagnostic created successfully.");
      }
      // Redirect to the diagnostics list after saving
      navigate("/diagnostic-list");
    } catch (error) {
      setErrorMessage("Error saving the Technician Diagnostic: " + error.message);
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

  if (!diagnostic) {
    return (
      <Container className="p-4 border rounded">
        <Alert variant="danger">Could not load diagnostic information.</Alert>
        <Button variant="secondary" onClick={() => navigate("/diagnostic-list")}>
          Back to Diagnostics List
        </Button>
      </Container>
    );
  }

  return (
    <Container className="p-4 border rounded bg-light">
      <h3>{isEditMode ? "Edit Technician Diagnostic" : "Assign Technician Diagnostic"}</h3>

      {/* Display error or success messages */}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Vehicle Information (read-only) */}
      <h5>Vehicle Information</h5>
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group controlId="vin">
            <Form.Label>VIN</Form.Label>
            <Form.Control type="text" value={diagnostic.vehicle?.vin || "N/A"} readOnly />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="make">
            <Form.Label>Make</Form.Label>
            <Form.Control type="text" value={diagnostic.vehicle?.make || "N/A"} readOnly />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="model">
            <Form.Label>Model</Form.Label>
            <Form.Control type="text" value={diagnostic.vehicle?.model || "N/A"} readOnly />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="plate">
            <Form.Label>Plate</Form.Label>
            <Form.Control type="text" value={diagnostic.vehicle?.plate || "N/A"} readOnly />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group controlId="engine">
            <Form.Label>Engine</Form.Label>
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
            <Form.Label>Reason for Visit</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={diagnostic.reasonForVisit || "N/A"}
              readOnly
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Technician Diagnostic Form */}
      <Form onSubmit={handleSubmit}>
        <h5>Technician Diagnostic Information</h5>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="mileage">
              <Form.Label>Vehicle Mileage</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="extendedDiagnostic">
              <Form.Label>Extended Diagnostic</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Reported issues, tests performed, recommendations..."
                name="extendedDiagnostic"
                value={formData.extendedDiagnostic}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Buttons */}
        <div className="d-flex justify-content-end">
          <Button variant="secondary" className="me-2" onClick={() => navigate("/diagnostic-list")}>
            Cancel
          </Button>
          <Button variant="success" type="submit">
            {isEditMode ? "Save Changes" : "Save Technician Diagnostic"}
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default TechnicianDiagnostic;
