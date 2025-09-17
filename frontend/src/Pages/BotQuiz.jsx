import React, { useEffect, useRef, useState } from "react";
import "./botquiz.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useGeoProgress } from "../hooks/useGeoProgress";
import { loadCustomQuestions } from "../utils/customQuestions";
import { loadUserQuestions } from "../lib/userQuestions";
import { useServerBot } from "../hooks/useServerBot";
import MapView from "../components/MapView";

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
  const cands = [
    q?.correctAnswer, q?.exampleAnswer, q?.expectedAnswer, q?.answer,
    q?.textAnswer, q?.freeTextAnswer, q?.answerText, q?.expected, q?.solution,
  ];
  for (const c of cands) if (typeof c === "string" && c.trim()) return c.trim();
  if (Array.isArray(q?.correctAnswer) && q.correctAnswer.length) {
    const first = q.correctAnswer.find((v) => typeof v === "string" && v.trim());
    if (first) return first.trim();
  }
  return "";
}
function kind(q) {
  const t = String(q?.type ?? q?.questionType ?? q?.kind ?? "").toLowerCase();
  if (["text","fritext","free","free-text","freetext"].includes(t)) return "text";
  if (["mcq","multiple","multiple-choice","alternativ","flervalsfråga","flervalsfraga"].includes(t)) return "mcq";
  if (Array.isArray(q?.options) && q.options.length >= 2) return "mcq";
  return getTextAnswer(q) ? "text" : "mcq";
}
const isTextQuestion = (q) => kind(q) === "text";
const isTextCorrect = (user, q) => {
  const single = getTextAnswer(q);
  const list = Array.isArray(q?.correctAnswer) ? q.correctAnswer : (single ? [single] : []);
  const u = normalizeText(user);
  return list.some((t) => normalizeText(t) === u);
};
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
      const k = kind(q);
      const text = String(q?.text ?? q?.question ?? q?.title ?? "").trim();
      const options = Array.isArray(q?.options) ? q.options.slice() : undefined;
      let correctAnswer;
      if (k === "text") {
        correctAnswer = getTextAnswer(q);
      } else {
        if (typeof q?.correctAnswer === "string") correctAnswer = q.correctAnswer;
        else if (options && typeof q?.correctIndex === "number") correctAnswer = options[q.correctIndex];
      }
      return {
        id: q?.id ?? q?.questionId ?? `custom-${idx}-${text.slice(0, 20)}`,
        text, type: k, options,
        correctAnswer: correctAnswer ?? "", correctIndex: q?.correctIndex,
      };
    })
    .filter((q) => q.text && (q.type === "text" ? !!q.correctAnswer : Array.isArray(q.options) && q.options.length >= 2));
}
const adaptApiQuestion = (q) => {
  const text = q?.text ?? q?.Text ?? "";
  const options = q?.options ?? q?.Options ?? [];
  let correctAnswer = q?.correctAnswer ?? q?.CorrectAnswer;
  if (!correctAnswer && Array.isArray(options) && typeof q?.correctIndex === "number") {
    correctAnswer = options[q.correctIndex] ?? "";
  }
  return { id: q?.id ?? crypto?.randomUUID?.() ?? text, text, type: "mcq", options, correctAnswer };
};

async function getWorkingGenUrlTemplate() {
  const key = "quiz_workingGenTemplate";
  const cached = localStorage.getItem(key);
  if (cached) return cached;

  const base = `${API_BASE}`.replace(/\/+$/, "");
  const probes = [
    "/api/QuestionGen/generate-by-round",
    "/api/questiongen/generate-by-round",
    "/api/QuestionGen/generateByRound",
    "/api/questiongen/generateByRound",
  ];

  for (const path of probes) {
    const url = `${base}${path}?round=1&count=1&salt=${Date.now()}`;
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
      if (res.ok) {
        localStorage.setItem(key, path);
        return path;
      }
    } catch {}
  }

  const fallback = "/api/QuestionGen/generate-by-round";
  localStorage.setItem(key, fallback);
  return fallback;
}

