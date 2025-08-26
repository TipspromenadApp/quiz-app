
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "./CreateQuestion.css";

export default function CreateQuestion() {
  const [text, setText] = useState("");
  const [type, setType] = useState("mcq");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [sampleAnswer, setSampleAnswer] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);


  const [bgReady, setBgReady] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setBgReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    el.volume = 0.12;
    el.muted = true;  
    el.loop = true;

    const tryPlay = () => el.play().catch(() => {});
    tryPlay();

    const unlock = () => {
      el.muted = false;
      tryPlay();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      document.removeEventListener("visibilitychange", onVis);
    };
    const onVis = () => { if (!document.hidden) unlock(); };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      document.removeEventListener("visibilitychange", onVis);
      el.pause();
    };
  }, []);

  function saveToLocalStorage(q) {
    const key = "customQuestions";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    existing.push(q);
    localStorage.setItem(key, JSON.stringify(existing));
  }

  function handleAddOption() {
    setOptions((prev) => [...prev, ""]);
  }
  function handleRemoveOption(i) {
    setOptions((prev) => prev.filter((_, idx) => idx !== i));
    if (correctIndex >= options.length - 1) setCorrectIndex(0);
  }
  function handleOptionChange(i, value) {
    setOptions((prev) => prev.map((opt, idx) => (idx === i ? value : opt)));
  }

  function validate() {
    if (!text.trim()) return "Skriv frågetext.";
    if (type === "mcq") {
      const filled = options.map((o) => o.trim()).filter(Boolean);
      if (filled.length < 2) return "Minst två svarsalternativ behövs.";
      if (!filled[correctIndex]) return "Välj en korrekt MCQ-svarsruta.";
    }
    return "";
  }

  function clearAllCustomQuestions() {
    if (!confirm("Rensa alla egna frågor?")) return;
    localStorage.removeItem("customQuestions");
    alert("Rensat. Starta quiz igen!");
  }

  function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      setSaved(false);
      return;
    }
    setError("");

    const q = {
      id: Date.now().toString(),
      text: text.trim(),
      type,
      createdBy: "user",
      createdAt: new Date().toISOString(),
    };

    if (type === "mcq") {
      const cleaned = options.map((o) => o.trim()).filter(Boolean);
      q.options = cleaned;
      q.correctIndex = Math.min(correctIndex, cleaned.length - 1);
    } else {
      if (sampleAnswer.trim()) q.sampleAnswer = sampleAnswer.trim();
    }

    saveToLocalStorage(q);
    setSaved(true);

    setText("");
    setSampleAnswer("");
    setOptions(["", "", "", ""]);
    setCorrectIndex(0);
  }

  return (
    <div className="createq-page">
    
      <div className={`createq-bg ${bgReady ? "is-visible" : ""}`} aria-hidden="true" />

      <audio ref={audioRef} src="/sounds/forest.mp3" preload="auto" playsInline />

      <div className="content-box create-card create-question">
        <h2 className="page-title">Skapa ny fråga</h2>
        <p className="page-subtitle">
          Skapa i lugn och ro – dina frågor sparas här lokalt hos dig.
        </p>

        {error && <div className="alert error">{error}</div>}
        {saved && <div className="alert success">Frågan sparades!</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="field">
            <label className="field-label">Frågetext</label>
            <textarea
              className="quiz-text-input"
              placeholder="Skriv din fråga här…"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError("");
                if (saved) setSaved(false);
              }}
            />
          </div>

          <div className="field">
            <div className="field-label">Typ</div>
            <div className="radio-group">
              <label className="radio">
                <input
                  type="radio"
                  name="qtype"
                  value="mcq"
                  checked={type === "mcq"}
                  onChange={() => setType("mcq")}
                />{" "}
                Flervalsfråga
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="qtype"
                  value="text"
                  checked={type === "text"}
                  onChange={() => setType("text")}
                />{" "}
                Fritext
              </label>
            </div>
          </div>

          {type === "mcq" && (
            <div className="field">
              <div className="field-label">Svarsalternativ</div>

              {options.map((opt, i) => (
                <div className="option-row" key={i}>
                  <input
                    type="radio"
                    name="correct"
                    checked={correctIndex === i}
                    onChange={() => setCorrectIndex(i)}
                    title="Markera som korrekt"
                  />
                  <input
                    className="quiz-text-input option-input"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    placeholder={`Alternativ ${i + 1}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      className="quiz-button subtle remove-btn"
                      onClick={() => handleRemoveOption(i)}
                    >
                      Ta bort
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {type === "text" && (
            <div className="field">
              <div className="field-label">Fritext-inställningar</div>
              <input
                className="quiz-text-input"
                value={sampleAnswer}
                onChange={(e) => setSampleAnswer(e.target.value)}
                placeholder="Exempelsvar (valfritt)"
              />
            </div>
          )}

          <div className="form-footer">
            {type === "mcq" && (
              <button type="button" className="quiz-button" onClick={handleAddOption}>
                + Lägg till alternativ
              </button>
            )}
            <button type="submit" className="quiz-button">Spara fråga</button>
            <button type="button" className="quiz-button" onClick={clearAllCustomQuestions}>
              Rensa egna frågor
            </button>
            <Link to="/" className="quiz-button">Avbryt</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
