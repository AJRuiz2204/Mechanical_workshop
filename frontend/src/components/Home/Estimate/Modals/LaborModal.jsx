import PropTypes from 'prop-types';
import { Modal, Form, Input, InputNumber, Checkbox, Select, Button, Space } from 'antd';
import { useLaborModal } from '../hooks/useModalHooks';
import '../styles/ModalsGeneral.css';

/**
 * LaborModal allows adding a new labor item to the estimate or editing an existing one
 */
const LaborModal = ({ show, onHide, newLabor, setNewLabor, addLabor, noTax, settings, isEditingItem, updateEditedItem }) => {
  const clearFields = useLaborModal(show, settings, setNewLabor, isEditingItem);

  const handleSubmit = () => {
    if (isEditingItem) {
      updateEditedItem();
    } else {
      addLabor();
    }
    onHide(); // Close modal after submit
  };

  return (
    <Modal title={isEditingItem ? "Edit Labor" : "Add Labor"} open={show} onCancel={onHide} footer={null} destroyOnClose>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Description" required>
          <Input
            value={newLabor.description}
            onChange={e => setNewLabor({ ...newLabor, description: e.target.value })}
            placeholder="Labor description"
          />
        </Form.Item>
        <Form.Item label="Duration (hours)" required>
          <InputNumber
            min={0.01}
            step={1}
            precision={2}
            value={newLabor.duration}
            onChange={duration => {
              const rate = parseFloat(newLabor.laborRate) || 0;
              const extendedPrice = parseFloat((duration * rate).toFixed(2));
              setNewLabor({
                ...newLabor,
                duration,
                extendedPrice,
              });
            }}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label="Labor Rate" required>
          <Select
            value={newLabor.laborRate}
            onChange={laborRate => {
              const dur = parseFloat(newLabor.duration) || 0;
              const extendedPrice = parseFloat((dur * laborRate).toFixed(2));
              setNewLabor({
                ...newLabor,
                laborRate,
                extendedPrice,
              });
            }}
          >
            {settings ? [
              settings.hourlyRate1,
              settings.hourlyRate2,
              settings.hourlyRate3,
              settings.defaultHourlyRate,
            ].map((rate, i) => (
              <Select.Option key={i} value={rate}>
                {`$ ${rate}`}
              </Select.Option>
            )) : (
              <Select.Option value={140}>$ 140</Select.Option>
            )}
          </Select>
        </Form.Item>
        <Form.Item label="Extended Price">
          <InputNumber
            value={newLabor.extendedPrice}
            readOnly
            precision={2}
            formatter={v => `$ ${parseFloat(v || 0).toFixed(2)}`}
            parser={v => v.replace(/\$/g, '')}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item>
          <Checkbox
            checked={newLabor.applyLaborTax}
            onChange={e => setNewLabor({ ...newLabor, applyLaborTax: e.target.checked })}
          >
            {noTax ? 'Override NoTax? (Apply Labor Tax)' : "Don't Apply Labor Tax?"}
          </Checkbox>
        </Form.Item>
        {settings && newLabor.applyLaborTax && (
          <Form.Item label="Tax Amount">
            <InputNumber
              value={parseFloat(((parseFloat(newLabor.extendedPrice) || 0) * (settings.laborTaxRate / 100)).toFixed(2))}
              readOnly
              precision={2}
              formatter={v => `$ ${parseFloat(v || 0).toFixed(2)}`}
              parser={v => v.replace(/\$/g, '')}
              style={{ width: '100%' }}
            />
          </Form.Item>
        )}
        <Form.Item>
          <Space>
            {!isEditingItem && <Button onClick={clearFields}>Clear</Button>}
            <Button onClick={onHide}>Close</Button>
            <Button type="primary" htmlType="submit">
              {isEditingItem ? "Update Labor" : "Add Labor"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

LaborModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  newLabor: PropTypes.object.isRequired,
  setNewLabor: PropTypes.func.isRequired,
  addLabor: PropTypes.func.isRequired,
  noTax: PropTypes.bool.isRequired,
  settings: PropTypes.object.isRequired,
  isEditingItem: PropTypes.bool,
  updateEditedItem: PropTypes.func,
};

export default LaborModal;