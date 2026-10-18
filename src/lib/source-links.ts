import type { SourceLink } from "@/lib/types";

// A deep Investigate pass includes page excerpts. Cutting the JSON to a few
// thousand characters makes JSON.parse fail and drops every link.
const MAX_PAYLOAD = 100_000;

export function sourceLinksFromPayload(raw: string): SourceLink[] {
  const text = raw.trim();
  if (!text || text.length > MAX_PAYLOAD) return [];
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is SourceLink =>
          Boolean(item) &&
          typeof item === "object" &&
          typeof (item as SourceLink).title === "string" &&
          typeof (item as SourceLink).url === "string" &&
          (item as SourceLink).url.startsWith("https://") &&
          (item as SourceLink).url.includes("sap.com"),
      )
      .slice(0, 8)
      .map((item) => ({
        title: item.title.slice(0, 180),
        url: item.url.slice(0, 500),
      }));
  } catch {
    return [];
  }
}
