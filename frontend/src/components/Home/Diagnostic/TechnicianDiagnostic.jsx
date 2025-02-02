/* eslint-disable no-unused-vars */
// src/components/Diagnostic/TechnicianDiagnostic.jsx

import React, { useEffect, useState } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  createTechnicianDiagnostic,
  getTechnicianDiagnostic,
  updateTechnicianDiagnostic,
  deleteTechnicianDiagnostic,
} from "../../../services/TechnicianDiagnosticService";
import { getDiagnosticById } from "../../../services/DiagnosticService";
import "./Diagnostic.css";
import NotesSection from "../../NotesSection/NotesSection";

/**
 * TechnicianDiagnostic Component
 * This component allows a technician to create or edit a diagnostic associated with a vehicle.
 * It uses a mileage field with formatting, an extended diagnostic description,
 * and provides the ability to delete an existing diagnostic.
 *
 * Features:
 *  - Displays vehicle information tied to a diagnostic.
 *  - Allows mileage input with validation (1 to 999,999) and formatting.
 *  - Allows entering an extended diagnostic description.
 *  - Provides the option to save or delete the diagnostic.
 *  - Integrates a notes section for additional technician notes.
 *  - Navigates back to the TechnicianDiagnosticList after saving or deleting.
 *
 * @returns {JSX.Element}
 */
