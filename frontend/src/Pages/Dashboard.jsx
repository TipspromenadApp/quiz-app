import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  return (
    <div className="dashboard">
      <div className="dashboard-box">
        <h2>Welcome back, {user?.username || user?.email}</h2>

        <p className="affirmation">“Every path through the forest leads to growth.”</p>

        <div className="progress">You've completed 0 of 5 quiz rounds.</div>

      <button className="dashboard-btn" onClick={handleStart}>
  Feel the First Breeze
</button>
<button className="dashboard-btn" onClick={handleMultiplayer}>
  Play with Friends
</button>
<button className="dashboard-btn" onClick={handleLogout}>
  Logout
</button>

      </div>
    </div>
  );
}

export default Dashboard;


