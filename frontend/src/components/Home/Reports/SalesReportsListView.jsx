/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Table, Alert, Button } from "react-bootstrap";
import { getAllSalesReports } from "../../../services/salesReportService";
import { Link } from "react-router-dom";

// SalesReportsListView component: displays a list of sales reports with their summary data,
// allows the user to view the PDF version of each report.
const SalesReportsListView = () => {
  // State to store the list of sales reports
  const [reports, setReports] = useState([]);
  // State to indicate whether data is being loaded
  const [loading, setLoading] = useState(true);
  // State to store any error messages during data fetching
  const [error, setError] = useState(null);

  // useEffect hook to fetch reports when the component mounts
  useEffect(() => {
    fetchReports();
  }, []);

  // fetchReports: Asynchronously fetches all sales reports from the server
  const fetchReports = async () => {
    try {
      // Call the service to get all sales reports
      const data = await getAllSalesReports();
      console.log("Reportes cargados:", data);
      // Update the reports state with the fetched data
      setReports(data);
      // Set loading to false after data is loaded
      setLoading(false);
    } catch (err) {
      console.error("Error fetching reports:", err);
      // Set error message from the error response or default message
      setError(
        err.response?.data?.message || err.message || "Error fetching reports"
      );
      // Set loading to false in case of error
      setLoading(false);
    }
  };

  // If data is still loading, display a loading message
  if (loading) {
    return <div>Loading reports...</div>;
  }

  // If an error occurred during data fetching, display the error message
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  // If no reports are found, display an informational message
  if (reports.length === 0) {
    return (
      <div className="container py-5">
        <h1>Sales Reports History</h1>
        <Alert variant="info">No reports stored.</Alert>
      </div>
    );
  }

  // Render the list of sales reports in a table format
  return (
    <div className="container py-5">
      <h1>Sales Reports History</h1>
      <Table striped bordered hover responsive>
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
            // Each row represents a single sales report
            <tr key={report.salesReportId}>
              <td>{report.salesReportId}</td>
              <td>
                {/* Display the report period by formatting start and end dates */}
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
                {/* Link to view the PDF version of the report */}
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
    </div>
  );
};

export default SalesReportsListView;
