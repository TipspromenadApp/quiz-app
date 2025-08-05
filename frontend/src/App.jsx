import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import './Styles.css';
import Quiz from './Pages/Quiz';
import About from './Pages/About';
import LoginModal from './components/LoginModal';
import PlaceholderPage from './Pages/PlaceholderPage';
import Register from './Pages/Register';
import Home from './Pages/Home'; 
import Login from './Pages/Login';
import HowItWorks from './Pages/HowItWorks';
import Dashboard from "./Pages/Dashboard";




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
         <Route path="/dashboard" element={<Dashboard />} />



      </Routes>

      
      
    </Router>
  );
}

export default App;









