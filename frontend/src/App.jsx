import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./Styles.css";
import StayLoggedIn from "./Pages/StayLoggedIn";
import Home from "./Pages/Home";
import Quiz from "./Pages/Quiz";               
import QuizMode from "./Pages/QuizMode";
import About from "./Pages/About";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import HowItWorks from "./Pages/HowItWorks";
import Dashboard from "./Pages/Dashboard";
import FinalResultScreen from "./components/FinalResultScreen";
import RegisterWelcome from "./Pages/RegisterWelcome";
import CreateQuestion from "./Pages/CreateQuestion.jsx";
import Results from "./Pages/Results.jsx";
import PlaceholderPage from "./Pages/PlaceholderPage";
import MultiplayerPage from "./Pages/MultiplayerPage";
import BotQuiz from "./Pages/BotQuiz";         

import { loadUserQuestions } from "./lib/userQuestions";

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadUserQuestions();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home setIsModalOpen={setIsModalOpen} />} />

        <Route path="/quiz-mode" element={<QuizMode />} />
        <Route path="/quiz" element={<Quiz />} />              
        <Route path="/solo-quiz" element={<Quiz />} />        

        <Route
          path="/solo"
          element={
            <PlaceholderPage
              title="Solo Journey Page"
              message="This page is under construction."
            />
          }
        />

        <Route path="/multiplayer" element={<MultiplayerPage />} />
        <Route path="/bot-quiz" element={<BotQuiz />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/final-result" element={<FinalResultScreen />} />
        <Route path="/welcome-new" element={<RegisterWelcome />} />
        <Route path="/questions/new" element={<CreateQuestion />} />
        <Route path="/results" element={<Results />} />
        <Route path="/stay-logged-in" element={<StayLoggedIn />} />
      </Routes>
    </Router>
  );
}

export default App;











