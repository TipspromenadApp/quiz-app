import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();

  const readUserName = () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return "";
      const u = JSON.parse(raw);
      const nested = u?.user ?? {};
      const candidates = [
        u?.username, u?.userName, u?.displayName, u?.name, u?.email,
        nested?.username, nested?.userName, nested?.displayName, nested?.name, nested?.email,
      ];
      return (candidates.find(v => typeof v === "string" && v.trim()) || "").trim();
    } catch { return ""; }
  };

  const [userName, setUserName] = useState(readUserName());
  const [bgReady, setBgReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setBgReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  
  useEffect(() => {
    if (readUserName()) {
      navigate("/stay-logged-in", { replace: true });
    }
  }, [navigate]);

  const goToQuizMode = () => {
    localStorage.removeItem("pref_quizSource");
    navigate("/quiz-mode");
  };
  const continueFromDashboard = () => navigate("/dashboard");
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("pref_quizSource");
    localStorage.removeItem("pref_keepLoggedIn");
    setUserName("");
    navigate("/", { replace: true });
  };

  return (
    <div className="home-page">
      <div className={`home-bg ${bgReady ? "is-visible" : ""}`} aria-hidden="true" />

      <div className="home-overlay">
        <div className="home-card">
          <h1 className="home-title">Quizutforskare</h1>
          <p className="home-subtitle">Känn dig välkommen – en lugn, varm plats att börja din resa.</p>
          <p className="home-tagline">Ta en promenad. Upptäck nya platser. Känn dig lättare för varje steg.</p>

          
          {userName ? (
            <>
              <h2 className="home-welcome">Välkommen tillbaka, {userName}!</h2>
              <div className="button-row">
                <button className="frosty-btn" onClick={goToQuizMode}>Spela igen</button>
                <button className="frosty-btn" onClick={continueFromDashboard}>Fortsätt där du slutade</button>
                <button className="frosty-btn" onClick={logout}>Logga ut</button>
              </div>
              <div className="keep-line">
                <Link to="/stay-logged-in" className="keep-link">✓ Håll mig inloggad</Link>
              </div>
            </>
          ) : (
            <div className="button-row">
              <Link to="/about"><button className="frosty-btn">Så fungerar det</button></Link>
              <Link to="/login"><button className="frosty-btn">Logga in</button></Link>
              <Link to="/register"><button className="frosty-btn">Registrera dig</button></Link>
            </div>
          )}
        </div>
      </div>

      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
          }}
        />
      ))}
    </div>
  );
}

export default Home;
