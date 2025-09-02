
const PRIMARY_KEY = "userQuestions";
const LEGACY_KEYS = ["customQuestions", "myQuestions", "personalQuestions"];

function safeParse(json, fallback = []) {
  try {
    const x = JSON.parse(json);
    return Array.isArray(x) ? x : fallback;
  } catch {
    return fallback;
  }
}
function readKey(key) {
  return safeParse(localStorage.getItem(key) || "[]");
}
function writePrimary(list) {
  localStorage.setItem(PRIMARY_KEY, JSON.stringify(list));
}

function normalizeOne(q, idx) {
  const id = String(q.id ?? q.questionId ?? Date.now() + "_" + idx);
  const text = String(q.text ?? q.question ?? "").trim();
  const type = (q.type === "text" || q.type === "mcq")
    ? q.type
    : (q.options || q.answers || q.choices ? "mcq" : "text");

  let options =
    q.options ??
    q.answers ??
    q.choices ??
    (Array.isArray(q.incorrectAnswers)
      ? [q.correctAnswer, ...q.incorrectAnswers]
      : []);
  if (!Array.isArray(options)) options = [];
  options = options.map((o) => String(o ?? "").trim()).filter(Boolean);

  let correctAnswer = q.correctAnswer ?? q.correct ?? q.answer;
  if ((correctAnswer == null || correctAnswer === "") && Number.isInteger(q.correctIndex)) {
    const ci = Math.max(0, Math.min(q.correctIndex, options.length - 1));
    correctAnswer = options[ci] ?? "";
  }
  correctAnswer = String(correctAnswer ?? "").trim();

  const sampleAnswer = String(q.sampleAnswer ?? "").trim();

  const createdBy = q.createdBy ?? "user";
  const createdAt = q.createdAt ?? new Date().toISOString();

  const norm = { id, text, type, createdBy, createdAt };

  if (type === "mcq") {
    if (options.length < 2) {
      norm.type = "text";
      norm.sampleAnswer = correctAnswer || sampleAnswer || "";
    } else {
      norm.options = options;
      norm.correctAnswer = options.includes(correctAnswer) ? correctAnswer : options[0];
    }
  } else {
    if (sampleAnswer) norm.sampleAnswer = sampleAnswer;
  }
  return text ? norm : null;
}

function dedupeById(arr) {
  const seen = new Set();
  const out = [];
  for (const q of arr) {
    if (!q || !q.id) continue;
    if (seen.has(q.id)) continue;
    seen.add(q.id);
    out.push(q);
  }
  return out;
}

export function loadUserQuestions() {
  const primary = readKey(PRIMARY_KEY);
  const legacy = LEGACY_KEYS.flatMap(readKey);
  const merged = [...primary, ...legacy];
  const normalized = merged.map((q, i) => normalizeOne(q, i)).filter(Boolean);
  saveUserQuestions(normalized); 
  return normalized;
}

export function saveUserQuestions(list) {
  const clean = dedupeById(
    (Array.isArray(list) ? list : [])
      .map((q, i) => normalizeOne(q, i))
      .filter(Boolean)
  );
  writePrimary(clean);
  return clean;
}

export function addUserQuestion(q) {
  const current = loadUserQuestions();
  const normalized = normalizeOne(q, current.length);
  if (!normalized) return current;
  const next = [normalized, ...current];
  return saveUserQuestions(next);
}

export function clearUserQuestions() {
  localStorage.removeItem(PRIMARY_KEY);
  for (const k of LEGACY_KEYS) localStorage.removeItem(k);
}

export function getUserQuestionById(id) {
  const all = loadUserQuestions();
  return all.find((q) => q.id === id) || null;
}

export function updateUserQuestion(id, patch) {
  const all = loadUserQuestions();
  const idx = all.findIndex((q) => q.id === id);
  if (idx === -1) return all;
  const merged = { ...all[idx], ...patch, id };
  all[idx] = normalizeOne(merged, idx);
  return saveUserQuestions(all);
}

export function deleteUserQuestion(id) {
  const all = loadUserQuestions();
  const next = all.filter((q) => q.id !== id);
  return saveUserQuestions(next);
}