const textKey = (q) => (q?.text ?? "").trim().toLowerCase();
const uniqueByText = (arr) => {
  const seen = new Set(); const out = [];
  for (const q of arr) { const k = textKey(q); if (!k || seen.has(k)) continue; seen.add(k); out.push(q); }
  return out;
};
function mergeUnique(dst, add) {
  const seen = new Set(dst.map(textKey));
  for (const q of add || []) {
    const k = textKey(q);
    if (!k || seen.has(k)) continue;
    seen.add(k); dst.push(q);
  }
  return dst;
}
async function fetchAiRound(roundNumber, count) {
  const base = `${API_BASE}`.replace(/\/+$/, "");
  const path = await getWorkingGenUrlTemplate();
  const acc = [];
  for (let attempt = 0; attempt < 3 && acc.length < count; attempt++) {
    const salt = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const url = `${base}${path}?round=${encodeURIComponent(roundNumber)}&count=${encodeURIComponent(count)}&salt=${encodeURIComponent(salt)}`;
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store" });
      if (!res.ok) continue;
      const data = await res.json();
      const adapted = uniqueByText((Array.isArray(data) ? data : []).map(adaptApiQuestion));
      if (adapted.length) mergeUnique(acc, adapted);
    } catch {}
  }
  return acc.slice(0, count);
}
const ALLOWED_ROUNDS = [1, 2, 3, 4, 5];
const ALLOWED_QPR = [3, 6, 9, 10];
const clampToSet = (value, allowed, fallback) => allowed.includes(value) ? value : fallback;

