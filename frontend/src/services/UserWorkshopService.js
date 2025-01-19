// src/services/UserWorkshopService.js

// FUNCIONES PARA USERWORKSHOPS (TALLERES MECÁNICOS)

const API_BASE_URL = 'http://localhost:5121/api/UserWorkshops'; // Actualizar al puerto del backend

/**
 * Obtiene la lista de todos los talleres mecánicos.
 */
export const getUserWorkshops = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}`);
    if (!response.ok) {
      throw new Error("Error fetching the mechanical workshops.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getUserWorkshops:", error);
    throw error;
  }
};

/**
 * Obtiene un taller mecánico por su ID.
 * @param {number} id - ID del UserWorkshop a consultar
 */
export const getUserWorkshopById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error("Error fetching the mechanical workshop.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getUserWorkshopById:", error);
    throw error;
  }
};

/**
 * Crea un nuevo taller mecánico (UserWorkshop).
 * @param {Object} userWorkshopData - Objeto con la información del taller y vehículos asociados
 */
export const createUserWorkshop = async (userWorkshopData) => {
  try {
    const response = await fetch(`${API_BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userWorkshopData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error creating the mechanical workshop.");
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error in createUserWorkshop:", error);
    throw error;
  }
};

/**
 * Actualiza un taller mecánico existente.
 * @param {number} id - ID del taller a actualizar
 * @param {Object} userWorkshopData - Objeto con la nueva información del taller
 */
export const updateUserWorkshop = async (id, userWorkshopData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userWorkshopData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error updating the mechanical workshop.");
      }
    }

    // Si todo salió bien, no hay contenido que retornar
    return;
  } catch (error) {
    console.error("Error in updateUserWorkshop:", error);
    throw error;
  }
};

/**
 * Elimina un taller mecánico por su ID.
 * @param {number} id - ID del taller a eliminar
 */
export const deleteUserWorkshop = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error deleting the mechanical workshop.");
    }

    // Si todo salió bien, no hay contenido que retornar
    return;
  } catch (error) {
    console.error("Error in deleteUserWorkshop:", error);
    throw error;
  }
};

// FUNCIONES PARA GESTIONAR VEHÍCULOS DENTRO DEL TALLER

/**
 * Busca vehículos según un término de búsqueda (VIN, nombre de cliente, etc.).
 * @param {string} searchTerm - Término de búsqueda
 */
export const searchVehicles = async (searchTerm) => {
  try {
    const encodedTerm = encodeURIComponent(searchTerm);
    const response = await fetch(`${API_BASE_URL}/searchVehicles?searchTerm=${encodedTerm}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error searching for vehicles.");
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error in searchVehicles:", error);
    throw error;
  }
};

/**
 * Obtiene todos los vehículos registrados.
 */
export const getAllVehicles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles`);
    if (!response.ok) {
      // Intentar leer el cuerpo de la respuesta como JSON
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        // Si no se pudo parsear, arrojar error genérico
        throw new Error(
          `Error fetching the list of vehicles. HTTP Code: ${response.status}`
        );
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getAllVehicles:", error);
    throw error;
  }
};

/**
 * Elimina un vehículo por su VIN.
 * @param {string} vin - VIN del vehículo a eliminar
 */
export const deleteVehicle = async (vin) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicle/${vin}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      // Intentar parsear un error en JSON
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error deleting the vehicle.");
      }
    }

    // 204 No Content -> no se retorna nada
    return;
  } catch (error) {
    console.error("Error in deleteVehicle:", error);
    throw error;
  }
};

/**
 * Obtiene la información de un vehículo por ID (o VIN, dependiendo de tu backend).
 * @param {number|string} id - El ID o VIN del vehículo
 */
export const getVehicleById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicle/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error fetching the vehicle by ID.");
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getVehicleById:", error);
    throw error;
  }
};
