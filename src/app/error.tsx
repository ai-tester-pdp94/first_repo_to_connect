"use client";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-xl flex-1 flex-col px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">The book could not be opened</h1>
      <p className="wrap-block mt-3 text-base leading-6 text-muted-foreground">
        {error.message || "Something failed while reading the ledger. Try again."}
      </p>
      <Button type="button" className="mt-6 w-full sm:w-auto" variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
