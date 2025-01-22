/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/components/VehicleReception/VehicleReception.jsx

import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Container,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  createUserWorkshop,
  getUserWorkshopByIdWithVehicles, // Import the corrected service
  updateUserWorkshop,
} from "../../../services/UserWorkshopService";

const VehicleReception = ({
  onClose, // Function to close the modal
  afterSubmit, // Optional function to refresh data in the parent component
  editingId, // ID to edit a specific record
}) => {
  const [userWorkshop, setUserWorkshop] = useState({
    id: null, // Initialize the ID
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
  const [submitError, setSubmitError] = useState(null);

  // Function to get the user's profile from localStorage
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
    const loadData = async () => {
      if (editingId) {
        setLoading(true);
        try {
          const token = localStorage.getItem("token"); // Get the token
          const data = await getUserWorkshopByIdWithVehicles(editingId, token); // Pass the token
          console.log("DATA RECEIVED =>", data);

          if (!data) {
            throw new Error("No data found for the provided ID");
          }

          const storedProfile = getProfileFromLocalStorage();
          if (!storedProfile) {
            throw new Error("User profile not found");
          }

          // Ensure data exists before assigning
          setUserWorkshop({
            id: data.id, // Ensure the ID is included
            email: data?.email ?? "",
            name: data?.name ?? "",
            lastName: data?.lastName ?? "",
            profile: storedProfile,
            address: data?.address ?? "",
            city: data?.city ?? "",
            state: data?.state ?? "",
            zip: data?.zip ?? "",
            primaryNumber: data?.primaryNumber ?? "",
            secondaryNumber: data?.secondaryNumber ?? null, // Set to null if not provided
            noTax: data?.noTax ?? false,
            vehicles:
              Array.isArray(data?.vehicles) && data.vehicles.length > 0
                ? data.vehicles.map((v) => ({
                    vin: v?.vin ?? "",
                    make: v?.make ?? "",
                    model: v?.model ?? "",
                    year: v?.year ?? "",
                    engine: v?.engine ?? "",
                    plate: v?.plate ?? "",
                    state: v?.state ?? "",
                  }))
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
        } catch (error) {
          console.error("Error loading data:", error);
          setSubmitError(error.message);
          // If there's an error, set default values
          const storedProfile = getProfileFromLocalStorage();
          setUserWorkshop((prev) => ({
            ...prev,
            profile: storedProfile ?? "",
          }));
        } finally {
          setLoading(false);
        }
      } else {
        const storedProfile = getProfileFromLocalStorage();
        if (storedProfile) {
          setUserWorkshop((prev) => ({
            ...prev,
            profile: storedProfile,
          }));
        } else {
          setSubmitError("User profile not found");
        }
      }
    };

    loadData();
  }, [editingId]);

  // ========== VALIDATIONS ==========
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

  // ========== HANDLE FORM INPUT CHANGES ==========
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
        // Assign the value directly without toggling
        setUserWorkshop((prev) => ({
          ...prev,
          noTax: value,
        }));
        setErrors((prev) => ({ ...prev, [field]: error }));
        return;

      default:
        // If not a specific field, check that it's not empty
        if (field !== "noTax" && !validateNotEmpty(value)) {
          error = "This field is required.";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    setUserWorkshop((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ========== HANDLE VEHICLE INPUT CHANGES ==========
  const handleVehicleChange = (index, field, value) => {
    let error = "";
    if (field === "year") {
      if (!validateNotEmpty(value)) {
        error = "This field is required.";
      } else if (!validateYear(value)) {
        error = "Must be a valid 4-digit year.";
      }
    } else if (field === "vin") {
      if (!validateNotEmpty(value)) {
        error = "This field is required.";
      } else if (value.length !== 17) {
        error = "The VIN must be exactly 17 characters.";
      }
    } else {
      if (!validateNotEmpty(value)) {
        error = "This field is required.";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [`vehicle_${field}_${index}`]: error,
    }));

    setUserWorkshop((prev) => {
      const updatedVehicles = [...prev.vehicles];
      updatedVehicles[index][field] = value;
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

  // ========== ADD VEHICLE ==========
  const addVehicle = () => {
    setUserWorkshop((prev) => ({
      ...prev,
      vehicles: [
        ...prev.vehicles,
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
    }));
  };

  // ========== REMOVE VEHICLE ==========
  const removeVehicle = (index) => {
    setUserWorkshop((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index),
    }));
  };

  // ========== RESET FORM ==========
  const resetForm = () => {
    setUserWorkshop({
      id: null, // Reset the ID
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
    setErrors({});
    setSubmitError(null);
    console.log("Form has been reset.");
  };

  // ========== CLEAN PAYLOAD ==========
  const cleanPayload = (payload) => ({
    ...payload,
    id: payload.id,
    secondaryNumber:
      payload.secondaryNumber.trim() === "" ? null : payload.secondaryNumber,
    vehicles: payload.vehicles.filter((v) => v.vin.trim() !== ""), // Solo incluir vehículos con VIN válido
  });

  // ========== HANDLE FORM SUBMISSION ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);

    // Basic frontend validation before sending
    let valid = true;
    const newErrors = {};

    // Validate owner fields
    ["email", "name", "lastName", "primaryNumber"].forEach((field) => {
      if (!validateNotEmpty(userWorkshop[field])) {
        newErrors[field] = "This field is required.";
        valid = false;
      }
    });

    // Validate email
    if (userWorkshop.email && !validateEmail(userWorkshop.email)) {
      newErrors.email = "Invalid email address.";
      valid = false;
    }

    // Validate phone numbers
    ["primaryNumber", "secondaryNumber"].forEach((field) => {
      if (userWorkshop[field] && !validatePhoneNumber(userWorkshop[field])) {
        newErrors[field] = "Invalid phone number. Format: (000) 000-0000";
        valid = false;
      }
    });

    // Validate vehicles
    userWorkshop.vehicles.forEach((vehicle, index) => {
      ["vin", "make", "model", "year", "engine", "plate", "state"].forEach(
        (field) => {
          if (!validateNotEmpty(vehicle[field])) {
            newErrors[`vehicle_${field}_${index}`] = "This field is required.";
            valid = false;
          }
        }
      );

      // Specific validation for year
      if (vehicle.year && !validateYear(vehicle.year)) {
        newErrors[`vehicle_year_${index}`] = "Must be a valid 4-digit year.";
        valid = false;
      }

      // Specific validation for VIN
      if (vehicle.vin && vehicle.vin.length !== 17) {
        newErrors[`vehicle_vin_${index}`] =
          "The VIN must be exactly 17 characters.";
        valid = false;
      }
    });

    if (!valid) {
      setErrors(newErrors);
      alert("Please correct the errors in the form before submitting.");
      return;
    }

    setIsSubmitting(true);

    // Prepare the payload according to your backend
    const payload = {
      id: userWorkshop.id, // Ensure the ID is included
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
      vehicles: userWorkshop.vehicles,
    };

    console.log("Payload to send:", payload);

    try {
      const cleanedPayload = cleanPayload(payload);
      const token = localStorage.getItem("token"); // Get the token

      if (editingId) {
        // Edit mode
        await updateUserWorkshop(editingId, cleanedPayload, token); // Pass the token
        alert("Mechanical workshop updated successfully.");
      } else {
        // Create mode
        await createUserWorkshop(cleanedPayload);
        alert("Mechanical workshop created successfully.");
      }

      // Reset the form
      resetForm();

      // Refresh data in the parent component if necessary
      if (afterSubmit) afterSubmit();

      // Close the modal
      if (onClose) onClose();
    } catch (error) {
      console.error("Error submitting the form:", error);
      setSubmitError(error.message || "Error submitting the form.");
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ======= RENDER =======
  return (
    <Container className="p-3">
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "50vh" }}
        >
          <Spinner animation="border" />
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <h4 className="mb-3">
            {editingId
              ? "Edit Mechanical Workshop"
              : "Register Mechanical Workshop"}
          </h4>

          {/* Display submission error */}
          {submitError && <Alert variant="danger">{submitError}</Alert>}

          {/* Email, First Name, and Last Name */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="email">
                <Form.Label>Email *</Form.Label>
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
            <Col md={4}>
              <Form.Group controlId="name">
                <Form.Label>First Name *</Form.Label>
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
            <Col md={4}>
              <Form.Group controlId="lastName">
                <Form.Label>Last Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={userWorkshop.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  isInvalid={!!errors.lastName}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Profile */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="profile">
                <Form.Label>Profile</Form.Label>
                <Form.Control
                  type="text"
                  value={userWorkshop.profile}
                  readOnly
                  plaintext
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Address */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="address">
                <Form.Label>Address *</Form.Label>
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
            <Col md={3}>
              <Form.Group controlId="city">
                <Form.Label>City *</Form.Label>
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
            <Col md={3}>
              <Form.Group controlId="state">
                <Form.Label>State *</Form.Label>
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
          </Row>

          {/* Zip Code */}
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group controlId="zip">
                <Form.Label>Zip Code *</Form.Label>
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

          {/* Phone Numbers */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="primaryNumber">
                <Form.Label>Primary Number *</Form.Label>
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
            <Col md={6}>
              <Form.Group controlId="secondaryNumber">
                <Form.Label>Secondary Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="(000) 000-0000"
                  value={userWorkshop.secondaryNumber || ""}
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

          {/* Tax Exemption */}
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

          {/* Vehicle Information */}
          <h5 className="mt-4 mb-2">Vehicle Information</h5>
          <div className="border rounded p-2 mb-2 bg-white">
            {userWorkshop.vehicles.map((vehicle, index) => (
              <div key={index}>
                {/* First Row of the Vehicle */}
                <Row>
                  <Col md={3}>
                    <Form.Group controlId={`vin_${index}`}>
                      <Form.Label>VIN (17 characters) *</Form.Label>
                      <Form.Control
                        type="text"
                        maxLength={17}
                        value={vehicle.vin || ""}
                        onChange={(e) =>
                          handleVehicleChange(index, "vin", e.target.value)
                        }
                        isInvalid={!!errors[`vehicle_vin_${index}`]}
                        required
                        disabled={editingId && vehicle.vin} // Disable VIN if it already exists
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`vehicle_vin_${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId={`make_${index}`}>
                      <Form.Label>Make *</Form.Label>
                      <Form.Control
                        type="text"
                        value={vehicle.make || ""}
                        onChange={(e) =>
                          handleVehicleChange(index, "make", e.target.value)
                        }
                        isInvalid={!!errors[`vehicle_make_${index}`]}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`vehicle_make_${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId={`model_${index}`}>
                      <Form.Label>Model *</Form.Label>
                      <Form.Control
                        type="text"
                        value={vehicle.model || ""}
                        onChange={(e) =>
                          handleVehicleChange(index, "model", e.target.value)
                        }
                        isInvalid={!!errors[`vehicle_model_${index}`]}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`vehicle_model_${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3} className="d-flex align-items-end">
                    <Button
                      variant="danger"
                      onClick={() => removeVehicle(index)}
                      disabled={userWorkshop.vehicles.length === 1}
                    >
                      Remove Vehicle
                    </Button>
                  </Col>
                </Row>

                {/* Second Row of the Vehicle */}
                <Row className="mt-2">
                  <Col md={3}>
                    <Form.Group controlId={`year_${index}`}>
                      <Form.Label>Year *</Form.Label>
                      <Form.Control
                        type="text"
                        maxLength={4}
                        value={vehicle.year || ""}
                        onChange={(e) =>
                          handleVehicleChange(index, "year", e.target.value)
                        }
                        isInvalid={!!errors[`vehicle_year_${index}`]}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`vehicle_year_${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId={`engine_${index}`}>
                      <Form.Label>Engine *</Form.Label>
                      <Form.Control
                        type="text"
                        value={vehicle.engine || ""}
                        onChange={(e) =>
                          handleVehicleChange(index, "engine", e.target.value)
                        }
                        isInvalid={!!errors[`vehicle_engine_${index}`]}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`vehicle_engine_${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId={`plate_${index}`}>
                      <Form.Label>Plate *</Form.Label>
                      <Form.Control
                        type="text"
                        value={vehicle.plate || ""}
                        onChange={(e) =>
                          handleVehicleChange(index, "plate", e.target.value)
                        }
                        isInvalid={!!errors[`vehicle_plate_${index}`]}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`vehicle_plate_${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId={`state_${index}`}>
                      <Form.Label>State *</Form.Label>
                      <Form.Control
                        type="text"
                        value={vehicle.state || ""}
                        onChange={(e) =>
                          handleVehicleChange(index, "state", e.target.value)
                        }
                        isInvalid={!!errors[`vehicle_state_${index}`]}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`vehicle_state_${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <hr />
              </div>
            ))}

            <Button variant="primary" onClick={addVehicle}>
              Add Vehicle
            </Button>
          </div>

          {/* Submit and Cancel Buttons */}
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
      )}
    </Container>
  );
};

export default VehicleReception;
