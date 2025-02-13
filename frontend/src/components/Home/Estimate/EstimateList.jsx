/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Table, Alert, Button, Form, Badge, Modal } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getEstimates, deleteEstimate } from "../../../services/EstimateService";
import { createAccountReceivable } from "../../../services/accountReceivableService";
import AccountPaymentModal from "../../Home/Accounting/AccountPaymentModal";
import "./EstimateList.css";
import PDFModalContent from "./PDFModalContent"; // Adjust the path as needed

/**
 * EstimateList Component
 *
 * This component displays a list of estimates and provides functionality to:
 * - Search estimates by various fields (ID, vehicle VIN, subtotal, tax, total, or authorization status)
 * - Edit, delete, or view the PDF for each estimate
 * - Generate or open an account receivable for the estimate
 *
 * In addition to these features, it now integrates a modal to view the PDF
 * without navigating away from the list, thereby preserving the search state.
 *
 * @returns {JSX.Element} The EstimateList component.
 */
const EstimateList = () => {
  // State to store the list of estimates.
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
  // States for controlling the PDF modal and storing the selected estimate ID.
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedEstimateId, setSelectedEstimateId] = useState(null);

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
   * The search is case-insensitive and checks various fields.
   */
  const filteredEstimates = estimates.filter((estimate) => {
    const term = searchTerm.toLowerCase();
    return (
      String(estimate.id).toLowerCase().includes(term) ||
      (estimate.vehicle?.vin && estimate.vehicle.vin.toLowerCase().includes(term)) ||
      (estimate.subtotal && String(estimate.subtotal).toLowerCase().includes(term)) ||
      (estimate.tax && String(estimate.tax).toLowerCase().includes(term)) ||
      (estimate.total && String(estimate.total).toLowerCase().includes(term)) ||
      (estimate.authorizationStatus && estimate.authorizationStatus.toLowerCase().includes(term))
    );
  });

  /**
   * handleGenerateAccount:
   * Generates or opens the account receivable associated with the given estimate.
   *
   * @param {Object} estimate - The estimate object.
   */
  const handleGenerateAccount = async (estimate) => {
    if (estimate.accountReceivable && estimate.accountReceivable.id) {
      setModalAccountId(estimate.accountReceivable.id);
      setShowPaymentModal(true);
      return;
    }

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
      setSuccess(`Account receivable successfully created for estimate ${estimate.id}.`);
      setModalAccountId(newAccount.id);
      setShowPaymentModal(true);
    } catch (err) {
      setError(`Error generating account: ${err.message}`);
    }
  };

  /**
   * handleEdit:
   * Placeholder function to handle editing an estimate.
   *
   * @param {Object} estimate - The estimate object to edit.
   */
  const handleEdit = (estimate) => {
    console.log("Editing Estimate:", estimate);
    // Implement navigation or modal editing here.
  };

  /**
   * handleDelete:
   * Deletes the estimate with the provided ID.
   *
   * @param {number|string} id - The ID of the estimate to delete.
   */
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this estimate?");
    if (!confirmDelete) return;

    try {
      await deleteEstimate(id);
      setSuccess(`Estimate with ID ${id} successfully deleted.`);
      setEstimates((prev) => prev.filter((est) => est.id !== id));
    } catch (err) {
      setError(`Error deleting estimate: ${err.message}`);
    }
  };

  /**
   * getStatusVariant:
   * Returns the Bootstrap variant for the Badge based on the authorization status.
   *
   * @param {string} status - The authorization status.
   * @returns {string} The Bootstrap variant.
   */
  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "success";
      case "rejected":
        return "danger";
      case "inreview":
      case "in review":
        return "warning";
      default:
        return "secondary";
    }
  };

  /**
   * handleOpenPDF:
   * Opens the PDF modal for the selected estimate.
   *
   * @param {number|string} estimateId - The ID of the estimate whose PDF will be displayed.
   */
  const handleOpenPDF = (estimateId) => {
    setSelectedEstimateId(estimateId);
    setShowPDFModal(true);
  };

  // If still loading estimates, show a loading message.
  if (loading) {
    return <div>Loading estimates...</div>;
  }

  return (
    <div className="estimate-list container p-4 border rounded">
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

      {/* Search input to filter estimates */}
      <Form.Group controlId="search" className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Form.Group>

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
                <td>
                  <Badge bg={getStatusVariant(estimate.authorizationStatus)}>
                    {estimate.authorizationStatus}
                  </Badge>
                </td>
                <td>
                  {/* "View PDF" button: opens the PDF modal without navigation */}
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handleOpenPDF(estimate.id)}
                  >
                    View PDF
                  </Button>
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
                  <Button
                    variant="danger"
                    size="sm"
                    className="me-2"
                    onClick={() => handleDelete(estimate.id)}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleGenerateAccount(estimate)}
                  >
                    {estimate.accountReceivable ? "Open Account" : "Generate Account"}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>

      {/* Payment Modal */}
      <AccountPaymentModal
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        accountId={modalAccountId}
      />

      {/* PDF Modal to display the Estimate PDF without leaving the list view */}
      <Modal
        show={showPDFModal}
        onHide={() => setShowPDFModal(false)}
        size="xl"
        dialogClassName="modal-90w"
      >
        <Modal.Header closeButton>
          <Modal.Title>Estimate PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedEstimateId && <PDFModalContent estimateId={selectedEstimateId} />}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EstimateList;
