// src/services/UserWorkshopService.js

// FUNCTIONS FOR USER WORKSHOPS (MECHANICAL WORKSHOPS)

const API_BASE_URL = "http://localhost:5121/api/UserWorkshops"; // Ensure this is the correct URL

/**
 * Retrieves the list of all mechanical workshops.
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
 * Retrieves a mechanical workshop by its ID.
 * @param {number} id - ID of the UserWorkshop to fetch
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
 * Retrieves a mechanical workshop by its ID along with associated vehicles.
 * @param {number} id - ID of the UserWorkshop to fetch
 * @param {string} token - Authentication token
 */
export const getUserWorkshopByIdWithVehicles = async (id, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`, // Add the token here
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching the mechanical workshop with vehicles.");
    }
    return await response.json(); // Ensure JSON is returned
  } catch (error) {
    console.error("Error in getUserWorkshopByIdWithVehicles:", error);
    throw error;
  }
};

/**
 * Creates a new mechanical workshop (UserWorkshop).
 * @param {Object} userWorkshopData - Object containing workshop and associated vehicle information
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
 * Updates an existing UserWorkshop.
 * @param {number} id - ID of the UserWorkshop to update
 * @param {Object} userWorkshopData - Updated data for the UserWorkshop
 * @param {string} token - Authentication token
 * @returns {Promise<void>}
 */
export const updateUserWorkshop = async (id, userWorkshopData, token) => {
  try {
    console.log(
      "Updating UserWorkshop with ID:",
      id,
      "Data:",
      userWorkshopData
    ); // Debug log
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`, // Add the token here
      },
      body: JSON.stringify(userWorkshopData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: "Error updating the mechanical workshop.",
      }));
      console.error("Error details:", errorData.errors || errorData.message); // Detailed error log
      // Handle validation errors
      if (errorData.errors) {
        // Extract error messages
        const messages = Object.values(errorData.errors)
          .flat()
          .join(" ");
        throw new Error(messages);
      } else {
        throw new Error(
          errorData.message || "Error updating the mechanical workshop."
        );
      }
    }

    console.log(`UserWorkshop with ID ${id} updated successfully.`);
  } catch (error) {
    console.error("Error in updateUserWorkshop:", error);
    throw new Error(
      error.message || "Unexpected error while updating the UserWorkshop."
    );
  }
};

/**
 * Deletes a mechanical workshop by its ID.
 * @param {number} id - ID of the workshop to delete
 */
export const deleteUserWorkshop = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error deleting the mechanical workshop.");
    }

    // If everything went well, there's no content to return
    return;
  } catch (error) {
    console.error("Error in deleteUserWorkshop:", error);
    throw error;
  }
};

// FUNCTIONS FOR MANAGING VEHICLES WITHIN THE WORKSHOP

/**
 * Searches for vehicles based on a search term (VIN, Make, Model, Owner Name).
 * @param {string} searchTerm - Search term
 */
export const searchVehicles = async (searchTerm) => {
  try {
    const encodedTerm = encodeURIComponent(searchTerm);
    const searchByFields = ['vin', 'make', 'model', 'ownerName'].join(',');
    const response = await fetch(
      `${API_BASE_URL}/searchVehicles?searchTerm=${encodedTerm}&searchBy=${searchByFields}`
    ); // Updated to include multiple fields in searchBy

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
 * Retrieves all registered vehicles.
 */
export const getAllVehicles = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicles`);
    if (!response.ok) {
      // Attempt to read the response body as JSON
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        // If it couldn't be parsed, throw a generic error
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
 * Deletes a vehicle by its VIN.
 * @param {string} vin - VIN of the vehicle to delete
 */
export const deleteVehicle = async (vin) => {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicle/${vin}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      // Attempt to parse an error in JSON
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error deleting the vehicle.");
      }
    }

    // 204 No Content -> nothing to return
    return;
  } catch (error) {
    console.error("Error in deleteVehicle:", error);
    throw error;
  }
};

/**
 * Retrieves vehicle information by ID (or VIN, depending on your backend).
 * @param {number|string} id - The ID or VIN of the vehicle
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
