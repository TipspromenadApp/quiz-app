import { useEffect, useMemo, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5249";


const BOT_MOVE_PATHS = ["/api/bot/move", "/api/Bot/move"];

const clampDiff = (d) => {
  const v = String(d || "normal").toLowerCase();
  return v === "easy" || v === "hard" ? v : "normal";
};
const arrayOfStrings = (maybe) =>
  Array.isArray(maybe) ? maybe.map((x) => String(x ?? "")).filter(Boolean) : [];

function delay(ms, signal) {
  return new Promise((res, rej) => {
    const id = setTimeout(res, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(id);
      rej(new DOMException("Aborted", "AbortError"));
    });
  });
}

const BAN_KEY_UNTIL = "bot_move_disabled_until";
function isBanned() {
  const until = Number(localStorage.getItem(BAN_KEY_UNTIL) || 0);
  return Date.now() < until;
}
function banNow(hours = 12) {
  localStorage.setItem(BAN_KEY_UNTIL, String(Date.now() + hours * 3600 * 1000));
}


async function tryServerMove(question, diff, signal) {
  const correctText =
    typeof question?.correctAnswer === "string" && question.correctAnswer.trim()
      ? question.correctAnswer
      : (Array.isArray(question?.options) && typeof question?.correctIndex === "number"
          ? (question.options[question.correctIndex] ?? "")
          : "");

  const body = {
    questionId: String(question?.id ?? ""),
    options: arrayOfStrings(question?.options),
    difficulty: String(diff || "normal"),
    correctAnswer: String(correctText || ""),
  };

  const base = `${API_BASE}`.replace(/\/+$/, "");
  for (const path of BOT_MOVE_PATHS) {
    const url = `${base}${path}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
        signal,
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        const answerIndex =
          typeof data.answerIndex === "number" ? data.answerIndex :
          typeof data.Index === "number" ? data.Index : -1;
        const isCorrect =
          typeof data.isCorrect === "boolean" ? data.isCorrect : undefined;
        const answerText =
          typeof data.answerText === "string" ? data.answerText : undefined;
        return { answerIndex, isCorrect, answerText };
      }
      if (res.status === 400) { banNow(12); return null; }
    } catch (err) {
      if (err?.name === "AbortError") return null;
      
    }
  }
  return null;
}

function localPick(q, diff) {
  const opts = Array.isArray(q?.options) ? q.options : [];
  if (!opts.length) return { answerIndex: -1, isCorrect: false, answerText: "" };

  const correctIndex =
    typeof q?.correctIndex === "number"
      ? q.correctIndex
      : opts.findIndex((o) => String(o) === String(q?.correctAnswer));

  const ACC = { easy: 0.30, normal: 0.85, hard: 0.95 }[diff] ?? 0.85;
  const canBeCorrect = correctIndex >= 0;
  const willBeCorrect = canBeCorrect && Math.random() < ACC;

  if (willBeCorrect)
    return { answerIndex: correctIndex, isCorrect: true, answerText: opts[correctIndex] };

  const wrongs = opts.map((_, i) => i).filter((i) => i !== correctIndex);
  const idx = wrongs.length ? wrongs[Math.floor(Math.random() * wrongs.length)] : 0;
  return {
    answerIndex: idx,
    isCorrect: canBeCorrect ? idx === correctIndex : false,
    answerText: opts[idx] ?? ""
  };
}

export function useServerBot({
  runKey,
  question,
  difficulty = "normal",
  enable = true,
  onThinkingChange = () => {},
  onRevealed = () => {},
}) {
  const diff = clampDiff(difficulty);
  const MIN_LATENCY = { easy: 1800, normal: 2400, hard: 1800 }[diff] ?? 2200;

  const abortRef = useRef(null);
  const lastKeyRef = useRef(null);

  const wireQ = useMemo(() => {
    if (!question || typeof question !== "object") return null;
    const text = String(question.text ?? question.question ?? "").trim();
    const options = arrayOfStrings(question.options);
    const id = String((question.id ?? text) || "q");
    return {
      id,
      text,
      options,
      correctAnswer: question.correctAnswer,
      correctIndex: question.correctIndex,
    };
  }, [question]);

  useEffect(() => {
    if (!enable || !runKey || !wireQ) return;
    if (lastKeyRef.current === runKey) return;
    lastKeyRef.current = runKey;

    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    const started = Date.now();
    onThinkingChange(true); 

    (async () => {
      let best = null;

      if (!isBanned() && wireQ.options && wireQ.options.length > 0) {
        best = await tryServerMove(wireQ, diff, controller.signal);
      }
      if (!best) best = localPick(wireQ, diff);

      const elapsed = Date.now() - started;
      try {
        await delay(Math.max(0, MIN_LATENCY - elapsed), controller.signal);
      } catch {
        return; 
      }

      if (!controller.signal.aborted) {
       
        onRevealed({ ...best, revealedAt: Date.now() });
      }
    })();

    return () => {
      controller.abort();
   
      onThinkingChange(false);
    };
  }, [enable, runKey, wireQ, diff, onThinkingChange, onRevealed]);
}

export default useServerBot;
