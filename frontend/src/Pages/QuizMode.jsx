import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./quiz.css";
import "./quizMode.css";
import { loadUserQuestions } from "../lib/userQuestions";

export default function QuizMode() {
  const navigate = useNavigate();

  const [bgReady, setBgReady] = useState(false);
  const audioRef = useRef(null);
  const setupDone = useRef(false);
  const unlocked = useRef(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setBgReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (setupDone.current) return;
    setupDone.current = true;

    const el = audioRef.current;
    if (!el) return;

    const tryPlay = () => el.play().catch(() => {});
    const onCanPlay = () => tryPlay();

    el.volume = 0.16;
    el.muted = true;
    tryPlay();
    el.addEventListener("canplaythrough", onCanPlay);

    const unlock = () => {
      if (unlocked.current) return;
      unlocked.current = true;
      el.muted = false;
      el.currentTime = 0;
      tryPlay();
    };

    const onVisibility = () => {
      if (!document.hidden) unlock();
    };

    document.addEventListener("pointerdown", unlock);
    document.addEventListener("keydown", unlock);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      el.removeEventListener("canplaythrough", onCanPlay);
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const goGeneral = () => {
    localStorage.setItem("pref_quizSource", "general");
    navigate("/quiz");
  };

  const goCustom = () => {
    localStorage.setItem("pref_quizSource", "personal");
    const mine = loadUserQuestions();
    if (mine && mine.length > 0) navigate("/quiz");
    else navigate("/questions/new");
  };

  return (
    <div className="mode-page">
      <div className={`mode-bg ${bgReady ? "is-visible" : ""}`} aria-hidden="true" />
      <audio
        ref={audioRef}
        src="/sounds/nightsky2.mp3"
        autoPlay
        loop
        preload="auto"
        playsInline
      />

      <div className="frosty-container bank mode-card">
        <h1 className="title">Välj frågebank</h1>
        <p className="subtitle">
          Vill du spela med allmänna frågor eller dina egna?
        </p>

        <div className="bank-grid">
          <button className="bank-card" onClick={goGeneral}>
            <div className="bank-card__head">Allmänna frågor</div>
            <div className="bank-card__body">
              Ett tryggt val – blandade frågor för en lugn start.
            </div>
            <span className="bank-card__cta">Välj</span>
          </button>

          <button className="bank-card" onClick={goCustom}>
            <div className="bank-card__head">Egna frågor</div>
            <div className="bank-card__body">
              Gör resan personlig – spela med dina egna frågor.
            </div>
            <span className="bank-card__cta">Välj</span>
          </button>
        </div>

        <div className="link-row">
          <Link to="/questions/new" className="ghost-link">
            + Skapa / redigera egna frågor
          </Link>
          <Link to="/" className="ghost-link">← Tillbaka</Link>
        </div>
      </div>
    </div>
  );
}
