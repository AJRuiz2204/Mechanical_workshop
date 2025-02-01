/* eslint-disable no-unused-vars */
// src/components/Home/Payment/ClientPaymentPDFViewer.jsx
import React, { useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import ClientPaymentPDF from "./ClientPaymentPDF";
import { getPaymentsByCustomer } from "../../../services/accountReceivableService";
import { getWorkshopSettings } from "../../../services/workshopSettingsService";
import { useParams } from "react-router-dom";

const ClientPaymentPDFViewer = () => {
  const { customerId } = useParams(); // Ruta: /client-payment-pdf/:customerId
  const [pdfData, setPdfData] = useState(null);

  useEffect(() => {
    if (customerId) {
      fetchData(customerId);
    }
  }, [customerId]);

  const fetchData = async (customerId) => {
    try {
      // Obtener los pagos de ese cliente
      const payments = await getPaymentsByCustomer(customerId);
      // Obtener la información del taller (workshop settings)
      const workshopData = await getWorkshopSettings();

      // Suponiendo que el primer pago contiene la información del cliente y vehículo:
      const customer =
        payments.length > 0 && payments[0].customer ? payments[0].customer : {};
      const vehicle =
        payments.length > 0 && payments[0].vehicle ? payments[0].vehicle : {};

      // Combina la información en un único objeto
      const data = {
        workshopData: workshopData, // Información del taller guardada en la DB
        customer: customer, // Información del cliente obtenida del primer pago
        vehicle: vehicle, // Información del vehículo obtenida del primer pago
        payments: payments, // Lista de pagos de ese cliente
      };

      console.log("PDF data:", data);
      setPdfData(data);
    } catch (error) {
      console.error("Error fetching PDF data for customer:", error);
    }
  };

  if (!pdfData) {
    return <div>Cargando PDF...</div>;
  }

  return (
    <PDFViewer width="100%" height="1000">
      <ClientPaymentPDF pdfData={pdfData} />
    </PDFViewer>
  );
};

export default ClientPaymentPDFViewer;
