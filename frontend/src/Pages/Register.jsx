import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const navigate = useNavigate();

  const audioRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5249";
  const REGISTER_URL = `${API_BASE}/api/auth/register`;

  useEffect(() => {
   
    const el = audioRef.current;
    if (el) {
      el.volume = 0.2;
      const p = el.play?.();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        username: username.trim() || undefined,
        email: email.trim().toLowerCase(),
        password: password,
      };

      const res = await fetch(REGISTER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = "Registrering misslyckades";
        try {
          const body = await res.json();
          msg = body?.message || msg;
        } catch {
          try { msg = (await res.text()) || msg; } catch {}
        }
        throw new Error(`HTTP ${res.status}: ${msg}`);
      }

      const display = username.trim() || email.trim().toLowerCase();
      localStorage.setItem("loggedInUser", display);
      localStorage.setItem("justRegisteredUser", display);
      navigate("/welcome-new", { state: { userName: display } });
    } catch (err) {
      console.error("Registreringsfel:", err);
      setError(err.message || "Ett fel uppstod. Försök igen senare.");
    }
  };

  return (
    <div className="register-page">
      <div className="background-image"></div>
     
      <audio ref={audioRef} src="/sounds/nightsky2.mp3" autoPlay loop />

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
    </div>
  );
}

export default Register;
