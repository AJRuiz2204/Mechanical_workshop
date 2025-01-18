/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Table, Alert, Button, Spinner } from "react-bootstrap";
import { getEstimateById } from "../../../services/EstimateService";
import { PDFDownloadLink } from "@react-pdf/renderer";
import EstimatePDF from "../Estimate/EstimatePDF"; // Ajusta la ruta si es necesario

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        const data = await getEstimateById(id);
        setEstimate(data);
      } catch (err) {
        setError(`Error fetching Estimate/Invoice data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchEstimate();
  }, [id]);

  useEffect(() => {
    if (!estimate) return;
    let calculatedSubtotal = 0;
    let calculatedTax = 0;
    let calculatedTotal = 0;
    if (estimate.subtotal) calculatedSubtotal = estimate.subtotal;
    if (estimate.tax) calculatedTax = estimate.tax;
    if (estimate.total) calculatedTotal = estimate.total;
    setSubtotal(calculatedSubtotal);
    setTax(calculatedTax);
    setTotal(calculatedTotal);
  }, [estimate]);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Invoice...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="p-4 border rounded">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

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

  const combinedItems = [
    ...parts.map((p) => ({
      type: "Part",
      description: p.description,
      detail: p.partNumber || "",
      qty: p.quantity,
      price: p.netPrice,
      total: p.extendedPrice,
      taxable: p.taxable,
    })),
    ...labors.map((l) => ({
      type: "Labor",
      description: l.description,
      detail: `${l.duration} hrs`,
      qty: l.duration,
      price: l.laborRate,
      total: l.extendedPrice,
      taxable: l.taxable,
    })),
    ...flatFees.map((f) => ({
      type: "Flat Fee",
      description: f.description,
      detail: "",
      qty: "",
      price: f.flatFeePrice,
      total: f.extendedPrice,
      taxable: false,
    })),
  ];

  return (
    <Container className="p-4 border rounded">
      <h3>Invoice</h3>
      <Row className="mb-4">
        <Col md={8}>
          <strong>Customer:</strong>
          <p>
            {owner.name} {owner.lastName} <br />
            {owner.email || ""}
          </p>
          <strong>Vehicle:</strong>
          <p>
            {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.engine})
            <br />
            VIN: {vehicle.vin}
          </p>
        </Col>
      </Row>

      <Table striped bordered>
        <thead>
          <tr>
            <th>Item</th>
            <th>Description</th>
            <th>Detail</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
            <th>Taxable</th>
          </tr>
        </thead>
        <tbody>
          {combinedItems.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No items
              </td>
            </tr>
          ) : (
            combinedItems.map((item, idx) => (
              <tr key={idx}>
                <td>{item.type}</td>
                <td>{item.description}</td>
                <td>{item.detail || "-"}</td>
                <td>{item.qty || "-"}</td>
                <td>${item.price ? item.price.toFixed(2) : "0.00"}</td>
                <td>${item.total ? item.total.toFixed(2) : "0.00"}</td>
                <td>
                  {item.taxable ? <span>Yes</span> : <span>No</span>}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      <div className="text-end mb-4">
        <p>Subtotal: ${subtotal.toFixed(2)}</p>
        <p>Tax: ${tax.toFixed(2)}</p>
        <h5>Total: ${total.toFixed(2)}</h5>
      </div>

      <div className="text-end">
        {estimate.vehicle && estimate.owner ? (
          <PDFDownloadLink
            document={
              <EstimatePDF
                workshopData={{}}
                vehicle={vehicle}
                customer={owner}
                items={combinedItems.map((i) => ({
                  type: i.type,
                  description: i.description,
                  quantity: i.qty,
                  price: i.price,
                  extended: i.total,
                }))}
                totals={{
                  partsTotal: 0,
                  laborTotal: 0,
                  othersTotal: 0,
                  partsTax: 0,
                  laborTax: 0,
                  total: total,
                }}
                customerNote={estimate.customerNote || ""}
              />
            }
            fileName={`Invoice_${id}.pdf`}
            className="btn btn-primary"
          >
            {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
          </PDFDownloadLink>
        ) : (
          <Button variant="primary" disabled>
            Download PDF
          </Button>
        )}
        <Button
          variant="secondary"
          className="ms-2"
          onClick={() => navigate("/estimates")}
        >
          Back
        </Button>
      </div>
    </Container>
  );
};

export default Invoice;
