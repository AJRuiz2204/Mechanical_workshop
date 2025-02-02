/* eslint-disable no-unused-vars */
// src/components/Home/Payment/PaymentPDFViewer.jsx

/**
 * Component for displaying a PDF viewer with payment information
 * @module PaymentPDFViewer
 */

import React, { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import PaymentPDF from "./PaymentPDF";
import { getAllPayments } from "../../../services/accountReceivableService";
import { getWorkshopSettings } from "../../../services/workshopSettingsService";

/**
 * Main component for rendering a PDF viewer with payment details
 * @returns {JSX.Element} PDF viewer component
 */
const PaymentPDFViewer = () => {
  const [pdfData, setPdfData] = useState(null);

  /**
   * Fetches payment data and sets up PDF data when the component mounts
   */
  useEffect(() => {
    // Fetch payment data and define workshop and customer information
    const fetchData = async () => {
      try {
        const payments = await getAllPayments();
        const workshopData = await getWorkshopSettings();
        
        const data = {
          workshopData: workshopData,
          customer: {
            fullName: "John Doe",
            email: "johndoe@example.com",
            primaryPhone: "(200) 123-4567",
          },
          payments: payments,
        };
        setPdfData(data);
      } catch (error) {
        console.error("Error fetching PDF data:", error);
      }
    };
    fetchData();
  }, []);

  // Show loading message while data is being fetched
  if (!pdfData) {
    return <div>Loading PDF...</div>;
  }

  return (
    <PDFViewer width="100%" height="1000">
      <PaymentPDF pdfData={pdfData} />
    </PDFViewer>
  );
};

export default PaymentPDFViewer;
