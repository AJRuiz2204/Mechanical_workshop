/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Form, Button, Table, Row, Col } from 'react-bootstrap';

const Estimate = () => {
  const [showPartModal, setShowPartModal] = useState(false);
  const [showLaborModal, setShowLaborModal] = useState(false);
  const [showFlatFeeModal, setShowFlatFeeModal] = useState(false);
  const [duration, setDuration] = useState(0);
  const [laborRate, setLaborRate] = useState(140);
  const [flatFeePrice, setFlatFeePrice] = useState(0);
  const [note, setNote] = useState('');

  const handleShowPartModal = () => setShowPartModal(true);
  const handleClosePartModal = () => setShowPartModal(false);

  const handleShowLaborModal = () => setShowLaborModal(true);
  const handleCloseLaborModal = () => setShowLaborModal(false);

  const handleShowFlatFeeModal = () => setShowFlatFeeModal(true);
  const handleCloseFlatFeeModal = () => setShowFlatFeeModal(false);

  const calculateTotal = () => {
    return (duration * laborRate).toFixed(2);
  };

  return (
    <div className="p-4 border rounded">
      <h3>ESTIMATE</h3>

      {/* Vehicle and Customer Information */}
      <div className="mb-3">
        <Row>
          <Col md={8}>
            <div>
              <span role="img" aria-label="vehicle">🚗</span> 2025 Acura Integra L4-1.5L Turbo (L15CA)
            </div>
          </Col>
          <Col md={4}>
            <div>
              <span role="img" aria-label="customer">👤</span> Larry McCoy
            </div>
          </Col>
        </Row>
      </div>

      {/* Add Item Buttons */}
      <div className="mb-3">
        <Button variant="primary" onClick={handleShowPartModal} className="me-2">Add Part</Button>
        <Button variant="primary" onClick={handleShowLaborModal} className="me-2">Add Labor</Button>
        <Button variant="primary" onClick={handleShowFlatFeeModal}>Add Flat Fee</Button>
      </div>

      {/* Estimate Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>TYPE</th>
            <th>DESCRIPTION</th>
            <th>PART#</th>
            <th>QTY</th>
            <th>NET PRICE</th>
            <th>LIST PRICE</th>
            <th>EXTENDED</th>
            <th>TAXABLE</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>[PART]</td>
            <td>Light Bulb</td>
            <td>193132</td>
            <td>1</td>
            <td>$5.00</td>
            <td>$10.99</td>
            <td>$10.99</td>
            <td>✔</td>
            <td>
              <Button variant="danger" size="sm">&times;</Button>
            </td>
          </tr>
          <tr>
            <td>[PART]</td>
            <td>Clutch</td>
            <td>193256</td>
            <td>1</td>
            <td>$25.00</td>
            <td>$50.00</td>
            <td>$50.00</td>
            <td>✔</td>
            <td>
              <Button variant="danger" size="sm">&times;</Button>
            </td>
          </tr>
          <tr>
            <td>[LABOR]</td>
            <td>Labor - Replacing Clutch</td>
            <td></td>
            <td>2</td>
            <td>$25.00</td>
            <td>$40.00</td>
            <td>$80.00</td>
            <td></td>
            <td>
              <Button variant="danger" size="sm">&times;</Button>
            </td>
          </tr>
        </tbody>
      </Table>

      {/* Extended Diagnostic Information */}
      <Form.Group controlId="extended-diagnostic" className="mb-3">
        <Form.Label>Extended Diagnostic</Form.Label>
        <Form.Control
          as="textarea"
          rows={6}
          defaultValue={`Reported Issues:
Visible oil leaks at the bottom of the engine.
Oil levels below the recommended mark.
Abnormal engine noises (knocking or squeaking).

Tests Conducted:
Oil pressure check: normal.
Oil level check: low, with presence of contaminants.
Oil pump inspection: operational.

Recommendations:
Replace the damaged oil pan.
Change the oil pan gasket to ensure a proper seal.
Perform an oil and filter change to remove contaminants.
Check the lubrication system after replacement.`}
          readOnly
        />
      </Form.Group>

      {/* Customer Note Section */}
      <Form.Group controlId="customer-note" className="mb-3">
        <Form.Label>Customer Note</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="Add additional notes for the customer..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Form.Group>

      {/* Totals Section */}
      <div className="mb-3">
        <Row>
          <Col md={8}></Col>
          <Col md={4}>
            <div className="text-end">
              <div>Subtotal: $200.00</div>
              <div>Tax: $3.60</div>
              <h5>Total: $203.60</h5>
            </div>
          </Col>
        </Row>
      </div>

      {/* Action Buttons */}
      <div className="text-end">
        <Button variant="secondary" className="me-2">Cancel</Button>
        <Button variant="success">Save</Button>
      </div>
    </div>
  );
};

export default Estimate;
