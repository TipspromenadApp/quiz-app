import React, { useEffect, useState } from "react";
import axios from "axios";
import "./FinalResultScreen.css";
import { Link, useLocation } from "react-router-dom";

const FinalResultScreen = () => {
  const location = useLocation();
  const { state } = location;

  const [answers, setAnswers] = useState([]);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (state?.answers?.length) {
      setAnswers(state.answers);
      const correct = state.score ?? state.answers.filter(a => a.isCorrect).length;
      const totalQ = state.totalQuestions ?? state.answers.length;
      setTotalCorrect(correct);
      setTotal(totalQ);

      localStorage.setItem("finalAnswers", JSON.stringify(state.answers));
      localStorage.setItem("finalScore", String(correct));
      return;
    }

    const stored = JSON.parse(localStorage.getItem("finalAnswers") || "[]");
    setAnswers(stored);
    setTotal(stored.length);
    setTotalCorrect(stored.filter(a => a.isCorrect).length);
  }, [
    state?.ts,
    location.key
  ]);

  if (!answers.length) {
    return (
      <div className="final-result-screen content-box">
        <h2 className="no-results">Inga resultat hittades</h2>
        <p className="no-results-message">Vänligen slutför ett quiz först.</p>
        <Link to="/" className="back-link">← Tillbaka till startsidan</Link>
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    try {
      const resultData = {
        userName: "Anonym",
        dateTaken: new Date().toISOString(),
        score: totalCorrect,
        answers: answers.map(a => ({
          question: a.question,
          selectedAnswer: a.selectedAnswer,
          correctAnswer: a.correctAnswer,
          isCorrect: a.isCorrect,
        })),
      };

      const response = await axios.post(
        "http://localhost:5249/api/Questions/export-pdf",
        resultData,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "QuizResultat.pdf";
      link.click();
    } catch (error) {
      console.error("PDF-nedladdning misslyckades", error);
    }
  };

  return (
    <div className="final-result-screen content-box">
      <h1 className="final-title">Slutresultat</h1>
      <p className="score-summary">
        Du fick {totalCorrect} av {total} rätt.
      </p>

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
          {answers.map((a, i) => (
            <tr key={`${a.questionId ?? i}-${i}`}>
              <td>{a.question}</td>
              <td>{a.selectedAnswer}</td>
              <td>{a.correctAnswer}</td>
              <td>{a.isCorrect ? "Rätt" : "Fel"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="download-button" onClick={handleDownloadPdf}>
        Ladda ner PDF
      </button>

      <Link to="/" className="back-link">← Tillbaka till startsidan</Link>
    </div>
  );
};

export default FinalResultScreen;

