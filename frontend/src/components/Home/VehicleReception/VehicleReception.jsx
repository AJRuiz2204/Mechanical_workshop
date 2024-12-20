/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Form, Button, Row, Col, Container } from "react-bootstrap";
import { createUserWorkshop } from "../../../services/UserWorkshopService";

const VehicleReception = () => {
  const [userWorkshop, setUserWorkshop] = useState({
    email: "",
    name: "",
    lastName: "",
    profile: "admin",
    address: "",
    city: "",
    state: "",
    zip: "",
    primaryNumber: "",
    secondaryNumber: "",
    noTax: false,
    vehicles: [
      {
        vin: "",
        make: "",
        model: "",
        year: "",
        engine: "",
        plate: "",
        vehicleState: "", // Representa el campo "State"
      },
    ],
  });

  // Estado para controlar el envío
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setUserWorkshop({ ...userWorkshop, [field]: value });
  };

  const handleVehicleChange = (index, field, value) => {
    const updatedVehicles = [...userWorkshop.vehicles];
    updatedVehicles[index][field] = value;
    setUserWorkshop({ ...userWorkshop, vehicles: updatedVehicles });
  };

  const addVehicle = () => {
    setUserWorkshop({
      ...userWorkshop,
      vehicles: [
        ...userWorkshop.vehicles,
        {
          vin: "",
          make: "",
          model: "",
          year: "",
          engine: "",
          plate: "",
          vehicleState: "",
        },
      ],
    });
  };

  const deleteVehicle = (index) => {
    const updatedVehicles = userWorkshop.vehicles.filter((_, i) => i !== index);
    setUserWorkshop({ ...userWorkshop, vehicles: updatedVehicles });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Si ya está enviándose, evitamos múltiples envíos
    if (isSubmitting) return;

    setIsSubmitting(true);

    // Map vehicleState to State before sending
    const updatedVehicles = userWorkshop.vehicles.map((vehicle) => ({
      ...vehicle,
      State: vehicle.vehicleState,
    }));

    const payload = {
      ...userWorkshop,
      vehicles: updatedVehicles,
    };

    try {
      await createUserWorkshop(payload);
      alert("Client and vehicles created successfully.");
      setUserWorkshop({
        email: "",
        name: "",
        lastName: "",
        profile: "admin",
        address: "",
        city: "",
        state: "",
        zip: "",
        primaryNumber: "",
        secondaryNumber: "",
        noTax: false,
        vehicles: [
          {
            vin: "",
            make: "",
            model: "",
            year: "",
            engine: "",
            plate: "",
            vehicleState: "",
          },
        ],
      });
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false); // Permite nuevos envíos
    }
  };

  return (
    <Container className="p-4 border rounded bg-light">
      <Form onSubmit={handleSubmit}>
        <h3 className="mb-4">Client and Vehicle Reception</h3>

        {/* Client Data */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                value={userWorkshop.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Primary Number</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.primaryNumber}
                onChange={(e) => handleInputChange("primaryNumber", e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Secondary Number</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.secondaryNumber}
                onChange={(e) => handleInputChange("secondaryNumber", e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Address Data */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Zip Code</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.zip}
                onChange={(e) => handleInputChange("zip", e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Vehicle Data */}
        <h4 className="mt-4 mb-3">Vehicle Information</h4>
        {userWorkshop.vehicles.map((vehicle, index) => (
          <div key={index} className="border rounded p-3 mb-3 bg-white">
            <Row>
              <Col md={3}>
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
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Make</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.make}
                    onChange={(e) => handleVehicleChange(index, "make", e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Model</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.model}
                    onChange={(e) => handleVehicleChange(index, "model", e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Button variant="danger" className="mt-4" onClick={() => deleteVehicle(index)}>
                  Delete
                </Button>
              </Col>
            </Row>
            <Row>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Year</Form.Label>
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
                  <Form.Label>Engine</Form.Label>
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
                  <Form.Label>Plate</Form.Label>
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
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.vehicleState}
                    onChange={(e) => handleVehicleChange(index, "vehicleState", e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        ))}

        <Button variant="primary" onClick={addVehicle} className="mb-3">
          Add Vehicle
        </Button>

        <div className="d-flex justify-content-end">
          <Button type="submit" variant="success" className="me-2">
            Save
          </Button>
          <Button variant="secondary">Cancel</Button>
        </div>
      </Form>
    </Container>
  );
};

export default VehicleReception;
