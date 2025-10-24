import { useEffect, useState } from "react";
import { Table, Button, Spin, Alert, Badge, Space, Card, Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getDiagnosticsByTechnician,
  getAllDiagnosticsForManager,
} from "../../../services/DiagnosticService";
import {
  deleteTechnicianDiagnostic,
  getTechnicianDiagnosticByDiagId,
} from "../../../services/TechnicianDiagnosticService";
import NotificationService from "../../../services/notificationService.jsx";
import ConfirmationDialog from "../../common/ConfirmationDialog";

/**
 * TechnicianDiagnosticList Component
 * This component displays the list of diagnostics assigned to a technician.
 * For Managers, it shows all diagnostics. For Technicians, it shows only assigned diagnostics.
 * The user can edit or delete assigned diagnostics or create a new one if missing.
 *
 * @returns {JSX.Element}
 */
const TechnicianDiagnosticList = () => {
  const navigate = useNavigate();

  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [techDiagMap, setTechDiagMap] = useState({});
  const [userProfile, setUserProfile] = useState("");
  const [filteredDiagnostics, setFilteredDiagnostics] = useState([]);

  // Columns configuration for AntD Table
  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "VIN",
      dataIndex: ["vehicle", "vin"],
      key: "vin",
      render: (text) => text || "N/A",
    },
    {
      title: "Make",
      dataIndex: ["vehicle", "make"],
      key: "make",
      render: (text) => text || "N/A",
    },
    {
      title: "Model",
      dataIndex: ["vehicle", "model"],
      key: "model",
      render: (text) => text || "N/A",
    },
    {
      title: "Customer state",
      dataIndex: "reasonForVisit",
      key: "reasonForVisit",
    },
    {
      title: "Assigned Technician",
      dataIndex: "assignedTechnician",
      key: "assignedTechnician",
      render: (text) => text || "N/A",
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const hasTechDiag = !!techDiagMap[record.id];
        return (
          <Badge
            status={hasTechDiag ? "success" : "error"}
            text={hasTechDiag ? "With Diagnostic" : "Without Diagnostic"}
          />
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        const hasTechDiag = !!techDiagMap[record.id];
        return (
          <Space>
            {hasTechDiag ? (
              <>
                <Button
                  onClick={() =>
                    navigate(
                      `/technicianDiagnostic/edit/${techDiagMap[record.id]}`
                    )
                  }
                >
                  Edit
                </Button>
                <Button danger onClick={() => handleDelete(record.id)}>
                  Delete
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                onClick={() =>
                  navigate(`/technicianDiagnostic/create/${record.id}`)
                }
              >
                Create
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  useEffect(() => {
    const fetchTechnicianDiagnostics = async () => {
      try {
        setLoading(true);
        setError("");

        const userString = localStorage.getItem("user");
        if (!userString) {
          setError("User not found in localStorage.");
          setDiagnostics([]);
          return;
        }

        const user = JSON.parse(userString);
        const { name, lastName, profile } = user;
        setUserProfile(profile);

        if (profile !== "Technician" && profile !== "Manager") {
          setError("User is not authorized to view this section.");
          setDiagnostics([]);
          return;
        }

        let data;
        if (profile === "Manager") {
          // Manager sees all diagnostics
          data = await getAllDiagnosticsForManager();
        } else {
          // Technician sees only assigned diagnostics
          data = await getDiagnosticsByTechnician(name, lastName);
          // Filter out diagnostics with accountReceivableStatus "Paid"
          data = data.filter(diagnostic => diagnostic.accountReceivableStatus !== "Paid");
        }

        setDiagnostics(data);
        setFilteredDiagnostics(data);

        // Retrieve TechnicianDiagnostics for each diagnostic
        const newTechDiagMap = {};
        await Promise.all(
          data.map(async (diag) => {
            try {
              const techDiag = await getTechnicianDiagnosticByDiagId(diag.id);
              newTechDiagMap[diag.id] = techDiag.id;
            } catch (error) {
              if (error.message !== "Not found") console.error(error);
              newTechDiagMap[diag.id] = null;
            }
          })
        );
        setTechDiagMap(newTechDiagMap);
      } catch (error) {
        setError(error.message || "Error fetching diagnostics.");
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicianDiagnostics();
  }, []);

  /**
   * Handles search functionality across VIN, Make, Model, and Customer state
   * @param {string} value - Search term
   */
  const handleSearch = (value) => {
    if (!value.trim()) {
      setFilteredDiagnostics(diagnostics);
      return;
    }

    const searchLower = value.toLowerCase();
    const filtered = diagnostics.filter((diagnostic) => {
      const vin = diagnostic.vehicle?.vin?.toLowerCase() || "";
      const make = diagnostic.vehicle?.make?.toLowerCase() || "";
      const model = diagnostic.vehicle?.model?.toLowerCase() || "";
      const customerState = diagnostic.reasonForVisit?.toLowerCase() || "";

      return (
        vin.includes(searchLower) ||
        make.includes(searchLower) ||
        model.includes(searchLower) ||
        customerState.includes(searchLower)
      );
    });

    setFilteredDiagnostics(filtered);
  };

  /**
   * Handles the deletion of a technician diagnostic.
   * @param {number} diagnosticId - ID of the diagnostic to delete
   */
  const handleDelete = async (diagnosticId) => {
    const techDiagId = techDiagMap[diagnosticId];
    if (!techDiagId) {
      NotificationService.warning("No Diagnostic Found", "No technician diagnostic found to delete.");
      return;
    }

    ConfirmationDialog.show({
      title: 'Delete Technician Diagnostic',
      content: 'Are you sure you want to delete this Technician Diagnostic?',
      type: 'danger',
      onConfirm: async () => {
        try {
          setLoading(true);
          await deleteTechnicianDiagnostic(techDiagId);
          setTechDiagMap((prev) => ({ ...prev, [diagnosticId]: null }));
          NotificationService.operationSuccess('delete', 'Technician diagnostic');
        } catch (error) {
          console.error("Delete error:", error);
          NotificationService.operationError('delete', error.message || "Unknown error");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const getTitle = () => {
    return userProfile === "Manager" ? "All Diagnostics" : "My Diagnostics";
  };

  return (
    <Card title={getTitle()} style={{ margin: 16 }}>
      {/* Search Input */}
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search by VIN, Make, Model, or Customer state..."
          prefix={<SearchOutlined />}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ maxWidth: 400 }}
          allowClear
        />
      </div>

      {/* Error message */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Loading and content */}
      <Spin spinning={loading} tip="Loading...">
        {!loading && filteredDiagnostics.length === 0 && diagnostics.length > 0 && (
          <Alert
            message="No diagnostics found matching your search criteria."
            type="info"
            showIcon
          />
        )}
        {!loading && diagnostics.length === 0 && (
          <Alert
            message={
              userProfile === "Manager"
                ? "No diagnostics available."
                : "You have no assigned diagnostics."
            }
            type="info"
            showIcon
          />
        )}
        <Table
          dataSource={filteredDiagnostics}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </Card>
  );
};

export default TechnicianDiagnosticList;
