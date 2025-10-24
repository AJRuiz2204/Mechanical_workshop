/* eslint-disable no-unused-vars */
// src/components/Home/Accounting/AccountPaymentPDFViewer.jsx

/**
 * Component for displaying a PDF viewer with account payment information
 * Uses specific account endpoint to avoid mixing data from different accounts
 * @module AccountPaymentPDFViewer
 */

import React, { useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import ClientPaymentPDF from "./ClientPaymentPDF";
import { getAccountReceivableById } from "../../../services/accountReceivableService";
import { getWorkshopSettings } from "../../../services/workshopSettingsService";
import { useParams } from "react-router-dom";

/**
 * Main component for rendering a PDF viewer with account payment details
 * @returns {JSX.Element} PDF viewer component
 */
const AccountPaymentPDFViewer = () => {
  const { accountId } = useParams(); // Ruta: /account-payment-pdf/:accountId
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches account and workshop data when the component mounts or accountId changes
   */
  useEffect(() => {
    if (accountId) {
      fetchData(accountId);
    }
  }, [accountId]);

  /**
   * Fetches account and workshop data for a specific account
   * @param {string} accountId - The ID of the account
   */
  const fetchData = async (accountId) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all required data in parallel
      const [accountData, workshopData] = await Promise.all([
        getAccountReceivableById(accountId),
        getWorkshopSettings()
      ]);

      console.log("Account data received:", accountData);

      // Extract information from the account data structure
      const customer = accountData.customer || {};
      const vehicle = accountData.vehicle || {};
      const payments = accountData.payments || [];

      // Sort payments by payment date (most recent first) as additional safety
      const sortedPayments = [...payments].sort((a, b) => {
        const dateA = new Date(a.paymentDate);
        const dateB = new Date(b.paymentDate);
        return dateB - dateA; // Descending order (most recent first)
      });

      const data = {
        workshopData: workshopData,
        customer: customer,
        vehicle: vehicle,
        payments: sortedPayments,
        account: {
          id: accountData.id,
          originalAmount: accountData.originalAmount,
          balance: accountData.balance,
          status: accountData.status,
          createdDate: accountData.createdDate
        }
      };

      console.log("Processed PDF data:", data);
      setPdfData(data);
    } catch (error) {
      console.error("Error fetching PDF data for account:", error);
      setError(error.message || "Error loading account data");
    } finally {
      setLoading(false);
    }
  };

  // Show loading message while data is being fetched
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading Account Payment PDF...
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#ff4d4f',
        flexDirection: 'column'
      }}>
        <div>Error loading PDF: {error}</div>
        <div style={{ fontSize: '14px', marginTop: '10px', color: '#999' }}>
          Account ID: {accountId}
        </div>
      </div>
    );
  }

  // Show message if no data
  if (!pdfData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#999'
      }}>
        No data available for this account
      </div>
    );
  }

  return (
    <PDFViewer width="100%" height="1000">
      <ClientPaymentPDF pdfData={pdfData} />
    </PDFViewer>
  );
};

export default AccountPaymentPDFViewer;