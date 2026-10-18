import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditCaseForm } from "@/components/edit-case-form";
import { InvestigatePanel } from "@/components/investigate-panel";
import { PhoneActions } from "@/components/phone-actions";
import { ResolutionForm } from "@/components/resolution-form";
import { Badge } from "@/components/ui/badge";
import { getCase } from "@/lib/db";
import { areaLabel, provenanceLabel, sourceLabel } from "@/lib/labels";

type CasePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: CasePageProps): Promise<Metadata> {
  const { id } = await params;
  const item = getCase(id);
  return { title: item?.title ?? "Case not found" };
}

export default async function CasePage({ params }: CasePageProps) {
  const { id } = await params;
  const item = getCase(id);
  if (!item) notFound();

  const provenanceText = provenanceLabel(item.provenance);
  const sourceText = sourceLabel(item.source);
  const context = [
    item.messageType ? ["Message type", item.messageType] : null,
    item.idocType ? ["Basic type", item.idocType] : null,
    item.partner ? ["Partner", item.partner] : null,
    item.iflow ? ["Integration flow", item.iflow] : null,
    item.adapter ? ["Adapter", item.adapter] : null,
    item.statusCode ? ["Status", item.statusCode] : null,
  ].filter((entry): entry is [string, string] => entry !== null);

  return (
    <div className="page-pad mx-auto flex w-full min-w-0 max-w-3xl flex-1 flex-col gap-6 px-4 py-4">
      <Link href="/" className="inline-flex min-h-12 items-center text-base font-medium">
        Back to the book
      </Link>

      <header className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{areaLabel(item.area)}</Badge>
          <Badge variant={item.provenance === "verified" ? "default" : "outline"}>
            {provenanceText}
          </Badge>
          {sourceText !== provenanceText ? (
            <Badge variant="outline">{sourceText}</Badge>
          ) : null}
        </div>
        <h1 className="wrap-block text-2xl font-semibold tracking-tight">{item.title}</h1>
        <p className="wrap-block text-base leading-6 text-muted-foreground">{item.summary}</p>
      </header>

      {item.origin === "user" ? (
        <EditCaseForm
          key={item.id}
          item={{
            id: item.id,
            title: item.title,
            errorText: item.errorText,
            area: item.area,
            source: item.source,
            messageType: item.messageType ?? "",
            idocType: item.idocType ?? "",
            partner: item.partner ?? "",
            iflow: item.iflow ?? "",
            adapter: item.adapter ?? "",
            resolution: item.verifiedNote?.trim() ? item.verifiedNote : item.steps.join("\n"),
          }}
        />
      ) : null}

      {item.landscapeNote ? (
        <aside className="wrap-block rounded-xl border border-amber-700/40 bg-amber-50 px-4 py-3 text-base leading-6">
          {item.landscapeNote}
        </aside>
      ) : null}

      <section className="min-w-0 space-y-2">
        <h2 className="text-base font-semibold">Error text</h2>
        <pre className="wrap-block rounded-xl border bg-zinc-950 px-4 py-3 font-mono text-base leading-6 whitespace-pre-wrap text-zinc-100">
          {item.errorText}
        </pre>
      </section>

      {context.length > 0 ? (
        <dl className="grid grid-cols-1 gap-3 text-base sm:grid-cols-3">
          {context.map(([label, value]) => (
            <div key={label} className="min-w-0">
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="wrap-block font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-base font-semibold">
          {item.origin === "community" ? "What the SAP Community settled on" : "Steps on this case"}
        </h2>
        {item.steps.length === 0 ? (
          <p className="text-base leading-6 text-muted-foreground">
            No steps yet. Investigate it, or write what you did below once it is clear.
          </p>
        ) : (
          <ol className="list-decimal space-y-3 pl-5 text-base leading-7">
            {item.steps.map((step) => (
              <li key={step} className="wrap-block">{step}</li>
            ))}
          </ol>
        )}
      </section>

      {item.sources.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-base font-semibold">Sources</h2>
          <ul className="space-y-2 text-base">
            {item.sources.map((source) => (
              <li key={source.url} className="min-w-0">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="wrap-block block min-h-12 py-3 underline decoration-zinc-300 underline-offset-2"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {item.verifiedNote ? (
        <section className="rounded-xl border bg-card px-4 py-3">
          <h2 className="text-base font-semibold">What worked here</h2>
          <p className="wrap-block mt-2 text-base leading-6 whitespace-pre-wrap">{item.verifiedNote}</p>
        </section>
      ) : null}

      {item.researchDraft && item.researchDraft !== item.verifiedNote ? (
        <section className="min-w-0 space-y-2">
          <h2 className="text-base font-semibold">Unverified community draft</h2>
          <pre className="wrap-block rounded-xl border bg-muted/40 px-4 py-3 font-mono text-base leading-6 whitespace-pre-wrap">
            {item.researchDraft}
          </pre>
        </section>
      ) : null}

      <section className="rounded-xl border bg-card p-4">
        <ResolutionForm key={item.id} caseId={item.id} initialNote={item.verifiedNote ?? ""} />
      </section>

      <InvestigatePanel query={item.errorText} caseId={item.id} />

      <PhoneActions
        actions={
          item.origin === "user"
            ? [
                { id: "edit", label: "Edit", command: "edit" },
                { id: "investigate", label: "Investigate", command: "investigate" },
              ]
            : [{ id: "investigate", label: "Investigate", command: "investigate" }]
        }
      />
    </div>
  );
}
