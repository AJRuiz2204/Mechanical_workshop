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
} from "react-bootstrap";
import dayjs from "dayjs";
import {
  getWorkshopSettings,
  createWorkshopSettings,
  updateWorkshopSettings,
} from "../../../services/workshopSettingsService";
import WorkshopSettingsPreview from "./WorkshopSettingsPreview";

/**
 * Formats a phone number string to the format (XXX) XXX-XXXX.
 *
 * @param {string} value - The raw phone number input.
 * @returns {string} - The formatted phone number.
 */
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

/**
 * Validates an email address using a regular expression.
 *
 * @param {string} email - The email address to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
const validateEmail = (email) => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
  return re.test(String(email).toLowerCase());
};

/**
 * WorkshopSettingsForm Component
 *
 * Description:
 * This component manages the workshop settings, allowing users to create or edit
 * settings such as workshop name, address, contact information, website URL, and disclaimers.
 * It fetches existing settings from the backend, populates the form for editing,
 * and handles form submission for creating or updating settings.
 *
 * Features:
 * - Fetch existing workshop settings on mount.
 * - Form fields for workshop details with validation.
 * - Real-time phone number formatting.
 * - Display of success and error messages.
 * - Preview of saved settings.
 *
 * Dependencies:
 * - React and React Hooks for state management.
 * - React Bootstrap for UI components and styling.
 * - dayjs for date and time formatting.
 * - WorkshopSettingsService for API interactions.
 * - WorkshopSettingsPreview for displaying a preview of settings.
 */
