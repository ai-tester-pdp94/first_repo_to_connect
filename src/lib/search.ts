import { ftsIds, listCases } from "@/lib/db";
import { normalizeError, significantTokens } from "@/lib/normalize";
import type { Area, CaseSummary, Provenance, SearchHit } from "@/lib/types";

export type KindFilter = "all" | Provenance;

const STRONG = 14;
const RELEVANT = 10;
const VERIFIED_RANK = 20;

function statusQuery(query: string): string | null {
  const labeled = query.match(/\bstatus\s+(\d{2})\b/);
  if (labeled) return labeled[1];
  if (/^\d{2}$/.test(query)) return query;
  const ea = query.match(/\bea\s?(\d{3})\b/);
  if (ea) return `ea${ea[1]}`;
  return null;
}

export function scoreCase(rawQuery: string, item: CaseSummary, inFts: boolean): number {
  const query = normalizeError(rawQuery);
  if (!query) return 0;
  let score = 0;

  for (const signature of item.signatures) {
    const sig = normalizeError(signature);
    if (!sig) continue;
    if (sig.length >= 4 && query.includes(sig)) {
      score += 14 + Math.min(sig.length, 48) / 8;
      continue;
    }
    const tokens = significantTokens(sig);
    const hits = tokens.filter((token) => query.includes(token));
    const need = Math.min(2, tokens.length);
    if (need > 0 && hits.length >= need) score += hits.length * 3;
  }

  const code = statusQuery(query);
  if (code && item.statusCode && item.statusCode.toLowerCase() === code) {
    score += 18;
  }

  const http = query.match(/\b(401|403|415|500)\b/);
  if (http) {
    const token = http[1];
    const mentioned = item.signatures.some((signature) =>
      normalizeError(signature).split(" ").includes(token),
    );
    if (mentioned) score += 12;
  }

  if (item.verifiedNote) {
    const noteTokens = significantTokens(item.verifiedNote);
    const noteHits = noteTokens.filter((token) => query.includes(token));
    if (noteHits.length >= 2) score += noteHits.length * 2;
  }

  if (inFts) score += 2;
  if (item.provenance !== "verified" && item.origin === "user") score += 4;
  return score;
}

export function searchCases(options: {
  q?: string;
  area?: string;
  kind?: string;
}): { hits: SearchHit[]; strong: boolean; query: string } {
  const query = (options.q ?? "").trim();
  const area: Area | "all" =
    options.area === "idoc" || options.area === "cpi" ? options.area : "all";
  const kind: KindFilter =
    options.kind === "community" ||
    options.kind === "verified" ||
    options.kind === "open"
      ? options.kind
      : "all";

  const cases = listCases().filter((item) => {
    if (area !== "all" && item.area !== area) return false;
    if (kind === "all") return true;
    if (kind === "community") {
      return item.origin === "community" && item.provenance !== "verified";
    }
    return item.provenance === kind;
  });

  if (!query) {
    return {
      query,
      strong: false,
      hits: cases.map((item) => ({ ...item, score: 0, strong: false })),
    };
  }

  const tokens = significantTokens(query)
    .slice(0, 12)
    .map((token) => `"${token.replaceAll('"', "")}"`);
  const matched = tokens.length ? ftsIds(tokens.join(" OR ")) : new Set<string>();

  const hits = cases
    .flatMap((item) => {
      const relevance = scoreCase(query, item, matched.has(item.id));
      if (relevance < RELEVANT) return [];
      const score =
        relevance + (item.provenance === "verified" ? VERIFIED_RANK : 0);
      return [{ ...item, score, strong: relevance >= STRONG }];
    })
    .sort((a, b) => b.score - a.score || a.sortOrder - b.sortOrder);

  return {
    query,
    strong: hits.some((hit) => hit.strong),
    hits,
  };
}
