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
import dayjs from "dayjs"; // <--- Importamos dayjs
import {
  getWorkshopSettings,
  createWorkshopSettings,
  updateWorkshopSettings,
} from "../../../services/workshopSettingsService";
import WorkshopSettingsPreview from "./WorkshopSettingsPreview";

// Función utilitaria para formatear números de teléfono como (000) 000-0000
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

// Función utilitaria para validar emails
const validateEmail = (email) => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
  return re.test(String(email).toLowerCase());
};

// Función utilitaria para validar URLs
const validateURL = (url) => {
  const pattern = new RegExp(
    "^(https?:\\/\\/)" + // protocolo
      "((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,})" + // dominio
      "(\\:\\d+)?(\\/[-a-zA-Z\\d%@_.~+&:]*)*" + // puerto y ruta
      "(\\?[;&a-zA-Z\\d%@_.,~+&:=-]*)?" + // query string
      "(\\#[-a-zA-Z\\d_]*)?$",
    "i"
  );
  return !!pattern.test(url);
};

const WorkshopSettingsForm = () => {
  // Estado para los datos del formulario
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

  // Estado para los datos guardados (para la vista previa)
  const [savedSettings, setSavedSettings] = useState(null);

  // Estados para manejar carga, guardado, errores y mensajes de éxito
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Estado para errores de validación del formulario
  const [errors, setErrors] = useState({});

  // Determinar si ya existen ajustes guardados (modo edición)
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    // Obtener los ajustes existentes del taller al montar el componente
    const fetchSettings = async () => {
      try {
        const data = await getWorkshopSettings();
        setSavedSettings(data);
        setIsEditMode(true);
        // Inicializar formData con los datos existentes
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
          // No existen ajustes guardados, permanecer en modo creación
          setIsEditMode(false);
          setSavedSettings(null);
        } else {
          setError(err.message || "Error al obtener los ajustes del taller.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  /**
   * Maneja los cambios en los campos del formulario.
   * @param {Object} e - El objeto del evento.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si el campo es un número de teléfono, formatearlo
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

    // Limpiar el error específico del campo al cambiar su valor
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  /**
   * Valida los campos del formulario.
   * @returns {Object} Un objeto que contiene los errores de validación.
   */
  const validateForm = () => {
    const newErrors = {};

    // Validación del nombre del taller
    if (!formData.workshopName.trim()) {
      newErrors.workshopName = "El nombre del taller es obligatorio.";
    }

    // Validación de la dirección
    if (!formData.address.trim()) {
      newErrors.address = "La dirección es obligatoria.";
    }

    // Validación del teléfono principal
    const phoneRegex = /^\(\d{3}\) \d{3}-\d{4}$/;
    if (!formData.primaryPhone.trim()) {
      newErrors.primaryPhone = "El teléfono principal es obligatorio.";
    } else if (!phoneRegex.test(formData.primaryPhone)) {
      newErrors.primaryPhone =
        "El teléfono principal debe tener el formato (000) 000-0000.";
    }

    // Validación del teléfono secundario (opcional)
    if (formData.secondaryPhone && !phoneRegex.test(formData.secondaryPhone)) {
      newErrors.secondaryPhone =
        "El teléfono secundario debe tener el formato (000) 000-0000.";
    }

    // Validación del fax (opcional)
    if (formData.fax && !phoneRegex.test(formData.fax)) {
      newErrors.fax = "El fax debe tener el formato (000) 000-0000.";
    }

    // Validación del correo electrónico (opcional)
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = "La dirección de correo electrónico no es válida.";
    }

    return newErrors;
  };

  /**
   * Maneja el envío del formulario para crear o actualizar los ajustes del taller.
   * @param {Object} e - El objeto del evento.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    setErrors({});

    // Validar los campos del formulario
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSaving(false);
      return;
    }

    console.log("Enviando ajustes:", formData); // Para depuración

    // Generar timestamp con dayjs. Se puede usar un formato ISO 8601 o personalizado.
    // Por ejemplo, ISO 8601: dayjs().format()
    // O un formato más legible, e.g.: dayjs().format('YYYY-MM-DD HH:mm:ss')
    const timestamp = dayjs().format(); // Fecha/hora en formato ISO 8601

    try {
      if (isEditMode && savedSettings?.id) {
        // Actualizar los ajustes existentes, agregando "lastUpdated"
        await updateWorkshopSettings(savedSettings.id, {
          ...formData,
          lastUpdated: timestamp,
        });
        setSuccess("Ajustes del taller actualizados exitosamente.");

        // Obtener los ajustes actualizados para la vista previa
        const updatedSettings = await getWorkshopSettings();
        setSavedSettings(updatedSettings);
      } else {
        // Crear nuevos ajustes, agregando "lastUpdated"
        const createdSettings = await createWorkshopSettings({
          ...formData,
          lastUpdated: timestamp,
        });
        setSavedSettings(createdSettings);
        setSuccess("Ajustes del taller creados exitosamente.");
        setIsEditMode(true);
      }

      // Limpiar los campos del formulario después de una entrega exitosa
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
      console.error("Detalles del error:", err); // Para depuración
      setError(err.message || "Error al guardar los ajustes del taller.");
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

      {/* Mensaje de Error */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {/* Mensaje de Éxito */}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      <Row>
        {/* Vista Previa */}
        <Col md={6} className="mb-4">
          <WorkshopSettingsPreview settings={savedSettings} />
        </Col>

        {/* Formulario */}
        <Col md={6}>
          <Form onSubmit={handleSubmit}>
            {/* Nombre del Taller */}
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

            {/* Dirección */}
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

            {/* Teléfono Principal */}
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

            {/* Teléfono Secundario */}
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

            {/* URL del Sitio Web */}
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

            {/* Dirección de Email */}
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

            {/* Botón de Envío */}
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
