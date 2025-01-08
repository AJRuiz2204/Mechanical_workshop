/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// src/components/VehicleReception/VehicleReception.jsx

import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Container,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  createUserWorkshop,
  getUserWorkshopById,
  updateUserWorkshop,
} from "../../../services/UserWorkshopService";
import { useParams } from "react-router-dom";

const VehicleReception = ({
  onClose, // función para cerrar modal
  afterSubmit, // función opcional para refrescar datos en el padre
  editingId, // si deseas editar un registro en particular
}) => {
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
        state: "",
      },
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Opcional: si vas a usar la ruta /vehicle-reception/:id
  // pero en este ejemplo, normalmente no usaremos useParams
  const { id: routeId } = useParams();

  // ID a editar, ya sea por prop (editingId) o desde la ruta
  const finalId = editingId || routeId || null;

  // Si se está editando un registro (finalId existe), cargar data
  useEffect(() => {
    if (finalId) {
      setLoading(true);
      getUserWorkshopById(finalId)
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
        .catch((error) => alert(`Error loading data: ${error.message}`))
        .finally(() => setLoading(false));
    }
  }, [finalId]);

  // Validaciones (idénticas a antes, omito comentarios)
  const validateName = (name) => /^[A-Za-z\s]+$/.test(name);
  const validateEmail = (email) =>
    /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
  const validatePhoneNumber = (number) =>
    /^\(\d{3}\)\s\d{3}-\d{4}$/.test(number);
  const validateYear = (year) => /^\d{4}$/.test(year);
  const validateNotEmpty = (value) => {
    if (typeof value === "string") {
      return value.trim() !== "";
    }
    return true;
  };

  // Manejadores de cambio en campos principales
  const handleInputChange = (field, value) => {
    let error = "";
    switch (field) {
      case "name":
      case "lastName":
        if (!validateNotEmpty(value)) {
          error = "Este campo es obligatorio.";
        } else if (!validateName(value)) {
          error = "Solo se permiten letras y espacios.";
        }
        break;
      case "email":
        if (!validateNotEmpty(value)) {
          error = "Este campo es obligatorio.";
        } else if (!validateEmail(value)) {
          error = "Correo electrónico inválido.";
        }
        break;
      case "primaryNumber":
      case "secondaryNumber":
        if (validateNotEmpty(value) && !validatePhoneNumber(value)) {
          error = "Número de teléfono inválido. Formato: (000) 000-0000";
        }
        break;
      default:
        if (field !== "noTax" && !validateNotEmpty(value)) {
          error = "Este campo es obligatorio.";
        }
    }
    setErrors((prev) => ({ ...prev, [field]: error }));

    setUserWorkshop((prev) => ({
      ...prev,
      [field]: field === "noTax" ? !prev.noTax : value,
    }));
  };

  // Manejo de vehículos
  const handleVehicleChange = (index, field, value) => {
    let error = "";
    if (field === "year") {
      if (!validateNotEmpty(value)) {
        error = "Este campo es obligatorio.";
      } else if (!validateYear(value)) {
        error = "Debe ser un año válido de 4 dígitos.";
      }
    } else {
      if (!validateNotEmpty(value)) {
        error = "Este campo es obligatorio.";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [`vehicle_${index}_${field}`]: error,
    }));

    setUserWorkshop((prev) => {
      const updatedVehicles = [...prev.vehicles];
      updatedVehicles[index][field] = value;
      return { ...prev, vehicles: updatedVehicles };
    });
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (match) {
      let formatted = "";
      if (match[1]) formatted += `(${match[1]}`;
      if (match[2]) formatted += `) ${match[2]}`;
      if (match[3]) formatted += `-${match[3]}`;
      return formatted;
    }
    return value;
  };

  const handlePhoneNumberChange = (field, value) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange(field, formatted);
  };

  const addVehicle = () => {
    setUserWorkshop((prev) => ({
      ...prev,
      vehicles: [
        ...prev.vehicles,
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
    }));
  };

  const deleteVehicleRow = (index) => {
    setUserWorkshop((prev) => {
      const updated = prev.vehicles.filter((_, i) => i !== index);
      return { ...prev, vehicles: updated };
    });
    // Eliminar errores asociados a ese vehículo
    setErrors((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((key) => {
        if (key.startsWith(`vehicle_${index}_`)) {
          delete updated[key];
        }
      });
      return updated;
    });
  };

  // LIMPIAR CAMPOS al finalizar la operación
  const resetForm = () => {
    setUserWorkshop({
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
          state: "",
        },
      ],
    });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validación final ...
    // (Opcional: replicar tu lógica de verificación de todos los campos)
    // Si algo falla, return sin continuar.

    setIsSubmitting(true);

    const payload = {
      id: finalId ? parseInt(finalId) : 0,
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
      vehicles: userWorkshop.vehicles.map((v) => ({
        vin: v.vin,
        make: v.make,
        model: v.model,
        year: v.year,
        engine: v.engine,
        plate: v.plate,
        state: v.state,
      })),
    };

    try {
      if (finalId) {
        // Editar
        await updateUserWorkshop(finalId, payload);
        alert("Workshop successfully updated.");
      } else {
        // Crear
        await createUserWorkshop(payload);
        alert("Workshop successfully created.");
      }

      // 1. Limpiar campos
      resetForm();

      // 2. Llamar a afterSubmit() si deseas refrescar la lista en el padre
      if (afterSubmit) afterSubmit();

      // 3. Cerrar modal
      if (onClose) onClose();
      navigate("/vehicle-list"); // Return to the main screen
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Muestra un spinner mientras carga los datos para edición
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
    <Container className="p-3">
      <Form onSubmit={handleSubmit}>
        <h4 className="mb-3">
          {finalId ? "Edit Workshop" : "Register Workshop"}
        </h4>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                isInvalid={!!errors.name}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="lastName">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                isInvalid={!!errors.lastName}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.lastName}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        {/* Ejemplo con email y primaryNumber */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={userWorkshop.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                isInvalid={!!errors.email}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="primaryNumber">
              <Form.Label>Primary Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="(000) 000-0000"
                value={userWorkshop.primaryNumber}
                onChange={(e) =>
                  handlePhoneNumberChange("primaryNumber", e.target.value)
                }
                isInvalid={!!errors.primaryNumber}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.primaryNumber}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="secondaryNumber">
              <Form.Label>Secondary Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="(000) 000-0000"
                value={userWorkshop.secondaryNumber}
                onChange={(e) =>
                  handlePhoneNumberChange("secondaryNumber", e.target.value)
                }
                isInvalid={!!errors.secondaryNumber}
              />
              <Form.Control.Feedback type="invalid">
                {errors.secondaryNumber}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        {/* Dirección, Ciudad, Estado, ZIP */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                isInvalid={!!errors.address}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.address}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="city">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                isInvalid={!!errors.city}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.city}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="state">
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                isInvalid={!!errors.state}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.state}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group controlId="zip">
              <Form.Label>Zip Code</Form.Label>
              <Form.Control
                type="text"
                value={userWorkshop.zip}
                onChange={(e) => handleInputChange("zip", e.target.value)}
                isInvalid={!!errors.zip}
                required
              />
              <Form.Control.Feedback type="invalid">
                {errors.zip}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        {/* noTax y Profile si así lo requieres */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group controlId="profile">
              <Form.Label>Profile</Form.Label>
              <Form.Select
                value={userWorkshop.profile}
                onChange={(e) => handleInputChange("profile", e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="technician">Technician</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6} className="d-flex align-items-center">
            <Form.Group controlId="noTax">
              <Form.Check
                type="checkbox"
                label="Exento de Impuestos (noTax)"
                checked={userWorkshop.noTax}
                onChange={() => handleInputChange("noTax")}
              />
            </Form.Group>
          </Col>
        </Row>

        {/* Vehicles */}
        <h5 className="mt-4 mb-2">Vehicle(s) Information</h5>
        {userWorkshop.vehicles.map((vehicle, index) => (
          <div key={index} className="border rounded p-2 mb-2 bg-white">
            <Row>
              <Col md={3}>
                <Form.Group controlId={`vin_${index}`}>
                  <Form.Label>VIN (17 chars)</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={17}
                    value={vehicle.vin}
                    onChange={(e) =>
                      handleVehicleChange(index, "vin", e.target.value)
                    }
                    isInvalid={!!errors[`vehicle_${index}_vin`]}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`vehicle_${index}_vin`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId={`make_${index}`}>
                  <Form.Label>Make</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.make}
                    onChange={(e) =>
                      handleVehicleChange(index, "make", e.target.value)
                    }
                    isInvalid={!!errors[`vehicle_${index}_make`]}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`vehicle_${index}_make`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId={`model_${index}`}>
                  <Form.Label>Model</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.model}
                    onChange={(e) =>
                      handleVehicleChange(index, "model", e.target.value)
                    }
                    isInvalid={!!errors[`vehicle_${index}_model`]}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`vehicle_${index}_model`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                {/* Eliminar vehículo si hay más de uno */}
                {userWorkshop.vehicles.length > 1 && (
                  <Button
                    variant="danger"
                    className="mt-4"
                    onClick={() => deleteVehicleRow(index)}
                  >
                    Delete
                  </Button>
                )}
              </Col>
            </Row>
            <Row className="mt-2">
              <Col md={3}>
                <Form.Group controlId={`year_${index}`}>
                  <Form.Label>Year</Form.Label>
                  <Form.Control
                    type="text"
                    maxLength={4}
                    value={vehicle.year}
                    onChange={(e) =>
                      handleVehicleChange(index, "year", e.target.value)
                    }
                    isInvalid={!!errors[`vehicle_${index}_year`]}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`vehicle_${index}_year`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId={`engine_${index}`}>
                  <Form.Label>Engine</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.engine}
                    onChange={(e) =>
                      handleVehicleChange(index, "engine", e.target.value)
                    }
                    isInvalid={!!errors[`vehicle_${index}_engine`]}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`vehicle_${index}_engine`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId={`plate_${index}`}>
                  <Form.Label>Plate</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.plate}
                    onChange={(e) =>
                      handleVehicleChange(index, "plate", e.target.value)
                    }
                    isInvalid={!!errors[`vehicle_${index}_plate`]}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`vehicle_${index}_plate`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId={`state_${index}`}>
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    value={vehicle.state}
                    onChange={(e) =>
                      handleVehicleChange(index, "state", e.target.value)
                    }
                    isInvalid={!!errors[`vehicle_${index}_state`]}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors[`vehicle_${index}_state`]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </div>
        ))}
        <Button variant="primary" onClick={addVehicle} className="mb-3">
          + Add Vehicle
        </Button>

        <div className="text-end">
          <Button
            type="submit"
            variant="success"
            className="me-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
          <Button variant="secondary" onClick={() => navigate("/vehicle-list")}>
            Cancel
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default VehicleReception;
