/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { PDFViewer } from "@react-pdf/renderer";
import PaymentPDF from "./PaymentPDF"; // Adjust the path as needed
import { getWorkshopSettings } from "../../../services/workshopSettingsService";

/**
 * PaymentPDFModal Component
 *
 * This component displays a modal containing a PDF viewer for a specific customer's payments.
 * It fetches the workshop settings and builds the PDF data using the provided customer payments.
 * The modal styling is identical to the previous Estimate PDF modal.
 *
 * Props:
 * - show: Boolean indicating whether the modal is visible.
 * - onHide: Function to close the modal.
 * - customerPayments: Array of payments for the selected customer.
 *
 * @returns {JSX.Element} The PaymentPDFModal component.
 */
const PaymentPDFModal = ({ show, onHide, customerPayments }) => {
  // Local state for storing PDF data and loading status
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * useEffect Hook:
   * Fetches workshop settings and builds PDF data when customerPayments change.
   */
  useEffect(() => {
    const fetchWorkshopData = async () => {
      try {
        const workshopData = await getWorkshopSettings();
        // Use the first payment's customer info as the customer data
        const customer = customerPayments[0]?.customer || {};
        const data = {
          workshopData,
          customer,
          payments: customerPayments,
        };
        setPdfData(data);
      } catch (error) {
        console.error("Error fetching workshop data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (customerPayments && customerPayments.length > 0) {
      fetchWorkshopData();
    }
  }, [customerPayments]);

  return (
    <Modal show={show} onHide={onHide} size="xl" dialogClassName="modal-90w">
      <Modal.Header closeButton>
        <Modal.Title>Payment PDF</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div>Loading PDF...</div>
        ) : (
          <PDFViewer width="100%" height="700">
            <PaymentPDF pdfData={pdfData} />
          </PDFViewer>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default PaymentPDFModal;
