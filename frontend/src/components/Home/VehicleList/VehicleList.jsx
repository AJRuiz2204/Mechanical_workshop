/* eslint-disable no-unused-vars */
// src/components/VehicleList/VehicleList.jsx

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
import "./VehicleList.css"; // Asegúrate de crear este archivo para estilos

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const navigate = useNavigate();

  // 1. Cargar todos los vehículos al iniciar
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

  // 2. Búsqueda en tiempo real
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!searchTerm.trim()) {
        // Si está vacío, recargamos todos los vehículos
        fetchAllVehicles();
        setSearchMessage("");
        return;
      }

      const performSearch = async () => {
        setLoadingSearch(true);
        try {
          const results = await searchVehicles(searchTerm);
          if (results.message) {
            // Si el backend devuelve un objeto { message: "..."}
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
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // 3. Navegar a la vista "Crear Cliente"
  const handleAddCustomer = () => {
    navigate("/vehicle-reception");
  };

  // 4. Recepcionar Diagnóstico: navega a /diagnostic/:id
  const handleReception = (id) => {
    navigate(`/diagnostic/${id}`);
  };

  // 5. Editar Vehículo
  // Ajusta la ruta si tu vista de edición es /edit/:id u otra
  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  // 6. Eliminar Vehículo
  // Llama a la función deleteVehicle (usando VIN o ID, según tu backend)
  const handleDelete = async (vin) => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar el vehículo con VIN: ${vin}?`
      )
    ) {
      try {
        await deleteVehicle(vin);
        // Filtra la lista local para eliminarlo de la tabla
        setVehicles(vehicles.filter((vehicle) => vehicle.vin !== vin));
        alert("Vehículo eliminado exitosamente.");
      } catch (error) {
        alert(`Error al eliminar: ${error.message}`);
      }
    }
  };

  return (
    <Container className="p-4 border rounded mt-4 bg-light">
      <h3>LISTA DE VEHÍCULOS</h3>
      <div className="d-flex justify-content-between align-items-center mb-3">
        {/* Campo de Búsqueda */}
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
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td>{vehicle.vin}</td>
                    <td>{vehicle.make}</td>
                    <td>{vehicle.model}</td>
                    <td>{vehicle.ownerName || "Desconocido"}</td>
                    <td>
                      {/* Botón para Editar */}
                      <Button
                        variant="warning"
                        className="me-2"
                        onClick={() => handleEdit(vehicle.id)}
                      >
                        Editar
                      </Button>

                      <Button
                        variant="info"
                        onClick={() => navigate(`/diagnostic/${vehicle.id}`)}
                      >
                        Recepcionar Diagnóstico
                      </Button>

                      {/* Botón para Eliminar */}
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
            <p>
              No se encontraron vehículos. Intenta con otro término de búsqueda.
            </p>
          )}
        </>
      )}
    </Container>
  );
};

export default VehicleList;
