import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_BASE = "http://localhost:5249";
  const REGISTER_PATH = "/Register"; // <-- update to correct path from Swagger
  const REGISTER_URL = `${API_BASE}${REGISTER_PATH}`;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log("POST ->", REGISTER_URL);

      const res = await fetch(REGISTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text || "Registrering misslyckades"}`);
      }

      localStorage.setItem("justRegisteredUser", username);
      navigate("/welcome-new", { state: { userName: username } });
    } catch (err) {
      console.error("Registreringsfel:", err);
      setError(err.message || "Ett fel uppstod. Försök igen senare.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Registrera</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleRegister}>
          <label>Användarnamn</label>
          <input
            type="text"
            placeholder="Ange användarnamn"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>E-post</label>
          <input
            type="email"
            placeholder="Ange e-postadress"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Lösenord</label>
          <input
            type="password"
            placeholder="Skapa ett lösenord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Registrera</button>
        </form>

        <Link to="/" className="back-link">← Tillbaka till startsidan</Link>
      </div>

      {[...Array(10)].map((_, i) => {
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const delay = Math.random() * 5;
        return (
          <div
            key={i}
            className="firefly"
            style={{
              top: `${top}vh`,
              left: `${left}vw`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}

export default Register;





