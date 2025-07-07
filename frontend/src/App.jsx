import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import './Styles.css';
import Quiz from './pages/Quiz';
import About from './pages/About';
import LoginModal from './components/LoginModal';
import PlaceholderPage from './pages/PlaceholderPage';
import Register from './pages/Register';
import Home from './pages/Home'; 
import Login from './pages/Login';
import HowItWorks from './pages/HowItWorks';



function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home setIsModalOpen={setIsModalOpen} />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/about" element={<About />} />
        <Route path="/solo" element={<PlaceholderPage title="Solo Journey Page " message="This page is under construction." />} />
        <Route path="/multiplayer" element={<PlaceholderPage title="Multiplayer Page " message="Multiplayer coming soon." />} />
        <Route path="/how-it-works" element={<PlaceholderPage title="What to Expect on the Trail" message="An explanation page will go here." />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/quiz" element={<Quiz />} />



      </Routes>

      
      
    </Router>
  );
}

export default App;









