/* eslint-disable no-unused-vars */
// Frontend: src/components/VehicleList/VehicleList.jsx

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Container,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  getAllVehicles,
  searchVehicles,
  deleteVehicle,
} from "../../../services/UserWorkshopService";
import "./VehicleList.css";

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const navigate = useNavigate();

  // 1. Load all vehicles on initialization
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

  // 2. Real-time search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!searchTerm.trim()) {
        // If empty, reload all vehicles
        fetchAllVehicles();
        setSearchMessage("");
        return;
      }

      const performSearch = async () => {
        setLoadingSearch(true);
        try {
          const results = await searchVehicles(searchTerm);
          if (results.message) {
            // If the backend returns an object { message: "..." }
            setVehicles([]);
            setSearchMessage(results.message);
          } else {
            setVehicles(results);
            setSearchMessage("");
          }
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

  // 3. Navigate to the "Add Customer" view
  const handleAddCustomer = () => {
    navigate("/vehicle-reception");
  };

  // 4. Receive Diagnostic: navigate to /diagnostic/:id
  const handleReception = (id) => {
    navigate(`/diagnostic/${id}`);
  };

  // 5. Edit Vehicle
  // Adjust the route if your edit view is /edit/:id or another
  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  // 6. Delete Vehicle
  // Call the deleteVehicle function (using VIN or ID, depending on your backend)
  const handleDelete = async (vin) => {
    if (
      window.confirm(
        `Are you sure you want to delete the vehicle with VIN: ${vin}?`
      )
    ) {
      try {
        await deleteVehicle(vin);
        // Filter the local list to remove it from the table
        setVehicles(vehicles.filter((vehicle) => vehicle.vin !== vin));
        alert("Vehicle successfully deleted.");
      } catch (error) {
        alert(`Error deleting: ${error.message}`);
      }
    }
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
          {vehicles.length > 0 ? (
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
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.vin}</td>
                    <td>{vehicle.make}</td>
                    <td>{vehicle.model}</td>
                    <td>{vehicle.ownerName || "Unknown"}</td>
                    <td>
                      {/* Edit Button */}
                      <Button
                        variant="warning"
                        className="me-2"
                        onClick={() => handleEdit(vehicle.id)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="info"
                        onClick={() => navigate(`/diagnostic/${vehicle.id}`)}
                      >
                        Receive Diagnostic
                      </Button>

                      {/* Delete Button */}
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
          ) : (
            <p>
              No vehicles found. Try another search term.
            </p>
          )}
        </>
      )}
    </Container>
  );
};

export default VehicleList;
