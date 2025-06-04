import { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Row,
  Col,
  Spin,
  Alert,
  Checkbox,
  Card,
  message,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  getUserWorkshopByIdWithVehicles,
  updateUserWorkshop,
} from "../../../services/UserWorkshopService";
import PropTypes from "prop-types";

const formatPhoneNumber = (input) => {
  const digits = input.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} - ${digits.slice(6)}`;
};

const UserWorkshopEditModal = ({ visible, onCancel, userWorkshopId, onSuccess }) => {
  const [userWorkshop, setUserWorkshop] = useState({
    id: null,
    email: "",
    name: "",
    lastName: "",
    username: "",
    profile: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    primaryNumber: "",
    secondaryNumber: "",
    noTax: false,
    vehicles: [],
  });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    if (!visible || !userWorkshopId) return;
    
    const fetchData = async () => {
      setLoading(true);
      setSubmitError(null);
      try {
        const token = getToken();
        if (!token) throw new Error("Missing authentication token.");
        
        const data = await getUserWorkshopByIdWithVehicles(userWorkshopId, token);
        setUserWorkshop({
          id: data.id,
          email: data.email || "",
          name: data.name || "",
          lastName: data.lastName || "",
          username: data.username || "",
          profile: data.profile || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zip: data.zip || "",
          primaryNumber: data.primaryNumber || "",
          secondaryNumber: data.secondaryNumber || "",
          noTax: data.noTax || false,
          vehicles: data.vehicles?.map((v) => ({
            id: v.id,
            vin: v.vin || "",
            make: v.make || "",
            model: v.model || "",
            year: v.year || "",
            engine: v.engine || "",
            plate: v.plate || "",
            state: v.state || "",
            status: v.status || "Visto",
          })) || [],
        });
      } catch (err) {
        setSubmitError(err.message);
        message.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [visible, userWorkshopId]);

  const handleInputChange = (field, value) => {
    if (field === "primaryNumber" || field === "secondaryNumber") {
      value = formatPhoneNumber(value);
    }
    setUserWorkshop((prev) => ({ ...prev, [field]: value }));
  };

  const handleVehicleChange = (index, field, value) => {
    setUserWorkshop((prev) => {
      const vehicles = [...prev.vehicles];
      vehicles[index] = { ...vehicles[index], [field]: value };
      return { ...prev, vehicles };
    });
  };

  const addVehicle = () => {
    setUserWorkshop((prev) => ({
      ...prev,
      vehicles: [
        ...prev.vehicles,
        {
          id: 0, // New vehicle
          vin: "",
          make: "",
          model: "",
          year: "",
          engine: "",
          plate: "",
          state: "",
          status: "Visto",
        },
      ],
    }));
  };

  const removeVehicle = (index) => {
    setUserWorkshop((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const token = getToken();
      let payload = { ...userWorkshop };

      // Required fields validation
      const requiredFields = ["name", "lastName", "primaryNumber"];
      const missingFields = requiredFields.filter(
        (field) => !payload[field].trim()
      );

      // Validate vehicles
      const invalidVehicles = payload.vehicles.filter(
        (v) =>
          !v.vin.trim() || !v.make.trim() || !v.model.trim() || !v.year.trim()
      );

      if (missingFields.length > 0 || invalidVehicles.length > 0) {
        throw new Error("Please complete all required fields");
      }

      // Filter vehicles without VIN
      payload.vehicles = payload.vehicles.filter((v) => v.vin.trim());

      // Remove empty secondary number to satisfy backend phone validation
      if (!payload.secondaryNumber.trim()) {
        delete payload.secondaryNumber;
      }

      // Always include address field (never null)
      payload.address = payload.address || "";

      await updateUserWorkshop(userWorkshopId, payload, token);
      message.success("Workshop updated successfully.");
      onSuccess?.();
    } catch (err) {
      setSubmitError(err.message || "Error updating the workshop.");
      message.error(err.message || "Error updating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title="Edit Workshop with Multiple Vehicles"
      open={visible}
      onCancel={onCancel}
      width="90%"
      styles={{
        body: {
          maxHeight: "80vh",
          overflow: "auto",
        }
      }}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isSubmitting}
          onClick={handleSubmit}
          disabled={loading}
        >
          Update Workshop
        </Button>,
      ]}
      destroyOnClose
    >
      {loading ? (
        <Spin tip="Loading workshop data..." style={{ display: "block", margin: "50px auto" }} />
      ) : (
        <>
          {submitError && (
            <Alert
              type="error"
              message={submitError}
              style={{ marginBottom: 16 }}
            />
          )}

          <Form layout="vertical">
            {/* Owner Information */}
            <Card title="Owner Information" style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Email">
                    <Input
                      value={userWorkshop.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="First Name" required>
                    <Input
                      value={userWorkshop.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Last Name" required>
                    <Input
                      value={userWorkshop.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Address Information */}
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item label="Address">
                    <Input
                      value={userWorkshop.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="City">
                    <Input
                      value={userWorkshop.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="State">
                    <Input
                      value={userWorkshop.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="Zip Code">
                    <Input
                      value={userWorkshop.zip}
                      onChange={(e) => handleInputChange("zip", e.target.value)}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Phones and Tax Exemption */}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Primary Number" required>
                    <Input
                      placeholder="(000) 000 - 0000"
                      value={userWorkshop.primaryNumber}
                      onChange={(e) =>
                        handleInputChange("primaryNumber", e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Form.Item label="Secondary Number">
                    <Input
                      placeholder="(000) 000 - 0000"
                      value={userWorkshop.secondaryNumber}
                      onChange={(e) =>
                        handleInputChange("secondaryNumber", e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={8} style={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    checked={userWorkshop.noTax}
                    onChange={(e) => handleInputChange("noTax", e.target.checked)}
                  >
                    Tax Exempt
                  </Checkbox>
                </Col>
              </Row>
            </Card>

            {/* Vehicle Information */}
            <Card title="Vehicle Information">
              {userWorkshop.vehicles.map((vehicle, i) => (
                <div key={i} style={{ marginBottom: 24, padding: 16, border: "1px solid #f0f0f0", borderRadius: 8 }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="VIN" required>
                        <Input
                          maxLength={17}
                          value={vehicle.vin}
                          onChange={(e) =>
                            handleVehicleChange(i, "vin", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="Make" required>
                        <Input
                          value={vehicle.make}
                          onChange={(e) =>
                            handleVehicleChange(i, "make", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="Model" required>
                        <Input
                          value={vehicle.model}
                          onChange={(e) =>
                            handleVehicleChange(i, "model", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} style={{ textAlign: "right" }}>
                      <Button
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => removeVehicle(i)}
                        disabled={userWorkshop.vehicles.length === 1}
                      >
                        Remove
                      </Button>
                    </Col>
                  </Row>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="Year" required>
                        <Input
                          maxLength={4}
                          value={vehicle.year}
                          onChange={(e) =>
                            handleVehicleChange(i, "year", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="Engine">
                        <Input
                          value={vehicle.engine}
                          onChange={(e) =>
                            handleVehicleChange(i, "engine", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="Plate">
                        <Input
                          value={vehicle.plate}
                          onChange={(e) =>
                            handleVehicleChange(i, "plate", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                      <Form.Item label="State">
                        <Input
                          value={vehicle.state}
                          onChange={(e) =>
                            handleVehicleChange(i, "state", e.target.value)
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>
              ))}

              <Button
                type="dashed"
                block
                icon={<PlusOutlined />}
                onClick={addVehicle}
                style={{ marginTop: 16 }}
              >
                Add Vehicle
              </Button>
            </Card>
          </Form>
        </>
      )}
    </Modal>
  );
};

UserWorkshopEditModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  userWorkshopId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onSuccess: PropTypes.func,
};

export default UserWorkshopEditModal;
