/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { 
  Table, 
  Input, 
  Alert, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Row, 
  Col, 
  Statistic, 
  Tag,
  Tooltip
} from "antd";
import { 
  DownloadOutlined, 
  SearchOutlined, 
  DollarOutlined, 
  FileTextOutlined 
} from '@ant-design/icons';
import { getAllPayments } from "../../../services/accountReceivableService";
import PaymentPDFModal from "./PaymentPDFModal";
import "./styles/PaymentList.css";

const { Title, Text } = Typography;

/**
 * PaymentList Component
 *
 * This component displays a list of payments grouped by account (using the estimate ID).
 * It provides:
 * - A search field to filter by customer or vehicle.
 * - A table summarizing the payments for each account.
 * - A "Download PDF" button for each account that opens a modal showing PDF details.
 */
const PaymentList = () => {
  // Setting state for payment data, loading status, error messages, search term,
  // modal visibility, and selected account payments.
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPaymentPDFModal, setShowPaymentPDFModal] = useState(false);
  const [selectedAccountPayments, setSelectedAccountPayments] = useState(null);

  // useEffect hook to fetch payments when the component mounts.
  useEffect(() => {
    fetchPayments();
  }, []); // Empty dependency array means this runs once after first render

  /**
   * fetchPayments:
   * Fetches all payment records from the server.
   */
  const fetchPayments = async () => {
    try {
      const data = await getAllPayments();
      console.log("Payments loaded:", data);
      setPayments(data);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.message || "Error fetching payments");
    } finally {
      setLoading(false);
    }
  };

  // Group payments by the account (using the estimate.id property).
  const groupedPayments = payments.reduce((groups, payment) => {
    // Determine account ID or use 'unknown' if not available.
    const accountId = payment.estimate?.id || "unknown";
    if (!groups[accountId]) {
      groups[accountId] = [];
    }
    groups[accountId].push(payment);
    return groups;
  }, {});

  // Filter grouped payments based on search term matching customer name or vehicle info.
  const filteredGroupedPayments = Object.keys(groupedPayments).reduce(
    (acc, accountId) => {
      const accountPayments = groupedPayments[accountId];
      const clientName = accountPayments[0].customer?.fullName || "";
      const vehicleInfo = accountPayments[0].vehicle
        ? `${accountPayments[0].vehicle.make} ${accountPayments[0].vehicle.model} (${accountPayments[0].vehicle.year}) - ${accountPayments[0].vehicle.vin}`
        : "";
      // Check if client name or vehicle info includes the search term (case insensitive)
      if (
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        acc[accountId] = accountPayments;
      }
      return acc;
    },
    {}
  );

  // Nuevo dataSource para Antd Table
  const dataSource = Object.keys(filteredGroupedPayments).map((accountId) => {
    const accountPayments = filteredGroupedPayments[accountId];
    const totalPaid = accountPayments.reduce((s, p) => s + Number(p.amount), 0);
    const initialBalance = accountPayments[0].initialBalance || 0;
    const remainingBalance = accountPayments[0].remainingBalance || 0;
    const clientName = accountPayments[0].customer?.fullName || "No customer";
    const vehicleInfo = accountPayments[0].vehicle
      ? `${accountPayments[0].vehicle.make} ${accountPayments[0].vehicle.model} (${accountPayments[0].vehicle.year}) - ${accountPayments[0].vehicle.vin}`
      : "No vehicle";
    
    // Get the latest payment for date and diagnostic detail
    const latestPayment = accountPayments[0];
    const paymentDate = latestPayment.paymentDate ? new Date(latestPayment.paymentDate).toLocaleDateString() : "N/A";
    const diagnosticDetail = latestPayment.estimate?.extendedDiagnostic || 
                            latestPayment.estimate?.technicianDiagnostic?.extendedDiagnostic || 
                            "No diagnostic detail";
    
    return {
      key: accountId,
      invoiceId: accountId,
      customer: clientName,
      vehicle: vehicleInfo,
      paymentDate: paymentDate,
      diagnosticDetail: diagnosticDetail.length > 50 ? diagnosticDetail.substring(0, 50) + "..." : diagnosticDetail,
      initialBalance: initialBalance.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      remainingBalance: remainingBalance.toFixed(2),
      paymentsCount: accountPayments.length,
      accountPayments,
    };
  });

  // Columnas Antd
  const columns = [
    { 
      title: "Invoice No.", 
      dataIndex: "invoiceId", 
      key: "invoiceId",
      width: 100,
    },
    { 
      title: "Customer", 
      dataIndex: "customer", 
      key: "customer",
      sorter: (a, b) => a.customer.localeCompare(b.customer),
      ellipsis: true,
    },
    { 
      title: "Date", 
      dataIndex: "paymentDate", 
      key: "paymentDate",
      width: 100,
    },
    { 
      title: "Diagnostic Detail", 
      dataIndex: "diagnosticDetail", 
      key: "diagnosticDetail",
      ellipsis: true,
      width: 200,
    },
    { 
      title: "Vehicle", 
      dataIndex: "vehicle", 
      key: "vehicle",
      ellipsis: true,
      responsive: ['lg'],
    },
    {
      title: "Initial Balance",
      dataIndex: "initialBalance",
      key: "initialBalance",
      render: (v) => (
        <Text strong style={{ color: '#666' }}>
          ${v}
        </Text>
      ),
      sorter: (a, b) => parseFloat(a.initialBalance) - parseFloat(b.initialBalance),
      width: 130,
    },
    {
      title: "Total Paid",
      dataIndex: "totalPaid",
      key: "totalPaid",
      render: (v) => (
        <Text strong style={{ color: '#52c41a' }}>
          ${v}
        </Text>
      ),
      sorter: (a, b) => parseFloat(a.totalPaid) - parseFloat(b.totalPaid),
      width: 120,
    },
    {
      title: "Remaining",
      dataIndex: "remainingBalance",
      key: "remainingBalance",
      render: (v) => {
        const remaining = parseFloat(v);
        return (
          <Tag color={remaining > 0 ? 'orange' : 'green'}>
            ${v}
          </Tag>
        );
      },
      sorter: (a, b) => parseFloat(a.remainingBalance) - parseFloat(b.remainingBalance),
      width: 110,
    },
    { 
      title: "Payments", 
      dataIndex: "paymentsCount", 
      key: "paymentsCount",
      render: (count) => (
        <Tag color="blue" icon={<FileTextOutlined />}>
          {count}
        </Tag>
      ),
      sorter: (a, b) => a.paymentsCount - b.paymentsCount,
      width: 100,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Tooltip title="Download Payment Report">
          <Button
            type="primary"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleOpenPaymentPDF(record.key, record.accountPayments)}
          >
            PDF
          </Button>
        </Tooltip>
      ),
      width: 80,
      fixed: 'right',
    },
  ];

  /**
   * handleOpenPaymentPDF:
   * Opens the PDF modal and sets the payment data for the selected account.
   *
   * @param {string} accountId - The unique account ID (estimate.id).
   * @param {Array} accountPayments - The list of payments for that account.
   */
  const handleOpenPaymentPDF = (accountId, accountPayments) => {
    setSelectedAccountPayments(accountPayments); // Store selected account's payments
    setShowPaymentPDFModal(true); // Open the PDF modal
  };

  // Calculate summary statistics
  const totalPayments = dataSource.reduce((sum, item) => sum + item.paymentsCount, 0);
  const totalPaidAmount = dataSource.reduce((sum, item) => sum + parseFloat(item.totalPaid), 0);
  const totalRemainingAmount = dataSource.reduce((sum, item) => sum + parseFloat(item.remainingBalance), 0);
  const totalAccounts = dataSource.length;

  // Render a loading state if data is still being fetched
  if (loading) {
    return (
      <div className="container-fluid w-100 py-5">
        <Card>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Text>Loading payments...</Text>
          </div>
        </Card>
      </div>
    );
  }

  // Render an error message if fetching failed
  if (error) {
    return (
      <div className="container-fluid w-100 py-5">
        <Alert message={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="container-fluid w-100 py-5">
      <Title level={3} className="text-center mb-4">
        Payment History Management
      </Title>

      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Accounts"
              value={totalAccounts}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Payments"
              value={totalPayments}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Collected"
              value={totalPaidAmount}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Outstanding"
              value={totalRemainingAmount}
              prefix="$"
              precision={2}
              valueStyle={{ color: totalRemainingAmount > 0 ? '#faad14' : '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Card */}
      <Card>
        {/* Search and Controls */}
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} sm={16} md={12}>
            <Input
              placeholder="Search by customer or vehicle"
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={12} style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={fetchPayments} loading={loading}>
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Payments Table */}
        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} accounts`,
          }}
          locale={{ emptyText: "No payments found." }}
          scroll={{ x: 800 }}
          size="middle"
        />
      </Card>

      {/* Conditionally render the Payment PDF Modal if payments are selected */}
      {selectedAccountPayments && (
        <PaymentPDFModal
          show={showPaymentPDFModal} // Controls modal visibility
          onHide={() => setShowPaymentPDFModal(false)} // Function to hide the modal
          customerPayments={selectedAccountPayments} // Payment data for the selected account
        />
      )}
    </div>
  );
};

export default PaymentList;
