// Frontend: src/services/TechnicianDiagnosticService.js

/**
 * createTechnicianDiagnostic
 * Crea un nuevo diagnóstico de técnico.
 * This function creates a new technician diagnostic.
 *
 * @async
 * @function
 * @param {Object} techDiagData - The data for the new technician diagnostic.
 * @returns {Promise<Object>} Returns the created TechnicianDiagnosticReadDto.
 * @throws Will throw an error if the request fails.
 */
export const createTechnicianDiagnostic = async (techDiagData) => {
  try {
    const response = await fetch(`/api/TechnicianDiagnostics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(techDiagData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error creating the technician diagnostic.");
      }
    }
    return await response.json(); // TechnicianDiagnosticReadDto
  } catch (error) {
    console.error("Error in createTechnicianDiagnostic:", error);
    throw error;
  }
};

/**
 * getTechnicianDiagnostic
 * Obtiene un diagnóstico de técnico por su ID.
 * This function retrieves a technician diagnostic by its ID.
 *
 * @async
 * @function
 * @param {number|string} id - The ID of the technician diagnostic to retrieve.
 * @returns {Promise<Object>} The technician diagnostic data.
 * @throws Will throw an error if the request fails.
 */
export const getTechnicianDiagnostic = async (id) => {
  try {
    const response = await fetch(`/api/TechnicianDiagnostics/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error fetching the technician diagnostic.");
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getTechnicianDiagnostic:", error);
    throw error;
  }
};

/**
 * updateTechnicianDiagnostic
 * Actualiza un diagnóstico de técnico existente.
 * This function updates an existing technician diagnostic.
 *
 * @async
 * @function
 * @param {number|string} id - The ID of the technician diagnostic to update.
 * @param {Object} techDiagData - The updated data for the technician diagnostic.
 * @returns {Promise<void>} No return value.
 * @throws Will throw an error if the request fails.
 */
export const updateTechnicianDiagnostic = async (id, techDiagData) => {
  try {
    const response = await fetch(`/api/TechnicianDiagnostics/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(techDiagData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error updating the technician diagnostic.");
      }
    }
    return;
  } catch (error) {
    console.error("Error in updateTechnicianDiagnostic:", error);
    throw error;
  }
};

/**
 * deleteTechnicianDiagnostic
 * Elimina un diagnóstico de técnico por su ID.
 * This function deletes a technician diagnostic by its ID.
 *
 * @async
 * @function
 * @param {number|string} id - The ID of the technician diagnostic to delete.
 * @returns {Promise<void>} No return value.
 * @throws Will throw an error if the request fails.
 */
export const deleteTechnicianDiagnostic = async (id) => {
  try {
    const response = await fetch(`/api/TechnicianDiagnostics/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error deleting the technician diagnostic.");
      }
    }
    return;
  } catch (error) {
    console.error("Error in deleteTechnicianDiagnostic:", error);
    throw error;
  }
};

/**
 * getTechnicianDiagnosticByDiagId
 * Obtiene un diagnóstico de técnico por el ID del diagnóstico.
 * This function retrieves a technician diagnostic by the diagnostic ID.
 *
 * @async
 * @function
 * @param {number|string} diagnosticId - The ID of the diagnostic to retrieve the technician diagnostic for.
 * @returns {Promise<Object>} The technician diagnostic data.
 * @throws Will throw an error if not found or if the request fails.
 */
export const getTechnicianDiagnosticByDiagId = async (diagnosticId) => {
  try {
    const response = await fetch(
      `/api/TechnicianDiagnostics/byDiagnostic/${diagnosticId}`
    );

    if (response.status === 404) {
      throw new Error("Not found");
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Error fetching technician diagnostic"
      );
    }

    return await response.json();
  } catch (error) {
    if (error.message !== "Not found") {
      console.error("Error in getTechnicianDiagnosticByDiagId:", error);
    }
    throw error;
  }
};

/**
 * getTechnicianDiagnosticsBatch
 * Obtiene varios diagnósticos de técnico usando un array de IDs de diagnóstico.
 * This function retrieves multiple technician diagnostics using an array of diagnostic IDs.
 *
 * @async
 * @function
 * @param {Array<number|string>} diagnosticIds - An array of diagnostic IDs.
 * @returns {Promise<Array>} An array of technician diagnostic objects.
 * @throws Will throw an error if the request fails.
 */
export const getTechnicianDiagnosticsBatch = async (diagnosticIds) => {
  try {
    const idsParam = diagnosticIds.join("&diagnosticIds=");
    const response = await fetch(
      `/api/TechnicianDiagnostics/byDiagnostics?diagnosticIds=${idsParam}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error fetching batch diagnostics");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getTechnicianDiagnosticsBatch:", error);
    throw error;
  }
};