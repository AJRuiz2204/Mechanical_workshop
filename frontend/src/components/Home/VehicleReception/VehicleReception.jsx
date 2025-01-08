/* eslint-disable no-unused-vars */
// src/components/VehicleReception/VehicleReception.jsx

import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Container, Spinner, Alert } from "react-bootstrap";
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
        state: "",
      },
    ],
  });

  // State to handle submission and loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  // State to manage errors
  const [errors, setErrors] = useState({});

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

  // Validation functions
  const validateName = (name) => /^[A-Za-z\s]+$/.test(name);
  const validateEmail = (email) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  const validatePhoneNumber = (number) =>
    /^\(\d{3}\)\s\d{3}-\d{4}$/.test(number);
  const validateYear = (year) => /^\d{4}$/.test(year);
  const validateNotEmpty = (value) => {
    if (typeof value === "string") {
      return value.trim() !== "";
    }
    // For other types (e.g., boolean), return true or handle accordingly
    return true;
  };

  // Handle changes in the main fields of the workshop
  const handleInputChange = (field, value) => {
    // Validate input
    let error = "";
    switch (field) {
      case "name":
      case "lastName":
        if (!validateNotEmpty(value)) {
          error = "Este campo es obligatorio.";
        } else if (!validateName(value)) {
          error = "Solo se permiten letras y espacios.";
        }
        break;
      case "email":
        if (!validateNotEmpty(value)) {
          error = "Este campo es obligatorio.";
        } else if (!validateEmail(value)) {
          error = "Correo electrónico inválido.";
        }
        break;
      case "primaryNumber":
      case "secondaryNumber":
        if (validateNotEmpty(value) && !validatePhoneNumber(value)) {
          error = "Número de teléfono inválido. Formato: (000) 000-0000";
        }
        break;
      default:
        if (!validateNotEmpty(value)) {
          error = "Este campo es obligatorio.";
        }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: error,
    }));

    setUserWorkshop({ ...userWorkshop, [field]: value });
  };

  // Handle changes in the vehicle array
  const handleVehicleChange = (index, field, value) => {
    // Validate input
    let error = "";
    if (field === "year") {
      if (!validateNotEmpty(value)) {
        error = "Este campo es obligatorio.";
      } else if (!validateYear(value)) {
        error = "Debe ser un año válido de 4 dígitos.";
      }
    } else {
      if (!validateNotEmpty(value)) {
        error = "Este campo es obligatorio.";
      }
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [`vehicle_${index}_${field}`]: error,
    }));

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

    // Remove associated errors
    const updatedErrors = { ...errors };
    Object.keys(updatedErrors).forEach((key) => {
      if (key.startsWith(`vehicle_${index}_`)) {
        delete updatedErrors[key];
      }
    });
    setErrors(updatedErrors);
  };

  // Format phone number as (000) 000-0000
  const formatPhoneNumber = (value) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, "");

    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      let formatted = "";
      if (match[1]) {
        formatted += `(${match[1]}`;
      }
      if (match[2]) {
        formatted += `) ${match[2]}`;
      }
      if (match[3]) {
        formatted += `-${match[3]}`;
      }
      return formatted;
    }
    return value;
  };

  // Handle form submission to create or update a workshop
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) return;

    // Final validation before submission
    let formIsValid = true;
    const newErrors = {};

    // Validate main fields
    Object.keys(userWorkshop).forEach((field) => {
      if (field === "vehicles") return; // Handle vehicles separately
      if (field === "secondaryNumber" && userWorkshop[field].trim() === "") return; // Optional field
      if (field === "noTax") return; // Exclude 'noTax' from validateNotEmpty
      if (!validateNotEmpty(userWorkshop[field])) {
        newErrors[field] = "Este campo es obligatorio.";
        formIsValid = false;
      } else {
        switch (field) {
          case "name":
          case "lastName":
            if (!validateName(userWorkshop[field])) {
              newErrors[field] = "Solo se permiten letras y espacios.";
              formIsValid = false;
            }
            break;
          case "email":
            if (!validateEmail(userWorkshop[field])) {
              newErrors[field] = "Correo electrónico inválido.";
              formIsValid = false;
            }
            break;
          case "primaryNumber":
          case "secondaryNumber":
            if (
              userWorkshop[field].trim() !== "" &&
              !validatePhoneNumber(userWorkshop[field])
            ) {
              newErrors[field] =
                "Número de teléfono inválido. Formato: (000) 000-0000";
              formIsValid = false;
            }
            break;
          default:
            break;
        }
      }
    });

    // Validate vehicles
    userWorkshop.vehicles.forEach((vehicle, index) => {
      Object.keys(vehicle).forEach((field) => {
        if (!validateNotEmpty(vehicle[field])) {
          newErrors[`vehicle_${index}_${field}`] = "Este campo es obligatorio.";
          formIsValid = false;
        } else {
          if (field === "year" && !validateYear(vehicle[field])) {
            newErrors[`vehicle_${index}_${field}`] =
              "Debe ser un año válido de 4 dígitos.";
            formIsValid = false;
          }
        }
      });
    });

    setErrors(newErrors);

    if (!formIsValid) {
      alert("Por favor, corrige los errores en el formulario.");
      return;
    }

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
      navigate("/vehicle-list"); // Return to the main screen
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle phone number input formatting
  const handlePhoneNumberChange = (field, value) => {
    const formattedNumber = formatPhoneNumber(value);
    handleInputChange(field, formattedNumber);
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
            <Form.Group controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                isInvalid={!!errors.name}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="lastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                isInvalid={!!errors.lastName}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.lastName}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={userWorkshop.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                isInvalid={!!errors.email}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="primaryNumber">
              <Form.Label>Primary Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="(000) 000-0000"
                value={userWorkshop.primaryNumber}
                onChange={(e) => handlePhoneNumberChange("primaryNumber", e.target.value)}
                isInvalid={!!errors.primaryNumber}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.primaryNumber}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="secondaryNumber">
              <Form.Label>Secondary Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="(000) 000-0000"
                value={userWorkshop.secondaryNumber}
                onChange={(e) => handlePhoneNumberChange("secondaryNumber", e.target.value)}
                isInvalid={!!errors.secondaryNumber}
              />
              <Form.Control.Feedback type="invalid">
                {errors.secondaryNumber}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                isInvalid={!!errors.address}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.address}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="city">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                isInvalid={!!errors.city}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.city}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="state">
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                isInvalid={!!errors.state}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.state}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="zip">
              <Form.Label>Zip Code</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.zip}
                onChange={(e) => handleInputChange("zip", e.target.value)}
                isInvalid={!!errors.zip}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.zip}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        {/* Vehicles information */}
        <h4 className="mt-4 mb-3">Vehicle Information</h4>
        {userWorkshop.vehicles.map((vehicle, index) => (
          <div key={index} className="border rounded p-3 mb-3 bg-white">
            <Row>
              <Col md={3}>
                <Form.Group controlId={`vin_${index}`}>
                  <Form.Label>VIN (17 chars)</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={17} // Avoid more than 17 chars
                    value={vehicle.vin}
                    onChange={(e) => handleVehicleChange(index, "vin", e.target.value)}
                    isInvalid={!!errors[`vehicle_${index}_vin`]}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`vehicle_${index}_vin`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId={`make_${index}`}>
                  <Form.Label>Make</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.make}
                    onChange={(e) => handleVehicleChange(index, "make", e.target.value)}
                    isInvalid={!!errors[`vehicle_${index}_make`]}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`vehicle_${index}_make`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId={`model_${index}`}>
                  <Form.Label>Model</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.model}
                    onChange={(e) => handleVehicleChange(index, "model", e.target.value)}
                    isInvalid={!!errors[`vehicle_${index}_model`]}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`vehicle_${index}_model`]}
                  </Form.Control.Feedback>
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
                <Form.Group controlId={`year_${index}`}>
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={4}
                    value={vehicle.year}
                    onChange={(e) => handleVehicleChange(index, "year", e.target.value)}
                    isInvalid={!!errors[`vehicle_${index}_year`]}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`vehicle_${index}_year`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId={`engine_${index}`}>
                  <Form.Label>Engine</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.engine}
                    onChange={(e) => handleVehicleChange(index, "engine", e.target.value)}
                    isInvalid={!!errors[`vehicle_${index}_engine`]}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`vehicle_${index}_engine`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId={`plate_${index}`}>
                  <Form.Label>Plate</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.plate}
                    onChange={(e) => handleVehicleChange(index, "plate", e.target.value)}
                    isInvalid={!!errors[`vehicle_${index}_plate`]}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`vehicle_${index}_plate`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId={`state_${index}`}>
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.state}
                    onChange={(e) => handleVehicleChange(index, "state", e.target.value)}
                    isInvalid={!!errors[`vehicle_${index}_state`]}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`vehicle_${index}_state`]}
                  </Form.Control.Feedback>
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
          <Button variant="secondary" onClick={() => navigate("/vehicle-list")}>
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default VehicleReception;
