/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import SalesReportPDF from "./SalesReportPDF";
import { useParams, useNavigate } from "react-router-dom";
import { getSalesReportById } from "../../../services/salesReportService";
import { getWorkshopSettings } from "../../../services/workshopSettingsService";
import { Spin, Card, Button, Space, Typography } from "antd";
import { ArrowLeftOutlined, CloseOutlined } from "@ant-design/icons";

// SalesReportPDFViewer component: fetches a sales report by its ID and renders it
// in a PDFViewer using the SalesReportPDF component.
const SalesReportPDFViewer = () => {
  // Extract the salesReportId parameter from the URL.
  // The expected route format is: /sales-report-pdf/:salesReportId
  const { salesReportId } = useParams();
  const navigate = useNavigate();
  
  // State to store the fetched report data.
  const [reportData, setReportData] = useState(null);

  // useEffect hook to fetch the report data when the salesReportId changes.
  useEffect(() => {
    if (salesReportId) {
      fetchReport(salesReportId);
    }
  }, [salesReportId]);

  // fetchReport: Asynchronously fetches the sales report data by its ID.
  const fetchReport = async (id) => {
    try {
      const [data, workshopData] = await Promise.all([
        getSalesReportById(id),
        getWorkshopSettings()
      ]);
      
      setReportData({
        ...data,
        workshopData: workshopData
      });
    } catch (error) {
      console.error("Error fetching sales report:", error);
    }
  };

  // Handle back navigation
  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Handle close and navigate to reports list
  const handleClose = () => {
    navigate('/reports'); // Navigate to reports list (adjust path as needed)
  };

  // If the report data is not yet loaded, display a loading message.
  if (!reportData) {
    return (
      <div style={{ textAlign: "center", paddingTop: 50 }}>
        <Spin tip="Loading report..." size="large" />
      </div>
    );
  }

  // Render the PDFViewer with the SalesReportPDF component displaying the report.
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header with navigation buttons */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid #f0f0f0",
          backgroundColor: "#fafafa",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          
        }}
      >
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleGoBack}
          >
            Volver
          </Button>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Reporte de Ventas
          </Typography.Title>
        </Space>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleClose}
          danger
        >
          Cerrar
        </Button>
      </div>

      {/* PDF Viewer */}
      <Card bodyStyle={{ height: "calc(100vh - 80px)", padding: 0 }}>
        <PDFViewer width="100%" height="100%">
          <SalesReportPDF pdfData={reportData} />
        </PDFViewer>
      </Card>
    </div>
  );
};

export default SalesReportPDFViewer;
