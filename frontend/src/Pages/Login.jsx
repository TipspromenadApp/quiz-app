import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5249/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login success:", data);
        localStorage.setItem("user", JSON.stringify(data));

        localStorage.setItem("loggedInUser", data.username || username);

        navigate("/dashboard");
      } else {
        const errorText = await response.text();
        console.error("Login failed:", errorText);
        alert("Inloggningen misslyckades");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Fel vid inloggning");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Logga in</h2>
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

