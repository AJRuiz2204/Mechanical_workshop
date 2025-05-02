import { useFlatFeeModal } from "../hooks/useModalHooks";
import PropTypes from "prop-types";
import { Modal, Button, Form, InputGroup, FormControl } from "react-bootstrap";

const FlatFeeModal = ({
  show,
  onHide,
  newFlatFee,
  setNewFlatFee,
  addFlatFee,
}) => {
  const clearFields = useFlatFeeModal(show, setNewFlatFee);

  return (
    <Modal centered show={show} onHide={onHide} size="sm">
      <Modal.Header closeButton>
        <Modal.Title>Add Flat Fee</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              value={newFlatFee.description}
              onChange={(e) =>
                setNewFlatFee({ ...newFlatFee, description: e.target.value })
              }
              placeholder="Enter flat fee description"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Flat Fee Price</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <FormControl
                type="number"
                step="0.01"
                min="1"
                required
                value={newFlatFee.flatFeePrice}
                onChange={(e) => {
                  const val = e.target.value;
                  const parsedVal = val === "" ? "" : parseFloat(val);
                  setNewFlatFee({
                    ...newFlatFee,
                    flatFeePrice: val,
                    extendedPrice: val === "" ? 0 : parsedVal,
                  });
                }}
                placeholder="Flat Fee Price"
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
                value={newFlatFee.extendedPrice === 0 ? "" : newFlatFee.extendedPrice}
                readOnly
              />
            </InputGroup>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button size="sm" variant="warning" onClick={clearFields}>
          Clear
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={addFlatFee}>
          Add Flat Fee
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

FlatFeeModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  newFlatFee: PropTypes.shape({
    description: PropTypes.string,
    flatFeePrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    extendedPrice: PropTypes.number
  }).isRequired,
  setNewFlatFee: PropTypes.func.isRequired,
  addFlatFee: PropTypes.func.isRequired,
};

export default FlatFeeModal;
