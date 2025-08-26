import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [userObj, setUserObj] = useState(null);
  const [progress, setProgress] = useState({ roundsCompleted: 0, totalRounds: 5 });
  const [bgReady, setBgReady] = useState(false);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5249";

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("user") || "null");
      if (saved) setUserObj(saved);
      else navigate("/login");
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  const displayName = useMemo(() => {
    const u = userObj || {};
    const candidates = [
      u.username, u.userName, u.UserName, u.Username,
      u.displayName, u.name, u.email,
      u?.user?.username, u?.user?.userName, u?.user?.email,
      localStorage.getItem("loggedInUser"),
      localStorage.getItem("userName"),
      localStorage.getItem("username"),
      localStorage.getItem("displayName"),
      localStorage.getItem("email"),
      localStorage.getItem("justRegisteredUser"),
    ];
    const first = candidates.find(v => typeof v === "string" && v.trim());
    return first ? first.trim() : null;
  }, [userObj]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setBgReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!displayName) return;

    const controller = new AbortController();
    (async () => {
      try {
        const r = await fetch(
          `${API_BASE}/api/QuizResult/progress/${encodeURIComponent(displayName)}`,
          { signal: controller.signal }
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();

        const roundsCompleted = data.roundsCompleted ?? data.completedRounds ?? 0;
        const totalRounds = data.totalRounds ?? 5;
        const capped = Math.min(
          typeof roundsCompleted === "number" ? roundsCompleted : 0,
          typeof totalRounds === "number" ? totalRounds : 5
        );
        setProgress({ roundsCompleted: capped, totalRounds });
      } catch (err) {
        if (err?.name !== "AbortError") {
          setProgress({ roundsCompleted: 0, totalRounds: 5 });
        }
      }
    })();

    return () => controller.abort();
  }, [displayName, API_BASE]);

  
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = 0.12;
    el.loop = true;
    el.play().catch(() => {});
    const onInteract = () => el.play().catch(() => {});
    window.addEventListener("click", onInteract, { once: true });
    window.addEventListener("keydown", onInteract, { once: true });
    window.addEventListener("touchstart", onInteract, { once: true });
    return () => {
      window.removeEventListener("click", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("touchstart", onInteract);
      el.pause();
    };
  }, []);

 
  const handleStart = () => navigate("/quiz-mode");
  const handleMultiplayer = () => navigate("/multiplayer");
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dash-page">
      
      <div className={`dash-bg ${bgReady ? "is-visible" : ""}`} aria-hidden="true" />

   
      <audio
        ref={audioRef}
        src="/sounds/forest.mp3"
        preload="auto"
        playsInline
        aria-hidden="true"
      />

      <div className="dashboard">
        <div className="dashboard-box">
          <h2>Välkommen tillbaka, {displayName || "Gäst"}</h2>
          <p className="affirmation">”Varje stig genom skogen leder till växande.”</p>

          <div className="progress">
            Du har slutfört {progress.roundsCompleted} av {progress.totalRounds} quizrundor.
          </div>

          <button className="dashboard-btn" onClick={handleStart}>Spela solo</button>
          <button className="dashboard-btn" onClick={handleMultiplayer}>Spela mot Bot Jonas</button>
          <button className="dashboard-btn" onClick={handleLogout}>Logga ut</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
