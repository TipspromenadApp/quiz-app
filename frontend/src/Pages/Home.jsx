import React from 'react';
import { Link } from 'react-router-dom';


function Home({ setIsModalOpen }) {
  return (
    <div className="hero">
      <div className="overlay">
        <div className="content">
          <h1 className="title">Quiz Explorers</h1>
          <p className="subtitle">A gentle adventure for your mind and soul.</p>
          <p className="tagline">Take a walk. Discover new places. Feel brighter each step of the way.</p>

          <div className="action-buttons">
            <Link to="/quiz"><button>Start Solo Journey</button></Link>
            <Link to="/multiplayer"><button>Play with Friends</button></Link>
           <Link to="/about"><button>How It Works</button></Link>
          </div>

          <div className="auth-buttons">
            <Link to="/login"><button>Login</button></Link>
            <Link to="/register"><button>Register</button></Link>
            


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
        </div>
      </div>
    </div>
  );
}

export default Home;




