/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Form, Table, Row, Col, Button } from 'react-bootstrap';

const Invoice = () => {
  const [items, setItems] = useState([
    { type: 'labor', description: 'Water pump replace', partLabor: 'custom labor rate', qty: 1.5, price: 95.0, total: 142.5, taxable: false },
    { type: 'part', description: 'Water pump', partLabor: 'US8102', qty: 1, price: 119.99, total: 119.99, taxable: true },
    { type: 'note', description: '100% water pump only', partLabor: '', qty: '', price: 0, total: 0, taxable: false },
  ]);

  const [subtotal, setSubtotal] = useState(284.98);
  const [tax, setTax] = useState(9.40);
  const [total, setTotal] = useState(294.38);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const handleRemoveItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    recalculateTotals(updatedItems);
  };

  const recalculateTotals = (updatedItems) => {
    const newSubtotal = updatedItems.reduce((acc, item) => acc + (item.total || 0), 0);
    const newTax = updatedItems.some((item) => item.taxable) ? newSubtotal * 0.033 : 0;
    setSubtotal(newSubtotal.toFixed(2));
    setTax(newTax.toFixed(2));
    setTotal((newSubtotal + newTax).toFixed(2));
  };

  return (
    <div className="p-4 border rounded">
      <h3>Invoice</h3>

      {/* Customer and Vehicle Information */}
      <div className="mb-4">
        <Row>
          <Col md={8}>
            <strong>Customer Information:</strong>
            <p>
              Salty Johns<br />
              997 North Gates Drive, Los Angeles, CA 90044<br />
              (323) 654-3372
            </p>
            <strong>Vehicle Information:</strong>
            <p>
              2015 Chevrolet Malibu<br />
              Engine: L4-2.5L<br />
              VIN: XXXXXX<br />
              License: XXXXX<br />
              Mileage: 100,000 miles<br />
            </p>
          </Col>
        </Row>
      </div>

      {/* Items Table */}
      <Table striped bordered>
        <thead>
          <tr>
            <th>Item</th>
            <th>Description</th>
            <th>Part/Labor</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
            <th>Taxable</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.type}</td>
              <td>{item.description}</td>
              <td>{item.partLabor}</td>
              <td>{item.qty || '-'}</td>
              <td>${item.price ? item.price.toFixed(2) : '-'}</td>
              <td>${item.total ? item.total.toFixed(2) : '-'}</td>
              <td>
                <Form.Check type="checkbox" checked={item.taxable} readOnly />
              </td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleRemoveItem(index)}>
                  &times;
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Totals Section */}
      <div className="text-end mb-4">
        <p>Subtotal: ${subtotal}</p>
        <p>Tax: ${tax}</p>
        <h5>Total: ${total}</h5>
      </div>

      {/* Payment Section */}
      <Form.Group as={Row} className="mb-3">
        <Form.Label column sm={2}>
          Payment Method:
        </Form.Label>
        <Col sm={4}>
          <Form.Control
            as="select"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="cash">Cash</option>
            <option value="debit card">Debit Card</option>
            <option value="credit card">Credit Card</option>
            <option value="check">Check</option>
          </Form.Control>
        </Col>
      </Form.Group>

      {/* Action Buttons */}
      <div className="text-end">
        <Button variant="success">Post Payment</Button>
      </div>
    </div>
  );
};

export default Invoice;
