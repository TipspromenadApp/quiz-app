const USER_QS_KEY = "user_questions_v2";

export function loadUserQuestions() {
  try {
    const v2 = JSON.parse(localStorage.getItem(USER_QS_KEY) || "[]");

    const old1 = JSON.parse(localStorage.getItem("custom_questions") || "[]");
    const old2 = JSON.parse(localStorage.getItem("customQuestions") || "[]");
    if (old1.length || old2.length) {
      const merged = dedupeByText([...v2, ...old1, ...old2]);
      localStorage.setItem(USER_QS_KEY, JSON.stringify(merged));
      localStorage.removeItem("custom_questions");
      localStorage.removeItem("customQuestions");
      return merged;
    }
    return v2;
  } catch {
    return [];
  }
}

export function saveUserQuestions(list) {
  localStorage.setItem(USER_QS_KEY, JSON.stringify(list || []));
}

export function clearUserQuestions() {
  localStorage.removeItem(USER_QS_KEY);
}

function dedupeByText(arr) {
  const norm = (s) => String(s || "").trim().toLowerCase();
  const seen = new Set();
  return (arr || []).filter((q) => {
    const k = norm(q?.text || q?.question);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
