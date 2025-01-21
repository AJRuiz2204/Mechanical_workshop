/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
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
  getUserWorkshopByIdWithVehicles, // Importa el servicio corregido
  updateUserWorkshop,
} from "../../../services/UserWorkshopService";

const VehicleReception = ({
  onClose, // Función para cerrar el modal
  afterSubmit, // Función opcional para refrescar datos en el componente padre
  editingId, // ID para editar un registro en particular
}) => {
  const [userWorkshop, setUserWorkshop] = useState({
    email: "",
    name: "",
    lastName: "",
    profile: "",
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
  const [submitError, setSubmitError] = useState(null);

  // Función para obtener el perfil del usuario desde localStorage
  const getProfileFromLocalStorage = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.profile || "";
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        return "";
      }
    }
    return "";
  };

  // Cargar datos si editingId existe
  useEffect(() => {
    const loadData = async () => {
      if (editingId) {
        setLoading(true);
        try {
          const token = localStorage.getItem("token"); // <-- Obtiene el token
          const data = await getUserWorkshopByIdWithVehicles(editingId, token); // <-- Pasa el token
          console.log("DATA RECEIVED =>", data);

          if (!data) {
            throw new Error("No se encontraron datos para el ID proporcionado");
          }

          const storedProfile = getProfileFromLocalStorage();
          if (!storedProfile) {
            throw new Error("No se encontró el perfil del usuario");
          }

          // Asegurar que los datos existan antes de asignarlos
          setUserWorkshop({
            email: data?.email ?? "",
            name: data?.name ?? "",
            lastName: data?.lastName ?? "",
            profile: storedProfile,
            address: data?.address ?? "",
            city: data?.city ?? "",
            state: data?.state ?? "",
            zip: data?.zip ?? "",
            primaryNumber: data?.primaryNumber ?? "",
            secondaryNumber: data?.secondaryNumber ?? "",
            noTax: data?.noTax ?? false,
            vehicles: Array.isArray(data?.vehicles) && data.vehicles.length > 0
              ? data.vehicles.map((v) => ({
                  vin: v?.vin ?? "",
                  make: v?.make ?? "",
                  model: v?.model ?? "",
                  year: v?.year ?? "",
                  engine: v?.engine ?? "",
                  plate: v?.plate ?? "",
                  state: v?.state ?? "",
                }))
              : [
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

        } catch (error) {
          console.error("Error loading data:", error);
          setSubmitError(error.message);
          // Si hay un error, establecer los valores por defecto
          const storedProfile = getProfileFromLocalStorage();
          setUserWorkshop((prev) => ({
            ...prev,
            profile: storedProfile ?? "",
          }));
        } finally {
          setLoading(false);
        }
      } else {
        const storedProfile = getProfileFromLocalStorage();
        if (storedProfile) {
          setUserWorkshop((prev) => ({
            ...prev,
            profile: storedProfile,
          }));
        } else {
          setSubmitError("No se encontró el perfil del usuario");
        }
      }
    };

    loadData();
  }, [editingId]);

  // ========== VALIDACIONES ==========
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

  // ========== MANEJO DE CAMBIOS EN EL FORMULARIO ==========
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

      case "noTax":
        // Asigna el valor directamente sin invertir
        setUserWorkshop((prev) => ({
          ...prev,
          noTax: value,
        }));
        setErrors((prev) => ({ ...prev, [field]: error }));
        return;

      default:
        // Si no es un campo específico, verifica que no esté vacío
        if (field !== "noTax" && !validateNotEmpty(value)) {
          error = "Este campo es obligatorio.";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    setUserWorkshop((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ========== MANEJO DE CAMBIOS EN VEHÍCULOS ==========
  const handleVehicleChange = (index, field, value) => {
    let error = "";
    if (field === "year") {
      if (!validateNotEmpty(value)) {
        error = "Este campo es obligatorio.";
      } else if (!validateYear(value)) {
        error = "Debe ser un año válido de 4 dígitos.";
      }
    } else if (field === "vin") {
      if (!validateNotEmpty(value)) {
        error = "Este campo es obligatorio.";
      } else if (value.length !== 17) {
        error = "El VIN debe tener exactamente 17 caracteres.";
      }
    } else {
      if (!validateNotEmpty(value)) {
        error = "Este campo es obligatorio.";
      }
    }

    setErrors((prev) => ({
      ...prev,
      [`vehicle_${field}_${index}`]: error,
    }));

    setUserWorkshop((prev) => {
      const updatedVehicles = [...prev.vehicles];
      updatedVehicles[index][field] = value;
      return { ...prev, vehicles: updatedVehicles };
    });
  };

  // ========== FORMATEO DE NÚMEROS DE TELÉFONO ==========
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

  // ========== AGREGAR VEHÍCULO ==========
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

  // ========== ELIMINAR VEHÍCULO ==========
  const removeVehicle = (index) => {
    setUserWorkshop((prev) => ({
      ...prev,
      vehicles: prev.vehicles.filter((_, i) => i !== index),
    }));
  };

  // ========== RESETEAR FORMULARIO ==========
  const resetForm = () => {
    setUserWorkshop({
      email: "",
      name: "",
      lastName: "",
      profile: "",
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
    setSubmitError(null);
    console.log("Formulario reseteado.");
  };

  // ========== LIMPIAR PAYLOAD ==========
  const cleanPayload = (payload) => ({
    ...payload,
    vehicles: payload.vehicles.filter((v) => v.vin.trim() !== ""), // Solo incluir vehículos con VIN válido
  });

  // ========== MANEJO DEL ENVÍO DEL FORMULARIO ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setSubmitError(null);

    // Validación básica en el frontend antes de enviar
    let valid = true;
    const newErrors = {};

    // Validar campos del propietario
    ["email", "name", "lastName", "primaryNumber"].forEach((field) => {
      if (!validateNotEmpty(userWorkshop[field])) {
        newErrors[field] = "Este campo es obligatorio.";
        valid = false;
      }
    });

    // Validar email
    if (userWorkshop.email && !validateEmail(userWorkshop.email)) {
      newErrors.email = "Correo electrónico inválido.";
      valid = false;
    }

    // Validar números de teléfono
    ["primaryNumber", "secondaryNumber"].forEach((field) => {
      if (userWorkshop[field] && !validatePhoneNumber(userWorkshop[field])) {
        newErrors[field] =
          "Número de teléfono inválido. Formato: (000) 000-0000";
        valid = false;
      }
    });

    // Validar vehículos
    userWorkshop.vehicles.forEach((vehicle, index) => {
      ["vin", "make", "model", "year", "engine", "plate", "state"].forEach(
        (field) => {
          if (!validateNotEmpty(vehicle[field])) {
            newErrors[`vehicle_${field}_${index}`] =
              "Este campo es obligatorio.";
            valid = false;
          }
        }
      );

      // Validación específica para año
      if (vehicle.year && !validateYear(vehicle.year)) {
        newErrors[`vehicle_year_${index}`] =
          "Debe ser un año válido de 4 dígitos.";
        valid = false;
      }

      // Validación específica para VIN
      if (vehicle.vin && vehicle.vin.length !== 17) {
        newErrors[`vehicle_vin_${index}`] =
          "El VIN debe tener exactamente 17 caracteres.";
        valid = false;
      }
    });

    if (!valid) {
      setErrors(newErrors);
      alert("Por favor, corrige los errores en el formulario antes de enviar.");
      return;
    }

    setIsSubmitting(true);

    // Preparar el payload según tu backend
    const payload = {
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
      vehicles: userWorkshop.vehicles,
    };

    console.log("Payload a enviar:", payload);

    try {
      const cleanedPayload = cleanPayload(payload);

      if (editingId) {
        // Modo edición
        await updateUserWorkshop(editingId, cleanedPayload);
        alert("Taller mecánico actualizado exitosamente.");
      } else {
        // Modo creación
        await createUserWorkshop(cleanedPayload);
        alert("Taller mecánico creado exitosamente.");
      }

      // Resetear formulario
      resetForm();

      // Refrescar datos en el componente padre si es necesario
      if (afterSubmit) afterSubmit();

      // Cerrar el modal
      if (onClose) onClose();
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      setSubmitError(error.message || "Error al enviar el formulario.");
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ======= RENDER =======
  return (
    <Container className="p-3">
      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "50vh" }}
        >
          <Spinner animation="border" />
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <h4 className="mb-3">
            {editingId ? "Editar Taller Mecánico" : "Registrar Taller Mecánico"}
          </h4>

          {/* Mostrar error de envío */}
          {submitError && <Alert variant="danger">{submitError}</Alert>}

          {/* Email y Nombre */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="email">
                <Form.Label>Email *</Form.Label>
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
            <Col md={6}>
              <Form.Group controlId="name">
                <Form.Label>Nombre *</Form.Label>
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
          </Row>

          {/* Apellido */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="lastName">
                <Form.Label>Apellido *</Form.Label>
                <Form.Control
                  type="text"
                  value={userWorkshop.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  isInvalid={!!errors.lastName}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="profile">
                <Form.Label>Perfil</Form.Label>
                <Form.Control
                  type="text"
                  value={userWorkshop.profile}
                  readOnly
                  plaintext
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Dirección */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="address">
                <Form.Label>Dirección *</Form.Label>
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
            <Col md={3}>
              <Form.Group controlId="city">
                <Form.Label>Ciudad *</Form.Label>
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
            <Col md={3}>
              <Form.Group controlId="state">
                <Form.Label>Estado *</Form.Label>
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
          </Row>

          {/* Código Postal */}
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group controlId="zip">
                <Form.Label>Código Postal *</Form.Label>
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

          {/* Números de Teléfono */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="primaryNumber">
                <Form.Label>Número Primario *</Form.Label>
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
            <Col md={6}>
              <Form.Group controlId="secondaryNumber">
                <Form.Label>Número Secundario</Form.Label>
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

          {/* Exención de Impuestos */}
          <Row className="mb-3">
            <Col md={6} className="d-flex align-items-center">
              <Form.Group controlId="noTax">
                <Form.Check
                  type="checkbox"
                  label="Exento de Impuestos (noTax)"
                  checked={userWorkshop.noTax}
                  onChange={(e) => handleInputChange("noTax", e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Información de Vehículos */}
          <h5 className="mt-4 mb-2">Información de Vehículos</h5>
          <div className="border rounded p-2 mb-2 bg-white">
            {userWorkshop.vehicles.map((vehicle, index) => (
              <div key={index}>
                {/* Primer Fila del Vehículo */}
                <Row>
                  <Col md={3}>
                    <Form.Group controlId={`vin_${index}`}>
                      <Form.Label>VIN (17 caracteres) *</Form.Label>
                      <Form.Control
                        type="text"
                        maxLength={17}
                        value={vehicle.vin || ""}
                        onChange={(e) =>
                          handleVehicleChange(index, "vin", e.target.value)
                        }
                        isInvalid={!!errors[`vehicle_vin_${index}`]}
                        required
                        disabled={editingId && vehicle.vin} // Deshabilitar VIN si ya existe
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`vehicle_vin_${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId={`make_${index}`}>
                      <Form.Label>Marca *</Form.Label>
                      <Form.Control
                        type="text"
                        value={vehicle.make || ""}
                        onChange={(e) =>
                          handleVehicleChange(index, "make", e.target.value)
                        }
                        isInvalid={!!errors[`vehicle_make_${index}`]}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`vehicle_make_${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId={`model_${index}`}>
                      <Form.Label>Modelo *</Form.Label>
                      <Form.Control
                        type="text"
                        value={vehicle.model || ""}
                        onChange={(e) =>
                          handleVehicleChange(index, "model", e.target.value)
                        }
                        isInvalid={!!errors[`vehicle_model_${index}`]}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`vehicle_model_${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3} className="d-flex align-items-end">
                    <Button
                      variant="danger"
                      onClick={() => removeVehicle(index)}
                      disabled={userWorkshop.vehicles.length === 1}
                    >
                      Eliminar Vehículo
                    </Button>
                  </Col>
                </Row>

                {/* Segunda Fila del Vehículo */}
                <Row className="mt-2">
                  <Col md={3}>
                    <Form.Group controlId={`year_${index}`}>
                      <Form.Label>Año *</Form.Label>
                      <Form.Control
                        type="text"
                        maxLength={4}
                        value={vehicle.year || ""}
                        onChange={(e) =>
                          handleVehicleChange(index, "year", e.target.value)
                        }
                        isInvalid={!!errors[`vehicle_year_${index}`]}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`vehicle_year_${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId={`engine_${index}`}>
                      <Form.Label>Motor *</Form.Label>
                      <Form.Control
                        type="text"
                        value={vehicle.engine || ""}
                        onChange={(e) =>
                          handleVehicleChange(index, "engine", e.target.value)
                        }
                        isInvalid={!!errors[`vehicle_engine_${index}`]}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`vehicle_engine_${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId={`plate_${index}`}>
                      <Form.Label>Placa *</Form.Label>
                      <Form.Control
                        type="text"
                        value={vehicle.plate || ""}
                        onChange={(e) =>
                          handleVehicleChange(index, "plate", e.target.value)
                        }
                        isInvalid={!!errors[`vehicle_plate_${index}`]}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`vehicle_plate_${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group controlId={`state_${index}`}>
                      <Form.Label>Estado *</Form.Label>
                      <Form.Control
                        type="text"
                        value={vehicle.state || ""}
                        onChange={(e) =>
                          handleVehicleChange(index, "state", e.target.value)
                        }
                        isInvalid={!!errors[`vehicle_state_${index}`]}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors[`vehicle_state_${index}`]}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                <hr />
              </div>
            ))}

            <Button variant="primary" onClick={addVehicle}>
              Agregar Vehículo
            </Button>
          </div>

          {/* Botones de Submit y Cancel */}
          <div className="text-end">
            <Button
              type="submit"
              variant="success"
              className="me-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </Form>
      )}
    </Container>
  );
};

export default VehicleReception;
