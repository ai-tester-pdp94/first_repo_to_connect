import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { authMode, landingPath } from "@/lib/auth";
import { hasSession } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

type LoginProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginProps) {
  const next = landingPath((await searchParams).next);
  const mode = authMode();
  if (mode === "open" || (await hasSession())) redirect(next);

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-md flex-1 flex-col justify-center px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Open the book</h1>
      {mode === "locked" ? (
        <p className="wrap-block mt-3 text-base leading-6 text-muted-foreground">
          Sign-in is not set up on this server yet. Set the ERROR_BOOK_PASSCODE
          setting to a long passphrase and restart it.
        </p>
      ) : (
        <>
          <p className="mt-3 text-base leading-6 text-muted-foreground">
            This book holds your landscape&apos;s errors and fixes, so it is private.
            Enter the passcode once on each device. It stays signed in for about
            six months.
          </p>
          <LoginForm next={next} />
        </>
      )}
    </div>
  );
}
