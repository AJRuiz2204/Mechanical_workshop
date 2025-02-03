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

/**
 * VehicleList Component
 *
 * This component renders a list of vehicles with search, pagination,
 * and options to add, edit, receive diagnostics, or delete a vehicle.
 * A modal is used to show the VehicleReception form for creating or editing records.
 *
 * @returns {JSX.Element} The VehicleList component.
 */
const VehicleList = () => {
  const navigate = useNavigate();

  // States to hold vehicles, search term, loading flags, and messages
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  // State for showing the VehicleReception modal and managing edit mode
  const [showReceptionModal, setShowReceptionModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Number of items per page

  /**
   * fetchAllVehicles - Loads all vehicles from the service.
   */
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

  // Load vehicles on component mount
  useEffect(() => {
    fetchAllVehicles();
  }, []);

  /**
   * handleSearchChange - Handles changes to the search input.
   *
   * @param {Object} e - The change event from the search input.
   */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Debounce search effect: when the searchTerm changes, perform a search after a short delay.
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!searchTerm.trim()) {
        // If search term is empty, reload all vehicles and clear any messages.
        fetchAllVehicles();
        setSearchMessage("");
        return;
      }

      const performSearch = async () => {
        setLoadingSearch(true);
        try {
          const allVehicles = await getAllVehicles(); // Retrieve all vehicles
          // Filter vehicles locally based on any field containing the search term.
          const filteredVehicles = allVehicles.filter((vehicle) =>
            Object.values(vehicle).some((value) =>
              value.toString().toLowerCase().includes(searchTerm.toLowerCase())
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

  /**
   * performSearch - An alternative search function that uses the service directly.
   */
  const performSearch = async () => {
    setLoadingSearch(true);
    try {
      const results = await searchVehicles(searchTerm);
      if (!results.success || results.data.length === 0) {
        setVehicles([]);
        setSearchMessage(results.message || "No vehicles found.");
      } else {
        setVehicles(results.data);
        setSearchMessage("");
      }
    } catch (error) {
      setVehicles([]);
      setSearchMessage("Error performing the search.");
    } finally {
      setLoadingSearch(false);
    }
  };

  /**
   * handleAddCustomer - Opens the modal to create a new customer/workshop/vehicle.
   */
  const handleAddCustomer = () => {
    setEditingId(null); // Indicate creation mode
    setShowReceptionModal(true);
  };

  /**
   * handleEdit - Opens the modal in edit mode for a specific record.
   *
   * @param {number} id - The ID of the vehicle record to edit.
   */
  const handleEdit = (id) => {
    setEditingId(id);
    setShowReceptionModal(true);
  };

  /**
   * closeReceptionModal - Closes the modal and refreshes the list if needed.
   *
   * @param {boolean} shouldRefresh - If true, reload the vehicles list.
   */
  const closeReceptionModal = (shouldRefresh = false) => {
    setShowReceptionModal(false);
    setEditingId(null);
    if (shouldRefresh) {
      fetchAllVehicles();
    }
  };

  /**
   * handleReception - Navigates to the diagnostic page for the specified vehicle.
   *
   * @param {number} id - The ID of the vehicle to receive a diagnostic.
   */
  const handleReception = (id) => {
    navigate(`/diagnostic/${id}`);
  };

  /**
   * handleDelete - Deletes a vehicle record after confirmation.
   *
   * @param {string} vin - The VIN of the vehicle to delete.
   */
  const handleDelete = async (vin) => {
    if (
      window.confirm(
        `Are you sure you want to delete the vehicle with VIN: ${vin}?`
      )
    ) {
      try {
        await deleteVehicle(vin);
        // Remove the deleted vehicle from the local state.
        setVehicles((prev) => prev.filter((v) => v.vin !== vin));
        alert("Vehicle successfully deleted.");
      } catch (error) {
        alert(`Error deleting: ${error.message}`);
      }
    }
  };

  // Calculate indices for pagination.
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVehicles = vehicles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(vehicles.length / itemsPerPage);

  /**
   * handlePageChange - Changes the current page.
   *
   * @param {number} pageNumber - The page number to navigate to.
   */
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
          placeholder="Search by VIN or Customer Name"
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
                    <tr key={vehicle.id}>
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

      {/* Modal containing the VehicleReception form */}
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
