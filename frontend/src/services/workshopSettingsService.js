// src/services/workshopSettingsService.js

import axios from "axios";

const API_URL = "/api/WorkshopSettings";

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
 * Retrieves the current workshop settings.
 * @returns {Promise<Object>} The workshop settings data.
 */
export const getWorkshopSettings = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    // Throw error to be handled by the calling function
    throw (
      error.response?.data || { message: "Error fetching workshop settings." }
    );
  }
};

/**
 * Creates new workshop settings.
 * @param {Object} data - The workshop settings data to create.
 * @returns {Promise<Object>} The created workshop settings data.
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
 * Updates existing workshop settings.
 * @param {number} id - The ID of the workshop settings to update.
 * @param {Object} data - The updated workshop settings data.
 * @returns {Promise<void>}
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
 * Deletes workshop settings by ID.
 * @param {number} id - The ID of the workshop settings to delete.
 * @returns {Promise<void>}
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
