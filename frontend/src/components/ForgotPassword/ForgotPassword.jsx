/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  forgotPassword,
  sendEmailWithCode,
  verifyCode,
} from "../../services/UserLoginServices";
import NotificationService from "../../services/notificationService.jsx";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false); // To show the modal
  const [verificationCode, setVerificationCode] = useState(""); // Code entered by the user
  const [generatedCode, setGeneratedCode] = useState(""); // Generated code
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      // Request the code from the backend
      const code = await forgotPassword(email);

      console.log("Code received in frontend:", code);
      setGeneratedCode(code); // Save the code for verification

      // Send the code using EmailJS
      await sendEmailWithCode(email, code);

      setSuccess(true);
      setShowModal(true); // Show the modal to enter the code
    } catch (err) {
      setError(err.message || "Error sending the code.");
    }
  };

  const handleVerifyCode = async () => {
    try {
      // Verify the code entered by the user
      await verifyCode(email, verificationCode);
      NotificationService.success("Code Verified", "Code verified successfully.");

      // Redirect to the ChangePassword component
      navigate("/change-password", { state: { email } });
    } catch (err) {
      setError("Incorrect or expired code.");
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
              Code sent successfully!
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

      {/* Modal to enter the verification code */}
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
                  Please enter the verification code that was sent to your
                  email address.
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
