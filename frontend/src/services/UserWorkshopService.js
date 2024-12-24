// src/services/UserWorkshopService.js

export const getUserWorkshops = async () => {
  try {
    const response = await fetch("/api/UserWorkshops");
    if (!response.ok) {
      throw new Error("Error al obtener los talleres mecánicos.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getUserWorkshops:", error);
    throw error;
  }
};

export const getUserWorkshopById = async (id) => {
  try {
    const response = await fetch(`/api/UserWorkshops/${id}`);
    if (!response.ok) {
      throw new Error("Error al obtener el taller mecánico.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getUserWorkshopById:", error);
    throw error;
  }
};
export const createUserWorkshop = async (userWorkshopData) => {
  try {
    const response = await fetch("/api/UserWorkshops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userWorkshopData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error al crear el taller mecánico.");
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error en createUserWorkshop:", error);
    throw error;
  }
};

export const updateUserWorkshop = async (id, userWorkshopData) => {
  try {
    const response = await fetch(`/api/UserWorkshops/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userWorkshopData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.Message || "Error al actualizar el taller mecánico."
      );
    }

    return;
  } catch (error) {
    console.error("Error en updateUserWorkshop:", error);
    throw error;
  }
};

export const deleteUserWorkshop = async (id) => {
  try {
    const response = await fetch(`/api/UserWorkshops/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error al eliminar el taller mecánico.");
    }

    return;
  } catch (error) {
    console.error("Error en deleteUserWorkshop:", error);
    throw error;
  }
};

// **Nueva función para buscar vehículos**
export const searchVehicles = async (searchTerm) => {
  try {
    const response = await fetch(
      `/api/UserWorkshops/searchVehicles?searchTerm=${encodeURIComponent(
        searchTerm
      )}`
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al buscar vehículos.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error en searchVehicles:", error);
    throw error;
  }
};

export const getAllVehicles = async () => {
  try {
    const response = await fetch("/api/UserWorkshops/vehicles");
    if (!response.ok) {
      // Intentar leer el error como JSON:
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        // Si no fue posible leer como JSON, fallback a un error genérico
        throw new Error(
          `Error al obtener la lista de vehículos. Código HTTP: ${response.status}`
        );
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getAllVehicles:", error);
    throw error;
  }
};

// src/services/UserWorkshopService.js

export const deleteVehicle = async (vin) => {
  try {
    const response = await fetch(`/api/UserWorkshops/vehicle/${vin}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      // Si el servidor devolvió un error, intentamos parsear el body como JSON
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error al eliminar el vehículo.");
      }
    }

    // Si todo va bien (204 No Content), no necesitamos retornar nada.
    return;
  } catch (error) {
    console.error("Error en deleteVehicle:", error);
    throw error;
  }
};


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
    return await response.json(); 
  } catch (error) {
    console.error("Error en getVehicleById:", error);
    throw error;
  }
};


