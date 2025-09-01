import { Modal } from 'antd';
import { 
  ExclamationCircleOutlined, 
  DeleteOutlined, 
  SaveOutlined, 
  CheckOutlined,
  WarningOutlined 
} from '@ant-design/icons';
import PropTypes from 'prop-types';

/**
 * Reusable confirmation dialog utility
 */
class ConfirmationDialog {
  // Delete confirmation
  static delete(options = {}) {
    const {
      title = 'Delete Item',
      content = 'Are you sure you want to delete this item? This action cannot be undone.',
      itemName = '',
      onConfirm = () => {},
      onCancel = () => {},
    } = options;

    return Modal.confirm({
      title,
      content: itemName ? content.replace('this item', itemName) : content,
      icon: <ExclamationCircleOutlined />,
      okText: 'Yes, Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      okButtonProps: {
        icon: <DeleteOutlined />,
      },
      onOk: onConfirm,
      onCancel,
    });
  }

  // Save confirmation
  static save(options = {}) {
    const {
      title = 'Save Changes',
      content = 'Are you sure you want to save these changes?',
      onConfirm = () => {},
      onCancel = () => {},
    } = options;

    return Modal.confirm({
      title,
      content,
      icon: <CheckOutlined />,
      okText: 'Yes, Save',
      cancelText: 'Cancel',
      okType: 'primary',
      okButtonProps: {
        icon: <SaveOutlined />,
      },
      onOk: onConfirm,
      onCancel,
    });
  }

  // Discard changes confirmation
  static discardChanges(options = {}) {
    const {
      title = 'Discard Changes?',
      content = 'Are you sure you want to discard your changes? Any unsaved data will be lost.',
      onConfirm = () => {},
      onCancel = () => {},
    } = options;

    return Modal.confirm({
      title,
      content,
      icon: <WarningOutlined />,
      okText: 'Yes, Discard',
      cancelText: 'Continue Editing',
      okType: 'danger',
      onOk: onConfirm,
      onCancel,
    });
  }

  // Generic confirmation
  static confirm(options = {}) {
    const {
      title = 'Confirm Action',
      content = 'Are you sure you want to proceed?',
      okText = 'Yes',
      cancelText = 'Cancel',
      okType = 'primary',
      icon = <ExclamationCircleOutlined />,
      onConfirm = () => {},
      onCancel = () => {},
    } = options;

    return Modal.confirm({
      title,
      content,
      icon,
      okText,
      cancelText,
      okType,
      onOk: onConfirm,
      onCancel,
    });
  }

  // Warning confirmation
  static warning(options = {}) {
    const {
      title = 'Warning',
      content = 'Please review this action before proceeding.',
      onConfirm = () => {},
      onCancel = () => {},
    } = options;

    return Modal.confirm({
      title,
      content,
      icon: <WarningOutlined />,
      okText: 'Proceed',
      cancelText: 'Cancel',
      okType: 'default',
      onOk: onConfirm,
      onCancel,
    });
  }

  // Batch operation confirmation
  static batchOperation(options = {}) {
    const {
      title = 'Batch Operation',
      operation = 'operation',
      count = 0,
      onConfirm = () => {},
      onCancel = () => {},
    } = options;

    const content = `Are you sure you want to perform this ${operation} on ${count} item${count !== 1 ? 's' : ''}?`;

    return Modal.confirm({
      title,
      content,
      icon: <ExclamationCircleOutlined />,
      okText: `Yes, ${operation}`,
      cancelText: 'Cancel',
      okType: operation.toLowerCase().includes('delete') ? 'danger' : 'primary',
      onOk: onConfirm,
      onCancel,
    });
  }
}

// React component for more complex confirmations
const CustomConfirmation = ({ 
  open, 
  onConfirm, 
  onCancel, 
  title, 
  children, 
  okText = 'Confirm',
  cancelText = 'Cancel',
  okType = 'primary',
  danger = false 
}) => {
  return (
    <Modal
      title={title}
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      okType={danger ? 'danger' : okType}
    >
      {children}
    </Modal>
  );
};

CustomConfirmation.propTypes = {
  open: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  okText: PropTypes.string,
  cancelText: PropTypes.string,
  okType: PropTypes.string,
  danger: PropTypes.bool,
};

export { CustomConfirmation };
export default ConfirmationDialog;
