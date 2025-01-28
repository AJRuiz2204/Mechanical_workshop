/* eslint-disable no-unused-vars */
// src/components/login/Login.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import loginImage from "../../images/login-image.jpg";
import { loginUser } from "../../services/UserLoginServices";

/**
 * Login Component
 * Handles user authentication by allowing users to enter their credentials and log into the application.
 *
 * @returns {JSX.Element} The Login component.
 */
const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /**
   * Handles form submission for user login.
   *
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Attempting to log in with:", { username, password }); // Credential log
    const credentials = { username, password };
    try {
      const response = await loginUser(credentials); // Save the full response
      console.log("Response from loginUser:", response); // Response log

      // Destructure with correct names
      const { token, user } = response;

      if (!token || !user) {
        throw new Error("Invalid login response.");
      }

      // Store in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      console.log("Data stored in localStorage."); // Storage confirmation

      // Navigate to the home page
      navigate("/home");
    } catch (err) {
      console.error("Error in handleSubmit:", err); // Error log
      // Handle errors more specifically if possible
      setError(err.message || "Error logging in.");
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
          {/* <div className="text-center mt-3">
            <Link to="/forgot-password" className="forgot-password-link">
              FORGOT PASSWORD?
            </Link>
          </div>
          <div className="text-center mt-2">
            <span className="text-muted">New User? </span>
            <Link to="/register-user" className="register-user-link">
              Register here
            </Link>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
