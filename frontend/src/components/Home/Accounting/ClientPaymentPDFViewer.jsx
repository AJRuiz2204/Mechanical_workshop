/* eslint-disable no-unused-vars */
// src/components/Home/Payment/ClientPaymentPDFViewer.jsx

/**
 * Component for displaying a PDF viewer with client payment information
 * @module ClientPaymentPDFViewer
 */

import React, { useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import ClientPaymentPDF from "./ClientPaymentPDF";
import { getPaymentsByCustomer } from "../../../services/accountReceivableService";
import { getWorkshopSettings } from "../../../services/workshopSettingsService";
import { useParams } from "react-router-dom";

/**
 * Main component for rendering a PDF viewer with client payment details
 * @returns {JSX.Element} PDF viewer component
 */
const ClientPaymentPDFViewer = () => {
  const { customerId } = useParams(); // Ruta: /client-payment-pdf/:customerId
  const [pdfData, setPdfData] = useState(null);

  /**
   * Fetches payment and workshop data when the component mounts or customerId changes
   */
  useEffect(() => {
    if (customerId) {
      fetchData(customerId);
    }
  }, [customerId]);

  /**
   * Fetches payment and workshop data for a specific customer
   * @param {string} customerId - The ID of the customer
   */
  const fetchData = async (customerId) => {
    try {
      // Fetch payments for the customer
      const payments = await getPaymentsByCustomer(customerId);
      // Fetch workshop settings
      const workshopData = await getWorkshopSettings();

      // Extract customer and vehicle information from the first payment
      const customer =
        payments.length > 0 && payments[0].customer ? payments[0].customer : {};
      const vehicle =
        payments.length > 0 && payments[0].vehicle ? payments[0].vehicle : {};

      // Combine all data into a single object
      const data = {
        workshopData: workshopData, // Workshop information from the database
        customer: customer, // Customer information from the first payment
        vehicle: vehicle, // Vehicle information from the first payment
        payments: payments, // List of payments for the customer
      };

      console.log("PDF data:", data);
      setPdfData(data);
    } catch (error) {
      console.error("Error fetching PDF data for customer:", error);
    }
  };

  // Show loading message while data is being fetched
  if (!pdfData) {
    return <div>Loading PDF...</div>;
  }

  return (
    <PDFViewer width="100%" height="1000">
      <ClientPaymentPDF pdfData={pdfData} />
    </PDFViewer>
  );
};

export default ClientPaymentPDFViewer;