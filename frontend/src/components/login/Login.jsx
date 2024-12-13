/* eslint-disable no-unused-vars */
// src/components/login/Login.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import loginImage from "../../images/login-image.jpg"; // Asegúrate de que la ruta es correcta

const Login = () => {
  return (
    <div className="login-container d-flex justify-content-center align-items-center vh-100">
      <div className="row login-row shadow-lg">
        {/* Columna para la imagen */}
        <div className="col-md-5 d-flex justify-content-center align-items-center login-image-container">
          <img src={loginImage} alt="Login" className="login-image img-fluid" />
        </div>
        {/* Columna para el formulario de login */}
        <div className="col-md-7 login-box p-5 bg-white">
          <h2 className="login-title text-center mb-4">WELCOME!</h2>
          <form className="login-form">
            <div className="mb-3">
              <input
                type="text"
                placeholder="USER NAME"
                className="form-control login-input"
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                placeholder="PASSWORD"
                className="form-control login-input"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 login-button">
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
          <Link to="/home">Home</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
