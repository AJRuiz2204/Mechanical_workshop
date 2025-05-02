import PropTypes from "prop-types";
import { Modal, Button, Form, InputGroup, FormControl } from "react-bootstrap";
import { usePartModal } from "../hooks/useModalHooks";

const PartModal = ({
  show,
  onHide,
  newPart,
  setNewPart,
  addPart,
  noTax,
  settings
}) => {
  const clearFields = usePartModal(show, settings, setNewPart);

  return (
    <Modal centered show={show} onHide={onHide} size="sm">
      <Modal.Header closeButton>
        <Modal.Title>Add Part</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              value={newPart.description}
              onChange={(e) =>
                setNewPart({ ...newPart, description: e.target.value })
              }
              placeholder="Enter part description"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Part Number</Form.Label>
            <Form.Control
              type="text"
              value={newPart.partNumber}
              onChange={(e) =>
                setNewPart({ ...newPart, partNumber: e.target.value })
              }
              placeholder="Enter part number"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              min="1"
              required
              value={newPart.quantity}
              onChange={(e) => {
                const qty = e.target.value;
                const parsedQty = qty === "" ? "" : parseInt(qty, 10);
                const list = newPart.listPrice === "" ? 0 : parseFloat(newPart.listPrice);
                setNewPart({
                  ...newPart,
                  quantity: qty,
                  extendedPrice: qty === "" ? 0 : list * parsedQty,
                });
              }}
              placeholder="Quantity"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Net Price</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <FormControl
                type="number"
                step="0.01"
                min="1"
                required
                value={newPart.netPrice}
                onChange={(e) =>
                  setNewPart({ ...newPart, netPrice: e.target.value })
                }
                placeholder="Net Price"
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>List Price</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <FormControl
                type="number"
                step="0.01"
                min="1"
                required
                value={newPart.listPrice}
                onChange={(e) => {
                  const price = e.target.value;
                  const parsedPrice = price === "" ? "" : parseFloat(price);
                  const qty = newPart.quantity === "" ? 0 : parseInt(newPart.quantity, 10);
                  setNewPart({
                    ...newPart,
                    listPrice: price,
                    extendedPrice: newPart.quantity === "" ? 0 : parsedPrice * qty,
                  });
                }}
                placeholder="List Price"
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Extended Price</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <FormControl
                type="number"
                step="0.01"
                value={newPart.extendedPrice === 0 ? "" : newPart.extendedPrice}
                readOnly
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mt-3">
            <Form.Check
              type="checkbox"
              label={
                noTax
                  ? "Override NoTax? (Apply Part Tax)"
                  : "Don't Apply Part Tax?"
              }
              checked={newPart.applyPartTax}
              onChange={(e) =>
                setNewPart({ ...newPart, applyPartTax: e.target.checked })
              }
            />
            <Form.Text className="text-muted">
              {noTax
                ? "If checked, tax will be applied even if NoTax is set."
                : "If checked, tax will not be applied for this part."}
            </Form.Text>
          </Form.Group>
          {settings && newPart.applyPartTax && (
            <Form.Group className="mb-3">
              <Form.Label>Tax Amount</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  readOnly
                  value={(
                    (parseFloat(newPart.extendedPrice) || 0) *
                    (parseFloat(settings.partTaxRate) / 100)
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
        <Button variant="primary" onClick={addPart}>
          Add Part
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

PartModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  newPart: PropTypes.shape({
    description: PropTypes.string,
    partNumber: PropTypes.string,
    quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    netPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    listPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    extendedPrice: PropTypes.number,
    applyPartTax: PropTypes.bool
  }).isRequired,
  setNewPart: PropTypes.func.isRequired,
  addPart: PropTypes.func.isRequired,
  noTax: PropTypes.bool.isRequired,
  settings: PropTypes.shape({
    partTaxRate: PropTypes.number,
    partTaxByDefault: PropTypes.bool
  })
};

export default PartModal;
