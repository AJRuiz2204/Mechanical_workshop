/* eslint-disable no-useless-catch */
// Frontend: src/services/UserLoginServices.js
import emailjs from "emailjs-com";

export const loginUser = async (credentials) => {
  try {
    const response = await fetch("/api/Users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData || "Error al iniciar sesión.");
    }
    const data = await response.json();
    return data; // Retorna la información del usuario
  } catch (error) {
    throw error;
  }
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
      throw new Error(
        errorData.Message ||
          "Error al solicitar restablecimiento de contraseña."
      );
    }

    const data = await response.json();
    console.log("Código recibido del backend:", data.code); // Asegúrate de usar 'code' en minúsculas
    return data.code; // Retorna el código
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    throw error;
  }
};

export const sendEmailWithCode = async (email, code) => {
  const templateParams = {
    to_email: email,
    verification_code: code.toString(), // Convertir a string si no lo es
  };

  console.log("Parámetros enviados a EmailJS:", templateParams); // Log para verificar

  try {
    const result = await emailjs.send(
      "service_9tqk6il", // Tu Service ID
      "template_9uo1y37", // Tu Template ID
      templateParams,
      "FKbbn9NFIEk2ZxxX7" // Tu Public Key
    );

    console.log("Email enviado correctamente:", result);
    return result;
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
    throw new Error("Error al enviar el correo electrónico.");
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

    // Verifica si la respuesta es JSON o texto plano
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text(); // Maneja texto plano
    }

    if (!response.ok) {
      throw new Error(data.Message || "Código inválido o expirado.");
    }

    console.log("Código verificado correctamente:", data);
    return data; // Retorna el mensaje o JSON del backend
  } catch (error) {
    console.error("Error en verifyCode:", error);
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
      throw new Error(errorData.Message || "Error al cambiar la contraseña.");
    }

    const data = await response.json();
    console.log("Contraseña cambiada correctamente:", data.Message);
    console.log("Usuario afectado:", data.User);
    return data; // Retorna la respuesta del backend
  } catch (error) {
    console.error("Error en changePassword:", error);
    throw error;
  }
};
