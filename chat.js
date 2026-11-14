// Vercel serverless function. Set ANTHROPIC_API_KEY in Vercel > Settings > Environment Variables.
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).end();
  const { messages = [], lang = "en-IN" } = req.body || {};
  const system = "You are AURA, a friendly voice assistant. Reply in 1-3 short spoken sentences, no markdown, no lists. " +
    (lang === "hi-IN" ? "Reply in Hindi (Devanagari script)." : "Reply in English; if the user writes Hinglish, reply in simple Hinglish.");
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.CLAUDE_MODEL || "claude-haiku-5-5", max_tokens: 300, system, messages: messages.slice(-12) })
    });
    const d = await r.json();
    res.status(200).json({ reply: (d.content || []).map(c => c.text || "").join("").trim() });
  } catch (e) { res.status(500).json({ reply: "" }); }
}
