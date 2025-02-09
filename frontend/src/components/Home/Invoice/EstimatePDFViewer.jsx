/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { useParams } from "react-router-dom";
import EstimatePDF from "../Estimate/EstimatePDF";
import { getEstimateById } from "../../../services/EstimateService";
import { getSettingsById } from "../../../services/laborTaxMarkupSettingsService";
import { getWorkshopSettings } from "../../../services/workshopSettingsService";

/**
 * EstimatePDFViewer Component
 *
 * This component fetches all necessary data for an estimate and then
 * renders the EstimatePDF component inside a PDFViewer so that the user
 * can view, print, or download the PDF from the browser.
 *
 * @returns {JSX.Element} The PDF viewer for the Estimate.
 */
const EstimatePDFViewer = () => {
  const { id } = useParams(); // The estimate ID from URL parameters
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstimateData = async () => {
      try {
        // Fetch estimate data, settings, and workshop data in parallel
        const [estimateData, cfg, workshopData] = await Promise.all([
          getEstimateById(id),
          getSettingsById(1),
          getWorkshopSettings(),
        ]);

        // Build items array for the PDF
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

        // Calculate totals (adjust these calculations as needed)
        let partsTotal = 0,
          taxParts = 0,
          laborTotal = 0,
          taxLabors = 0,
          othersTotal = 0;
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

        // Build the payload for EstimatePDF
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
        console.error("Error fetching Estimate PDF data:", error);
        setLoading(false);
      }
    };

    fetchEstimateData();
  }, [id]);

  if (loading) {
    return <div>Loading PDF...</div>;
  }

  return (
    <PDFViewer width="100%" height="1000">
      <EstimatePDF pdfData={pdfData} />
    </PDFViewer>
  );
};

export default EstimatePDFViewer;
