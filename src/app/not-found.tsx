import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-xl flex-1 flex-col px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">That page is not in the book</h1>
      <p className="mt-3 text-base leading-6 text-muted-foreground">
        Search an IDoc status or an Integration Suite exception from the front page.
      </p>
      <Button nativeButton={false} render={<Link href="/" />} className="mt-6 w-full sm:w-auto" variant="outline">
        Back to the book
      </Button>
    </div>
  );
}
