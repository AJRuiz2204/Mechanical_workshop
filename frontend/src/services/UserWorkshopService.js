import api from "./api";

export const getUserWorkshops = async () => {
  try {
    const response = await api.get(`/UserWorkshops`);
    return response.data;
  } catch (error) {
    console.error("Error in getUserWorkshops:", error);
    throw error;
  }
};

export const getUserWorkshopById = async (id) => {
  try {
    const response = await api.get(`/UserWorkshops/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error in getUserWorkshopById:", error);
    throw error;
  }
};

export const getUserWorkshopByIdWithVehicles = async (id, token) => {
  try {
    const response = await api.get(`/UserWorkshops/${id}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error in getUserWorkshopByIdWithVehicles:", error);
    throw error;
  }
};

export const createUserWorkshop = async (userWorkshopData) => {
  try {
    const response = await api.post(`/UserWorkshops`, userWorkshopData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in createUserWorkshop:", error);
    throw error;
  }
};

export const updateUserWorkshop = async (id, userWorkshopData, token) => {
  try {
    console.log("Updating UserWorkshop with ID:", id, "Data:", userWorkshopData);
    const response = await api.put(`/UserWorkshops/${id}`, userWorkshopData, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`UserWorkshop with ID ${id} updated successfully.`);
    return response.data;
  } catch (error) {
    console.error("Error in updateUserWorkshop:", error);
    throw new Error(error.response?.data?.message || "Unexpected error while updating the UserWorkshop.");
  }
};

export const deleteUserWorkshop = async (id) => {
  try {
    await api.delete(`/UserWorkshops/${id}`);
  } catch (error) {
    console.error("Error in deleteUserWorkshop:", error);
    throw error;
  }
};

export const searchVehicles = async (searchTerm) => {
  try {
    const encodedTerm = encodeURIComponent(searchTerm);
    const searchByFields = ["vin", "make", "model", "ownerName"].join(",");
    const response = await api.get(`/UserWorkshops/searchVehicles`, {
      params: { searchTerm: encodedTerm, searchBy: searchByFields },
    });
    return response.data;
  } catch (error) {
    console.error("Error in searchVehicles:", error);
    throw error;
  }
};

export const getAllVehicles = async () => {
  try {
    const response = await api.get(`/UserWorkshops/vehicles`);
    return response.data;
  } catch (error) {
    console.error("Error in getAllVehicles:", error);
    throw error;
  }
};

export const deleteVehicle = async (vin) => {
  try {
    await api.delete(`/UserWorkshops/vehicle/${vin}`);
  } catch (error) {
    console.error("Error in deleteVehicle:", error);
    throw error;
  }
};

export const getVehicleById = async (id) => {
  try {
    const response = await api.get(`/UserWorkshops/vehicle/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error in getVehicleById:", error);
    throw error;
  }
};
