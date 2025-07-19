// LoginCard.jsx
import { useState } from "react";
import "./LoginCard.css"; // for styling, see below

function LoginCard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/v1/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("Login successful!");
        console.log("Authenticated User:", data);
      } else {
        setStatus(`Login failed: ${data}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("Login failed. Network error.");
    }
  };

  return (
    <div className="login-card">
      <h2>not the final product</h2>
      <h2>Will change later, need for cookie for forum - iris</h2>
      <h2>Not required for the rest of the features</h2>
      <h2>No need sign in, just change the url</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}  
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {status && <div className="status">{status}</div>}
    </div>
  );
}

export default LoginCard;
