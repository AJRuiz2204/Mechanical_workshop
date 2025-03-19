import axios from "axios";

const BASE_API = import.meta.env.VITE_API_URL || "/api";
const API_URL = `${BASE_API}/SalesReport`;

/**
 * Retrieves all stored sales reports, including complete Estimate information in each detail.
 * @async
 * @function getAllSalesReports
 * @returns {Promise<Array<Object>>} An array of SalesReportDto objects.
 * @throws Will throw an error if the request fails.
 */
export const getAllSalesReports = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    console.log("Service response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in getAllSalesReports:", error);
    throw error;
  }
};

/**
 * Retrieves a sales report. If startDate and endDate are provided, returns only the data for that range;
 * otherwise, it returns all records.
 * @async
 * @function getSalesReport
 * @param {string} [startDate] - The start date (optional).
 * @param {string} [endDate] - The end date (optional).
 * @returns {Promise<Object>} A SalesReportDto object.
 * @throws Will throw an error if the request fails.
 */
export const getSalesReport = async (startDate, endDate) => {
  try {
    const params = {};
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    const response = await axios.get(API_URL, { params });
    console.log("Service response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error in getSalesReport:", error);
    throw error;
  }
};

/**
 * Retrieves a sales report by its ID.
 * @async
 * @function getSalesReportById
 * @param {number} id - The ID of the sales report.
 * @returns {Promise<Object>} A SalesReportDto object.
 * @throws Will throw an error if the request fails.
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
 * Creates a new sales report.
 * @async
 * @function createSalesReport
 * @param {Object} reportData - The SalesReportDto containing the new report data.
 * @returns {Promise<Object>} The created SalesReportDto.
 * @throws Will throw an error if the request fails.
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
