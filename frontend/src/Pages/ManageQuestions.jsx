import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadUserQuestions, deleteUserQuestion } from "../lib/userQuestions";
import "./ManageQuestions.css";

export default function ManageQuestions() {
  const navigate = useNavigate();
  const [list, setList] = React.useState(() => loadUserQuestions());
  const [bgOn, setBgOn] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setBgOn(true), 50);
    return () => clearTimeout(t);
  }, []);
  const audioRef = React.useRef(null);
  React.useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = 0.99;
    el.play().catch(() => {});
  }, []);

  function handleDelete(id) {
    if (!confirm("Ta bort denna fråga?")) return;
    const next = deleteUserQuestion(id);
    setList(next);
  }

  function goEdit(id) {
    navigate(`/questions/new?id=${encodeURIComponent(id)}`);
  }
  return (
    <div className="manage-page">    
      <div className={`manage-bg ${bgOn ? "is-visible" : ""}`} aria-hidden="true" />
      <div className="manage-vignette" aria-hidden="true" />

      <audio ref={audioRef} src="/sounds/nightsky1.mp3" loop preload="auto" />

      <div className="manage-container">
        <h1>Hantera frågor</h1>
        <p className="subtitle">Redigera eller ta bort dina sparade frågor.</p>

        {list.length === 0 && (
          <p className="empty">
            Inga frågor ännu. <Link to="/questions/new">Lägg till en ny fråga</Link>.
          </p>
        )}
        {list.length > 0 && (
          <table className="question-table">
            <thead>
              <tr>
                <th>Fråga</th>
                <th>Info</th>
                <th>Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {list.map((q) => (
                <tr key={q.id}>
                  <td className="q-text">{q.text}</td>
                  <td className="q-meta">
                    {q.type === "text" ? "Fritext" : "Flervalsfråga"}
                    {q.type === "mcq" && q.options?.length ? (
                      <> • Alternativ: {q.options.join(" · ")} • Rätt: <strong>{q.correctAnswer}</strong></>
                    ) : null}
                    {q.type === "text" && q.sampleAnswer ? (
                      <> • Exempelsvar: <em>{q.sampleAnswer}</em></>
                    ) : null}
                  </td>
                  <td className="q-actions">
                    <button className="btn" onClick={() => goEdit(q.id)}>Redigera</button>
                    <button className="btn danger" onClick={() => handleDelete(q.id)}>Ta bort</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="footer-actions">
          <Link to="/questions/new" className="btn primary">+ Ny fråga</Link>
          <Link to="/" className="btn">Tillbaka</Link>
        </div>
      </div>
    </div>
  );
}
