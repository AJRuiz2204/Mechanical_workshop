/* eslint-disable no-unused-vars */
// Frontend: src/components/Diagnostic/Diagnostic.jsx

import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  Spin,
} from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { createDiagnostic } from "../../../services/DiagnosticService";
import { getVehicleById } from "../../../services/VehicleService";
import technicianService from "../../../services/technicianService";
import { SuccessModal, ErrorModal } from "../../Modals";

const { TextArea } = Input;
const { Option } = Select;

/**
 * Diagnostic Component
 *
 * Description:
 * This component is used to create a new diagnostic for a given vehicle.
 * It fetches the vehicle information based on the provided vehicle ID from the URL,
 * retrieves a list of technicians, and provides a form to enter diagnostic details.
 * The form includes fields for selecting an assigned technician and entering the
 * reason for the visit (or customer state). Upon submission, a diagnostic is created.
 *
 * Responsive Behavior:
 * Uses Ant Design’s grid and utility classes along with custom CSS to ensure that
 * the layout and typography adjust properly on all devices.
 *
 * @returns {JSX.Element} The Diagnostic component.
 */
const Diagnostic = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get vehicle ID from route parameters

  // State for storing vehicle information
  const [vehicle, setVehicle] = useState(null);

  // State for storing technicians data
  const [technicians, setTechnicians] = useState([]);
  const [techLoading, setTechLoading] = useState(true);
  const [techError, setTechError] = useState("");

  // State for storing form data for diagnostic creation
  const [formData, setFormData] = useState({
    reasonForVisit: "",
    assignedTechnician: "",
  });

  // State for storing error and success messages
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Modal states for success and error messages
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // State for loading vehicle data
  const [loading, setLoading] = useState(true);

  /**
   * useEffect to fetch vehicle information when the component mounts.
   */
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        if (!id) {
          setErrorMessage("No vehicle ID provided.");
          setShowErrorModal(true);
          setLoading(false);
          return;
        }
        const data = await getVehicleById(id);
        setVehicle(data);
      } catch (error) {
        setErrorMessage("Error fetching vehicle information: " + error.message);
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id]);

  /**
   * useEffect to fetch technicians information when the component mounts.
   */
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const data = await technicianService.getTechnicians();
        setTechnicians(data);
      } catch (error) {
        setTechError("Error fetching technicians: " + error.message);
        setErrorMessage("Error fetching technicians: " + error.message);
        setShowErrorModal(true);
      } finally {
        setTechLoading(false);
      }
    };
    fetchTechnicians();
  }, []);

  /**
   * handleChange Function:
   * Handles changes in the diagnostic form inputs.
   *
   * @param {Object} e - The event object from the input change.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  /**
   * handleSubmit Function:
   * Handles form submission to create a new diagnostic.
   * Validates that a technician is assigned and a Customer state is provided.
   *
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!formData.assignedTechnician.trim()) {
      setErrorMessage("You must assign a technician.");
      return;
    }
    if (!formData.reasonForVisit.trim()) {
      setErrorMessage("Customer state is required.");
      return;
    }

    const diagnosticData = {
      vehicleId: parseInt(id, 10),
      assignedTechnician: formData.assignedTechnician.trim(),
      reasonForVisit: formData.reasonForVisit.trim(),
    };

    try {
      await createDiagnostic(diagnosticData);
      setSuccessMessage("Diagnostic created successfully.");
      setShowSuccessModal(true);
      // Navigate after modal is closed or after a delay
      setTimeout(() => navigate("/diagnostic-list"), 2000);
    } catch (error) {
      setErrorMessage("Error creating diagnostic: " + error.message);
      setShowErrorModal(true);
    }
  };

  // If there is an error loading initial data, show loading spinner and handle via modal
  if (loading || techLoading) {
    return (
      <div className="p-4 border rounded" style={{ minHeight: 200, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 border rounded bg-light">
      <h3>Create Diagnostic</h3>

      {/* Vehicle Information (read-only) */}
      <h5>Vehicle Information</h5>
      <Row gutter={16} className="mb-3">
        <Col span={8}>
          <Form.Item label="VIN">
            <Input value={vehicle.vin} readOnly />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Make">
            <Input value={vehicle.make} readOnly />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Model">
            <Input value={vehicle.model} readOnly />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16} className="mb-3">
        <Col span={8}>
          <Form.Item label="Engine">
            <Input value={vehicle.engine} readOnly />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Plate">
            <Input value={vehicle.plate} readOnly />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Status">
            <Input value={vehicle.status} readOnly />
          </Form.Item>
        </Col>
      </Row>

      {/* Diagnostic Form */}
      <Form onFinish={handleSubmit} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Assign Technician"
              name="assignedTechnician"
              rules={[{ required: true, message: "You must assign a technician." }]}
            >
              <Select
                placeholder="-- Select --"
                onChange={(value) => setFormData({ ...formData, assignedTechnician: value })}
              >
                {technicians.length
                  ? technicians.map((tech) => (
                      <Option
                        key={tech.ID}
                        value={`${tech.name} ${tech.lastName}`}
                      >{`${tech.name} ${tech.lastName}`}</Option>
                    ))
                  : null}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Customer state"
              name="reasonForVisit"
              rules={[{ required: true, message: "Customer state is required." }]}
            >
              <TextArea
                rows={3}
                placeholder="Enter the reason for the visit"
                onChange={(e) =>
                  setFormData({ ...formData, reasonForVisit: e.target.value })
                }
                value={formData.reasonForVisit}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Action Buttons */}
        <Form.Item style={{ textAlign: "right" }}>
          <Button
            style={{ marginRight: 8 }}
            onClick={() => navigate("/diagnostic-list")}
          >
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Save Diagnostic
          </Button>
        </Form.Item>
      </Form>

      {/* Success and Error Modals */}
      <SuccessModal
        open={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />
      
      <ErrorModal
        open={showErrorModal}
        message={errorMessage}
        onClose={() => {
          setShowErrorModal(false);
          // If error occurred during initial load, navigate back
          if (errorMessage.includes("fetching vehicle") || errorMessage.includes("No vehicle ID")) {
            navigate("/diagnostic-list");
          }
        }}
      />
    </div>
  );
};

export default Diagnostic;
