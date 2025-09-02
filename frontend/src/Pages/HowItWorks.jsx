import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function HowItWorks({ title }) {
  const audioRef = useRef(null);

  useEffect(() => {
 
    if (audioRef.current) {
      audioRef.current.volume = 0.15; 
    }
  }, []);

  return (
    <>     
      <style>{`
        .bg-fade {
          opacity: 0;
          animation: fadeInBg 1200ms ease-out forwards;
        }
        @keyframes fadeInBg {
          to { opacity: 1; }
        }
        /* Ensure the hero can show the image nicely even if no global CSS */
        .hero {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center;
        }
        .overlay {
          width: 100%;
          height: 100%;
          backdrop-filter: brightness(0.95) blur(0px);
          background: rgba(0,0,0,0.25);
        }
        .content {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
          color: #fff;
        }
        .title {
          margin: 0 0 0.75rem 0;
        }
        .tagline {
          margin: 0 0 0.75rem 0;
          opacity: 0.95;
        }
        .back-link {
          display: inline-block;
          margin-top: 1.25rem;
          text-decoration: none;
          color: #e6e6e6;
          border-bottom: 1px solid rgba(230,230,230,0.4);
        }
        ol {
          margin-left: 1.25rem;
          line-height: 1.6;
        }
      `}</style>      
      <div
        className="hero bg-fade"
        style={{
          backgroundImage: 'url(/images/forest1.jpg)',
        }}
      >
        <div className="overlay">
          <div className="content">
            <h2 className="title">{title}</h2>

            <p className="tagline">Välkommen, utforskare!</p>
            <p>
              Den här appen bjuder in dig till korta promenader – där du vid varje stopp
              får svara på roliga och tankeväckande quizfrågor.
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
                <strong>Avsluta rundor:</strong> Varje runda innehåller ungefär 10 frågor. I slutet av varje runda får du en mjuk bekräftelse som firar dina framsteg.
              </li>
              <li>
                <strong>Nå målet:</strong> När alla rundor är klara får du en sammanfattning av hela din resa.
              </li>
            </ol>

            <p>
              Det handlar inte bara om rätt svar. Det handlar om att gå, lära sig och få höra ett vänligt ord när du behöver det som mest.
            </p>

            <Link to="/" className="back-link">← Back to Home</Link>
          </div>
        </div>    
        <audio ref={audioRef} src="/sounds/forest.mp3" autoPlay loop />
      </div>
    </>
  );
}

export default HowItWorks;
