/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { Button, Modal, Form, Row, Col } from 'react-bootstrap';
import "./ShopReports.css"; // Ensure to create this file for styles

const ShopReports = () => {
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleShowSalesModal = () => setShowSalesModal(true);
  const handleCloseSalesModal = () => setShowSalesModal(false);

  const handleShowTaxModal = () => setShowTaxModal(true);
  const handleCloseTaxModal = () => setShowTaxModal(false);

  const handleShowPaymentModal = () => setShowPaymentModal(true);
  const handleClosePaymentModal = () => setShowPaymentModal(false);

  return (
    <div className="p-4 border rounded">
      <h3>Shop Reports</h3>
      <Row className="mb-4">
        <Col md={4}>
          <div className="border p-3 rounded">
            <h5>SALES REPORT</h5>
            <p>Includes all detailed records and summary of the total sales</p>
            <p>
              <strong>Present Ranges:</strong> today, last week, last month
            </p>
            <p>
              <strong>Date Range:</strong> 11/27/2023 - 11/27/2024
            </p>
            <Button variant="primary" onClick={handleShowSalesModal}>Export to PDF</Button>
          </div>
        </Col>
        <Col md={4}>
          <div className="border p-3 rounded">
            <h5>TAX REPORT</h5>
            <p>Includes all tax charges by tax type and total tax amounts</p>
            <p>
              <strong>Present Ranges:</strong> today, last week, last month
            </p>
            <p>
              <strong>Date Range:</strong> 11/27/2023 - 11/27/2024
            </p>
            <Button variant="primary" onClick={handleShowTaxModal}>Export to PDF</Button>
          </div>
        </Col>
        <Col md={4}>
          <div className="border p-3 rounded">
            <h5>PAYMENT REPORT</h5>
            <p>Includes all payments and summary of total payments received</p>
            <p>
              <strong>Present Ranges:</strong> today, last week, last month
            </p>
            <p>
              <strong>Date Range:</strong> 11/27/2023 - 11/27/2024
            </p>
            <Button variant="primary" onClick={handleShowPaymentModal}>Export to PDF</Button>
          </div>
        </Col>
      </Row>

      {/* Sales Modal */}
      <Modal show={showSalesModal} onHide={handleCloseSalesModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Sales Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Details of sales records and summaries for the selected date range.</p>
          <Button variant="primary">Download PDF</Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseSalesModal}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Tax Modal */}
      <Modal show={showTaxModal} onHide={handleCloseTaxModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Tax Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Details of tax charges by type and total tax amounts for the selected date range.</p>
          <Button variant="primary">Download PDF</Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseTaxModal}>Close</Button>
        </Modal.Footer>
      </Modal>

      {/* Payment Modal */}
      <Modal show={showPaymentModal} onHide={handleClosePaymentModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Payment Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Details of all payments and summaries for the selected date range.</p>
          <Button variant="primary">Download PDF</Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePaymentModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ShopReports;
