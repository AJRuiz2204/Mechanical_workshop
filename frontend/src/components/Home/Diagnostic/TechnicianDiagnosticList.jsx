import { useEffect, useState } from "react";
import { Table, Button, Spin, Alert, Badge, Space, Card } from "antd";
import { useNavigate } from "react-router-dom";
import { getDiagnosticsByTechnician } from "../../../services/DiagnosticService";
import {
  deleteTechnicianDiagnostic,
  getTechnicianDiagnosticByDiagId,
} from "../../../services/TechnicianDiagnosticService";

/**
 * TechnicianDiagnosticList Component
 * This component displays the list of diagnostics assigned to a technician.
 * The technician can edit or delete assigned diagnostics or create a new one if missing.
 *
 * @returns {JSX.Element}
 */
const TechnicianDiagnosticList = () => {
  const navigate = useNavigate();

  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [techDiagMap, setTechDiagMap] = useState({});

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

        if (profile !== "Technician") {
          setError("User is not authorized to view this section.");
          setDiagnostics([]);
          return;
        }

        // Retrieve diagnostics assigned to the technician
        const data = await getDiagnosticsByTechnician(name, lastName);
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
    if (!techDiagId) return;

    const confirmDelete = window.confirm("Delete this Technician Diagnostic?");
    if (!confirmDelete) return;

    try {
      await deleteTechnicianDiagnostic(techDiagId);
      setTechDiagMap((prev) => ({ ...prev, [diagnosticId]: null }));
      alert("Successfully deleted!");
    } catch (error) {
      alert(`Delete failed: ${error.message}`);
    }
  };

  return (
    <Card title="My Diagnostics" style={{ margin: 16 }}>
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
            message="You have no assigned diagnostics."
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
