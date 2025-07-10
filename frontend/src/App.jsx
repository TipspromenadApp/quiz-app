import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Quiz from './pages/Quiz';
import About from './pages/About';
import LoginModal from './components/LoginModal';
import './styles.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSuccess = () => {
    console.log('handleLoginSuccess called, navigating to /landing');
    setIsLoggedIn(true);
    setIsModalOpen(false);
    navigate('/landing');
  };

  // Conditionally render navbar links based on route
  const renderNavbarLinks = () => {
    if (location.pathname === '/landing') {
      return (
        <div className="navbar-links">
          {/* Option 1: Skapa Quiz navigates to /quiz */}
          <button className="navbar-link" onClick={() => navigate('/landing')}>
            Skapa Quiz
          </button>
          <a href="/about">Om Oss</a>          
        </div>
      );
    }
    return (
      <div className="navbar-links">
        <button className="navbar-link" onClick={() => setIsModalOpen(true)}>
          Skapa Quiz
        </button>
        <a href="/about">Om Oss</a>
      </div>
    );
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <a href="/" className="navbar-brand">Tipsrundan</a>
        {renderNavbarLinks()}
      </nav>
      <Routes>
        <Route path="/" element={<Home setIsModalOpen={setIsModalOpen} />} />
        <Route
          path="/landing"
          element={isLoggedIn ? <Landing /> : <Navigate to="/" />}
        />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}