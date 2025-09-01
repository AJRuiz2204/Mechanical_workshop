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
  Typography,
  message,
  Space,
  Divider,
} from "antd";
import { 
  MinusCircleOutlined, 
  PlusOutlined, 
  SaveOutlined, 
  CloseOutlined,
} from "@ant-design/icons";
import {
  createUserWorkshop,
  getUserWorkshopByIdWithVehicles,
  updateUserWorkshop,
} from "../../../services/UserWorkshopService";
import NotificationService from "../../../services/notificationService.jsx";
import ConfirmationDialog from "../../common/ConfirmationDialog";
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
                  id: v.id,
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
                    id: null,
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
        const errorMsg = err.message || "Failed to load workshop data";
        setSubmitError(errorMsg);
        NotificationService.operationError('load', errorMsg);
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
          id: null,
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
    ConfirmationDialog.delete({
      title: 'Remove Vehicle',
      content: 'Are you sure you want to remove this vehicle from the list?',
      onConfirm: () => {
        setUserWorkshop((prev) => ({
          ...prev,
          vehicles: prev.vehicles.filter((_, i) => i !== index),
        }));
        message.success('Vehicle removed successfully');
      },
    });
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const token = getToken();
      let payload = { ...userWorkshop };

      const requiredFields = ["name", "lastName", "primaryNumber"];
      const missingFields = requiredFields.filter(
        (field) => !payload[field].trim()
      );

      const invalidVehicles = payload.vehicles.filter(
        (v) =>
          !v.vin.trim() || !v.make.trim() || !v.model.trim() || !v.year.trim()
      );

      // Validation
      if (missingFields.length > 0 || invalidVehicles.length > 0) {
        const errorMsg = "Please complete all required fields";
        setSubmitError(errorMsg);
        NotificationService.validationError('Required fields', errorMsg);
        return;
      }

      if (!payload.username.trim()) payload.username = storedUsername;
      if (!payload.profile.trim()) payload.profile = storedProfile;

      payload.vehicles = payload.vehicles.filter((v) => v.vin.trim());

      if (!payload.secondaryNumber.trim()) {
        delete payload.secondaryNumber;
      }

      payload.address = payload.address || "";

      if (editingId) {
        await updateUserWorkshop(editingId, payload, token);
        NotificationService.operationSuccess('update', 'Workshop information');
      } else {
        await createUserWorkshop(payload);
        NotificationService.operationSuccess('create', 'Workshop');
      }
      afterSubmit?.();
      onClose?.();
    } catch (err) {
      const errorMsg = err.message || "Error submitting the form.";
      setSubmitError(errorMsg);
      NotificationService.operationError('save', errorMsg);
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
            <Form.Item label="Email">
              <Input
                value={userWorkshop.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="First Name"
              required
              rules={[
                { required: true, message: "Please enter the first name" },
              ]}
            >
              <Input
                value={userWorkshop.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Form.Item
              label="Last Name"
              required
              rules={[
                { required: true, message: "Please enter the last name" },
              ]}
            >
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
            <Form.Item
              label="Primary Number"
              required
              rules={[
                { required: true, message: "Please enter the primary number" },
              ]}
            >
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
                  <Form.Item
                    label="VIN"
                    required
                    rules={[
                      { required: true, message: "Please enter the VIN" },
                    ]}
                  >
                    <Input
                      maxLength={17}
                      disabled={editingId && vehicle.vin && vehicle.id}
                      value={vehicle.vin}
                      onChange={(e) =>
                        handleVehicleChange(i, "vin", e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    label="Make"
                    required
                    rules={[
                      { required: true, message: "Please enter the make" },
                    ]}
                  >
                    <Input
                      value={vehicle.make}
                      onChange={(e) =>
                        handleVehicleChange(i, "make", e.target.value)
                      }
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Form.Item
                    label="Model"
                    required
                    rules={[
                      { required: true, message: "Please enter the model" },
                    ]}
                  >
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
                  <Form.Item
                    label="Year"
                    required
                    rules={[
                      { required: true, message: "Please enter the year" },
                    ]}
                  >
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
        <Divider />
        <Row justify="end">
          <Col>
            <Space size="middle">
              <Button 
                onClick={() => {
                  ConfirmationDialog.discardChanges({
                    onConfirm: () => onClose?.(),
                  });
                }}
                size="large"
              >
                <CloseOutlined />
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isSubmitting}
                size="large"
                disabled={isSubmitting}
              >
                <SaveOutlined />
                {editingId ? 'Update Workshop' : 'Save Workshop'}
              </Button>
            </Space>
          </Col>
        </Row>
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