const WorkshopSettingsForm = () => {
  // State to manage form inputs
  const [formData, setFormData] = useState({
    workshopName: "",
    address: "",
    primaryPhone: "",
    secondaryPhone: "",
    fax: "",
    websiteUrl: "",
    disclaimer: "",
    email: "",
  });

  // State to hold saved settings fetched from the backend
  const [savedSettings, setSavedSettings] = useState(null);

  // States to handle loading, saving, errors, and success messages
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // State to manage form validation errors
  const [errors, setErrors] = useState({});

  // State to determine if the form is in edit mode (updating existing settings)
  const [isEditMode, setIsEditMode] = useState(false);

  /**
   * useEffect Hook
   *
   * Fetches existing workshop settings from the backend when the component mounts.
   * Determines if the form should be in edit mode or create mode based on the response.
   */
  useEffect(() => {
    // Function to fetch existing workshop settings
    const fetchSettings = async () => {
      try {
        const data = await getWorkshopSettings();
        setSavedSettings(data);
        setIsEditMode(true);
        // Populate formData with fetched data, ensuring no undefined values
        setFormData({
          workshopName: data.workshopName || "",
          address: data.address || "",
          primaryPhone: data.primaryPhone || "",
          secondaryPhone: data.secondaryPhone || "",
          fax: data.fax || "",
          websiteUrl: data.websiteUrl || "",
          disclaimer: data.disclaimer || "",
          email: data.email || "",
        });
      } catch (err) {
        if (err.message === "Workshop settings not found.") {
          // If no settings exist, remain in create mode
          setIsEditMode(false);
          setSavedSettings(null);
        } else {
          // Handle other errors by setting the error state
          setError(err.message || "Error al obtener los ajustes del taller.");
        }
      } finally {
        setLoading(false); // Stop the loading spinner
      }
    };

    fetchSettings();
  }, []);

  /**
   * Handles changes in form input fields.
   *
   * @param {Object} e - The event object from the input change.
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
      setFormData({
        ...formData,
        [name]: formattedPhone,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear the specific field error if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  /**
   * Validates the form inputs and returns an object containing any errors found.
   *
   * @returns {Object} - An object with field names as keys and error messages as values.
   */
  const validateForm = () => {
    const newErrors = {};

    // Validate workshop name
    if (!formData.workshopName.trim()) {
      newErrors.workshopName = "El nombre del taller es obligatorio.";
    }

    // Validate address
    if (!formData.address.trim()) {
      newErrors.address = "La dirección es obligatoria.";
    }

    // Regular expression for phone number validation: (XXX) XXX-XXXX
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;

    // Validate primary phone
    if (!formData.primaryPhone.trim()) {
      newErrors.primaryPhone = "El teléfono principal es obligatorio.";
    } else if (!phoneRegex.test(formData.primaryPhone)) {
      newErrors.primaryPhone =
        "El teléfono principal debe tener el formato (000) 000-0000.";
    }

    // Validate secondary phone (optional)
    if (formData.secondaryPhone && !phoneRegex.test(formData.secondaryPhone)) {
      newErrors.secondaryPhone =
        "El teléfono secundario debe tener el formato (000) 000-0000.";
    }

    // Validate fax (optional)
    if (formData.fax && !phoneRegex.test(formData.fax)) {
      newErrors.fax = "El fax debe tener el formato (000) 000-0000.";
    }

    // Validate email (optional)
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "La dirección de correo electrónico no es válida.";
    }

    // Validate website URL (optional)
    if (formData.websiteUrl && !validateURL(formData.websiteUrl)) {
      newErrors.websiteUrl = "La URL del sitio web no es válida.";
    }

    return newErrors;
  };

  /**
   * Validates a URL using a regular expression.
   *
   * @param {string} url - The URL to validate.
   * @returns {boolean} - True if valid, false otherwise.
   */
  const validateURL = (url) => {
    const pattern = new RegExp(
      "^(https?:\\/\\/)" + // protocol
        "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,})" + // domain name
        "(\\:\\d+)?(\\/[-a-zA-Z\\d%@_.~+&:]*)*" + // port and path
        "(\\?[;&a-zA-Z\\d%@_.,~+&:=-]*)?" + // query string
        "(\\#[-a-zA-Z\\d_]*)?$", // fragment locator
      "i"
    );
    return !!pattern.test(url);
  };

  /**
   * Handles form submission for creating or updating workshop settings.
   *
   * @param {Object} e - The event object from form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    setErrors({});

    // Perform form validation
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSaving(false);
      return;
    }

    console.log("Enviando ajustes:", formData); // For debugging

    // Generate a timestamp for 'lastUpdated' using dayjs in ISO 8601 format
    const timestamp = dayjs().format();

    try {
      if (isEditMode && savedSettings?.id) {
        // Update existing workshop settings
        await updateWorkshopSettings(savedSettings.id, {
          ...formData,
          lastUpdated: timestamp,
        });
        setSuccess("Ajustes del taller actualizados exitosamente.");

        // Fetch the updated settings to display in the preview
        const updatedSettings = await getWorkshopSettings();
        setSavedSettings(updatedSettings);
      } else {
        // Create new workshop settings
        const createdSettings = await createWorkshopSettings({
          ...formData,
          lastUpdated: timestamp,
        });
        setSavedSettings(createdSettings);
        setSuccess("Ajustes del taller creados exitosamente.");
        setIsEditMode(true);
      }

      // Reset the form fields after successful submission
      setFormData({
        workshopName: "",
        address: "",
        primaryPhone: "",
        secondaryPhone: "",
        fax: "",
        websiteUrl: "",
        disclaimer: "",
        email: "",
      });
    } catch (err) {
      console.error("Detalles del error:", err); // For debugging
      setError(err.message || "Error al guardar los ajustes del taller.");
    } finally {
      setSaving(false);
    }
  };

  // Render a loading spinner while fetching data
  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Cargando...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="p-4 border rounded mt-4">
      <h3 className="mb-4">
        {isEditMode ? "Editar Ajustes del Taller" : "Crear Ajustes del Taller"}
      </h3>

      {/* Display Error Message */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {/* Display Success Message */}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      <Row>
        {/* Preview Section */}
        <Col md={6} className="mb-4">
          <WorkshopSettingsPreview settings={savedSettings} />
        </Col>

        {/* Form Section */}
        <Col md={6}>
          <Form onSubmit={handleSubmit}>
            {/* Workshop Name */}
            <Form.Group controlId="workshopName" className="mb-3">
              <Form.Label>Nombre del Taller</Form.Label>
              <Form.Control
                type="text"
                name="workshopName"
                value={formData.workshopName}
                onChange={handleChange}
                isInvalid={!!errors.workshopName}
                required
                placeholder="Ingresa el nombre del taller"
              />
              <Form.Control.Feedback type="invalid">
                {errors.workshopName}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Address */}
            <Form.Group controlId="address" className="mb-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                isInvalid={!!errors.address}
                required
                placeholder="Ingresa la dirección del taller"
              />
              <Form.Control.Feedback type="invalid">
                {errors.address}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Primary Phone */}
            <Form.Group controlId="primaryPhone" className="mb-3">
              <Form.Label>Teléfono Principal</Form.Label>
              <Form.Control
                type="text"
                name="primaryPhone"
                value={formData.primaryPhone}
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
              <Form.Label>Teléfono Secundario</Form.Label>
              <Form.Control
                type="text"
                name="secondaryPhone"
                value={formData.secondaryPhone}
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
                value={formData.fax}
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
              <Form.Label>URL del Sitio Web</Form.Label>
              <Form.Control
                type="text"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleChange}
                isInvalid={!!errors.websiteUrl}
                placeholder="https://tusitio.com"
              />
              <Form.Control.Feedback type="invalid">
                {errors.websiteUrl}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Email Address */}
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Dirección de Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
                placeholder="Ingresa la dirección de email"
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
                value={formData.disclaimer}
                onChange={handleChange}
                placeholder="Ingresa cualquier disclaimer o nota adicional..."
              />
            </Form.Group>

            {/* Submit Button */}
            <div className="text-end">
              <Button variant="primary" type="submit" disabled={saving}>
                {saving
                  ? "Guardando..."
                  : isEditMode
                  ? "Actualizar Ajustes"
                  : "Crear Ajustes"}
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default WorkshopSettingsForm;
