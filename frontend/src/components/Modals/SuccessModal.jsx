import { Modal } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import PropTypes from "prop-types";

/**
 * SuccessModal Component
 * 
 * A reusable modal component for displaying success messages.
 * Features consistent styling with the application's blue theme.
 * 
 * @param {boolean} open - Whether the modal is visible
 * @param {string} message - The success message to display
 * @param {function} onClose - Callback function when modal is closed
 * @param {string} title - Optional custom title (defaults to "Success")
 * @param {boolean} autoClose - Whether to auto-close after 3 seconds (defaults to false)
 */
const SuccessModal = ({ open, message, onClose, title = "Success", autoClose = false }) => {
  // Auto-close functionality
  if (autoClose && open) {
    setTimeout(() => {
      onClose();
    }, 3000);
  }

  return (
    <Modal
      title={
        <div style={{ textAlign: "center" }}>
          <CheckCircleOutlined
            style={{
              fontSize: "24px",
              color: "#52c41a",
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
        <CheckCircleOutlined
          style={{
            fontSize: "64px",
            color: "#52c41a",
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

SuccessModal.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  autoClose: PropTypes.bool,
};

export default SuccessModal;