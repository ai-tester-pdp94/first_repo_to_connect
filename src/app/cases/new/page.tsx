import type { Metadata } from "next";
import Link from "next/link";
import { NewCaseForm } from "@/components/new-case-form";

export const metadata: Metadata = {
  title: "Log an error",
};

type NewCaseProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function NewCasePage({ searchParams }: NewCaseProps) {
  const params = await searchParams;
  const initialError = (params.q ?? "").slice(0, 4000);

  return (
    <div className="page-pad mx-auto w-full min-w-0 max-w-3xl flex-1 px-4 py-4">
      <Link href="/" className="inline-flex min-h-12 items-center text-base font-medium">
        Back to the book
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Log an error</h1>
      <p className="mt-2 text-base leading-6 text-muted-foreground">
        Paste what arrived in the mail or in message monitoring. If you already know the fix,
        write it now. If you do not, save the case open and investigate it from the entry.
      </p>
      <div className="mt-6">
        <NewCaseForm initialError={initialError} />
      </div>
    </div>
  );
}
