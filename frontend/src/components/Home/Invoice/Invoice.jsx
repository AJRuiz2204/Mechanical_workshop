/* eslint-disable no-unused-vars */
// Frontend: src/components/Invoice/Invoice.jsx

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Table,
  Alert,
  Button,
  Spinner,
} from "react-bootstrap";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { getEstimateById } from "../../../services/EstimateService";
import { getSettingsById } from "../../../services/laborTaxMarkupSettingsService";
import { getWorkshopSettings } from "../../../services/workshopSettingsService";
import EstimatePDF from "../Estimate/EstimatePDF";
import "./Invoice.css";

/**
 * Invoice Component
 *
 * This component fetches invoice data based on the provided ID,
 * calculates totals, and allows the user to download the invoice as a PDF.
 *
 * The component:
 * - Retrieves estimate data, tax settings, and workshop settings in parallel.
 * - Calculates totals for parts, labors, and flat fees (including tax).
 * - Prepares payload data for PDF generation and automatically initiates a download.
 * - Provides navigation back to the Estimates page.
 *
 * Responsive Behavior:
 * - Uses Bootstrap’s grid and utility classes.
 * - Custom CSS (Invoice.css) applies a blue color palette and adjusts spacing,
 *   fonts, and layout based on device breakpoints.
 *
 * @returns {JSX.Element} The Invoice component.
 */
