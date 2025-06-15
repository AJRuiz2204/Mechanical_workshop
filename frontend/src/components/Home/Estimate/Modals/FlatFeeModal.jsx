import PropTypes from 'prop-types';
import { Modal, Form, Input, InputNumber, Button, Space } from 'antd';
import { useFlatFeeModal } from '../hooks/useModalHooks';

/**
 * FlatFeeModal allows adding a new flat fee to the estimate
 */
const FlatFeeModal = ({ show, onHide, newFlatFee, setNewFlatFee, addFlatFee }) => {
  const clearFields = useFlatFeeModal(show, setNewFlatFee);

  return (
    <Modal title="Add Flat Fee" open={show} onCancel={onHide} footer={null} destroyOnClose>
      <Form layout="vertical" onFinish={addFlatFee}>
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
            onChange={flatFeePrice => {
              setNewFlatFee({
                ...newFlatFee,
                flatFeePrice,
                extendedPrice: flatFeePrice,
              });
            }}
            formatter={v => `$ ${v}`}
            parser={v => v.replace(/[^\d.]/g, '')}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item label="Extended Price">
          <InputNumber
            value={newFlatFee.extendedPrice}
            readOnly
            formatter={v => `$ ${v}`}
            parser={v => v.replace(/[^\d]/g, '')}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button onClick={clearFields}>Clear</Button>
            <Button onClick={onHide}>Close</Button>
            <Button type="primary" htmlType="submit">Add Flat Fee</Button>
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
};

export default FlatFeeModal;