/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Table, Button, Alert, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  getEstimates,
  deleteEstimate,
} from "../../../services/EstimateService";
import { createAccountReceivable } from "../../../services/accountReceivableService";
import AccountPaymentModal from "../../Home/Accounting/AccountPaymentModal";

/**
 * EstimateList Component
 * This component displays a list of estimates along with options to edit, delete,
 * and generate an account receivable for each estimate.
 *
 * @returns {JSX.Element}
 */
const EstimateList = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalAccountId, setModalAccountId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * useEffect - Fetch estimates on component mount.
   */
  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const data = await getEstimates();
        setEstimates(data);
        setLoading(false);
      } catch (err) {
        setError(`Error loading estimates: ${err.message}`);
        setLoading(false);
      }
    };

    fetchEstimates();
  }, []);

  /**
   * Filter estimates based on the search term.
   */
  const filteredEstimates = estimates.filter((estimate) => {
    // Convert to lowercase for a case-insensitive search.
    const term = searchTerm.toLowerCase();

    // For example, you can search by id, VIN, subtotal, tax, total or status.
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
   * handleGenerateAccount
   * Generates an account receivable for the provided estimate.
   * If the estimate already has an associated account, it opens the payment modal.
   *
   * @param {Object} estimate - The estimate object.
   */
  const handleGenerateAccount = async (estimate) => {
    // If the estimate already has an account receivable, open the payment modal directly.
    if (estimate.accountReceivable && estimate.accountReceivable.id) {
      setModalAccountId(estimate.accountReceivable.id);
      setShowPaymentModal(true);
      return;
    }

    // Confirm the action to generate an account.
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
   * handleEdit
   * Placeholder function for editing the provided estimate.
   *
   * @param {Object} estimate - The estimate object to be edited.
   */
  const handleEdit = (estimate) => {
    console.log("Editing Estimate:", estimate);
  };

  /**
   * handleDelete
   * Deletes the estimate with the specified ID.
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

  // Display a loading message while fetching estimates.
  if (loading) {
    return <div>Loading estimates...</div>;
  }

  return (
    <div className="p-4 border rounded">
      <h2>Estimate List</h2>

      {/* Error/success messages */}
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
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

      <div className="mb-3 text-end">
        <Link to="/estimate/create">
          <Button variant="primary">+ Add Estimate</Button>
        </Link>
      </div>

      <Table striped bordered hover>
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
                  {/* View Invoice Button */}
                  <Link to={`/invoice/${estimate.id}`}>
                    <Button variant="info" size="sm" className="me-2">
                      View
                    </Button>
                  </Link>

                  {/* Edit Estimate Button */}
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

                  {/* Delete Estimate Button */}
                  <Button
                    variant="danger"
                    size="sm"
                    className="me-2"
                    onClick={() => handleDelete(estimate.id)}
                  >
                    Delete
                  </Button>

                  {/* Generate or Open Account Button */}
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

      {/* Payment modal for individual account */}
      <AccountPaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        accountId={modalAccountId}
      />
    </div>
  );
};

export default EstimateList;
