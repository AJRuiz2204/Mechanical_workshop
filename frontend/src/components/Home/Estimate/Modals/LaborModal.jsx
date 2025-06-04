import PropTypes from 'prop-types';
import { Modal, Form, Input, InputNumber, Checkbox, Select, Button, Space } from 'antd';
import { useLaborModal } from '../hooks/useModalHooks';

/**
 * LaborModal allows adding a new labor item to the estimate
 */
const LaborModal = ({ show, onHide, newLabor, setNewLabor, addLabor, noTax, settings }) => {
  const clearFields = useLaborModal(show, settings, setNewLabor);

  return (
    <Modal title="Add Labor" open={show} onCancel={onHide} footer={null} destroyOnClose>
      <Form layout="vertical" onFinish={addLabor}>
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
            step={0.01}
            precision={2}
            value={newLabor.duration}
            onChange={duration => {
              const rate = parseFloat(newLabor.laborRate) || 0;
              setNewLabor({
                ...newLabor,
                duration,
                extendedPrice: duration * rate,
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
              setNewLabor({
                ...newLabor,
                laborRate,
                extendedPrice: dur * laborRate,
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
            formatter={v => `$ ${v}`}
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
              value={((parseFloat(newLabor.extendedPrice) || 0) * (settings.laborTaxRate / 100)).toFixed(2)}
              readOnly
              formatter={v => `$ ${v}`}
              parser={v => v.replace(/\$/g, '')}
              style={{ width: '100%' }}
            />
          </Form.Item>
        )}
        <Form.Item>
          <Space>
            <Button onClick={clearFields}>Clear</Button>
            <Button onClick={onHide}>Close</Button>
            <Button type="primary" htmlType="submit">Add Labor</Button>
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
};

export default LaborModal;