const TechnicianDiagnostic = () => {
  const navigate = useNavigate();
  const { diagnosticId, techDiagId } = useParams();
  const location = useLocation();
  const { vehicle } = location.state || {};

  // Determines if the component is in edit or create mode
  const [isEditMode, setIsEditMode] = useState(false);

  // Holds the diagnostic data retrieved from the server
  const [diagnostic, setDiagnostic] = useState(null);

  // Holds the technician diagnostic data when editing
  const [technicianDiagnostic, setTechnicianDiagnostic] = useState(null);

  // Form state for mileage and extended diagnostic
  const [formData, setFormData] = useState({
    mileage: "",
    extendedDiagnostic: "",
  });

  // Error and success messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Loading indicator
  const [loading, setLoading] = useState(true);

  // Modal state for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /**
   * Formats the mileage with grouping separators.
   * @param {number} num - The numeric mileage.
   * @returns {string} The formatted mileage.
   */
  const formatMileage = (num) => {
    if (isNaN(num)) return "";
    return num.toLocaleString("en-US", {
      minimumIntegerDigits: 1,
      useGrouping: true,
    });
  };

  /**
   * Parses the formatted mileage back into a number.
   * @param {string} str - The formatted mileage.
   * @returns {number} The numeric mileage.
   */
  const parseMileage = (str) => {
    const num = parseInt(str.replace(/,/g, ""), 10);
    return isNaN(num) ? 0 : num;
  };

  /**
   * Handles changes in the form fields for extendedDiagnostic.
   * @param {Object} e - The event object.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * Handles changes in the mileage field, ensuring only numeric input up to 6 digits.
   * Applies formatting.
   * @param {Object} e - The event object.
   */
  const handleMileageChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 6) val = val.slice(0, 6);
    if (val.length === 0) {
      setFormData({ ...formData, mileage: "" });
      return;
    }
    let numericVal = parseInt(val, 10);
    if (isNaN(numericVal)) numericVal = 0;
    if (numericVal > 999999) numericVal = 999999;
    val = numericVal.toLocaleString("en-US", {
      minimumIntegerDigits: 1,
      useGrouping: true,
    });
    setFormData({ ...formData, mileage: val });
  };

  /**
   * Submits the form data to create or update the technician diagnostic.
   * @param {Object} e - The form submit event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const mileageNumber = parseMileage(formData.mileage);
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

    const techDiagData = {
      mileage: mileageNumber,
      extendedDiagnostic: formData.extendedDiagnostic.trim(),
    };

    try {
      if (isEditMode) {
        // Update existing technician diagnostic
        await updateTechnicianDiagnostic(technicianDiagnostic.id, techDiagData);
        setSuccessMessage("Technician Diagnostic updated successfully.");
      } else {
        // Create a new technician diagnostic
        const payload = {
          diagnosticId: diagnostic.id,
          ...techDiagData,
        };
        await createTechnicianDiagnostic(payload);
        setSuccessMessage("Technician Diagnostic created successfully.");
      }
      navigate("/technicianDiagnosticList");
    } catch (error) {
      setErrorMessage(
        "Error saving the Technician Diagnostic: " + error.message
      );
    }
  };

  /**
   * Handles deletion of the technician diagnostic.
   */
  const handleDelete = async () => {
    try {
      await deleteTechnicianDiagnostic(technicianDiagnostic.id);
      setSuccessMessage("Technician Diagnostic deleted successfully.");
      navigate("/technicianDiagnosticList");
    } catch (error) {
      setErrorMessage(
        "Error deleting the Technician Diagnostic: " + error.message
      );
    }
  };

  /**
   * Fetches diagnostic and technician diagnostic data if applicable,
   * determining whether the component is in edit mode.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setErrorMessage("");
        setSuccessMessage("");

        if (diagnosticId) {
          // Retrieve diagnostic by ID
          const diag = await getDiagnosticById(diagnosticId);
          setDiagnostic(diag);
          // Check if there's already a technician diagnostic
          if (diag.technicianDiagnostics?.length) {
            const existingTechDiag = diag.technicianDiagnostics[0];
            setIsEditMode(true);
            setTechnicianDiagnostic(existingTechDiag);
            const formattedMileage = formatMileage(existingTechDiag.mileage);
            setFormData({
              mileage: formattedMileage,
              extendedDiagnostic: existingTechDiag.extendedDiagnostic,
            });
          }
        } else if (techDiagId) {
          // Edit mode with existing technician diagnostic
          setIsEditMode(true);
          const techDiag = await getTechnicianDiagnostic(techDiagId);
          setTechnicianDiagnostic(techDiag);
          const diagId = techDiag.diagnosticId;
          const diag = await getDiagnosticById(diagId);
          setDiagnostic(diag);
          setFormData({
            mileage: formatMileage(techDiag.mileage),
            extendedDiagnostic: techDiag.extendedDiagnostic,
          });
        } else {
          setErrorMessage("Invalid route parameters.");
        }
      } catch (error) {
        setErrorMessage(error.message || "Error loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [diagnosticId, techDiagId]);

  if (loading) {
    return (
      <Container className="p-4 border rounded">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "200px" }}
        >
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
        <Button
          variant="secondary"
          onClick={() => navigate("/technicianDiagnosticList")}
        >
          Back to Diagnostics List
        </Button>
      </Container>
    );
  }

  return (
    <Container className="p-4 border rounded bg-light">
      <h3>
        {isEditMode
          ? "Edit Technician Diagnostic"
          : "Assign Technician Diagnostic"}
      </h3>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Vehicle Information */}
      <h5>Vehicle Information</h5>
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group controlId="vin">
            <Form.Label>VIN</Form.Label>
            <Form.Control
              type="text"
              value={diagnostic.vehicle?.vin || "N/A"}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="make">
            <Form.Label>Make</Form.Label>
            <Form.Control
              type="text"
              value={diagnostic.vehicle?.make || "N/A"}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="model">
            <Form.Label>Model</Form.Label>
            <Form.Control
              type="text"
              value={diagnostic.vehicle?.model || "N/A"}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="plate">
            <Form.Label>Plate</Form.Label>
            <Form.Control
              type="text"
              value={diagnostic.vehicle?.plate || "N/A"}
              readOnly
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group controlId="engine">
            <Form.Label>Engine</Form.Label>
            <Form.Control
              type="text"
              value={diagnostic.vehicle?.engine || "N/A"}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Control
              type="text"
              value={diagnostic.vehicle?.status || "N/A"}
              readOnly
            />
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
                maxLength={7}
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

      {/* Pass the correct TechnicianDiagnostic ID to the Notes section */}
      <NotesSection
        diagId={diagnostic.id}
        techDiagId={technicianDiagnostic?.id}
      />

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Technician Diagnostic</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this Technician Diagnostic?
        </Modal.Body>
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
