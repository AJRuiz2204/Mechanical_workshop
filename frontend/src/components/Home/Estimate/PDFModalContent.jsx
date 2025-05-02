import { useState, useEffect } from "react";
import { PDFViewer } from "@react-pdf/renderer";
import { Spin } from "antd";
import EstimatePDF from "./EstimatePDF";
import { getEstimateById } from "../../../services/EstimateService";
import { getSettingsById } from "../../../services/laborTaxMarkupSettingsService";
import { getWorkshopSettings } from "../../../services/workshopSettingsService";
import PropTypes from "prop-types";

/**
 * PDFModalContent Component
 *
 * This component fetches the data for a given estimate and renders the PDF
 * using the EstimatePDF component inside a PDFViewer.
 *
 * @param {Object} props - Component props.
 * @param {number|string} props.estimateId - The ID of the estimate.
 * @returns {JSX.Element} The PDF viewer with the rendered EstimatePDF.
 */
const PDFModalContent = ({ estimateId }) => {
  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * useEffect: Fetches the data for the specified estimate.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [estimateData, cfg, workshopData] = await Promise.all([
          getEstimateById(estimateId),
          getSettingsById(1),
          getWorkshopSettings(),
        ]);

        // Build the items array for the PDF
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

        // Calculate totals similar to the logic in EstimatePDFViewer
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
        const totalCalc = partsTotal + laborTotal + othersTotal + taxParts + taxLabors;
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
          mileage: estimateData.mileage ?? estimateData.technicianDiagnostic?.mileage ?? 0,
        };

        setPdfData(payload);
      } catch (error) {
        console.error("Error fetching PDF data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [estimateId]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin tip="Loading PDF..." />
      </div>
    );
  }

  return (
    <PDFViewer width="100%" height="700">
      <EstimatePDF pdfData={pdfData} />
    </PDFViewer>
  );
};

PDFModalContent.propTypes = {
  estimateId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
};

export default PDFModalContent;
