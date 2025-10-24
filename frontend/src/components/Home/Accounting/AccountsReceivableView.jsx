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
  Table,
  Tag,
  Typography,
  Modal,
  Space,
  Divider,
} from "antd";
import NotificationService from "../../../services/notificationService.jsx";
import {
  SearchOutlined,
  DollarCircleOutlined,
  EyeOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  getAccountsReceivable,
  getAccountReceivableById,
  createPayment,
  getPaymentsByAccount,
} from "../../../services/accountReceivableService";
import { useLocation, useNavigate } from "react-router-dom";
import "./styles/AccountsReceivableView.css";

const { Text, Title } = Typography;

/**
 * AccountsReceivableView component:
 * - Displays accounts receivable as a searchable table.
 * - Allows filtering by "Paid" and "Pending" status.
 * - Opens a modal for payment registration when clicking on an account.
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
  // State for controlling the payment modal visibility.
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  // State for controlling the payment success modal visibility.
  const [isPaymentSuccessModalVisible, setIsPaymentSuccessModalVisible] =
    useState(false);
  // State for storing form data for creating a new payment.
  const [formData, setFormData] = useState({
    amount: "",
    method: "Cash",
    transactionReference: "",
    notes: "",
  });
  // State for filtering accounts by their status.
  const [filterPaid, setFilterPaid] = useState(false);
  const [filterPending, setFilterPending] = useState(true);
  // State for search functionality
  const [searchText, setSearchText] = useState("");
  // State for loading indicator
  const [loading, setLoading] = useState(false);
  // Form instance for payment form
  const [paymentForm] = Form.useForm();

  // useLocation hook to access the URL query parameters.
  const location = useLocation();
  // useNavigate hook for programmatic navigation
  const navigate = useNavigate();

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
      openPaymentModal(parseInt(accountIdQuery));
    }
  }, [location.search]);

  /**
   * loadAccounts:
   * Asynchronously fetches the list of accounts receivable and updates state.
   */
  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await getAccountsReceivable();
      console.log("Información recibida por getAccountsReceivable:", data);
      setAccounts(data);
    } catch (error) {
      console.error("Error loading accounts:", error);
      NotificationService.operationError('load', error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * openPaymentModal:
   * Opens the payment modal for a specific account and loads its details.
   * @param {number} accountId - The ID of the selected account.
   */
  const openPaymentModal = async (accountId) => {
    try {
      setSelectedAccountId(accountId);

      // Fetch both account details and payments concurrently.
      const [accountDetails, paymentsData] = await Promise.all([
        getAccountReceivableById(accountId),
        getPaymentsByAccount(accountId),
      ]);

      // Sort payments by payment date (most recent first) as an additional safety measure
      const sortedPayments = [...paymentsData].sort((a, b) => {
        const dateA = new Date(a.paymentDate);
        const dateB = new Date(b.paymentDate);
        return dateB - dateA; // Descending order (most recent first)
      });

      setSelectedAccount(accountDetails);
      setPayments(sortedPayments);
      setIsPaymentModalVisible(true);
      console.log("Selected account:", accountDetails);
      console.log("Current payments:", sortedPayments);
    } catch (error) {
      console.error("Error loading account details:", error);
      NotificationService.operationError('load', error.message);
    }
  };

  /**
   * handleViewPDF:
   * Navigates to the client payment PDF viewer to show the PDF.
   * @param {number} accountId - The ID of the selected account.
   */
  const handleViewPDF = async (accountId) => {
    try {
      // Navigate directly with accountId to avoid mixing accounts
      navigate(`/account-payment-pdf/${accountId}`);
    } catch (error) {
      console.error("Error navigating to PDF view:", error);
      NotificationService.operationError('load', error.message);
    }
  };

  /**
   * closePaymentModal:
   * Closes the payment modal and resets form data.
   */
  const closePaymentModal = () => {
    setIsPaymentModalVisible(false);
    setSelectedAccount(null);
    setPayments([]);
    setSelectedAccountId(null);
    paymentForm.resetFields();
    setFormData({
      amount: "",
      method: "Cash",
      transactionReference: "",
      notes: "",
    });
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
      NotificationService.validationError('Payment Amount', 'Please enter a valid amount');
      return;
    }

    if (selectedAccount) {
      console.log("Account balance:", selectedAccount.balance);
      console.log("Amount entered:", paymentAmount);
      if (paymentAmount > selectedAccount.balance) {
        NotificationService.warning('Amount Exceeds Balance', 'The entered amount exceeds the pending balance of the account');
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
      
      // Sort payments by payment date (most recent first) as an additional safety measure
      const sortedUpdatedPayments = [...updatedPayments].sort((a, b) => {
        const dateA = new Date(a.paymentDate);
        const dateB = new Date(b.paymentDate);
        return dateB - dateA; // Descending order (most recent first)
      });
      
      setPayments(sortedUpdatedPayments);
      console.log("Updated payments:", sortedUpdatedPayments);

      const updatedAccount = await getAccountReceivableById(selectedAccountId);
      setSelectedAccount(updatedAccount);
      console.log("Updated account:", updatedAccount);

      // Reset the form data to initial values.
      paymentForm.resetFields();
      setFormData({
        amount: "",
        method: "Cash",
        transactionReference: "",
        notes: "",
      });

      // Reload the accounts list to reflect the updated balance
      await loadAccounts();

      // Show success modal instead of alert
      setIsPaymentSuccessModalVisible(true);
    } catch (error) {
      console.error("Error in createPayment:", error);
      NotificationService.operationError('process', error.message);
    }
  };

  /**
   * handlePrintInvoice:
   * Navigates to the account payment PDF viewer to print the invoice.
   */
  const handlePrintInvoice = () => {
    if (selectedAccountId) {
      navigate(`/account-payment-pdf/${selectedAccountId}`);
      // Close both modals
      setIsPaymentSuccessModalVisible(false);
      closePaymentModal();
    }
  };

  /**
   * handleCloseSuccessModal:
   * Closes the success modal and optionally the payment modal.
   */
  const handleCloseSuccessModal = () => {
    setIsPaymentSuccessModalVisible(false);
    closePaymentModal();
  };

  // Filter and search the accounts based on the checkbox selections and search text.
  const filteredAccounts = accounts.filter((account) => {
    const matchesStatus =
      (account.status === "Paid" && filterPaid) ||
      (account.status !== "Paid" && filterPending);

    const matchesSearch =
      searchText === "" ||
      account.customer.fullName
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      account.vehicle.make.toLowerCase().includes(searchText.toLowerCase()) ||
      account.vehicle.model.toLowerCase().includes(searchText.toLowerCase()) ||
      account.id.toString().includes(searchText);

    return matchesStatus && matchesSearch;
  });

  // Define table columns
  const columns = [
    {
      title: "Account #",
      dataIndex: "id",
      key: "id",
      width: 100,
      sorter: (a, b) => a.id - b.id,
      render: (id) => (
        <Text strong style={{ color: "#0056b3" }}>
          #{id}
        </Text>
      ),
    },
    {
      title: "Customer",
      dataIndex: ["customer", "fullName"],
      key: "customer",
      sorter: (a, b) => a.customer.fullName.localeCompare(b.customer.fullName),
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: "Vehicle",
      key: "vehicle",
      render: (record) => (
        <div>
          <Text>{`${record.vehicle.year} ${record.vehicle.make} ${record.vehicle.model}`}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            VIN: {record.vehicle.vin?.slice(-6) || "N/A"}
          </Text>
        </div>
      ),
      sorter: (a, b) =>
        `${a.vehicle.make} ${a.vehicle.model}`.localeCompare(
          `${b.vehicle.make} ${b.vehicle.model}`
        ),
    },
    {
      title: "Original Amount",
      dataIndex: "originalAmount",
      key: "originalAmount",
      render: (amount) => (
        <Text strong style={{ color: "#666" }}>
          ${amount.toFixed(2)}
        </Text>
      ),
      sorter: (a, b) => a.originalAmount - b.originalAmount,
      width: 150,
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (balance) => (
        <Text
          strong
          style={{
            color: balance > 0 ? "#ff4d4f" : "#52c41a",
            fontSize: "16px",
          }}
        >
          ${balance.toFixed(2)}
        </Text>
      ),
      sorter: (a, b) => a.balance - b.balance,
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={status === "Paid" ? "green" : "orange"}
          style={{ fontWeight: "bold" }}
        >
          {status}
        </Tag>
      ),
      filters: [
        { text: "Paid", value: "Paid" },
        { text: "Pending", value: "Pending" },
      ],
      onFilter: (value, record) => record.status === value,
      width: 100,
    },
    {
      title: "Actions",
      key: "actions",
      render: (record) => (
        <Space>
          <Button
            type="primary"
            icon={<DollarCircleOutlined />}
            size="small"
            onClick={() => openPaymentModal(record.id)}
            disabled={record.status === "Paid"}
          >
            Pay
          </Button>
          <Button
            type="default"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewPDF(record.id)}
          >
            View PDF
          </Button>
        </Space>
      ),
      width: 150,
    },
  ];

  return (
    <div className="container-fluid w-100 py-5">
      <Title
        level={2}
        className="text-center mb-4"
        style={{ color: "#0056b3" }}
      >
        Pending Payments Management
      </Title>
      <Text
        className="text-center d-block mb-4"
        style={{ fontSize: "16px", color: "#666" }}
      >
        Manage and process pending customer payments
      </Text>

      <Card style={{ marginBottom: 24 }}>
        {/* Filters and Search Row */}
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={10}>
            <Input
              placeholder="Search by customer, vehicle, or account #"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Space size="large">
              <Checkbox
                checked={filterPending}
                onChange={(e) => setFilterPending(e.target.checked)}
              >
                <span style={{ fontWeight: 500 }}>Pending</span>
              </Checkbox>
              <Checkbox
                checked={filterPaid}
                onChange={(e) => setFilterPaid(e.target.checked)}
              >
                <span style={{ fontWeight: 500 }}>Paid</span>
              </Checkbox>
            </Space>
          </Col>
          <Col xs={24} sm={24} md={8} style={{ textAlign: "right" }}>
            <Space>
              <Text strong style={{ color: "#0056b3" }}>
                Total: {filteredAccounts.length} accounts
              </Text>
              <Button
                type="primary"
                onClick={loadAccounts}
                loading={loading}
                size="large"
              >
                Refresh List
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Accounts Table */}
        <Table
          columns={columns}
          dataSource={filteredAccounts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} accounts`,
            pageSizeOptions: ["10", "15", "25", "50"],
          }}
          scroll={{ x: 800 }}
          size="middle"
          bordered
          rowClassName={(record) =>
            record.status === "Pending" ? "pending-payment-row" : ""
          }
        />
      </Card>

      {/* Payment Modal */}
      <Modal
        title={
          <div style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: 16 }}>
            <Title level={4} style={{ margin: 0, color: "#0056b3" }}>
              Payment Processing - Account #{selectedAccountId}
            </Title>
            <Text type="secondary">
              Process payment and view payment history
            </Text>
          </div>
        }
        open={isPaymentModalVisible}
        onCancel={closePaymentModal}
        footer={null}
        width={900}
        destroyOnClose
        centered
      >
        {selectedAccount && (
          <div style={{ padding: "16px 0" }}>
            {/* Account Information */}
            <Card
              title={
                <Space>
                  <Text strong style={{ color: "#0056b3" }}>
                    Account Information
                  </Text>
                  <Tag
                    color={
                      selectedAccount.status === "Paid" ? "green" : "orange"
                    }
                    style={{ fontWeight: "bold" }}
                  >
                    {selectedAccount.status}
                  </Tag>
                </Space>
              }
              size="small"
              style={{ marginBottom: 16 }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <div>
                      <Text strong style={{ color: "#0056b3" }}>
                        Customer:{" "}
                      </Text>
                      <Text style={{ fontSize: "16px" }}>
                        {selectedAccount.customer.fullName}
                      </Text>
                    </div>
                    <div>
                      <Text strong>Email: </Text>
                      <Text>{selectedAccount.customer.email}</Text>
                    </div>
                    <div>
                      <Text strong>Phone: </Text>
                      <Text>{selectedAccount.customer.primaryPhone}</Text>
                    </div>
                  </Space>
                </Col>
                <Col span={12}>
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <div>
                      <Text strong style={{ color: "#0056b3" }}>
                        Vehicle:{" "}
                      </Text>
                      <Text style={{ fontSize: "16px" }}>
                        {selectedAccount.vehicle.year}{" "}
                        {selectedAccount.vehicle.make}{" "}
                        {selectedAccount.vehicle.model}
                      </Text>
                    </div>
                    <div>
                      <Text strong>VIN: </Text>
                      <Text>{selectedAccount.vehicle.vin}</Text>
                    </div>
                    <div>
                      <Text strong>Original Amount: </Text>
                      <Text style={{ fontSize: "16px", fontWeight: 500 }}>
                        ${selectedAccount.originalAmount.toFixed(2)}
                      </Text>
                    </div>
                    <div>
                      <Text strong>Pending Balance: </Text>
                      <Text
                        style={{
                          color:
                            selectedAccount.balance > 0 ? "#ff4d4f" : "#52c41a",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        ${selectedAccount.balance.toFixed(2)}
                      </Text>
                    </div>
                  </Space>
                </Col>
              </Row>
            </Card>

            <Divider />

            {/* Payment Form */}
            {selectedAccount.status !== "Paid" && (
              <Card
                title={
                  <Space>
                    <DollarCircleOutlined style={{ color: "#0056b3" }} />
                    <Text strong style={{ color: "#0056b3" }}>
                      Register New Payment
                    </Text>
                  </Space>
                }
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Form
                  form={paymentForm}
                  layout="vertical"
                  onFinish={handlePaymentSubmit}
                  initialValues={formData}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label={<Text strong>Payment Amount</Text>}
                        name="amount"
                        rules={[
                          { required: true, message: "Please enter an amount" },
                          {
                            type: "number",
                            min: 0.01,
                            message: "Amount must be greater than 0",
                          },
                        ]}
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          step={0.01}
                          max={selectedAccount.balance}
                          placeholder={`Max: $${selectedAccount.balance.toFixed(
                            2
                          )}`}
                          size="large"
                          formatter={(value) =>
                            `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label={<Text strong>Payment Method</Text>}
                        name="method"
                        rules={[
                          {
                            required: true,
                            message: "Please select a payment method",
                          },
                        ]}
                      >
                        <Select
                          placeholder="Select payment method"
                          size="large"
                        >
                          <Select.Option value="Cash">💵 Cash</Select.Option>
                          <Select.Option value="CreditCard">
                            💳 Credit Card
                          </Select.Option>
                          <Select.Option value="Transfer">
                            🏦 Transfer
                          </Select.Option>
                          <Select.Option value="Check">📄 Check</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        label={<Text strong>Transaction Reference</Text>}
                        name="transactionReference"
                      >
                        <Input
                          placeholder="Enter transaction reference (optional)"
                          size="large"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item label={<Text strong>Notes</Text>} name="notes">
                        <Input.TextArea
                          rows={3}
                          placeholder="Enter any additional notes (optional)"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item>
                        <Button
                          type="primary"
                          htmlType="submit"
                          block
                          size="large"
                          style={{ height: "50px", fontSize: "16px" }}
                          icon={<DollarCircleOutlined />}
                        >
                          Process Payment
                        </Button>
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>
            )}

            {/* Payment History */}
            <Card title="Payment History" size="small">
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <Card
                      key={payment.id}
                      size="small"
                      style={{ marginBottom: 8 }}
                      bodyStyle={{ padding: 12 }}
                    >
                      <Row justify="space-between" align="middle">
                        <Col span={16}>
                          <Text strong style={{ fontSize: "16px" }}>
                            ${payment.amount.toFixed(2)}
                          </Text>
                          <br />
                          <Text type="secondary">
                            {new Date(payment.paymentDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </Text>
                          {payment.transactionReference && (
                            <>
                              <br />
                              <Text type="secondary">
                                Ref: {payment.transactionReference}
                              </Text>
                            </>
                          )}
                          {payment.notes && (
                            <>
                              <br />
                              <Text type="secondary">
                                Notes: {payment.notes}
                              </Text>
                            </>
                          )}
                        </Col>
                        <Col span={8} style={{ textAlign: "right" }}>
                          <Tag color="blue" style={{ marginBottom: 4 }}>
                            {payment.method}
                          </Tag>
                          <br />
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            ID: {payment.id}
                          </Text>
                        </Col>
                      </Row>
                    </Card>
                  ))
                ) : (
                  <Text
                    type="secondary"
                    style={{ textAlign: "center", display: "block" }}
                  >
                    No payments recorded for this account
                  </Text>
                )}
              </div>
            </Card>
          </div>
        )}
      </Modal>

      {/* Payment Success Modal */}
      <Modal
        title={
          <div style={{ textAlign: "center" }}>
            <CheckCircleOutlined
              style={{
                fontSize: "24px",
                color: "#52c41a",
                marginRight: "8px",
              }}
            />
            <span style={{ color: "#0056b3", fontSize: "18px" }}>
              Payment Successful
            </span>
          </div>
        }
        open={isPaymentSuccessModalVisible}
        onCancel={handleCloseSuccessModal}
        footer={null}
        centered
        width={500}
        destroyOnClose
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <CheckCircleOutlined
            style={{
              fontSize: "64px",
              color: "#52c41a",
              marginBottom: "16px",
            }}
          />
          <Title
            level={3}
            style={{
              margin: "16px 0",
              color: "#0056b3",
            }}
          >
            Payment Registered Successfully!
          </Title>
          <Text
            type="secondary"
            style={{
              fontSize: "16px",
              display: "block",
              marginBottom: "24px",
            }}
          >
            The payment has been processed and the account balance has been
            updated. Would you like to print the invoice?
          </Text>

          <Space size="large">
            <Button
              type="primary"
              size="large"
              icon={<PrinterOutlined />}
              onClick={handlePrintInvoice}
              style={{
                height: "48px",
                fontSize: "16px",
                minWidth: "140px",
              }}
            >
              Print Invoice
            </Button>
            <Button
              type="default"
              size="large"
              onClick={handleCloseSuccessModal}
              style={{
                height: "48px",
                fontSize: "16px",
                minWidth: "100px",
              }}
            >
              Close
            </Button>
          </Space>
        </div>
      </Modal>
    </div>
  );
};

export default AccountsReceivableView;
