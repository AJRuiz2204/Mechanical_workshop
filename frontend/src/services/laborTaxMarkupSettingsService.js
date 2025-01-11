// src/services/laborTaxMarkupSettingsService.js

import axios from "axios";

const API_URL = "/api/LaborTaxMarkupSettings";

export async function getSettingsById(id) {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
}

export async function createSettings(createDto) {
  const response = await axios.post(API_URL, createDto, {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
}

export async function patchSettings(id, patchDoc) {
  await axios.patch(`${API_URL}/${id}`, patchDoc, {
    headers: { "Content-Type": "application/json-patch+json" },
  });
}
