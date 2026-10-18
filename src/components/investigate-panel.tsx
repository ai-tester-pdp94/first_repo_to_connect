"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { INVESTIGATE_PHASE_EVENT } from "@/components/phone-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createInvestigatedCase,
  saveResearch,
  type ActionState,
} from "@/lib/actions";
import { guessArea } from "@/lib/normalize";
import type { ResearchResult } from "@/lib/research";

type InvestigatePanelProps = {
  query: string;
  prominent?: boolean;
  caseId?: string;
};

const MAX_DEPTH = 3;

type InvestigatePhase = "idle" | "loading" | "ready" | "failed";

function readLiveQuery(fallback: string, caseId?: string): string {
  if (caseId) {
    const errorText = document.getElementById("edit-errorText");
    if (errorText instanceof HTMLTextAreaElement) return errorText.value;
    return fallback;
  }
  const search = document.getElementById("q");
  if (search instanceof HTMLInputElement) return search.value;
  return fallback;
}

function nextPass(changed: boolean, usable: boolean, depth: number): number {
  if (changed) return 1;
  if (usable) return Math.max(1, depth);
  return Math.min(MAX_DEPTH, Math.max(1, depth) + 1);
}

function loadingLabel(depth: number): string {
  if (depth <= 1) return "Pass 1 of 3. Searching SAP Community…";
  return `Pass ${depth} of 3. Searching again, looking further`;
}

function buttonLabel(phase: InvestigatePhase, depth: number, usable: boolean): string {
  switch (phase) {
    case "loading":
      return depth <= 1 ? "Searching SAP Community…" : "Searching again, looking further";
    case "idle":
      return "Investigate";
    case "ready":
      return usable ? "Investigate" : "Investigate again";
    case "failed":
      return "Investigate again";
    default: {
      const unreachable: never = phase;
      return unreachable;
    }
  }
}

function weakCopy(result: ResearchResult | null): string {
  if (!result || result.usable) return "";
  if (result.depth >= MAX_DEPTH) {
    return "This was the deepest pass. These hits still do not look like a resolution for this wording.";
  }
  return "This pass did not find a close resolution. Investigate again to look further.";
}

