import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './styles.css';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import About from './pages/About';
import LoginModal from './components/LoginModal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="navbar">
          <Link to="/" className="navbar-brand">Tipsrundan</Link>
          <div className="navbar-links">
            <Link to="/">Home</Link>
            <Link to="/quiz">Quiz</Link>
            <Link to="/about">About</Link>
            <button
              onClick={() => setIsModalOpen(true)}
              className="navbar-link"
            >
              Skapa Quiz
            </button>
          </div>
        </nav>
        <LoginModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        <Routes>
          <Route path="/" element={<Home setIsModalOpen={setIsModalOpen} />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;