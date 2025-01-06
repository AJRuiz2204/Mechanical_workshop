// src/components/VehicleList/VehicleList.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Form,
  Container,
  Spinner,
  Alert,
  Modal
} from "react-bootstrap";
import {
  getAllVehicles,
  searchVehicles,
  deleteVehicle,
} from "../../../services/UserWorkshopService";
import VehicleReception from "../VehicleReception/VehicleReception";
import "./VehicleList.css";

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  // Estado para controlar el modal:
  const [showReceptionModal, setShowReceptionModal] = useState(false);

  // 1. Cargar todos los vehículos al inicio
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

  // 2. Búsqueda en tiempo real (con debounce)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!searchTerm.trim()) {
        // Si está vacío, recargar todos
        fetchAllVehicles();
        setSearchMessage("");
        return;
      }

      const performSearch = async () => {
        setLoadingSearch(true);
        try {
          const results = await searchVehicles(searchTerm);
          if (results.message) {
            // Si el backend retorna un objeto { message: "..." }
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

  // (A) En lugar de navegar, abrimos el modal
  const handleAddCustomer = () => {
    setShowReceptionModal(true);
  };

  // (B) Después de guardar o cerrar en “VehicleReception”, refrescamos la lista
  const closeReceptionModal = (shouldRefresh = false) => {
    setShowReceptionModal(false);
    if (shouldRefresh) {
      fetchAllVehicles();
    }
  };

  // Recibir diagnóstico (mantenemos la navegación si tu app lo requiere)
  const handleReception = (id) => {
    // navigate(`/diagnostic/${id}`) -- O alguna acción
    alert(`Aquí irías a /diagnostic/${id} si lo deseas`);
  };

  // Editar vehículo (mantenemos la navegación o podrías abrir otro modal)
  const handleEdit = (id) => {
    // navigate(`/edit/${id}`)
    alert(`Aquí abrirías la vista para editar el ID ${id}`);
  };

  // Eliminar vehículo
  const handleDelete = async (vin) => {
    if (
      window.confirm(
        `Are you sure you want to delete the vehicle with VIN: ${vin}?`
      )
    ) {
      try {
        await deleteVehicle(vin);
        // Filtrar la lista local
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
          ) : (
            <p>No vehicles found. Try another search term.</p>
          )}
        </>
      )}

      {/* Modal que contiene el formulario de VehicleReception */}
      <Modal
        show={showReceptionModal}
        onHide={() => closeReceptionModal(false)}
        size="lg" // o "xl" si necesitas más espacio
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Register Workshop / Vehicle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <VehicleReception
            // Enviamos dos props:
            onClose={() => closeReceptionModal(false)}
            afterSubmit={() => closeReceptionModal(true)}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default VehicleList;
