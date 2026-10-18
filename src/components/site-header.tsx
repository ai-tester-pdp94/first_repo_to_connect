import Link from "next/link";
import { Button } from "@/components/ui/button";
import { counts } from "@/lib/db";

export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const tally = signedIn ? counts() : null;

  return (
    <header className="site-header">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex min-w-0 flex-1 flex-col justify-center self-stretch">
          <span className="block min-w-0 truncate text-lg leading-6 font-semibold tracking-tight">
            <span className="md:hidden">Error Book</span>
            <span className="hidden md:inline">Integration Error Book</span>
          </span>
          <span className="block min-w-0 truncate text-sm text-zinc-400">
            {tally
              ? `${tally.community} community · ${tally.verified} verified · ${tally.open} open`
              : "Private"}
          </span>
        </Link>
        {signedIn ? (
          <div className="hidden shrink-0 md:block">
            <Button
              nativeButton={false}
              render={<Link href="/cases/new" />}
              className="bg-amber-200 text-zinc-950 hover:bg-amber-100"
            >
              Log an error
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
