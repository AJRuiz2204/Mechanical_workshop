/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Container,
  Spinner,
  Alert,
  Modal,
  Pagination,
} from "react-bootstrap";
import {
  getAllVehicles,
  searchVehicles,
  deleteVehicle,
} from "../../../services/UserWorkshopService";
import VehicleReception from "../VehicleReception/VehicleReception";
import "./VehicleList.css";
import { useNavigate } from "react-router-dom";

const VehicleList = () => {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  // State for the modal:
  const [showReceptionModal, setShowReceptionModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1); // New state for the current page
  const itemsPerPage = 10; // Number of items per page

  // 1. Load all vehicles at the beginning
  const fetchAllVehicles = async () => {
    try {
      const data = await getAllVehicles();
      setVehicles(data);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    fetchAllVehicles();
  }, []);

  // 2. Real-time search (with debounce)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!searchTerm.trim()) {
        // If empty, reload all
        fetchAllVehicles();
        setSearchMessage("");
        return;
      }

      const performSearch = async () => {
        setLoadingSearch(true);
        try {
          const allVehicles = await getAllVehicles(); // Get all vehicles
          // Filter locally
          const filteredVehicles = allVehicles.filter((vehicle) =>
            Object.values(vehicle).some((value) =>
              value
                .toString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
          );
          if (filteredVehicles.length === 0) {
            setSearchMessage("No vehicles found with that term.");
          } else {
            setSearchMessage("");
          }
          setVehicles(filteredVehicles);
        } catch (error) {
          setVehicles([]);
          setSearchMessage("Error performing the search.");
        } finally {
          setLoadingSearch(false);
        }
      };

      performSearch();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // (A) Show the empty modal (create a new Customer/Workshop/Vehicle)
  const handleAddCustomer = () => {
    setEditingId(null); // Indicates that it is a new record
    setShowReceptionModal(true);
  };

  // (B) Open the modal in edit mode
  const handleEdit = (id) => {
    setEditingId(id); // Indicates which record you are going to edit
    setShowReceptionModal(true);
  };

  // (C) After saving or closing in the modal, refresh the list if necessary
  const closeReceptionModal = (shouldRefresh = false) => {
    setShowReceptionModal(false);
    setEditingId(null); // Clear the edit ID
    if (shouldRefresh) {
      fetchAllVehicles();
    }
  };

  // Receive diagnosis (if you keep it in your flow; here only example)
  const handleReception = (id) => {
    navigate(`/diagnostic/${id}`);
  };

  // Delete vehicle
  const handleDelete = async (vin) => {
    if (
      window.confirm(
        `Are you sure you want to delete the vehicle with VIN: ${vin}?`
      )
    ) {
      try {
        await deleteVehicle(vin);
        // Filter the local list
        setVehicles((prev) => prev.filter((v) => v.vin !== vin));
        alert("Vehicle successfully deleted.");
      } catch (error) {
        alert(`Error deleting: ${error.message}`);
      }
    }
  };

  // Calculate the vehicles to display on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVehicles = vehicles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(vehicles.length / itemsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container className="p-4 border rounded mt-4 bg-light">
      <h3>VEHICLE LIST</h3>

      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Search Field */}
        <Form.Control
          type="text"
          placeholder="Search by VIN, Make, Model or Owner Name"
          value={searchTerm}
          onChange={handleSearchChange}
          className="me-3"
        />
        <Button variant="primary" onClick={handleAddCustomer}>
          Add Customer
        </Button>
      </div>

      {loadingSearch && (
        <div className="d-flex justify-content-center mb-3">
          <Spinner animation="border" />
        </div>
      )}

      {searchMessage && (
        <Alert variant="warning" className="mb-3">
          {searchMessage}{" "}
          <Button variant="link" onClick={handleAddCustomer}>
            Add New Customer
          </Button>
        </Alert>
      )}

      {loadingVehicles ? (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          {currentVehicles.length > 0 ? (
            <>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>VIN</th>
                    <th>Make</th>
                    <th>Model</th>
                    <th>Owner</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentVehicles.map((vehicle) => (
                    <tr key={vehicle.id}> {/* Use vehicle.id if unique */}
                      <td>{vehicle.vin}</td>
                      <td>{vehicle.make}</td>
                      <td>{vehicle.model}</td>
                      <td>{vehicle.ownerName || "Unknown"}</td>
                      <td>
                        <Button
                          variant="warning"
                          className="me-2"
                          onClick={() => handleEdit(vehicle.id)}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="info"
                          className="me-2"
                          onClick={() => handleReception(vehicle.id)}
                        >
                          Receive Diagnostic
                        </Button>

                        <Button
                          variant="danger"
                          onClick={() => handleDelete(vehicle.vin)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Pagination>
                {[...Array(totalPages)].map((_, index) => (
                  <Pagination.Item
                    key={index + 1}
                    active={index + 1 === currentPage}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </>
          ) : (
            <p>No vehicles found. Try another search term.</p>
          )}
        </>
      )}

      {/* Modal that contains the VehicleReception form */}
      <Modal
        show={showReceptionModal}
        onHide={() => closeReceptionModal(false)}
        size="xl"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId
              ? "Edit Workshop / Vehicle"
              : "Register Workshop / Vehicle"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <VehicleReception
            editingId={editingId}
            onClose={() => closeReceptionModal(false)}
            afterSubmit={() => closeReceptionModal(true)}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default VehicleList;
