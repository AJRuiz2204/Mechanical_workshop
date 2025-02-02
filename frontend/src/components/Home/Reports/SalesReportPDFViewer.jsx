/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import SalesReportPDF from "./SalesReportPDF";
import { useParams } from "react-router-dom";
import { getSalesReportById } from "../../../services/salesReportService";
import { getWorkshopSettings } from "../../../services/workshopSettingsService";

// SalesReportPDFViewer component: fetches a sales report by its ID and renders it
// in a PDFViewer using the SalesReportPDF component.
const SalesReportPDFViewer = () => {
  // Extract the salesReportId parameter from the URL.
  // The expected route format is: /sales-report-pdf/:salesReportId
  const { salesReportId } = useParams();
  
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

  // If the report data is not yet loaded, display a loading message.
  if (!reportData) {
    return <div>Loading Report...</div>;
  }

  // Render the PDFViewer with the SalesReportPDF component displaying the report.
  return (
    <PDFViewer width="100%" height="1000">
      <SalesReportPDF pdfData={reportData} />
    </PDFViewer>
  );
};

export default SalesReportPDFViewer;
