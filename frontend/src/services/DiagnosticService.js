const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

/**
 * Creates a new diagnostic.
 * @async
 * @function createDiagnostic
 * @param {Object} diagnosticData - The data for the new diagnostic.
 * @returns {Promise<Object>} The created diagnostic (DiagnosticReadDto).
 * @throws Will throw an error if the request fails.
 */
export const createDiagnostic = async (diagnosticData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Diagnostics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(diagnosticData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error creating the diagnostic.");
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error in createDiagnostic:", error);
    throw error;
  }
};

/**
 * Retrieves all diagnostics.
 * @async
 * @function getDiagnostics
 * @returns {Promise<Array>} A list of diagnostic objects.
 * @throws Will throw an error if the request fails.
 */
export const getDiagnostics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/Diagnostics`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error retrieving the list of diagnostics.");
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getDiagnostics:", error);
    throw error;
  }
};

/**
 * Retrieves a diagnostic by its ID.
 * @async
 * @function getDiagnosticById
 * @param {string} id - The ID of the diagnostic.
 * @returns {Promise<Object>} The diagnostic with the specified ID.
 * @throws Will throw an error if the request fails.
 */
export const getDiagnosticById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Diagnostics/${id}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error retrieving the diagnostic by ID.");
      }
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getDiagnosticById:", error);
    throw error;
  }
};

/**
 * Updates an existing diagnostic.
 * @async
 * @function updateDiagnostic
 * @param {string} id - The ID of the diagnostic to update.
 * @param {Object} diagnosticData - The updated diagnostic data.
 * @returns {Promise<void>} No return value.
 * @throws Will throw an error if the request fails.
 */
export const updateDiagnostic = async (id, diagnosticData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Diagnostics/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(diagnosticData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error updating the diagnostic.");
      }
    }
    return;
  } catch (error) {
    console.error("Error in updateDiagnostic:", error);
    throw error;
  }
};

/**
 * Deletes a diagnostic by its ID.
 * @async
 * @function deleteDiagnostic
 * @param {string} id - The ID of the diagnostic to delete.
 * @returns {Promise<void>} No return value.
 * @throws Will throw an error if the request fails.
 */
export const deleteDiagnostic = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Diagnostics/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      let errorMessage = "Error deleting the diagnostic.";
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      } else {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    return;
  } catch (error) {
    console.error("Error in deleteDiagnostic:", error);
    throw error;
  }
};

/**
 * Retrieves diagnostics by a technician's name and last name.
 * @async
 * @function getDiagnosticsByTechnician
 * @param {string} name - The technician's first name.
 * @param {string} lastName - The technician's last name.
 * @returns {Promise<Array>} A list of diagnostics associated with the specified technician.
 * @throws Will throw an error if the request fails or if parameters are missing.
 */
export const getDiagnosticsByTechnician = async (name, lastName) => {
  try {
    if (!name || !lastName) {
      throw new Error("Parameters 'name' and 'lastName' are required.");
    }

    const encodedName = encodeURIComponent(name);
    const encodedLastName = encodeURIComponent(lastName);

    const response = await fetch(
      `${API_BASE_URL}/Diagnostics/byTechnician?name=${encodedName}&lastName=${encodedLastName}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error retrieving diagnostics by technician.");
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getDiagnosticsByTechnician:", error);
    throw error;
  }
};
