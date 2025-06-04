import { useEffect, useState } from "react";
import { Table, Button, Spin, Alert, Badge, Space, Card } from "antd";
import { useNavigate } from "react-router-dom";
import {
  getDiagnosticsByTechnician,
  getAllDiagnosticsForManager,
} from "../../../services/DiagnosticService";
import {
  deleteTechnicianDiagnostic,
  getTechnicianDiagnosticByDiagId,
} from "../../../services/TechnicianDiagnosticService";

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
        }

        setDiagnostics(data);

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
   * Handles the deletion of a technician diagnostic.
   * @param {number} diagnosticId - ID of the diagnostic to delete
   */
  const handleDelete = async (diagnosticId) => {
    const techDiagId = techDiagMap[diagnosticId];
    if (!techDiagId) {
      alert("No technician diagnostic found to delete.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Technician Diagnostic?"
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await deleteTechnicianDiagnostic(techDiagId);
      setTechDiagMap((prev) => ({ ...prev, [diagnosticId]: null }));
      alert("Technician diagnostic deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Failed to delete: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    return userProfile === "Manager" ? "All Diagnostics" : "My Diagnostics";
  };

  return (
    <Card title={getTitle()} style={{ margin: 16 }}>
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
          dataSource={diagnostics}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Spin>
    </Card>
  );
};

export default TechnicianDiagnosticList;
