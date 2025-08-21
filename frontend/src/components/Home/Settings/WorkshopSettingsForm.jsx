import { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Spin,
  Card,
  Row,
  Col,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import {
  getWorkshopSettings,
  createWorkshopSettings,
  updateWorkshopSettings,
} from '../../../services/workshopSettingsService';
import WorkshopSettingsPreview from './WorkshopSettingsPreview';
import { SuccessModal, ErrorModal } from '../../Modals';

const { Title } = Typography;
const { TextArea } = Input;

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
 * - Ant Design components for UI.
 * - dayjs for date and time formatting.
 * - WorkshopSettingsService for API interactions.
 * - WorkshopSettingsPreview for displaying a preview of settings.
 */
const WorkshopSettingsForm = () => {
  const [form] = Form.useForm();
  const [savedSettings, setSavedSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Modal states for success and error messages
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length < 4) return digits;
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getWorkshopSettings();
        setSavedSettings(data);
        setIsEditMode(true);
        form.setFieldsValue({
          workshopName: data.workshopName,
          address: data.address,
          primaryPhone: data.primaryPhone,
          secondaryPhone: data.secondaryPhone,
          fax: data.fax,
          websiteUrl: data.websiteUrl,
          disclaimer: data.disclaimer,
          email: data.email,
        });
      } catch (err) {
        if (err.message === 'Workshop settings not found.') {
          setIsEditMode(false);
        } else {
          setError(err.message || 'Error fetching workshop settings.');
          setShowErrorModal(true);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [form]);

  const onFinish = async (values) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const timestamp = dayjs().format();

    const payload = {
      ...values,
      primaryPhone: formatPhoneNumber(values.primaryPhone),
      secondaryPhone: formatPhoneNumber(values.secondaryPhone),
      fax: formatPhoneNumber(values.fax),
      lastUpdated: timestamp,
    };

    try {
      if (isEditMode && savedSettings?.id) {
        await updateWorkshopSettings(savedSettings.id, payload);
        setSuccess('Workshop settings updated successfully.');
        const updated = await getWorkshopSettings();
        setSavedSettings(updated);
      } else {
        const created = await createWorkshopSettings(payload);
        setSavedSettings(created);
        setIsEditMode(true);
        setSuccess('Workshop settings created successfully.');
      }
      setShowSuccessModal(true);
      form.resetFields();
    } catch (err) {
      setError(err.message || 'Error saving workshop settings.');
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Spin
        tip="Loading settings..."
        style={{ display: 'block', margin: '100px auto' }}
      />
    );
  }

  return (
    <Card style={{ margin: 24 }}>
      <Row gutter={24}>
        <Col span={12}>
          <Title level={4}>
            {isEditMode ? 'Edit Workshop Settings' : 'Create Workshop Settings'}
          </Title>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              workshopName: '',
              address: '',
              primaryPhone: '',
              secondaryPhone: '',
              fax: '',
              websiteUrl: '',
              disclaimer: '',
              email: '',
            }}
          >
            <Form.Item
              label="Workshop Name"
              name="workshopName"
              rules={[{ required: true, message: 'Workshop name is required.' }]}
            >
              <Input placeholder="Enter workshop name" />
            </Form.Item>

            <Form.Item
              label="Address"
              name="address"
              rules={[{ required: true, message: 'Address is required.' }]}
            >
              <Input placeholder="Enter address" />
            </Form.Item>

            <Form.Item
              label="Primary Phone"
              name="primaryPhone"
              rules={[
                { required: true, message: 'Primary phone is required.' },
                {
                  pattern: /^\(\d{3}\) \d{3}-\d{4}$/,
                  message: 'Format must be (000) 000-0000',
                },
              ]}
            >
              <Input placeholder="(000) 000-0000" />
            </Form.Item>

            <Form.Item
              label="Secondary Phone"
              name="secondaryPhone"
              rules={[
                {
                  pattern: /^\(\d{3}\) \d{3}-\d{4}$/,
                  message: 'Format must be (000) 000-0000',
                },
              ]}
            >
              <Input placeholder="(000) 000-0000" />
            </Form.Item>

            <Form.Item
              label="Fax"
              name="fax"
              rules={[
                {
                  pattern: /^\(\d{3}\) \d{3}-\d{4}$/,
                  message: 'Format must be (000) 000-0000',
                },
              ]}
            >
              <Input placeholder="(000) 000-0000" />
            </Form.Item>

            <Form.Item
              label="Website URL"
              name="websiteUrl"
              rules={[{ type: 'url', message: 'Enter a valid URL.' }]}
            >
              <Input placeholder="https://yourwebsite.com" />
            </Form.Item>

            <Form.Item
              label="Email Address"
              name="email"
              rules={[{ type: 'email', message: 'Enter a valid email.' }]}
            >
              <Input placeholder="Enter email address" />
            </Form.Item>

            <Form.Item label="Disclaimer" name="disclaimer">
              <TextArea rows={3} placeholder="Enter disclaimer..." />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={saving}>
                {isEditMode ? 'Update Settings' : 'Create Settings'}
              </Button>
            </Form.Item>
          </Form>
        </Col>

        <Col span={12}>
          <WorkshopSettingsPreview settings={savedSettings} />
        </Col>
      </Row>

      {/* Success and Error Modals */}
      <SuccessModal
        open={showSuccessModal}
        message={success}
        onClose={() => setShowSuccessModal(false)}
      />
      
      <ErrorModal
        open={showErrorModal}
        message={error}
        onClose={() => setShowErrorModal(false)}
      />
    </Card>
  );
};

export default WorkshopSettingsForm;
