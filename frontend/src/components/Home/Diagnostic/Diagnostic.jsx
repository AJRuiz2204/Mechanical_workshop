/* eslint-disable no-unused-vars */
// src/components/Diagnostic/Diagnostic.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Container, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { getVehicleById } from "../../../services/VehicleService"; // Adjust the path as needed
import { createDiagnostic } from "../../../services/DiagnosticService"; // Adjust the path as needed

const Diagnostic = () => {
  // 'id' comes from the route: /diagnostic/:id
  const { id } = useParams();
  const navigate = useNavigate();

  // Local state for the vehicle details
  const [vehicle, setVehicle] = useState({
    id: 0,
    vin: "",
    make: "",
    model: "",
    engine: "",
    plate: "",
    state: "",
    userWorkshopId: 0,
    // userWorkshop can contain information like { name, lastName, etc. }
    userWorkshop: null,
  });

  // Local state for diagnostic form
  const [assignedTechnician, setAssignedTechnician] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");

  // Example list of technicians
  const [technicians, setTechnicians] = useState(["Mario Aguirre", "Jane Doe", "John Smith"]);

  // Local state for error/success messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch vehicle information upon mounting the component
  useEffect(() => {
    const fetchData = async () => {
      try {
        setErrorMessage("");
        setSuccessMessage("");

        const data = await getVehicleById(id);
        // 'data' is a VehicleReadDto: { id, vin, make, model, ..., userWorkshopId, userWorkshop }
        setVehicle(data);
      } catch (error) {
        setErrorMessage(error.message);
      }
    };

    fetchData();
  }, [id]);

  // Handle form submission to create a new diagnostic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Basic validations
    if (!assignedTechnician.trim()) {
      setErrorMessage("You must assign a technician.");
      return;
    }
    if (!reasonForVisit.trim()) {
      setErrorMessage("The reason for visit is required.");
      return;
    }

    // Payload for creating a diagnostic
    const payload = {
      vehicleId: vehicle.id, // Must match an existing vehicle in the database
      assignedTechnician,
      reasonForVisit,
    };

    try {
      await createDiagnostic(payload);
      setSuccessMessage("Diagnostic has been successfully registered.");
      // Optionally navigate somewhere or clear fields
      // navigate("/diagnostics-list");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <Container className="p-4 border rounded bg-light">
      <h3>Diagnostics Module</h3>

      {/* Display error or success messages */}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Vehicle Information (read-only fields) */}
      <h5>Vehicle Information</h5>
      <Row className="mb-3">
        <Col md={2}>
          <Form.Group>
            <Form.Label>VIN</Form.Label>
            <Form.Control type="text" value={vehicle.vin} readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Make</Form.Label>
            <Form.Control type="text" value={vehicle.make} readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Model</Form.Label>
            <Form.Control type="text" value={vehicle.model} readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Engine</Form.Label>
            <Form.Control type="text" value={vehicle.engine} readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Plate</Form.Label>
            <Form.Control type="text" value={vehicle.plate} readOnly />
          </Form.Group>
        </Col>
        <Col md={2}>
          <Form.Group>
            <Form.Label>Owner (UserWorkshop)</Form.Label>
            {vehicle.userWorkshop ? (
              <Form.Control
                type="text"
                value={`${vehicle.userWorkshop.name} ${vehicle.userWorkshop.lastName}`}
                readOnly
              />
            ) : (
              <Form.Control type="text" value="Unknown" readOnly />
            )}
          </Form.Group>
        </Col>
      </Row>

      {/* Diagnostic Form */}
      <Form onSubmit={handleSubmit}>
        <h5>Diagnostic Information</h5>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Assign Technician</Form.Label>
              <Form.Select
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                required
              >
                <option value="">-- Select --</option>
                {technicians.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Reason for Visit</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="d-flex justify-content-end">
          <Button variant="secondary" className="me-2" onClick={() => navigate("/vehicle-list")}>
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
