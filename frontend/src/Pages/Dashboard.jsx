import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5249";

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (savedUser) {
      setUser(savedUser);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleStart = () => {
    navigate("/quiz");
  };

  const handleMultiplayer = () => {
    navigate("/multiplayer");
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const [progress, setProgress] = useState({ roundsCompleted: 0, totalRounds: 5 });

  useEffect(() => {
    if (!user) return;

    const name = (user?.username || user?.email || "").trim();
    console.log("Dashboard requesting progress for:", name);

    fetch(`${API_BASE}/api/QuizResult/progress/${encodeURIComponent(name)}`)
      .then(res => res.json())
      .then(data => {
        console.log("Progress response:", data);
        const capped = Math.min(data.roundsCompleted ?? 0, data.totalRounds ?? 5);
        setProgress({ roundsCompleted: capped, totalRounds: data.totalRounds ?? 5 });
      })
      .catch(err => console.error("Progress fetch failed:", err));
  }, [user]);

  return (
    <div className="dashboard">
      <div className="dashboard-box">
        <h2>Välkommen tillbaka, {user?.username || user?.email}</h2>

        <p className="affirmation">”Varje stig genom skogen leder till växande.”</p>

        <div className="progress">
          Du har slutfört {progress.roundsCompleted} av {progress.totalRounds} quizrundor.
        </div>

        <button className="dashboard-btn" onClick={handleStart}>
          Känn den första brisen
        </button>
        <button className="dashboard-btn" onClick={handleMultiplayer}>
          Spela med vänner
        </button>
        <button className="dashboard-btn" onClick={handleLogout}>
          Logga ut
        </button>
      </div>
    </div>
  );
}

export default Dashboard;



