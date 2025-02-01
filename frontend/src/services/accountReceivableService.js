const ACCOUNT_RECEIVABLE_API_URL = "/api/AccountReceivable";
const PAYMENT_API_URL = (accountId) =>
  `${ACCOUNT_RECEIVABLE_API_URL}/Payment/${accountId}`;
const CREATE_PAYMENT_URL = `${ACCOUNT_RECEIVABLE_API_URL}/Payment`;



export const getAllPayments = async () => {
  try {
    const response = await fetch(`${ACCOUNT_RECEIVABLE_API_URL}/Payment`);
    if (!response.ok) {
      throw new Error("Error fetching all payments");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getAllPayments:", error);
    throw error;
  }
};

export const getPaymentsByCustomer = async (customerId) => {
  try {
    const response = await fetch(`${ACCOUNT_RECEIVABLE_API_URL}/Payment/Client/${customerId}`);
    if (!response.ok) {
      throw new Error(`Error fetching payments for customer ${customerId}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getPaymentsByCustomer:", error);
    throw error;
  }
};


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
      let errorMessage = "Error creando la cuenta por cobrar";
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
    console.error("Error en createAccountReceivable:", error);
    throw error;
  }
};

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

