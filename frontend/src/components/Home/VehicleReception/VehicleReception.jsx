/* eslint-disable no-unused-vars */
// src/components/VehicleReception/VehicleReception.jsx
import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Container, Spinner } from "react-bootstrap";
import {
  createUserWorkshop,
  getUserWorkshopById,
  updateUserWorkshop,
} from "../../../services/UserWorkshopService";
import { useNavigate, useParams } from "react-router-dom";

const VehicleReception = () => {
  // State to manage workshop data
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
        state: "", // Changed from "vehicleState" to "state" for consistency
      },
    ],
  });

  // State to handle submission and loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams(); // If there's an ID, we are editing an existing record

  // If editing (when 'id' exists), fetch the existing data
  useEffect(() => {
    if (id) {
      setLoading(true);
      getUserWorkshopById(id)
        .then((data) => {
          // Populate the state with the data fetched
          setUserWorkshop({
            email: data.email,
            name: data.name,
            lastName: data.lastName,
            profile: data.profile,
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            primaryNumber: data.primaryNumber,
            secondaryNumber: data.secondaryNumber,
            noTax: data.noTax,
            vehicles: data.vehicles.map((v) => ({
              vin: v.vin,
              make: v.make,
              model: v.model,
              year: v.year,
              engine: v.engine,
              plate: v.plate,
              state: v.state,
            })),
          });
        })
        .catch((error) => alert(`Error: ${error.message}`))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Handle changes in the main fields of the workshop
  const handleInputChange = (field, value) => {
    setUserWorkshop({ ...userWorkshop, [field]: value });
  };

  // Handle changes in the vehicle array
  const handleVehicleChange = (index, field, value) => {
    const updatedVehicles = [...userWorkshop.vehicles];
    updatedVehicles[index][field] = value;
    setUserWorkshop({ ...userWorkshop, vehicles: updatedVehicles });
  };

  // Add a new vehicle to the array
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
          state: "",
        },
      ],
    });
  };

  // Remove a vehicle from the array
  const deleteVehicle = (index) => {
    const updatedVehicles = userWorkshop.vehicles.filter((_, i) => i !== index);
    setUserWorkshop({ ...userWorkshop, vehicles: updatedVehicles });
  };

  // Handle form submission to create or update a workshop
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true);

    const payload = {
      id: id ? parseInt(id) : 0,
      email: userWorkshop.email,
      name: userWorkshop.name,
      lastName: userWorkshop.lastName,
      profile: userWorkshop.profile,
      address: userWorkshop.address,
      city: userWorkshop.city,
      state: userWorkshop.state,
      zip: userWorkshop.zip,
      primaryNumber: userWorkshop.primaryNumber,
      secondaryNumber: userWorkshop.secondaryNumber,
      noTax: userWorkshop.noTax,
      vehicles: userWorkshop.vehicles.map((vehicle) => ({
        vin: vehicle.vin,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        engine: vehicle.engine,
        plate: vehicle.plate,
        state: vehicle.state,
      })),
    };

    try {
      if (id) {
        // Update existing workshop
        await updateUserWorkshop(id, payload);
        alert("Workshop successfully updated.");
      } else {
        // Create a new workshop
        await createUserWorkshop(payload);
        alert("Workshop successfully created.");
      }
      navigate("/home"); // Return to the main screen
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If data is being loaded, show a spinner
  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="p-4 border rounded mt-4 bg-light">
      <Form onSubmit={handleSubmit}>
        <h3 className="mb-4">
          {id ? "Edit Workshop" : "Register Workshop"}
        </h3>

        {/* Workshop's main data */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Name</Form.Label>
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
              <Form.Label>Email</Form.Label>
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

        {/* Vehicles information */}
        <h4 className="mt-4 mb-3">Vehicle Information</h4>
        {userWorkshop.vehicles.map((vehicle, index) => (
          <div key={index} className="border rounded p-3 mb-3 bg-white">
            <Row>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>VIN (17 chars)</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={17} // Avoid more than 17 chars
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
                {userWorkshop.vehicles.length > 1 && (
                  <Button
                    variant="danger"
                    className="mt-4"
                    onClick={() => deleteVehicle(index)}
                  >
                    Delete
                  </Button>
                )}
              </Col>
            </Row>
            <Row className="mt-2">
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
          Add Vehicle
        </Button>

        <div className="d-flex justify-content-end">
          <Button
            type="submit"
            variant="success"
            className="me-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
          <Button variant="secondary" onClick={() => navigate("/")}>
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default VehicleReception;
