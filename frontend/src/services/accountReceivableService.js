// src/services/accountReceivableService.js

const ACCOUNT_RECEIVABLE_API_URL = "/api/AccountReceivable";
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
    const response = await fetch(`${ACCOUNT_RECEIVABLE_API_URL}/Payment`);
    if (!response.ok) {
      throw new Error("Error fetching all payments");
    }
    const payments = await response.json();
    console.log("All payments fetched:", payments);
    return payments;
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
 * @returns {Promise<Array>} An array of payments for the specified customer.
 * @throws Will throw an error if the request fails.
 */
export const getPaymentsByCustomer = async (customerId) => {
  try {
    const response = await fetch(
      `${ACCOUNT_RECEIVABLE_API_URL}/Payment/Client/${customerId}`
    );
    if (!response.ok) {
      throw new Error(`Error fetching payments for customer ${customerId}`);
    }
    return await response.json();
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
    const response = await fetch(ACCOUNT_RECEIVABLE_API_URL);
    if (!response.ok) {
      throw new Error("Error fetching accounts receivable");
    }
    return await response.json();
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
    const response = await fetch(`${ACCOUNT_RECEIVABLE_API_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Error fetching account with ID ${id}`);
    }
    return await response.json();
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
    const response = await fetch(ACCOUNT_RECEIVABLE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(accountData),
    });

    if (!response.ok) {
      let errorMessage = "Error creating the account receivable";
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } else {
        errorMessage = await response.text();
      }
      throw new Error(errorMessage);
    }

    return await response.json();
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
    const response = await fetch(`${ACCOUNT_RECEIVABLE_API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error updating account");
    }

    return await response.json();
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
    const response = await fetch(`${ACCOUNT_RECEIVABLE_API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Error deleting account");
    }
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
    const response = await fetch(CREATE_PAYMENT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error creating payment");
    }
    return await response.json();
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
 * @returns {Promise<Array>} An array of payments for the specified account.
 * @throws Will throw an error if the request fails.
 */
export const getPaymentsByAccount = async (accountId) => {
  try {
    const response = await fetch(PAYMENT_API_URL(accountId));
    if (!response.ok) {
      throw new Error(`Error fetching payments for account ${accountId}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getPaymentsByAccount:", error);
    throw error;
  }
};
