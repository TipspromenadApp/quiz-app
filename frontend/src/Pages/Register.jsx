import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Register.css";

function Register() {
  const [username, setUsername] = useState(""); // NEW
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();
    
    console.log("Register clicked:", username, email, password); // UPDATED
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>

          {/* Username Field */}
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          {/* Email Field */}
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password Field */}
          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Register</button>
        </form>

        <Link to="/" className="back-link">← Back to Home</Link>
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



