import {
  buildCommunityQuery,
  extractStatusCode,
  significantTokens,
} from "@/lib/normalize";

export type ResearchSource = {
  title: string;
  url: string;
  excerpt: string;
};

export type ResearchResult = {
  query: string;
  sources: ResearchSource[];
  draft: string;
  error?: string;
  depth: number;
  usable: boolean;
};

const MAX_DEPTH = 3;

const USER_AGENT =
  "Mozilla/5.0 (compatible; IntegrationErrorBook/1.0; personal SAP lookup)";

function decodeHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function allowedSapUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return (
      host === "community.sap.com" ||
      host === "help.sap.com" ||
      host === "blogs.sap.com" ||
      host.endsWith(".sap.com")
    );
  } catch {
    return false;
  }
}

function unwrapDuckDuckGo(href: string): string | null {
  try {
    const absolute = href.startsWith("//") ? `https:${href}` : href;
    const parsed = new URL(absolute, "https://duckduckgo.com");
    const target = parsed.searchParams.get("uddg");
    const url = target ?? parsed.toString();
    return allowedSapUrl(url) ? url : null;
  } catch {
    return null;
  }
}

function parseLite(html: string): ResearchSource[] {
  if (/anomaly-modal|bots use DuckDuckGo/i.test(html)) return [];
  const found: ResearchSource[] = [];
  const anchorRe = /<a\b([^>]*\bclass=['"]result-link['"][^>]*)>([\s\S]*?)<\/a>/gi;
  const anchors = [...html.matchAll(anchorRe)];
  anchors.forEach((anchor, index) => {
    const hrefMatch = anchor[1].match(/\bhref=['"]([^'"]+)['"]/i);
    if (!hrefMatch) return;
    const url = unwrapDuckDuckGo(decodeHtml(hrefMatch[1]));
    if (!url) return;
    const start = anchor.index ?? 0;
    const end = anchors[index + 1]?.index ?? start + 1800;
    const snippetMatch = html
      .slice(start, end)
      .match(/<td class=['"]result-snippet['"]>([\s\S]*?)<\/td>/i);
    found.push({
      title: decodeHtml(anchor[2]),
      url,
      excerpt: snippetMatch ? decodeHtml(snippetMatch[1]) : "",
    });
  });
  return found;
}

async function fetchText(url: string, accept: string, timeoutMs = 15000): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: accept,
    },
    signal: AbortSignal.timeout(timeoutMs),
    redirect: "follow",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Search returned ${response.status}`);
  }
  const text = await response.text();
  return text.length > 1_500_000 ? text.slice(0, 1_500_000) : text;
}

function searchFailure(error: unknown, label: string): string {
  const timedOut =
    error instanceof Error &&
    (error.name === "TimeoutError" || /aborted due to timeout/i.test(error.message));
  if (timedOut) return `${label} took too long. Investigate again to try a wider search.`;
  return error instanceof Error ? error.message : `${label} failed`;
}

function preferSolved(sources: ResearchSource[]): ResearchSource[] {
  return [...sources].sort((a, b) => {
    const aSolved = /^solved:/i.test(a.title) ? 0 : 1;
    const bSolved = /^solved:/i.test(b.title) ? 0 : 1;
    return aSolved - bSolved;
  });
}

async function searchLite(query: string, page: number): Promise<ResearchSource[]> {
  const start = page * 10;
  const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}${start > 0 ? `&s=${start}` : ""}`;
  const html = await fetchText(url, "text/html");
  return parseLite(html);
}

async function searchCommunity(
  query: string,
  limit: number,
  pages: number,
): Promise<ResearchSource[]> {
  const siteQuery = `site:community.sap.com ${query}`;
  const first = await searchLite(siteQuery, 0);
  const extra =
    pages > 1
      ? await Promise.all(
          Array.from({ length: pages - 1 }, (_, index) =>
            searchLite(siteQuery, index + 1).catch(() => [] as ResearchSource[]),
          ),
        )
      : [];
  return preferSolved(dedupe([...first, ...extra.flat()])).slice(0, limit);
}

type HelpHit = {
  title?: string;
  url?: string;
  snippet?: string;
};

async function searchHelp(query: string, limit: number): Promise<ResearchSource[]> {
  const url = `https://help.sap.com/http.svc/search?q=${encodeURIComponent(query)}&state=PRODUCTION&language=en-US`;
  const body = await fetchText(url, "application/json");
  const parsed = JSON.parse(body) as { data?: { results?: HelpHit[] } };
  const results = parsed.data?.results ?? [];
  const sources: ResearchSource[] = [];
  for (const hit of results) {
    if (!hit.title || !hit.url) continue;
    const absolute = hit.url.startsWith("http")
      ? hit.url
      : `https://help.sap.com${hit.url}`;
    if (!allowedSapUrl(absolute)) continue;
    sources.push({
      title: decodeHtml(hit.title),
      url: absolute,
      excerpt: decodeHtml(hit.snippet ?? ""),
    });
    if (sources.length === limit) break;
  }
  return sources;
}

function dedupe(sources: ResearchSource[]): ResearchSource[] {
  const seen = new Set<string>();
  const unique: ResearchSource[] = [];
  for (const source of sources) {
    if (seen.has(source.url)) continue;
    seen.add(source.url);
    unique.push(source);
  }
  return unique;
}

function uniqueWords(value: string): string[] {
  const seen = new Set<string>();
  const words: string[] = [];
  for (const word of value.split(" ")) {
    const key = word.toLowerCase();
    if (!word || seen.has(key)) continue;
    seen.add(key);
    words.push(word);
  }
  return words;
}

export function clampDepth(depth: number): number {
  if (!Number.isFinite(depth) || depth < 1) return 1;
  return Math.min(MAX_DEPTH, Math.floor(depth));
}

function queryForDepth(raw: string, depth: number): string {
  const specific = buildCommunityQuery(raw);
  if (depth <= 1) return specific;
  const tokens = significantTokens(raw);
  const status = extractStatusCode(raw);
  const exception =
    raw.match(/\b[A-Za-z][\w.]*(?:Exception|Error)\b/)?.[0] ??
    raw.match(/\b[A-Z]{2,}[_/][A-Z0-9_./]+\b/)?.[0] ??
    "";
  const keep = depth === 2 ? 6 : 3;
  const broader = uniqueWords(
    [status ? `status ${status}` : "", exception, ...tokens.slice(0, keep)]
      .filter(Boolean)
      .join(" "),
  )
    .join(" ")
    .slice(0, depth === 2 ? 140 : 90);
  return broader.length >= 3 ? broader : specific;
}

function depthPlan(depth: number) {
  if (depth >= 3) {
    return {
      community: 8,
      help: 6,
      communityPages: 2,
      fetchCommunity: 3,
      fetchHelp: 3,
      wide: 4,
    };
  }
  if (depth === 2) {
    return {
      community: 6,
      help: 4,
      communityPages: 1,
      fetchCommunity: 2,
      fetchHelp: 2,
      wide: 0,
    };
  }
  return {
    community: 4,
    help: 2,
    communityPages: 1,
    fetchCommunity: 0,
    fetchHelp: 0,
    wide: 0,
  };
}

function extractPageText(html: string): string {
  const cleaned = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const region =
    cleaned.match(/<article\b[^>]*>[\s\S]*?<\/article>/i)?.[0] ??
    cleaned.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0] ??
    cleaned;
  return decodeHtml(region).slice(0, 4000);
}

function excerptAround(text: string, query: string): string {
  const lower = text.toLowerCase();
  let index = -1;
  for (const token of significantTokens(query)) {
    const at = lower.indexOf(token);
    if (at >= 0) {
      index = at;
      break;
    }
  }
  if (index < 0) return text.slice(0, 500).trim();
  const start = Math.max(0, index - 80);
  return text.slice(start, start + 500).trim();
}

async function readPageExcerpt(url: string, query: string): Promise<string | null> {
  try {
    const html = await fetchText(url, "text/html", 7000);
    const text = extractPageText(html);
    if (text.length < 80) return null;
    const excerpt = excerptAround(text, query);
    return excerpt.length >= 40 ? excerpt : null;
  } catch {
    return null;
  }
}

async function enrichWithPageText(
  sources: ResearchSource[],
  query: string,
  fetchCommunity: number,
  fetchHelp: number,
): Promise<ResearchSource[]> {
  if (fetchCommunity === 0 && fetchHelp === 0) return sources;
  const community = sources.filter(
    (source) =>
      source.url.includes("community.sap.com") || source.url.includes("blogs.sap.com"),
  );
  const help = sources.filter((source) => source.url.includes("help.sap.com"));
  const targets = [
    ...community.slice(0, fetchCommunity),
    ...help.slice(0, fetchHelp),
  ];
  if (targets.length === 0) return sources;
  const excerpts = await Promise.all(
    targets.map((source) => readPageExcerpt(source.url, query)),
  );
  const byUrl = new Map<string, string>();
  targets.forEach((source, index) => {
    const excerpt = excerpts[index];
    if (excerpt) byUrl.set(source.url, excerpt);
  });
  return sources.map((source) => {
    const excerpt = byUrl.get(source.url);
    if (!excerpt) return source;
    if (excerpt.length <= source.excerpt.trim().length) return source;
    return { ...source, excerpt };
  });
}

const GENERIC = new Set([
  "failed",
  "failure",
  "error",
  "errors",
  "status",
  "message",
  "messages",
  "could",
  "unable",
  "using",
  "system",
  "server",
  "problem",
  "issue",
  "sap",
  "http",
  "https",
  "null",
]);

function isRelated(raw: string, source: ResearchSource): boolean {
  const needles = significantTokens(raw);
  const hay = new Set(significantTokens(`${source.title} ${source.excerpt}`));
  const shared = needles.filter((token) => hay.has(token));
  const status = extractStatusCode(raw)?.toLowerCase() ?? "";
  if (
    shared.some(
      (token) => token === status || /^ea\d{3}$/.test(token) || /exception$/.test(token),
    )
  ) {
    return true;
  }
  const distinctive = shared.filter((token) => !GENERIC.has(token));
  return distinctive.length >= 2;
}

export function isUsableResolution(raw: string, sources: ResearchSource[]): boolean {
  return sources.some(
    (source) => source.excerpt.trim().length > 0 && isRelated(raw, source),
  );
}

function composeDraft(query: string, sources: ResearchSource[], depth: number): string {
  const lines = [
    `Unverified draft from public SAP pages for: ${query}`,
    `Search pass ${depth} of ${MAX_DEPTH}.`,
    "",
    "These notes are not confirmed in your landscape. Open the thread before you change a partner profile, a certificate, or a Cloud Connector rule.",
    "",
  ];
  sources.forEach((source, index) => {
    lines.push(`${index + 1}. ${source.title}`);
    if (source.excerpt) lines.push(`   ${source.excerpt.slice(0, 420)}`);
    lines.push(`   ${source.url}`);
    lines.push("");
  });
  lines.push(
    "After you try the checks that match this error, record the steps that actually cleared it.",
  );
  return lines.join("\n");
}

export async function investigateError(raw: string, depth = 1): Promise<ResearchResult> {
  const pass = clampDepth(depth);
  const query = queryForDepth(raw, pass);
  if (query.length < 3) {
    return {
      query,
      sources: [],
      draft: "",
      error: "Paste a little more of the error text before searching.",
      depth: pass,
      usable: false,
    };
  }

  const plan = depthPlan(pass);
  const failures: string[] = [];
  const [community, help] = await Promise.all([
    searchCommunity(query, plan.community, plan.communityPages).catch((error: unknown) => {
      failures.push(searchFailure(error, "SAP Community search"));
      return [] as ResearchSource[];
    }),
    searchHelp(query, plan.help).catch((error: unknown) => {
      failures.push(searchFailure(error, "SAP Help search"));
      return [] as ResearchSource[];
    }),
  ]);

  let wide: ResearchSource[] = [];
  if (plan.wide > 0) {
    wide = await searchLite(`${query} site:sap.com`, 0)
      .then((sources) => sources.slice(0, plan.wide))
      .catch(() => [] as ResearchSource[]);
  }

  const merged = await enrichWithPageText(
    dedupe([...community, ...help, ...wide]),
    raw,
    plan.fetchCommunity,
    plan.fetchHelp,
  );
  const usable = isUsableResolution(raw, merged);
  if (merged.length === 0) {
    return {
      query,
      sources: [],
      draft: "",
      error:
        failures[0] ??
        "No public SAP pages came back for this wording. Save the case and try the status text or the exception class on its own.",
      depth: pass,
      usable: false,
    };
  }

  return {
    query,
    sources: merged,
    draft: composeDraft(query, merged, pass),
    depth: pass,
    usable,
  };
}
