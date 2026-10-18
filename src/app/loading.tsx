export default function Loading() {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-5xl flex-1 flex-col gap-4 px-4 py-6" role="status" aria-live="polite">
      <p className="text-base text-muted-foreground">Opening the book…</p>
      <div className="h-12 animate-pulse rounded-lg bg-muted" />
      <div className="h-24 animate-pulse rounded-xl bg-muted" />
      <div className="h-24 animate-pulse rounded-xl bg-muted" />
    </div>
  );
}
