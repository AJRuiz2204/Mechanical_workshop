/* eslint-disable no-unused-vars */
// src/components/login/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import loginImage from "../../images/login-image.jpg";
import { loginUser } from "../../services/UserLoginServices"; // Asegurarse de importar correctamente

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Intentando iniciar sesión con:", { username, password }); // Log de credenciales
    const credentials = { username, password };
    try {
      const response = await loginUser(credentials); // Guardar la respuesta completa
      console.log("Respuesta de loginUser:", response); // Log de respuesta

      // Desestructurar con nombres correctos
      const { token, user } = response;

      if (!token || !user) {
        throw new Error("Respuesta de login inválida.");
      }

      // Almacenar en localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      console.log("Datos almacenados en localStorage."); // Confirmación de almacenamiento

      // Navegar a la página principal
      navigate("/home");
    } catch (err) {
      console.error("Error en handleSubmit:", err); // Log de error
      // Manejar errores más detalladamente si es posible
      setError(err.message || "Error al iniciar sesión.");
    }
  };

  return (
    <div className="login-container d-flex justify-content-center align-items-center vh-100">
      <div className="row login-row shadow-lg">
        <div className="col-md-5 d-flex justify-content-center align-items-center login-image-container">
          <img src={loginImage} alt="Login" className="login-image img-fluid" />
        </div>
        <div className="col-md-7 login-box p-5 bg-white">
          <h2 className="login-title text-center mb-4">WELCOME!</h2>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                placeholder="USER NAME"
                className="form-control login-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                placeholder="PASSWORD"
                className="form-control login-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-danger mb-3">{error}</div>}
            <button
              type="submit"
              className="btn btn-primary w-100 login-button"
            >
              LOGIN
            </button>
          </form>
          <div className="text-center mt-3">
            <Link to="/forgot-password" className="forgot-password-link">
              FORGOT PASSWORD?
            </Link>
          </div>
          <div className="text-center mt-2">
            <span className="text-muted">New User? </span>
            <Link to="/register-user" className="register-user-link">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
