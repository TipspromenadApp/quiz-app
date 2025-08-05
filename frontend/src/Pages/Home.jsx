import React from 'react';
import { Link } from 'react-router-dom';

function Home({ setIsModalOpen }) {
  return (
    <div className="hero">
      <div className="overlay">
        <div className="content">
          <h1 className="title">Quiz Explorers</h1>
          <p className="subtitle">A gentle adventure for your mind and soul.</p>
          <p className="tagline">
            Take a walk. Discover new places. Feel brighter each step of the way.
          </p>

          {/* Main call-to-action */}
          <div className="primary-button">
            <Link to="/quiz">
              <button>Try a Solo Stroll</button>
            </Link>
          </div>

          {/* Supporting links */}
          <div className="secondary-buttons">
            <Link to="/about"><button>How It Works</button></Link>
            <Link to="/login"><button>Login</button></Link>
            <Link to="/register"><button>Register</button></Link>
          </div>
        </div>
      </div>

      {/* Magical particle effect */}
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





