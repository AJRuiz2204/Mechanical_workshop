/* eslint-disable no-unused-vars */
// src/components/VehicleList/VehicleList.jsx
import React, { useEffect, useState } from "react";
import { Table, Button, Form, Container, Spinner, Alert } from "react-bootstrap";
import {
  getAllVehicles,
  searchVehicles,
  // Eliminamos la importación de deleteUserWorkshop si ya no la usas para esta vista
  deleteVehicle, // <-- IMPORTANTE: Función para eliminar el vehículo
} from "../../../services/UserWorkshopService";
import { useNavigate } from "react-router-dom";
import "./VehicleList.css"; // Asegúrate de crear este archivo para estilos

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const navigate = useNavigate();

  // 1. Carga todos los vehículos al montar el componente
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

  // 2. Manejar la eliminación de un vehículo
  const handleDelete = async (vin) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el vehículo con VIN: ${vin}?`)) {
      try {
        await deleteVehicle(vin); 
        // Actualiza el estado local para que desaparezca el vehículo de la lista
        setVehicles(vehicles.filter((veh) => veh.vin !== vin));
        alert("Vehículo eliminado exitosamente.");
      } catch (error) {
        alert(`Error al eliminar: ${error.message}`);
      }
    }
  };

  // 3. Manejar la edición de un vehículo
  const handleEdit = (vin) => {
    // Ajusta la ruta para editar tu vehículo por VIN o por ID
    navigate(`/edit/${vin}`);
  };

  // 4. Manejar la recepción al diagnóstico
  const handleReception = (vin) => {
    navigate(`/diagnostic/${vin}`);
  };

  // 5. Manejar la adición de un nuevo cliente
  const handleAddCustomer = () => {
    navigate("/vehicle-reception");
  };

  // 6. Manejar el campo de búsqueda (VIN o nombre del cliente)
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 7. Implementar búsqueda en tiempo real con debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim() === "") {
        // Campo vacío => recargar todos los vehículos
        fetchAllVehicles();
        setSearchMessage("");
        return;
      }

      const performSearch = async () => {
        setLoadingSearch(true);
        try {
          const results = await searchVehicles(searchTerm);
          if (results.message) {
            setVehicles([]);
            setSearchMessage(results.message);
          } else {
            setVehicles(results);
            setSearchMessage("");
          }
        } catch (error) {
          setVehicles([]);
          setSearchMessage("Error al realizar la búsqueda.");
        } finally {
          setLoadingSearch(false);
        }
      };

      performSearch();
    }, 300); // Esperamos 300ms después de dejar de escribir
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <Container className="p-4 border rounded mt-4 bg-light">
      <h3>LISTA DE VEHÍCULOS</h3>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Control
          type="text"
          placeholder="Buscar por VIN o Nombre del Cliente"
          value={searchTerm}
          onChange={handleSearchChange}
          className="me-3"
        />
        <Button variant="primary" onClick={handleAddCustomer}>
          Agregar Cliente
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
            Agregar Nuevo Cliente
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
                  <th>Marca</th>
                  <th>Modelo</th>
                  <th>Propietario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle, index) => (
                  <tr key={index}>
                    <td>{vehicle.vin}</td>
                    <td>{vehicle.make}</td>
                    <td>{vehicle.model}</td>
                    <td>{vehicle.ownerName}</td>
                    <td>
                      <Button
                        variant="warning"
                        className="me-2"
                        onClick={() => handleEdit(vehicle.vin)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="info"
                        className="me-2"
                        onClick={() => handleReception(vehicle.vin)}
                      >
                        Recepcionar Diagnóstico
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(vehicle.vin)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No se encontraron vehículos. Intenta con otro término de búsqueda.</p>
          )}
        </>
      )}
    </Container>
  );
};

export default VehicleList;
