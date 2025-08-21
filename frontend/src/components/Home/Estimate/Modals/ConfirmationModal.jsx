import { Modal, Button, Alert, List, Typography, Divider, Row, Col, Tag } from "antd";
import { 
  CheckCircleOutlined, 
  InfoCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  CarOutlined,
  UserOutlined,
  DollarOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import PropTypes from "prop-types";
import "../styles/ConfirmationModal.css"

const { Title, Text } = Typography;

const ConfirmationModal = ({ 
  show, 
  onConfirm, 
  onCancel, 
  validationResult,
  isEditMode
}) => {
  const { isValid, errors, warnings, summary } = validationResult;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm();
    }
  };

  return (
    <Modal
      title={
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          padding: "8px 0",
          fontSize: "18px",
          fontWeight: "600",
          color: "#000000"
        }}>
          {isValid ? (
            <CheckCircleOutlined style={{ color: "#52c41a", fontSize: "24px" }} />
          ) : (
            <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: "24px" }} />
          )}
          <span style={{ color: "#000000" }}>
            {isValid ? "Confirm Estimate Submission" : "Estimate Validation Required"}
          </span>
        </div>
      }
      open={show}
      onCancel={onCancel}
      width={800}
      className="confirmation-modal"
      style={{
        top: 20,
      }}
      footer={[
        <Button 
          key="cancel" 
          size="large"
          onClick={onCancel}
          style={{
            height: "40px",
            borderRadius: "6px",
            fontWeight: "500"
          }}
        >
          Cancel
        </Button>,
        <Button 
          key="confirm" 
          type="primary" 
          size="large"
          onClick={handleConfirm}
          disabled={!isValid}
          danger={!isValid}
          style={{
            height: "40px",
            borderRadius: "6px",
            fontWeight: "500",
            minWidth: "140px"
          }}
        >
          {isValid ? (
            <>
              <CheckCircleOutlined />
              {isEditMode ? "Update Estimate" : "Create Estimate"}
            </>
          ) : (
            <>
              <WarningOutlined />
              Fix Errors First
            </>
          )}
        </Button>,
      ]}
    >
      {/* Errores */}
      {errors.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <Alert
            type="error"
            message={
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                fontWeight: "600",
                fontSize: "16px"
              }}>
                <CloseCircleOutlined />
                Validation Errors Found ({errors.length})
              </div>
            }
            description={
              <div style={{ marginTop: "12px" }}>
                <List
                  size="small"
                  dataSource={errors}
                  renderItem={(error, index) => (
                    <List.Item style={{
                      padding: "8px 0",
                      borderBottom: index < errors.length - 1 ? "1px solid #f0f0f0" : "none"
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <div style={{
                          backgroundColor: "#ff4d4f",
                          color: "white",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                          minWidth: "20px"
                        }}>
                          {index + 1}
                        </div>
                        <span style={{ 
                          color: "#000000", 
                          fontWeight: "500",
                          lineHeight: "1.5"
                        }}>
                          {error}
                        </span>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            }
            showIcon={false}
            style={{
              border: "2px solid #ff4d4f",
              borderRadius: "8px",
              backgroundColor: "#fff2f0"
            }}
          />
        </div>
      )}

      {/* Advertencias */}
      {warnings.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <Alert
            type="warning"
            message={
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                fontWeight: "600",
                fontSize: "16px"
              }}>
                <WarningOutlined />
                Important Notices ({warnings.length})
              </div>
            }
            description={
              <div style={{ marginTop: "12px" }}>
                <List
                  size="small"
                  dataSource={warnings}
                  renderItem={(warning, index) => (
                    <List.Item style={{
                      padding: "8px 0",
                      borderBottom: index < warnings.length - 1 ? "1px solid #f0f0f0" : "none"
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                        <div style={{
                          backgroundColor: "#faad14",
                          color: "white",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: "bold",
                          minWidth: "20px"
                        }}>
                          !
                        </div>
                        <span style={{ 
                          color: "#000000", 
                          fontWeight: "500",
                          lineHeight: "1.5"
                        }}>
                          {warning}
                        </span>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            }
            showIcon={false}
            style={{
              border: "2px solid #faad14",
              borderRadius: "8px",
              backgroundColor: "#fffbe6"
            }}
          />
        </div>
      )}

      {/* Resumen si es válido */}
      {isValid && (
        <div>
          <Alert
            type="success"
            message={
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                fontWeight: "600",
                fontSize: "16px"
              }}>
                <CheckCircleOutlined />
                Ready for Submission
              </div>
            }
            description="All validations passed successfully. Review the summary below and confirm to proceed."
            showIcon={false}
            style={{ 
              marginBottom: "24px",
              border: "2px solid #52c41a",
              borderRadius: "8px",
              backgroundColor: "#f6ffed"
            }}
          />

          <div style={{
            backgroundColor: "#fafafa",
            border: "1px solid #d9d9d9",
            borderRadius: "8px",
            padding: "20px"
          }}>
            <Title level={4} style={{ 
              margin: "0 0 20px 0",
              color: "#000000",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <FileTextOutlined />
              Estimate Summary
            </Title>

            <Row gutter={24}>
              <Col span={12}>
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px",
                    marginBottom: "4px"
                  }}>
                    <CarOutlined style={{ color: "#1890ff" }} />
                    <Text strong style={{ fontSize: "14px", color: "#000000" }}>Vehicle:</Text>
                  </div>
                  <Text style={{ 
                    fontSize: "14px", 
                    color: "#000000",
                    marginLeft: "24px",
                    display: "block"
                  }}>
                    {summary.vehicleInfo}
                  </Text>
                </div>
                
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px",
                    marginBottom: "4px"
                  }}>
                    <UserOutlined style={{ color: "#1890ff" }} />
                    <Text strong style={{ fontSize: "14px", color: "#000000" }}>Owner:</Text>
                  </div>
                  <Text style={{ 
                    fontSize: "14px", 
                    color: "#000000",
                    marginLeft: "24px",
                    display: "block"
                  }}>
                    {summary.ownerInfo}
                  </Text>
                </div>
                
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px",
                    marginBottom: "4px"
                  }}>
                    <InfoCircleOutlined style={{ color: "#1890ff" }} />
                    <Text strong style={{ fontSize: "14px", color: "#000000" }}>Authorization Status:</Text>
                  </div>
                  <Tag 
                    color={
                      summary.authorizationStatus === "Approved" ? "green" :
                      summary.authorizationStatus === "Not Approved" ? "red" : "orange"
                    }
                    style={{ marginLeft: "24px", fontSize: "12px" }}
                  >
                    {summary.authorizationStatus}
                  </Tag>
                </div>
              </Col>
              
              <Col span={12}>
                <div style={{ marginBottom: "16px" }}>
                  <Text strong style={{ fontSize: "14px", color: "#262626" }}>Items Breakdown:</Text>
                  <div style={{ 
                    marginTop: "8px",
                    padding: "12px",
                    backgroundColor: "#fff",
                    borderRadius: "6px",
                    border: "1px solid #e8e8e8"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ color: "#000000" }}>Parts:</span>
                      <span style={{ fontWeight: "500", color: "#000000" }}>{summary.partsCount}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ color: "#000000" }}>Labors:</span>
                      <span style={{ fontWeight: "500", color: "#000000" }}>{summary.laborsCount}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ color: "#000000" }}>Flat Fees:</span>
                      <span style={{ fontWeight: "500", color: "#000000" }}>{summary.flatFeesCount}</span>
                    </div>
                    <Divider style={{ margin: "8px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: "600", color: "#000000" }}>Total Items:</span>
                      <span style={{ fontWeight: "600", color: "#1890ff" }}>{summary.totalItems}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px",
                    marginBottom: "8px"
                  }}>
                    <DollarOutlined style={{ color: "#1890ff" }} />
                    <Text strong style={{ fontSize: "14px", color: "#000000" }}>Financial Summary:</Text>
                  </div>
                  <div style={{ 
                    padding: "16px",
                    backgroundColor: "#fff",
                    borderRadius: "6px",
                    border: "1px solid #e8e8e8",
                    marginLeft: "24px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ color: "#000000" }}>Subtotal:</span>
                      <span style={{ fontWeight: "500", color: "#000000" }}>${summary.subtotal}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                      <span style={{ color: "#000000" }}>Tax:</span>
                      <span style={{ fontWeight: "500", color: "#000000" }}>${summary.tax}</span>
                    </div>
                    <Divider style={{ margin: "8px 0" }} />
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: "600", fontSize: "16px", color: "#000000" }}>Total:</span>
                      <span style={{ 
                        fontWeight: "700", 
                        fontSize: "18px", 
                        color: "#52c41a"
                      }}>
                        ${summary.total}
                      </span>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>

            <Divider style={{ margin: "20px 0" }} />

            <div>
              <Text strong style={{ fontSize: "14px", color: "#000000", marginBottom: "8px", display: "block" }}>
                Service Description:
              </Text>
              <div style={{
                padding: "12px",
                backgroundColor: "#fff",
                borderRadius: "6px",
                border: "1px solid #e8e8e8",
                fontStyle: "italic",
                color: "#000000",
                lineHeight: "1.6"
              }}>
                &quot;{summary.customerNote}&quot;
              </div>
            </div>
          </div>
        </div>
      )}

      {!isValid && (
        <div style={{ marginTop: "24px" }}>
          <Alert
            type="info"
            message={
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                fontWeight: "600"
              }}>
                <InfoCircleOutlined />
                Action Required
              </div>
            }
            description={
              <div style={{ marginTop: "8px" }}>
                <p style={{ margin: "0 0 8px 0", color: "#000000" }}>
                  Please correct all validation errors before submitting the estimate.
                </p>
                <p style={{ margin: "0", color: "#000000" }}>
                  Once all required fields are complete and valid, you will be able to proceed with the submission.
                </p>
              </div>
            }
            showIcon={false}
            style={{
              border: "1px solid #1890ff",
              borderRadius: "8px",
              backgroundColor: "#f0f8ff"
            }}
          />
        </div>
      )}
    </Modal>
  );
};

ConfirmationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  validationResult: PropTypes.shape({
    isValid: PropTypes.bool.isRequired,
    errors: PropTypes.arrayOf(PropTypes.string).isRequired,
    warnings: PropTypes.arrayOf(PropTypes.string).isRequired,
    summary: PropTypes.object.isRequired,
  }).isRequired,
  isEditMode: PropTypes.bool.isRequired,
};

export default ConfirmationModal;
