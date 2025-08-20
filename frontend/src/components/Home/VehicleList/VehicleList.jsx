import { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Card,
  Spin,
  Alert,
  Modal,
  Pagination,
  Space,
  message,
  Typography,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  FileSearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  getAllVehicles,
  deleteVehicle,
  searchVehicles,
} from "../../../services/UserWorkshopService";
import VehicleReception from "../VehicleReception/VehicleReception";
import UserWorkshopEditModal from "./UserWorkshopEditModal";

const { Search } = Input;
const { confirm } = Modal;
const { Title, Text } = Typography;

const VehicleList = () => {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  const [showReceptionModal, setShowReceptionModal] = useState(false);
  const [showUserWorkshopModal, setShowUserWorkshopModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingUserWorkshopId, setEditingUserWorkshopId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchAllVehicles = async () => {
    try {
      const data = await getAllVehicles();
      setVehicles(data);
      setSearchMessage("");
    } catch (err) {
      message.error(`Error loading vehicles: ${err.message}`);
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    fetchAllVehicles();
  }, []);

  // Search with debounce using API
  useEffect(() => {
    const handler = setTimeout(async () => {
      const term = searchTerm.trim();
      if (!term) {
        fetchAllVehicles();
        return;
      }
      setLoadingSearch(true);
      try {
        const searchResults = await searchVehicles(term);
        setVehicles(searchResults);
        setSearchMessage(searchResults.length === 0 ? "No vehicles found." : "");
      } catch (err) {
        console.error("Search error:", err);
        setVehicles([]);
        setSearchMessage("Error searching vehicles.");
      } finally {
        setLoadingSearch(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const onSearchChange = (value) => {
    setSearchTerm(value);
  };

  const handleAdd = () => {
    setEditingId(null);
    setShowReceptionModal(true);
  };

  const handleEdit = (vehicleId) => {
    // Find the vehicle to get UserWorkshopId
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) {
      message.error("Vehicle not found");
      return;
    }

    // Count how many vehicles belong to this UserWorkshop
    const userWorkshopVehicles = vehicles.filter(
      (v) => v.userWorkshopId === vehicle.userWorkshopId
    );

    if (userWorkshopVehicles.length > 1) {
      // Multiple vehicles - use UserWorkshop edit modal
      setEditingUserWorkshopId(vehicle.userWorkshopId);
      setShowUserWorkshopModal(true);
    } else {
      // Single vehicle - use existing VehicleReception modal
      setEditingId(vehicleId);
      setShowReceptionModal(true);
    }
  };

  const handleReception = (id) => {
    navigate(`/diagnostic/${id}`);
  };

  const closeModal = (refresh = false) => {
    setShowReceptionModal(false);
    setEditingId(null);
    if (refresh) fetchAllVehicles();
  };

  const closeUserWorkshopModal = (refresh = false) => {
    setShowUserWorkshopModal(false);
    setEditingUserWorkshopId(null);
    if (refresh) fetchAllVehicles();
  };

  const handleDelete = (vin) => {
    confirm({
      title: "Delete Vehicle?",
      content: `Are you sure you want to delete the vehicle with VIN "${vin}"?`,
      onOk: async () => {
        try {
          await deleteVehicle(vin);
          setVehicles((prev) => prev.filter((v) => v.vin !== vin));
          message.success("Vehicle deleted successfully.");
        } catch (err) {
          message.error(`Error deleting: ${err.message}`);
        }
      },
    });
  };

  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentVehicles = vehicles.slice(indexFirst, indexLast);
  const totalItems = vehicles.length;

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  const columns = [
    { title: "VIN", dataIndex: "vin", key: "vin" },
    { title: "Make", dataIndex: "make", key: "make" },
    { title: "Model", dataIndex: "model", key: "model" },
    {
      title: "Owner",
      dataIndex: "ownerName",
      key: "ownerName",
      render: (text) => text || "Unknown",
    },
    {
      title: "Type",
      key: "type",
      render: (_, record) => {
        const userWorkshopVehicles = vehicles.filter(
          (v) => v.userWorkshopId === record.userWorkshopId
        );
        return userWorkshopVehicles.length > 1 ? (
          <Text type="warning">Multi-Vehicle Owner</Text>
        ) : (
          <Text>Single Vehicle</Text>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record.id)}>
            Edit
          </Button>
          <Button
            icon={<FileSearchOutlined />}
            onClick={() => handleReception(record.id)}
          >
            Diagnostic
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.vin)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card className="vehicle-list-card" style={{ margin: "24px" }}>
      <Title level={4}>VEHICLE LIST</Title>

      <Space style={{ marginBottom: 16 }}>
        <Search
          placeholder="Search by VIN, Make, Model or Owner"
          onChange={(e) => onSearchChange(e.target.value)}
          onSearch={onSearchChange}
          loading={loadingSearch}
          allowClear
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Vehicle
        </Button>
      </Space>

      {searchMessage && (
        <Alert
          message={searchMessage || "No vehicles found."}
          type="warning"
          showIcon
          action={
            <Button type="link" onClick={handleAdd}>
              Register New
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {loadingVehicles ? (
        <Spin tip="Loading vehicles..." />
      ) : (
        <>
          <Table
            dataSource={currentVehicles}
            columns={columns}
            rowKey="id"
            pagination={false}
            bordered
          />

          {currentVehicles.length === 0 && !searchMessage && (
            <Text>No vehicles found. Try another search.</Text>
          )}

          {totalItems > itemsPerPage && (
            <Pagination
              current={currentPage}
              pageSize={itemsPerPage}
              total={totalItems}
              onChange={onPageChange}
              style={{ marginTop: 16, textAlign: "right" }}
            />
          )}
        </>
      )}

      <Modal
        open={showReceptionModal}
        footer={null}
        onCancel={() => closeModal(false)}
        width="80%"
        styles={{
          body: {
            maxHeight: "calc(100vh - 120px)",
            overflow: "auto",
            paddingBottom: 24,
          },
        }}
        destroyOnClose
      >
        <VehicleReception
          editingId={editingId}
          onClose={() => closeModal(false)}
          afterSubmit={() => closeModal(true)}
        />
      </Modal>

      <UserWorkshopEditModal
        visible={showUserWorkshopModal}
        onCancel={() => closeUserWorkshopModal(false)}
        userWorkshopId={editingUserWorkshopId}
        onSuccess={() => closeUserWorkshopModal(true)}
      />
    </Card>
  );
};

export default VehicleList;
