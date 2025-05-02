import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Form,
  InputNumber,
  Input,
  Select,
  Checkbox,
  List,
  Tag,
  Typography,
} from "antd";
import {
  getAccountsReceivable,
  getAccountReceivableById,
  createPayment,
  getPaymentsByAccount,
} from "../../../services/accountReceivableService";
import { useLocation } from "react-router-dom";
import "./styles/AccountsReceivableView.css";

const { Text, Title } = Typography;

/**
 * AccountsReceivableView component:
 * - Displays a list of accounts receivable as a vertical list on the left.
 * - Provides checkboxes to filter accounts by "Paid" and "Pending" status.
 * - Allows selection of an account to view its details.
 * - Displays a payment form and payment history on the right when an account is selected.
 */
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
  const [formData, setFormData] = useState({
    amount: "",
    method: "Cash",
    transactionReference: "",
    notes: "",
  });
  // State for filtering accounts by their status.
  const [filterPaid, setFilterPaid] = useState(true);
  const [filterPending, setFilterPending] = useState(true);

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

  /**
   * loadAccounts:
   * Asynchronously fetches the list of accounts receivable and updates state.
   */
  const loadAccounts = async () => {
    try {
      const data = await getAccountsReceivable();
      console.log("Información recibida por getAccountsReceivable:", data);
      setAccounts(data);
    } catch (error) {
      console.error("Error loading accounts:", error);
      alert("Error loading accounts: " + error.message);
    }
  };

  /**
   * selectAccount:
   * Selects an account by its ID, fetches its details and associated payments,
   * then updates state accordingly.
   * @param {number} accountId - The ID of the selected account.
   */
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

  /**
   * handlePaymentSubmit:
   * Handles the submission of the payment form.
   * Validates the payment amount, ensures it does not exceed the account balance,
   * constructs the payload, and calls createPayment to register the payment.
   */
  const handlePaymentSubmit = async (values) => {
    if (!selectedAccountId) return;

    const paymentAmount = parseFloat(values.amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      console.log("Invalid amount entered:", values.amount);
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
      Method: values.method,
      TransactionReference: values.transactionReference,
      Notes: values.notes,
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

  // Filter the accounts based on the checkbox selections.
  const filteredAccounts = accounts.filter((account) => {
    if (account.status === "Paid" && filterPaid) return true;
    if (account.status !== "Paid" && filterPending) return true;
    return false;
  });

  return (
    <div className="container-fluid w-100 py-5">
      <Title level={3} className="text-center mb-4">
        Accounts Receivable Management
      </Title>

      <Row gutter={24}>
        <Col span={10}>
          <Card>
            <Row justify="space-between" align="middle">
              <Title level={5}>Accounts Receivable</Title>
              <Button type="primary" onClick={loadAccounts}>
                Refresh List
              </Button>
            </Row>

            <Form layout="inline" style={{ margin: "16px 0" }}>
              <Form.Item>
                <Checkbox
                  checked={filterPaid}
                  onChange={(e) => setFilterPaid(e.target.checked)}
                >
                  Paid
                </Checkbox>
              </Form.Item>
              <Form.Item>
                <Checkbox
                  checked={filterPending}
                  onChange={(e) => setFilterPending(e.target.checked)}
                >
                  Pending
                </Checkbox>
              </Form.Item>
            </Form>

            <List
              pagination={{ pageSize: 10 }}
              dataSource={filteredAccounts}
              renderItem={(account) => (
                <List.Item
                  onClick={() => selectAccount(account.id)}
                  style={{ cursor: "pointer", padding: 0 }}
                >
                  <Card style={{ width: "100%", marginBottom: 8 }} hoverable>
                    <Title level={5}>Account #{account.id}</Title>
                    <Text>Customer: {account.customer.fullName}</Text>
                    <br />
                    <Text>
                      Vehicle: {account.vehicle.make} {account.vehicle.model}
                    </Text>
                    <br />
                    <Text>Total: ${account.originalAmount.toFixed(2)}</Text>
                    <br />
                    <Text>Balance: ${account.balance.toFixed(2)}</Text>
                    <br />
                    <Tag color={account.status === "Paid" ? "green" : "orange"}>
                      {account.status}
                    </Tag>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={14}>
          {showPayments && (
            <>
              <Card style={{ marginBottom: 24 }}>
                <Title level={5}>Payment Record</Title>
                {selectedAccount && (
                  <Text type="secondary">
                    Pending balance: ${selectedAccount.balance.toFixed(2)}
                  </Text>
                )}
                <Form
                  layout="vertical"
                  onFinish={handlePaymentSubmit}
                  initialValues={formData}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Amount"
                        name="amount"
                        rules={[{ required: true }]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          step={0.01}
                          onChange={(value) =>
                            setFormData({ ...formData, amount: value })
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Payment Method"
                        name="method"
                        rules={[{ required: true }]}
                      >
                        <Select
                          onChange={(value) =>
                            setFormData({ ...formData, method: value })
                          }
                        >
                          <Select.Option value="Cash">Cash</Select.Option>
                          <Select.Option value="CreditCard">
                            Credit Card
                          </Select.Option>
                          <Select.Option value="Transfer">Transfer</Select.Option>
                          <Select.Option value="Check">Check</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item label="Reference" name="transactionReference">
                        <Input
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              transactionReference: e.target.value,
                            })
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item label="Notes" name="notes">
                        <Input
                          onChange={(e) =>
                            setFormData({ ...formData, notes: e.target.value })
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                          Register Payment
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>

              <Card>
                <Title level={5}>Payment History</Title>
                <div style={{ maxHeight: 400, overflowY: "auto" }}>
                  {payments.map((payment) => (
                    <Card
                      key={payment.id}
                      size="small"
                      style={{ marginBottom: 8 }}
                    >
                      <Row justify="space-between">
                        <Col>
                          <Text strong>${payment.amount.toFixed(2)}</Text>
                          <br />
                          <Text type="secondary">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </Text>
                        </Col>
                        <Col>
                          <Tag color="blue">{payment.method}</Tag>
                        </Col>
                      </Row>
                      {payment.transactionReference && (
                        <Text type="secondary">
                          Ref: {payment.transactionReference}
                        </Text>
                      )}
                    </Card>
                  ))}
                </div>
              </Card>
            </>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default AccountsReceivableView;
