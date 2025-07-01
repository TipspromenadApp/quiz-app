import React from 'react';

function Home({ setIsModalOpen }) {
  return (
    <div className="home-container">
      <h1 className="welcome-text">Välkommen till Tipsrundan quiz</h1>
      <button
        className="play-button"
        onClick={() => setIsModalOpen(true)}
      >
        <span className="play-icon"></span> Spela Nu
      </button>
    </div>
  );
}

export default Home;