import { useState, useEffect } from "react";
import { Table, Alert, Button, Input, Checkbox, Tag, Modal } from "antd";
import { Link, useLocation } from "react-router-dom";
import {
  deleteEstimate,
  getEstimatesWithAccounts,
} from "../../../services/EstimateService";
import { createAccountReceivable } from "../../../services/accountReceivableService";
import AccountPaymentModal from "../../Home/Accounting/AccountPaymentModal";
import PDFModalContent from "./PDFModalContent";
import EstimateActions from "./EstimateActions/EstimateActions";
import NotificationService from "../../../services/notificationService.jsx";
import ConfirmationDialog from "../../common/ConfirmationDialog";

/**
 * EstimateList Component
 *
 * This component displays a list of estimates with their associated account receivable data.
 * It provides functionality to:
 * - Search estimates by various fields (ID, vehicle VIN, subtotal, tax, total, owner name, or authorization status)
 * - Filter estimates by payment status using two checkboxes (Paid and Pending)
 * - Edit, delete, or view the PDF for each estimate
 * - Generate or open an account receivable for the estimate
 * 
 * IMPORTANT: Paid estimates are considered closed invoices/completed work and are hidden by default.
 * They only appear when the "Show Paid (Closed Invoices)" filter is explicitly checked.
 * This prevents the list from being cluttered with completed work orders.
 *
 * @returns {JSX.Element} The EstimateList component.
 */

