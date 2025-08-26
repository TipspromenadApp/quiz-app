import React, { useEffect, useState } from 'react';
import './ResultScreen.css'; 
import { useNavigate } from "react-router-dom";

const ResultScreen = ({ score, total = 10 }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const navigate = useNavigate();


  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayScore(prev => {
        if (prev < score) return prev + 1;
        clearInterval(interval);
        return score;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [score]);


  useEffect(() => {
    const timeout = setTimeout(() => {
      navigate("/final-result");
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="result-container">
      <div className="result-box">
        <h2>Ditt resultat</h2>
        <p className="score-number">{displayScore} / {total}</p>
        <p className="result-message">Bra jobbat! </p>
        <p className="affirmation">There is quiet strength in simply choosing to begin again. Today holds gentle new beginnings.</p>
        <p className="thankyou">All rounds complete. You made it. Thank you for being here.</p>
        <p className="back-home">← Back to Home</p>
      </div>
    </div>
  );
};

export default ResultScreen;

