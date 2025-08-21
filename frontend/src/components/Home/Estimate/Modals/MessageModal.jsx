import { useEffect, useState } from "react";
import { Modal, Button, Alert, Progress } from "antd";
import { CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";
import "../styles/MessageModal.css";

const MessageModal = ({ 
  show, 
  onHide, 
  type, 
  message, 
  title,
  autoHideDelay = 10000 
}) => {
  const [timeLeft, setTimeLeft] = useState(autoHideDelay);

  useEffect(() => {
    if (show && autoHideDelay > 0) {
      setTimeLeft(autoHideDelay);
      
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 100) {
            clearInterval(interval);
            return 0;
          }
          return prev - 100;
        });
      }, 100);

      const timer = setTimeout(() => {
        onHide();
      }, autoHideDelay);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [show, onHide, autoHideDelay]);

  const getIcon = () => {
    const iconProps = { style: { fontSize: "20px" } };
    switch (type) {
      case "success":
        return <CheckCircleOutlined {...iconProps} style={{ ...iconProps.style, color: "#52c41a" }} />;
      case "error":
        return <ExclamationCircleOutlined {...iconProps} style={{ ...iconProps.style, color: "#ff4d4f" }} />;
      default:
        return <InfoCircleOutlined {...iconProps} style={{ ...iconProps.style, color: "#1890ff" }} />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case "success":
        return "Success";
      case "error":
        return "Error";
      default:
        return "Information";
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case "success":
        return "#52c41a";
      case "error":
        return "#ff4d4f";
      default:
        return "#1890ff";
    }
  };

  return (
    <Modal
      title={
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          padding: "4px 0",
          fontSize: "16px",
          fontWeight: "600"
        }}>
          {getIcon()}
          {getTitle()}
        </div>
      }
      open={show}
      onCancel={onHide}
      footer={[
        <Button 
          key="ok" 
          type="primary" 
          onClick={onHide}
          size="large"
          style={{
            height: "40px",
            borderRadius: "6px",
            fontWeight: "500",
            minWidth: "100px"
          }}
        >
          OK
        </Button>,
      ]}
      centered
      width={500}
      className={`message-modal message-modal-${type}`}
      style={{
        borderRadius: "12px"
      }}
      data-type={type}
    >
      <div style={{ padding: "8px 0" }}>
        <Alert
          type={type}
          message={message}
          showIcon={false}
          style={{ 
            border: "none", 
            background: "transparent", 
            padding: 0,
            fontSize: "15px",
            lineHeight: "1.6",
            color: "#000000"
          }}
        />
        {autoHideDelay > 0 && (
          <div style={{ marginTop: "20px" }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px",
              marginBottom: "8px"
            }}>
              <InfoCircleOutlined style={{ color: "#8c8c8c", fontSize: "14px" }} />
              <span style={{ 
                fontSize: "13px", 
                color: "#8c8c8c",
                fontWeight: "500"
              }}>
                Auto-closing in {Math.ceil(timeLeft / 1000)} seconds
              </span>
            </div>
            <Progress
              percent={(timeLeft / autoHideDelay) * 100}
              showInfo={false}
              size="small"
              strokeColor={getProgressColor()}
              trailColor="#f0f0f0"
              style={{ marginBottom: "4px" }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

MessageModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  type: PropTypes.oneOf(["success", "error"]).isRequired,
  message: PropTypes.string.isRequired,
  title: PropTypes.string,
  autoHideDelay: PropTypes.number,
};

export default MessageModal;
