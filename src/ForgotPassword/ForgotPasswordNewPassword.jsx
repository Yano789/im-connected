import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import LoginPeople from "../assets/LoginPeople.png";
import "./ForgotPassword.css";

const validatePassword = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

function ForgotPasswordNewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  useEffect(() => {
    if (!email) {
      navigate("/forgotpassword");
      return;
    }
  }, [email, navigate]);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    if (password !== confirmPassword) {
      setStatus("Passwords do not match!");
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setStatus(passwordValidation.errors.join(", "));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/v1/forgot_password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword: password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("Password reset successfully!");
        setTimeout(() => {
          localStorage.removeItem("resetEmail");
          navigate("/login");
        }, 1500);
      } else {
        setStatus(`Password reset failed: ${data.error || data.message}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      setStatus("Password reset failed. Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <img src={LoginPeople} alt="Forgot Password Visual" className="forgot-password-image" />
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <div className="welcome-section">
          <h2 className="welcome-title">Set New Password</h2>
          <p className="welcome-subtitle">
            Enter your new password below
          </p>
        </div>

        <div className="password-row">
          <div className="form-field password-group">
            <label className="password-label">
              New Password
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle">
                {passwordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{passwordVisible ? "Hide" : "Show"}</span>
              </button>
            </label>
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"/>
          </div>

          <div className="form-field password-group">
            <label className="password-label">
              Confirm Password
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="password-toggle">
                {confirmPasswordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{confirmPasswordVisible ? "Hide" : "Show"}</span>
              </button>
            </label>
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
        </div>

        {password && 
        (<div className="password-requirements">
            <div className={`requirement ${password.length >= 8 ? "met" : "unmet"}`}>
              ✓ At least 8 characters
            </div>
            <div className={`requirement ${/[A-Z]/.test(password) ? "met" : "unmet"}`}>
              ✓ One uppercase letter
            </div>
            <div className={`requirement ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? "met" : "unmet"}`}>
              ✓ One special character
            </div>
          </div>
        )}

        <button
          type="submit"
          className="forgot-password-button"
          disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {status && (
          <div className={`status-message ${status.includes("successfully") ? "success" : "error"}`}>
            {status}
          </div>
        )}

        <div className="back-to-login">
          <Link to="/login" className="register-link">
            ← Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}

export default ForgotPasswordNewPassword; 