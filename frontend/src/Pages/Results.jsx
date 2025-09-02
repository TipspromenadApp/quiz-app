import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5249";

function formatDate(dt) {
  try {
    if (!dt) return "";
    let d;
    if (typeof dt === "number") {
      d = new Date(dt);
    } else if (typeof dt === "string") {
      const hasTZ = /(Z|[+-]\d{2}:?\d{2})$/.test(dt);
      const isoNoTZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?$/.test(dt);
      d = hasTZ ? new Date(dt) : isoNoTZ ? new Date(dt + "Z") : new Date(dt);
    } else {
      d = new Date(dt);
    }
    if (isNaN(d)) return String(dt);
    return d.toLocaleString("sv-SE", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dt ?? "";
  }
}

function pickArray(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (Array.isArray(v)) return v;
  }
  return [];
}
function pickFirst(obj, keys, fallback = undefined) {
  for (const k of keys) {
    if (obj?.[k] !== undefined && obj?.[k] !== null) return obj[k];
  }
  return fallback;
}
function toNumber(x, d = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : d;
}

function detectGameMode(raw) {
  const explicit = (pickFirst(raw, ["gameMode", "mode", "playMode", "category"], "") || "")
    .toString()
    .toLowerCase();
  if (explicit === "bot") return "bot";
  if (explicit === "solo") return "solo";

  const botHints = ["botScore", "botTotalScore", "opponent", "opponentScore", "botName", "versus", "vsScore", "enemy", "rival"];
  const hasBot = botHints.some((k) => raw?.[k] !== undefined && raw?.[k] !== null);
  return hasBot ? "bot" : "solo";
}

function normalizeResult(r) {
  const answers = pickArray(r, ["answers", "answerEntries", "fullAnswers", "entries"]);
  const dateTaken = pickFirst(
    r,
    ["dateTaken", "finishedAt", "playedAtUtc", "createdAt", "savedAt", "timestamp", "date"],
  );
  const id =
    pickFirst(r, ["id", "resultId", "quizResultId"]) ??
    `${dateTaken ?? ""}-${Math.random()}`;

  const userName = pickFirst(r, ["userName", "username", "user", "owner"]);
  const roundNumber = toNumber(pickFirst(r, ["roundNumber", "round"]), 1);
  const score = toNumber(pickFirst(r, ["score", "points", "correctCount"]), 0);
  const totalQuestions = toNumber(
    pickFirst(r, ["totalQuestions", "questions", "questionCount", "total"], answers.length),
    answers.length
  );

  const gameMode = detectGameMode(r);
  const botScore = toNumber(pickFirst(r, ["botScore", "botTotalScore", "opponentScore", "vsScore"]), NaN);
  const botName = pickFirst(r, ["botName", "opponent", "rivalName"]);

  return { id, userName, roundNumber, score, totalQuestions, dateTaken, answers, gameMode, botScore, botName };
}

async function fetchUserResults(userName) {
  const urls = [
    `${API_BASE}/api/QuizResult/${encodeURIComponent(userName)}`,
    `${API_BASE}/api/QuizResult?userName=${encodeURIComponent(userName)}`,
    `${API_BASE}/api/QuizResult`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const raw = await res.json();
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.items)
        ? raw.items
        : Array.isArray(raw.results)
        ? raw.results
        : Array.isArray(raw.data)
        ? raw.data
        : [];
      const normalized = list.map(normalizeResult);
      if (url.endsWith("/api/QuizResult")) {
        return normalized.filter(
          (r) => (r.userName || "").trim().toLowerCase() === userName.trim().toLowerCase()
        );
      }
      return normalized;
    } catch {
      continue;
    }
  }
  return [];
}

function loadLocalHistory() {
  try {
    const local = JSON.parse(localStorage.getItem("quizHistory") || "[]");
    return local
      .map(normalizeResult)
      .sort((a, b) => new Date(b.dateTaken || 0) - new Date(a.dateTaken || 0));
  } catch {
    return [];
  }
}

// Convert the BotQuiz final payload (if present) into a normalized result
function loadLastFinalPayload() {
  try {
    const fp = JSON.parse(localStorage.getItem("finalPayload") || "null");
    if (!fp || !Array.isArray(fp.answers) || !fp.answers.length) return null;

    return normalizeResult({
      id: `final:${fp.ts ?? Date.now()}`,
      userName:
        (JSON.parse(localStorage.getItem("user") || "null") || {}).username ||
        localStorage.getItem("username") ||
        "Anonym",
      roundNumber: 1,
      score: fp.score,
      totalQuestions: fp.totalQuestions,
      dateTaken: fp.ts ? new Date(fp.ts).toISOString() : new Date().toISOString(),
      answers: fp.answers,
      gameMode: fp.gameMode || "solo",
      botScore: fp.botScore,
      botName: fp.botName,
    });
  } catch {
    return null;
  }
}

