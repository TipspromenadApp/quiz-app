import React, { useState, useEffect, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import "./CreateQuestion.css";
import {
  addUserQuestion,
  updateUserQuestion,
  getUserQuestionById,
  clearUserQuestions as clearAll,
} from "../lib/userQuestions";

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
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const editingId = params.get("id");
  const isEditing = Boolean(editingId);

  useEffect(() => {
    if (!isEditing) return;
    const q = getUserQuestionById(editingId);
    if (!q) return;
    setText(q.text || "");
    setType(q.type === "text" ? "text" : "mcq");
    if (q.type === "mcq") {
      setOptions(q.options?.length ? q.options : ["", "", "", ""]);
      const idx = Math.max(0, (q.options || []).indexOf(q.correctAnswer));
      setCorrectIndex(idx === -1 ? 0 : idx);
    } else {
      setSampleAnswer(q.sampleAnswer || "");
    }
  }, [isEditing, editingId]);

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

  function handleAddOption() { setOptions((p) => [...p, ""]); }
  function handleRemoveOption(i) {
    setOptions((p) => p.filter((_, idx) => idx !== i));
    setCorrectIndex((ci) => (ci >= i ? 0 : ci));
  }
  function handleOptionChange(i, value) {
    setOptions((p) => p.map((opt, idx) => (idx === i ? value : opt)));
  }

  function validate() {
    if (!text.trim()) return "Skriv frågetext.";
    if (type === "mcq") {
      const cleaned = options.map((o) => o.trim());
      const filled = cleaned.filter(Boolean);
      if (filled.length < 2) return "Minst två svarsalternativ behövs.";
      if (!cleaned[correctIndex]) return "Markera en ifylld rad som korrekt.";
    }
    return "";
  }

  function clearAllCustomQuestions() {
    if (!confirm("Rensa alla egna frågor?")) return;
    clearAll();
    alert("Rensat.");
  }

  function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); setSaved(false); return; }
    setError("");

    const base = {
      id: isEditing ? editingId : Date.now().toString(),
      text: text.trim(),
      type,
      createdBy: "user",
      createdAt: new Date().toISOString(),
    };

    let payload = base;
    if (type === "mcq") {
      const cleaned = options.map((o) => o.trim());
      const filled = cleaned.filter(Boolean);
      const hasMarked = !!cleaned[correctIndex];
      const correctAmongFilled = hasMarked
        ? cleaned.slice(0, correctIndex + 1).filter(Boolean).length - 1
        : 0;
      const correctAnswer = filled[Math.max(0, Math.min(correctAmongFilled, filled.length - 1))];
      payload = { ...base, options: filled, correctAnswer };
    } else {
      payload = { ...base, sampleAnswer: sampleAnswer.trim() };
    }

    if (isEditing) updateUserQuestion(editingId, payload);
    else addUserQuestion(payload);

    setSaved(true);

    navigate("/questions/manage");
  }

  return (
    <div className="createq-page">
      <div className={`createq-bg ${bgReady ? "is-visible" : ""}`} aria-hidden="true" />
      <audio ref={audioRef} src="/sounds/nightsky2.mp3" preload="auto" playsInline />

      <div className="content-box create-card create-question">
        <h2 className="page-title">{isEditing ? "Redigera fråga" : "Skapa ny fråga"}</h2>
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
              onChange={(e) => { setText(e.target.value); if (error) setError(""); }}
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
                /> Flervalsfråga
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="qtype"
                  value="text"
                  checked={type === "text"}
                  onChange={() => setType("text")}
                /> Fritext
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
            <button type="submit" className="quiz-button">
              {isEditing ? "Uppdatera fråga" : "Spara fråga"}
            </button>
            <button type="button" className="quiz-button" onClick={clearAllCustomQuestions}>
              Rensa egna frågor
            </button>
            <Link to="/questions/manage" className="quiz-button">Hantera frågor</Link>
            <Link to="/" className="quiz-button">Avbryt</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
