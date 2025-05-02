/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
// src/components/Settings/SalesReportsListView.jsx

import React, { useState, useEffect } from "react";
import { Table, Alert, Button, Form, DatePicker, Spin } from "antd";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import {
  getAllSalesReports,
  getSalesReport,
  createSalesReport,
} from "../../../services/salesReportService";

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
 * - Uses AntD’s responsive utilities and custom CSS to adjust
 *   layout and font sizes on smaller devices.
 */
const SalesReportAllPreviewView = ({ onSave }) => {
  // State for sales report preview data
  const [preview, setPreview] = useState(null);
  // Loading state for fetching the preview
  const [loading, setLoading] = useState(true);
  // Error and success messages
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  // Date filter states; endDate defaults to today
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(dayjs());

  // Fetch the preview when the component mounts
  useEffect(() => {
    fetchPreview();
  }, []);

  /**
   * fetchPreview Function
   *
   * Asynchronously fetches the sales report preview using the current
   * start and end dates. If a date is null, it passes null to the API.
   */
  const fetchPreview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSalesReport(
        startDate?.format("YYYY-MM-DD") || null,
        endDate?.format("YYYY-MM-DD") || null
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
      if (onSave) onSave(); // Refresh list on save
    } catch (err) {
      console.error("Error saving report:", err);
      setError(
        err.response?.data?.message || err.message || "Error saving report"
      );
    }
  };

  if (loading) return <Spin />;
  if (error) return <Alert message={error} type="error" showIcon />;
  if (!preview) return null;

  // Columns for preview table
  const previewColumns = [
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
  const previewData = [{ key: "preview", ...preview }];

  return (
    <div className="sales-report-preview container-fluid mt-5">
      <h2 className="sales-report-title">Sales Report Preview</h2>
      {/* Date Filters Form */}
      <Form layout="inline" className="sales-report-form mb-4">
        <Form.Item label="Start Date (optional)">
          <DatePicker
            value={startDate}
            onChange={(d) => setStartDate(d)}
            format="YYYY-MM-DD"
          />
        </Form.Item>
        <Form.Item label="End Date" required>
          <DatePicker
            value={endDate}
            onChange={(d) => setEndDate(d)}
            format="YYYY-MM-DD"
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={fetchPreview}>
            Update Preview
          </Button>
        </Form.Item>
      </Form>
      {/* Sales Report Summary Table */}
      <Table
        columns={previewColumns}
        dataSource={previewData}
        pagination={false}
        className="mt-4"
      />
      {/* Save Report Button */}
      <Button type="primary" onClick={handleSave} className="mt-3">
        Save Report
      </Button>
      {success && (
        <Alert message={success} type="success" showIcon className="mt-3" />
      )}
    </div>
  );
};

// add prop-types validation
SalesReportAllPreviewView.propTypes = {
  onSave: PropTypes.func,
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
 * - Uses AntD components for layout and styling.
 * - Provides a link to view each report as a PDF.
 *
 * Responsive Behavior:
 * - The table and container adjust using AntD’s responsive classes
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

  if (loading) return <Spin />;
  if (error) return <Alert message={error} type="error" showIcon />;

  // Columns for reports list table
  const reportColumns = [
    { title: "Report ID", dataIndex: "salesReportId", key: "salesReportId" },
    {
      title: "Period",
      key: "period",
      render: (_, record) =>
        `${dayjs(record.startDate).format("MM/DD/YYYY")} - ${dayjs(
          record.endDate
        ).format("MM/DD/YYYY")}`,
    },
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
      title: "Total Tax",
      dataIndex: "totalTaxCollected",
      key: "totalTaxCollected",
      render: (v) => `$${Number(v).toFixed(2)}`,
    },
    {
      title: "Total Paid",
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
    {
      title: "Creation Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (v) => dayjs(v).format("MM/DD/YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Link to={`/sales-report-pdf/${record.salesReportId}`}>
          <Button type="primary" size="small">
            View PDF
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="sales-reports-list container-fluid w-100 py-5">
      <h1 className="mb-4">Sales Reports History</h1>
      {/* Sales Report Preview Component */}
      <SalesReportAllPreviewView onSave={fetchReports} />
      {/* Reports List Table */}
      {reports.length === 0 ? (
        <Alert message="No reports stored." type="info" showIcon className="mt-5" />
      ) : (
        <Table
          columns={reportColumns}
          dataSource={reports.map((report) => ({ key: report.salesReportId, ...report }))}
          className="mt-5"
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  );
};

export default SalesReportsListView;
