import axios from "axios";

const BASE_API = import.meta.env.VITE_API_URL || "/api";
const API_URL = `${BASE_API}/WorkshopSettings`;

// Add an interceptor to log error details
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      config: error.config,
    });
    return Promise.reject(error);
  }
);

/**
 * getWorkshopSettings
 * Retrieves the current workshop settings.
 *
 * @async
 * @function getWorkshopSettings
 * @returns {Promise<Object>} The workshop settings data.
 * @throws Will throw an error if the request fails.
 */
export const getWorkshopSettings = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Error fetching workshop settings." }
    );
  }
};

/**
 * createWorkshopSettings
 * Creates new workshop settings.
 *
 * @async
 * @function createWorkshopSettings
 * @param {Object} data - The workshop settings data to create.
 * @returns {Promise<Object>} The created workshop settings data.
 * @throws Will throw an error if the request fails.
 */
export const createWorkshopSettings = async (data) => {
  try {
    // Ensure the payload matches the backend model exactly
    const payload = {
      workshopName: data.workshopName || "",
      address: data.address || "",
      primaryPhone: data.primaryPhone || "",
      secondaryPhone: data.secondaryPhone || "",
      fax: data.fax || "",
      websiteUrl: data.websiteUrl || "",
      disclaimer: data.disclaimer || "",
      email: data.email || "",
      // Do not send id or lastUpdated for new settings
    };

    console.log("Sending payload:", payload);
    const response = await axios.post(API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error details:", {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw (
      error.response?.data || { message: "Error creating workshop settings." }
    );
  }
};

/**
 * updateWorkshopSettings
 * Updates existing workshop settings.
 *
 * @async
 * @function updateWorkshopSettings
 * @param {number} id - The ID of the workshop settings to update.
 * @param {Object} data - The updated workshop settings data.
 * @returns {Promise<void>} No return value.
 * @throws Will throw an error if the request fails.
 */
export const updateWorkshopSettings = async (id, data) => {
  try {
    // Construct the payload excluding id and lastUpdated
    const payload = {
      workshopName: data.workshopName || "",
      address: data.address || "",
      primaryPhone: data.primaryPhone || "",
      secondaryPhone: data.secondaryPhone || "",
      fax: data.fax || "",
      websiteUrl: data.websiteUrl || "",
      disclaimer: data.disclaimer || "",
      email: data.email || "",
      // Do not send id or lastUpdated in the update
    };

    console.log("Updating with payload:", payload);
    await axios.put(`${API_URL}/${id}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error details:", {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw (
      error.response?.data || { message: "Error updating workshop settings." }
    );
  }
};

/**
 * deleteWorkshopSettings
 * Deletes workshop settings by ID.
 *
 * @async
 * @function deleteWorkshopSettings
 * @param {number} id - The ID of the workshop settings to delete.
 * @returns {Promise<void>} No return value.
 * @throws Will throw an error if the request fails.
 */
export const deleteWorkshopSettings = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error("Error details:", {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw (
      error.response?.data || { message: "Error deleting workshop settings." }
    );
  }
};
