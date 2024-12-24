// src/services/VehicleService.js
export const getVehicleById = async (id) => {
    try {
      const response = await fetch(`/api/UserWorkshops/vehicle/${id}`);
      // O /api/Vehicles/{id} si lo separaste en un VehiclesController
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData && errorData.message) {
          throw new Error(errorData.message);
        } else {
          throw new Error("Error al obtener el vehículo por ID.");
        }
      }
      return await response.json(); // Esto debe coincidir con VehicleReadDto
    } catch (error) {
      console.error("Error en getVehicleById:", error);
      throw error;
    }
  };
  