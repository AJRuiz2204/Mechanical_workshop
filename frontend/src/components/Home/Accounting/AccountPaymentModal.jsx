/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import {
  Modal,
  Card,
  Button,
  Row,
  Col,
  Form,
  InputNumber,
  Input,
  Select,
  Tag,
  Typography,
  Space,
} from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import { PDFViewer } from "@react-pdf/renderer";
import {
  getAccountReceivableById,
  createPayment,
  getPaymentsByAccount,
} from "../../../services/accountReceivableService";
import PaymentPDF from "./PaymentPDF";
import { getWorkshopSettings } from "../../../services/workshopSettingsService";
import "./styles/AccountPaymentModal.css";

const { Text, Title } = Typography;

const AccountPaymentModal = ({ show, onHide, accountId }) => {
  const [account, setAccount] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [recentPayment, setRecentPayment] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    method: "Cash",
    transactionReference: "",
    notes: "",
  });

  useEffect(() => {
    if (accountId && show) {
      fetchAccountData(accountId);
    }
    // Reset states when modal opens/closes
    if (!show) {
      setRecentPayment(null);
      setShowPrintModal(false);
      setPdfData(null);
    }
  }, [accountId, show]);

  const fetchAccountData = async (accId) => {
    try {
      const accountData = await getAccountReceivableById(accId);
      const paymentsData = await getPaymentsByAccount(accId);
      setAccount(accountData);
      setPayments(paymentsData);
      console.log("Modal - Account loaded:", accountData);
      console.log("Modal - Payments loaded:", paymentsData);
    } catch (error) {
      console.error("Modal - Error loading account:", error);
      alert("Error loading account data: " + error.message);
    }
  };

  const handlePaymentSubmit = async (values) => {
    const paymentAmount = parseFloat(values.amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    if (account && paymentAmount > account.balance) {
      alert("The entered amount exceeds the pending balance");
      return;
    }
    const payload = {
      AccountReceivableId: accountId,
      Amount: paymentAmount,
      Method: values.method,
      TransactionReference: values.transactionReference,
      Notes: values.notes,
    };
    console.log("Modal - Payload to send:", payload);
    try {
      const response = await createPayment(payload);
      console.log("Modal - createPayment response:", response);
      await fetchAccountData(accountId);
      
      // Store the recent payment for printing
      setRecentPayment(response);
      
      setFormData({
        amount: "",
        method: "Cash",
        transactionReference: "",
        notes: "",
      });
      alert("Payment successfully registered!");
      // No cerrar el modal automáticamente para permitir la impresión
    } catch (error) {
      console.error("Modal - Error in createPayment:", error);
      alert("Error registering payment: " + error.message);
    }
  };

  const handlePrintPayment = async () => {
    try {
      const workshopData = await getWorkshopSettings();
      
      // Get all payments for this account to generate the PDF
      const allPayments = await getPaymentsByAccount(accountId);
      
      const data = {
        workshopData,
        customer: account.customer,
        payments: allPayments,
      };
      
      setPdfData(data);
      setShowPrintModal(true);
    } catch (error) {
      console.error("Error preparing PDF data:", error);
      alert("Error preparing document for printing: " + error.message);
    }
  };

  const handleCloseAll = () => {
    setShowPrintModal(false);
    setRecentPayment(null);
    onHide();
  };

  return (
    <Modal
      visible={show}
      onCancel={onHide}
      width="80%"
      footer={null}
      title={`Account Receivable #${account ? account.id : accountId}`}
      className="account-payment-modal"
    >
      {account ? (
        <>
          <Card style={{ marginBottom: 24 }}>
            <Title level={5}>Customer: {account.customer.fullName}</Title>
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

          <Card style={{ marginBottom: 24 }}>
            <Title level={5}>Payment Registration</Title>
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
                      <Select.Option value="CreditCard">Credit Card</Select.Option>
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
                    <Space style={{ width: '100%' }}>
                      <Button type="primary" htmlType="submit" style={{ flex: 1 }}>
                        Register Payment
                      </Button>
                      {recentPayment && (
                        <Button 
                          type="default" 
                          icon={<PrinterOutlined />}
                          onClick={handlePrintPayment}
                        >
                          Print Receipt
                        </Button>
                      )}
                    </Space>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

          <Card>
            <Title level={5}>Payment History</Title>
            <div style={{ maxHeight: 400, overflowY: "auto" }}>
              {payments.map((payment) => (
                <Card key={payment.id} size="small" style={{ marginBottom: 8 }}>
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
      ) : (
        <div>Loading account details...</div>
      )}

      {/* Print Modal */}
      <Modal
        visible={showPrintModal}
        onCancel={() => setShowPrintModal(false)}
        width="90%"
        footer={[
          <Button key="close" onClick={() => setShowPrintModal(false)}>
            Close
          </Button>,
          <Button key="close-main" type="primary" onClick={handleCloseAll}>
            Close Payment Modal
          </Button>
        ]}
        title="Payment Receipt"
      >
        {pdfData && (
          <div className="payment-modal-content">
            <PDFViewer width="100%" height="700">
              <PaymentPDF pdfData={pdfData} />
            </PDFViewer>
          </div>
        )}
      </Modal>
    </Modal>
  );
};

export default AccountPaymentModal;
