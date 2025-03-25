import api from './api';

const API_URL = '/LaborTaxMarkupSettings';

/**
 * Retrieves labor tax and markup settings by ID.
 * @async
 * @function getSettingsById
 * @param {number|string} id - The unique identifier for the settings record.
 * @returns {Promise<Object>} The settings data.
 * @throws Will throw an error if the request fails.
 */
export async function getSettingsById(id) {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
}

/**
 * Creates new labor tax and markup settings.
 * @async
 * @function createSettings
 * @param {Object} createDto - The data transfer object containing new settings.
 * @returns {Promise<Object>} The created settings record.
 * @throws Will throw an error if the request fails.
 */
export async function createSettings(createDto) {
  const response = await api.post(API_URL, createDto, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

/**
 * Partially updates labor tax and markup settings using JSON Patch.
 * @async
 * @function patchSettings
 * @param {number|string} id - The unique identifier for the settings record to update.
 * @param {Array} patchDoc - The JSON Patch document describing the changes.
 * @returns {Promise<void>} No return value.
 * @throws Will throw an error if the request fails.
 */
export async function patchSettings(id, patchDoc) {
  await api.patch(`${API_URL}/${id}`, patchDoc, {
    headers: { "Content-Type": "application/json-patch+json" },
  });
}
