import api from './api';
const ACCOUNT_RECEIVABLE_API_URL = '/AccountReceivable';
const PAYMENT_API_URL = (accountId) =>
  `${ACCOUNT_RECEIVABLE_API_URL}/Payment/${accountId}`;
const CREATE_PAYMENT_URL = `${ACCOUNT_RECEIVABLE_API_URL}/Payment`;

/**
 * Retrieves all payments from the API.
 * @async
 * @function getAllPayments
 * @returns {Promise<Array>} An array of all payments.
 * @throws Will throw an error if the request fails.
 */
export const getAllPayments = async () => {
  try {
    const response = await api.get(`${ACCOUNT_RECEIVABLE_API_URL}/Payment`);
    return response.data;
  } catch (error) {
    console.error("Error in getAllPayments:", error);
    throw error;
  }
};

/**
 * Retrieves all payments for a specific customer.
 * @async
 * @function getPaymentsByCustomer
 * @param {number|string} customerId - The ID of the customer.
 * @returns {Promise<Array>} An array of payments for the specified customer, sorted by payment date (most recent first).
 * @throws Will throw an error if the request fails.
 */
export const getPaymentsByCustomer = async (customerId) => {
  try {
    const response = await api.get(
      `${ACCOUNT_RECEIVABLE_API_URL}/Payment/Client/${customerId}`
    );
    
    // Sort payments by payment date (most recent first)
    const sortedPayments = response.data.sort((a, b) => {
      const dateA = new Date(a.paymentDate);
      const dateB = new Date(b.paymentDate);
      return dateB - dateA; // Descending order (most recent first)
    });
    
    return sortedPayments;
  } catch (error) {
    console.error("Error in getPaymentsByCustomer:", error);
    throw error;
  }
};

/**
 * Retrieves all accounts receivable.
 * @async
 * @function getAccountsReceivable
 * @returns {Promise<Array>} An array of accounts receivable.
 * @throws Will throw an error if the request fails.
 */
export const getAccountsReceivable = async () => {
  try {
    const response = await api.get(ACCOUNT_RECEIVABLE_API_URL);
    return response.data;
  } catch (error) {
    console.error("Error in getAccountsReceivable:", error);
    throw error;
  }
};

/**
 * Retrieves a single account receivable by its ID.
 * @async
 * @function getAccountReceivableById
 * @param {number|string} id - The ID of the account receivable.
 * @returns {Promise<Object>} The account receivable object.
 * @throws Will throw an error if the request fails.
 */
export const getAccountReceivableById = async (id) => {
  try {
    const response = await api.get(`${ACCOUNT_RECEIVABLE_API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error in getAccountReceivableById:", error);
    throw error;
  }
};

/**
 * Creates a new account receivable.
 * @async
 * @function createAccountReceivable
 * @param {Object} accountData - The data for the new account receivable.
 * @returns {Promise<Object>} The created account receivable.
 * @throws Will throw an error if the request fails.
 */
export const createAccountReceivable = async (accountData) => {
  try {
    const response = await api.post(ACCOUNT_RECEIVABLE_API_URL, accountData);
    return response.data;
  } catch (error) {
    console.error("Error in createAccountReceivable:", error);
    throw error;
  }
};

/**
 * Updates an existing account receivable by its ID.
 * @async
 * @function updateAccountReceivable
 * @param {number|string} id - The ID of the account receivable to update.
 * @param {Object} updateData - The updated data.
 * @returns {Promise<Object>} The updated account receivable data.
 * @throws Will throw an error if the request fails.
 */
export const updateAccountReceivable = async (id, updateData) => {
  try {
    const response = await api.put(`${ACCOUNT_RECEIVABLE_API_URL}/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error in updateAccountReceivable:", error);
    throw error;
  }
};

/**
 * Deletes an account receivable by its ID.
 * @async
 * @function deleteAccountReceivable
 * @param {number|string} id - The ID of the account receivable to delete.
 * @returns {Promise<boolean>} Returns true if the deletion is successful.
 * @throws Will throw an error if the request fails.
 */
export const deleteAccountReceivable = async (id) => {
  try {
    await api.delete(`${ACCOUNT_RECEIVABLE_API_URL}/${id}`);
    return true;
  } catch (error) {
    console.error("Error in deleteAccountReceivable:", error);
    throw error;
  }
};

/**
 * Creates a new payment.
 * @async
 * @function createPayment
 * @param {Object} paymentData - The data for the new payment.
 * @returns {Promise<Object>} The created payment object.
 * @throws Will throw an error if the request fails.
 */
export const createPayment = async (paymentData) => {
  try {
    const response = await api.post(CREATE_PAYMENT_URL, paymentData);
    return response.data;
  } catch (error) {
    console.error("Error in createPayment:", error);
    throw error;
  }
};

/**
 * Retrieves all payments for a specific account.
 * @async
 * @function getPaymentsByAccount
 * @param {number|string} accountId - The ID of the account.
 * @returns {Promise<Array>} An array of payments for the specified account, sorted by payment date (most recent first).
 * @throws Will throw an error if the request fails.
 */
export const getPaymentsByAccount = async (accountId) => {
  try {
    const response = await api.get(PAYMENT_API_URL(accountId));
    
    // Sort payments by payment date (most recent first)
    const sortedPayments = response.data.sort((a, b) => {
      const dateA = new Date(a.paymentDate);
      const dateB = new Date(b.paymentDate);
      return dateB - dateA; // Descending order (most recent first)
    });
    
    return sortedPayments;
  } catch (error) {
    console.error("Error in getPaymentsByAccount:", error);
    throw error;
  }
};
