/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/components/Settings/SalesReportsListView.jsx

import React, { useState, useEffect } from "react";
import { Table, Alert, Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  getAllSalesReports,
  getSalesReport,
  createSalesReport,
} from "../../../services/salesReportService";
import "./SalesReportsListView.css";

/**
 * SalesReportAllPreviewView Component
 *
 * Description:
 * This component displays a preview of the sales report.
 * It allows the user to filter the report by start and end dates,
 * displays a summary in a responsive table, and provides functionality
 * to save the report.
 *
 * Features:
 * - Fetches the sales report preview based on date filters.
 * - Displays a form for selecting start and end dates.
 * - Shows a summary table with key report metrics.
 * - Provides a button to save the report.
 * - Displays loading, error, and success messages.
 *
 * Responsive Behavior:
 * - Uses Bootstrap’s responsive utilities and custom CSS to adjust
 *   layout and font sizes on smaller devices.
 */
const SalesReportAllPreviewView = () => {
  // State for sales report preview data
  const [preview, setPreview] = useState(null);
  // Loading state for fetching the preview
  const [loading, setLoading] = useState(true);
  // Error and success messages
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  // Date filter states; endDate defaults to today
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().substring(0, 10)
  );

  // Fetch the preview when the component mounts
  useEffect(() => {
    fetchPreview();
  }, []);

  /**
   * fetchPreview Function
   *
   * Asynchronously fetches the sales report preview using the current
   * start and end dates. If a date is an empty string, it passes null to the API.
   */
  const fetchPreview = async () => {
    setLoading(true);
    setError(null);
    try {
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
   * Saves the current sales report preview as a finalized report.
   * Prepares the payload by excluding unnecessary properties and calls
   * the createSalesReport service.
   */
  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    try {
      // Exclude 'details' and 'salesReportId' from preview
      const { details, salesReportId, ...restPreview } = preview;
      // Prepare the report payload with an empty Details array
      const reportToSave = { ...restPreview, Details: [] };
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

  if (loading) return <div>Loading report preview...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!preview) return null;

  return (
    <div className="sales-report-preview mt-5">
      <h2 className="sales-report-title">Sales Report Preview</h2>
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
      {success && (
        <Alert variant="success" className="mt-3">
          {success}
        </Alert>
      )}
    </div>
  );
};

/**
 * SalesReportsListView Component
 *
 * Description:
 * This component displays the list of sales reports fetched from the backend.
 * It includes the SalesReportAllPreviewView component to show the preview and allow
 * saving of a new report, as well as a table listing all saved sales reports.
 *
 * Features:
 * - Fetches all sales reports on mount.
 * - Displays a responsive table of saved reports.
 * - Uses Bootstrap components for layout and styling.
 * - Provides a link to view each report as a PDF.
 *
 * Responsive Behavior:
 * - The table and container adjust using Bootstrap’s responsive classes
 *   and custom CSS for extra small devices.
 */
const SalesReportsListView = () => {
  // State to store the list of sales reports
  const [reports, setReports] = useState([]);
  // Loading and error states for fetching reports
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all sales reports on component mount
  useEffect(() => {
    fetchReports();
  }, []);

  /**
   * fetchReports Function
   *
   * Asynchronously fetches all sales reports from the backend.
   */
  const fetchReports = async () => {
    try {
      const data = await getAllSalesReports();
      console.log("Reports loaded:", data);
      setReports(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError(
        err.response?.data?.message || err.message || "Error fetching reports"
      );
      setLoading(false);
    }
  };

  if (loading) return <div>Loading reports...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="sales-reports-list container py-5">
      <h1 className="mb-4">Sales Reports History</h1>
      {/* Sales Report Preview Component */}
      <SalesReportAllPreviewView />
      {/* Reports List Table */}
      {reports.length === 0 ? (
        <Alert variant="info" className="mt-5">
          No reports stored.
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="mt-5">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Period</th>
              <th>Total Estimates</th>
              <th>Total Parts Revenue</th>
              <th>Total Labor Revenue</th>
              <th>Total Flat Fee Revenue</th>
              <th>Total Tax</th>
              <th>Total Paid</th>
              <th>Total Outstanding</th>
              <th>Creation Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.salesReportId}>
                <td>{report.salesReportId}</td>
                <td>
                  {new Date(report.startDate).toLocaleDateString()} -{" "}
                  {new Date(report.endDate).toLocaleDateString()}
                </td>
                <td>${Number(report.totalEstimates).toFixed(2)}</td>
                <td>${Number(report.totalPartsRevenue).toFixed(2)}</td>
                <td>${Number(report.totalLaborRevenue).toFixed(2)}</td>
                <td>${Number(report.totalFlatFeeRevenue).toFixed(2)}</td>
                <td>${Number(report.totalTaxCollected).toFixed(2)}</td>
                <td>${Number(report.totalPaymentsCollected).toFixed(2)}</td>
                <td>${Number(report.totalOutstanding).toFixed(2)}</td>
                <td>{new Date(report.createdDate).toLocaleDateString()}</td>
                <td>
                  <Link to={`/sales-report-pdf/${report.salesReportId}`}>
                    <Button variant="primary" size="sm">
                      View PDF
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default SalesReportsListView;
