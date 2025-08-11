// SignUpCard.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import SignUpPeople from "../assets/SignUpPeople.png";
import "./SignUpCard.css";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS } from "../config/api.js";

import { t } from "i18next";

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

const countries = [
  { code: "US", flag: "🇺🇸", dialCode: "+1", name: "United States" },
  { code: "SG", flag: "🇸🇬", dialCode: "+65", name: "Singapore" },
  { code: "GB", flag: "🇬🇧", dialCode: "+44", name: "United Kingdom" },
  { code: "AU", flag: "🇦🇺", dialCode: "+61", name: "Australia" },
  { code: "CA", flag: "🇨🇦", dialCode: "+1", name: "Canada" },
  { code: "DE", flag: "🇩🇪", dialCode: "+49", name: "Germany" },
  { code: "FR", flag: "🇫🇷", dialCode: "+33", name: "France" },
  { code: "JP", flag: "🇯🇵", dialCode: "+81", name: "Japan" },
  { code: "KR", flag: "🇰🇷", dialCode: "+82", name: "South Korea" },
  { code: "CN", flag: "🇨🇳", dialCode: "+86", name: "China" },
  { code: "IN", flag: "🇮🇳", dialCode: "+91", name: "India" },
  { code: "MY", flag: "🇲🇾", dialCode: "+60", name: "Malaysia" },
];

function SignUpCard() {
  const {t} = useTranslation();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState(countries[1]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();



  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    if (password !== confirmPassword) {
      setStatus(t("Passwords do not match!"));
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setStatus(passwordValidation.errors.join(", "));
      setLoading(false);
      return;
    }

    const requestBody = {
      name,
      username,
      number: `${selectedCountry.dialCode}${number}`,
      email,
      password
    };

    try {
      const res = await fetch(API_ENDPOINTS.USER_SIGNUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("Account created successfully!");
        localStorage.setItem("email", email);
        localStorage.setItem("username", username);
        localStorage.setItem("canVerifyEmail", 'true');
        navigate("/auth");
      } else {
        setStatus(`Sign up failed: ${data.error || data.message}`);
      }
    } catch (err) {
      console.error("Sign up error:", err);
      setStatus("Sign up failed. Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
  };

  const formatPhoneNumber = (raw) => {
    const cleaned = raw.replace(/\D/g, "");

    if (selectedCountry.code === "SG") {
      if (cleaned.length <= 4) return cleaned;
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)}`;
    }

    return cleaned.replace(/(.{3})/g, "$1 ").trim();
  };

  const handlePhoneChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, "");
    setNumber(cleaned);
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible((prev) => !prev);
  };

  return (
    <div className="signup-container">
      <img src={SignUpPeople} alt="Sign Up Visual" className="signup-image" />
      <form onSubmit={handleSignUp} className="signup-form">
        <div className="welcome-section">
          <h2 className="welcome-title">{t("Create an account")}</h2>
          <p className="welcome-subtitle">
            {t("Already have an account?")}{" "}
            <Link to="/login" className="register-link">{t("Log In")}</Link>
          </p>
        </div>

        <div className="form-field">
          <label className="form-label">{t("Name")}</label>
          <input
            type="text"
            placeholder={t("Enter your name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label className="form-label">{t("Username")}</label>
          <input
            type="text"
            placeholder={t("Enter your username")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="form-input" />
        </div>

        <div className="form-field">
          <label className="form-label">{t("Phone number")}</label>
          <div className="phone-input-container">
            <div className="country-selector">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="country-button">
                <span className="country-flag">{selectedCountry.flag}</span>
                <ChevronDown size={16} className="chevron-icon" />
              </button>

              {isDropdownOpen && (
                <div className="country-dropdown">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => handleCountrySelect(country)}
                      className="country-option">
                      <span className="country-flag">{country.flag}</span>
                      <span className="country-name">{country.name}</span>
                      <span className="country-code">{country.dialCode}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <span className="dial-code">{selectedCountry.dialCode}</span>

            <input
              type="tel"
              value={formatPhoneNumber(number)}
              onChange={handlePhoneChange}
              className="phone-input" />
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">{t("Email address")}</label>
          <input
            type="email"
            placeholder={t("Enter your email address")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input" />
        </div>

        <div className="password-row">
          <div className="form-field password-group">
            <label className="password-label">
              {t("Password")}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle">
                {passwordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{passwordVisible ? t("Hide") : t("Show")}</span>
              </button>
            </label>
            <input
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input" />
          </div>

          <div className="form-field password-group">
            <label className="password-label">
              {t("Confirm Password")}
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="password-toggle">
                {confirmPasswordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{confirmPasswordVisible ? t("Hide") : t("Show")}</span>
              </button>
            </label>
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-input" />
          </div>
        </div>

        {password && (
          <div className="password-requirements">
            <div className={`requirement ${password.length >= 8 ? "met" : "unmet"}`}>
              {t("✓ At least 8 characters")}
            </div>
            <div className={`requirement ${/[A-Z]/.test(password) ? "met" : "unmet"}`}>
              {t("✓ One uppercase letter")}
            </div>
            <div className={`requirement ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? "met" : "unmet"}`}>
              {t("✓ One special character")}
            </div>
          </div>
        )}

        <button type="submit" className="signup-button" disabled={loading}>
          {loading ? t("Signing up...") : t("Sign Up")}
        </button>

        {status &&
          (<div className={`status-message ${status.includes("successfully") ? "success" : "error"}`}>
            {status}
          </div>)}
      </form>
    </div>
  );
}

export default SignUpCard;
