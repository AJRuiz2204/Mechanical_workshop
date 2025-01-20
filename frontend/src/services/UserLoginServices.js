import emailjs from "emailjs-com";
import axios from "axios";

const API_URL = "http://localhost:5121/api/Users";

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const isLoggedIn = () => {
  return !!localStorage.getItem("token");
};

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const forgotPassword = async (email) => {
  try {
    const response = await fetch("/api/Users/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.Message || "Error requesting password reset.");
    }

    const data = await response.json();
    console.log("Code received from backend:", data.code); // Ensure to use 'code' in lowercase
    return data.code; // Returns the code
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    throw error;
  }
};

export const sendEmailWithCode = async (email, code) => {
  const templateParams = {
    to_email: email,
    verification_code: code.toString(), // Convert to string if it's not
  };

  console.log("Parameters sent to EmailJS:", templateParams); // Log to verify

  try {
    const result = await emailjs.send(
      "service_9tqk6il", // Your Service ID
      "template_9uo1y37", // Your Template ID
      templateParams,
      "FKbbn9NFIEk2ZxxX7" // Your Public Key
    );

    console.log("Email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Error sending the email:", error);
    throw new Error("Error sending the email.");
  }
};

export const verifyCode = async (email, code) => {
  try {
    const response = await fetch("/api/Users/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Email: email, Code: code }),
    });

    let data;
    const contentType = response.headers.get("Content-Type");

    // Check if the response is JSON or plain text
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text(); // Handle plain text
    }

    if (!response.ok) {
      throw new Error(data.Message || "Invalid or expired code.");
    }

    console.log("Code verified successfully:", data);
    return data; // Returns the message or JSON from the backend
  } catch (error) {
    console.error("Error in verifyCode:", error);
    throw error;
  }
};

export const changePassword = async (email, newPassword) => {
  try {
    const response = await fetch("/api/Users/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Email: email, NewPassword: newPassword }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.Message || "Error changing the password.");
    }

    const data = await response.json();
    console.log("Password changed successfully:", data.Message);
    console.log("Affected user:", data.User);
    return data; // Returns the backend response
  } catch (error) {
    console.error("Error in changePassword:", error);
    throw error;
  }
};
