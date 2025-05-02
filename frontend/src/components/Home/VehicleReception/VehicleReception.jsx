import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Spin,
  Alert,
  Checkbox,
  Card,
  Space,
  Typography,
  message,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  createUserWorkshop,
  getUserWorkshopByIdWithVehicles,
  updateUserWorkshop,
} from "../../../services/UserWorkshopService";
import PropTypes from "prop-types";

const { Title } = Typography;

const formatPhoneNumber = (input) => {
  const digits = input.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length < 4) return `(${digits}`;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} - ${digits.slice(6)}`;
};

const VehicleReception = ({ onClose, afterSubmit, editingId }) => {
  const storedUsername = localStorage.getItem("username") || "defaultUser";
  const storedProfile = localStorage.getItem("profile") || "Manager";

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
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getToken = () => localStorage.getItem("token") || "";

  useEffect(() => {
    if (!editingId) return;
    (async () => {
      setLoading(true);
      try {
        const token = getToken();
        if (!token) throw new Error("Missing authentication token.");
        const data = await getUserWorkshopByIdWithVehicles(editingId, token);
        setUserWorkshop({
          id: data.id,
          email: data.email || "",
          name: data.name || "",
          lastName: data.lastName || "",
          username: data.username?.trim() || storedUsername,
          profile: data.profile?.trim() || storedProfile,
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zip: data.zip || "",
          primaryNumber: data.primaryNumber || "",
          secondaryNumber: data.secondaryNumber || "",
          noTax: data.noTax || false,
          vehicles:
            data.vehicles?.length > 0
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
      } catch (err) {
        setSubmitError(err.message);
        message.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [editingId, storedUsername, storedProfile]);

  const handleInputChange = (field, value) => {
    if (field === "primaryNumber" || field === "secondaryNumber") {
      value = formatPhoneNumber(value);
    }
    setUserWorkshop((prev) => ({ ...prev, [field]: value }));
  };

  const handleVehicleChange = (index, field, value) => {
    setUserWorkshop((prev) => {
      const vehicles = [...prev.vehicles];
      vehicles[index][field] = value;
      return { ...prev, vehicles };
    });
  };

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

      // Ensure username and profile
      if (!payload.username.trim()) payload.username = storedUsername;
      if (!payload.profile.trim()) payload.profile = storedProfile;

      // Filter vehicles without VIN
      payload.vehicles = payload.vehicles.filter((v) => v.vin.trim());

      if (editingId) {
        await updateUserWorkshop(editingId, payload, token);
        message.success("Workshop updated.");
      } else {
        await createUserWorkshop(payload);
        message.success("Workshop registered.");
      }
      afterSubmit?.();
      onClose?.();
    } catch (err) {
      setSubmitError(err.message || "Error submitting the form.");
      message.error(err.message || "Error submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Spin
        tip="Loading data..."
        style={{ display: "block", margin: "100px auto" }}
      />
    );
  }

  return (
    <Card style={{ margin: 24 }}>
      <Title level={4}>
        {editingId ? "Edit Workshop" : "Register Workshop"}
      </Title>
      {submitError && (
        <Alert
          type="error"
          message={submitError}
          style={{ marginBottom: 16 }}
        />
      )}

      <Form layout="vertical" onFinish={handleSubmit}>
        {/* Owner Information */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Form.Item label="Email" required>
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
            <Form.Item label="Address" required>
              <Input
                value={userWorkshop.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="City" required>
              <Input
                value={userWorkshop.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="State" required>
              <Input
                value={userWorkshop.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Form.Item label="Zip Code" required>
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
          <Col
            xs={24}
            sm={24}
            md={8}
            style={{ display: "flex", alignItems: "center" }}
          >
            <Checkbox
              checked={userWorkshop.noTax}
              onChange={(e) => handleInputChange("noTax", e.target.checked)}
            >
              Tax Exempt
            </Checkbox>
          </Col>
        </Row>

        {/* Vehicle Information */}
        <Card
          type="inner"
          title="Vehicle Information"
          style={{ marginBottom: 24 }}
        >
          {userWorkshop.vehicles.map((vehicle, i) => (
            <div key={i} style={{ marginBottom: 24 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="VIN" required>
                    <Input
                      maxLength={17}
                      disabled={editingId && vehicle.vin}
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
                  <Form.Item label="Engine" required>
                    <Input
                      value={vehicle.engine}
                      onChange={(e) =>
                        handleVehicleChange(i, "engine", e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="Plate" required>
                    <Input
                      value={vehicle.plate}
                      onChange={(e) =>
                        handleVehicleChange(i, "plate", e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item label="State" required>
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

          <Form.Item>
            <Button
              type="dashed"
              block
              icon={<PlusOutlined />}
              onClick={addVehicle}
            >
              Add Vehicle
            </Button>
          </Form.Item>
        </Card>

        {/* Action Buttons */}
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Save
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

VehicleReception.propTypes = {
  onClose: PropTypes.func,
  afterSubmit: PropTypes.func,
  editingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default VehicleReception;
