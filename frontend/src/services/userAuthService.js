// src/services/userAuthService.js
export const loginUser = async (username, password) => {
  const response = await fetch("http://localhost:5232/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Credenciales inválidas");
  }

  // Retorna la respuesta en JSON (por ejemplo, un token o mensaje)
  return response.json();
};
