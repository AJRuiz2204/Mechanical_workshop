// src/components/VehicleReception/VehicleReception.jsx

/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Container, Spinner } from "react-bootstrap";
import {
  createUserWorkshop,
  getUserWorkshopById,
  updateUserWorkshop,
} from "../../../services/UserWorkshopService";

const VehicleReception = ({
  onClose, // function to close the modal
  afterSubmit, // optional function to refresh data in the parent
  editingId, // ID to edit a particular record
}) => {
  const [userWorkshop, setUserWorkshop] = useState({
    email: "",
    name: "",
    lastName: "",
    profile: "",
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Function to get the user profile from localStorage
  const getProfileFromLocalStorage = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.profile || "";
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        return "";
      }
    }
    return "";
  };

  // Load data if editingId exists
  useEffect(() => {
    if (editingId) {
      setLoading(true);
      getUserWorkshopById(editingId)
        .then((data) => {
          console.log("DATA RECEIVED =>", data);

          // Get the profile from localStorage
          const storedProfile = getProfileFromLocalStorage();
          if (!storedProfile) {
            alert("User profile not found in localStorage.");
            return;
          }
          setUserWorkshop({
            email: data.email || "",
            name: data.name || "",
            lastName: data.lastName || "",
            profile: storedProfile, // Use the stored profile without default value
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            zip: data.zip || "",
            primaryNumber: data.primaryNumber || "",
            secondaryNumber: data.secondaryNumber || "",
            noTax: data.noTax || false,
            vehicles:
              data.vehicles?.length > 0
                ? [
                    {
                      vin: data.vehicles[0].vin || "",
                      make: data.vehicles[0].make || "",
                      model: data.vehicles[0].model || "",
                      year: data.vehicles[0].year || "",
                      engine: data.vehicles[0].engine || "",
                      plate: data.vehicles[0].plate || "",
                      state: data.vehicles[0].state || "",
                    },
                  ]
                : [
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

          console.log("State after loading data:", {
            ...userWorkshop,
            vehicles:
              data.vehicles?.length > 0
                ? [
                    {
                      vin: data.vehicles[0].vin || "",
                      make: data.vehicles[0].make || "",
                      model: data.vehicles[0].model || "",
                      year: data.vehicles[0].year || "",
                      engine: data.vehicles[0].engine || "",
                      plate: data.vehicles[0].plate || "",
                      state: data.vehicles[0].state || "",
                    },
                  ]
                : [
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
          }); // Debug log
        })
        .catch((error) => alert(`Error loading data: ${error.message}`))
        .finally(() => setLoading(false));
    }

    // Get the profile from localStorage when the component mounts
    const storedProfile = getProfileFromLocalStorage();
    if (storedProfile) {
      setUserWorkshop((prev) => ({
        ...prev,
        profile: storedProfile,
      }));
    } else {
      alert("User profile not found in localStorage.");
    }
  }, [editingId]);

  // ========== BASIC VALIDATIONS ==========
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
    return true;
  };

  // ========== FIELD HANDLING (OWNER) ==========
  const handleInputChange = (field, value) => {
    let error = "";
    switch (field) {
      case "name":
      case "lastName":
        if (!validateNotEmpty(value)) {
          error = "This field is required.";
        } else if (!validateName(value)) {
          error = "Only letters and spaces are allowed.";
        }
        break;

      case "email":
        if (!validateNotEmpty(value)) {
          error = "This field is required.";
        } else if (!validateEmail(value)) {
          error = "Invalid email address.";
        }
        break;

      case "primaryNumber":
      case "secondaryNumber":
        if (validateNotEmpty(value) && !validatePhoneNumber(value)) {
          error = "Invalid phone number. Format: (000) 000-0000";
        }
        break;

      case "noTax":
        // Assign the value directly without inverting
        setUserWorkshop((prev) => ({
          ...prev,
          noTax: value,
        }));
        setErrors((prev) => ({ ...prev, [field]: error }));
        return;

      default:
        // If not "noTax", it must be required
        if (field !== "noTax" && !validateNotEmpty(value)) {
          error = "This field is required.";
        }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    setUserWorkshop((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ========== FIELD HANDLING (VEHICLES) ==========
  const handleVehicleChange = (index, field, value) => {
    let error = "";
    if (field === "year") {
      if (!validateNotEmpty(value)) {
        error = "This field is required.";
      } else if (!validateYear(value)) {
        error = "Must be a valid 4-digit year.";
      }
    } else {
      if (!validateNotEmpty(value)) {
        error = "This field is required.";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [`vehicle_${field}`]: error,
    }));

    setUserWorkshop((prev) => {
      const updatedVehicles = [...prev.vehicles];
      updatedVehicles[index][field] = value;
      console.log(`Updating vehicle ${index}:`, updatedVehicles[index]); // Debug log
      return { ...prev, vehicles: updatedVehicles };
    });
  };

  // ========== FORMAT PHONE NUMBER ==========
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      let formatted = "";
      if (match[1]) formatted += `(${match[1]}`;
      if (match[2]) formatted += `) ${match[2]}`;
      if (match[3]) formatted += `-${match[3]}`;
      return formatted;
    }
    return value;
  };

  const handlePhoneNumberChange = (field, value) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange(field, formatted);
  };

  // ========== RESET FORM ==========
  const resetForm = () => {
    setUserWorkshop({
      email: "",
      name: "",
      lastName: "",
      profile: "", // Added
      address: "", // Added
      city: "", // Added
      state: "", // Added
      zip: "", // Added
      primaryNumber: "", // Added
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
    setErrors({});
    console.log("Form reset.");
  };

  // ========== FORM SUBMIT ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || hasSubmitted) return;

    setIsSubmitting(true);
    setHasSubmitted(true);

    // Prepare payload according to your backend
    const payload = {
      id: editingId ? parseInt(editingId) : 0,
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
      vehicles: [userWorkshop.vehicles[0]],
    };

    console.log("Payload to send:", payload);

    try {
      if (editingId) {
        // Edit mode
        await updateUserWorkshop(editingId, payload);
        alert("Workshop successfully updated.");
      } else {
        // Create mode
        await createUserWorkshop(payload);
        alert("Workshop successfully created.");
      }

      // Reset form
      resetForm();

      if (afterSubmit) afterSubmit();

      // Close the modal
      if (onClose) onClose();
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setHasSubmitted(false);
    }
  };

  // ======= WHILE LOADING DATA FOR EDITING =======
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

  // ======= RENDER =======
  return (
    <Container className="p-3">
      <Form onSubmit={handleSubmit}>
        <h4 className="mb-3">
          {editingId ? "Edit Workshop" : "Register Workshop"}
        </h4>

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
                onChange={(e) =>
                  handlePhoneNumberChange("primaryNumber", e.target.value)
                }
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
                onChange={(e) =>
                  handlePhoneNumberChange("secondaryNumber", e.target.value)
                }
                isInvalid={!!errors.secondaryNumber}
              />
              <Form.Control.Feedback type="invalid">
                {errors.secondaryNumber}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        {/* Address, City, State, Zip */}
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

        {/* noTax and Profile */}
        <Row className="mb-3">
          <Col md={6} className="d-flex align-items-center">
            <Form.Group controlId="noTax">
              <Form.Check
                type="checkbox"
                label="Tax Exempt (noTax)"
                checked={userWorkshop.noTax}
                onChange={(e) => handleInputChange("noTax", e.target.checked)}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Vehicle */}
        <h5 className="mt-4 mb-2">Vehicle Information</h5>
        <div className="border rounded p-2 mb-2 bg-white">
          <Row>
            <Col md={3}>
              <Form.Group controlId="vin">
                <Form.Label>VIN (17 characters)</Form.Label>
                <Form.Control
                  type="text"
                  maxLength={17}
                  value={userWorkshop.vehicles[0].vin || ""}
                  onChange={(e) =>
                    handleVehicleChange(0, "vin", e.target.value)
                  }
                  isInvalid={!!errors.vehicle_vin}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.vehicle_vin}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="make">
                <Form.Label>Make</Form.Label>
                <Form.Control
                  type="text"
                  value={userWorkshop.vehicles[0].make || ""}
                  onChange={(e) =>
                    handleVehicleChange(0, "make", e.target.value)
                  }
                  isInvalid={!!errors.vehicle_make}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.vehicle_make}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="model">
                <Form.Label>Model</Form.Label>
                <Form.Control
                  type="text"
                  value={userWorkshop.vehicles[0].model || ""}
                  onChange={(e) =>
                    handleVehicleChange(0, "model", e.target.value)
                  }
                  isInvalid={!!errors.vehicle_model}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.vehicle_model}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col md={3}>
              <Form.Group controlId="year">
                <Form.Label>Year</Form.Label>
                <Form.Control
                  type="text"
                  maxLength={4}
                  value={userWorkshop.vehicles[0].year || ""}
                  onChange={(e) =>
                    handleVehicleChange(0, "year", e.target.value)
                  }
                  isInvalid={!!errors.vehicle_year}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.vehicle_year}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="engine">
                <Form.Label>Engine</Form.Label>
                <Form.Control
                  type="text"
                  value={userWorkshop.vehicles[0].engine || ""}
                  onChange={(e) =>
                    handleVehicleChange(0, "engine", e.target.value)
                  }
                  isInvalid={!!errors.vehicle_engine}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.vehicle_engine}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="plate">
                <Form.Label>Plate</Form.Label>
                <Form.Control
                  type="text"
                  value={userWorkshop.vehicles[0].plate || ""}
                  onChange={(e) =>
                    handleVehicleChange(0, "plate", e.target.value)
                  }
                  isInvalid={!!errors.vehicle_plate}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.vehicle_plate}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="state">
                <Form.Label>State</Form.Label>
                <Form.Control
                  type="text"
                  value={userWorkshop.vehicles[0].state || ""}
                  onChange={(e) =>
                    handleVehicleChange(0, "state", e.target.value)
                  }
                  isInvalid={!!errors.vehicle_state}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.vehicle_state}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </div>

        <div className="text-end">
          <Button
            type="submit"
            variant="success"
            className="me-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default VehicleReception;
