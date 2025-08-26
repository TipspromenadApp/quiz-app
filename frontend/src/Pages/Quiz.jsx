import { useState, useEffect, useRef } from "react";
import "./quiz.css";
import { Link, useNavigate } from "react-router-dom";
import { useGeoProgress } from "../hooks/useGeoProgress";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5249";

const saveRoundResult = async (roundNumber, roundScore, questionCount, answers) => {
  try {
    const saved = JSON.parse(localStorage.getItem("user") || "null") || {};
    const userName =
      (saved?.username || saved?.userName || saved?.email || "").trim();

    if (!userName) return;

    const norm = (a) => {
      const qId = String(a.questionId ?? a.id ?? "");
      const q = String(a.question ?? "");
      const sel = a.selectedAnswer != null ? String(a.selectedAnswer) : (a.userAnswer != null ? String(a.userAnswer) : "");
      const cor = a.correctAnswer != null ? String(a.correctAnswer) : "";
      const ok = !!a.isCorrect;
      const type = a.type ?? "mcq";
      return {
       
        questionId: qId, question: q, selectedAnswer: sel, correctAnswer: cor, isCorrect: ok, type,
       
        QuestionId: qId, Question: q, SelectedAnswer: sel, CorrectAnswer: cor, IsCorrect: ok, Type: type,
      };
    };
    const normalized = (answers || []).map(norm);
    const totalQ = Number.isFinite(questionCount) && questionCount > 0
      ? questionCount
      : normalized.length;

    const payloads = [
      {
        UserName: userName,
        RoundNumber: roundNumber,
        Score: roundScore,
        TotalQuestions: totalQ,
        DateTaken: new Date().toISOString(),
        Answers: normalized.map((x) => ({
          QuestionId: x.QuestionId,
          Question: x.Question,
          SelectedAnswer: x.SelectedAnswer,
          CorrectAnswer: x.CorrectAnswer,
          IsCorrect: x.IsCorrect,
          Type: x.Type,
        })),
      },
      {
        userName,
        roundNumber,
        score: roundScore,
        totalQuestions: totalQ,
        dateTaken: new Date().toISOString(),
        answers: normalized.map((x) => ({
          questionId: x.questionId,
          question: x.question,
          selectedAnswer: x.selectedAnswer,
          correctAnswer: x.correctAnswer,
          isCorrect: x.isCorrect,
          type: x.type,
        })),
      },
    ];

    for (const body of payloads) {
      try {
        const res = await fetch(`${API_BASE}/api/QuizResult`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          console.log("Round saved:", await res.text());
          return;
        } else {
          const txt = await res.text().catch(() => "");
          console.warn("Save attempt failed", res.status, txt);
        }
      } catch (e) {
        console.warn("Save attempt error:", e);
      }
    }

    console.warn("Round not saved to server (both formats failed).");
  } catch (err) {
    console.warn("Error in saveRoundResult (skipping server save):", err);
  }
};

function pushLocalHistory({ answersAll, rounds }) {
  try {
    const score = answersAll.filter((a) => a.isCorrect).length;
    const entry = {
      id: (crypto?.randomUUID?.() || String(Date.now())),
      mode: "solo",
      rounds,
      finishedAt: new Date().toISOString(),
      totalQuestions: answersAll.length,
      score,
      answers: answersAll,
    };
    const sig = JSON.stringify({
      s: score,
      t: entry.totalQuestions,
      q: answersAll.map((a) => [
        a?.questionId ?? a?.id ?? null,
        a?.selectedAnswer ?? a?.userAnswer ?? null,
        !!a?.isCorrect,
      ]),
    });
    entry._sig = btoa(unescape(encodeURIComponent(sig))).slice(0, 80);

    const arr = JSON.parse(localStorage.getItem("quizHistory") || "[]");
    if (!arr.length || arr[0]?._sig !== entry._sig) {
      arr.unshift(entry);
      localStorage.setItem("quizHistory", JSON.stringify(arr.slice(0, 100)));
    }
    localStorage.setItem("lastMode", "solo");
  } catch (e) {
    console.warn("Failed to push local history:", e);
  }
}

