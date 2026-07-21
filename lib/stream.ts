// Extract the text delta from one upstream line. Handles: SSE "data:" frames,
// NDJSON token objects ({content|delta|...}), a full JSON reply, control frames
// (no text field -> ""), and raw text tokens.
export function parseDelta(line: string): string {
  const s = line.trim();
  if (!s) return "";
  const payload = s.startsWith("data:") ? s.slice(5).trim() : s;
  if (!payload || payload === "[DONE]") return "";
  try {
    const o = JSON.parse(payload);
    const d = Array.isArray(o) ? o[0] : o;
    const v = d?.content ?? d?.delta ?? d?.output ?? d?.text ?? d?.message ?? d?.reply;
    return typeof v === "string" ? v : "";
  } catch {
    return payload;
  }
}