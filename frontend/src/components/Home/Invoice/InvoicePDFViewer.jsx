/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { useParams } from "react-router-dom";
import InvoicePDF from "../Estimate/EstimatePDF";
import { getEstimateById } from "../../../services/EstimateService";
import { getSettingsById } from "../../../services/laborTaxMarkupSettingsService";
import { getWorkshopSettings } from "../../../services/workshopSettingsService";

/**
 * InvoicePDFViewer Component
 *
 * This component fetches the invoice data (derived from an estimate),
 * tax and markup settings, and workshop settings. It then builds a payload
 * and renders the InvoicePDF component inside a PDFViewer so that the PDF
 * is displayed in the browser, allowing the user to print or download it.
 *
 * @returns {JSX.Element} The PDF viewer for the invoice.
 */
const InvoicePDFViewer = () => {
  const { id } = useParams(); // Invoice/estimate ID from URL
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch estimate data (used as invoice data), tax settings, and workshop settings
        const [estimateData, cfg, workshopData] = await Promise.all([
          getEstimateById(id),
          getSettingsById(1),
          getWorkshopSettings(),
        ]);

        // Build the items array for the PDF from parts, labors, and flat fees
        const itemsForPDF = [
          ...estimateData.parts.map((p) => ({
            type: "Part",
            description: p.description,
            quantity: p.quantity,
            price: p.netPrice,
            listPrice: p.listPrice,
            extendedPrice: p.extendedPrice,
            taxable: p.taxable,
            partNumber: p.partNumber,
          })),
          ...estimateData.labors.map((l) => ({
            type: "Labor",
            description: l.description,
            quantity: l.duration,
            price: l.laborRate,
            listPrice: "", // Not applicable for labor
            extendedPrice: l.extendedPrice,
            taxable: l.taxable,
            partNumber: "",
          })),
          ...estimateData.flatFees.map((f) => ({
            type: "Flat Fee",
            description: f.description,
            quantity: "-", // Not applicable for flat fee
            price: f.flatFeePrice,
            listPrice: "", // Not applicable
            extendedPrice: f.extendedPrice,
            taxable: false,
            partNumber: "",
          })),
        ];

        // Calculate totals for parts, labors, and flat fees
        let partsTotal = 0;
        let taxParts = 0;
        let laborTotal = 0;
        let taxLabors = 0;
        let othersTotal = 0;
        estimateData.parts.forEach((p) => {
          const ext = parseFloat(p.extendedPrice) || 0;
          partsTotal += ext;
          if (p.taxable) {
            taxParts += ext * (parseFloat(cfg.partTaxRate) / 100);
          }
        });
        estimateData.labors.forEach((l) => {
          const ext = parseFloat(l.extendedPrice) || 0;
          laborTotal += ext;
          if (l.taxable) {
            taxLabors += ext * (parseFloat(cfg.laborTaxRate) / 100);
          }
        });
        estimateData.flatFees.forEach((f) => {
          othersTotal += parseFloat(f.extendedPrice) || 0;
        });
        const totalCalc =
          partsTotal + laborTotal + othersTotal + taxParts + taxLabors;
        const totals = {
          partsTotal,
          laborTotal,
          othersTotal,
          partsTax: taxParts,
          laborTax: taxLabors,
          total: totalCalc,
        };

        // Build the final payload for InvoicePDF
        const payload = {
          workshopData,
          vehicle: estimateData.vehicle,
          customer: estimateData.owner,
          items: itemsForPDF,
          totals,
          customerNote: estimateData.customerNote || "",
          mileage: estimateData.technicianDiagnostic?.mileage || 0,
        };

        setPdfData(payload);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching Invoice PDF data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div>Loading PDF...</div>;
  }

  return (
    <PDFViewer width="100%" height="1000">
      <InvoicePDF pdfData={pdfData} />
    </PDFViewer>
  );
};

export default InvoicePDFViewer;
