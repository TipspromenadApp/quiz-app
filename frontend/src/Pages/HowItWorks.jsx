import React from 'react';
import { Link } from 'react-router-dom';
import PlaceholderPage from './PlaceholderPage';


function HowItWorks({ title }) {
  return (
    <div className="hero">
      <div className="overlay">
        <div className="content">
          <h2 className="title">{title}</h2>

          <p className="tagline">Welcome, explorer! </p>
          <p>
            This app invites you to take short walks — while answering fun and thoughtful quiz questions at each stop.
          </p>

          <ol>
            <li><strong>Choose Your Path:</strong> Solo or with friends.</li>
            <li><strong>Pick Question Count:</strong> Decide how many you'd like on your journey.</li>
            <li><strong>Begin the Walk:</strong> Start moving — a new question appears at each marker.</li>
            <li><strong>Answer & Reflect:</strong> Choose your answer, see if you got it right, and feel proud!</li>
            <li><strong>Complete Rounds:</strong> Each round contains around 10 questions. At the end of each round, you’ll receive a gentle affirmation to celebrate your progress.</li>
            <li><strong>Reach the End:</strong> Once all rounds are complete, enjoy a summary of your full journey.</li>
          </ol>

          <p>
            It's not just about right answers. It’s about walking, learning, and hearing a kind word when you need it most.
          </p>

          <Link to="/" className="back-link">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default PlaceholderPage;

