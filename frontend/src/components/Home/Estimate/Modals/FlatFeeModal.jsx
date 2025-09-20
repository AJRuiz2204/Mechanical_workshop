import PropTypes from 'prop-types';
import { Modal, Form, Input, InputNumber, Button, Space } from 'antd';
import { useFlatFeeModal } from '../hooks/useModalHooks';
import '../styles/ModalsGeneral.css';

/**
 * FlatFeeModal allows adding a new flat fee to the estimate or editing an existing one
 */
const FlatFeeModal = ({ show, onHide, newFlatFee, setNewFlatFee, addFlatFee, isEditingItem, updateEditedItem }) => {
  const clearFields = useFlatFeeModal(show, setNewFlatFee, isEditingItem);

  const handleSubmit = () => {
    if (isEditingItem) {
      updateEditedItem();
    } else {
      addFlatFee();
    }
    onHide();
  };

  return (
    <Modal title={isEditingItem ? "Edit Flat Fee" : "Add Flat Fee"} open={show} onCancel={onHide} footer={null} destroyOnClose>
      <Form layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="Description" required>
          <Input
            value={newFlatFee.description}
            onChange={e => setNewFlatFee({ ...newFlatFee, description: e.target.value })}
            placeholder="Enter flat fee description"
          />
        </Form.Item>
        <Form.Item label="Flat Fee Price" required>
          <InputNumber
            min={0.01}
            step={0.01}
            precision={2}
            value={newFlatFee.flatFeePrice}
            placeholder="0.00"
            onChange={flatFeePrice => {
              // Ensure only 2 decimal places
              const roundedPrice = flatFeePrice ? Math.round(flatFeePrice * 100) / 100 : flatFeePrice;
              const extendedPrice = roundedPrice ? parseFloat(roundedPrice.toFixed(2)) : null;
              setNewFlatFee({
                ...newFlatFee,
                flatFeePrice: roundedPrice,
                extendedPrice,
              });
            }}
            addonBefore="$"
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label="Extended Price">
          <InputNumber
            value={newFlatFee.extendedPrice}
            readOnly
            precision={2}
            placeholder="$ 0.00"
            formatter={v => v ? `$ ${parseFloat(v).toFixed(2)}` : ''}
            parser={v => v.replace(/\$/g, '')}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item>
          <Space>
            {!isEditingItem && <Button onClick={clearFields}>Clear</Button>}
            <Button onClick={onHide}>Close</Button>
            <Button type="primary" htmlType="submit">
              {isEditingItem ? "Update Flat Fee" : "Add Flat Fee"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

FlatFeeModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  newFlatFee: PropTypes.object.isRequired,
  setNewFlatFee: PropTypes.func.isRequired,
  addFlatFee: PropTypes.func.isRequired,
  isEditingItem: PropTypes.bool,
  updateEditedItem: PropTypes.func,
};

export default FlatFeeModal;