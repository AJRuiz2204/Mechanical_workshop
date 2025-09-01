import { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Button, 
  Space, 
  Spin,
  Row,
  Col,
  Card,
  Divider,
  Typography,
  notification
} from 'antd';
import { 
  SaveOutlined, 
  CloseOutlined, 
  UserOutlined, 
  CarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  EditOutlined
} from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Text } = Typography;

const EditListModal = ({ 
  open, 
  onClose, 
  vehicleData, 
  onSave,
  loading = false 
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && vehicleData) {
      // Populate form with vehicle data
      form.setFieldsValue({
        // Vehicle information
        vin: vehicleData.vin,
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        engine: vehicleData.engine,
        plate: vehicleData.plate,
        state: vehicleData.state,
        // Owner information
        ownerName: vehicleData.owner?.name,
        ownerLastName: vehicleData.owner?.lastName,
        ownerEmail: vehicleData.owner?.email,
        ownerPhone: vehicleData.owner?.primaryNumber,
        ownerAddress: vehicleData.owner?.address,
        ownerCity: vehicleData.owner?.city,
        ownerState: vehicleData.owner?.state,
        ownerZip: vehicleData.owner?.zip,
      });
    }
  }, [open, vehicleData, form]);

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      // Transform form values to expected format
      const updatedData = {
        id: vehicleData.id,
        vin: values.vin,
        make: values.make,
        model: values.model,
        year: values.year,
        engine: values.engine,
        plate: values.plate,
        state: values.state,
        owner: {
          ...vehicleData.owner,
          name: values.ownerName,
          lastName: values.ownerLastName,
          email: values.ownerEmail,
          primaryNumber: values.ownerPhone,
          address: values.ownerAddress,
          city: values.ownerCity,
          state: values.ownerState,
          zip: values.ownerZip,
        }
      };

      await onSave(updatedData);
      
      notification.success({
        message: 'Success',
        description: 'Vehicle information updated successfully',
        placement: 'topRight',
        duration: 3,
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating vehicle:', error);
      notification.error({
        message: 'Update Failed',
        description: error.message || 'An error occurred while updating the vehicle information',
        placement: 'topRight',
        duration: 5,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    Modal.confirm({
      title: 'Discard Changes?',
      content: 'Are you sure you want to close without saving? Any changes will be lost.',
      okText: 'Yes, Discard',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk() {
        form.resetFields();
        onClose();
      },
    });
  };

  if (!vehicleData) return null;

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EditOutlined style={{ color: '#1890ff' }} />
          <span>Edit Vehicle Information</span>
        </div>
      }
      open={open}
      onCancel={handleCancel}
      width={800}
      footer={null}
      destroyOnClose
      style={{ top: 20 }}
    >
      <Spin spinning={loading || submitting} tip={submitting ? "Saving changes..." : "Loading..."}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '16px' }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Card 
                size="small" 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CarOutlined style={{ color: '#1890ff' }} />
                    <Text strong>Vehicle Information</Text>
                  </div>
                }
                style={{ marginBottom: '16px' }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="vin"
                      label="VIN"
                      rules={[
                        { required: true, message: 'VIN is required' },
                        { len: 17, message: 'VIN must be exactly 17 characters' }
                      ]}
                    >
                      <Input placeholder="Enter VIN" maxLength={17} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="year"
                      label="Year"
                      rules={[
                        { required: true, message: 'Year is required' },
                        { 
                          pattern: /^\d{4}$/, 
                          message: 'Year must be a 4-digit number' 
                        }
                      ]}
                    >
                      <Input placeholder="Enter year" maxLength={4} />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="make"
                      label="Make"
                      rules={[{ required: true, message: 'Make is required' }]}
                    >
                      <Input placeholder="Enter make" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="model"
                      label="Model"
                      rules={[{ required: true, message: 'Model is required' }]}
                    >
                      <Input placeholder="Enter model" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="engine"
                      label="Engine"
                      rules={[{ required: true, message: 'Engine is required' }]}
                    >
                      <Input placeholder="Enter engine" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="plate"
                      label="License Plate"
                      rules={[{ required: true, message: 'License plate is required' }]}
                    >
                      <Input placeholder="Enter license plate" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="state"
                      label="State"
                      rules={[{ required: true, message: 'State is required' }]}
                    >
                      <Input placeholder="Enter state" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Card 
                size="small" 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <Text strong>Owner Information</Text>
                  </div>
                }
                style={{ marginBottom: '16px' }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="ownerName"
                      label="First Name"
                      rules={[{ required: true, message: 'First name is required' }]}
                    >
                      <Input placeholder="Enter first name" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="ownerLastName"
                      label="Last Name"
                      rules={[{ required: true, message: 'Last name is required' }]}
                    >
                      <Input placeholder="Enter last name" />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="ownerEmail"
                      label="Email"
                      rules={[
                        { required: true, message: 'Email is required' },
                        { type: 'email', message: 'Please enter a valid email' }
                      ]}
                    >
                      <Input placeholder="Enter email address" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="ownerPhone"
                      label="Phone Number"
                      rules={[{ required: true, message: 'Phone number is required' }]}
                    >
                      <Input 
                        placeholder="Enter phone number" 
                        prefix={<PhoneOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="ownerAddress"
                      label="Address"
                      rules={[{ required: true, message: 'Address is required' }]}
                    >
                      <Input 
                        placeholder="Enter address" 
                        prefix={<EnvironmentOutlined />}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="ownerCity"
                      label="City"
                      rules={[{ required: true, message: 'City is required' }]}
                    >
                      <Input placeholder="Enter city" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="ownerState"
                      label="State"
                      rules={[{ required: true, message: 'State is required' }]}
                    >
                      <Input placeholder="Enter state" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="ownerZip"
                      label="ZIP Code"
                      rules={[
                        { required: true, message: 'ZIP code is required' },
                        { pattern: /^\d{5}(-\d{4})?$/, message: 'Please enter a valid ZIP code' }
                      ]}
                    >
                      <Input placeholder="Enter ZIP code" />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <Divider />
          
          <Row justify="end">
            <Col>
              <Space>
                <Button 
                  onClick={handleCancel}
                  size="large"
                >
                  <CloseOutlined />
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={submitting}
                  size="large"
                >
                  <SaveOutlined />
                  Save Changes
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Spin>
    </Modal>
  );
};

EditListModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  vehicleData: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default EditListModal;
