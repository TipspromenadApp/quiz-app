import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./About.css";

function About() {
  const [bgReady, setBgReady] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = "/images/forest9.jpg";
    img.onload = () => setBgReady(true);
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const p = el.play?.();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);

  return (
    <div className={`hero ${bgReady ? "bg-ready" : ""}`}>
      <audio ref={audioRef} src="/sounds/nightsky2.mp3" autoPlay loop />

      <div className="content">
        <h2 className="title">Så fungerar det</h2>

        <p className="tagline">Välkommen, utforskare!</p>
        <p>
          Den här appen bjuder in dig till korta promenader – där du vid varje
          stopp får svara på roliga och tankeväckande quizfrågor.
        </p>

        <ol>
          <li><strong>Välj din väg:</strong> Gå själv eller tillsammans med vänner.</li>
          <li><strong>Välj antal rundor:</strong> Bestäm hur många rundor du vill utforska.</li>
          <li><strong>Börja gå:</strong> Börja röra på dig – en ny fråga dyker upp vid varje markering.</li>
          <li><strong>Svara och reflektera:</strong> Välj ditt svar, se om du hade rätt och känn dig stolt!</li>
          <li><strong>Avsluta rundor:</strong> I slutet av varje runda får du en varm bekräftelse.</li>
          <li><strong>Nå målet:</strong> När alla rundor är klara får du en sammanfattning av hela resan.</li>
        </ol>

        <p>
          Det handlar inte bara om rätt svar. Det handlar om att gå, lära sig och få höra ett vänligt ord när du behöver det som mest.
        </p>

        <Link to="/" className="back-link">← Tillbaka till start</Link>
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
