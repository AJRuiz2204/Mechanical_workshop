import { useLaborModal } from "../hooks/useModalHooks";
import PropTypes from "prop-types";
import { Modal, Button, Form, InputGroup, FormControl } from "react-bootstrap";

const LaborModal = ({
  show,
  onHide,
  newLabor,
  setNewLabor,
  addLabor,
  noTax,
  settings
}) => {
  const clearFields = useLaborModal(show, settings, setNewLabor);

  return (
    <Modal centered show={show} onHide={onHide} size="sm">
      <Modal.Header closeButton>
        <Modal.Title>Add Labor</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              value={newLabor.description}
              onChange={(e) =>
                setNewLabor({ ...newLabor, description: e.target.value })
              }
              placeholder="Labor description"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Duration (hours)</Form.Label>
            <Form.Control
              type="number"
              min="1"
              required
              value={newLabor.duration}
              onChange={(e) => {
                const dur = e.target.value;
                const parsedDur = dur === "" ? "" : parseFloat(dur);
                const rate = newLabor.laborRate === "" ? 0 : parseFloat(newLabor.laborRate);
                setNewLabor({
                  ...newLabor,
                  duration: dur,
                  extendedPrice: dur === "" ? 0 : parsedDur * rate,
                });
              }}
              placeholder="Hours"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Labor Rate</Form.Label>
            <Form.Select
              required
              value={newLabor.laborRate}
              onChange={(e) => {
                const rate = e.target.value;
                const parsedRate = rate === "" ? "" : parseFloat(rate);
                const dur = newLabor.duration === "" ? 0 : parseFloat(newLabor.duration);
                setNewLabor({
                  ...newLabor,
                  laborRate: rate,
                  extendedPrice: newLabor.duration === "" ? 0 : dur * parsedRate,
                });
              }}
            >
              {settings ? (
                <>
                  <option value={settings.hourlyRate1}>Rate1: {settings.hourlyRate1}</option>
                  <option value={settings.hourlyRate2}>Rate2: {settings.hourlyRate2}</option>
                  <option value={settings.hourlyRate3}>Rate3: {settings.hourlyRate3}</option>
                  <option value={settings.defaultHourlyRate}>Default: {settings.defaultHourlyRate}</option>
                </>
              ) : (
                <option value={140}>$140 (fallback)</option>
              )}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Extended Price</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <FormControl
                type="number"
                step="0.01"
                value={newLabor.extendedPrice === 0 ? "" : newLabor.extendedPrice}
                readOnly
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Check
              type="checkbox"
              label={
                noTax
                  ? "Override NoTax? (Apply Labor Tax)"
                  : "Don't Apply Labor Tax?"
              }
              checked={newLabor.applyLaborTax}
              onChange={(e) =>
                setNewLabor({ ...newLabor, applyLaborTax: e.target.checked })
              }
            />
            <Form.Text className="text-muted">
              {noTax
                ? "If checked, tax will be applied even if NoTax is set."
                : "If checked, tax will not be applied for this labor."}
            </Form.Text>
          </Form.Group>
          {settings && newLabor.applyLaborTax && (
            <Form.Group className="mb-3">
              <Form.Label>Tax Amount</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  readOnly
                  value={(
                    (parseFloat(newLabor.extendedPrice) || 0) *
                    (parseFloat(settings.laborTaxRate) / 100)
                  ).toFixed(2)}
                />
              </InputGroup>
            </Form.Group>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="warning" onClick={clearFields}>
          Clear
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={addLabor}>
          Add Labor
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

LaborModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  newLabor: PropTypes.shape({
    description: PropTypes.string,
    duration: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    laborRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    extendedPrice: PropTypes.number,
    applyLaborTax: PropTypes.bool
  }).isRequired,
  setNewLabor: PropTypes.func.isRequired,
  addLabor: PropTypes.func.isRequired,
  noTax: PropTypes.bool.isRequired,
  settings: PropTypes.shape({
    hourlyRate1: PropTypes.number,
    hourlyRate2: PropTypes.number,
    hourlyRate3: PropTypes.number,
    defaultHourlyRate: PropTypes.number,
    laborTaxRate: PropTypes.number,
    laborTaxByDefault: PropTypes.bool
  }).isRequired
};

export default LaborModal;
