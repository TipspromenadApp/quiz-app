import React from 'react';
import { Link } from 'react-router-dom';

function PlaceholderPage({ title, message }) {
  return (
    <div className="hero">
      <div className="overlay">
        <div className="content">
          <h2 className="title">{title}</h2>
          <p className="tagline">{message}</p>
          <Link to="/" className="back-link">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default PlaceholderPage;




