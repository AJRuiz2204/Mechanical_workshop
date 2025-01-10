/* eslint-disable no-useless-escape */
/* eslint-disable no-unused-vars */
// src/components/WorkshopSettings/WorkshopSettingsForm.jsx

import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Alert,
  Spinner,
  Container,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import {
  getWorkshopSettings,
  createWorkshopSettings,
  updateWorkshopSettings,
} from "../../../services/workshopSettingsService";
import WorkshopSettingsPreview from "./WorkshopSettingsPreview";

// Utility function to format phone numbers as (000) 000-0000
const formatPhoneNumber = (value) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, "");
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
    3,
    6
  )}-${phoneNumber.slice(6, 10)}`;
};

// Utility function to validate email
const validateEmail = (email) => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
  return re.test(String(email).toLowerCase());
};

// Utility function to validate URL
const validateURL = (url) => {
  const pattern = new RegExp(
    "^(https?:\\/\\/)" + // protocol
      "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,})" + // domain name
      "(\\:\\d+)?(\\/[-a-zA-Z\\d%@_.~+&:]*)*" + // port and path
      "(\\?[;&a-zA-Z\\d%@_.,~+&:=-]*)?" + // query string
      "(\\#[-a-zA-Z\\d_]*)?$",
    "i"
  );
  return !!pattern.test(url);
};

const WorkshopSettingsForm = () => {
  // State to hold workshop settings
  const [settings, setSettings] = useState({
    id: "",
    workshopName: "",
    address: "",
    primaryPhone: "",
    secondaryPhone: "",
    fax: "",
    websiteUrl: "",
    disclaimer: "",
    email: "",
    lastUpdated: "",
  });

  // State to manage loading, saving, errors, and success messages
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // State for form validation
  const [errors, setErrors] = useState({});

  // Determine if the settings already exist (edit mode)
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Fetch existing workshop settings on component mount
    const fetchSettings = async () => {
      try {
        const data = await getWorkshopSettings();
        setSettings(data);
        setIsEditMode(true);
      } catch (err) {
        if (err.message === "Workshop settings not found.") {
          // No existing settings, remain in create mode
          setIsEditMode(false);
        } else {
          setError(err.message || "Error fetching workshop settings.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  /**
   * Handles changes in the form fields.
   * @param {Object} e - The event object.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // If the field is a phone number, format it
    if (
      name === "primaryPhone" ||
      name === "secondaryPhone" ||
      name === "fax"
    ) {
      const formattedPhone = formatPhoneNumber(value);
      setSettings({
        ...settings,
        [name]: formattedPhone,
      });
    } else {
      setSettings({
        ...settings,
        [name]: value,
      });
    }

    // Clear specific field error on change
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  /**
   * Validates the form fields.
   * @returns {Object} An object containing validation errors.
   */
  const validateForm = () => {
    const newErrors = {};

    // Workshop Name validation
    if (!settings.workshopName.trim()) {
      newErrors.workshopName = "Workshop Name is required.";
    }

    // Address validation
    if (!settings.address.trim()) {
      newErrors.address = "Address is required.";
    }

    // Primary Phone validation
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    if (!settings.primaryPhone.trim()) {
      newErrors.primaryPhone = "Primary Phone is required.";
    } else if (!phoneRegex.test(settings.primaryPhone)) {
      newErrors.primaryPhone =
        "Primary Phone must be in the format (000) 000-0000.";
    }

    // Secondary Phone validation (optional)
    if (settings.secondaryPhone && !phoneRegex.test(settings.secondaryPhone)) {
      newErrors.secondaryPhone =
        "Secondary Phone must be in the format (000) 000-0000.";
    }

    // Fax validation (optional)
    if (settings.fax && !phoneRegex.test(settings.fax)) {
      newErrors.fax = "Fax must be in the format (000) 000-0000.";
    }

    // Email validation (optional)
    if (settings.email && !validateEmail(settings.email)) {
      newErrors.email = "Email address is not valid.";
    }

    return newErrors;
  };

  /**
   * Handles form submission to create or update workshop settings.
   * @param {Object} e - The event object.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    setErrors({});

    // Validate form fields
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSaving(false);
      return;
    }

    console.log("Submitting settings:", settings); // For debugging

    try {
      if (isEditMode) {
        // Update existing settings
        await updateWorkshopSettings(settings.id, settings);
        setSuccess("Workshop settings updated successfully.");
      } else {
        // Create new settings
        const createdSettings = await createWorkshopSettings(settings);
        setSettings(createdSettings);
        setSuccess("Workshop settings created successfully.");
        setIsEditMode(true);
      }
    } catch (err) {
      console.error("Error details:", err); // For debugging
      setError(err.message || "Error saving workshop settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="p-4 border rounded mt-4">
      <h3 className="mb-4">
        {isEditMode ? "Edit Workshop Settings" : "Create Workshop Settings"}
      </h3>

      {/* Error Message */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      <Row>
        {/* Preview */}
        <Col md={6} className="mb-4">
          <WorkshopSettingsPreview settings={settings} />
        </Col>

        {/* Form */}
        <Col md={6}>
          <Form onSubmit={handleSubmit}>
            {/* Workshop Name */}
            <Form.Group controlId="workshopName" className="mb-3">
              <Form.Label>Workshop Name</Form.Label>
              <Form.Control
                type="text"
                name="workshopName"
                value={settings.workshopName}
                onChange={handleChange}
                isInvalid={!!errors.workshopName}
                required
                placeholder="Enter workshop name"
              />
              <Form.Control.Feedback type="invalid">
                {errors.workshopName}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Address */}
            <Form.Group controlId="address" className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                isInvalid={!!errors.address}
                required
                placeholder="Enter workshop address"
              />
              <Form.Control.Feedback type="invalid">
                {errors.address}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Primary Phone */}
            <Form.Group controlId="primaryPhone" className="mb-3">
              <Form.Label>Primary Phone</Form.Label>
              <Form.Control
                type="text"
                name="primaryPhone"
                value={settings.primaryPhone}
                onChange={handleChange}
                isInvalid={!!errors.primaryPhone}
                required
                placeholder="(000) 000-0000"
              />
              <Form.Control.Feedback type="invalid">
                {errors.primaryPhone}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Secondary Phone */}
            <Form.Group controlId="secondaryPhone" className="mb-3">
              <Form.Label>Secondary Phone</Form.Label>
              <Form.Control
                type="text"
                name="secondaryPhone"
                value={settings.secondaryPhone}
                onChange={handleChange}
                isInvalid={!!errors.secondaryPhone}
                placeholder="(000) 000-0000"
              />
              <Form.Control.Feedback type="invalid">
                {errors.secondaryPhone}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Fax */}
            <Form.Group controlId="fax" className="mb-3">
              <Form.Label>Fax</Form.Label>
              <Form.Control
                type="text"
                name="fax"
                value={settings.fax}
                onChange={handleChange}
                isInvalid={!!errors.fax}
                placeholder="(000) 000-0000"
              />
              <Form.Control.Feedback type="invalid">
                {errors.fax}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Website URL */}
            <Form.Group controlId="websiteUrl" className="mb-3">
              <Form.Label>Website URL</Form.Label>
              <Form.Control
                type="text"
                name="websiteUrl"
                value={settings.websiteUrl}
                onChange={handleChange}
                isInvalid={!!errors.websiteUrl}
                placeholder="https://yourworkshop.com"
              />
              <Form.Control.Feedback type="invalid">
                {errors.websiteUrl}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Email */}
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                placeholder="Enter email address"
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Disclaimer */}
            <Form.Group controlId="disclaimer" className="mb-3">
              <Form.Label>Disclaimer</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="disclaimer"
                value={settings.disclaimer}
                onChange={handleChange}
                placeholder="Enter any disclaimers or additional notes..."
              />
            </Form.Group>

            {/* Last Updated (Read-Only) */}
            {isEditMode && (
              <Form.Group controlId="lastUpdated" className="mb-3">
                <Form.Label>Last Updated</Form.Label>
                <Form.Control
                  type="text"
                  name="lastUpdated"
                  value={
                    settings.lastUpdated
                      ? new Date(settings.lastUpdated).toLocaleString()
                      : ""
                  }
                  readOnly
                />
              </Form.Group>
            )}

            {/* Submit Button */}
            <div className="text-end">
              <Button variant="primary" type="submit" disabled={saving}>
                {saving
                  ? "Saving..."
                  : isEditMode
                  ? "Update Settings"
                  : "Create Settings"}
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default WorkshopSettingsForm;
