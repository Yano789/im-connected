import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginPeople from "../assets/LoginPeople.png";
import "./ForgotPassword.css";

function ForgotPasswordOTP() {
  const inputsRef = useRef([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  useEffect(() => {
    if (!email) {
      navigate("/forgotpassword");
      return;
    }

    setTimeout(() => {
      inputsRef.current[0]?.focus();
    }, 0);
  }, [email, navigate]);

  const handleInput = (e, Index) => {
    const value = e.target.value;
    if (/^\d$/.test(value)) {
      if (Index < 5) {
        inputsRef.current[Index + 1]?.focus();
      }
    } else {
      e.target.value = "";
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    if (digits.length === 6) {
      inputsRef.current.forEach((input, index) => {
        if (input) {
          input.value = digits[index];
        }
      });
      inputsRef.current[5]?.focus();
    }
  };

  const handleKeyDown = (e, Index) => {
    if (e.key === "Backspace" && !e.target.value && Index > 0) {
      inputsRef.current[Index - 1]?.focus();
    }
  };

  const handleResend = async () => {
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
        setStatus("Reset code has been resent!");
      } else {
        setStatus(`Failed to resend code: ${data.error || data.message}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      setStatus("Failed to resend code. Network error.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    const code = inputsRef.current.map((input) => input.value).join("");

    try {
      const res = await fetch("http://localhost:5001/api/v1/forgot_password/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: code }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("Code verified successfully!");
        navigate("/forgotpassword/newpassword");
      } else {
        setStatus(`Verification failed: ${data.error || data.message}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("Verification failed. Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <img src={LoginPeople} alt="Forgot Password Visual" className="forgot-password-image" />
      <form onSubmit={handleSubmit} className="forgot-password-form">
        <div className="welcome-section">
          <h2 className="welcome-title">Enter Reset Code</h2>
          <p className="welcome-subtitle">
            We sent a 6-digit code to {email}
          </p>
          <div className="resend-section">
            <p className="resend-text">
              Didn't get the code? Click {' '}
              <button type="button" className="resend-link" onClick={handleResend}>
                here
              </button>
              {' '}to resend.
            </p>
          </div>
        </div>

        <div className="otp-inputs">
          {[...Array(6)].map((_, i) => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              maxLength="1"
              className="otp-box"
              ref={(el) => (inputsRef.current[i] = el)}
              onInput={(e) => handleInput(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        <button
          type="submit"
          className="forgot-password-button"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>

        {status && (
          <div className={`status-message ${status.includes("successfully") ? "success" : "error"}`}>
            {status}
          </div>
        )}

        <div className="back-to-login">
          <button
            type="button"
            className="register-link"
            onClick={() => navigate("/forgotpassword")}>
            ← Back to Email
          </button>
        </div>
      </form>
    </div>
  );
}

export default ForgotPasswordOTP; 