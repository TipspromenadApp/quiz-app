
import { useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5249";

export function useServerBot({
  runKey,                    
  question,                  
  difficulty = "normal",     
  enable = true,
  onThinkingChange = () => {},
  onRevealed = () => {},
}) {
  const abortRef = useRef(null);
  const timeoutRef = useRef(null);

  const d = String(difficulty || "normal").toLowerCase();
  const MIN_LATENCY = { easy: 5000, normal: 3000, hard: 2000 }[d] ?? 3000;
  const HARD_TIMEOUT = MIN_LATENCY + 2000;

  const delay = (ms, signal) =>
    new Promise((res, rej) => {
      const id = setTimeout(res, ms);
      signal?.addEventListener("abort", () => {
        clearTimeout(id);
        rej(new DOMException("Aborted", "AbortError"));
      });
    });

  
  const localPick = (q) => {
    const opts = Array.isArray(q?.options) ? q.options : [];
    if (!opts.length) return { answerIndex: -1, isCorrect: false };
    const correctIndex =
      typeof q?.correctIndex === "number"
        ? q.correctIndex
        : opts.findIndex((o) => String(o) === String(q?.correctAnswer));
    const ACC = { easy: 0.2, normal: 0.7, hard: 0.9 }[d] ?? 0.7;
    const canBeCorrect = correctIndex >= 0;
    const willBeCorrect = canBeCorrect && Math.random() < ACC;

    if (willBeCorrect) return { answerIndex: correctIndex, isCorrect: true };

    const wrongs = opts.map((_, i) => i).filter((i) => i !== correctIndex);
    const idx = wrongs.length ? wrongs[Math.floor(Math.random() * wrongs.length)] : 0;
    return { answerIndex: idx, isCorrect: canBeCorrect ? idx === correctIndex : false };
  };

  useEffect(() => {
    if (!enable || !question || !runKey) return;

 
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    onThinkingChange(true);
    const startedAt = Date.now();
   
    timeoutRef.current = setTimeout(() => {
      if (controller.signal.aborted) return;
      
      const pick = localPick(question);
      onThinkingChange(false);
      onRevealed({ ...pick, revealedAt: Date.now() });
      controller.abort();
    }, HARD_TIMEOUT);

    (async () => {
      let best = null;
      try {
        
        const res = await fetch(`${API_BASE}/api/bot/move`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
 
  questionId: question.id ?? null,
  QuestionId: question.id ?? null,
  text: question.text ?? question.question ?? "",
  Text: question.text ?? question.question ?? "",
  question: question.text ?? question.question ?? "",
  Question: question.text ?? question.question ?? "",

 
  options: Array.isArray(question.options) ? question.options : [],
  Options: Array.isArray(question.options) ? question.options : [],

 
  difficulty: d,
  Difficulty: d,
  skill: d,
  Skill: d,
}),
});
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const answerIndex =
            typeof data.answerIndex === "number"
              ? data.answerIndex
              : typeof data.index === "number"
              ? data.index
              : typeof data.correctIndex === "number"
              ? data.correctIndex
              : -1;

          const opts = Array.isArray(question.options) ? question.options : [];
          const picked = answerIndex >= 0 ? opts[answerIndex] : undefined;
          const inferred =
            typeof question.correctAnswer === "string"
              ? picked === question.correctAnswer
              : false;

          best = {
            answerIndex,
            isCorrect:
              typeof data.isCorrect === "boolean"
                ? data.isCorrect
                : inferred,
          };
        } else {
          
          best = localPick(question);
        }
      } catch (e) {
        if (controller.signal.aborted) return;
        best = localPick(question);
      }

    
      const elapsed = Date.now() - startedAt;
      try {
        await delay(Math.max(0, MIN_LATENCY - elapsed), controller.signal);
      } catch {
        return; 
      }

      if (!controller.signal.aborted) {
        clearTimeout(timeoutRef.current);
        onThinkingChange(false);
        onRevealed({ ...best, revealedAt: Date.now() });
      }
    })();

    return () => {
      clearTimeout(timeoutRef.current);
      controller.abort();
      onThinkingChange(false);
    };
    
  }, [runKey, question?.id, d, enable]);
}
