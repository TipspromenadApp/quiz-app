const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5249";

export async function askBot({ text, options = [], difficulty = "normal", signal }) {
  const endpoints = [
    `${API_BASE}/api/Bot/Think`,
    `${API_BASE}/api/bot/think`,
  ];
  let lastErr = null;
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, options, difficulty }),
        signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} @ ${url}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("No bot endpoints responded");
}
