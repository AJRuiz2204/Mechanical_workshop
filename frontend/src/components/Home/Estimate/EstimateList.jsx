/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Table, Alert, Button, Form, Badge, Modal } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import {
  deleteEstimate,
  getEstimatesWithAccounts,
} from "../../../services/EstimateService";
import { createAccountReceivable } from "../../../services/accountReceivableService";
import AccountPaymentModal from "../../Home/Accounting/AccountPaymentModal";
import "./EstimateList.css";
import PDFModalContent from "./PDFModalContent";
import EstimateActions from "./EstimateActions/EstimateActions";

/**
 * EstimateList Component
 *
 * This component displays a list of estimates with their associated account receivable data.
 * It provides functionality to:
 * - Search estimates by various fields (ID, vehicle VIN, subtotal, tax, total, or authorization status)
 * - Filter estimates by payment status using two comboboxes (Paid and Pending)
 * - Edit, delete, or view the PDF for each estimate
 * - Generate or open an account receivable for the estimate
 *
 * @returns {JSX.Element} The EstimateList component.
 */
const EstimateList = () => {
  const location = useLocation(); // ← track route changes
  // State to store the list of estimates (with account receivable data).
  const [estimates, setEstimates] = useState([]);
  // Loading and error states for fetching estimates.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // State for success messages.
  const [success, setSuccess] = useState(null);
  // States to control the payment modal and store the associated account ID.
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalAccountId, setModalAccountId] = useState(null);
  // State for the search term used to filter estimates.
  const [searchTerm, setSearchTerm] = useState("");
  // New states for filtering by payment status via two comboboxes.
  // "all" means no filtering; "yes" means only show estimates matching that status.
  const [paidFilter, setPaidFilter] = useState(false);
  const [pendingFilter, setPendingFilter] = useState(false);
  // States for controlling the PDF modal and storing the selected estimate ID.
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedEstimateId, setSelectedEstimateId] = useState(null);

  // Extracted fetch function to reload estimates
  const fetchEstimates = async () => {
    setLoading(true);
    try {
      const data = await getEstimatesWithAccounts();
      setEstimates(data);
      setError(null);
    } catch (err) {
      setError(`Error loading estimates: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * useEffect Hook:
   * Fetches the list of estimates with account receivable data when the component mounts.
   */
  useEffect(() => {
    fetchEstimates();
  }, [location]); // ← rerun on every navigation/re‑mount

  /**
   * Returns the payment status label.
   * If no account receivable exists, returns "No Account".
   * Otherwise, returns "Paid" if isPaid is true, or "Pending" if not.
   */
  const getPaymentStatus = (item) => {
    if (!item.accountReceivable) return "No Account";
    return item.isPaid ? "Paid" : "Pending";
  };

  /**
   * Returns the Bootstrap badge variant for the payment status.
   */
  const getPaymentBadgeVariant = (item) => {
    if (!item.accountReceivable) return "secondary";
    return item.isPaid ? "success" : "warning";
  };

  /**
   * Filters estimates based on the search term and payment filters.
   */
  const filteredEstimates = estimates.filter((item) => {
    const term = searchTerm.toLowerCase();
    const est = item.estimate;
    const matchesSearch =
      String(est.id).toLowerCase().includes(term) ||
      (est.vehicle?.vin && est.vehicle.vin.toLowerCase().includes(term)) ||
      (est.subtotal && String(est.subtotal).toLowerCase().includes(term)) ||
      (est.tax && String(est.tax).toLowerCase().includes(term)) ||
      (est.total && String(est.total).toLowerCase().includes(term)) ||
      (est.authorizationStatus &&
        est.authorizationStatus.toLowerCase().includes(term));

    const paymentStatus = getPaymentStatus(item); // "No Account", "Paid", "Pending"
    let paymentMatches = true;
    if (paidFilter || pendingFilter) {
      if (paidFilter && !pendingFilter) {
        paymentMatches = paymentStatus === "Paid";
      } else if (pendingFilter && !paidFilter) {
        paymentMatches = paymentStatus === "Pending";
      } else if (paidFilter && pendingFilter) {
        paymentMatches =
          paymentStatus === "Paid" || paymentStatus === "Pending";
      }
    }
    return matchesSearch && paymentMatches;
  });

  /**
   * handleGenerateAccount:
   * Generates or opens the account receivable associated with the given estimate.
   *
   * @param {Object} item - The object containing estimate and account receivable data.
   */
  const handleGenerateAccount = async (item) => {
    const estId = item.estimate.id;
    if (item.accountReceivable && item.accountReceivable.id) {
      setModalAccountId(item.accountReceivable.id);
      setShowPaymentModal(true);
      return;
    }
    if (
      !window.confirm(
        `An account receivable will be generated for estimate ${estId}. Continue?`
      )
    )
      return;
    try {
      const newAccount = await createAccountReceivable({ estimateId: estId });
      setSuccess(
        `Account receivable successfully created for estimate ${estId}.`
      );
      setModalAccountId(newAccount.id);
      setShowPaymentModal(true);
      // refresh list
      fetchEstimates();
    } catch (err) {
      setError(`Error generating account: ${err.message}`);
    }
  };

  /**
   * handleEdit:
   * Placeholder function to handle editing an estimate.
   *
   * @param {Object} item - The object containing estimate and account receivable data.
   */
  const handleEdit = (item) => {
    console.log("Editing Estimate:", item.estimate);
    // Implement navigation or modal editing here.
  };

  /**
   * handleDelete:
   * Deletes the estimate with the provided ID.
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
      // refresh list
      fetchEstimates();
    } catch (err) {
      setError(`Error deleting estimate: ${err.message}`);
    }
  };

  /**
   * Returns the Bootstrap variant for the authorization status badge.
   *
   * @param {string} status - The authorization status.
   * @returns {string} The Bootstrap variant.
   */
  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "success";
      case "rejected":
      case "not aproved":
        return "danger";
      case "inreview":
      case "in review":
        return "warning";
      default:
        return "secondary";
    }
  };

  /**
   * Translates the authorization status to a more readable label.
   *
   * @param {string} status - The authorization status.
   * @returns {string} The translated label.
   */
  const getStatusLabel = (status) => {
    switch (status.toLowerCase()) {
      case "rejected":
        return "Not aproved";
      case "inreview":
      case "in review":
        return "pending";
      default:
        return status;
    }
  };

  /**
   * handleOpenPDF:
   * Opens the PDF modal for the selected estimate.
   *
   * @param {number|string} id - The ID of the estimate whose PDF will be displayed.
   */
  const handleOpenPDF = (id) => {
    setSelectedEstimateId(id);
    setShowPDFModal(true);
  };

  if (loading) {
    return <div>Loading estimates...</div>;
  }

  return (
    <div className="estimate-list container-fluid p-4 border rounded">
      <h2 className="mb-4">Estimate List</h2>

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

      {/* Payment filter checkboxes */}
      <div className="d-flex mb-3">
        <Form.Check
          type="checkbox"
          id="filterPaid"
          label="Only Paid"
          checked={paidFilter}
          onChange={(e) => setPaidFilter(e.target.checked)}
          className="me-3"
        />
        <Form.Check
          type="checkbox"
          id="filterPending"
          label="Only Pending"
          checked={pendingFilter}
          onChange={(e) => setPendingFilter(e.target.checked)}
        />
      </div>

      <div className="mb-3 text-end">
        <Link to="/estimate/create">
          <Button variant="primary">+ Add Estimate</Button>
        </Link>
      </div>

      {/* Estimates table */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Vehicle VIN</th>
            <th>Owner</th>
            <th>Subtotal</th>
            <th>Tax</th>
            <th>Total</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredEstimates.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">
                No estimates found.
              </td>
            </tr>
          ) : (
            filteredEstimates.map((item) => (
              <tr key={item.estimate.id}>
                <td>{item.estimate.id}</td>
                <td>{item.estimate.vehicle?.vin || "No VIN"}</td>
                <td>
                  {item.estimate.owner
                    ? `${item.estimate.owner.name} ${item.estimate.owner.lastName}`
                    : "-"}
                </td>
                <td>${item.estimate.subtotal?.toFixed(2)}</td>
                <td>${item.estimate.tax?.toFixed(2)}</td>
                <td>${item.estimate.total?.toFixed(2)}</td>
                <td>
                  <Badge
                    bg={getStatusVariant(item.estimate.authorizationStatus)}
                  >
                    {getStatusLabel(item.estimate.authorizationStatus)}
                  </Badge>
                </td>
                <td>
                  <Badge bg={getPaymentBadgeVariant(item)}>
                    {getPaymentStatus(item)}
                  </Badge>
                </td>
                <td>
                  <EstimateActions
                    item={item}
                    onViewPDF={handleOpenPDF}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onGenerateAccount={handleGenerateAccount}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Payment Modal */}
      <AccountPaymentModal
        show={showPaymentModal}
        onHide={() => {
          setShowPaymentModal(false);
          // refresh list after closing payment modal
          fetchEstimates();
        }}
        accountId={modalAccountId}
      />

      {/* PDF Modal to display the Estimate PDF without leaving the list view */}
      <Modal
        show={showPDFModal}
        onHide={() => setShowPDFModal(false)}
        size="xl"
        dialogClassName="estimate-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Estimate PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEstimateId && (
            <PDFModalContent estimateId={selectedEstimateId} />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EstimateList;
