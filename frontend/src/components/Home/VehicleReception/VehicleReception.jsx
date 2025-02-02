/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
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
  getUserWorkshopByIdWithVehicles,
  updateUserWorkshop,
} from "../../../services/UserWorkshopService";
import { useNavigate } from "react-router-dom";

/**
 * Formats a phone number string.
 * This function removes all non-numeric characters and limits the input to 10 digits.
 * It then formats the number as:
 *   - (XXX when less than 4 digits
 *   - (XXX) XXX when between 4 and 6 digits
 *   - (XXX) XXX - XXXX when 7 or more digits
 *
 * @param {string} input - The input string containing a phone number.
 * @returns {string} The formatted phone number.
 */
const formatPhoneNumber = (input) => {
  // Remove non-numeric characters and limit to 10 digits
  const digits = input.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)} - ${digits.slice(6)}`;
};

/**
 * VehicleReception Component
 *
 * This component renders a form for creating or editing a mechanical workshop along with its vehicles.
 *
 * Props:
 * - onClose: Function to be called when the form is cancelled.
 * - afterSubmit: Function to be called after successful form submission.
 * - editingId: The ID of the workshop to edit. If provided, the form loads existing data.
 */
const VehicleReception = ({ onClose, afterSubmit, editingId }) => {
  // useNavigate hook to programmatically navigate if needed
  const navigate = useNavigate();

  // Retrieve stored username and profile from localStorage or set default values
  const storedUsername = localStorage.getItem("username") || "defaultUser";
  const storedProfile = localStorage.getItem("profile") || "Manager";

  // Define initial state for the user workshop including default fields and vehicles list
  const [userWorkshop, setUserWorkshop] = useState({
    id: null,
    email: "",
    name: "",
    lastName: "",
    username: storedUsername,
    profile: storedProfile,
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

  // State to manage loading, submission error, and form submission state
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Retrieves the authentication token from localStorage.
   *
   * @returns {string} The authentication token.
   */
  const getToken = () => localStorage.getItem("token") || "";

  /**
   * useEffect hook to load workshop data when in editing mode.
   * It fetches the data for the provided editingId, formats it, and populates the state.
   */
  useEffect(() => {
    const loadData = async () => {
      if (editingId) {
        setLoading(true);
        try {
          const token = getToken();
          if (!token) {
            throw new Error("Authentication token is missing.");
          }
          // Fetch the workshop data along with its vehicles
          const data = await getUserWorkshopByIdWithVehicles(editingId, token);
          console.log("Workshop data for editing:", data);

          // Set the state with retrieved data, using stored username and profile if necessary
          setUserWorkshop({
            id: data.id,
            email: data.email || "",
            name: data.name || "",
            lastName: data.lastName || "",
            username:
              data.username && data.username.trim() !== ""
                ? data.username
                : storedUsername,
            profile:
              data.profile && data.profile.trim() !== ""
                ? data.profile
                : storedProfile,
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            zip: data.zip || "",
            primaryNumber: data.primaryNumber || "",
            secondaryNumber: data.secondaryNumber || "",
            noTax: data.noTax || false,
            vehicles:
              data.vehicles && data.vehicles.length > 0
                ? data.vehicles.map((v) => ({
                    vin: v.vin || "",
                    make: v.make || "",
                    model: v.model || "",
                    year: v.year || "",
                    engine: v.engine || "",
                    plate: v.plate || "",
                    state: v.state || "",
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
          console.error("Error loading workshop data:", error);
          setSubmitError(error.message);
          // If there's an error, ensure username and profile remain set to stored values
          setUserWorkshop((prev) => ({
            ...prev,
            username: storedUsername,
            profile: storedProfile,
          }));
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [editingId, storedUsername, storedProfile]);

  /**
   * Handles changes for input fields in the form.
   *
   * @param {string} field - The name of the field being updated.
   * @param {any} value - The new value for the field.
   */
  const handleInputChange = (field, value) => {
    // Format phone numbers appropriately
    if (field === "primaryNumber" || field === "secondaryNumber") {
      value = formatPhoneNumber(value);
    }
    setUserWorkshop((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Handles changes for vehicle input fields.
   *
   * @param {number} index - The index of the vehicle being updated.
   * @param {string} field - The name of the vehicle field.
   * @param {any} value - The new value for the vehicle field.
   */
  const handleVehicleChange = (index, field, value) => {
    setUserWorkshop((prev) => {
      const updatedVehicles = [...prev.vehicles];
      updatedVehicles[index][field] = value;
      return { ...prev, vehicles: updatedVehicles };
    });
  };

  /**
   * Adds a new vehicle object to the vehicles array in the state.
   */
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

  /**
   * Removes a vehicle from the vehicles array by its index.
   *
   * @param {number} index - The index of the vehicle to remove.
   */
  const removeVehicle = (index) => {
    setUserWorkshop((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index),
    }));
  };

  /**
   * Handles the form submission.
   * It prepares the payload, validates data, and calls the appropriate service
   * function to create or update the workshop.
   *
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const token = getToken();
      // Ensure username and profile have values; if not, use stored values
      let payload = { ...userWorkshop };
      if (!payload.username || payload.username.trim() === "") {
        payload.username = storedUsername;
      }
      if (!payload.profile || payload.profile.trim() === "") {
        payload.profile = storedProfile;
      }
      // Filter out vehicles that have an empty VIN
      payload.vehicles = payload.vehicles.filter((v) => v.vin.trim() !== "");

      // Decide between update or create based on whether editingId is provided
      if (editingId) {
        await updateUserWorkshop(editingId, payload, token);
        alert("Mechanical workshop updated successfully.");
      } else {
        await createUserWorkshop(payload);
        alert("Mechanical workshop created successfully.");
      }
      // Execute any post-submit callbacks
      if (afterSubmit) afterSubmit();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error submitting the form:", error);
      setSubmitError(error.message || "Error submitting the form.");
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="p-4">
      {loading ? (
        // Show a loading spinner while data is being fetched
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "50vh" }}
        >
          <Spinner animation="border" />
        </div>
      ) : (
        // Render the form for workshop and vehicle information
        <Form onSubmit={handleSubmit}>
          <h4 className="mb-3">
            {editingId
              ? "Edit Mechanical Workshop"
              : "Register Mechanical Workshop"}
          </h4>
          {/* Display any submission errors */}
          {submitError && <Alert variant="danger">{submitError}</Alert>}

          {/* Owner Information */}
          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="email">
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  value={userWorkshop.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="name">
                <Form.Label>First Name *</Form.Label>
                <Form.Control
                  type="text"
                  value={userWorkshop.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
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
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Address Information */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="address">
                <Form.Label>Address *</Form.Label>
                <Form.Control
                  type="text"
                  value={userWorkshop.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="city">
                <Form.Label>City *</Form.Label>
                <Form.Control
                  type="text"
                  value={userWorkshop.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="state">
                <Form.Label>State *</Form.Label>
                <Form.Control
                  type="text"
                  value={userWorkshop.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group controlId="zip">
                <Form.Label>Zip Code *</Form.Label>
                <Form.Control
                  type="text"
                  value={userWorkshop.zip}
                  onChange={(e) => handleInputChange("zip", e.target.value)}
                  required
                />
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
                    handleInputChange("primaryNumber", e.target.value)
                  }
                  required
                />
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
                    handleInputChange("secondaryNumber", e.target.value)
                  }
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Tax Exemption */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="noTax">
                <Form.Check
                  type="checkbox"
                  label="Tax Exempt"
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
                        required
                        // When editing, disable VIN if it already exists
                        disabled={editingId && vehicle.vin}
                      />
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
                        required
                      />
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
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3} className="d-flex align-items-end">
                    <Button
                      variant="danger"
                      onClick={() => removeVehicle(index)}
                      // Disable removal if there is only one vehicle in the list
                      disabled={userWorkshop.vehicles.length === 1}
                    >
                      Remove Vehicle
                    </Button>
                  </Col>
                </Row>
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
                        required
                      />
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
                        required
                      />
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
                        required
                      />
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
                        required
                      />
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

          {/* Form submission and cancellation buttons */}
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
