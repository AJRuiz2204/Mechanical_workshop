/* eslint-disable no-unused-vars */
// src/components/Settings/EstimateList.jsx

import React, { useState, useEffect } from "react";
import { Table, Alert, Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  getEstimates,
  deleteEstimate,
} from "../../../services/EstimateService";
import { createAccountReceivable } from "../../../services/accountReceivableService";
import AccountPaymentModal from "../../Home/Accounting/AccountPaymentModal";
import "./EstimateList.css";

/**
 * EstimateList Component
 *
 * Description:
 * This component displays a list of estimates and provides functionality to:
 * - Search estimates by various fields (ID, vehicle VIN, subtotal, tax, total, or status)
 * - Edit, delete, or view an invoice for each estimate
 * - Generate or open an account receivable for the estimate
 *
 * It uses Bootstrap components for layout and responsive design.
 *
 * Responsive Behavior:
 * - Uses Bootstrap’s grid and utility classes.
 * - The custom CSS file adjusts paddings, fonts, and spacing for devices in the xs, sm, md, lg, and xl ranges.
 *
 * @returns {JSX.Element} The EstimateList component.
 */
const EstimateList = () => {
  // State to store the list of estimates
  const [estimates, setEstimates] = useState([]);
  // Loading and error states for fetching estimates
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Success message state
  const [success, setSuccess] = useState(null);
  // State to control the payment modal visibility and hold the associated account ID
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalAccountId, setModalAccountId] = useState(null);
  // State for the search term used to filter estimates
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * useEffect Hook:
   * Fetches the list of estimates when the component mounts.
   */
  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const data = await getEstimates();
        setEstimates(data);
      } catch (err) {
        setError(`Error loading estimates: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchEstimates();
  }, []);

  /**
   * Filters estimates based on the search term.
   * The search is case-insensitive and checks the estimate ID, vehicle VIN,
   * subtotal, tax, total, and authorization status.
   */
  const filteredEstimates = estimates.filter((estimate) => {
    const term = searchTerm.toLowerCase();
    return (
      String(estimate.id).toLowerCase().includes(term) ||
      (estimate.vehicle?.vin &&
        estimate.vehicle.vin.toLowerCase().includes(term)) ||
      (estimate.subtotal &&
        String(estimate.subtotal).toLowerCase().includes(term)) ||
      (estimate.tax && String(estimate.tax).toLowerCase().includes(term)) ||
      (estimate.total && String(estimate.total).toLowerCase().includes(term)) ||
      (estimate.authorizationStatus &&
        estimate.authorizationStatus.toLowerCase().includes(term))
    );
  });

  /**
   * handleGenerateAccount Function:
   * Generates an account receivable for the provided estimate.
   * If the estimate already has an associated account, it opens the payment modal.
   *
   * @param {Object} estimate - The estimate object.
   */
  const handleGenerateAccount = async (estimate) => {
    // If an account already exists, open the payment modal
    if (estimate.accountReceivable && estimate.accountReceivable.id) {
      setModalAccountId(estimate.accountReceivable.id);
      setShowPaymentModal(true);
      return;
    }

    // Confirm account generation
    if (
      !window.confirm(
        `An account receivable will be generated for estimate ${estimate.id}. Continue?`
      )
    )
      return;

    try {
      const newAccount = await createAccountReceivable({
        estimateId: estimate.id,
      });
      setSuccess(
        `Account receivable successfully created for estimate ${estimate.id}.`
      );
      setModalAccountId(newAccount.id);
      setShowPaymentModal(true);
    } catch (err) {
      setError(`Error generating account: ${err.message}`);
    }
  };

  /**
   * handleEdit Function:
   * Placeholder function for editing the given estimate.
   *
   * @param {Object} estimate - The estimate object to be edited.
   */
  const handleEdit = (estimate) => {
    console.log("Editing Estimate:", estimate);
    // Navigation or modal handling for editing could be implemented here.
  };

  /**
   * handleDelete Function:
   * Deletes the estimate with the given ID.
   *
   * @param {number|string} id - The ID of the estimate to delete.
   */
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this estimate?"
    );
    if (!confirmDelete) return;

    try {
      await deleteEstimate(id);
      setSuccess(`Estimate with ID ${id} successfully deleted.`);
      setEstimates((prev) => prev.filter((est) => est.id !== id));
    } catch (err) {
      setError(`Error deleting estimate: ${err.message}`);
    }
  };

  // Render a loading message while fetching estimates
  if (loading) {
    return <div>Loading estimates...</div>;
  }

  return (
    <div className="estimate-list container p-4 border rounded">
      <h2 className="mb-4">Estimate List</h2>

      {/* Display error and success messages */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      {/* Search input */}
      <Form.Group controlId="search" className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      {/* Add Estimate Button */}
      <div className="mb-3 text-end">
        <Link to="/estimate/create">
          <Button variant="primary">+ Add Estimate</Button>
        </Link>
      </div>

      {/* Estimates Table */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Vehicle VIN</th>
            <th>Subtotal</th>
            <th>Tax</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEstimates.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No estimates found.
              </td>
            </tr>
          ) : (
            filteredEstimates.map((estimate) => (
              <tr key={estimate.id}>
                <td>{estimate.id}</td>
                <td>{estimate.vehicle?.vin || "No VIN"}</td>
                <td>${estimate.subtotal?.toFixed(2)}</td>
                <td>${estimate.tax?.toFixed(2)}</td>
                <td>${estimate.total?.toFixed(2)}</td>
                <td>{estimate.authorizationStatus}</td>
                <td>
                  {/* View Invoice */}
                  <Link to={`/invoice/${estimate.id}`}>
                    <Button variant="info" size="sm" className="me-2">
                      View
                    </Button>
                  </Link>
                  {/* Edit Estimate */}
                  <Link to={`/estimate/edit/${estimate.id}`}>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(estimate)}
                    >
                      Edit
                    </Button>
                  </Link>
                  {/* Delete Estimate */}
                  <Button
                    variant="danger"
                    size="sm"
                    className="me-2"
                    onClick={() => handleDelete(estimate.id)}
                  >
                    Delete
                  </Button>
                  {/* Generate/Open Account */}
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleGenerateAccount(estimate)}
                  >
                    {estimate.accountReceivable
                      ? "Open Account"
                      : "Generate Account"}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Payment Modal for Account Receivable */}
      <AccountPaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        accountId={modalAccountId}
      />
    </div>
  );
};

export default EstimateList;