export function InvestigatePanel({
  query,
  prominent = false,
  caseId,
}: InvestigatePanelProps) {
  const [phase, setPhase] = useState<InvestigatePhase>("idle");
  const [runningDepth, setRunningDepth] = useState(1);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [failure, setFailure] = useState("");
  const [searchedText, setSearchedText] = useState(query);
  const lastQuery = useRef<string | null>(null);
  const lastDepth = useRef(0);
  const lastUsable = useRef(false);
  const [saveState, saveAction, savePending] = useActionState(
    caseId ? saveResearch : createInvestigatedCase,
    null as ActionState,
  );

  async function investigate() {
    const text = readLiveQuery(query, caseId).trim();
    if (text.length < 3) {
      setPhase("failed");
      setResult(null);
      setFailure("Paste a little more of the error text before searching.");
      return;
    }

    const changed = lastQuery.current !== text;
    const nextDepth = nextPass(changed, lastUsable.current, lastDepth.current);

    setRunningDepth(nextDepth);
    setPhase("loading");
    setFailure("");
    setResult(null);
    setSearchedText(text);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ query: text, depth: nextDepth }),
      });
      const data = (await response.json()) as ResearchResult;
      lastQuery.current = text;
      lastDepth.current = data.depth;
      lastUsable.current = data.usable;
      if (!response.ok || data.sources.length === 0) {
        setPhase("failed");
        setFailure(
          data.error ||
            "SAP Community search did not respond. You can still log the error.",
        );
        return;
      }
      setResult(data);
      setPhase("ready");
    } catch {
      lastQuery.current = text;
      lastDepth.current = nextDepth;
      lastUsable.current = false;
      setPhase("failed");
      setFailure(
        "SAP Community search did not respond. The case can still be saved, and you can try again.",
      );
    }
  }

  const usable = result?.usable === true;
  const actionLabel = buttonLabel(phase, runningDepth, usable);

  useEffect(() => {
    document.dispatchEvent(
      new CustomEvent(INVESTIGATE_PHASE_EVENT, {
        detail: { phase, label: actionLabel },
      }),
    );
  }, [phase, actionLabel]);

  const weakNote = weakCopy(result);

  return (
    <section
      id="investigate-panel"
      className={
        prominent
          ? "scroll-under-header min-w-0 rounded-xl border border-amber-700/40 bg-amber-50 p-4"
          : "scroll-under-header min-w-0 rounded-xl border bg-card p-4"
      }
      aria-busy={phase === "loading"}
    >
      <h2 className="text-lg font-semibold">
        {prominent ? "No strong match in the book" : "Search SAP Community and SAP Help"}
      </h2>
      <p className="mt-1 text-base leading-6 text-muted-foreground">
        {prominent
          ? "Nothing verified here, and nothing in the shipped library, lines up closely. Look through public SAP pages and save a draft you can confirm later."
          : "Use this when the library is close but not the error in front of you. The draft stays unverified until you record what worked."}
      </p>
      <Button
        id="investigate-action"
        type="button"
        className="mt-3 h-auto min-h-12 w-full whitespace-normal sm:w-auto"
        onClick={investigate}
        disabled={phase === "loading"}
      >
        {actionLabel}
      </Button>

      {phase === "loading" ? (
        <p className="mt-3 text-base font-medium" role="status">
          {loadingLabel(runningDepth)}
        </p>
      ) : null}

      {phase === "failed" ? (
        <p className="wrap-block mt-3 text-base text-destructive" role="alert">
          {runningDepth > 1 ? `Pass ${runningDepth} of 3. ` : ""}
          {failure}
        </p>
      ) : null}

      {phase === "ready" && result ? (
        <div className="mt-4 space-y-4">
          <p className="wrap-block text-base leading-6 text-muted-foreground">
            Pass {result.depth} of 3. Searched for{" "}
            <span className="font-medium text-foreground">{result.query}</span>.
            Excerpts are public search snippets, not a note you have proven in this landscape.
          </p>
          {weakNote ? (
            <p className="text-base leading-6 text-destructive" role="status">
              {weakNote}
            </p>
          ) : null}
          <ol className="space-y-3">
            {result.sources.map((source) => (
              <li key={source.url} className="min-w-0 text-base">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="wrap-block block py-2 font-medium underline decoration-zinc-300 underline-offset-2"
                >
                  {source.title}
                </a>
                {source.excerpt ? (
                  <p className="wrap-block mt-1 text-base leading-6 text-muted-foreground">{source.excerpt}</p>
                ) : null}
              </li>
            ))}
          </ol>

          <form action={saveAction} className="space-y-3 border-t pt-4">
            {caseId ? <input type="hidden" name="id" value={caseId} /> : null}
            <input type="hidden" name="errorText" value={searchedText} />
            <input type="hidden" name="sources" value={JSON.stringify(result.sources)} />
            <div className="space-y-2">
              <Label htmlFor="draft">Draft to keep with this error</Label>
              <textarea
                id="draft"
                name="draft"
                defaultValue={result.draft}
                rows={10}
                className="min-h-40 w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-base leading-6"
              />
            </div>
            {caseId ? null : (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="inv-title">Title</Label>
                  <Input id="inv-title" name="title" placeholder="Short name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv-area">Area</Label>
                  <select
                    id="inv-area"
                    name="area"
                    defaultValue={guessArea(searchedText)}
                    className="select-touch"
                  >
                    <option value="idoc">IDoc</option>
                    <option value="cpi">Integration Suite</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv-source">Where it came from</Label>
                  <select
                    id="inv-source"
                    name="source"
                    defaultValue="monitoring"
                    className="select-touch"
                  >
                    <option value="monitoring">Message monitoring</option>
                    <option value="email">Email</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}
            {saveState?.error ? (
              <p className="wrap-block text-base text-destructive" role="alert">
                {saveState.error}
              </p>
            ) : null}
            <Button type="submit" disabled={savePending} className="w-full sm:w-auto">
              {savePending
                ? "Saving…"
                : caseId
                  ? "Attach this draft"
                  : "Save as an open case"}
            </Button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
