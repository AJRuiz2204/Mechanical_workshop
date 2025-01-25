/* eslint-disable no-unused-vars */
// Frontend: src/components/Diagnostic/TechnicianDiagnostic.jsx
import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col, Alert, Spinner, Modal } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  createTechnicianDiagnostic,
  getTechnicianDiagnostic,
  updateTechnicianDiagnostic,
  deleteTechnicianDiagnostic,
} from "../../../services/TechnicianDiagnosticService";
import { getDiagnosticById } from "../../../services/DiagnosticService";
import "./Diagnostic.css";

const TechnicianDiagnostic = () => {
  const navigate = useNavigate();
  const { diagnosticId, techDiagId } = useParams();

  // State to determine the mode: creation or editing
  const [isEditMode, setIsEditMode] = useState(false);

  // State for the related diagnostic
  const [diagnostic, setDiagnostic] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    mileage: "", // Initialize as empty string
    extendedDiagnostic: "",
  });

  // State for error and success messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Loading state
  const [loading, setLoading] = useState(true);

  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch diagnostic information when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!diagnosticId || diagnosticId === "undefined") return;
      try {
        setErrorMessage("");
        setSuccessMessage("");

        const diag = await getDiagnosticById(diagnosticId);
        setDiagnostic(diag);

        // If there's at least one TechnicianDiagnostic
        if (diag.technicianDiagnostics?.length) {
          setIsEditMode(true);
          // Populate formData with the first TechnicianDiagnostic
          const existingTechDiag = diag.technicianDiagnostics[0];
          const formattedMileage = formatMileage(existingTechDiag.mileage);
          setFormData({
            mileage: formattedMileage,
            extendedDiagnostic: existingTechDiag.extendedDiagnostic,
          });
        }
      } catch (error) {
        setErrorMessage(error.message || "Error loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [diagnosticId]);

  /**
   * Formats a number into "xxx,xxx" format.
   *
   * @param {number} num - The number to format.
   * @returns {string} - The formatted mileage string.
   */
  const formatMileage = (num) => {
    if (isNaN(num)) return "";
    return num.toLocaleString("en-US", { minimumIntegerDigits: 1, useGrouping: true });
  };

  /**
   * Parses a formatted mileage string "xxx,xxx" back to a number.
   *
   * @param {string} str - The formatted mileage string.
   * @returns {number} - The numeric mileage.
   */
  const parseMileage = (str) => {
    const num = parseInt(str.replace(/,/g, ""), 10);
    return isNaN(num) ? 0 : num;
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle mileage input changes with formatting
  const handleMileageChange = (e) => {
    let val = e.target.value.replace(/\D/g, ""); // Remove non-digits

    if (val.length > 6) val = val.slice(0, 6); // Limit to 6 digits

    if (val.length === 0) {
      setFormData({ ...formData, mileage: "" });
      return;
    }

    let numericVal = parseInt(val, 10);
    if (isNaN(numericVal)) numericVal = 0;
    if (numericVal > 999999) numericVal = 999999; // Cap at 999,999

    // Format as "xxx,xxx"
    val = numericVal.toLocaleString("en-US", { minimumIntegerDigits: 1, useGrouping: true });
    setFormData({ ...formData, mileage: val });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Parse mileage
    const mileageNumber = parseMileage(formData.mileage);

    // Basic validations
    if (!formData.mileage || mileageNumber === 0) {
      setErrorMessage("Mileage is required and cannot be zero.");
      return;
    }

    if (!formData.extendedDiagnostic.trim()) {
      setErrorMessage("Extended diagnostic is required.");
      return;
    }

    if (mileageNumber < 1 || mileageNumber > 999999) {
      setErrorMessage("Mileage must be between 1 and 999,999.");
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
        await updateTechnicianDiagnostic(diagnostic.technicianDiagnostics[0]?.id, techDiagData);
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
      navigate("/technicianDiagnosticList");
    } catch (error) {
      setErrorMessage("Error saving the Technician Diagnostic: " + error.message);
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    try {
      await deleteTechnicianDiagnostic(diagnostic.technicianDiagnostics[0]?.id);
      setSuccessMessage("Technician Diagnostic deleted successfully.");
      navigate("/technicianDiagnosticList");
    } catch (error) {
      setErrorMessage("Error deleting the Technician Diagnostic: " + error.message);
    }
  };

  // Render loading spinner
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

  // Render error if diagnostic not found
  if (!diagnostic) {
    return (
      <Container className="p-4 border rounded">
        <Alert variant="danger">Could not load diagnostic information.</Alert>
        <Button variant="secondary" onClick={() => navigate("/technicianDiagnosticList")}>
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
                type="text"
                placeholder="Enter mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleMileageChange}
                required
                maxLength={7} // "999,999" has 7 characters
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
          <Button
            variant="secondary"
            className="me-2"
            onClick={() => navigate("/technicianDiagnosticList")}
          >
            Cancel
          </Button>
          {isEditMode && (
            <Button
              variant="danger"
              className="me-2"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          )}
          <Button variant="success" type="submit">
            {isEditMode ? "Save Changes" : "Save Technician Diagnostic"}
          </Button>
        </div>
      </Form>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Technician Diagnostic</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this Technician Diagnostic?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TechnicianDiagnostic;
