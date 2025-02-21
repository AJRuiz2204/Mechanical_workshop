/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/components/Settings/SalesReportAllPreviewView.jsx

import React, { useState, useEffect } from "react";
import { Button, Table, Alert, Form } from "react-bootstrap";
import {
  getSalesReport,
  createSalesReport,
} from "../../../services/salesReportService";
import "./SalesReportAllPreviewView.css";

/**
 * SalesReportAllPreviewView Component
 *
 * Description:
 * This component displays a preview of the sales report.
 * It allows filtering by start and end dates, displays a summary in a table,
 * and provides functionality to save the report.
 *
 * Features:
 * - Fetches a sales report preview from the backend based on the provided date filters.
 * - Displays a form for filtering the report by start and end dates.
 * - Shows the preview data in a responsive table.
 * - Allows the user to save the current preview as a finalized report.
 * - Displays loading, error, and success messages.
 *
 * Dependencies:
 * - React and React Hooks for state management.
 * - React Bootstrap for layout and styling.
 * - A sales report service for API interactions.
 *
 * Responsive Behavior:
 * - Uses Bootstrap’s breakpoints to ensure the layout is optimized on all devices.
 * - Custom CSS adjusts paddings, font sizes, and spacing for extra-small devices.
 */
const SalesReportAllPreviewView = () => {
  // State to store the sales report preview data
  const [preview, setPreview] = useState(null);
  // State to control loading status during data fetching
  const [loading, setLoading] = useState(true);
  // State to store any error messages
  const [error, setError] = useState(null);
  // State to store success messages when saving the report
  const [success, setSuccess] = useState(null);
  // State for date filters: startDate is optional, endDate defaults to today
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  /**
   * useEffect Hook
   *
   * Fetches the sales report preview when the component mounts.
   */
  useEffect(() => {
    fetchPreview();
  }, []);

  /**
   * fetchPreview Function
   *
   * Asynchronously fetches the sales report preview based on the current date filters.
   */
  const fetchPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call the getSalesReport service with date filters (null if empty)
      const data = await getSalesReport(
        startDate === "" ? null : startDate,
        endDate === "" ? null : endDate
      );
      console.log("Preview obtained:", data);
      setPreview(data);
    } catch (err) {
      console.error("Error getting preview:", err);
      setError(
        err.response?.data?.message || err.message || "Error getting preview"
      );
    }
    setLoading(false);
  };

  /**
   * handleSave Function
   *
   * Asynchronously saves the current sales report preview as a finalized report.
   */
  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    try {
      // Destructure preview to remove 'details' and 'salesReportId'
      const { details, salesReportId, ...restPreview } = preview;
      // Prepare the report payload with an empty Details array
      const reportToSave = { ...restPreview, Details: [] };

      // Call the createSalesReport service with the prepared payload
      const savedReport = await createSalesReport(reportToSave);
      console.log("Report saved:", savedReport);
      setSuccess("Report saved successfully.");
    } catch (err) {
      console.error("Error saving report:", err);
      setError(
        err.response?.data?.message || err.message || "Error saving report"
      );
    }
  };

  // Render a loading message while data is being fetched
  if (loading) return <div>Loading report preview...</div>;
  // Render an error alert if an error occurs
  if (error) return <Alert variant="danger">{error}</Alert>;
  // Return null if there is no preview data available
  if (!preview) return null;

  return (
    <div className="container-fluid sales-report-container-fluid">
      {/* Title */}
      <h1 className="sales-report-title">Sales Report Preview</h1>
      {/* Date Filters Form */}
      <Form className="sales-report-form mb-4">
        <Form.Group controlId="startDate" className="mb-3">
          <Form.Label>Start Date (optional)</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="endDate" className="mb-3">
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </Form.Group>
        <Button variant="primary" onClick={fetchPreview}>
          Update Preview
        </Button>
      </Form>
      {/* Sales Report Summary Table */}
      <Table striped bordered hover responsive className="mt-4">
        <thead>
          <tr>
            <th>Total Estimates</th>
            <th>Total Parts Revenue</th>
            <th>Total Labor Revenue</th>
            <th>Total Flat Fee Revenue</th>
            <th>Total Tax Collected</th>
            <th>Total Payments</th>
            <th>Total Outstanding</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${Number(preview.totalEstimates).toFixed(2)}</td>
            <td>${Number(preview.totalPartsRevenue).toFixed(2)}</td>
            <td>${Number(preview.totalLaborRevenue).toFixed(2)}</td>
            <td>${Number(preview.totalFlatFeeRevenue).toFixed(2)}</td>
            <td>${Number(preview.totalTaxCollected).toFixed(2)}</td>
            <td>${Number(preview.totalPaymentsCollected).toFixed(2)}</td>
            <td>${Number(preview.totalOutstanding).toFixed(2)}</td>
          </tr>
        </tbody>
      </Table>
      {/* Save Report Button */}
      <Button variant="success" onClick={handleSave} className="mt-3">
        Save Report
      </Button>
      {/* Success Alert */}
      {success && (
        <Alert variant="success" className="mt-3">
          {success}
        </Alert>
      )}
    </div>
  );
};

export default SalesReportAllPreviewView;
