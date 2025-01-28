/* eslint-disable no-unused-vars */
// src/components/Diagnostic/TechnicianDiagnostic.jsx
import React, { useEffect, useState } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  createTechnicianDiagnostic,
  getTechnicianDiagnostic,
  updateTechnicianDiagnostic,
  deleteTechnicianDiagnostic,
} from "../../../services/TechnicianDiagnosticService";
import { getDiagnosticById } from "../../../services/DiagnosticService";
import "./Diagnostic.css";
import NotesSection from "../../NotesSection/NotesSection";

const TechnicianDiagnostic = () => {
  const navigate = useNavigate();
  const { diagnosticId, techDiagId } = useParams();
  const location = useLocation();
  const { vehicle } = location.state || {};

  // State para determinar el modo: creación o edición
  const [isEditMode, setIsEditMode] = useState(false);

  // Estado para el diagnóstico relacionado
  const [diagnostic, setDiagnostic] = useState(null);

  // Estado para el TechnicianDiagnostic (solo en modo edición)
  const [technicianDiagnostic, setTechnicianDiagnostic] = useState(null);

  // Estado del formulario
  const [formData, setFormData] = useState({
    mileage: "",
    extendedDiagnostic: "",
  });

  // Estados para mensajes de error y éxito
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Estado de carga
  const [loading, setLoading] = useState(true);

  // Estado para el modal de confirmación de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Funciones auxiliares para formatear y parsear la milla
  const formatMileage = (num) => {
    if (isNaN(num)) return "";
    return num.toLocaleString("en-US", {
      minimumIntegerDigits: 1,
      useGrouping: true,
    });
  };

  const parseMileage = (str) => {
    const num = parseInt(str.replace(/,/g, ""), 10);
    return isNaN(num) ? 0 : num;
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Manejar cambios en el campo de milla con formateo
  const handleMileageChange = (e) => {
    let val = e.target.value.replace(/\D/g, ""); // Eliminar no dígitos

    if (val.length > 6) val = val.slice(0, 6); // Limitar a 6 dígitos

    if (val.length === 0) {
      setFormData({ ...formData, mileage: "" });
      return;
    }

    let numericVal = parseInt(val, 10);
    if (isNaN(numericVal)) numericVal = 0;
    if (numericVal > 999999) numericVal = 999999; // Máximo 999,999

    // Formatear como "xxx,xxx"
    val = numericVal.toLocaleString("en-US", {
      minimumIntegerDigits: 1,
      useGrouping: true,
    });
    setFormData({ ...formData, mileage: val });
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Parsear la milla
    const mileageNumber = parseMileage(formData.mileage);

    // Validaciones básicas
    if (!formData.mileage || mileageNumber === 0) {
      setErrorMessage("Mileage is required and cannot be zero.");
      return;
    }

    if (!formData.extendedDiagnostic.trim()) {
      setErrorMessage("Extended diagnostic is required.");
      return;
    }

    if (mileageNumber < 1 || mileageNumber > 999999) {
      setErrorMessage("Mileage must be between 1 and 999,999.");
      return;
    }

    // Payload para TechnicianDiagnostic
    const techDiagData = {
      mileage: mileageNumber,
      extendedDiagnostic: formData.extendedDiagnostic.trim(),
    };

    try {
      if (isEditMode) {
        // Modo edición: actualizar el TechnicianDiagnostic existente
        await updateTechnicianDiagnostic(technicianDiagnostic.id, techDiagData);
        setSuccessMessage("Technician Diagnostic updated successfully.");
      } else {
        // Modo creación: crear un nuevo TechnicianDiagnostic
        const payload = {
          diagnosticId: diagnostic.id,
          ...techDiagData,
        };
        await createTechnicianDiagnostic(payload);
        setSuccessMessage("Technician Diagnostic created successfully.");
      }
      // Redirigir a la lista de diagnostics después de guardar
      navigate("/technicianDiagnosticList");
    } catch (error) {
      setErrorMessage(
        "Error saving the Technician Diagnostic: " + error.message
      );
    }
  };

  // Manejar la eliminación con confirmación
  const handleDelete = async () => {
    try {
      await deleteTechnicianDiagnostic(technicianDiagnostic.id);
      setSuccessMessage("Technician Diagnostic deleted successfully.");
      navigate("/technicianDiagnosticList");
    } catch (error) {
      setErrorMessage(
        "Error deleting the Technician Diagnostic: " + error.message
      );
    }
  };

  // Efecto para cargar datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setErrorMessage("");
        setSuccessMessage("");

        if (diagnosticId) {
          // Modo creación
          const diag = await getDiagnosticById(diagnosticId);
          setDiagnostic(diag);
          if (diag.technicianDiagnostics?.length) {
            // Si ya existe un TechnicianDiagnostic, cambiar a modo edición
            const existingTechDiag = diag.technicianDiagnostics[0];
            setIsEditMode(true);
            setTechnicianDiagnostic(existingTechDiag);
            const formattedMileage = formatMileage(existingTechDiag.mileage);
            setFormData({
              mileage: formattedMileage,
              extendedDiagnostic: existingTechDiag.extendedDiagnostic,
            });
          }
        } else if (techDiagId) {
          // Modo edición
          setIsEditMode(true);
          const techDiag = await getTechnicianDiagnostic(techDiagId);
          setTechnicianDiagnostic(techDiag);
          const diagId = techDiag.diagnosticId; // Asumiendo que existe este campo
          const diag = await getDiagnosticById(diagId);
          setDiagnostic(diag);
          setFormData({
            mileage: formatMileage(techDiag.mileage),
            extendedDiagnostic: techDiag.extendedDiagnostic,
          });
        } else {
          setErrorMessage("Invalid route parameters.");
        }
      } catch (error) {
        setErrorMessage(error.message || "Error loading data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [diagnosticId, techDiagId]);

  // Renderizar el spinner de carga
  if (loading) {
    return (
      <Container className="p-4 border rounded">
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "200px" }}
        >
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  // Renderizar error si no se encontró el diagnóstico
  if (!diagnostic) {
    return (
      <Container className="p-4 border rounded">
        <Alert variant="danger">Could not load diagnostic information.</Alert>
        <Button
          variant="secondary"
          onClick={() => navigate("/technicianDiagnosticList")}
        >
          Back to Diagnostics List
        </Button>
      </Container>
    );
  }

  return (
    <Container className="p-4 border rounded bg-light">
      <h3>
        {isEditMode
          ? "Edit Technician Diagnostic"
          : "Assign Technician Diagnostic"}
      </h3>

      {/* Mostrar mensajes de error o éxito */}
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Información del vehículo (solo lectura) */}
      <h5>Vehicle Information</h5>
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group controlId="vin">
            <Form.Label>VIN</Form.Label>
            <Form.Control
              type="text"
              value={diagnostic.vehicle?.vin || "N/A"}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="make">
            <Form.Label>Make</Form.Label>
            <Form.Control
              type="text"
              value={diagnostic.vehicle?.make || "N/A"}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="model">
            <Form.Label>Model</Form.Label>
            <Form.Control
              type="text"
              value={diagnostic.vehicle?.model || "N/A"}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="plate">
            <Form.Label>Plate</Form.Label>
            <Form.Control
              type="text"
              value={diagnostic.vehicle?.plate || "N/A"}
              readOnly
            />
          </Form.Group>
        </Col>
      </Row>
      <Row className="mb-3">
        <Col md={3}>
          <Form.Group controlId="engine">
            <Form.Label>Engine</Form.Label>
            <Form.Control
              type="text"
              value={diagnostic.vehicle?.engine || "N/A"}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Control
              type="text"
              value={diagnostic.vehicle?.status || "N/A"}
              readOnly
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="reasonForVisit">
            <Form.Label>Reason for Visit</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={diagnostic.reasonForVisit || "N/A"}
              readOnly
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Formulario de Technician Diagnostic */}
      <Form onSubmit={handleSubmit}>
        <h5>Technician Diagnostic Information</h5>
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="mileage">
              <Form.Label>Vehicle Mileage</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleMileageChange}
                required
                maxLength={7} // "999,999" tiene 7 caracteres
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="extendedDiagnostic">
              <Form.Label>Extended Diagnostic</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Reported issues, tests performed, recommendations..."
                name="extendedDiagnostic"
                value={formData.extendedDiagnostic}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Botones */}
        <div className="d-flex justify-content-end">
          <Button
            variant="secondary"
            className="me-2"
            onClick={() => navigate("/technicianDiagnosticList")}
          >
            Cancel
          </Button>
          {isEditMode && (
            <Button
              variant="danger"
              className="me-2"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          )}
          <Button variant="success" type="submit">
            {isEditMode ? "Save Changes" : "Save Technician Diagnostic"}
          </Button>
        </div>
      </Form>

      <NotesSection diagId={diagnostic.id} techDiagId={techDiagId} />

      {/* Modal de Confirmación de Eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Technician Diagnostic</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this Technician Diagnostic?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TechnicianDiagnostic;
