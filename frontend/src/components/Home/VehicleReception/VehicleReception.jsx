/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Form, Button, Row, Col, Container, Spinner } from "react-bootstrap";
import {
  createUserWorkshop,
  getUserWorkshopById,
  updateUserWorkshop,
} from "../../../services/UserWorkshopService";
import { useNavigate, useParams } from "react-router-dom";

const VehicleReception = () => {
  const [userWorkshop, setUserWorkshop] = useState({
    email: "",
    name: "",
    lastName: "",
    profile: "admin",
    address: "",
    city: "",
    state: "",
    zip: "",
    primaryNumber: "",
    secondaryNumber: "",
    noTax: false,
    vehicles: [
      {
        vin: "",
        make: "",
        model: "",
        year: "",
        engine: "",
        plate: "",
        state: "", // Cambié "vehicleState" a "state" para consistencia
      },
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // Para obtener el ID si se está editando

  useEffect(() => {
    if (id) {
      setLoading(true);
      getUserWorkshopById(id)
        .then((data) => {
          setUserWorkshop({
            email: data.email,
            name: data.name,
            lastName: data.lastName,
            profile: data.profile,
            address: data.address,
            city: data.city,
            state: data.state,
            zip: data.zip,
            primaryNumber: data.primaryNumber,
            secondaryNumber: data.secondaryNumber,
            noTax: data.noTax,
            vehicles: data.vehicles.map((v) => ({
              vin: v.vin,
              make: v.make,
              model: v.model,
              year: v.year,
              engine: v.engine,
              plate: v.plate,
              state: v.state,
            })),
          });
        })
        .catch((error) => alert(`Error: ${error.message}`))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleInputChange = (field, value) => {
    setUserWorkshop({ ...userWorkshop, [field]: value });
  };

  const handleVehicleChange = (index, field, value) => {
    const updatedVehicles = [...userWorkshop.vehicles];
    updatedVehicles[index][field] = value;
    setUserWorkshop({ ...userWorkshop, vehicles: updatedVehicles });
  };

  const addVehicle = () => {
    setUserWorkshop({
      ...userWorkshop,
      vehicles: [
        ...userWorkshop.vehicles,
        {
          vin: "",
          make: "",
          model: "",
          year: "",
          engine: "",
          plate: "",
          state: "",
        },
      ],
    });
  };

  const deleteVehicle = (index) => {
    const updatedVehicles = userWorkshop.vehicles.filter((_, i) => i !== index);
    setUserWorkshop({ ...userWorkshop, vehicles: updatedVehicles });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Evitar múltiples envíos
    if (isSubmitting) return;

    setIsSubmitting(true);

    const payload = {
      id: id ? parseInt(id) : 0,
      email: userWorkshop.email,
      name: userWorkshop.name,
      lastName: userWorkshop.lastName,
      profile: userWorkshop.profile,
      address: userWorkshop.address,
      city: userWorkshop.city,
      state: userWorkshop.state,
      zip: userWorkshop.zip,
      primaryNumber: userWorkshop.primaryNumber,
      secondaryNumber: userWorkshop.secondaryNumber,
      noTax: userWorkshop.noTax,
      vehicles: userWorkshop.vehicles.map((vehicle) => ({
        vin: vehicle.vin,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        engine: vehicle.engine,
        plate: vehicle.plate,
        state: vehicle.state,
      })),
    };

    try {
      if (id) {
        await updateUserWorkshop(id, payload);
        alert("Taller actualizado exitosamente.");
      } else {
        await createUserWorkshop(payload);
        alert("Taller creado exitosamente.");
      }
      navigate("/home"); // Volver a la lista
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="p-4 border rounded mt-4 bg-light">
      <Form onSubmit={handleSubmit}>
        <h3 className="mb-4">
          {id ? "Editar Taller Mecánico" : "Registrar Taller Mecánico"}
        </h3>

        {/* Datos del Taller */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Apellido</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                value={userWorkshop.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Número Primario</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.primaryNumber}
                onChange={(e) =>
                  handleInputChange("primaryNumber", e.target.value)
                }
                required
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Número Secundario</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.secondaryNumber}
                onChange={(e) =>
                  handleInputChange("secondaryNumber", e.target.value)
                }
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Ciudad</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Estado</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Código Postal</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.zip}
                onChange={(e) => handleInputChange("zip", e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Información del Vehículo */}
        <h4 className="mt-4 mb-3">Información del Vehículo</h4>
        {userWorkshop.vehicles.map((vehicle, index) => (
          <div key={index} className="border rounded p-3 mb-3 bg-white">
            <Row>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>VIN (17 caracteres)</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={17} // Esto evita que se escriba más de 17
                    value={vehicle.vin}
                    onChange={(e) =>
                      handleVehicleChange(index, "vin", e.target.value)
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Marca</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.make}
                    onChange={(e) =>
                      handleVehicleChange(index, "make", e.target.value)
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Modelo</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.model}
                    onChange={(e) =>
                      handleVehicleChange(index, "model", e.target.value)
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                {userWorkshop.vehicles.length > 1 && (
                  <Button
                    variant="danger"
                    className="mt-4"
                    onClick={() => deleteVehicle(index)}
                  >
                    Eliminar
                  </Button>
                )}
              </Col>
            </Row>
            <Row className="mt-2">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Año</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.year}
                    onChange={(e) =>
                      handleVehicleChange(index, "year", e.target.value)
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Motor</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.engine}
                    onChange={(e) =>
                      handleVehicleChange(index, "engine", e.target.value)
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Placa</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.plate}
                    onChange={(e) =>
                      handleVehicleChange(index, "plate", e.target.value)
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Estado</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.state}
                    onChange={(e) =>
                      handleVehicleChange(index, "state", e.target.value)
                    }
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        ))}

        <Button variant="primary" onClick={addVehicle} className="mb-3">
          Agregar Vehículo
        </Button>

        <div className="d-flex justify-content-end">
          <Button
            type="submit"
            variant="success"
            className="me-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
          <Button variant="secondary" onClick={() => navigate("/")}>
            Cancelar
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default VehicleReception;
