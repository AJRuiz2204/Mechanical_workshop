/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Button, Table, Alert, Form } from "react-bootstrap";
import {
  getSalesReport,
  createSalesReport,
} from "../../../services/salesReportService";

// SalesReportAllPreviewView component: Displays a preview of the sales report,
// allows filtering by start and end dates, and provides functionality to save the report.
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

  // useEffect to fetch the sales report preview when the component mounts
  useEffect(() => {
    fetchPreview();
  }, []);

  // fetchPreview: Asynchronously fetches the sales report preview based on the start and end dates
  const fetchPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      // Call the getSalesReport service with the provided date filters
      const data = await getSalesReport(
        startDate === "" ? null : startDate,
        endDate === "" ? null : endDate
      );
      console.log("Preview obtained:", data);
      // Update the preview state with the fetched data
      setPreview(data);
    } catch (err) {
      console.error("Error getting preview:", err);
      // Set error state with a message from the error response or a default message
      setError(
        err.response?.data?.message || err.message || "Error getting preview"
      );
    }
    setLoading(false);
  };

  // handleSave: Asynchronously saves the current sales report preview as a finalized report
  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    try {
      // Destructure the preview to remove 'details' and 'salesReportId', keeping the summary
      const { details, salesReportId, ...restPreview } = preview;
      // Prepare the report payload by including an empty 'Details' array
      const reportToSave = { ...restPreview, Details: [] };

      // Call the createSalesReport service with the prepared payload
      const savedReport = await createSalesReport(reportToSave);
      console.log("Report saved:", savedReport);
      // Set a success message upon successful save
      setSuccess("Report saved successfully.");
    } catch (err) {
      console.error("Error saving report:", err);
      // Set error state with a message from the error response or a default message
      setError(
        err.response?.data?.message || err.message || "Error saving report"
      );
    }
  };

  // Render loading message while fetching data
  if (loading) return <div>Loading report preview...</div>;
  // Render error message if there is an error
  if (error) return <Alert variant="danger">{error}</Alert>;
  // Return null if preview data is not available
  if (!preview) return null;

  return (
    <div className="container py-5">
      {/* Title of the Sales Report Preview View */}
      <h1>Sales Report Preview</h1>
      {/* Form to filter the report by start and end dates */}
      <Form className="mb-4">
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
        {/* Button to refresh the preview with the current date filters */}
        <Button variant="primary" onClick={fetchPreview}>
          Update Preview
        </Button>
      </Form>

      {/* Table displaying the summary of the sales report preview */}
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
      {/* Button to save the report */}
      <Button variant="success" onClick={handleSave} className="mt-3">
        Save Report
      </Button>
      {/* Display success message if the report was saved successfully */}
      {success && (
        <Alert variant="success" className="mt-3">
          {success}
        </Alert>
      )}
    </div>
  );
};

export default SalesReportAllPreviewView;