const EstimateList = () => {
  const location = useLocation();
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalAccountId, setModalAccountId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [paidFilter, setPaidFilter] = useState(false);
  const [pendingFilter, setPendingFilter] = useState(false);
  const [notApprovedFilter, setNotApprovedFilter] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedEstimateId, setSelectedEstimateId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchEstimates = async () => {
    setLoading(true);
    try {
      const data = await getEstimatesWithAccounts();
      setEstimates(data);
      setError(null);
    } catch (err) {
      const errorMsg = err.message || 'Failed to load estimates';
      setError(`Error loading estimates: ${errorMsg}`);
      NotificationService.operationError('load', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstimates();
  }, [location]);

  const handleGenerateAccount = (item) => {
    const estId = item.estimate.id;
    if (item.accountReceivable?.id) {
      setModalAccountId(item.accountReceivable.id);
      setShowPaymentModal(true);
      return;
    }
    
    ConfirmationDialog.show({
      title: "Generate Account Receivable",
      content: `An account receivable will be generated for estimate #${estId}. Continue?`,
      onConfirm: async () => {
        try {
          const newAccount = await createAccountReceivable({ estimateId: estId });
          NotificationService.operationSuccess('create', 'Account receivable');
          setSuccess(`Account receivable created for estimate ${estId}.`);
          setModalAccountId(newAccount.id);
          setShowPaymentModal(true);
          fetchEstimates();
        } catch (err) {
          const errorMsg = err.message || 'Failed to generate account receivable';
          setError(`Error generating account: ${errorMsg}`);
          NotificationService.operationError('create', errorMsg);
        }
      }
    });
  };

  const handleEdit = (item) => {
    console.log("Editing Estimate:", item.estimate);
  };

  const handleDelete = (id) => {
    ConfirmationDialog.delete({
      title: "Delete Estimate",
      content: `Are you sure you want to delete estimate #${id}? This action cannot be undone.`,
      itemName: `Estimate #${id}`,
      onConfirm: async () => {
        try {
          await deleteEstimate(id);
          NotificationService.operationSuccess('delete', `Estimate #${id}`);
          setSuccess(`Estimate ${id} successfully deleted.`);
          fetchEstimates();
        } catch (err) {
          const errorMsg = err.message || 'An error occurred while deleting the estimate';
          setError(`Error deleting estimate: ${errorMsg}`);
          NotificationService.operationError('delete', errorMsg);
        }
      }
    });
  };

  const handleOpenPDF = (id) => {
    setSelectedEstimateId(id);
    setShowPDFModal(true);
  };

  const columns = [
    {
      title: "Estimate ID",
      dataIndex: ["estimate", "id"],
      key: "id",
    },
    {
      title: "VIN",
      dataIndex: ["estimate", "vehicle", "vin"],
      key: "vin",
      render: (vin) => vin || "No VIN",
    },
    {
      title: "Year",
      dataIndex: ["estimate", "vehicle", "year"],
      key: "year",
      render: (year) => year || "-",
    },
    {
      title: "Make",
      dataIndex: ["estimate", "vehicle", "make"],
      key: "make",
      render: (make) => make || "-",
    },
    {
      title: "Model",
      dataIndex: ["estimate", "vehicle", "model"],
      key: "model",
      render: (model) => model || "-",
    },
    {
      title: "Owner",
      dataIndex: ["estimate", "owner"],
      key: "owner",
      render: (o) => (o ? `${o.name} ${o.lastName}` : "-"),
    },
    {
      title: "Total",
      dataIndex: ["estimate", "total"],
      key: "total",
      render: (v) => `$${v?.toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: ["estimate", "authorizationStatus"],
      key: "status",
      render: (s) => (
        <Tag
          color={
            {
              approved: "green",
              rejected: "red",
              "not approved": "red",
              pending: "orange",
            }[s.toLowerCase()] || "default"
          }
        >
          {{
            "not approved": "Not Approved",
            rejected: "Not Approved",
            pending: "Pending",
            approved: "Approved",
          }[s.toLowerCase()] || s}
        </Tag>
      ),
    },
    {
      title: "Payment",
      key: "payment",
      render: (_, item) => {
        const status = !item.accountReceivable
          ? "No Account"
          : item.isPaid
          ? "Paid"
          : "Pending";
        const color = !item.accountReceivable
          ? "gray"
          : item.isPaid
          ? "green"
          : "orange";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, item) => (
        <EstimateActions
          item={item}
          onViewPDF={handleOpenPDF}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onGenerateAccount={handleGenerateAccount}
        />
      ),
    },
  ];

  const filteredEstimates = estimates.filter((item) => {
    const term = searchTerm.toLowerCase();
    const est = item.estimate;
    
    // Búsqueda por owner (nombre y apellido)
    const ownerName = est.owner ? `${est.owner.name || ''} ${est.owner.lastName || ''}`.toLowerCase() : '';
    
    const matchesSearch =
      String(est.id).toLowerCase().includes(term) ||
      (est.vehicle?.vin && est.vehicle.vin.toLowerCase().includes(term)) ||
      (est.subtotal && String(est.subtotal).toLowerCase().includes(term)) ||
      (est.tax && String(est.tax).toLowerCase().includes(term)) ||
      (est.total && String(est.total).toLowerCase().includes(term)) ||
      (est.authorizationStatus &&
        est.authorizationStatus.toLowerCase().includes(term)) ||
      ownerName.includes(term);

    const paymentStatus = !item.accountReceivable
      ? "No Account"
      : item.isPaid
      ? "Paid"
      : "Pending";
    
    const authorizationStatus = est.authorizationStatus?.toLowerCase() || "";
    
    // Check authorization status filter
    let authorizationMatches = true;
    if (notApprovedFilter) {
      authorizationMatches = authorizationStatus === "not approved";
    }
    
    // Los estimados pagados son facturas/trabajos cerrados y no se muestran por defecto
    // Solo se muestran si el filtro "Paid" está activo
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
    } else {
      // Si no hay filtros activos, excluir los estimados pagados (son facturas cerradas)
      paymentMatches = paymentStatus !== "Paid";
    }
    
    return matchesSearch && paymentMatches && authorizationMatches;
  });

  if (loading) return <div>Loading estimates...</div>;

  return (
    <div className="estimate-list container-fluid p-4 border rounded">
      <h2 className="mb-4">Estimate List</h2>
      
      {error && (
        <Alert
          message={error}
          type="error"
          closable
          onClose={() => setError(null)}
        />
      )}
      {success && (
        <Alert
          message={success}
          type="success"
          closable
          onClose={() => setSuccess(null)}
        />
      )}

      <Input.Search
        placeholder="Search by ID, VIN, owner name, total, or status..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: 16 }}
      />

      <div style={{ marginBottom: 16 }}>
        <Checkbox
          checked={paidFilter}
          onChange={(e) => setPaidFilter(e.target.checked)}
          style={{ marginRight: 12 }}
        >
          Show Paid (Closed Invoices)
        </Checkbox>
        <Checkbox
          checked={pendingFilter}
          onChange={(e) => setPendingFilter(e.target.checked)}
          style={{ marginRight: 12 }}
        >
          Show Pending Payments
        </Checkbox>
        <Checkbox
          checked={notApprovedFilter}
          onChange={(e) => setNotApprovedFilter(e.target.checked)}
        >
          Show Not Approved
        </Checkbox>
      </div>

      <div className="mb-3 text-end">
        <Link to="/estimate/create">
          <Button type="primary">+ Add Estimate</Button>
        </Link>
      </div>

      <Table
        columns={columns}
        dataSource={filteredEstimates}
        rowKey={(item) => item.estimate.id}
        pagination={{
          current: currentPage,
          pageSize,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total) => `Total ${total} estimates`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
      />

      <AccountPaymentModal
        show={showPaymentModal}
        onHide={() => {
          setShowPaymentModal(false);
          fetchEstimates();
        }}
        accountId={modalAccountId}
      />

      <Modal
        open={showPDFModal}
        onCancel={() => setShowPDFModal(false)}
        width="80%"
        footer={null}
        styles={{ body: { height: "80vh", overflow: "auto" } }}
        title="Estimate PDF"
      >
        {selectedEstimateId && (
          <PDFModalContent estimateId={selectedEstimateId} />
        )}
      </Modal>
    </div>
  );
};

export default EstimateList;
