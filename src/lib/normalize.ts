import type { Area } from "@/lib/types";

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "your",
  "have",
  "been",
  "when",
  "after",
  "before",
  "error",
  "message",
]);

export function normalizeError(text: string): string {
  return text
    .toLowerCase()
    .replace(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
      " ",
    )
    .replace(/\b\d{8,}\b/g, " ")
    .replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, " ")
    .replace(/\b\d{4}-\d{2}-\d{2}[t ]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:z)?\b/gi, " ")
    .replace(/\b\d{2}[./]\d{2}[./]\d{4}\b/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9+/_:.\- ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function significantTokens(text: string): string[] {
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const raw of normalizeError(text).split(" ")) {
    if (!raw || STOP.has(raw)) continue;
    const keep =
      raw.length >= 4 ||
      /^\d{2,3}$/.test(raw) ||
      /^ea\d{3}$/.test(raw) ||
      /^[a-z]{2}\d{3}$/.test(raw);
    if (!keep || seen.has(raw)) continue;
    seen.add(raw);
    tokens.push(raw);
  }
  return tokens;
}

export function extractStatusCode(text: string): string | null {
  const ea = text.match(/\bEA\s?(\d{3})\b/i);
  if (ea) return `EA${ea[1]}`;
  const status = text.match(/\bstatus\s*[:\-]?\s*(\d{2})\b/i);
  if (status) return status[1];
  return null;
}

export function guessArea(text: string): Area {
  if (
    /\b(pkix|csrf|oauth|iflow|i-flow|sftp|keystore|cloud connector|integration suite|cpi|jsch|messagingsend|camel)\b/i.test(
      text,
    )
  ) {
    return "cpi";
  }
  return "idoc";
}

export function buildCommunityQuery(raw: string): string {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 8);
  const interesting = lines.filter((line) =>
    /error|exception|status|failed|fault|pkix|csrf|unauthorized|forbidden|ea\d{3}|idoc|handshake|namespace|auth fail/i.test(
      line,
    ),
  );
  const base = (interesting[0] || raw).slice(0, 240);
  return base
    .replace(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
      " ",
    )
    .replace(/\b\d{8,}\b/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\w\s./:+\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
}

export function splitSteps(text: string): string[] {
  return text
    .split(/\n+/)
    .map((line) => line.replace(/^\s*(?:\d+[\).\]]\s*|[-*]\s*)/, "").trim())
    .filter(Boolean);
}

export function titleFromError(text: string): string {
  const line =
    text
      .split(/\r?\n/)
      .map((part) => part.trim())
      .find((part) => part.length > 0) ?? "Untitled error";
  return line.slice(0, 140);
}
