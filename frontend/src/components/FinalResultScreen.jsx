import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./FinalResultScreen.css";
import { Link, useLocation } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5249";

export default function FinalResultScreen() {
  const { state } = useLocation();

  const [answers, setAnswers] = useState([]);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [total, setTotal] = useState(0);

  const [gameMode, setGameMode] = useState("solo");
  const [botScore, setBotScore] = useState(null);
  const [botName, setBotName] = useState("Jonas");

  const [bgLoaded, setBgLoaded] = useState(false);
  const audioRef = useRef(null);
  const BG_URL = "/images/forest1.jpg?v=1";
  
  useEffect(() => {
    const img = new Image();
    img.src = BG_URL;
    img.onload = () => setBgLoaded(true);
  }, [BG_URL]);
 
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.12;
    a.muted = false;
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);
  useEffect(() => {
    if (state?.answers?.length) {
      setAnswers(state.answers);
      const correct = state.score ?? state.answers.filter(a => a.isCorrect).length;
      const totalQ = state.totalQuestions ?? state.answers.length;
      setTotalCorrect(correct);
      setTotal(totalQ);

      localStorage.setItem("finalAnswers", JSON.stringify(state.answers));
      localStorage.setItem("finalScore", String(correct));
      localStorage.setItem("finalTotal", String(totalQ));
    } else {
      const stored = JSON.parse(localStorage.getItem("finalAnswers") || "[]");
      setAnswers(stored);
      const storedTotal = Number(localStorage.getItem("finalTotal") || stored.length || 0);
      const storedScore = Number(localStorage.getItem("finalScore") || stored.filter(a => a.isCorrect).length || 0);
      setTotal(storedTotal);
      setTotalCorrect(storedScore);
    }

    const modeFromState = (state?.gameMode || "").toLowerCase();
    const mode = modeFromState === "bot" ? "bot" : "solo";
    setGameMode(mode);
    localStorage.setItem("gameMode", mode);

    const bn = state?.botName || localStorage.getItem("botName") || "Jonas";
    setBotName(bn);
    localStorage.setItem("botName", bn);

    if (mode === "bot") {
      const fromState = typeof state?.botScore === "number" ? state.botScore : null;
      const fromLsTotal = localStorage.getItem("botTotalScore");
      const fromLsLegacy = localStorage.getItem("botScore");
      const parsed =
        fromState ??
        (fromLsTotal != null ? Number(fromLsTotal) :
         (fromLsLegacy != null ? Number(fromLsLegacy) : null));
      const numeric = Number.isFinite(parsed) ? parsed : null;
      setBotScore(numeric);

      if (Number.isFinite(fromState)) {
        localStorage.setItem("botTotalScore", String(fromState));
        localStorage.setItem("botScore", String(fromState));
      }
    } else {
      setBotScore(null);
    }
  }, [
    state?.ts,
    state?.answers,
    state?.score,
    state?.totalQuestions,
    state?.gameMode,
    state?.botScore,
    state?.botName
  ]);

  function pickDisplayName() {
    const stateUser =
      state?.userName ||
      state?.displayName ||
      state?.user?.username ||
      state?.user?.userName ||
      state?.user?.email;

    let savedObj = null;
    try {
      const raw = localStorage.getItem("user");
      savedObj = raw ? JSON.parse(raw) : null;
    } catch {}

    const nested = savedObj?.user ?? null;

    const candidates = [
      stateUser,
      nested?.username,
      nested?.userName,
      nested?.displayName,
      nested?.name,
      nested?.email,
      savedObj?.username,
      savedObj?.userName,
      savedObj?.displayName,
      savedObj?.name,
      savedObj?.email,
      localStorage.getItem("loggedInUser"),
      localStorage.getItem("justRegisteredUser"),
      localStorage.getItem("username"),
      localStorage.getItem("userName"),
      localStorage.getItem("email"),
    ];

    const found = candidates
      .map(v => (typeof v === "string" ? v.trim() : ""))
      .find(v => v.length > 0);

    return found || "Anonym";
  }

  if (!answers.length) {
    return (
      <div className="final-page">
        <div
          className={`final-bg-layer ${bgLoaded ? "show" : ""}`}
          style={{ backgroundImage: `url("${BG_URL}")` }}
          aria-hidden="true"
        />
        <div className="final-result-screen content-box">
          <h2 className="no-results">Inga resultat hittades</h2>
          <p className="no-results-message">Vänligen slutför ett quiz först.</p>
          <Link to="/" className="back-link">← Tillbaka till startsidan</Link>
        </div>
        <audio ref={audioRef} src="/sounds/forest.mp3" loop preload="auto" />
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    try {
      const userName = pickDisplayName();

      const normalizedAnswers = answers.map(a => ({
        QuestionId: String(a.questionId ?? a.id ?? ""),
        Question: String(a.question ?? ""),
        SelectedAnswer: a.selectedAnswer != null ? String(a.selectedAnswer) : "",
        UserAnswer: a.userAnswer != null ? String(a.userAnswer) : "",
        CorrectAnswer: a.correctAnswer != null ? String(a.correctAnswer) : "",
        IsCorrect: !!a.isCorrect,
        Type: a.type ?? "mcq",
        BotAnswer: a.botAnswer != null ? String(a.botAnswer) : "",
        BotIsCorrect: a.botIsCorrect === true
      }));

      const resultData = {
        UserName: userName,
        DateTaken: new Date().toISOString(),
        Score: totalCorrect,
        TotalQuestions: total,
        Answers: normalizedAnswers,
        GameMode: gameMode,
        BotName: botName,
        BotScore: Number.isFinite(botScore) ? botScore : undefined,
      };

      const response = await axios.post(
        `${API_BASE}/api/Questions/export-pdf`,
        resultData,
        { responseType: "blob", validateStatus: () => true }
      );

      if (response.status < 200 || response.status >= 300) {
        try {
          const txt = await response.data.text();
          console.error(txt);
          alert(txt || `Fel ${response.status} vid PDF-export.`);
        } catch {
          alert(`Fel ${response.status} vid PDF-export.`);
        }
        return;
      }

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const dispo = response.headers?.["content-disposition"] || "";
      const match = /filename="?([^"]+)"?/.exec(dispo);
      a.download = match?.[1] || "QuizResultat.pdf";

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF-nedladdning misslyckades", error);
      alert("Kunde inte skapa PDF just nu.");
    }
  };

  const showVersus = gameMode === "bot" && Number.isFinite(botScore);
  const verdict = showVersus
    ? (totalCorrect > botScore
        ? "Du vinner!"
        : totalCorrect < botScore
          ? `${botName} vinner!`
          : "Oavgjort!")
    : null;

  return (
    <div className="final-page">
      <div
        className={`final-bg-layer ${bgLoaded ? "show" : ""}`}
        style={{ backgroundImage: `url("${BG_URL}")` }}
        aria-hidden="true"
      />

      <div className="final-result-screen content-box">
        <h1 className="final-title">Slutresultat</h1>

        {!showVersus && (
          <p className="score-summary">Du fick {totalCorrect} av {total} rätt.</p>
        )}

        {showVersus && (
          <div className="versus-box">
            <p className="score-summary">
              Du: <strong>{totalCorrect}</strong> &nbsp; | &nbsp; {botName}: <strong>{botScore}</strong> &nbsp; (av {total})
            </p>
            <h3 className="versus-verdict">{verdict}</h3>
          </div>
        )}

        <table className="result-table">
          <thead>
            <tr>
              <th>Fråga</th>
              <th>Ditt svar</th>
              <th>Korrekt svar</th>
              <th>Resultat</th>
            </tr>
          </thead>
          <tbody>
            {answers.map((a, i) => {
              const your = a.selectedAnswer ?? a.userAnswer ?? "";
              const correct = a.correctAnswer ?? "";
              const botAns = a?.botAnswer ?? "";
              const botOk  = a?.botIsCorrect === true;

              return (
                <tr key={`${a.questionId ?? i}-${i}`}>
                  <td>{a.question}</td>
                  <td>
                    {your}
                    {showVersus && (
                      <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
                        <em>{botName}</em>: {botAns || "—"}{" "}
                        {botAns ? (
                          <span style={{ color: botOk ? "green" : "red", fontWeight: 700 }}>
                            {botOk ? "✔" : "✖"}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </td>
                  <td>{correct}</td>
                  <td>{a.isCorrect ? "Rätt" : "Fel"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <button className="download-button" onClick={handleDownloadPdf}>Ladda ner PDF</button>
        <Link to="/results" className="quiz-button">Visa min historik</Link>
        <Link to="/" className="back-link">← Tillbaka till startsidan</Link>
      </div>

      <audio ref={audioRef} src="/sounds/forest.mp3" loop preload="auto" />
    </div>
  );
}
