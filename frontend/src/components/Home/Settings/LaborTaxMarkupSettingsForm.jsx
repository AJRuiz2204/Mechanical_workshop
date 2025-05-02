import { useState, useEffect } from "react";
import {
  Form,
  InputNumber,
  Checkbox,
  Button,
  Row,
  Col,
  Spin,
  Alert,
  Card,
  Typography,
  Space,
} from "antd";
import {
  getSettingsById,
  createSettings,
  patchSettings,
} from "../../../services/laborTaxMarkupSettingsService";

const { Title, Text } = Typography;

const LaborTaxMarkupSettingsForm = () => {
  // Constant setting ID used for fetching settings
  const SETTINGS_ID = 1;

  const [formData, setFormData] = useState({
    hourlyRate1: "",
    hourlyRate2: "",
    hourlyRate3: "",
    defaultHourlyRate: "",
    partTaxRate: "",
    partTaxByDefault: false,
    laborTaxRate: "",
    laborTaxByDefault: false,
    partMarkup: "",
  });
  const [dbData, setDbData] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Converts empty strings or other non-numeric values to a safe number
  const safeNumber = (val) => {
    if (val === "" || val == null) return 0;
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  };

  // Fetch settings on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getSettingsById(SETTINGS_ID);
        setDbData(data);
        setRecordId(data.id);
        setIsEditMode(true);
        setFormData({
          hourlyRate1: data.hourlyRate1 || "",
          hourlyRate2: data.hourlyRate2 || "",
          hourlyRate3: data.hourlyRate3 || "",
          defaultHourlyRate: data.defaultHourlyRate || "",
          partTaxRate: data.partTaxRate || "",
          partTaxByDefault: data.partTaxByDefault,
          laborTaxRate: data.laborTaxRate || "",
          laborTaxByDefault: data.laborTaxByDefault,
          partMarkup: data.partMarkup || "",
        });
      } catch (err) {
        if (err.status === 404 || err.message?.includes("404")) {
          setIsEditMode(false);
        } else {
          setError(err.message || "Error loading settings.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Handle input changes in the form fields
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Create new settings
  const handleSubmitCreate = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const dto = {
        hourlyRate1: safeNumber(formData.hourlyRate1),
        hourlyRate2: safeNumber(formData.hourlyRate2),
        hourlyRate3: safeNumber(formData.hourlyRate3),
        defaultHourlyRate: safeNumber(formData.defaultHourlyRate),
        partTaxRate: safeNumber(formData.partTaxRate),
        partTaxByDefault: formData.partTaxByDefault,
        laborTaxRate: safeNumber(formData.laborTaxRate),
        laborTaxByDefault: formData.laborTaxByDefault,
        partMarkup: safeNumber(formData.partMarkup),
      };
      const created = await createSettings(dto);
      setRecordId(created.id);
      setIsEditMode(true);
      setSuccess("Settings created successfully.");
      const fresh = await getSettingsById(created.id);
      setDbData(fresh);
      setFormData({
        hourlyRate1: "",
        hourlyRate2: "",
        hourlyRate3: "",
        defaultHourlyRate: "",
        partTaxRate: "",
        partTaxByDefault: false,
        laborTaxRate: "",
        laborTaxByDefault: false,
        partMarkup: "",
      });
    } catch (err) {
      setError(err.message || "Error creating settings.");
    } finally {
      setSaving(false);
    }
  };

  // Update existing settings
  const handleSubmitPatch = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const patchDoc = [
        {
          op: "replace",
          path: "/hourlyRate1",
          value: safeNumber(formData.hourlyRate1),
        },
        {
          op: "replace",
          path: "/hourlyRate2",
          value: safeNumber(formData.hourlyRate2),
        },
        {
          op: "replace",
          path: "/hourlyRate3",
          value: safeNumber(formData.hourlyRate3),
        },
        {
          op: "replace",
          path: "/defaultHourlyRate",
          value: safeNumber(formData.defaultHourlyRate),
        },
        {
          op: "replace",
          path: "/partTaxRate",
          value: safeNumber(formData.partTaxRate),
        },
        {
          op: "replace",
          path: "/partTaxByDefault",
          value: formData.partTaxByDefault,
        },
        {
          op: "replace",
          path: "/laborTaxRate",
          value: safeNumber(formData.laborTaxRate),
        },
        {
          op: "replace",
          path: "/laborTaxByDefault",
          value: formData.laborTaxByDefault,
        },
        {
          op: "replace",
          path: "/partMarkup",
          value: safeNumber(formData.partMarkup),
        },
      ];
      await patchSettings(recordId, patchDoc);
      setSuccess("Settings updated successfully.");
      const fresh = await getSettingsById(recordId);
      setDbData(fresh);
      setFormData({
        hourlyRate1: "",
        hourlyRate2: "",
        hourlyRate3: "",
        defaultHourlyRate: "",
        partTaxRate: "",
        partTaxByDefault: false,
        laborTaxRate: "",
        laborTaxByDefault: false,
        partMarkup: "",
      });
    } catch (err) {
      setError(err.message || "Error updating settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = isEditMode ? handleSubmitPatch : handleSubmitCreate;

  if (loading) {
    return (
      <Spin
        tip="Loading settings..."
        style={{ display: "block", margin: "100px auto" }}
      />
    );
  }

  return (
    <Row gutter={24}>
      {/* Form for create/update */}
      <Col xs={24} sm={12}>
        <Card>
          <Title level={4}>
            Labor & Tax Markup Settings — {isEditMode ? "Edit" : "Create"}
          </Title>

          {error && (
            <Alert type="error" message={error} style={{ marginBottom: 16 }} />
          )}
          {success && (
            <Alert
              type="success"
              message={success}
              style={{ marginBottom: 16 }}
            />
          )}

          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item label="Hourly Rate 1" required>
              <InputNumber
                style={{ width: "100%" }}
                value={formData.hourlyRate1}
                onChange={(v) => handleChange("hourlyRate1", v)}
                step={0.01}
              />
            </Form.Item>

            <Form.Item label="Hourly Rate 2" required>
              <InputNumber
                style={{ width: "100%" }}
                value={formData.hourlyRate2}
                onChange={(v) => handleChange("hourlyRate2", v)}
                step={0.01}
              />
            </Form.Item>

            <Form.Item label="Hourly Rate 3" required>
              <InputNumber
                style={{ width: "100%" }}
                value={formData.hourlyRate3}
                onChange={(v) => handleChange("hourlyRate3", v)}
                step={0.01}
              />
            </Form.Item>

            <Form.Item label="Default Hourly Rate" required>
              <InputNumber
                style={{ width: "100%" }}
                value={formData.defaultHourlyRate}
                onChange={(v) => handleChange("defaultHourlyRate", v)}
                step={0.01}
              />
            </Form.Item>

            <Form.Item label="Part Tax Rate" required>
              <InputNumber
                style={{ width: "100%" }}
                value={formData.partTaxRate}
                onChange={(v) => handleChange("partTaxRate", v)}
                step={0.01}
              />
            </Form.Item>

            <Form.Item>
              <Checkbox
                checked={formData.partTaxByDefault}
                onChange={(e) =>
                  handleChange("partTaxByDefault", e.target.checked)
                }
              >
                Part Tax by Default
              </Checkbox>
            </Form.Item>

            <Form.Item label="Labor Tax Rate" required>
              <InputNumber
                style={{ width: "100%" }}
                value={formData.laborTaxRate}
                onChange={(v) => handleChange("laborTaxRate", v)}
                step={0.01}
              />
            </Form.Item>

            <Form.Item>
              <Checkbox
                checked={formData.laborTaxByDefault}
                onChange={(e) =>
                  handleChange("laborTaxByDefault", e.target.checked)
                }
              >
                Labor Tax by Default
              </Checkbox>
            </Form.Item>

            <Form.Item label="Part Markup" required>
              <InputNumber
                style={{ width: "100%" }}
                value={formData.partMarkup}
                onChange={(v) => handleChange("partMarkup", v)}
                step={0.01}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={saving}>
                  {isEditMode ? "Update" : "Create"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Col>

      {/* Section to read current settings from the DB */}
      <Col xs={24} sm={12}>
        <Card title="DB Read (Current Settings)">
          {!dbData ? (
            <Text type="secondary">No record in the database.</Text>
          ) : (
            <Form layout="vertical">
              <Form.Item label="DB Hourly Rate 1">
                <Text>{dbData.hourlyRate1}</Text>
              </Form.Item>
              <Form.Item label="DB Hourly Rate 2">
                <Text>{dbData.hourlyRate2}</Text>
              </Form.Item>
              <Form.Item label="DB Hourly Rate 3">
                <Text>{dbData.hourlyRate3}</Text>
              </Form.Item>
              <Form.Item label="DB Default Hourly Rate">
                <Text>{dbData.defaultHourlyRate}</Text>
              </Form.Item>
              <Form.Item label="DB Part Tax Rate">
                <Text>{dbData.partTaxRate}</Text>
              </Form.Item>
              <Form.Item label="DB Part Tax by Default">
                <Checkbox checked={dbData.partTaxByDefault} disabled />
              </Form.Item>
              <Form.Item label="DB Labor Tax Rate">
                <Text>{dbData.laborTaxRate}</Text>
              </Form.Item>
              <Form.Item label="DB Labor Tax by Default">
                <Checkbox checked={dbData.laborTaxByDefault} disabled />
              </Form.Item>
              <Form.Item label="DB Part Markup">
                <Text>{dbData.partMarkup}</Text>
              </Form.Item>
            </Form>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default LaborTaxMarkupSettingsForm;
