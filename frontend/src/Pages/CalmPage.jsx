import React from "react";
import "./CalmPage.css";

export default function CalmPage() {
  return (
    <div className="page page--calm">
      <div className="calm-wrapper">
        <div className="calm-overlay">
         
          <nav className="navbar">
            <a className="navbar-brand" href="/">QuizApp</a>
            <div className="navbar-links">
              <a className="navbar-link" href="/quiz">Quiz</a>
              <a className="navbar-link" href="/about">About</a>
            </div>
          </nav>

         
          <h1>Welcome to CalmPage</h1>
          <p>This page now has its own scoped styling.</p>
        </div>
      </div>
    </div>
  );
}
