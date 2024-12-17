/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  forgotPassword,
  sendEmailWithCode,
  verifyCode,
} from "../../services/UserLoginServices";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false); // Para mostrar el modal
  const [verificationCode, setVerificationCode] = useState(""); // Código ingresado por el usuario
  const [generatedCode, setGeneratedCode] = useState(""); // Código generado
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      // Solicitar el código al backend
      const code = await forgotPassword(email);

      console.log("Código recibido en el frontend:", code);
      setGeneratedCode(code); // Guardar el código para la verificación

      // Enviar el código usando EmailJS
      await sendEmailWithCode(email, code);

      setSuccess(true);
      setShowModal(true); // Mostrar el modal para ingresar el código
    } catch (err) {
      setError(err.message || "Error al enviar el código.");
    }
  };

  const handleVerifyCode = async () => {
    try {
      // Verificar el código ingresado por el usuario
      await verifyCode(email, verificationCode);
      alert("Código verificado correctamente.");

      // Redirigir al componente ChangePassword
      navigate("/change-password", { state: { email } });
    } catch (err) {
      setError("Código incorrecto o expirado.");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow p-4 forgot-password-card">
        <h2 className="text-center mb-4">FORGOT PASSWORD</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              EMAIL
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
          {error && <div className="text-danger mb-3">{error}</div>}
          {success && (
            <div className="text-success mb-3">
              ¡Código enviado correctamente!
            </div>
          )}
          <div className="d-grid gap-2">
            <button type="submit" className="btn btn-primary">
              SEND CODE
            </button>
          </div>
        </form>
        <div className="text-center mt-3">
          <Link to="/" className="text-decoration-none">
            ← BACK TO LOGIN
          </Link>
        </div>
      </div>

      {/* Modal para ingresar el código de verificación */}
      {showModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter Verification Code</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Por favor, ingresa el código de verificación que se envió a tu
                  correo electrónico.
                </p>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleVerifyCode}
                >
                  Verify Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
