/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import SalesReportPDF from "./SalesReportPDF";
import { useParams } from "react-router-dom";
import { getSalesReportById } from "../../../services/salesReportService";

const SalesReportPDFViewer = () => {
  const { salesReportId } = useParams(); // Se espera que la ruta sea: /sales-report-pdf/:salesReportId
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (salesReportId) {
      fetchReport(salesReportId);
    }
  }, [salesReportId]);

  const fetchReport = async (id) => {
    try {
      const data = await getSalesReportById(id);
      setReportData(data);
    } catch (error) {
      console.error("Error fetching sales report:", error);
    }
  };

  if (!reportData) {
    return <div>Cargando Reporte...</div>;
  }

  return (
    <PDFViewer width="100%" height="1000">
      <SalesReportPDF pdfData={reportData} />
    </PDFViewer>
  );
};

export default SalesReportPDFViewer;