export default function Results() {
  const savedUser = JSON.parse(localStorage.getItem("user") || "null") || {};
  const candidates = [
    savedUser.username,
    savedUser.userName,
    savedUser.displayName,
    savedUser.name,
    savedUser.email,
    localStorage.getItem("username"),
    localStorage.getItem("userName"),
    localStorage.getItem("email"),
  ];
  const userName = (candidates.find((v) => typeof v === "string" && v.trim()) || "").trim();

  const [loading, setLoading] = useState(true);
  const [allResults, setAllResults] = useState([]);
  const [source, setSource] = useState("server");

  const [filterMode, setFilterMode] = useState("all");

  const [bgVisible, setBgVisible] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setBgVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const audioRef = useRef(null);
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.03;
    a.muted = false;
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);

      // 1) server results if available
      let serverResults = [];
      if (userName) {
        try {
          serverResults = await fetchUserResults(userName);
        } catch {
          serverResults = [];
        }
      }

      // 2) local history (solo sessions are stored here)
      const localHistory = loadLocalHistory();

      // 3) last final payload (esp. bot sessions) – guarantees the latest match shows up
      const finalPayloadAsResult = loadLastFinalPayload();

      // merge & dedupe
      const merged = [...serverResults, ...localHistory];
      if (finalPayloadAsResult) merged.unshift(finalPayloadAsResult);

      const seen = new Set();
      const dedup = merged.filter((r) => {
        const key = `${r.dateTaken ?? ""}|${r.score}|${r.totalQuestions}|${r.gameMode ?? "solo"}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      dedup.sort((a, b) => new Date(b.dateTaken || 0) - new Date(a.dateTaken || 0));

      if (!ignore) {
        setAllResults(dedup);
        setSource(serverResults.length ? "server+local" : "local");
        setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [userName]);

  const filteredResults = useMemo(() => {
    if (filterMode === "solo") return allResults.filter((r) => (r.gameMode || "solo") === "solo");
    if (filterMode === "bot") return allResults.filter((r) => r.gameMode === "bot");
    return allResults;
  }, [allResults, filterMode]);

  const stats = useMemo(() => {
    if (!filteredResults.length) {
      return {
        rounds: 0,
        bestScore: 0,
        avgScore: 0,
        accuracyPct: 0,
        lastPlayed: null,
        totalCorrect: 0,
        totalQuestions: 0,
      };
    }
    const rounds = filteredResults.length;
    const sumScore = filteredResults.reduce((s, r) => s + (r.score ?? 0), 0);
    const totalQuestions = filteredResults.reduce(
      (s, r) => s + (r.totalQuestions ?? (Array.isArray(r.answers) ? r.answers.length : 0)),
      0
    );
    const totalCorrect = filteredResults.reduce((s, r) => {
      if (!Array.isArray(r.answers)) return s + (r.score ?? 0);
      return s + r.answers.filter((a) => a?.isCorrect === true).length;
    }, 0);
    const bestScore = Math.max(...filteredResults.map((r) => r.score ?? 0));
    const avgScore = rounds ? sumScore / rounds : 0;
    const accuracyPct = totalQuestions ? Math.round((100 * totalCorrect) / totalQuestions) : 0;

    return {
      rounds,
      bestScore,
      avgScore,
      accuracyPct,
      lastPlayed: filteredResults[0]?.dateTaken ?? null,
      totalCorrect,
      totalQuestions,
    };
  }, [filteredResults]);

  async function handleClearHistory() {
    const ok = window.confirm("Är du säker på att du vill rensa historiken?");
    if (!ok) return;

    if (userName && (source === "server" || source === "server+local")) {
      try {
        const res = await fetch(`${API_BASE}/api/QuizResult/user/${encodeURIComponent(userName)}`, {
          method: "DELETE",
        });
        if (!res.ok && res.status !== 204) throw new Error(`HTTP ${res.status}`);
      } catch {
        // ignore
      }
    }
    localStorage.removeItem("quizHistory");
    setAllResults([]);
  }

  const outerCardStyle = {
    maxWidth: 900,
    margin: "40px auto",
    color: "#fff",
    background: "rgba(0,0,0,0.40)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 20,
    boxShadow: "0 8px 30px rgba(0,0,0,0.30)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    padding: 24,
  };
  const scoreCardStyle = {
    background: "rgba(255,255,255,.08)",
    border: "1px solid rgba(255,255,255,.18)",
    borderRadius: 12,
    padding: "10px 12px",
    lineHeight: 1.15,
    fontSize: "clamp(14px, 2vw, 18px)",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    color: "#fff",
  };
  const frostyBtnStyle = {
    appearance: "none",
    border: "1px solid rgba(255,255,255,.55)",
    background: "rgba(255,255,255,.14)",
    color: "#fff",
    fontWeight: 700,
    padding: "10px 18px",
    borderRadius: 999,
    cursor: "pointer",
    backdropFilter: "blur(6px)",
    WebkitBackdropFilter: "blur(6px)",
    transition: "background .2s ease, filter .15s ease, transform .06s ease",
  };
  const subtleBackStyle = {
    display: "inline-block",
    padding: 0,
    border: "none",
    background: "none",
    fontSize: "clamp(13px, 2vw, 14px)",
    fontStyle: "italic",
    color: "#fff",
    opacity: 0.9,
    textDecoration: "none",
  };
  const filterBtn = (active) => ({
    ...frostyBtnStyle,
    padding: "8px 14px",
    fontSize: 14,
    borderRadius: 999,
    background: active ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.14)",
  });

  const bgStyle = {
    position: "fixed",
    inset: 0,
    zIndex: -1,
    opacity: bgVisible ? 1 : 0,
    transition: "opacity 3600ms ease-in",
    backgroundImage:
      "linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('/images/forest3.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  return (
    <div className="results-page" style={{ minHeight: "100vh", position: "relative" }}>
      <div aria-hidden="true" style={bgStyle} />
      <audio ref={audioRef} src="/sounds/forest.mp3" loop preload="auto" />

      <div className="content-box" style={outerCardStyle}>
        <h2 className="quiz-title" style={{ marginBottom: 6 }}>
          Mina resultat
        </h2>
        <p className="quiz-subtitle" style={{ marginBottom: 12 }}>
          Sammanställning av sparade rundor och svar.
        </p>

        {!loading && (
          <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8, color: "#fff" }}>
            Visar {source === "server+local" ? "kontohistorik + lokal historik" : source === "server" ? "kontohistorik" : "lokal historik"}
            {!userName && " (ej inloggad)"}.
          </div>
        )}

        {!loading && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <button
              style={filterBtn(filterMode === "all")}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.22)")}
              onMouseOut={(e) =>
                (e.currentTarget.style.background =
                  filterMode === "all" ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.14)")
              }
              onClick={() => setFilterMode("all")}
            >
              Alla ({allResults.length})
            </button>
            <button
              style={filterBtn(filterMode === "solo")}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.22)")}
              onMouseOut={(e) =>
                (e.currentTarget.style.background =
                  filterMode === "solo" ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.14)")
              }
              onClick={() => setFilterMode("solo")}
            >
              Solo ({allResults.filter((r) => (r.gameMode || "solo") === "solo").length})
            </button>
            <button
              style={filterBtn(filterMode === "bot")}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.22)")}
              onMouseOut={(e) =>
                (e.currentTarget.style.background =
                  filterMode === "bot" ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.14)")
              }
              onClick={() => setFilterMode("bot")}
            >
              Mot bot ({allResults.filter((r) => r.gameMode === "bot").length})
            </button>
          </div>
        )}

        {loading && <p style={{ color: "#fff" }}>Laddar…</p>}

        {!loading && (
          <>
            <div
              className="stat-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <div className="score-summary" style={scoreCardStyle}>
                <div>
                  <strong>Rundor spelade:</strong>
                </div>
                <div style={{ fontWeight: 700 }}> {stats.rounds}</div>
              </div>
              <div className="score-summary" style={scoreCardStyle}>
                <div>
                  <strong>Snittpoäng/runda:</strong>
                </div>
                <div style={{ fontWeight: 700 }}>{stats.avgScore.toFixed(1)}</div>
              </div>
              <div className="score-summary" style={scoreCardStyle}>
                <div>
                  <strong>Bästa runda:</strong>
                </div>
                <div style={{ fontWeight: 700 }}>{stats.bestScore}</div>
              </div>
              <div className="score-summary" style={scoreCardStyle}>
                <div>
                  <strong>Träffsäkerhet:</strong>
                </div>
                <div style={{ fontWeight: 700 }}>
                  {stats.accuracyPct}% ({stats.totalCorrect}/{stats.totalQuestions})
                </div>
              </div>
              <div className="score-summary" style={scoreCardStyle}>
                <div>
                  <strong>Senast spelad:</strong>
                </div>
                <div style={{ fontWeight: 700 }}>{stats.lastPlayed ? formatDate(stats.lastPlayed) : "–"}</div>
              </div>
            </div>

            {filteredResults.length === 0 && (
              <div className="recent-card" style={{ maxWidth: 520, color: "#fff" }}>
                Inga resultat sparade ännu i denna kategori. Spela en runda först.
              </div>
            )}

            {filteredResults.map((r) => (
              <details
                key={r.id ?? `${r.roundNumber}-${r.dateTaken}`}
                style={{
                  marginBottom: 10,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 12,
                  padding: "8px 12px",
                  color: "#fff",
                }}
              >
                <summary
                  style={{
                    cursor: "pointer",
                    outline: "none",
                    fontSize: "clamp(14px, 2vw, 16px)",
                    color: "#fff",
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <strong>Runda {r.roundNumber}</strong> — {r.score}/{r.totalQuestions} —
                  <span style={{ opacity: 0.9 }}> {formatDate(r.dateTaken)}</span>
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                      padding: "2px 8px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,.35)",
                      background: r.gameMode === "bot" ? "rgba(255,255,255,.16)" : "rgba(255,255,255,.10)",
                    }}
                    aria-label="Speltyp"
                  >
                    {r.gameMode === "bot" ? "Mot bot" : "Solo"}
                  </span>
                  {r.gameMode === "bot" && Number.isFinite(r.botScore) && (
                    <span style={{ fontSize: 12, opacity: 0.9 }}>
                      | Bot: {r.botScore}
                      {r.botName ? ` (${r.botName})` : ""}
                    </span>
                  )}
                </summary>

                <div style={{ marginTop: 10 }}>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 14,
                        tableLayout: "fixed",
                        color: "#fff",
                      }}
                    >
                      <colgroup>
                        <col style={{ width: 48 }} />
                        <col style={{ width: "44%" }} />
                        <col style={{ width: "24%" }} />
                        <col style={{ width: "24%" }} />
                        <col style={{ width: 56 }} />
                      </colgroup>
                      <thead>
                        <tr style={{ textAlign: "left" }}>
                          <th style={{ padding: "8px 6px", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>#</th>
                          <th style={{ padding: "8px 6px", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>Fråga</th>
                          <th style={{ padding: "8px 6px", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>Ditt svar</th>
                          <th style={{ padding: "8px 6px", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>Rätt svar</th>
                          <th style={{ padding: "8px 6px", borderBottom: "1px solid rgba(255,255,255,0.2)" }}>Rätt?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(r.answers ?? []).map((a, idx) => {
                          const your = a?.type === "text" ? a?.userAnswer ?? "" : a?.selectedAnswer ?? "";
                          const correct = a?.type === "text" ? "—" : a?.correctAnswer ?? "";
                          const isOk = a?.type === "text" ? null : a?.isCorrect === true;
                          const cellStyle = {
                            padding: "8px 6px",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                            whiteSpace: "normal",
                          };
                          return (
                            <tr key={a.id ?? idx}>
                              <td style={cellStyle}>{idx + 1}</td>
                              <td style={cellStyle}>{a?.question ?? ""}</td>
                              <td style={cellStyle}>{your}</td>
                              <td style={cellStyle}>{correct}</td>
                              <td style={cellStyle}>
                                {isOk === null ? "—" : (
                                  <span style={{ color: isOk ? "#7CFF9E" : "#FF7C7C", fontWeight: 700 }}>
                                    {isOk ? "✔" : "✖"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </details>
            ))}

            <div className="button-row" style={{ justifyContent: "center", gap: 12 }}>
              <Link to="/quiz">
                <button
                  style={frostyBtnStyle}
                  onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.22)")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.14)")}
                >
                  Spela igen
                </button>
              </Link>
              <button
                style={frostyBtnStyle}
                onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.22)")}
                onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255,255,255,.14)")}
                onClick={handleClearHistory}
              >
                Rensa historik
              </button>
            </div>

            <div style={{ marginTop: 6, display: "flex", justifyContent: "center" }}>
              <Link to="/" className="back-link" style={subtleBackStyle}>
                ← Tillbaka till start
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
