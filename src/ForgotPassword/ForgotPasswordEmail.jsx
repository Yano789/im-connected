import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LoginPeople from "../assets/LoginPeople.png";
import "./ForgotPassword.css";
import { useTranslation } from "react-i18next";

function ForgotPasswordEmail() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {t} = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("http://localhost:5001/api/v1/forgot_password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("Password reset code sent to your email!");
        localStorage.setItem("resetEmail", email);
        setTimeout(() => {
          navigate("/forgotpassword/otp");
        }, 1500);
      } else {
        setStatus(`Failed to send reset code: ${data.error || data.message}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      setStatus("Failed to send reset code. Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <img src={LoginPeople} alt="Forgot Password Visual" className="forgot-password-image" />
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <div className="welcome-section">
          <h2 className="welcome-title">{t("Forgot Password?")}</h2>
          <p className="welcome-subtitle">
            {t("Don't worry! Enter your email address and we'll send you a reset code.")}
          </p>
        </div>

        <div className="form-field">
          <label className="form-label">{t("Email address")}</label>
          <input
            type="email"
            placeholder={t("Enter your email address")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <button 
          type="submit" 
          className="forgot-password-button"
          disabled={loading}
        >
          {loading ? t("Sending...") : t("Send Reset Code")}
        </button>

        {status && (
          <div className={`status-message ${status.includes("sent") ? "success" : "error"}`}>
            {status}
          </div>
        )}

        <div className="back-to-login">
          <Link to="/login" className="register-link">
            {t("← Back to Login")}
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ForgotPasswordEmail; 