const roundOneQuestions = [
  { id: 1, text: "Vilken av dessa drycker innehåller oftast koffein?", options: ["Apelsinjuice", "Vatten", "Te", "Mjölk"], correctAnswer: "Te" },
  { id: 2, text: "Vad är sushi traditionellt inlindad i?", options: ["Sjögräs", "Sallad", "Rispapper", "Plast"], correctAnswer: "Sjögräs" },
  { id: 3, text: "Vilket av följande är ett vanligt sätt att minska stress?", options: ["Lyssna på lugn musik", "Äta mer socker", "Hoppa över sömn", "Bråka på nätet"], correctAnswer: "Lyssna på lugn musik" },
  { id: 4, text: "Vad producerar bin?", options: ["Honung", "Smör", "Olja", "Mjölk"], correctAnswer: "Honung" },
  { id: 5, text: "Vilken av dessa räknas som en frukt?", options: ["Äpple", "Sallad", "Morot", "Broccoli"], correctAnswer: "Äpple" },
  { id: 6, text: "Vilket land är känt för Eiffeltornet?", options: ["Frankrike", "Italien", "Tyskland", "Spanien"], correctAnswer: "Frankrike" },
  { id: 7, text: "Vad använder du för att skicka ett e-postmeddelande?", options: ["Dator", "Mikrovågsugn", "TV", "Ugn"], correctAnswer: "Dator" },
  { id: 8, text: "Vad hjälper växter att växa?", options: ["Solljus", "Mörker", "Plast", "Rök"], correctAnswer: "Solljus" },
  { id: 9, text: "Vilken av dessa är ett musikinstrument?", options: ["Gitarr", "Tallrik", "Stol", "Sked"], correctAnswer: "Gitarr" },
  { id: 10, text: "Vilken är en vanlig frukosträtt?", options: ["Flingor", "Pizza", "Biff", "Popcorn"], correctAnswer: "Flingor" },
];

const roundTwoQuestions = [
  { id: 11, text: "Vilken färg har himlen en klar dag?", options: ["Blå", "Grön", "Röd", "Gul"], correctAnswer: "Blå" },
  { id: 12, text: "Vilket av dessa djur kan flyga?", options: ["Hund", "Elefant", "Fågel", "Orm"], correctAnswer: "Fågel" },
  { id: 13, text: "Hur många ben har en spindel?", options: ["Sex", "Åtta", "Tio", "Fyra"], correctAnswer: "Åtta" },
  { id: 14, text: "Vilket sinne använder vi för att höra?", options: ["Syn", "Smak", "Hörsel", "Känsel"], correctAnswer: "Hörsel" },
  { id: 15, text: "Vad andas vi in för att överleva?", options: ["Syre", "Helium", "Kol", "Rök"], correctAnswer: "Syre" },
  { id: 16, text: "Vad växer på träd och byter färg på hösten?", options: ["Rötter", "Löv", "Grener", "Frukt"], correctAnswer: "Löv" },
  { id: 17, text: "Vilket av dessa är en form?", options: ["Cirkel", "Blå", "Mjuk", "Lång"], correctAnswer: "Cirkel" },
  { id: 18, text: "Vad använder vi för att skriva?", options: ["Gaffel", "Blyertspenna", "Kniv", "Pensel"], correctAnswer: "Blyertspenna" },
  { id: 19, text: "Vad kallas fruset vatten?", options: ["Ånga", "Regn", "Is", "Dimma"], correctAnswer: "Is" },
  { id: 20, text: "Vilket av dessa är ett husdjur?", options: ["Lejon", "Elefant", "Hund", "Val"], correctAnswer: "Hund" },
];

const roundThreeQuestions = [
  { id: 21, text: "Vad absorberar träd från luften?", options: ["Koldioxid", "Syre", "Väte", "Kväve"], correctAnswer: "Koldioxid" },
  { id: 22, text: "Vilken färg får du om du blandar rött och blått?", options: ["Lila", "Grön", "Orange", "Gul"], correctAnswer: "Lila" },
  { id: 23, text: "Vad är Japans huvudstad?", options: ["Tokyo", "Peking", "Seoul", "Bangkok"], correctAnswer: "Tokyo" },
  { id: 24, text: "Vilket djur är känt för att ha en snabel?", options: ["Elefant", "Lejon", "Krokodil", "Giraff"], correctAnswer: "Elefant" },
  { id: 25, text: "Vilket av dessa är ett hälsosamt mellanmål?", options: ["Äppelskivor", "Godis", "Pommes", "Läsk"], correctAnswer: "Äppelskivor" },
  { id: 26, text: "Vad är is gjort av?", options: ["Fruset vatten", "Salt", "Glas", "Plast"], correctAnswer: "Fruset vatten" },
  { id: 27, text: "Vad använder vi våra öron till?", options: ["Hörsel", "Lukt", "Syn", "Smak"], correctAnswer: "Hörsel" },
  { id: 28, text: "Vilken av dessa är en planet i vårt solsystem?", options: ["Mars", "Alpha Centauri", "Orion", "Andromeda"], correctAnswer: "Mars" },
  { id: 29, text: "Vad är 10 + 5?", options: ["15", "20", "25", "30"], correctAnswer: "15" },
  { id: 30, text: "Vilken av dessa används för att skriva?", options: ["Penna", "Gaffel", "Hammare", "Sked"], correctAnswer: "Penna" },
];

