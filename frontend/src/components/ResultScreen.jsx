
import React, { useEffect, useState } from 'react';
import './ResultScreen.css'; 

const ResultScreen = ({ score, total }) => {
  const [displayScore, setDisplayScore] = useState(0);

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

  return (
    <div className="result-container">
      <div className="result-box">
        <h2>Ditt resultat</h2>
        <p className="score-number">{displayScore} / {total}</p>
        <p className="result-message">Bra jobbat! 🌟</p>
      </div>
    </div>
  );
};

export default ResultScreen;
