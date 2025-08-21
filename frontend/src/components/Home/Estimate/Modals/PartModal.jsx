import PropTypes from 'prop-types';
import { Modal, Form, Input, InputNumber, Checkbox, Button, Space } from 'antd';
import { usePartModal } from '../hooks/useModalHooks';
import '../styles/ModalsGeneral.css';

/**
 * PartModal allows adding a new part to the estimate or editing an existing one
 */
const PartModal = ({ show, onHide, newPart, setNewPart, addPart, noTax, settings, isEditingItem, updateEditedItem }) => {
  const clearFields = usePartModal(show, settings, setNewPart, isEditingItem);

  const handleSubmit = () => {
    if (isEditingItem) {
      updateEditedItem();
    } else {
      addPart();
    }
    onHide(); // Close modal after submit
  };

  return (
    <Modal title={isEditingItem ? "Edit Part" : "Add Part"} open={show} onCancel={onHide} footer={null} destroyOnClose>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Description" required>
          <Input
            value={newPart.description}
            onChange={e => setNewPart({ ...newPart, description: e.target.value })}
            placeholder="Enter part description"
          />
        </Form.Item>
        <Form.Item label="Part Number">
          <Input
            value={newPart.partNumber}
            onChange={e => setNewPart({ ...newPart, partNumber: e.target.value })}
            placeholder="Enter part number"
          />
        </Form.Item>
        <Form.Item label="Quantity" required>
          <InputNumber
            min={0.01}
            step={1}
            precision={2}
            value={newPart.quantity}
            onChange={qty => {
              const list = parseFloat(newPart.listPrice) || 0;
              const extendedPrice = parseFloat((qty * list).toFixed(2));
              setNewPart({
                ...newPart,
                quantity: qty,
                extendedPrice,
              });
            }}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label="Net Price" required>
          <InputNumber
            min={0.01}
            step={1}
            precision={2}
            value={newPart.netPrice}
            onChange={netPrice => setNewPart({ ...newPart, netPrice })}
            formatter={v => `$ ${parseFloat(v || 0).toFixed(2)}`}
            parser={v => v.replace(/\$/g, '')}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label="List Price" required>
          <InputNumber
            min={0.01}
            step={1}
            precision={2}
            value={newPart.listPrice}
            onChange={listPrice => {
              const qty = parseFloat(newPart.quantity) || 0;
              const extendedPrice = parseFloat((qty * listPrice).toFixed(2));
              setNewPart({
                ...newPart,
                listPrice,
                extendedPrice,
              });
            }}
            formatter={v => `$ ${parseFloat(v || 0).toFixed(2)}`}
            parser={v => v.replace(/\$/g, '')}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label="Extended Price">
          <InputNumber
            value={newPart.extendedPrice}
            readOnly
            precision={2}
            formatter={v => `$ ${parseFloat(v || 0).toFixed(2)}`}
            parser={v => v.replace(/\$/g, '')}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item>
          <Checkbox
            checked={newPart.applyPartTax}
            onChange={e => setNewPart({ ...newPart, applyPartTax: e.target.checked })}
          >
            {noTax ? 'Override NoTax? (Apply Part Tax)' : "Don't Apply Part Tax?"}
          </Checkbox>
        </Form.Item>
        {settings && newPart.applyPartTax && (
          <Form.Item label="Tax Amount">
            <InputNumber
              value={parseFloat(((parseFloat(newPart.extendedPrice) || 0) * (settings.partTaxRate / 100)).toFixed(2))}
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
              {isEditingItem ? "Update Part" : "Add Part"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

PartModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  newPart: PropTypes.object.isRequired,
  setNewPart: PropTypes.func.isRequired,
  addPart: PropTypes.func.isRequired,
  noTax: PropTypes.bool.isRequired,
  settings: PropTypes.object,
  isEditingItem: PropTypes.bool,
  updateEditedItem: PropTypes.func,
};

export default PartModal;