import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StayLoggedIn.css";

export default function StayLoggedIn() {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const [bgReady, setBgReady] = useState(false);
  const [name, setName] = useState("vän"); 

  
  const pickName = (arr) => {
    for (const v of arr) {
      const s = (typeof v === "string" ? v : "").trim();
      if (!s) continue;
      if (/^(guest|gäst)$/i.test(s)) continue; 
      return s;
    }
    return "";
  };

  const findDisplayName = () => {
    try {
      
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        const nested = u?.user ?? {};
        const fromUser = pickName([
          u?.username, u?.userName, u?.displayName, u?.name, u?.email,
          nested?.username, nested?.userName, nested?.displayName, nested?.name, nested?.email,
        ]);
        if (fromUser) return fromUser;
      }
     
      const fromLs = pickName([
        localStorage.getItem("loggedInUser"),
        localStorage.getItem("userName"),
        localStorage.getItem("username"),
        localStorage.getItem("displayName"),
        localStorage.getItem("email"),
        localStorage.getItem("justRegisteredUser"),
      ]);
      if (fromLs) return fromLs;

      return "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    localStorage.setItem("pref_keepLoggedIn", "1");
    const id = requestAnimationFrame(() => setBgReady(true));

    const n = findDisplayName();
    if (n) {
      setName(n);
      try {
        const existing = JSON.parse(localStorage.getItem("user") || "{}");
        const current = (existing?.username || "").trim();
        if (!current || /^(guest|gäst|vän)$/i.test(current)) {
          localStorage.setItem("user", JSON.stringify({ ...existing, username: n }));
        }
      } catch {
        
        localStorage.setItem("user", JSON.stringify({ username: n }));
      }
    }

    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (a) {
      a.volume = 0.12;
      a.play().catch(() => {});
    }
    return () => a && a.pause();
  }, []);

  const handleStartOver = () => navigate("/dashboard");
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("pref_keepLoggedIn");
    navigate("/", { replace: true });
  };

  return (
    <div className="sl-page">
      <div className={`sl-bg ${bgReady ? "is-visible" : ""}`} aria-hidden="true" />
      <div className="sl-overlay">
        <div className="sl-card">
          <h1 className="sl-title">Klart! Du förblir inloggad</h1>
          <p className="sl-subtitle">
            på den här enheten, <span className="sl-name">{name}</span>. Välkommen att fortsätta när du vill.
          </p>

          <div className="sl-actions">
            <button className="sl-btn" onClick={handleStartOver}>Börja om</button>
            <button className="sl-btn" onClick={handleLogout}>Logga ut</button>
          </div>
        </div>
      </div>

      <audio ref={audioRef} src="/sounds/forest.mp3" autoPlay loop />
    </div>
  );
}