function localBotPick(question, difficulty) {
  const q = question || {};
  const opts = Array.isArray(q.options) ? q.options : [];
  if (!opts.length) return { answerText: "", isCorrect: false };

  const correctText = getCorrectAnswerText(q);
  const correctIndex = typeof q.correctIndex === "number"
    ? q.correctIndex
    : opts.findIndex(o => String(o) === String(correctText));

  const ACC_TABLE = { easy: 0.30, normal: 0.85, hard: 0.95 };
  const ACC = ACC_TABLE[String(difficulty).toLowerCase()] ?? 0.85;

  const canBeCorrect = correctIndex >= 0;
  const willBeCorrect = canBeCorrect && Math.random() < ACC;

  if (willBeCorrect) return { answerText: opts[correctIndex], isCorrect: true };

  const wrongs = opts.map((_, i) => i).filter((i) => i !== correctIndex);
  const idx = wrongs.length ? wrongs[Math.floor(Math.random() * wrongs.length)] : 0;
  return { answerText: opts[idx] ?? "", isCorrect: canBeCorrect ? idx === correctIndex : false };
}
export default function BotQuiz() {
  const navigate = useNavigate();
  const reactLocation = useLocation();
  const navState = reactLocation?.state || {};
  const botName = navState.botName || localStorage.getItem("pref_bot_name") || "Bot Jonas";

  const [quizStarted, setQuizStarted] = useState(false);
  const [rounds, setRounds] = useState(() => clampToSet(Number(localStorage.getItem("pref_rounds") || 5), ALLOWED_ROUNDS, 5));
  const [questionsPerRound, setQuestionsPerRound] = useState(() => clampToSet(Number(localStorage.getItem("pref_perRound") || 10), ALLOWED_QPR, 10));

  const [currentRound, setCurrentRound] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showAffirmation, setShowAffirmation] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [allAnswers, setAllAnswers] = useState([]);
  const [textInput, setTextInput] = useState("");

  const [botAllAnswers, setBotAllAnswers] = useState([]);
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

  const [difficulty, setDifficulty] = useState(() => navState.difficulty || localStorage.getItem("pref_bot_difficulty") || "normal");
  useEffect(() => { localStorage.setItem("pref_bot_difficulty", difficulty); }, [difficulty]);

  const [botSpeed, setBotSpeed] = useState(() => localStorage.getItem("pref_botSpeed") || "normal");
  useEffect(() => { localStorage.setItem("pref_botSpeed", botSpeed); }, [botSpeed]);

  const stored = (localStorage.getItem("pref_quizSource") || "ai-simple").trim();
  const initialSource = (stored === "personal" || stored === "ai-simple") ? stored : "ai-simple";
  const [quizSource, setQuizSource] = useState(initialSource);
  useEffect(() => {
    const safe = (quizSource === "personal" || quizSource === "ai-simple") ? quizSource : "ai-simple";
    localStorage.setItem("pref_quizSource", safe);
    if (safe !== quizSource) setQuizSource(safe);
  }, [quizSource]);

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
  const [uiThreshold, setUiThreshold] = useState(() => {
    const v = localStorage.getItem("pref_walkThreshold") ?? "10";
    return v === "5" || v === "10" ? v : "10";
  });

  // Geo
  const { moved, totalMoved, ready, accuracy, error, distanceToTarget, position, startDistance, stopTracking, reset, simulate, forceGetCurrent, mode } = useGeoProgress();
  const [roundOffset, setRoundOffset] = useState(0);
  const gateBaselineRef = useRef(0);
  const [waitingForWalk, setWaitingForWalk] = useState(false);

  function proceedToNextQuestion() { setCurrentQuestionIndex((p) => p + 1); }
  function gateNextQuestion() {
    if (!walkMode) { proceedToNextQuestion(); return; }
    setWaitingForWalk(true);
    const target = (uiThreshold === "5" ? 5 : 10);
    gateBaselineRef.current = totalMoved || 0;
    startDistance(target);
    forceGetCurrent();
  }
  useEffect(() => {
    if (!waitingForWalk) return;
    const target = (uiThreshold === "5" ? 5 : 10);
    const baseline = gateBaselineRef.current ?? 0;
    const progressed = Math.max(0, (totalMoved ?? 0) - baseline);
    if (progressed >= target) {
      stopTracking();
      setWaitingForWalk(false);
      proceedToNextQuestion();
    }
  }, [waitingForWalk, totalMoved, uiThreshold, stopTracking]);
  useEffect(() => () => { stopTracking(); }, [stopTracking]);

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
      return normalizeCustomQuestions([
        ...(Array.isArray(fromHook) ? fromHook : []),
        ...(Array.isArray(fromUtil) ? fromUtil : []),
        ...(Array.isArray(fromLS) ? fromLS : []),
      ]);
    }
    return [];
  }
  async function buildPool(roundNumber, count) {
    if (quizSource === "ai-simple") {
      const ai = await fetchAiRound(roundNumber, count);
      return (ai || []).map(adaptApiQuestion).map(prepareQuestion).slice(0, count);
    }
    const raw = getRoundSource(roundNumber);
    return (Array.isArray(raw) ? raw : []).map(prepareQuestion);
  }

  const handleStart = async () => {
    const safeRounds = clampToSet(rounds, ALLOWED_ROUNDS, 5);
    const safeQpr = clampToSet(questionsPerRound, ALLOWED_QPR, 10);
    if (safeRounds !== rounds) setRounds(safeRounds);
    if (safeQpr !== questionsPerRound) setQuestionsPerRound(safeQpr);

    const initialRaw = await buildPool(1, safeQpr);
    if (quizSource === "personal" && initialRaw.length === 0) {
      alert('Du har inga egna frågor ännu. Lägg till dem under “Skapa ny fråga”.');
      navigate("/questions/new"); return;
    }
    const initial = shuffleArray(initialRaw).slice(0, safeQpr);
    setShuffledQuestions(initial);
    setQuizStarted(true);
    setCurrentRound(1);
    setCurrentQuestionIndex(0);
    setShowAffirmation(false);
    setScore(0);
    setUserAnswers([]); setAllAnswers([]);
    setWaitingForWalk(false); stopTracking(); reset();
    setRoundOffset(totalMoved);
    setBotScore(0); setBotAnswer(null); setBotIsCorrect(false); setBotAllAnswers([]);
    navigatedRef.current = false;
    resetPerQuestion();
  };

  const resetPerQuestion = () => {
    setSelectedAnswer(null); setShowResult(false); setIsCorrect(false); setTextInput("");
    setBotAnswer(null); setBotIsCorrect(false);
    setPlayerAnsweredAt(null); playerAnsweredAtRef.current = null;
    setBotAnsweredAt(null);    botAnsweredAtRef.current = null;
    setPendingRecord(null);
    finalizedRef.current = false;
  };
  const [dots, setDots] = useState(1);
  useEffect(() => {
    if (!botThinking) { setDots(1); return; }
    const t = setInterval(() => setDots((d) => (d % 3) + 1), 400);
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

  const showingQuestion =
    !!quizStarted && !showAffirmation &&
    shuffledQuestions.length > 0 &&
    (!walkMode || !waitingForWalk);

  const currentQuestion = showingQuestion ? shuffledQuestions[currentQuestionIndex] : null;
  const runKey = currentQuestion ? `${quizSource}:${difficulty}:${currentRound}:${currentQuestionIndex}:${currentQuestion.id}` : null;

  useServerBot({
    runKey,
    question: currentQuestion,
    difficulty,
    enable: !!currentQuestion && showingQuestion,
    onThinkingChange: (v) => setBotThinking(prev => v || prev),
    onRevealed: (payload) => {
      const q = currentQuestion; if (!q) return;
      const { answerIndex, answerText } = (payload || {});
      const correctText = getCorrectAnswerText(q);
      let pickedText =
        typeof answerText === "string" && answerText.trim()
          ? answerText
          : (!isTextQuestion(q) && typeof answerIndex === "number" && Array.isArray(q.options)
              ? q.options[answerIndex] ?? null
              : null);

      const finalIsCorrect = isTextQuestion(q)
        ? (pickedText ? isTextCorrect(pickedText, q) : false)
        : (pickedText != null && correctText != null && pickedText === correctText);

      const SMARTNESS_BONUS = { easy: 0.25, normal: 0.35, hard: 0.40 };
      let adjustedIsCorrect = finalIsCorrect;
      if (!finalIsCorrect) {
        const bonus = SMARTNESS_BONUS[difficulty] ?? 0.3;
        if (Math.random() < bonus && typeof correctText === "string" && correctText.trim()) {
          adjustedIsCorrect = true;
          pickedText = correctText;
        }
      }

      setBotThinking(true);
      const delay = nextDelayMs();
      setTimeout(() => {
        if (botAnsweredAtRef.current != null) return;
        setBotAnswer(pickedText ?? "");
        setBotIsCorrect(adjustedIsCorrect);
        const ts = Date.now();
        setBotAnsweredAt(ts);
        if (playerAnsweredAtRef.current == null) submitTimeoutLoss(q, ts);
        setBotThinking(false);
      }, delay);
    },
  });

  const autoTimerRef = useRef(null);
  useEffect(() => {
    if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; }
    if (!currentQuestion) return;

    setBotThinking(true);

    const GRACE_MS = 2200;
    autoTimerRef.current = setTimeout(() => {
      if (botAnsweredAtRef.current != null) return;
      const { answerText, isCorrect } = localBotPick(currentQuestion, difficulty);
      const extra = nextDelayMs();
      setTimeout(() => {
        if (botAnsweredAtRef.current != null) return;
        setBotAnswer(answerText ?? "");
        setBotIsCorrect(!!isCorrect);
        const ts = Date.now();
        setBotAnsweredAt(ts);
        if (playerAnsweredAtRef.current == null) submitTimeoutLoss(currentQuestion, ts);
        setBotThinking(false);
      }, extra);
    }, GRACE_MS);

    return () => {
      if (autoTimerRef.current) {
        clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
      setBotThinking(false);
    };
  }, [runKey, currentQuestion, difficulty, botSpeed]);

  useEffect(() => {
    if (!currentQuestion) return;
    if (playerAnsweredAt == null || botAnsweredAtRef.current != null) return;
    const watchdog = setTimeout(() => {
      if (botAnsweredAtRef.current != null) return;
      const { answerText, isCorrect } = localBotPick(currentQuestion, difficulty);
      setBotAnswer(answerText ?? "");
      setBotIsCorrect(!!isCorrect);
      const ts = Date.now();
      setBotAnsweredAt(ts);
      setBotThinking(false);
    }, 3500);
    return () => clearTimeout(watchdog);
  }, [playerAnsweredAt, currentQuestion, difficulty]);

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

   
    const pAt = playerAnsweredAtRef.current ?? playerAnsweredAt;
    const bAt = botAnsweredAtRef.current ?? botAnsweredAt;

    let playerFirst = false;
    let botFirst = false;
    if (pAt != null && bAt != null) {
      playerFirst = pAt <= bAt;   
      botFirst = bAt < pAt;
    } else if (pAt != null) {
      playerFirst = true;
    } else if (bAt != null) {
      botFirst = true;
    }

    const userCorrect = pendingRecord.isCorrect;
    const botCorrect  = botIsCorrectRef.current;

    let awardUser = userCorrect;
    let awardBot  = botCorrect;

    if (playerFirst && bAt != null) awardBot = false;
    if (botFirst && pAt != null)     awardUser = false;

    let nextUserScoreVal = 0;
    let nextBotScoreVal  = 0;

    setScore((s) => { nextUserScoreVal = s + (awardUser ? 1 : 0); return nextUserScoreVal; });
    setBotScore((s) => { nextBotScoreVal  = s + (awardBot ? 1 : 0); return nextBotScoreVal; });

    const finalRecord = {
      ...pendingRecord,
      botAnswer: typeof botAnswer === "string" ? botAnswer : (botAnswer ?? ""),
      botIsCorrect: awardBot,
    };

    const correctAnswerText = getCorrectAnswerText(q);
    const textMode = isTextQuestion(q);
    const botRecord = {
      round: currentRound,
      questionId: q.id,
      question: q.text ?? q.question ?? "",
      selectedAnswer: textMode ? null : (botAnswer ?? null),
      userAnswer: textMode ? (botAnswer ?? "") : null,
      correctAnswer: correctAnswerText,
      isCorrect: awardBot,
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
        if (!walkMode) setCurrentQuestionIndex((p) => p + 1);
        else {
          setBotThinking(false);
          gateNextQuestion();
        }
        return;
      }
      const roundScore = answersThisRound.filter(a => a.isCorrect).length;
      const botAnswersThisRound = nextBotAnswers.slice(-questionsPerRound);
      const botRoundScore = botAnswersThisRound.filter(a => a.isCorrect).length;

      await saveRoundResult(
        roundNumber,
        roundScore,
        questionsPerRound,
        answersThisRound,
        { mode: "bot", botName: botName || "Bot Jonas", botScore: botRoundScore }
      );

      const updatedAll = [...allAnswers, ...answersThisRound];
      const updatedBotAll = [...botAllAnswers, botRecord];
      setAllAnswers(updatedAll);
      setBotAllAnswers(updatedBotAll);

      const playerTotal = updatedAll.filter((a) => a.isCorrect).length;
      const finalPayload = {
        answers: updatedAll,
        totalQuestions: updatedAll.length,
        score: playerTotal,
        gameMode: "bot",
        botName: botName || "Bot Jonas",
        botScore: nextBotScoreVal,
        botAnswers: updatedBotAll,
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

      if (isLastRound) {
        if (!navigatedRef.current) {
          navigatedRef.current = true;
          navigate("/final-result", { state: finalPayload });
        }
      } else {
        setShowAffirmation(true);
        setUserAnswers([]);
        setCurrentQuestionIndex(0);
        await loadNextRoundQuestions(currentRound + 1);
        resetPerQuestion();
        setBotScore(0); setBotAnswer(null); setBotIsCorrect(false);
      }
    }, 700);
  }, [pendingRecord, playerAnsweredAt, botAnsweredAt]);

  async function loadNextRoundQuestions(nextRound) {
    const pool = await buildPool(nextRound, questionsPerRound);
    const next = shuffleArray(pool).slice(0, questionsPerRound);
    setShuffledQuestions(next);
    resetPerQuestion();
    setRoundOffset(totalMoved);
    setWaitingForWalk(false); stopTracking(); reset();
  }

  const handleSkip = () => {
    const isLastQuestion = currentQuestionIndex >= shuffledQuestions.length - 1;
    if (!isLastQuestion) { resetPerQuestion(); setCurrentQuestionIndex((prev) => prev + 1); return; }
    setShowAffirmation(true);
  };

  function getUserNameFromStorage() {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null") || {};
      const picks = [u.username, u.userName, u.displayName, u.name, u.email, localStorage.getItem("username"), localStorage.getItem("userName"), localStorage.getItem("email")];
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
  async function saveRoundResult(roundNumber, roundScore, questionCount, answers, extra) {
    try {
      const UserName = getUserNameFromStorage();
      if (!UserName) return;
      const Answers = (answers || []).map((a) => ({
        Round: typeof a.round === "number" ? a.round : roundNumber,
        QuestionId: String(a.questionId ?? a.id ?? ""),
        Question: String(a.question ?? a.text ?? ""),
        SelectedAnswer: a.selectedAnswer != null ? String(a.selectedAnswer) : "",
        UserAnswer: a.userAnswer != null ? String(a.userAnswer) : "",
        CorrectAnswer: a.correctAnswer != null ? String(a.correctAnswer) : "",
        IsCorrect: !!a.isCorrect,
        Type: a.type ?? "mcq",
      }));
      const req = {
        UserName,
        RoundNumber: roundNumber,
        TotalQuestions: questionCount,
        Score: roundScore,
        GameMode: extra?.mode ?? "solo",
        BotName: extra?.botName ?? null,
        BotScore: extra?.botScore ?? null,
        DateTaken: new Date().toISOString(),
        Answers
      };
      console.log("POST /api/QuizResult", req);

      const res = await fetch(`${API_BASE}/api/QuizResult`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      console.error("Error saving round:", err);
    }
  }

  const roundMovedDisplay = Math.max(0, (totalMoved ?? 0) - (roundOffset ?? 0));
  const baseline = gateBaselineRef.current ?? 0;
  const movedThisQuestion = Math.max(0, (totalMoved ?? 0) - baseline);
  const gateTarget = uiThreshold === "5" ? 5 : 10;

  return (
    <div className="bot-page">
      
      <div className="bot-bg is-visible" aria-hidden="true" />
      <audio src="/sounds/sea.mp3" loop preload="auto" playsInline />
     
      <div className="bot-shell">
        <div className="frosty-container" style={{ width: "min(100%, 760px)", margin: "0 auto", padding: 16 }}>
          <h1 className="title" style={{ fontSize: "clamp(20px, 3.8vw, 28px)" }}>
            Spela med <span className="bot-name">{botName}</span>
          </h1>

          {!quizStarted && (
            <>
              <p className="subtitle" style={{ fontSize: "clamp(14px, 3.4vw, 18px)" }}>
                Välj inställningar och börja din match. En vänlig match väntar – lugn, trygg och alltid med ett leende från {botName}.
              </p>

              <div className="compact-row two-groups" style={{ gap: 12, flexWrap: "wrap" }}>
                <fieldset className="inline-setting no-border" style={{ minWidth: 260 }}>
                  <legend className="mini-legend">Frågebank</legend>
                  <label className="radio-inline">
                    <input type="radio" name="quizSource" value="personal" checked={quizSource === "personal"} onChange={() => setQuizSource("personal")} />
                    Egna frågor
                  </label>
                  <label className="radio-inline" style={{ marginLeft: 12 }}>
                    <input type="radio" name="quizSource" value="ai-simple" checked={quizSource === "ai-simple"} onChange={() => setQuizSource("ai-simple")} />
                    AI–frågor 
                  </label>
                </fieldset>

                <fieldset className="inline-setting no-border" style={{ minWidth: 260 }}>
                  <legend className="mini-legend">Alternativ</legend>
                  <label className="radio-inline">
                    <input type="checkbox" className="round-check" checked={showCorrect} onChange={(e) => setShowCorrect(e.target.checked)} />
                    Visa rätt svar
                  </label>
                  <label className="radio-inline" style={{ marginLeft: 12 }}>
                    <input type="checkbox" className="round-check" checked={walkMode} onChange={(e) => setWalkMode(e.target.checked)} />
                    Walk Mode
                  </label>
                </fieldset>
              </div>

              <div className="compact-row selects-line" style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center", flexWrap: "wrap", padding: "10px 12px", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 16, background: "rgba(255,255,255,0.06)", backdropFilter: "blur(2px)" }}>
                <label className="compact-field" style={{ whiteSpace: "nowrap" }}>
                  Svårighet:&nbsp;
                  <select className="tiny-select pill-select" value={difficulty} onChange={(e)=>setDifficulty(e.target.value)}>
                    <option value="easy">Lätt</option>
                    <option value="normal">Normal</option>
                    <option value="hard">Svår</option>
                  </select>
                </label>
                <label className="compact-field" style={{ whiteSpace: "nowrap" }}>
                  Bot-hastighet:&nbsp;
                  <select className="tiny-select pill-select" value={botSpeed} onChange={(e)=>setBotSpeed(e.target.value)}>
                    <option value="slow">Långsam</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Snabb</option>
                  </select>
                </label>
                <label className="compact-field" style={{ whiteSpace: "nowrap" }}>
                  Rundor:&nbsp;
                  <select className="tiny-select pill-select" value={rounds} onChange={(e)=>setRounds(clampToSet(Number(e.target.value), ALLOWED_ROUNDS, 5))}>
                    {ALLOWED_ROUNDS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
                <label className="compact-field" style={{ whiteSpace: "nowrap" }}>
                  Frågor/runda:&nbsp;
                  <select className="tiny-select pill-select" value={questionsPerRound} onChange={(e)=>setQuestionsPerRound(clampToSet(Number(e.target.value), ALLOWED_QPR, 10))}>
                    {ALLOWED_QPR.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
              </div>

              <div className="actions" style={{ gap: 10 }}>
                <button className="primary" onClick={handleStart}>Börja resan</button>
                <Link to="/" className="link-back italic-center">← Tillbaka till start</Link>
              </div>
            </>
          )}

          {quizStarted && walkMode && waitingForWalk && (
            <div style={{ margin: "8px 0 10px" }}>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ border: "1px solid rgba(255,255,255,.2)", borderRadius: 999, padding: "4px 10px", fontSize: 12, opacity: 0.95 }}>
                  Runda: {roundMovedDisplay.toFixed(1)} m
                </span>
                <span style={{ border: "1px solid rgba(255,255,255,.2)", borderRadius: 999, padding: "4px 10px", fontSize: 12, opacity: 0.95 }}>
                  Denna fråga: {movedThisQuestion.toFixed(1)} / {gateTarget} m
                </span>
                {accuracy != null && (
                  <span style={{ border: "1px solid rgba(255,255,255,.2)", borderRadius: 999, padding: "4px 10px", fontSize: 12, opacity: 0.8 }}>
                    ±{Math.round(accuracy)} m
                  </span>
                )}
                {error && <span style={{ color: "#f88", fontSize: 12 }}>Platsfel: {error}</span>}
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", alignItems: "center", marginTop: 10 }}>
                <button className="quiz-button" type="button" onClick={() => { setWaitingForWalk(false); stopTracking(); }}>
                  Avbryt steg
                </button>
                <button className="quiz-button" type="button" onClick={() => { setWaitingForWalk(false); stopTracking(); proceedToNextQuestion(); }}>
                  Fortsätt utan att gå
                </button>
              </div>
              <MapView current={position} target={null} distance={distanceToTarget} moved={movedThisQuestion} totalMoved={totalMoved} accuracy={accuracy} mode={mode} targetMeters={gateTarget} />
            </div>
          )}

          {showingQuestion && (
            <div>
              <h2 className="mint-glow" style={{ fontSize: "clamp(18px, 3.6vw, 24px)" }}>Runda {currentRound}</h2>

              <div className="versus-bar" style={{ margin: "6px 0 12px", textAlign: "center", border: "1px solid rgba(255,255,255,.2)", borderRadius: 999, padding: "6px 12px", opacity: 0.95, fontSize: "clamp(12px, 3.2vw, 16px)" }}>
                Ställning – Du: {score} • {botName}: {botScore}
                {botThinking && botAnsweredAt == null && (
                  <span style={{ marginLeft: 10, fontStyle: "italic", opacity: 0.85 }}>
                    {botName} tänker{".".repeat(dots)}
                  </span>
                )}
              </div>

              <p style={{ fontSize: "clamp(14px, 3.4vw, 18px)", marginBottom: "10px" }}>
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
                    style={{ flex: 1, minWidth: 180, maxWidth: "100%" }}
                  />
                  <button type="button" onClick={() => textInput.trim() && handleAnswer(textInput)} disabled={showResult || !textInput.trim()} className="answer-btn">
                    Svara
                  </button>
                </div>
              ) : (
                (shuffledQuestions[currentQuestionIndex]?.options || []).map((option, idx) => (
                  <button key={idx} type="button" onClick={() => handleAnswer(option)} disabled={showResult} className={`answer-btn ${selectedAnswer === option ? "selected" : ""}`}>
                    {option}
                  </button>
                ))
              )}

              <button className="back-link skip-btn" type="button" onClick={handleSkip}>
                Hoppa över →
              </button>

              {showResult && (
                <div className="result">
                  {showCorrect && (
                    <p style={{ color: isCorrect ? "green" : "red" }}>
                      {isCorrect ? "Rätt!" : `Fel. Rätt svar är: ${getCorrectAnswerText(shuffledQuestions[currentQuestionIndex])}`}
                    </p>
                  )}
                  <div style={{ marginTop: 6, opacity: 0.95 }}>
                    {typeof botAnsweredAt === "number" ? (
                      <p>
                        <strong>{botName}</strong> svarade:{" "}
                        <em>{botAnswer && String(botAnswer).trim() ? botAnswer : "—"}</em>{" "}
                        <span style={{ color: botIsCorrect ? "green" : "red" }}>
                          {botIsCorrect ? "Rätt!" : "Fel"}
                        </span>
                        {!botIsCorrect && showCorrect && (<> — Rätt svar: {getCorrectAnswerText(shuffledQuestions[currentQuestionIndex])}</>)}
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
              <h2 className="glow-text" style={{ fontSize: "clamp(16px, 3.6vw, 22px)" }}>
                {[
                  "Även de minsta stegen framåt är en del av en vacker resa. Fortsätt – du gör det bättre än du tror.",
                  "Ditt ljus är unikt, och världen är bättre för att du finns. Var inte rädd att lysa.",
                  "Du är starkare än du tror, modigare än du känner och mer älskad än du vet. Idag är en ny sida, och du håller pennan.",
                  "Frid börjar inom dig. Andas djupt – du är trygg, du är kapabel och du växer varje dag.",
                  "Det finns en stilla styrka i att välja att börja om. Idag bär på varsamma nya början.",
                ][Math.floor(Math.random() * 5)]}
              </h2>
              {currentRound < rounds && (
                <button className="quiz-button" type="button" onClick={async () => {
                  const nextRound = currentRound + 1;
                  setCurrentRound(nextRound);
                  setCurrentQuestionIndex(0);
                  setShowAffirmation(false);
                  setScore(0);
                  await loadNextRoundQuestions(nextRound);
                  setBotScore(0); setBotAnswer(null); setBotIsCorrect(false);
                  resetPerQuestion();
                }}>
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
    </div>
  );
}
