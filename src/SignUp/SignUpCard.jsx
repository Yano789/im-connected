// SignUpCard.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import SignUpPeople from "../assets/SignUpPeople.png";
import "./SignUpCard.css";

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
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [number, setNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [status, setStatus] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(countries[1]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setStatus("Passwords do not match!");
      return;
    }

    const fullNumber = `${selectedCountry.dialCode}${number}`;

    try {
      const res = await fetch("http://localhost:5000/api/v1/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name,
          username,
          number: `${selectedCountry.dialCode}${number}`,
          email,
          password
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("Account created successfully!");
        console.log("Created User:", data);
        localStorage.setItem("email", email);
        localStorage.setItem("username", username);
        localStorage.setItem("canVerifyEmail", 'true');
        navigate("/auth");
      } else {
        setStatus(`Sign up failed: ${data.message || JSON.stringify(data)} (Phone: ${fullNumber})`);
      }
    } catch (err) {
      console.error(err);
      setStatus("Sign up failed. Network error.");
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

    // Fallback: group every 3 digits (basic readable grouping)
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
          <h2 className="welcome-title">Create an account</h2>
          <p className="welcome-subtitle">
            Already have an account?{" "}
            <Link to="/login" className="register-link">Log In</Link>
          </p>
        </div>

        <div className="form-field">
          <label className="form-label">Name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <div className="form-field">
          <label className="form-label">Phone number</label>
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
              className="phone-input"
            />
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">Email address</label>
          <input
            type="text"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
          />
        </div>

        <div className="password-row">
          <div className="form-field password-group">
            <label className="password-label">
              Password
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle"
              >
                {passwordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{passwordVisible ? "Hide" : "Show"}</span>
              </button>
            </label>
            <input
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-field password-group">
            <label className="password-label">
              Confirm Password
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="password-toggle"
              >
                {confirmPasswordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{confirmPasswordVisible ? "Hide" : "Show"}</span>
              </button>
            </label>
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
        </div>

        <p className="password-requirements">
          Use 8 or more characters with a mix of letters, numbers & symbols
        </p>


        <button type="submit" className="signup-button" onClick={handleSignUp}>
          Sign Up
        </button>

        {status && <div className="status-message">{status}</div>}
      </form>
    </div>

  );
}

export default SignUpCard;
