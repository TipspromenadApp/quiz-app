import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from "react";


function About() {
  
  return (
    
    <div className="hero">
      <div className="overlay">
        <div className="content">
          <h2 className="title">How It Works</h2>
<audio src="/sounds/forest.mp3" autoPlay loop />

          <p className="tagline">Welcome, explorer! </p>
          <p>
            This app invites you to take short walks — while answering fun and thoughtful quiz questions at each stop.
          </p>

          <ol>
            <li><strong>Choose Your Path:</strong> Solo or with friends.</li>
            <li>
            <strong>Choose Your Rounds:</strong> Decide how many rounds you’d like to explore.
          </li>
            <strong>Begin the Walk:</strong> Step into the journey — a new question appears as you move forward.

            <li><strong>Answer & Reflect:</strong> Choose your answer, see if you got it right, and feel proud!</li>
            <li><strong>Complete Rounds:</strong> Each round contains around 10 questions. At the end of each round, you’ll receive a gentle affirmation to celebrate your progress.</li>
            <li><strong>Reach the End:</strong> Once all rounds are complete, enjoy a summary of your full journey.</li>
          </ol>

          <p>
            It’s not just about right answers. It’s about walking, learning, and hearing a kind word when you need it most.
          </p>

          <Link to="/" className="back-link">← Back to Home</Link>

          
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

export default About;

