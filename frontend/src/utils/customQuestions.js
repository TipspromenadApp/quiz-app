export function loadCustomQuestions() {
  try {
    const raw = localStorage.getItem("customQuestions");
    const arr = JSON.parse(raw || "[]");
   
    return Array.isArray(arr) ? arr.map(q => ({ type: "mcq", ...q })) : [];
  } catch {
    return [];
  }
}
