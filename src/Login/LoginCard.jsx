// LoginCard.jsx
import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {Eye, EyeOff } from "lucide-react";
import { AuthContext } from "../AuthContext";
import LoginPeople from "../assets/LoginPeople.png";
import "./LoginCard.css";

function LoginCard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const remember = localStorage.getItem("rememberMe") === "true";
    const savedUsername = localStorage.getItem("savedUsername");
    const savedPassword = localStorage.getItem("savedPassword");

    if (remember && savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5001/api/v1/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({ username, password, rememberMe }),
      });

      const data = await res.json();

      if (res.ok) {
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
          localStorage.setItem("savedUsername", username);
          localStorage.setItem("savedPassword", password);
        } else {
          localStorage.removeItem("rememberMe");
          localStorage.removeItem("savedUsername");
          localStorage.removeItem("savedPassword");
        }

        setStatus("Login successful!");
        setUser(data);
        console.log("Authenticated User:", data);
        navigate("/forum");
      } else {
        setStatus(`Login failed: ${data}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("Login failed. Network error.");
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  return (
    <div className="login-container">
      <img src={LoginPeople} alt="Login Visual" className="login-image"/>
      <form onSubmit={handleLogin} className="login-form">
        <div className="welcome-section">
          <h2 className="welcome-title">Welcome back!</h2>
          <p className="welcome-subtitle">
            Don't have an account?{" "}
            <Link to="/signup" className="register-link">Register Now!</Link>
          </p>
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
          <label className="password-label">
            Password
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-input"
          />
          <a href="#" className="forgot-password">
            Forget your password
          </a>
        </div>

        <label className="remember-me">
          <input 
            type="checkbox"
            className="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          Remember me
        </label>

        <button type="submit" className="login-button">
          Log in
        </button>

        {status && <div className="status-message">{status}</div>}
      </form>
    </div>

  );
}

export default LoginCard;
