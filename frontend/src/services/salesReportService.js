import axios from "axios";

// Se actualiza API_URL para usar la variable de entorno VITE_API_URL o '' en caso de no estar definida.
const API_URL = `${import.meta.env.VITE_API_URL || ''}/api/SalesReport`;

/**
 * Obtiene todos los reportes de ventas almacenados, incluyendo la información completa
 * del Estimate en cada detalle.
 * @returns {Promise<Array<Object>>} Array de SalesReportDto.
 */
export const getAllSalesReports = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    console.log("Respuesta del servicio:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in getAllSalesReports:", error);
    throw error;
  }
};

/**
 * Obtiene el reporte de ventas.
 * Si se pasan fechas, se obtiene por rango; de lo contrario, se obtienen TODOS los registros.
 * @param {string} [startDate] - Fecha de inicio (opcional).
 * @param {string} [endDate] - Fecha de fin (opcional).
 * @returns {Promise<Object>} SalesReportDto.
 */
export const getSalesReport = async (startDate, endDate) => {
  try {
    const params = {};
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    const response = await axios.get(API_URL, { params });
    console.log("Respuesta del servicio:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in getSalesReport:", error);
    throw error;
  }
};

/**
 * Obtiene un reporte de ventas por su ID.
 * @param {number} id - ID del reporte de ventas.
 * @returns {Promise<Object>} SalesReportDto.
 */
export const getSalesReportById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error in getSalesReportById:", error);
    throw error;
  }
};

/**
 * Crea un nuevo reporte de ventas.
 * @param {Object} reportData - Datos del reporte (SalesReportDto).
 * @returns {Promise<Object>} SalesReportDto creado.
 */
export const createSalesReport = async (reportData) => {
  try {
    const response = await axios.post(API_URL, reportData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in createSalesReport:", error);
    throw error;
  }
};
