import Link from "next/link";
import { InvestigatePanel } from "@/components/investigate-panel";
import { PhoneActions } from "@/components/phone-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { counts } from "@/lib/db";
import { areaLabel, provenanceLabel } from "@/lib/labels";
import { searchCases, type KindFilter } from "@/lib/search";
import type { ReactNode } from "react";

type HomeProps = {
  searchParams: Promise<{ q?: string; area?: string; kind?: string }>;
};

function filterHref(current: { q: string; area: string; kind: string }, patch: { area?: string; kind?: string }) {
  const params = new URLSearchParams();
  if (current.q) params.set("q", current.q);
  const area = patch.area ?? current.area;
  const kind = patch.kind ?? current.kind;
  if (area !== "all") params.set("area", area);
  if (kind !== "all") params.set("kind", kind);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const q = params.q ?? "";
  const area = params.area === "idoc" || params.area === "cpi" ? params.area : "all";
  const kind: KindFilter =
    params.kind === "community" || params.kind === "verified" || params.kind === "open"
      ? params.kind
      : "all";
  const { hits, strong, query } = searchCases({ q, area, kind });
  const tally = counts();
  const browsing = query.length === 0;
  const logHref = query ? `/cases/new?q=${encodeURIComponent(query)}` : "/cases/new";

  return (
    <div className="page-pad mx-auto flex w-full min-w-0 max-w-5xl flex-1 flex-col">
      <form action="/" className="sticky-search px-4 py-3">
        <label htmlFor="q" className="sr-only">
          Paste the error, or a few words from it
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Status 51, EA390, PKIX"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
            className="min-w-0 flex-1 font-mono"
          />
          {area !== "all" ? <input type="hidden" name="area" value={area} /> : null}
          {kind !== "all" ? <input type="hidden" name="kind" value={kind} /> : null}
          <Button type="submit" className="shrink-0 px-3">
            Look up
          </Button>
        </div>
      </form>

      <div className="flex min-w-0 flex-col gap-4 px-4 py-4">
        <div className="flex flex-wrap gap-2">
          <FilterChip href={filterHref({ q, area, kind }, { area: "all" })} active={area === "all"}>
            All areas
          </FilterChip>
          <FilterChip href={filterHref({ q, area, kind }, { area: "idoc" })} active={area === "idoc"}>
            IDoc
          </FilterChip>
          <FilterChip href={filterHref({ q, area, kind }, { area: "cpi" })} active={area === "cpi"} label="Integration Suite">
            <span className="sm:hidden">Suite</span>
            <span className="hidden sm:inline">Integration Suite</span>
          </FilterChip>
          <FilterChip href={filterHref({ q, area, kind }, { kind: "all" })} active={kind === "all"}>
            Everything
          </FilterChip>
          <FilterChip href={filterHref({ q, area, kind }, { kind: "verified" })} active={kind === "verified"} label="Verified here">
            <span className="sm:hidden">Verified</span>
            <span className="hidden sm:inline">Verified here</span>
          </FilterChip>
          <FilterChip href={filterHref({ q, area, kind }, { kind: "community" })} active={kind === "community"} label="SAP Community">
            <span className="sm:hidden">Community</span>
            <span className="hidden sm:inline">SAP Community</span>
          </FilterChip>
          <FilterChip href={filterHref({ q, area, kind }, { kind: "open" })} active={kind === "open"}>
            Open
          </FilterChip>
        </div>

        {browsing ? null : (
          <p className="text-base leading-6 text-muted-foreground">
            {hits.length === 0
              ? "Nothing in this filter matches."
              : strong
                ? `${hits.length} match${hits.length === 1 ? "" : "es"}. Your own confirmed fixes are ranked first.`
                : `${hits.length} partial match${hits.length === 1 ? "" : "es"}. None of them is close enough to treat as the answer.`}
          </p>
        )}

        {hits.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-8">
            <h2 className="text-xl font-semibold">
              {browsing ? "This filter is empty" : "No stored fix for that wording"}
            </h2>
            <p className="mt-2 max-w-xl text-base leading-6 text-muted-foreground">
              {browsing
                ? "Clear the filter, or log an error you are working on now."
                : "Log it so the next email about the same status has somewhere to land, or investigate it in the SAP Community first."}
            </p>
            <Button
              nativeButton={false}
              render={<Link href={logHref} />}
              className="mt-4 w-full sm:w-auto"
              variant="outline"
            >
              Log this error
            </Button>
          </div>
        ) : (
          <ul className="min-w-0 divide-y overflow-hidden rounded-xl border bg-card">
            {hits.map((hit) => (
              <li key={hit.id}>
                <Link
                  href={`/cases/${hit.id}`}
                  className={`block min-h-16 border-l-4 px-4 py-4 active:bg-muted ${
                    hit.area === "idoc" ? "border-l-amber-700" : "border-l-sky-800"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-sm tracking-wide text-muted-foreground uppercase">
                      {areaLabel(hit.area)}
                      {hit.statusCode ? ` · ${hit.statusCode}` : ""}
                    </span>
                    <Badge variant={hit.provenance === "verified" ? "default" : "outline"}>
                      {provenanceLabel(hit.provenance)}
                    </Badge>
                    {query && hit.strong ? (
                      <Badge variant="secondary">Strong match</Badge>
                    ) : null}
                  </div>
                  <h2 className="wrap-block mt-1 text-lg font-medium">{hit.title}</h2>
                  <p className="mt-1 line-clamp-2 text-base leading-6 text-muted-foreground">{hit.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {browsing && hits.length > 0 ? (
          <p className="text-base leading-6 text-muted-foreground">
            {tally.community} serious failures from SAP Community are already in the book.
            A fix you confirm yourself is listed above them the next time the same error shows up.
          </p>
        ) : null}

        {query ? (
          <InvestigatePanel query={query} prominent={!strong} />
        ) : null}
      </div>

      <PhoneActions
        actions={
          query
            ? [
                { id: "log", label: "Log", href: logHref },
                { id: "investigate", label: "Investigate", command: "investigate" },
              ]
            : [{ id: "log", label: "Log an error", href: logHref }]
        }
      />
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
  children,
}: {
  href: string;
  active: boolean;
  label?: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={`inline-flex min-h-12 items-center rounded-full border px-3.5 text-base font-medium ${
        active
          ? "border-zinc-950 bg-zinc-950 text-zinc-50"
          : "border-border bg-background text-foreground active:bg-muted"
      }`}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
