const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5249";

export function getDifficultyForRound(roundNumber) {
  if (roundNumber <= 1) return "lätt";
  if (roundNumber === 2) return "medel";
  return "svår";
}

export async function fetchGeneratedQuestions({ topic = "natur", count = 10, difficulty = "lätt" }) {
  const params = new URLSearchParams({
    topic,
    difficulty,
    count: String(count),
    provider: "mock"
  });
  const res = await fetch(`${API_BASE}/api/questions/generate?${params.toString()}`);
  if (!res.ok) throw new Error(`Generate failed: ${res.status}`);
  return await res.json();
}

export async function buildRoundQuestions({
  human = [],
  apiCount = 0,
  topic = "natur",
  difficulty = "lätt",
  totalCount = 10
}) {
  const takeFromHuman = Math.max(0, Math.min(human.length, totalCount - apiCount));
  const selectedHuman = shuffle(human).slice(0, takeFromHuman);

  let generated = [];
  if (apiCount > 0) {
    generated = await fetchGeneratedQuestions({ topic, count: apiCount, difficulty });
  }

  const combined = shuffle([...selectedHuman, ...generated]);
  return combined.slice(0, totalCount);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
