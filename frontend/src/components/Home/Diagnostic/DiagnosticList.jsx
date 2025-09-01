import { useState, useEffect } from "react";
import { Table, Button, Input, Alert, Spin, Tag, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { getDiagnostics, deleteDiagnostic } from "../../../services/DiagnosticService";
import {
  deleteTechnicianDiagnostic,
  getTechnicianDiagnosticByDiagId,
} from "../../../services/TechnicianDiagnosticService";

const DiagnosticList = () => {
  const navigate = useNavigate();

  const [diagnostics, setDiagnostics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [techDiagMap, setTechDiagMap] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const diagData = await getDiagnostics();
      setDiagnostics(diagData);

      const newTechDiagMap = {};
      await Promise.all(
        diagData.map(async (diag) => {
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
      setError(error.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (diagnosticId) => {
    const techDiagId = techDiagMap[diagnosticId];
    if (!techDiagId) return;

    const confirmDelete = window.confirm("Delete this Technician Diagnostic?");
    if (!confirmDelete) return;

    try {
      await deleteTechnicianDiagnostic(techDiagId);
      setTechDiagMap((prev) => ({ ...prev, [diagnosticId]: null }));
      alert("Successfully deleted Technician Diagnostic!");
    } catch (error) {
      alert(`Delete failed: ${error.message}`);
    }
  };

  const handleDeleteDiagnostic = async (diagnosticId) => {
    const confirmDelete = window.confirm("Delete this Diagnostic?");
    if (!confirmDelete) return;

    try {
      await deleteDiagnostic(diagnosticId);
      setDiagnostics((prevDiagnostics) =>
        prevDiagnostics.filter((diag) => diag.id !== diagnosticId)
      );
      setTechDiagMap((prev) => {
        const newMap = { ...prev };
        delete newMap[diagnosticId];
        return newMap;
      });
      alert("Successfully deleted Diagnostic!");
    } catch (error) {
      alert(`Delete failed: ${error.message}`);
    }
  };

  const filteredDiagnostics = diagnostics.filter((diag) => {
    const workshopName = diag.vehicle?.userWorkshop
      ? `${diag.vehicle.userWorkshop.name} ${diag.vehicle.userWorkshop.lastName}`
      : "";
    const vin = diag.vehicle?.vin || "";
    const reason = diag.reasonForVisit || "";
    return (
      diag.id.toString().includes(searchQuery) ||
      vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workshopName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const columns = [
    { title: "VIN", dataIndex: "vin", key: "vin" },
    { title: "Year", dataIndex: "year", key: "year" },
    { title: "Make", dataIndex: "make", key: "make" },
    { title: "Model", dataIndex: "model", key: "model" },
    { title: "Owner", dataIndex: "owner", key: "owner" },
    { title: "Reason", dataIndex: "reason", key: "reason" },
    { title: "Assigned Technician", dataIndex: "technician", key: "technician" },
    {
      title: "Status",
      dataIndex: "hasTechDiag",
      key: "status",
      render: (has) =>
        has ? <Tag color="green">With Diagnostic</Tag> : <Tag color="red">Without Diagnostic</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          {record.hasTechDiag ? (
            <>
              <Button size="small" onClick={() => navigate(`/technicianDiagnostic/edit/${record.techId}`)}>
                Edit
              </Button>
              <Button size="small" danger onClick={() => handleDelete(record.id)}>
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button size="small" type="primary" onClick={() => navigate(`/technicianDiagnostic/create/${record.id}`)}>
                Create
              </Button>
              <Button size="small" danger onClick={() => handleDeleteDiagnostic(record.id)}>
                Delete
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const dataSource = filteredDiagnostics.map((diag) => ({
    id: diag.id,
    vin: diag.vehicle?.vin || "N/A",
    year: diag.vehicle?.year || "N/A",
    owner: diag.vehicle?.userWorkshop
      ? `${diag.vehicle.userWorkshop.name} ${diag.vehicle.userWorkshop.lastName}`
      : "N/A",
    make: diag.vehicle?.make || "N/A",
    model: diag.vehicle?.model || "N/A",
    reason: diag.reasonForVisit,
    technician: diag.assignedTechnician || "N/A",
    hasTechDiag: !!techDiagMap[diag.id],
    techId: techDiagMap[diag.id],
  }));

  if (loading) {
    return (
      <div className="diagnostic-list-spinner">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="diagnostic-list-container">
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
        <h3>Diagnostic List</h3>
        <Button onClick={() => navigate("/VehicleXlsx")}>Ver Excel</Button>
      </Space>

      <Input.Search
        placeholder="Buscar..."
        allowClear
        onSearch={(val) => setSearchQuery(val)}
        style={{ marginBottom: 16 }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 16 }} />}

      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: "No diagnostics found" }}
      />
    </div>
  );
};

export default DiagnosticList;
