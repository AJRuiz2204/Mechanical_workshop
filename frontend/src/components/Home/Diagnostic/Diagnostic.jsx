/* eslint-disable no-unused-vars */
// Frontend: src/components/Diagnostic/Diagnostic.jsx

import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { createDiagnostic } from "../../../services/DiagnosticService";
import { getVehicleById } from "../../../services/VehicleService";
import technicianService from "../../../services/technicianService"; // Import technician service
import "./Diagnostic.css";

const Diagnostic = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get vehicle ID from route parameters

  // State for storing vehicle information
  const [vehicle, setVehicle] = useState(null);

  // State for storing technicians data
  const [technicians, setTechnicians] = useState([]);
  const [techLoading, setTechLoading] = useState(true);
  const [techError, setTechError] = useState("");

  // State for storing form data for diagnostic creation
  const [formData, setFormData] = useState({
    reasonForVisit: "",
    assignedTechnician: "", // Assigned technician information
  });

  // State for storing error and success messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // State for loading vehicle data
  const [loading, setLoading] = useState(true);

  // useEffect to fetch vehicle information when component mounts
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        if (!id) {
          setErrorMessage("No vehicle ID provided.");
          setLoading(false);
          return;
        }
        // Retrieve vehicle data using the vehicle ID
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

  // useEffect to fetch technicians information when component mounts
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        // Retrieve technicians data from the service
        const data = await technicianService.getTechnicians();
        setTechnicians(data);
      } catch (error) {
        setTechError("Error fetching technicians: " + error.message);
      } finally {
        setTechLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

  // Handle changes in the form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Update the formData state with new input value
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission for creating a new diagnostic
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Reset error and success messages
    setErrorMessage("");
    setSuccessMessage("");

    // Validate that a technician has been assigned
    if (!formData.assignedTechnician.trim()) {
      setErrorMessage("You must assign a technician.");
      return;
    }
    // Validate that reason for visit is provided
    if (!formData.reasonForVisit.trim()) {
      setErrorMessage("Reason for visit is required.");
      return;
    }

    // Construct the diagnostic data payload
    const diagnosticData = {
      vehicleId: parseInt(id, 10),
      assignedTechnician: formData.assignedTechnician.trim(),
      reasonForVisit: formData.reasonForVisit.trim(),
    };

    try {
      // Call the service to create a diagnostic
      await createDiagnostic(diagnosticData);
      setSuccessMessage("Diagnostic created successfully.");
      // Redirect to diagnostics list after successful creation
      navigate("/diagnostic-list");
    } catch (error) {
      // Set error message if diagnostic creation fails
      setErrorMessage("Error creating diagnostic: " + error.message);
    }
  };

  // If either vehicle or technicians are still loading, display a spinner
  if (loading || techLoading) {
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

  // If there is an error message, display it with a button to return to the diagnostics list
  if (errorMessage) {
    return (
      <Container className="p-4 border rounded">
        <Alert variant="danger">{errorMessage}</Alert>
        <Button
          variant="secondary"
          onClick={() => navigate("/diagnostic-list")}
        >
          Back to Diagnostics List
        </Button>
      </Container>
    );
  }

  return (
    <Container className="p-4 border rounded bg-light">
      <h3>Create Diagnostic</h3>

      {/* Display success or technician error messages */}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {techError && <Alert variant="danger">{techError}</Alert>}

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
            {/* Dropdown to select an assigned technician */}
            <Form.Group controlId="assignedTechnician">
              <Form.Label>Assign Technician</Form.Label>
              <Form.Select
                name="assignedTechnician"
                value={formData.assignedTechnician}
                onChange={handleChange}
                required
              >
                <option value="">-- Select --</option>
                {technicians.length > 0 ? (
                  technicians.map((tech) => (
                    <option
                      key={tech.ID}
                      value={`${tech.name} ${tech.lastName}`}
                    >
                      {`${tech.name} ${tech.lastName}`}
                    </option>
                  ))
                ) : (
                  <option disabled>No technicians available</option>
                )}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            {/* Textarea for entering the reason for visit */}
            <Form.Group controlId="reasonForVisit">
              <Form.Label>Costumer State</Form.Label>
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

        {/* Action buttons for cancelling or saving the diagnostic */}
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