const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State declarations for loading, errors, and fetched data
  const [loading, setLoading] = useState(true);
  const [loadingWorkshop, setLoadingWorkshop] = useState(true);
  const [error, setError] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [settings, setSettings] = useState(null);
  const [workshopSettings, setWorkshopSettings] = useState(null);
  const [techDiagnostic, setTechDiagnostic] = useState(null);

  // States for calculated totals
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [pdfTotals, setPdfTotals] = useState({
    partsTotal: 0,
    laborTotal: 0,
    othersTotal: 0,
    partsTax: 0,
    laborTax: 0,
    total: 0,
  });

  // States for PDF download
  const [generatedPdfData, setGeneratedPdfData] = useState(null);
  const pdfContainerRef = useRef(null);

  /**
   * useEffect Hook
   *
   * Fetches necessary data when the component mounts:
   * - Estimate data by ID
   * - Tax settings (via getSettingsById)
   * - Workshop settings
   *
   * If technicianDiagnostic data is available in the estimate, it is stored.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [estimateData, cfg, shopData] = await Promise.all([
          getEstimateById(id),
          getSettingsById(1),
          getWorkshopSettings(),
        ]);
        setEstimate(estimateData);
        setSettings(cfg);
        setWorkshopSettings(shopData);
        console.log("Received estimate:", estimateData);
        if (estimateData.technicianDiagnostic) {
          setTechDiagnostic(estimateData.technicianDiagnostic);
        }
      } catch (err) {
        setError(`Error fetching data: ${err.message}`);
      } finally {
        setLoading(false);
        setLoadingWorkshop(false);
      }
    };
    fetchData();
  }, [id]);

  /**
   * useEffect Hook
   *
   * Calculates invoice totals whenever the estimate or settings change.
   * Totals are calculated for parts, labors, and flat fees, including applicable taxes.
   */
  useEffect(() => {
    if (!estimate || !settings) return;

    let partsTotal = 0;
    let taxParts = 0;
    let laborTotal = 0;
    let taxLabors = 0;
    let othersTotal = 0;

    // Calculate totals for parts
    estimate.parts.forEach((part) => {
      const partExt = parseFloat(part.extendedPrice) || 0;
      partsTotal += partExt;
      if (part.taxable) {
        taxParts += partExt * (parseFloat(settings.partTaxRate) / 100);
      }
    });

    // Calculate totals for labors
    estimate.labors.forEach((labor) => {
      const laborExt = parseFloat(labor.extendedPrice) || 0;
      laborTotal += laborExt;
      if (labor.taxable) {
        taxLabors += laborExt * (parseFloat(settings.laborTaxRate) / 100);
      }
    });

    // Calculate totals for flat fees
    estimate.flatFees.forEach((fee) => {
      othersTotal += parseFloat(fee.extendedPrice) || 0;
    });

    const totalCalc =
      partsTotal + laborTotal + othersTotal + taxParts + taxLabors;

    setPdfTotals({
      partsTotal,
      laborTotal,
      othersTotal,
      partsTax: taxParts,
      laborTax: taxLabors,
      total: totalCalc,
    });

    setSubtotal(partsTotal + laborTotal + othersTotal);
    setTax(taxParts + taxLabors);
    setTotal(totalCalc);
  }, [estimate, settings]);

  /**
   * handleDownloadPDF Function
   *
   * Prepares the data payload required for generating a PDF invoice.
   * Verifies that all necessary data (workshop settings, vehicle, owner) is available.
   * Once the payload is prepared, it is stored in state to trigger automatic download.
   */
  const handleDownloadPDF = () => {
    if (!workshopSettings || !estimate.vehicle || !estimate.owner) {
      setError("Missing necessary data to generate PDF.");
      return;
    }

    const itemsForPDF = [
      ...estimate.parts.map((p) => ({
        type: "Part",
        description: p.description,
        quantity: p.quantity,
        price: p.netPrice,
        listPrice: p.listPrice,
        extendedPrice: p.extendedPrice,
        taxable: p.taxable,
        partNumber: p.partNumber,
      })),
      ...estimate.labors.map((l) => ({
        type: "Labor",
        description: l.description,
        quantity: l.duration,
        price: l.laborRate,
        listPrice: "", // Not applicable for labor
        extendedPrice: l.extendedPrice,
        taxable: l.taxable,
        partNumber: "",
      })),
      ...estimate.flatFees.map((f) => ({
        type: "Flat Fee",
        description: f.description,
        quantity: "-", // Not applicable for flat fee
        price: f.flatFeePrice,
        listPrice: "",
        extendedPrice: f.extendedPrice,
        taxable: false,
        partNumber: "",
      })),
    ];

    const payload = {
      workshopData: workshopSettings,
      vehicle: estimate.vehicle,
      customer: estimate.owner,
      items: itemsForPDF,
      totals: pdfTotals,
      customerNote: estimate.customerNote || "",
      mileage: techDiagnostic?.mileage || 0,
    };
    setGeneratedPdfData(payload);
  };

  /**
   * useEffect Hook
   *
   * When generatedPdfData is available, automatically trigger the PDF download
   * by programmatically clicking the hidden download link.
   */
  useEffect(() => {
    if (generatedPdfData && pdfContainerRef.current) {
      const linkElement = pdfContainerRef.current.querySelector("a");
      if (linkElement) {
        linkElement.click();
      }
    }
  }, [generatedPdfData]);

  // Render a loading spinner while data is being fetched
  if (loading || loadingWorkshop) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center invoice-loading"
        style={{ height: "80vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Invoice...</span>
        </Spinner>
      </Container>
    );
  }

  // Render error alert if an error occurred
  if (error) {
    return (
      <Container className="p-4 border rounded invoice-error">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // If no estimate data is available, display a warning message
  if (!estimate) {
    return (
      <Container className="p-4 border rounded invoice-warning">
        <Alert variant="warning">No invoice data found.</Alert>
      </Container>
    );
  }

  // Destructure data for easier access
  const owner = estimate.owner || {};
  const vehicle = estimate.vehicle || {};
  const parts = estimate.parts || [];
  const labors = estimate.labors || [];
  const flatFees = estimate.flatFees || [];

  return (
    <Container className="p-4 border rounded invoice-container">
      <h3 className="invoice-title">Invoice</h3>
      <Row className="mb-4">
        <Col md={8}>
          <strong>Customer:</strong>
          <p>
            {owner.name} {owner.lastName}
            <br />
            {owner.email || ""}
            <br />
            {owner.primaryNumber || ""}
            <br />
            {owner.secondaryNumber || ""}
          </p>
          <strong>Vehicle:</strong>
          <p>
            {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.engine})
            <br />
            VIN: {vehicle.vin}
          </p>
          <strong>Mileage:</strong>
          <p>{techDiagnostic?.mileage || ""}</p>
        </Col>
      </Row>

      <Table striped bordered hover responsive className="invoice-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Description</th>
            <th>Part# / Hours</th>
            <th>Net / Rate</th>
            <th>Quantity</th>
            <th>List Price</th>
            <th>Extended Price</th>
            <th>Taxable</th>
          </tr>
        </thead>
        <tbody>
          {parts.length === 0 &&
          labors.length === 0 &&
          flatFees.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center">
                No items
              </td>
            </tr>
          ) : (
            <>
              {parts.map((p, idx) => (
                <tr key={`p-${idx}`}>
                  <td>{p.type}</td>
                  <td>{p.description}</td>
                  <td>
                    {p.partNumber} (QTY: {p.quantity})
                  </td>
                  <td>${parseFloat(p.netPrice).toFixed(2)}</td>
                  <td>{p.quantity}</td>
                  <td>${parseFloat(p.listPrice).toFixed(2)}</td>
                  <td>${parseFloat(p.extendedPrice).toFixed(2)}</td>
                  <td>{p.taxable ? "Yes" : "No"}</td>
                </tr>
              ))}
              {labors.map((l, idx) => (
                <tr key={`l-${idx}`}>
                  <td>{l.type}</td>
                  <td>{l.description}</td>
                  <td>{l.duration} hrs</td>
                  <td>${parseFloat(l.laborRate).toFixed(2)}</td>
                  <td>{l.duration}</td>
                  <td>-</td>
                  <td>${parseFloat(l.extendedPrice).toFixed(2)}</td>
                  <td>{l.taxable ? "Yes" : "No"}</td>
                </tr>
              ))}
              {flatFees.map((f, idx) => (
                <tr key={`f-${idx}`}>
                  <td>{f.type}</td>
                  <td>{f.description}</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>${parseFloat(f.extendedPrice).toFixed(2)}</td>
                  <td>No</td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </Table>

      <div className="text-end mb-4 invoice-totals">
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Tax: ${tax.toFixed(2)}</p>
        <h5>Total: ${total.toFixed(2)}</h5>
      </div>

      <div className="text-end invoice-actions">
        <Button variant="success" onClick={handleDownloadPDF} className="me-2">
          Download PDF
        </Button>
        <Button variant="secondary" onClick={() => navigate("/estimates")}>
          Back
        </Button>
      </div>

      {/* Hidden container to trigger PDF download automatically */}
      <div style={{ display: "none" }} ref={pdfContainerRef}>
        {generatedPdfData && (
          <PDFDownloadLink
            document={<EstimatePDF pdfData={generatedPdfData} />}
            fileName={`Invoice_${id}.pdf`}
          >
            {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
          </PDFDownloadLink>
        )}
      </div>
    </Container>
  );
};

export default Invoice;
