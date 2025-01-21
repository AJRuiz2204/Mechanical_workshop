// src/services/DiagnosticService.js

// Define the API base URL. Ensure this URL is correct according to your configuration.
const API_BASE_URL = "http://localhost:5121/api";

/**
 * Creates a new diagnostic.
 *
 * @param {Object} diagnosticData - The data for the new diagnostic.
 * @returns {Promise<Object>} The created diagnostic.
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

    return await response.json(); // Returns DiagnosticReadDto
  } catch (error) {
    console.error("Error in createDiagnostic:", error);
    throw error;
  }
};

/**
 * Retrieves all diagnostics.
 *
 * @returns {Promise<Array>} A list of diagnostics.
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
 *
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
 *
 * @param {string} id - The ID of the diagnostic to update.
 * @param {Object} diagnosticData - The updated diagnostic data.
 * @returns {Promise<void>}
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
 * Deletes a diagnostic.
 *
 * @param {string} id - The ID of the diagnostic to delete.
 * @returns {Promise<void>}
 * @throws Will throw an error if the request fails.
 */
export const deleteDiagnostic = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Diagnostics/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error deleting the diagnostic.");
      }
    }
    return;
  } catch (error) {
    console.error("Error in deleteDiagnostic:", error);
    throw error;
  }
};

/**
 * Retrieves diagnostics by technician's name and last name.
 *
 * @param {string} name - The first name of the technician.
 * @param {string} lastName - The last name of the technician.
 * @returns {Promise<Array>} A list of diagnostics associated with the specified technician.
 * @throws Will throw an error if the request fails or if parameters are missing.
 */
export const getDiagnosticsByTechnician = async (name, lastName) => {
  try {
    // Validate that the parameters are not empty
    if (!name || !lastName) {
      throw new Error("Parameters 'name' and 'lastName' are required.");
    }

    // Encode the parameters for URLs
    const encodedName = encodeURIComponent(name);
    const encodedLastName = encodeURIComponent(lastName);

    // Make the GET request to the custom endpoint
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

    return await response.json(); // Returns a list of DiagnosticReadDto
  } catch (error) {
    console.error("Error in getDiagnosticsByTechnician:", error);
    throw error;
  }
};
