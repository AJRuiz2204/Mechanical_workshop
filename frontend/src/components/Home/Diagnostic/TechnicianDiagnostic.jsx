/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  createTechnicianDiagnostic,
  getTechnicianDiagnostic,
  updateTechnicianDiagnostic,
  deleteTechnicianDiagnostic,
} from "../../../services/TechnicianDiagnosticService";
import { getDiagnosticById } from "../../../services/DiagnosticService";
import { Form, Input, Button, Row, Col, Spin, Modal } from "antd";
import NotesSection from "../../NotesSection/NotesSection";
import { SuccessModal, ErrorModal } from "../../Modals";

/**
 * TechnicianDiagnostic Component
 *
 * Description:
 * This component allows a technician to create or edit a diagnostic associated with a vehicle.
 * It displays read-only vehicle information, provides a form to enter the mileage (with proper formatting)
 * and an extended diagnostic description, and integrates a notes section for additional technician notes.
 * It also allows deletion of an existing technician diagnostic.
 *
 * Features:
 * - Displays vehicle details passed via route state.
 * - Provides a mileage input (numeric, formatted with grouping separators) and an extended diagnostic textarea.
 * - In edit mode, pre-populates the form with existing technician diagnostic data.
 * - Offers Save and Delete actions.
 * - Includes a NotesSection component for technician notes.
 * - Uses Ant Design components for layout, forms, modals, alerts, and spinners.
 * - Responsive design is implemented via Ant Design grid system and custom CSS.
 *
 * @returns {JSX.Element} The TechnicianDiagnostic component.
 */
