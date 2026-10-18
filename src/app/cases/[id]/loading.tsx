export default function CaseLoading() {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-1 flex-col gap-4 px-4 py-6" role="status" aria-live="polite">
      <p className="text-base text-muted-foreground">Loading the case…</p>
      <div className="h-8 w-2/3 animate-pulse rounded-lg bg-muted" />
      <div className="h-32 animate-pulse rounded-xl bg-muted" />
      <div className="h-24 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