const roundFourQuestions = [
  { id: 31, text: "Vilket objekt kretsar runt jorden?", options: ["Solen", "Månen", "Moln", "Stjärna"], correctAnswer: "Månen" },
  { id: 32, text: "Vad behöver växter för att växa?", options: ["Socker", "Solljus", "Salt", "Papper"], correctAnswer: "Solljus" },
  { id: 33, text: "Vilken av dessa är en riktig planet?", options: ["Krypton", "Jorden", "Atlantis", "Neverland"], correctAnswer: "Jorden" },
  { id: 34, text: "Vad har astronauter på sig?", options: ["Rymddräkt", "Regnjacka", "Labrock", "Smoking"], correctAnswer: "Rymddräkt" },
  { id: 35, text: "Vad händer när is smälter?", options: ["Den flyter", "Den blir till vatten", "Den försvinner", "Den växer"], correctAnswer: "Den blir till vatten" },
  { id: 36, text: "Vad drar saker ner mot marken?", options: ["Luft", "Gravitation", "Vind", "Värme"], correctAnswer: "Gravitation" },
  { id: 37, text: "Vilken av dessa är en vätska?", options: ["Sten", "Vatten", "Trä", "Bomull"], correctAnswer: "Vatten" },
  { id: 38, text: "Vilken av dessa kan du se igenom?", options: ["Metall", "Papper", "Glas", "Tegel"], correctAnswer: "Glas" },
  { id: 39, text: "Vilken av dessa skapas av blixtar?", options: ["Eld", "Snö", "Åska", "Regn"], correctAnswer: "Åska" },
  { id: 40, text: "Vad förvandlas larver till?", options: ["Bin", "Spindlar", "Fjärilar", "Flugor"], correctAnswer: "Fjärilar" },
];

const roundFiveQuestions = [
  { id: 41, text: "Vad kallar man en berättelse som inte är sann?", options: ["Biografi", "Fiktion", "Historia", "Fakta"], correctAnswer: "Fiktion" },
  { id: 42, text: "Vilken av dessa hjälper dig att vakna på morgonen?", options: ["Ficklampa", "Väckarklocka", "Kalender", "Spegel"], correctAnswer: "Väckarklocka" },
  { id: 43, text: "Vilken av dessa är en känsla?", options: ["Glädje", "Bord", "Papper", "Fönster"], correctAnswer: "Glädje" },
  { id: 44, text: "Vad gör du när du är trött?", options: ["Hoppar", "Springer", "Sover", "Dansar"], correctAnswer: "Sover" },
  { id: 45, text: "Vilket djur är påhittat?", options: ["Häst", "Drake", "Katt", "Får"], correctAnswer: "Drake" },
  { id: 46, text: "Vilket verktyg talar om vilken dag det är?", options: ["Klocka", "Termometer", "Kalender", "Linjal"], correctAnswer: "Kalender" },
  { id: 47, text: "Vad har du på dig när det regnar?", options: ["Gympaskor", "Regnjacka", "Solglasögon", "Handskar"], correctAnswer: "Regnjacka" },
  { id: 48, text: "Vilket av dessa är ett vänligt ord?", options: ["Elak", "Glad", "Arg", "Oartig"], correctAnswer: "Glad" },
  { id: 49, text: "Vilken plats är magisk i sagor?", options: ["Livsmedelsbutik", "Bibliotek", "Slott", "Garage"], correctAnswer: "Slott" },
  { id: 50, text: "Vilken används för att berätta en historia med bilder?", options: ["Sång", "Bok", "Film", "Pussel"], correctAnswer: "Film" },
];

const WALK_THRESHOLDS = { "0.5": 5, "1": 10 };
const IS_DEV = import.meta.env?.DEV ?? false;

