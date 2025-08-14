import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Home({ setIsModalOpen }) {
  
  const [user, setUser] = useState(null);

  useEffect(() => {

    const raw = localStorage.getItem("user");
    if (!raw) return;
    try {
      const u = JSON.parse(raw);
      const name = (u?.username || u?.email || "").trim();
      if (name) setUser(name);
    } catch {
      
    }
  }, []);

  return (
    <div className="hero">
      <div className="overlay">
        <div className="content">
          <h1 className="title">Quizutforskare</h1>
          <p className="subtitle">En stillsam resa för ditt sinne och din själ.</p>
          <p className="tagline">
            Ta en promenad. Upptäck nya platser. Känn dig lättare för varje steg.
          </p>

          {user ? (
            <>
              <h2>Välkommen tillbaka, {user}!</h2>
              <div className="primary-button">
                <Link to="/quiz">
                  <button>Spela igen</button>
                </Link>
              </div>
              <div className="secondary-buttons">
               <Link to="/dashboard">
  <button>Fortsätt där du slutade</button>
</Link>

                <button
                  onClick={() => {
                   
                    localStorage.removeItem("user");
                    setUser(null);
                  }}
                >
                  Logga ut
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="primary-button">
                <Link to="/quiz">
                  <button>Ge dig ut på en solopromenad</button>
                </Link>
              </div>
              <div className="secondary-buttons">
                <Link to="/about"><button>Så fungerar det</button></Link>
                <Link to="/login"><button>Logga in</button></Link>
                <Link to="/register"><button>Registrera dig</button></Link>
              </div>
            </>
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

