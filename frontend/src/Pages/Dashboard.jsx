

import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import React, { useEffect, useState } from "react";


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
  }, []);
console.log("Saved user:", user);


  const handleStart = () => {
    navigate("/quiz");
  };

  return (
    <div className="dashboard">
      <div className="dashboard-box">
        <h2>Welcome back, {user?.username || user?.email}</h2>


        <p className="affirmation">“Every path through the forest leads to growth.”</p>

        <div className="progress">You've completed 0 of 5 quiz rounds.</div>

        <button className="start-btn" onClick={handleStart}>
          Start My Journey
        </button>
        <button onClick={() => {
  localStorage.removeItem("user");
  navigate("/login");
}} className="logout-btn">
  Logga ut
</button>

      </div>
    </div>
  );
}

export default Dashboard;

