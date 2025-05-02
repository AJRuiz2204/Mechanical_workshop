/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/components/Settings/SalesReportAllPreviewView.jsx

import React, { useState, useEffect } from "react";
import { Button, Table, Alert, Form, DatePicker, Typography } from "antd";
import dayjs from "dayjs";
import {
  getSalesReport,
  createSalesReport,
} from "../../../services/salesReportService";

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
 * - Ant Design for layout and styling.
 * - A sales report service for API interactions.
 *
 * Responsive Behavior:
 * - Uses Ant Design’s components to ensure the layout is optimized on all devices.
 * - Custom CSS adjusts paddings, font sizes, and spacing for extra-small devices.
 */

// Define Ant Design table columns
const columns = [
  {
    title: "Total Estimates",
    dataIndex: "totalEstimates",
    key: "totalEstimates",
    render: (v) => `$${Number(v).toFixed(2)}`,
  },
  {
    title: "Total Parts Revenue",
    dataIndex: "totalPartsRevenue",
    key: "totalPartsRevenue",
    render: (v) => `$${Number(v).toFixed(2)}`,
  },
  {
    title: "Total Labor Revenue",
    dataIndex: "totalLaborRevenue",
    key: "totalLaborRevenue",
    render: (v) => `$${Number(v).toFixed(2)}`,
  },
  {
    title: "Total Flat Fee Revenue",
    dataIndex: "totalFlatFeeRevenue",
    key: "totalFlatFeeRevenue",
    render: (v) => `$${Number(v).toFixed(2)}`,
  },
  {
    title: "Total Tax Collected",
    dataIndex: "totalTaxCollected",
    key: "totalTaxCollected",
    render: (v) => `$${Number(v).toFixed(2)}`,
  },
  {
    title: "Total Payments",
    dataIndex: "totalPaymentsCollected",
    key: "totalPaymentsCollected",
    render: (v) => `$${Number(v).toFixed(2)}`,
  },
  {
    title: "Total Outstanding",
    dataIndex: "totalOutstanding",
    key: "totalOutstanding",
    render: (v) => `$${Number(v).toFixed(2)}`,
  },
];

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
  if (error) return <Alert message={error} type="error" showIcon />;
  // Return null if there is no preview data available
  if (!preview) return null;

  return (
    <div className="sales-report-container-fluid">
      {/* Title */}
      <Typography.Title level={2} className="sales-report-title">
        Sales Report Preview
      </Typography.Title>
      {/* Date Filters Form */}
      <Form layout="vertical" className="sales-report-form">
        <Form.Item label="Start Date (optional)">
          <DatePicker
            format="YYYY-MM-DD"
            value={startDate ? dayjs(startDate) : null}
            onChange={(_, ds) => setStartDate(ds)}
          />
        </Form.Item>
        <Form.Item label="End Date" required>
          <DatePicker
            format="YYYY-MM-DD"
            value={endDate ? dayjs(endDate) : null}
            onChange={(_, ds) => setEndDate(ds)}
          />
        </Form.Item>
        <Button type="primary" onClick={fetchPreview}>
          Update Preview
        </Button>
      </Form>
      {/* Sales Report Summary Table */}
      <Table
        columns={columns}
        dataSource={[preview]}
        pagination={false}
        rowKey="salesReportId"
        className="mt-4"
      />
      {/* Save Report Button */}
      <Button type="primary" onClick={handleSave} className="mt-3">
        Save Report
      </Button>
      {/* Success Alert */}
      {success && (
        <Alert message={success} type="success" showIcon className="mt-3" />
      )}
    </div>
  );
};

export default SalesReportAllPreviewView;
