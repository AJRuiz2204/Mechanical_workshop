import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

/**
 * ErrorModal Component
 * 
 * A reusable modal component for displaying error messages.
 * Features consistent styling with the application's blue theme.
 * 
 * @param {boolean} open - Whether the modal is visible
 * @param {string} message - The error message to display
 * @param {function} onClose - Callback function when modal is closed
 * @param {string} title - Optional custom title (defaults to "Error")
 */
const ErrorModal = ({ open, message, onClose, title = "Error" }) => {
  return (
    <Modal
      title={
        <div style={{ textAlign: "center" }}>
          <ExclamationCircleOutlined
            style={{
              fontSize: "24px",
              color: "#ff4d4f",
              marginRight: "8px",
            }}
          />
          <span style={{ color: "#0056b3", fontSize: "18px" }}>
            {title}
          </span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={onClose}
      okText="OK"
      okType="primary"
      centered
      width={500}
      destroyOnClose
    >
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <ExclamationCircleOutlined
          style={{
            fontSize: "64px",
            color: "#ff4d4f",
            marginBottom: "16px",
          }}
        />
        <div
          style={{
            fontSize: "16px",
            color: "#333",
            lineHeight: "1.5",
          }}
        >
          {message}
        </div>
      </div>
    </Modal>
  );
};

ErrorModal.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
};

export default ErrorModal;