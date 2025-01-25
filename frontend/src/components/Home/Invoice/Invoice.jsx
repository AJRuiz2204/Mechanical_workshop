/* eslint-disable no-unused-vars */
// Frontend: src/components/Invoice/Invoice.jsx

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Table,
  Alert,
  Button,
  Spinner,
} from "react-bootstrap";
import { getEstimateById } from "../../../services/EstimateService";
import { getSettingsById } from "../../../services/laborTaxMarkupSettingsService";
import { getWorkshopSettings } from "../../../services/workshopSettingsService";
import { PDFDownloadLink } from "@react-pdf/renderer";
import EstimatePDF from "../Estimate/EstimatePDF";

/**
 * Invoice Component
 * 
 * This component fetches invoice data based on the provided ID,
 * calculates totals, and allows the user to download the invoice as a PDF.
 *
 * @returns {JSX.Element} The Invoice component.
 */
const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // States to manage loading and errors
  const [loading, setLoading] = useState(true);
  const [loadingWorkshop, setLoadingWorkshop] = useState(true);
  const [error, setError] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [settings, setSettings] = useState(null);
  const [workshopSettings, setWorkshopSettings] = useState(null);
  const [techDiagnostic, setTechDiagnostic] = useState(null);

  // States for totals
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

  // State for PDF download
  const [generatedPdfData, setGeneratedPdfData] = useState(null);
  const pdfContainerRef = useRef(null);

  /**
   * Fetches data when the component mounts.
   * Retrieves estimate data, settings, and workshop settings in parallel.
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
        console.log("Received estimate from backend:", estimateData);
        console.log("Owner Info:", estimateData.owner);
        console.log("Vehicle Info:", estimateData.vehicle);
        
        // Asignar techDiagnostic directamente desde estimateData
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
   * Calculates totals whenever estimate or settings change.
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
   * Handles the PDF download by preparing the necessary data.
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
        listPrice: "", // Labor does not have listPrice
        extendedPrice: l.extendedPrice,
        taxable: l.taxable,
        partNumber: "",
      })),
      ...estimate.flatFees.map((f) => ({
        type: "Flat Fee",
        description: f.description,
        quantity: "-", // Flat Fee does not have quantity
        price: f.flatFeePrice,
        listPrice: "", // Flat Fee does not have listPrice
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
      mileage: techDiagnostic?.mileage || 0, // Agregar mileage al payload
    };
    setGeneratedPdfData(payload);
  };

  /**
   * Automatically initiates the PDF download when PDF data is generated.
   */
  useEffect(() => {
    if (generatedPdfData && pdfContainerRef.current) {
      const linkElement = pdfContainerRef.current.querySelector("a");
      if (linkElement) {
        linkElement.click();
      }
    }
  }, [generatedPdfData]);

  // Show loading spinner while data is being fetched
  if (loading || loadingWorkshop) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Invoice...</span>
        </Spinner>
      </Container>
    );
  }

  // Display error message if there is an error
  if (error) {
    return (
      <Container className="p-4 border rounded">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  // Display warning if no estimate data is found
  if (!estimate) {
    return (
      <Container className="p-4 border rounded">
        <Alert variant="warning">No invoice data found.</Alert>
      </Container>
    );
  }

  const owner = estimate.owner || {};
  const vehicle = estimate.vehicle || {};
  const parts = estimate.parts || [];
  const labors = estimate.labors || [];
  const flatFees = estimate.flatFees || [];

  return (
    <Container className="p-4 border rounded">
      <h3>Invoice</h3>
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

      <Table striped bordered>
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

      <div className="text-end mb-4">
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Tax: ${tax.toFixed(2)}</p>
        <h5>Total: ${total.toFixed(2)}</h5>
      </div>

      <div className="text-end">
        <Button variant="success" onClick={handleDownloadPDF} className="me-2">
          Download PDF
        </Button>
        <Button variant="secondary" onClick={() => navigate("/estimates")}>
          Back
        </Button>
      </div>

      {/* Hidden element to initiate download automatically */}
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
