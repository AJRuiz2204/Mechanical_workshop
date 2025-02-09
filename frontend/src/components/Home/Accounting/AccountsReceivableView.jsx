/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Form, Badge } from "react-bootstrap";
import {
  getAccountsReceivable,
  getAccountReceivableById,
  createPayment,
  getPaymentsByAccount,
} from "../../../services/accountReceivableService";
import { useLocation } from "react-router-dom";
import "./styles/AccountsReceivableView.css";

// AccountsReceivableView component: displays a list of accounts receivable,
// allows selection of an account to view its details, and provides a form to register payments.
const AccountsReceivableView = () => {
  // State for storing the list of accounts receivable.
  const [accounts, setAccounts] = useState([]);
  // State for storing the complete details of the selected account.
  const [selectedAccount, setSelectedAccount] = useState(null);
  // State for storing the list of payments for the selected account.
  const [payments, setPayments] = useState([]);
  // State for storing the selected account ID.
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  // State for controlling whether the payment section is shown.
  const [showPayments, setShowPayments] = useState(false);
  // State for storing form data for creating a new payment.
  // The formData includes amount, method, transactionReference, and notes.
  const [formData, setFormData] = useState({
    amount: "",
    method: "Cash",
    transactionReference: "",
    notes: "",
  });

  // useLocation hook to access the URL query parameters.
  const location = useLocation();

  // useEffect to load the list of accounts receivable when the component mounts.
  useEffect(() => {
    loadAccounts();
  }, []);

  // useEffect to check URL query parameters and select an account if accountId is provided.
  useEffect(() => {
    // Retrieve the accountId from the URL query parameters.
    const query = new URLSearchParams(location.search);
    const accountIdQuery = query.get("accountId");
    if (accountIdQuery) {
      selectAccount(parseInt(accountIdQuery));
    }
  }, [location.search]);

  // loadAccounts: asynchronously fetches the list of accounts receivable and updates state.
  const loadAccounts = async () => {
    try {
      const data = await getAccountsReceivable();
      console.log("Loaded accounts:", data);
      setAccounts(data);
    } catch (error) {
      console.error("Error loading accounts:", error);
      alert("Error loading accounts: " + error.message);
    }
  };

  // selectAccount: selects an account by its ID, fetches its details and associated payments,
  // then updates state accordingly.
  const selectAccount = async (accountId) => {
    try {
      setSelectedAccountId(accountId);
      setShowPayments(true);

      // Fetch both account details and payments concurrently.
      const [accountDetails, paymentsData] = await Promise.all([
        getAccountReceivableById(accountId),
        getPaymentsByAccount(accountId),
      ]);

      setSelectedAccount(accountDetails);
      setPayments(paymentsData);
      console.log("Selected account:", accountDetails);
      console.log("Current payments:", paymentsData);
    } catch (error) {
      console.error("Error loading account details:", error);
      alert("Error loading details: " + error.message);
    }
  };

  // handlePaymentSubmit: handles the submission of the payment form.
  // It validates the payment amount, ensures it does not exceed the account balance,
  // constructs the payload, and calls createPayment to register the payment.
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAccountId) return;

    const paymentAmount = parseFloat(formData.amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      console.log("Invalid amount entered:", formData.amount);
      alert("Please enter a valid amount");
      return;
    }

    if (selectedAccount) {
      console.log("Account balance:", selectedAccount.balance);
      console.log("Amount entered:", paymentAmount);
      if (paymentAmount > selectedAccount.balance) {
        alert("The entered amount exceeds the pending balance of the account");
        return;
      }
    }

    // Construct the payload with the exact property names expected by the server DTO.
    const payload = {
      AccountReceivableId: selectedAccountId,
      Amount: paymentAmount,
      Method: formData.method,
      TransactionReference: formData.transactionReference,
      Notes: formData.notes,
    };

    console.log("Payload to send:", payload);

    try {
      // Call the service to create a new payment.
      const response = await createPayment(payload);
      console.log("Response from createPayment:", response);

      // After successful payment creation, update the payment history and account details.
      const updatedPayments = await getPaymentsByAccount(selectedAccountId);
      setPayments(updatedPayments);
      console.log("Updated payments:", updatedPayments);

      const updatedAccount = await getAccountReceivableById(selectedAccountId);
      setSelectedAccount(updatedAccount);
      console.log("Updated account:", updatedAccount);

      // Reset the form data to initial values.
      setFormData({
        amount: "",
        method: "Cash",
        transactionReference: "",
        notes: "",
      });
      alert("Payment successfully registered!");
    } catch (error) {
      console.error("Error in createPayment:", error);
      alert("Error registering payment: " + error.message);
    }
  };

  return (
    <div className="container py-5">
      {/* Header for the Accounts Receivable Management view */}
      <h1 className="mb-4 text-center">Accounts Receivable Management</h1>

      {/* Accounts Section */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Accounts Receivable</h5>
              {/* Button to refresh the accounts list */}
              <Button variant="primary" onClick={loadAccounts}>
                Refresh List
              </Button>
            </Card.Header>
            <Card.Body>
              <Row className="row-cols-1 row-cols-md-2 g-4">
                {accounts.map((account) => (
                  <Col key={account.id}>
                    {/* Each account is displayed as a clickable card to select the account */}
                    <Card
                      className="account-card h-100"
                      onClick={() => selectAccount(account.id)}
                      style={{ cursor: "pointer", transition: "all 0.3s" }}
                    >
                      <Card.Body>
                        <Card.Title>Account #{account.id}</Card.Title>
                        <Card.Text className="mb-1">
                          Customer: {account.customer.fullName}
                        </Card.Text>
                        <Card.Text className="mb-1">
                          Vehicle: {account.vehicle.make}{" "}
                          {account.vehicle.model}
                        </Card.Text>
                        <Card.Text className="mb-1">
                          Total: ${account.originalAmount.toFixed(2)}
                        </Card.Text>
                        <Card.Text className="mb-0">
                          Balance: ${account.balance.toFixed(2)}
                        </Card.Text>
                        <Badge
                          bg={account.status === "Paid" ? "success" : "warning"}
                        >
                          {account.status}
                        </Badge>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payments Section: displayed when an account is selected */}
      {showPayments && (
        <Row>
          <Col md={8}>
            <Card className="shadow mb-4">
              <Card.Header>
                <h5 className="mb-0">Payment Record</h5>
                {/* Display the pending balance if an account is selected */}
                {selectedAccount && (
                  <small className="text-muted">
                    Pending balance: ${selectedAccount.balance.toFixed(2)}
                  </small>
                )}
              </Card.Header>
              <Card.Body>
                {/* Payment form to register a new payment */}
                <Form onSubmit={handlePaymentSubmit}>
                  <Row className="g-3">
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
                    {/* Optional field for additional notes */}
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
                    <Col xs={12}>
                      <Button variant="success" type="submit" className="w-100">
                        Register Payment
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow">
              <Card.Header>
                <h5 className="mb-0">Payment History</h5>
              </Card.Header>
              <Card.Body
                className="payment-list"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                {/* Render each payment as a card in the payment history */}
                {payments.map((payment) => (
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
          </Col>
        </Row>
      )}
    </div>
  );
};

export default AccountsReceivableView;
