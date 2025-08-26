import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const navigate = useNavigate();

  const API_BASE  = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5249";
  const LOGIN_URL = `${API_BASE}/api/auth/login`;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password
        })
      });

      if (!res.ok) {
        let msg = "Wrong email or password";
        try {
          const body = await res.json();
          msg = body?.message || msg;
        } catch {
          try { msg = (await res.text()) || msg; } catch {}
        }
        setError(msg);
        alert("Inloggningen misslyckades");
        return;
      }

      const data = await res.json();
      localStorage.setItem("user", JSON.stringify(data));

      const displayName =
        data?.user?.username ||
        data?.user?.Username ||
        data?.user?.email ||
        data?.user?.Email ||
        email.trim().toLowerCase();

      localStorage.setItem("loggedInUser", displayName);
      navigate("/dashboard");
    } catch (err) {
      console.error("Network error:", err);
      setError("Fel vid inloggning");
      alert("Fel vid inloggning");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Logga in</h2>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleLogin}>
          <label>E-post</label>
          <input
            type="email"
            placeholder="Ange e-post"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Lösenord</label>
          <input
            type="password"
            placeholder="Ange lösenord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Logga in</button>
        </form>

        <Link to="/" className="back-link">← Tillbaka till start</Link>
      </div>

      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="firefly"
          style={{
            top: `${Math.random() * 100}vh`,
            left: `${Math.random() * 100}vw`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

export default Login;
