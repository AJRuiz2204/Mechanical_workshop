import PropTypes from 'prop-types';
import { Modal, Button, Alert, Typography, Divider, Row, Col, List } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

/**
 * ConfirmationModal shows validation results before submitting the estimate
 */
const ConfirmationModal = ({ 
  show, 
  onHide, 
  onConfirm, 
  validationResults, 
  isEditMode,
  loading 
}) => {
  const { isValid, errors, warnings, completeness } = validationResults || {};

  const renderValidationSection = (title, items, icon, type) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          {icon}
          <Text strong style={{ marginLeft: 8 }}>{title}</Text>
        </div>
        <List
          size="small"
          dataSource={items}
          renderItem={item => (
            <List.Item style={{ padding: '4px 0', borderBottom: 'none' }}>
              <Text type={type}>{item}</Text>
            </List.Item>
          )}
        />
      </div>
    );
  };

  return (
    <Modal 
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {isValid ? (
            <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
          ) : (
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
          )}
          Confirm {isEditMode ? 'Update' : 'Create'} Estimate
        </div>
      }
      open={show} 
      onCancel={onHide} 
      width={600}
      footer={[
        <Button key="cancel" onClick={onHide}>
          Cancel
        </Button>,
        <Button 
          key="confirm" 
          type="primary" 
          onClick={onConfirm}
          loading={loading}
          disabled={!isValid}
        >
          {isValid ? `${isEditMode ? 'Update' : 'Create'} Estimate` : 'Fix Issues to Continue'}
        </Button>
      ]}
    >
      <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {/* Main validation status */}
        <Alert
          message={isValid ? 'Ready to Submit' : 'Issues Found'}
          description={
            isValid 
              ? 'All required data is complete and valid. The estimate is ready to be submitted.'
              : 'Please review and fix the issues below before submitting the estimate.'
          }
          type={isValid ? 'success' : 'error'}
          showIcon
          style={{ marginBottom: 16 }}
        />

        {/* Data completeness summary */}
        {completeness && (
          <div style={{ marginBottom: 16 }}>
            <Title level={5}>Data Completeness</Title>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={4} type="success">{completeness.partsCount}</Title>
                  <Text>Parts</Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={4} type="success">{completeness.laborsCount}</Title>
                  <Text>Labor Items</Text>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={4} type="success">{completeness.flatFeesCount}</Title>
                  <Text>Flat Fees</Text>
                </div>
              </Col>
            </Row>
            <Divider />
          </div>
        )}

        {/* Validation errors */}
        {renderValidationSection(
          'Validation Errors', 
          errors, 
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
          'danger'
        )}

        {/* Warnings */}
        {renderValidationSection(
          'Warnings', 
          warnings, 
          <InfoCircleOutlined style={{ color: '#faad14' }} />,
          'warning'
        )}

        {/* Success message when everything is valid */}
        {isValid && (
          <div style={{ marginTop: 16 }}>
            <Alert
              message="All validations passed successfully!"
              type="success"
              showIcon
              style={{ marginBottom: 8 }}
            />
            <Text type="secondary">
              Click &quot;{isEditMode ? 'Update' : 'Create'} Estimate&quot; to proceed with the submission.
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
};

ConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  validationResults: PropTypes.shape({
    isValid: PropTypes.bool.isRequired,
    errors: PropTypes.arrayOf(PropTypes.string),
    warnings: PropTypes.arrayOf(PropTypes.string),
    completeness: PropTypes.shape({
      partsCount: PropTypes.number,
      laborsCount: PropTypes.number,
      flatFeesCount: PropTypes.number,
    }),
  }),
  isEditMode: PropTypes.bool.isRequired,
  loading: PropTypes.bool,
};

ConfirmationModal.defaultProps = {
  validationResults: {
    isValid: false,
    errors: [],
    warnings: [],
    completeness: {
      partsCount: 0,
      laborsCount: 0,
      flatFeesCount: 0,
    },
  },
  loading: false,
};

export default ConfirmationModal;