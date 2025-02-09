/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Modal, Card, Button, Row, Col, Form, Badge } from "react-bootstrap";
import {
  getAccountReceivableById,
  createPayment,
  getPaymentsByAccount,
} from "../../../services/accountReceivableService";
import "./styles/AccountPaymentModal.css";

// AccountPaymentModal component: renders a modal for viewing account details, making payments,
// and displaying payment history for a given account receivable.
const AccountPaymentModal = ({ show, onHide, accountId }) => {
  // State for storing the account details.
  const [account, setAccount] = useState(null);
  // State for storing the list of payments related to the account.
  const [payments, setPayments] = useState([]);
  // State for storing the form data for creating a new payment.
  const [formData, setFormData] = useState({
    amount: "",
    method: "Cash",
    transactionReference: "",
    notes: "",
  });

  // useEffect hook to fetch account data and payments when accountId and show are available.
  useEffect(() => {
    if (accountId && show) {
      fetchAccountData(accountId);
    }
  }, [accountId, show]);

  // fetchAccountData: asynchronously retrieves account details and its associated payments.
  const fetchAccountData = async (accId) => {
    try {
      // Fetch account details by ID.
      const accountData = await getAccountReceivableById(accId);
      // Fetch payments associated with the account.
      const paymentsData = await getPaymentsByAccount(accId);
      // Update state with fetched data.
      setAccount(accountData);
      setPayments(paymentsData);
      console.log("Modal - Account loaded:", accountData);
      console.log("Modal - Payments loaded:", paymentsData);
    } catch (error) {
      // Log and alert error if fetching fails.
      console.error("Modal - Error loading account:", error);
      alert("Error loading account data: " + error.message);
    }
  };

  // handlePaymentSubmit: handles the submission of the payment form.
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    // Parse the payment amount from form data.
    const paymentAmount = parseFloat(formData.amount);
    // Validate that the payment amount is a valid number and greater than zero.
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    // Validate that the payment amount does not exceed the account balance.
    if (account && paymentAmount > account.balance) {
      alert("The entered amount exceeds the pending balance");
      return;
    }
    // Build the payload for creating a payment.
    const payload = {
      AccountReceivableId: accountId,
      Amount: paymentAmount,
      Method: formData.method,
      TransactionReference: formData.transactionReference,
      Notes: formData.notes,
    };
    console.log("Modal - Payload to send:", payload);
    try {
      // Call the createPayment service with the payload.
      const response = await createPayment(payload);
      console.log("Modal - createPayment response:", response);
      // Refresh the account data and payments after successful payment creation.
      await fetchAccountData(accountId);
      // Reset the form data to initial values.
      setFormData({
        amount: "",
        method: "Cash",
        transactionReference: "",
        notes: "",
      });
      alert("Payment successfully registered!");
    } catch (error) {
      // Log and alert error if payment creation fails.
      console.error("Modal - Error in createPayment:", error);
      alert("Error registering payment: " + error.message);
    }
  };

  return (
    // Render a modal with account payment details and payment history.
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Account Receivable #{account ? account.id : accountId}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {account ? (
          <>
            {/* Display account details in a card. */}
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Customer: {account.customer.fullName}</Card.Title>
                <Card.Text>
                  Vehicle: {account.vehicle.make} {account.vehicle.model}
                </Card.Text>
                <Card.Text>
                  Total: ${account.originalAmount.toFixed(2)}
                </Card.Text>
                <Card.Text>Balance: ${account.balance.toFixed(2)}</Card.Text>
                <Badge bg={account.status === "Paid" ? "success" : "warning"}>
                  {account.status}
                </Badge>
              </Card.Body>
            </Card>
            {/* Card for payment registration form. */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Payment Registration</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handlePaymentSubmit}>
                  <Row className="g-3">
                    {/* Input for payment amount */}
                    <Col md={6}>
                      <Form.Label>Amount</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        required
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                      />
                    </Col>
                    {/* Select input for payment method */}
                    <Col md={6}>
                      <Form.Label>Payment Method</Form.Label>
                      <Form.Select
                        value={formData.method}
                        onChange={(e) =>
                          setFormData({ ...formData, method: e.target.value })
                        }
                        required
                      >
                        <option value="Cash">Cash</option>
                        <option value="CreditCard">Credit Card</option>
                        <option value="Transfer">Transfer</option>
                        <option value="Check">Check</option>
                      </Form.Select>
                    </Col>
                    {/* Input for transaction reference */}
                    <Col xs={12}>
                      <Form.Label>Reference</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.transactionReference}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            transactionReference: e.target.value,
                          })
                        }
                      />
                    </Col>
                    {/* Input for additional notes */}
                    <Col xs={12}>
                      <Form.Label>Notes</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            notes: e.target.value,
                          })
                        }
                      />
                    </Col>
                    {/* Submit button for the payment form */}
                    <Col xs={12}>
                      <Button variant="success" type="submit" className="w-100">
                        Register Payment
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
            {/* Card for displaying payment history */}
            <Card>
              <Card.Header>
                <h5 className="mb-0">Payment History</h5>
              </Card.Header>
              <Card.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
                {payments.map((payment) => (
                  // Render each payment as a card.
                  <Card key={payment.id} className="mb-2">
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="mb-0">${payment.amount.toFixed(2)}</h6>
                          <small className="text-muted">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </small>
                        </div>
                        <div>
                          <Badge bg="primary">{payment.method}</Badge>
                        </div>
                      </div>
                      {/* Display transaction reference if available */}
                      {payment.transactionReference && (
                        <small className="text-muted">
                          Ref: {payment.transactionReference}
                        </small>
                      )}
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          </>
        ) : (
          // Display loading text if account details are not yet available.
          <div>Loading account details...</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {/* Button to close the modal */}
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AccountPaymentModal;