const Quiz = () => {
  const navigate = useNavigate();

  const [quizStarted, setQuizStarted] = useState(false);
  const [rounds, setRounds] = useState(5);
  const [questionsPerRound, setQuestionsPerRound] = useState(10);
  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showAffirmation, setShowAffirmation] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQuestionsDropdown, setShowQuestionsDropdown] = useState(false);
  const [allAnswers, setAllAnswers] = useState([]);

  const [showCorrect, setShowCorrect] = useState(() => {
    try {
      const v = localStorage.getItem("pref_showCorrect");
      return v === null ? true : JSON.parse(v);
    } catch {
      return true;
    }
  });
  useEffect(() => {
    localStorage.setItem("pref_showCorrect", JSON.stringify(showCorrect));
  }, [showCorrect]);

  const [walkMode, setWalkMode] = useState(
    JSON.parse(localStorage.getItem("pref_walkMode") ?? "false")
  );
  const [uiThreshold, setUiThreshold] = useState(
    localStorage.getItem("pref_walkThreshold") ?? "0.5"
  );
  const [waitingForWalk, setWaitingForWalk] = useState(false);

  useEffect(() => {
    localStorage.setItem("pref_walkMode", JSON.stringify(walkMode));
  }, [walkMode]);
  useEffect(() => {
    localStorage.setItem("pref_walkThreshold", uiThreshold);
  }, [uiThreshold]);

  const {
    moved,
    ready,
    accuracy,
    error,
    startDistance,
    stopTracking,
    reset,
    simulate,
  } = useGeoProgress();

  const shuffleArray = (array) => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  function proceedToNextQuestion() {
    setCurrentQuestionIndex((p) => p + 1);
  }
  function gateNextQuestion() {
    if (!walkMode) {
      proceedToNextQuestion();
      return;
    }
    setWaitingForWalk(true);
    const target = WALK_THRESHOLDS[uiThreshold] ?? 5;
    reset();
    startDistance(target);
  }
  useEffect(() => {
    if (!waitingForWalk) return;
    if (ready) {
      stopTracking();
      setWaitingForWalk(false);
      proceedToNextQuestion();
    }
  }, [waitingForWalk, ready, stopTracking]);
  useEffect(() => () => { stopTracking(); }, [stopTracking]);

  
  const audioRef = useRef(null);
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.volume = 0.035; 
    a.muted = false;
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
  }, []);

  const handleStart = () => {
    localStorage.removeItem("finalAnswers");
    localStorage.removeItem("finalScore");

    setQuizStarted(true);
    setCurrentRound(1);
    setCurrentQuestionIndex(0);
    setShowAffirmation(false);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizFinished(false);
    setUserAnswers([]);
    setAllAnswers([]);

    const shuffled = roundOneQuestions.map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));
    const limited = shuffleArray(shuffled).slice(0, questionsPerRound);
    setShuffledQuestions(limited);

    setWaitingForWalk(false);
    stopTracking();
    reset();
  };

  const handleAnswer = async (option) => {
    const q = shuffledQuestions[currentQuestionIndex];
    const correct = q.correctAnswer === option;

    const record = {
      round: currentRound,
      questionId: q.id,
      question: q.text,
      selectedAnswer: option,
      correctAnswer: q.correctAnswer,
      isCorrect: correct,
    };

    const nextUserAnswers = [...userAnswers, record];
    const nextScore = correct ? score + 1 : score;
    const answersThisRound = nextUserAnswers.slice(-questionsPerRound);
    const isLastQuestion = currentQuestionIndex >= shuffledQuestions.length - 1;
    const roundNumber = currentRound;
    const isLastRound = roundNumber >= rounds;

    setSelectedAnswer(option);
    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(async () => {
      setSelectedAnswer(null);
      setShowResult(false);
      setUserAnswers(nextUserAnswers);
      setScore(nextScore);

      if (!isLastQuestion) {
        gateNextQuestion();
        return;
      }

      await saveRoundResult(roundNumber, nextScore, questionsPerRound, answersThisRound);

      const updatedAll = [...allAnswers, ...answersThisRound];
      setAllAnswers(updatedAll);
      localStorage.setItem("finalAnswers", JSON.stringify(updatedAll));
      localStorage.setItem(
        "finalScore",
        String(updatedAll.filter((a) => a.isCorrect).length)
      );

      if (isLastRound) {
        pushLocalHistory({ answersAll: updatedAll, rounds });

        navigate("/final-result", {
          state: {
            answers: updatedAll,
            totalQuestions: updatedAll.length,
            score: updatedAll.filter((a) => a.isCorrect).length,
            ts: Date.now(),
          },
        });
      } else {
        setQuizFinished(true);
        setShowAffirmation(true);
        setUserAnswers([]);
        setCurrentQuestionIndex(0);
        setScore(0);
        setQuizFinished(false);
        loadNextRoundQuestions(currentRound + 1);

        setWaitingForWalk(false);
        stopTracking();
        reset();
      }
    }, 800);
  };

  const handleSkip = () => {
    const isLastQuestion = currentQuestionIndex >= shuffledQuestions.length - 1;
    if (!isLastQuestion) {
      gateNextQuestion();
      setSelectedAnswer(null);
      setShowResult(false);
      return;
    }
    setShowAffirmation(true);
  };

  const loadNextRoundQuestions = (nextRound) => {
    const roundsPool = [
      roundOneQuestions,
      roundTwoQuestions,
      roundThreeQuestions,
      roundFourQuestions,
      roundFiveQuestions,
    ];
    const nextQuestions = roundsPool[nextRound - 1] ?? [];

    const withShuffledOptions = nextQuestions.map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));

    const limited = shuffleArray(withShuffledOptions).slice(0, questionsPerRound);
    setShuffledQuestions(limited);
  };

  const showingQuestion =
    quizStarted &&
    !showAffirmation &&
    shuffledQuestions.length > 0 &&
    (!walkMode || !waitingForWalk);

  return (
    <div className="start-page">
      
      <div className="start-bg" aria-hidden="true" />

      <div className="quiz-container content-box">
        <h1 className="quiz-title">Välkommen, utforskare av sinnet</h1>

        <p className="quiz-subtitle">
          Välj din väg och börja resan mot självinsikt.
        </p>

        {!quizStarted && (
          <>
            <label htmlFor="rounds" style={{ fontSize: "18px" }}>
              Ställ in din väg: Hur många rundor och hur många frågor vill du möta?
            </label>

            <div className="button-row">
              <div className="custom-dropdown">
                <button
                  className="dropdown-button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {rounds} runda{rounds > 1 ? "r" : ""} ▼
                </button>
                {showDropdown && (
                  <ul className="dropdown-menu">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <li
                        key={r}
                        className="dropdown-item"
                        onClick={() => {
                          setRounds(r);
                          setShowDropdown(false);
                        }}
                      >
                        {r} runda{r > 1 ? "r" : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="custom-dropdown">
                <button
                  className="dropdown-button"
                  onClick={() =>
                    setShowQuestionsDropdown(!showQuestionsDropdown)
                  }
                >
                  {questionsPerRound} fråga{questionsPerRound > 1 ? "or" : ""} ▼
                </button>
                {showQuestionsDropdown && (
                  <ul className="dropdown-menu">
                    {[3, 6, 9, 10].map((q) => (
                      <li
                        key={q}
                        className="dropdown-item"
                        onClick={() => {
                          setQuestionsPerRound(q);
                          setShowQuestionsDropdown(false);
                        }}
                      >
                        {q} fråga{q > 1 ? "or" : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button className="quiz-button" onClick={handleStart}>
                Starta quiz
              </button>
            </div>

            <div style={{ marginTop: 10, marginBottom: 8, textAlign: "center" }}>
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={walkMode}
                    onChange={(e) => setWalkMode(e.target.checked)}
                  />
                  Walk Mode – lås upp nästa fråga genom att röra dig
                </label>

                <label style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={showCorrect}
                    onChange={(e) => setShowCorrect(e.target.checked)}
                  />
                  Visa rätt svar efter varje fråga
                </label>
              </div>

              {walkMode && (
                <div style={{ marginTop: 6, display: "flex", gap: 16, justifyContent: "center" }}>
                  <label>
                    <input
                      type="radio"
                      name="dist"
                      value="0.5"
                      checked={uiThreshold === "0.5"}
                      onChange={(e) => setUiThreshold(e.target.value)}
                    />{" "}
                    0.5 m
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="dist"
                      value="1"
                      checked={uiThreshold === "1"}
                      onChange={(e) => setUiThreshold(e.target.value)}
                    />{" "}
                    1 m
                  </label>
                </div>
              )}
            </div>

            <Link to="/" className="back-link">
              ← Tillbaka till start
            </Link>
          </>
        )}

        {quizStarted && walkMode && waitingForWalk && (
          <div style={{ margin: "8px 0 10px" }}>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
              <span
                style={{
                  border: "1px solid rgba(255,255,255,.2)",
                  borderRadius: 999,
                  padding: "4px 10px",
                  fontSize: 12,
                  opacity: 0.95,
                }}
              >
                Förflyttning: {moved.toFixed(1)} / {(WALK_THRESHOLDS[uiThreshold] ?? 5)} m
              </span>
              {accuracy && (
                <span
                  style={{
                    border: "1px solid rgba(255,255,255,.2)",
                    borderRadius: 999,
                    padding: "4px 10px",
                    fontSize: 12,
                    opacity: 0.8,
                  }}
                >
                  ±{Math.round(accuracy)} m
                </span>
              )}
              {error && <span style={{ color: "#f88", fontSize: 12 }}>Platsfel: {error}</span>}
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8 }}>
              {IS_DEV && (
                <button
                  className="quiz-button"
                  type="button"
                  onClick={() => {
                    simulate(1);
                  }}
                >
                  +1 m (simulera)
                </button>
              )}
              <button
                className="quiz-button"
                type="button"
                onClick={() => {
                  setWaitingForWalk(false);
                  stopTracking();
                }}
              >
                Avbryt gång
              </button>
              <button
                className="quiz-button"
                type="button"
                onClick={() => {
                  setWaitingForWalk(false);
                  stopTracking();
                  proceedToNextQuestion();
                }}
              >
                Kan inte få plats? Fortsätt
              </button>
            </div>
          </div>
        )}

        {showingQuestion && (
          <div>
            <h2>Runda {currentRound}</h2>

            <p style={{ fontSize: "18px", marginBottom: "10px" }}>
              <strong>Fråga {currentQuestionIndex + 1}:</strong>{" "}
              {shuffledQuestions[currentQuestionIndex].text}
            </p>

            {shuffledQuestions[currentQuestionIndex]?.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                disabled={showResult}
                className={`answer-btn ${selectedAnswer === option ? "selected" : ""}`}
              >
                {option}
              </button>
            ))}

            <button className="back-link skip-btn" onClick={handleSkip}>
              Hoppa över →
            </button>

            {showResult && (
              <div className="result">
                {showCorrect ? (
                  <p style={{ color: isCorrect ? "green" : "red" }}>
                    {isCorrect
                      ? "Rätt!"
                      : `Fel. Rätt svar är: ${shuffledQuestions[currentQuestionIndex].correctAnswer}`}
                  </p>
                ) : (
                  <p style={{ color: isCorrect ? "green" : "red" }}>
                    {isCorrect ? "Rätt!" : "Fel."}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {showAffirmation && (
          <div className="affirmation">
            {quizFinished && (
              <div className="score-summary">
                <p>
                  Rätt: <span className="correct">{score}</span> / Fel:{" "}
                  <span className="incorrect">
                    {Math.max(0, shuffledQuestions.length - score)}
                  </span>
                </p>
              </div>
            )}

            <h2 className="glow-text">
              {[
                "Även de minsta stegen framåt är en del av en vacker resa. Fortsätt – du gör det bättre än du tror.",
                "Ditt ljus är unikt, och världen är bättre för att du finns. Var inte rädd att lysa.",
                "Du är starkare än du tror, modigare än du känner och mer älskad än du vet. Idag är en ny sida, och du håller pennan.",
                "Frid börjar inom dig. Andas djupt – du är trygg, du är kapabel och du växer varje dag.",
                "Det finns en stilla styrka i att välja att börja om. Idag bär på varsamma nya början.",
              ][Math.floor(Math.random() * 5)]}
            </h2>

            {currentRound < rounds && (
              <button
                className="quiz-button"
                onClick={() => {
                  const nextRound = currentRound + 1;
                  setCurrentRound(nextRound);
                  setCurrentQuestionIndex(0);
                  setShowAffirmation(false);
                  setSelectedAnswer(null);
                  setShowResult(false);
                  setScore(0);
                  setQuizFinished(false);
                  loadNextRoundQuestions(nextRound);

                  setWaitingForWalk(false);
                  stopTracking();
                  reset();
                }}
              >
                Starta nästa runda
              </button>
            )}

            {currentRound >= rounds && (
              <div style={{ marginTop: 16 }}>
                <p className="completion-message">
                  Alla rundor klara. Du klarade det. Tack för att du var med.
                </p>
                <Link to="/" className="back-link">
                  ← Tillbaka till start
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

     
      <audio ref={audioRef} src="/sounds/forest.mp3" loop preload="auto" />
    </div>
  );
};

export default Quiz;
