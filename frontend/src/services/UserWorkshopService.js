// Frontend: src/services/UserWorkshopService.js

export const getUserWorkshops = async () => {
  try {
    const response = await fetch("/api/UserWorkshops");
    if (!response.ok) {
      throw new Error("Error fetching the mechanical workshops.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getUserWorkshops:", error);
    throw error;
  }
};

export const getUserWorkshopById = async (id) => {
  try {
    const response = await fetch(`/api/UserWorkshops/${id}`);
    if (!response.ok) {
      throw new Error("Error fetching the mechanical workshop.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getUserWorkshopById:", error);
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
        throw new Error("Error creating the mechanical workshop.");
      }
    }

    return await response.json();
  } catch (error) {
    console.error("Error in createUserWorkshop:", error);
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
        errorData.Message || "Error updating the mechanical workshop."
      );
    }

    return;
  } catch (error) {
    console.error("Error in updateUserWorkshop:", error);
    throw error;
  }
};

export const deleteUserWorkshop = async (id) => {
  try {
    const response = await fetch(`/api/UserWorkshops/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Error deleting the mechanical workshop.");
    }

    return;
  } catch (error) {
    console.error("Error in deleteUserWorkshop:", error);
    throw error;
  }
};

// **New function to search vehicles**
export const searchVehicles = async (searchTerm) => {
  try {
    const response = await fetch(
      `/api/UserWorkshops/searchVehicles?searchTerm=${encodeURIComponent(
        searchTerm
      )}`
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error searching for vehicles.");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in searchVehicles:", error);
    throw error;
  }
};

export const getAllVehicles = async () => {
  try {
    const response = await fetch("/api/UserWorkshops/vehicles");
    if (!response.ok) {
      // Attempt to read the error as JSON:
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        // If unable to read as JSON, fallback to a generic error
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

// src/services/UserWorkshopService.js

export const deleteVehicle = async (vin) => {
  try {
    const response = await fetch(`/api/UserWorkshops/vehicle/${vin}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      // If the server returned an error, attempt to parse the body as JSON
      const errorData = await response.json().catch(() => null);
      if (errorData && errorData.message) {
        throw new Error(errorData.message);
      } else {
        throw new Error("Error deleting the vehicle.");
      }
    }

    // If everything is fine (204 No Content), no need to return anything.
    return;
  } catch (error) {
    console.error("Error in deleteVehicle:", error);
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
        throw new Error("Error fetching the vehicle by ID.");
      }
    }
    return await response.json(); 
  } catch (error) {
    console.error("Error in getVehicleById:", error);
    throw error;
  }
};
