import React from 'react';
import { notification } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';

/**
 * Utility for consistent notifications across the application
 */
class NotificationService {
  // Success notifications
  static success(message, description = '', duration = 4) {
    notification.success({
      message,
      description,
      placement: 'topRight',
      duration,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    });
  }

  // Error notifications
  static error(message, description = '', duration = 5) {
    notification.error({
      message,
      description,
      placement: 'topRight',
      duration,
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
    });
  }

  // Warning notifications
  static warning(message, description = '', duration = 4) {
    notification.warning({
      message,
      description,
      placement: 'topRight',
      duration,
      icon: <WarningOutlined style={{ color: '#faad14' }} />,
    });
  }

  // Info notifications
  static info(message, description = '', duration = 4) {
    notification.info({
      message,
      description,
      placement: 'topRight',
      duration,
      icon: <InfoCircleOutlined style={{ color: '#1890ff' }} />,
    });
  }

  // Operation success notifications
  static operationSuccess(operation, item = '', duration = 3) {
    const operations = {
      create: { message: 'Created Successfully', verb: 'created' },
      update: { message: 'Updated Successfully', verb: 'updated' },
      delete: { message: 'Deleted Successfully', verb: 'deleted' },
      save: { message: 'Saved Successfully', verb: 'saved' },
      send: { message: 'Sent Successfully', verb: 'sent' },
      process: { message: 'Processed Successfully', verb: 'processed' },
    };

    const config = operations[operation] || { message: 'Operation Successful', verb: 'completed' };
    
    this.success(
      config.message,
      item ? `${item} has been ${config.verb} successfully.` : `Operation ${config.verb} successfully.`,
      duration
    );
  }

  // Operation error notifications
  static operationError(operation, error = '', duration = 5) {
    const operations = {
      create: 'Creation Failed',
      update: 'Update Failed',
      delete: 'Delete Failed',
      save: 'Save Failed',
      send: 'Send Failed',
      process: 'Processing Failed',
      load: 'Loading Error',
      fetch: 'Fetch Error',
    };

    const message = operations[operation] || 'Operation Failed';
    const description = error || `An error occurred during the ${operation} operation.`;
    
    this.error(message, description, duration);
  }

  // Validation error notification
  static validationError(field = '', message = 'Please check your input and try again.') {
    this.error(
      'Validation Error',
      field ? `${field}: ${message}` : message,
      4
    );
  }

  // Network error notification
  static networkError(action = '') {
    this.error(
      'Network Error',
      action ? `Unable to ${action}. Please check your connection and try again.` : 'Network connection failed. Please try again.',
      6
    );
  }

  // Permission denied notification
  static permissionDenied(action = '') {
    this.warning(
      'Permission Denied',
      action ? `You don't have permission to ${action}.` : 'You don\'t have permission to perform this action.',
      5
    );
  }

  // Loading notification (returns a function to close it)
  static loading(message = 'Processing...', duration = 0) {
    const key = `loading_${Date.now()}`;
    notification.open({
      key,
      message,
      description: 'Please wait...',
      placement: 'topRight',
      duration,
      icon: <InfoCircleOutlined spin style={{ color: '#1890ff' }} />,
    });

    return () => notification.close(key);
  }
}

export default NotificationService;