const TechnicianDiagnostic = () => {
  const navigate = useNavigate();
  const { diagnosticId, techDiagId } = useParams();
  const location = useLocation();
  // Retrieve the vehicle information from route state (if provided)
  const { vehicle } = location.state || {};

  // Determine mode: edit mode if an existing technician diagnostic is provided
  const [isEditMode, setIsEditMode] = useState(false);

  // Holds the diagnostic data retrieved from the server (parent diagnostic)
  const [diagnostic, setDiagnostic] = useState(null);
  // Holds the technician diagnostic data (if in edit mode)
  const [technicianDiagnostic, setTechnicianDiagnostic] = useState(null);

  // Form state for mileage and extended diagnostic description
  const [formData, setFormData] = useState({
    mileage: "",
    extendedDiagnostic: "",
  });

  // State for error and success messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Modal states for success and error messages
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Loading indicator
  const [loading, setLoading] = useState(true);

  // Modal state for delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /**
   * formatMileage Function
   *
   * Formats a numeric mileage value using locale-specific grouping.
   *
   * @param {number} num - The numeric mileage.
   * @returns {string} The formatted mileage.
   */
  const formatMileage = (num) => {
    if (isNaN(num)) return "";
    return num.toLocaleString("en-US", {
      minimumIntegerDigits: 1,
      useGrouping: true,
    });
  };

  /**
   * parseMileage Function
   *
   * Converts a formatted mileage string (with grouping separators) back to a number.
   *
   * @param {string} str - The formatted mileage string.
   * @returns {number} The numeric mileage.
   */
  const parseMileage = (str) => {
    const num = parseInt(str.replace(/,/g, ""), 10);
    return isNaN(num) ? 0 : num;
  };

  /**
   * handleChange Function
   *
   * Updates the form data state when the extended diagnostic input changes.
   *
   * @param {Object} e - The change event.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * handleMileageChange Function
   *
   * Handles input in the mileage field:
   * - Strips non-numeric characters.
   * - Limits input to 6 digits.
   * - Formats the numeric value with grouping separators.
   *
   * @param {Object} e - The change event.
   */
  const handleMileageChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 6) val = val.slice(0, 6);
    if (val.length === 0) {
      setFormData({ ...formData, mileage: "" });
      return;
    }
    let numericVal = parseInt(val, 10);
    if (isNaN(numericVal)) numericVal = 0;
    if (numericVal > 999999) numericVal = 999999;
    val = numericVal.toLocaleString("en-US", {
      minimumIntegerDigits: 1,
      useGrouping: true,
    });
    setFormData({ ...formData, mileage: val });
  };

  /**
   * handleSubmit Function
   *
   * Validates the form and either creates a new technician diagnostic
   * or updates an existing one based on the mode.
   */
  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    const mileageNumber = parseMileage(formData.mileage);
    if (!formData.mileage || mileageNumber === 0) {
      setErrorMessage("Mileage is required and cannot be zero.");
      setShowErrorModal(true);
      return;
    }
    if (!formData.extendedDiagnostic.trim()) {
      setErrorMessage("Extended diagnostic is required.");
      setShowErrorModal(true);
      return;
    }
    if (mileageNumber < 1 || mileageNumber > 999999) {
      setErrorMessage("Mileage must be between 1 and 999,999.");
      setShowErrorModal(true);
      return;
    }

    const techDiagData = {
      mileage: mileageNumber,
      extendedDiagnostic: formData.extendedDiagnostic.trim(),
    };

    try {
      if (isEditMode) {
        // Update existing technician diagnostic
        await updateTechnicianDiagnostic(technicianDiagnostic.id, techDiagData);
        setSuccessMessage("Technician Diagnostic updated successfully.");
      } else {
        // Create a new technician diagnostic
        const payload = {
          diagnosticId: diagnostic.id,
          ...techDiagData,
        };
        await createTechnicianDiagnostic(payload);
        setSuccessMessage("Technician Diagnostic created successfully.");
      }
      setShowSuccessModal(true);
      setTimeout(() => navigate("/technicianDiagnosticList"), 2000);
    } catch (error) {
      setErrorMessage(
        "Error saving the Technician Diagnostic: " + error.message
      );
      setShowErrorModal(true);
    }
  };

  /**
   * handleDelete Function
   *
   * Deletes the current technician diagnostic after confirmation.
   */
  const handleDelete = async () => {
    try {
      await deleteTechnicianDiagnostic(technicianDiagnostic.id);
      setSuccessMessage("Technician Diagnostic deleted successfully.");
      setShowSuccessModal(true);
      setTimeout(() => navigate("/technicianDiagnosticList"), 2000);
    } catch (error) {
      setErrorMessage(
        "Error deleting the Technician Diagnostic: " + error.message
      );
      setShowErrorModal(true);
    }
  };

  /**
   * Data Loading Effect:
   * Fetches diagnostic data (by diagnosticId or techDiagId) and determines if the component
   * is in edit mode. Pre-populates the form if data exists.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setErrorMessage("");
        setSuccessMessage("");

        if (diagnosticId) {
          const diag = await getDiagnosticById(diagnosticId);
          setDiagnostic(diag);
          if (diag.technicianDiagnostics?.length) {
            const existingTechDiag = diag.technicianDiagnostics[0];
            setIsEditMode(true);
            setTechnicianDiagnostic(existingTechDiag);
            setFormData({
              mileage: formatMileage(existingTechDiag.mileage),
              extendedDiagnostic: existingTechDiag.extendedDiagnostic,
            });
          }
        } else if (techDiagId) {
          setIsEditMode(true);
          const techDiag = await getTechnicianDiagnostic(techDiagId);
          setTechnicianDiagnostic(techDiag);
          const diagId = techDiag.diagnosticId;
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
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [diagnosticId, techDiagId]);

  if (loading) {
    return (
      <Spin
        size="large"
        style={{ width: "100%", marginTop: 200, textAlign: "center" }}
      />
    );
  }

  if (!diagnostic) {
    return (
      <div className="diagnostic-container">
        <h3>Error Loading Diagnostic</h3>
        <Button onClick={() => navigate("/technicianDiagnosticList")}>
          Back to Diagnostics List
        </Button>
      </div>
    );
  }

  return (
    <div
      className="diagnostic-container"
      style={{ maxHeight: "100vh", overflowY: "auto" }}
    >
      <h3>
        {isEditMode
          ? "Edit Technician Diagnostic"
          : "Assign Technician Diagnostic"}
      </h3>

      <h5>Vehicle Information</h5>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Form.Item label="VIN">
            <Input value={diagnostic.vehicle?.vin || "N/A"} readOnly />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Make">
            <Input value={diagnostic.vehicle?.make || "N/A"} readOnly />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Model">
            <Input value={diagnostic.vehicle?.model || "N/A"} readOnly />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Plate">
            <Input value={diagnostic.vehicle?.plate || "N/A"} readOnly />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Form.Item label="Engine">
            <Input value={diagnostic.vehicle?.engine || "N/A"} readOnly />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item label="Status">
            <Input value={diagnostic.vehicle?.status || "N/A"} readOnly />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Customer State">
            <Input.TextArea
              rows={2}
              value={diagnostic.reasonForVisit || "N/A"}
              readOnly
            />
          </Form.Item>
        </Col>
      </Row>

      <Form layout="vertical" onFinish={handleSubmit}>
        <h5>Technician Diagnostic Information</h5>
        <Form.Item
          label="Vehicle Mileage"
          rules={[{ required: true, message: "Mileage is required" }]}
        >
          <Input
            placeholder="Enter mileage"
            value={formData.mileage}
            onChange={handleMileageChange}
            maxLength={7}
          />
        </Form.Item>
        <Form.Item
          label="Extended Diagnostic"
          rules={[{ required: true, message: "Extended diagnostic is required" }]}
        >
          <Input.TextArea
            name="extendedDiagnostic"
            rows={3}
            placeholder="Enter detailed diagnostic information..."
            value={formData.extendedDiagnostic}
            onChange={handleChange}
          />
        </Form.Item>
        <Form.Item>
          <Button
            style={{ marginRight: 8 }}
            onClick={() => navigate("/technicianDiagnosticList")}
          >
            Cancel
          </Button>
          {isEditMode && (
            <Button
              danger
              style={{ marginRight: 8 }}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete
            </Button>
          )}
          <Button
            type="primary"
            htmlType="submit"
            style={{ marginRight: 0 }}
          >
            {isEditMode ? "Save Changes" : "Save Technician Diagnostic"}
          </Button>
        </Form.Item>
      </Form>

      <NotesSection
        diagId={diagnostic.id}
        techDiagId={technicianDiagnostic?.id}
      />

      <Modal
        title="Delete Technician Diagnostic"
        open={showDeleteModal}
        onOk={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        okType="danger"
        okText="Delete"
      >
        Are you sure you want to delete this Technician Diagnostic?
      </Modal>

      {/* Success and Error Modals */}
      <SuccessModal
        open={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />
      
      <ErrorModal
        open={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
};

export default TechnicianDiagnostic;
