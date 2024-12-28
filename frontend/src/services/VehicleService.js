// src/services/VehicleService.js

// Obtener Vehicle por ID
export const getVehicleById = async (id) => {
  try {
    const response = await fetch(`/api/UserWorkshops/vehicle/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error al obtener el vehículo por ID.");
      }
    }
    return await response.json(); // Debe coincidir con VehicleReadDto
  } catch (error) {
    console.error("Error en getVehicleById:", error);
    throw error;
  }
};

// Actualizar el status del vehículo (opcional, si es necesario)
export const updateVehicleStatus = async (vehicleId, newStatus) => {
  try {
    const response = await fetch(`/api/Vehicles/${vehicleId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }), // Ajusta según el backend
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error al actualizar el status del vehículo.");
      }
    }
  } catch (error) {
    console.error("Error en updateVehicleStatus:", error);
    throw error;
  }
};
