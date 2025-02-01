/* eslint-disable no-unused-vars */
// src/components/Home/Payment/PaymentPDFViewer.jsx
import React, { useEffect, useState } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import PaymentPDF from "./PaymentPDF";
import { getAllPayments } from "../../../services/accountReceivableService";

const PaymentPDFViewer = () => {
  const [pdfData, setPdfData] = useState(null);

  useEffect(() => {
    // Aquí podrías llamar a una API para obtener todos los datos necesarios (workshopData, customer, payments)
    // Para este ejemplo, supongamos que usamos getAllPayments y definimos datos de taller y cliente fijos.
    const fetchData = async () => {
      try {
        const payments = await getAllPayments();
        const data = {
          workshopData: {
            workshopName: "Mi Taller Mecánico",
            address: "Calle Falsa 123",
            primaryPhone: "(100) 000-0000",
            email: "contacto@mitaller.com",
            quoteNumber: "001",
            lastUpdated: "2025-02-01T12:00:00Z",
            expiryDate: "2025-03-01",
            disclaimer: "Este es un recibo de pagos.",
          },
          customer: {
            fullName: "Juan Pérez",
            email: "juanperez@example.com",
            primaryPhone: "(200) 123-4567",
          },
          payments: payments,
        };
        setPdfData(data);
      } catch (error) {
        console.error("Error fetching PDF data:", error);
      }
    };
    fetchData();
  }, []);

  if (!pdfData) {
    return <div>Cargando PDF...</div>;
  }

  return (
    <PDFViewer width="100%" height="1000">
      <PaymentPDF pdfData={pdfData} />
    </PDFViewer>
  );
};

export default PaymentPDFViewer;
