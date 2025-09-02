import React, { useEffect, useRef, useState } from "react";
import "./botquiz.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useGeoProgress } from "../hooks/useGeoProgress";
import { loadCustomQuestions } from "../utils/customQuestions";
import { loadUserQuestions } from "../lib/userQuestions";
import { useServerBot } from "../hooks/useServerBot";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5249";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function normalizeText(s) {
  return String(s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}
function getTextAnswer(q) {
  const candidates = [
    q?.correctAnswer, q?.exampleAnswer, q?.expectedAnswer, q?.answer,
    q?.textAnswer, q?.freeTextAnswer, q?.answerText, q?.expected, q?.solution,
  ];
  for (const c of candidates) if (typeof c === "string" && c.trim()) return c.trim();
  if (Array.isArray(q?.correctAnswer) && q.correctAnswer.length > 0) {
    const first = q.correctAnswer.find((v) => typeof v === "string" && v.trim());
    if (first) return first.trim();
  }
  return "";
}
function getQuestionKind(q) {
  const typeCandidates = [q?.type, q?.questionType, q?.kind];
  for (const t of typeCandidates) {
    if (typeof t === "string") {
      const k = t.trim().toLowerCase();
      if (["text","fritext","free","free-text","freetext"].includes(k)) return "text";
      if (["mcq","multiple","multiple-choice","alternativ","flervalsfråga","flervalsfraga"].includes(k)) return "mcq";
    }
  }
  if (Array.isArray(q?.options) && q.options.length >= 2) return "mcq";
  return getTextAnswer(q) ? "text" : "mcq";
}
function isTextQuestion(q){ return getQuestionKind(q) === "text"; }
function isTextCorrect(user, q) {
  const single = getTextAnswer(q);
  const list = Array.isArray(q?.correctAnswer) ? q.correctAnswer : (single ? [single] : []);
  const u = normalizeText(user);
  return list.some((t) => normalizeText(t) === u);
}
function getCorrectAnswerText(q) {
  if (isTextQuestion(q)) return getTextAnswer(q);
  if (typeof q?.correctAnswer === "string") return q.correctAnswer;
  if (Array.isArray(q?.options) && typeof q?.correctIndex === "number") return q.options[q.correctIndex];
  return undefined;
}
function normalizeCustomQuestions(raw) {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((q, idx) => {
      const kind = getQuestionKind(q);
      const text = String(q?.text ?? q?.question ?? q?.title ?? "").trim();
      const options = Array.isArray(q?.options) ? q.options.slice() : undefined;
      let correctAnswer;
      if (kind === "text") {
        correctAnswer = getTextAnswer(q);
      } else {
        if (typeof q?.correctAnswer === "string") correctAnswer = q.correctAnswer;
        else if (options && typeof q?.correctIndex === "number") correctAnswer = options[q.correctIndex];
      }
      return {
        id: q?.id ?? q?.questionId ?? `custom-${idx}-${text.slice(0, 20)}`,
        text, type: kind, options,
        correctAnswer: correctAnswer ?? "", correctIndex: q?.correctIndex,
      };
    })
    .filter((q) => q.text && (q.type === "text" ? !!q.correctAnswer : Array.isArray(q.options) && q.options.length >= 2));
}
async function fetchGeneralQuestions(roundNumber) {
  const url = `${API_BASE}/api/Questions/by-round?round=${encodeURIComponent(roundNumber)}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error("fetchGeneralQuestions failed:", e);
    return [];
  }
}

const WALK_THRESHOLDS = { "0.5": 5, "1": 10 };

// local history helper so Results page can show “Mot bot”
function pushLocalHistory({ answersAll, rounds, botScore, botName }) {
  try {
    const score = answersAll.filter((a) => a.isCorrect).length;
    const entry = {
      id: crypto?.randomUUID?.() || String(Date.now()),
      mode: "bot",
      rounds,
      finishedAt: new Date().toISOString(),
      totalQuestions: answersAll.length,
      score,
      answers: answersAll,
      botScore: Number.isFinite(botScore) ? botScore : 0,
      botName: botName || "Bot",
    };
    const sig = JSON.stringify({
      m: "bot",
      s: score,
      t: entry.totalQuestions,
      q: answersAll.map((a) => [
        a?.questionId ?? a?.id ?? null,
        a?.selectedAnswer ?? a?.userAnswer ?? null,
        !!a?.isCorrect,
      ]),
      bs: entry.botScore,
      bn: entry.botName,
    });
    entry._sig = btoa(unescape(encodeURIComponent(sig))).slice(0, 80);

    const arr = JSON.parse(localStorage.getItem("quizHistory") || "[]");
    if (!arr.length || arr[0]?._sig !== entry._sig) {
      arr.unshift(entry);
      localStorage.setItem("quizHistory", JSON.stringify(arr.slice(0, 100)));
    }
    localStorage.setItem("lastMode", "bot");
  } catch (e) {
    console.warn("Failed to push local history (bot):", e);
  }
}

export default function BotQuiz() {
  const navigate = useNavigate();
  const reactLocation = useLocation();
  const navState = reactLocation?.state || {};

  const botName = navState.botName || localStorage.getItem("pref_bot_name") || "Bot Jonas";

  const [quizStarted, setQuizStarted] = useState(false);
  const [rounds, setRounds] = useState(() => Number(localStorage.getItem("pref_rounds") || 5));
  const [questionsPerRound, setQuestionsPerRound] = useState(() => Number(localStorage.getItem("pref_perRound") || 10));
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
  const [allAnswers, setAllAnswers] = useState([]);
  const [textInput, setTextInput] = useState("");

  // keep every bot answer (for FinalResult + PDF)
  const [botAllAnswers, setBotAllAnswers] = useState([]);

  const [bgReady, setBgReady] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setBgReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = 0.16;
    el.muted = true;
    const tryPlay = () => el.play().catch(() => {});
    tryPlay();

    const unlock = () => {
      el.muted = false;
      tryPlay();
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      el.pause();
    };
  }, []);

  const [difficulty, setDifficulty] = useState(() =>
    navState.difficulty || localStorage.getItem("pref_bot_difficulty") || "normal"
  );
  useEffect(() => { localStorage.setItem("pref_bot_difficulty", difficulty); }, [difficulty]);

  const [botSpeed, setBotSpeed] = useState(() => localStorage.getItem("pref_botSpeed") || "normal");
  useEffect(() => { localStorage.setItem("pref_botSpeed", botSpeed); }, [botSpeed]);

  const [quizSource, setQuizSource] = useState(() => localStorage.getItem("pref_quizSource") || "general");
  useEffect(() => { localStorage.setItem("pref_quizSource", quizSource); }, [quizSource]);

  const [showCorrect, setShowCorrect] = useState(() => {
    if (typeof navState.showCorrect === "boolean") return navState.showCorrect;
    try { const v = localStorage.getItem("pref_showCorrect"); return v === null ? true : JSON.parse(v); }
    catch { return true; }
  });
  useEffect(() => { localStorage.setItem("pref_showCorrect", JSON.stringify(showCorrect)); }, [showCorrect]);

  const [walkMode, setWalkMode] = useState(() => {
    if (typeof navState.walkMode === "boolean") return navState.walkMode;
    return JSON.parse(localStorage.getItem("pref_walkMode") ?? "false");
  });
  const [uiThreshold, setUiThreshold] = useState(localStorage.getItem("pref_walkThreshold") ?? "0.5");
  const [waitingForWalk, setWaitingForWalk] = useState(false);
  const IS_DEV = import.meta.env?.DEV ?? false;

  useEffect(() => { localStorage.setItem("pref_walkMode", JSON.stringify(walkMode)); }, [walkMode]);
  useEffect(() => { localStorage.setItem("pref_walkThreshold", uiThreshold); }, [uiThreshold]);
  useEffect(() => { localStorage.setItem("pref_rounds", String(rounds)); }, [rounds]);
  useEffect(() => { localStorage.setItem("pref_perRound", String(questionsPerRound)); }, [questionsPerRound]);

  const { moved, ready, accuracy, error, startDistance, stopTracking, reset, simulate } = useGeoProgress();

  function proceedToNextQuestion() { setCurrentQuestionIndex((p) => p + 1); }
  function gateNextQuestion() {
    if (!walkMode) { proceedToNextQuestion(); return; }
    setWaitingForWalk(true);
    const target = WALK_THRESHOLDS[uiThreshold] ?? 5;
    reset(); startDistance(target);
  }
  useEffect(() => {
    if (!waitingForWalk) return;
    if (ready) { stopTracking(); setWaitingForWalk(false); proceedToNextQuestion(); }
  }, [waitingForWalk, ready, stopTracking]);
  useEffect(() => () => { stopTracking(); }, [stopTracking]);

  const showingQuestion =
    !!quizStarted &&
    !showAffirmation &&
    shuffledQuestions.length > 0 &&
    (!walkMode || !waitingForWalk);

  function prepareQuestion(q) {
    const copy = { ...q };
    if (isTextQuestion(q)) {
      const ans = getTextAnswer(q);
      if (ans) copy.correctAnswer = String(ans).trim();
      delete copy.correctIndex;
      if (Array.isArray(copy.options) && copy.options.length === 0) delete copy.options;
      return copy;
    }
    const correctText = getCorrectAnswerText(q);
    if (Array.isArray(copy.options)) copy.options = shuffleArray(copy.options);
    if (typeof correctText === "string" && correctText.trim()) copy.correctAnswer = correctText.trim();
    delete copy.correctIndex;
    return copy;
  }
  function getRoundSource() {
    if (quizSource === "personal") {
      const fromHook = typeof loadUserQuestions === "function" ? loadUserQuestions() || [] : [];
      const fromUtil = typeof loadCustomQuestions === "function" ? loadCustomQuestions() || [] : [];
      const fromLS = (() => { try { return JSON.parse(localStorage.getItem("custom_questions") || localStorage.getItem("customQuestions") || "[]"); } catch { return []; } })();
      return normalizeCustomQuestions([ ...(Array.isArray(fromHook) ? fromHook : []), ...(Array.isArray(fromUtil) ? fromUtil : []), ...(Array.isArray(fromLS) ? fromLS : []), ]);
    }
    return [];
  }
  async function buildPool(roundNumber) {
    if (quizSource === "general") {
      const raw = await fetchGeneralQuestions(roundNumber);
      return (Array.isArray(raw) ? raw : []).map(prepareQuestion);
    }
    const raw = getRoundSource(roundNumber);
    return (Array.isArray(raw) ? raw : []).map(prepareQuestion);
  }

  const [botScore, setBotScore] = useState(0);
  const [botAnswer, setBotAnswer] = useState(null);
  const [botIsCorrect, setBotIsCorrect] = useState(false);
  const botIsCorrectRef = useRef(false);
  useEffect(() => { botIsCorrectRef.current = botIsCorrect; }, [botIsCorrect]);

  const [botThinking, setBotThinking] = useState(false);

  const [playerAnsweredAt, setPlayerAnsweredAt] = useState(null);
  const [botAnsweredAt, setBotAnsweredAt] = useState(null);
  const [pendingRecord, setPendingRecord] = useState(null);

  const playerAnsweredAtRef = useRef(null);
  const botAnsweredAtRef = useRef(null);
  const finalizedRef = useRef(false);
  const navigatedRef = useRef(false);

  useEffect(() => { playerAnsweredAtRef.current = playerAnsweredAt; }, [playerAnsweredAt]);
  useEffect(() => { botAnsweredAtRef.current = botAnsweredAt; }, [botAnsweredAt]);

  const resetPerQuestion = () => {
    setSelectedAnswer(null); setShowResult(false); setIsCorrect(false); setTextInput("");
    setBotAnswer(null); setBotIsCorrect(false);
    setPlayerAnsweredAt(null); playerAnsweredAtRef.current = null;
    setBotAnsweredAt(null);    botAnsweredAtRef.current = null;
    setPendingRecord(null);
    finalizedRef.current = false;
  };

  const handleStart = async () => {
    const initialRaw = await buildPool(1);
    if (quizSource === "personal" && initialRaw.length === 0) {
      alert('Du har inga egna frågor ännu. Lägg till dem under “Skapa ny fråga”.');
      navigate("/questions/new"); return;
    }
    const initial = shuffleArray(initialRaw).slice(0, questionsPerRound);
    setShuffledQuestions(initial);
    setQuizStarted(true);
    setCurrentRound(1);
    setCurrentQuestionIndex(0);
    setShowAffirmation(false);
    setScore(0);
    setQuizFinished(false);
    setUserAnswers([]);
    setAllAnswers([]);
    setWaitingForWalk(false); stopTracking(); reset();
    setBotScore(0); setBotAnswer(null); setBotIsCorrect(false);
    setBotAllAnswers([]);
    navigatedRef.current = false;
    resetPerQuestion();
  };

  const [dots, setDots] = useState(0);
  useEffect(() => {
    if (!botThinking) { setDots(0); return; }
    const t = setInterval(() => setDots((d) => (d + 1) % 4), 400);
    return () => clearInterval(t);
  }, [botThinking]);

  const BOT_DELAY = {
    easy:   { slow: [3000, 4500], normal: [2000, 3200], fast: [1000, 1800] },
    normal: { slow: [2500, 3800], normal: [1500, 2600], fast: [ 800, 1600] },
    hard:   { slow: [2000, 3000], normal: [1200, 2000], fast: [ 600, 1200] },
  };
  function nextDelayMs() {
    const map = BOT_DELAY[difficulty]?.[botSpeed] ?? [1500, 2500];
    const [min, max] = map;
    return Math.floor(min + Math.random() * (max - min));
  }

  const currentQuestion = showingQuestion ? shuffledQuestions[currentQuestionIndex] : null;
  const runKey = currentQuestion ? `${quizSource}:${difficulty}:${currentRound}:${currentQuestionIndex}:${currentQuestion.id}` : null;

  useServerBot({
    runKey,
    question: currentQuestion,
    difficulty,
    enable: !!currentQuestion && showingQuestion,
    onThinkingChange: setBotThinking,

    onRevealed: (payload) => {
      const q = currentQuestion; if (!q) return;

      const { answerIndex, answerText } = (payload || {});
      const correctText = getCorrectAnswerText(q);

      let pickedText = typeof answerText === "string"
        ? answerText
        : (!isTextQuestion(q) && typeof answerIndex === "number" && Array.isArray(q.options)
            ? q.options[answerIndex] ?? null
            : null);

      const finalIsCorrect = isTextQuestion(q)
        ? (pickedText ? isTextCorrect(pickedText, q) : false)
        : (pickedText != null && correctText != null && pickedText === correctText);

      // tiny bonus to make bot feel smarter sometimes
      const SMARTNESS_BONUS = { easy: 0.45, normal: 0.45, hard: 0.45 };
      let adjustedIsCorrect = finalIsCorrect;
      if (!finalIsCorrect) {
        const bonus = SMARTNESS_BONUS[difficulty] ?? 0.1;
        if (Math.random() < bonus && typeof correctText === "string" && correctText.trim()) {
          adjustedIsCorrect = true;
          pickedText = correctText;
        }
      }

      setBotThinking(true);
      const delay = nextDelayMs();
      setTimeout(() => {
        setBotAnswer(pickedText ?? "");
        setBotIsCorrect(adjustedIsCorrect);
        const ts = Date.now();
        setBotAnsweredAt(ts);
        if (playerAnsweredAtRef.current == null) submitTimeoutLoss(q, ts);
        setBotThinking(false);
      }, delay);
    },
  });

  function submitTimeoutLoss(q, botTs) {
    const textMode = isTextQuestion(q);
    const correctAnswerText = getCorrectAnswerText(q);
    const record = {
      round: currentRound,
      questionId: q.id,
      question: q.text ?? q.question ?? "",
      selectedAnswer: textMode ? null : null,
      userAnswer: textMode ? "" : null,
      correctAnswer: correctAnswerText,
      isCorrect: false,
      type: textMode ? "text" : q.type ?? "mcq",
    };
    const ts = (typeof botTs === "number" ? botTs : Date.now()) + 1;
    setSelectedAnswer(null); setIsCorrect(false); setShowResult(true);
    setPlayerAnsweredAt(ts); playerAnsweredAtRef.current = ts;
    setPendingRecord(record);
  }

  const handleAnswer = (answerValue) => {
    const q = shuffledQuestions[currentQuestionIndex];
    const textMode = isTextQuestion(q);
    const correctAnswerText = getCorrectAnswerText(q);
    const correct = textMode
      ? isTextCorrect(answerValue, q)
      : (correctAnswerText !== undefined ? correctAnswerText === answerValue : false);

    const record = {
      round: currentRound,
      questionId: q.id,
      question: q.text ?? q.question ?? "",
      selectedAnswer: textMode ? null : answerValue,
      userAnswer: textMode ? answerValue : null,
      correctAnswer: correctAnswerText,
      isCorrect: correct,
      type: textMode ? "text" : q.type ?? "mcq",
    };

    setSelectedAnswer(answerValue);
    setIsCorrect(correct);
    setShowResult(true);
    const ts = Date.now();
    setPlayerAnsweredAt(ts); playerAnsweredAtRef.current = ts;
    setPendingRecord(record);
  };

  useEffect(() => {
    if (!pendingRecord || playerAnsweredAt == null) return;
    if (botAnsweredAtRef.current == null) return;
    if (finalizedRef.current) return;
    finalizedRef.current = true;

    const q = shuffledQuestions[currentQuestionIndex];
    const textMode = isTextQuestion(q);
    const correctAnswerText = getCorrectAnswerText(q);

    const userCorrect = pendingRecord.isCorrect;
    const botCorrect  = botIsCorrectRef.current;

    let nextUserScoreVal = 0;
    let nextBotScoreVal  = 0;

    setScore((s) => {
      nextUserScoreVal = s + (userCorrect ? 1 : 0);
      return nextUserScoreVal;
    });
    setBotScore((s) => {
      nextBotScoreVal = s + (botCorrect ? 1 : 0);
      return nextBotScoreVal;
    });

    // merge bot's answer into the saved user record
    const finalRecord = {
      ...pendingRecord,
      botAnswer: typeof botAnswer === "string" ? botAnswer : (botAnswer ?? ""),
      botIsCorrect: !!botCorrect,
    };

    // also keep a parallel bot record list (optional)
    const botRecord = {
      round: currentRound,
      questionId: q.id,
      question: q.text ?? q.question ?? "",
      selectedAnswer: textMode ? null : (botAnswer ?? null),
      userAnswer: textMode ? (botAnswer ?? "") : null,
      correctAnswer: correctAnswerText,
      isCorrect: botCorrect,
      type: textMode ? "text" : q.type ?? "mcq",
    };

    const nextUserAnswers = [...userAnswers, finalRecord];
    const nextBotAnswers  = [...botAllAnswers, botRecord];
    const answersThisRound = nextUserAnswers.slice(-questionsPerRound);

    const isLastQuestion = currentQuestionIndex >= shuffledQuestions.length - 1;
    const roundNumber = currentRound;
    const isLastRound = roundNumber >= rounds;

    setUserAnswers(nextUserAnswers);
    setBotAllAnswers(nextBotAnswers);

    if (isTextQuestion(shuffledQuestions[currentQuestionIndex])) setTextInput("");

    setTimeout(async () => {
      if (!isLastQuestion) {
        resetPerQuestion();
        gateNextQuestion();
        return;
      }

      const roundScore = answersThisRound.filter(a => a.isCorrect).length;
      await saveRoundResult(roundNumber, roundScore, questionsPerRound, answersThisRound);

      const updatedAll = [...allAnswers, ...answersThisRound];
      const updatedBotAll = [...botAllAnswers, botRecord];
      setAllAnswers(updatedAll);
      setBotAllAnswers(updatedBotAll);

      const playerTotal = updatedAll.filter((a) => a.isCorrect).length;
      const finalPayload = {
        answers: updatedAll,                // per-row now includes botAnswer & botIsCorrect
        totalQuestions: updatedAll.length,
        score: playerTotal,
        gameMode: "bot",
        botName: botName || "Bot Jonas",
        botScore: nextBotScoreVal,
        botAnswers: updatedBotAll,         // optional parallel list
        ts: Date.now(),
      };

      try {
        localStorage.setItem("finalPayload", JSON.stringify(finalPayload));
        localStorage.setItem("finalAnswers", JSON.stringify(updatedAll));
        localStorage.setItem("finalScore", String(playerTotal));
        localStorage.setItem("finalTotal", String(updatedAll.length));
        localStorage.setItem("gameMode", "bot");
        localStorage.setItem("botName", finalPayload.botName);
        localStorage.setItem("botScore", String(finalPayload.botScore));
        localStorage.setItem("botTotalScore", String(finalPayload.botScore));
        localStorage.setItem("finalBotAnswers", JSON.stringify(updatedBotAll));
        localStorage.setItem("finalBotScore", String(finalPayload.botScore));
      } catch {}

      // store in local history as a bot match (so “Mot bot” shows in Results)
      pushLocalHistory({
        answersAll: updatedAll,
        rounds: Number(rounds),
        botScore: nextBotScoreVal,
        botName: finalPayload.botName,
      });

      if (isLastRound) {
        if (!navigatedRef.current) {
          navigatedRef.current = true;
          navigate("/final-result", { state: finalPayload });
        }
      } else {
        setQuizFinished(true);
        setShowAffirmation(true);
        setUserAnswers([]);
        setCurrentQuestionIndex(0);
        await loadNextRoundQuestions(currentRound + 1);
        resetPerQuestion();
      }
    }, 800);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRecord, playerAnsweredAt, botAnsweredAt]);

  async function loadNextRoundQuestions(nextRound) {
    const pool = await buildPool(nextRound);
    const next = shuffleArray(pool).slice(0, questionsPerRound);
    setShuffledQuestions(next);
    resetPerQuestion();
  }

  const handleSkip = () => {
    const isLastQuestion = currentQuestionIndex >= shuffledQuestions.length - 1;
    if (!isLastQuestion) { resetPerQuestion(); setCurrentQuestionIndex((prev) => prev + 1); return; }
    setShowAffirmation(true);
  };

  function getUserNameFromStorage() {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null") || {};
      const picks = [
        u.username, u.userName, u.displayName, u.name, u.email,
        localStorage.getItem("username"), localStorage.getItem("userName"), localStorage.getItem("email"),
      ];
      const found = picks.find((v) => typeof v === "string" && v.trim());
      if (found) return found.trim();
      const fallback = "Guest";
      localStorage.setItem("user", JSON.stringify({ ...u, username: fallback }));
      return fallback;
    } catch {
      const fallback = "Guest";
      localStorage.setItem("user", JSON.stringify({ username: fallback }));
      return fallback;
    }
  }
  async function saveRoundResult(roundNumber, roundScore, questionCount, answers) {
    try {
      const UserName = getUserNameFromStorage();
      if (!UserName) return;
      const Answers = (answers || []).map((a) => ({
        QuestionId: String(a.questionId ?? a.id ?? ""),
        Question: String(a.question ?? a.text ?? ""),
        SelectedAnswer: a.selectedAnswer != null ? String(a.selectedAnswer) : "",
        UserAnswer: a.userAnswer != null ? String(a.userAnswer) : "",
        CorrectAnswer: a.correctAnswer != null ? String(a.correctAnswer) : "",
        IsCorrect: !!a.isCorrect,
        Type: a.type ?? "mcq",
        // NOTE: not sending bot fields to this endpoint to avoid server breakage
      }));
      const req = {
        UserName, RoundNumber: roundNumber, TotalQuestions: questionCount, Score: roundScore,
        DateTaken: new Date().toISOString(), Answers,
      };
      const res = await fetch(`${API_BASE}/api/QuizResult`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${await res.text().catch(() => "")}`);
    } catch (err) {
      console.error("Error saving round:", err);
    }
  }

  return (
    <div className="bot-page">
      <div className={`bot-bg ${bgReady ? "is-visible" : ""}`} aria-hidden="true" />
      <audio ref={audioRef} src="/sounds/sea.mp3" loop preload="auto" playsInline />
      <div className="frosty-container">
        <h1 className="title">Spela med <span className="bot-name">{botName}</span></h1>

        {!quizStarted && (
          <>
            <p className="subtitle">
              Välj inställningar och börja din match. En vänlig match väntar – lugn, trygg
              och alltid med ett leende från {botName}.
            </p>

            <div className="compact-row two-groups">
              <fieldset className="inline-setting no-border">
                <legend className="mini-legend">Frågebank</legend>
                <label className="radio-inline">
                  <input type="radio" name="quizSource" value="general"
                    checked={quizSource === "general"} onChange={() => setQuizSource("general")} />
                  Allmänna frågor
                </label>
                <label className="radio-inline">
                  <input type="radio" name="quizSource" value="personal"
                    checked={quizSource === "personal"} onChange={() => setQuizSource("personal")} />
                  Egna frågor
                </label>
              </fieldset>

              <fieldset className="inline-setting no-border">
                <legend className="mini-legend">Alternativ</legend>
                <label className="radio-inline">
                  <input type="checkbox" className="round-check"
                    checked={showCorrect} onChange={(e) => setShowCorrect(e.target.checked)} />
                  Visa rätt svar
                </label>
                <label className="radio-inline">
                  <input type="checkbox" className="round-check"
                    checked={walkMode} onChange={(e) => setWalkMode(e.target.checked)} />
                  Walk Mode
                </label>
              </fieldset>
            </div>

            <div className="compact-row selects-line">
              <label className="compact-field">
                Svårighet:
                <select className="tiny-select pill-select" value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}>
                  <option value="easy">Lätt</option>
                  <option value="normal">Normal</option>
                  <option value="hard">Svår</option>
                </select>
              </label>

              <label className="compact-field">
                Bot-hastighet:
                <select className="tiny-select pill-select" value={botSpeed} onChange={(e)=>setBotSpeed(e.target.value)}>
                  <option value="slow">Långsam</option>
                  <option value="normal">Normal</option>
                  <option value="fast">Snabb</option>
                </select>
              </label>

              <label className="compact-field">
                Rundor:
                <select className="tiny-select pill-select" value={rounds} onChange={(e)=>setRounds(Number(e.target.value))}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>

              <label className="compact-field">
                Frågor/runda:
                <select className="tiny-select pill-select" value={questionsPerRound} onChange={(e)=>setQuestionsPerRound(Number(e.target.value))}>
                  {[3,5,6,7,8,9,10,12,15].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
            </div>

            {walkMode && (
              <div className="compact-row">
                <span className="walk-distance">
                  Mål:&nbsp;
                  <label><input type="radio" name="dist" value="0.5" checked={uiThreshold==="0.5"} onChange={(e)=>setUiThreshold(e.target.value)} /> 0.5 m</label>
                  <label><input type="radio" name="dist" value="1"   checked={uiThreshold==="1"}   onChange={(e)=>setUiThreshold(e.target.value)} /> 1 m</label>
                </span>
              </div>
            )}

            <div className="actions">
              <button className="primary" onClick={handleStart}>Börja resan</button>
              <Link to="/" className="link-back italic-center">← Tillbaka till start</Link>
            </div>
          </>
        )}

        {quizStarted && walkMode && waitingForWalk && (
          <div style={{ margin: "8px 0 10px" }}>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ border: "1px solid rgba(255,255,255,.2)", borderRadius: 999, padding: "4px 10px", fontSize: 12, opacity: 0.95 }}>
                Förflyttning: {moved.toFixed(1)} / {(WALK_THRESHOLDS[uiThreshold] ?? 5)} m
              </span>
              {accuracy && <span style={{ border: "1px solid rgba(255,255,255,.2)", borderRadius: 999, padding: "4px 10px", fontSize: 12, opacity: 0.8 }}>
                ±{Math.round(accuracy)} m
              </span>}
              {error && <span style={{ color: "#f88", fontSize: 12 }}>Platsfel: {error}</span>}
            </div>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 8 }}>
              {IS_DEV && (
                <button className="quiz-button" type="button" onClick={() => { reset(); startDistance(WALK_THRESHOLDS[uiThreshold] ?? 5); simulate(1); }}>
                  +1 m (test)
                </button>
              )}
              <button className="quiz-button" type="button" onClick={() => { setWaitingForWalk(false); stopTracking(); }}>
                Avbryt steg
              </button>
              <button className="quiz-button" type="button" onClick={() => { setWaitingForWalk(false); stopTracking(); proceedToNextQuestion(); }}>
                Fortsätt utan att gå
              </button>
            </div>
          </div>
        )}

        {showingQuestion && (
          <div>
            <h2 className="mint-glow">Runda {currentRound}</h2>

            <div className="versus-bar" style={{ margin: "6px 0 12px", textAlign: "center", border: "1px solid rgba(255,255,255,.2)", borderRadius: 999, padding: "6px 12px", opacity: 0.95 }}>
              Ställning – Du: {score} • {botName}: {botScore}
              {!playerAnsweredAt && !botAnsweredAt && botThinking && (
                <span style={{ marginLeft: 10, fontStyle: "italic", opacity: 0.85 }}>
                  {botName} tänker{".".repeat(dots)}
                </span>
              )}
            </div>

            <p style={{ fontSize: "18px", marginBottom: "10px" }}>
              <strong>Fråga {currentQuestionIndex + 1}:</strong>{" "}
              {shuffledQuestions[currentQuestionIndex].text || shuffledQuestions[currentQuestionIndex].question || ""}
            </p>

            {isTextQuestion(shuffledQuestions[currentQuestionIndex]) ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Skriv ditt svar…"
                  className="answer-input"
                  disabled={showResult}
                  style={{ flex: 1, minWidth: 220 }}
                />
                <button type="button" onClick={() => textInput.trim() && handleAnswer(textInput)} disabled={showResult || !textInput.trim()} className="answer-btn">
                  Svara
                </button>
              </div>
            ) : (
              shuffledQuestions[currentQuestionIndex]?.options?.map((option, idx) => (
                <button key={idx} type="button" onClick={() => handleAnswer(option)} disabled={showResult} className={`answer-btn ${selectedAnswer === option ? "selected" : ""}`}>
                  {option}
                </button>
              ))
            )}

            <button className="back-link skip-btn" type="button" onClick={handleSkip}>
              Hoppa över →
            </button>

            {/* RESULT BLOCK: your result + bot's answer */}
            {showResult && (
              <div className="result">
                {/* Your result (only if "Visa rätt svar" is on) */}
                {showCorrect && (
                  <p style={{ color: isCorrect ? "green" : "red" }}>
                    {isCorrect
                      ? "Rätt!"
                      : `Fel. Rätt svar är: ${getCorrectAnswerText(shuffledQuestions[currentQuestionIndex])}`}
                  </p>
                )}

                {/* Bot result */}
                <div style={{ marginTop: 6, opacity: 0.95 }}>
                  {typeof botAnsweredAt === "number" ? (
                    <p>
                      <strong>{botName}</strong> svarade:{" "}
                      <em>{botAnswer && String(botAnswer).trim() ? botAnswer : "—"}</em>{" "}
                      <span style={{ color: botIsCorrect ? "green" : "red" }}>
                        {botIsCorrect ? "Rätt!" : "Fel"}
                      </span>
                      {!botIsCorrect && showCorrect && (
                        <> — Rätt svar: {getCorrectAnswerText(shuffledQuestions[currentQuestionIndex])}</>
                      )}
                    </p>
                  ) : (
                    <p style={{ fontStyle: "italic" }}>{botName} tänker…</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {showAffirmation && (
          <div className="affirmation">
            <h2 className="glow-text">Bra kämpat! Vill du fortsätta?</h2>
            {currentRound < rounds && (
              <button
                className="quiz-button"
                type="button"
                onClick={async () => {
                  const nextRound = currentRound + 1;
                  setCurrentRound(nextRound);
                  setCurrentQuestionIndex(0);
                  setShowAffirmation(false);
                  setScore(0);
                  setQuizFinished(false);
                  await loadNextRoundQuestions(nextRound);
                  setWaitingForWalk(false); stopTracking(); reset();
                  setBotScore(0); setBotAnswer(null); setBotIsCorrect(false);
                  resetPerQuestion();
                }}
              >
                Starta nästa runda
              </button>
            )}
            {currentRound >= rounds && (
              <div style={{ marginTop: 16 }}>
                <p className="completion-message">Alla rundor klara. Du klarade det. Tack för att du var med.</p>
                <Link to="/" className="link-back italic-center">← Tillbaka till start</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
