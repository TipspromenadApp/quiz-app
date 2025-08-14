import React from 'react';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from "react";


function About() {
  
  return (
    
    <div className="hero">
      <div className="overlay">
        <div className="content">
          <h2 className="title">Så fungerar det</h2>
<audio src="/sounds/forest.mp3" autoPlay loop />

       <p className="tagline">Välkommen, utforskare!</p>
<p>
  Den här appen bjuder in dig till korta promenader – där du vid varje stopp får svara på roliga och tankeväckande quizfrågor.
</p>

<ol>
  <li>
    <strong>Välj din väg:</strong> Gå själv eller tillsammans med vänner.
  </li>
  <li>
    <strong>Välj antal rundor:</strong> Bestäm hur många rundor du vill utforska.
  </li>
  <li>
    <strong>Börja gå:</strong> Börja röra på dig – en ny fråga dyker upp vid varje markering.
  </li>
  <li>
    <strong>Svara och reflektera:</strong> Välj ditt svar, se om du hade rätt och känn dig stolt!
  </li>
  <li>
    <strong>Avsluta rundor:</strong> Varje runda innehåller ungefär 10 frågor. I slutet av varje runda får du en varm bekräftelse som firar dina framsteg.
  </li>
  <li>
    <strong>Nå målet:</strong> När alla rundor är klara får du en sammanfattning av hela din resa.
  </li>
</ol>

<p>
  Det handlar inte bara om rätt svar. Det handlar om att gå, lära sig och få höra ett vänligt ord när du behöver det som mest.
</p>


         <Link to="/" className="back-link">← Tillbaka till start</Link>

          
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

