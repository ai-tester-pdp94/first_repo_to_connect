"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, type SignInState } from "@/lib/auth-actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(signIn, null as SignInState);

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <input
        type="text"
        name="username"
        defaultValue="error-book"
        autoComplete="username"
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />
      <div className="space-y-2">
        <Label htmlFor="passcode">Passcode</Label>
        <Input
          id="passcode"
          name="passcode"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={state?.error ? true : undefined}
        />
        {state?.error ? (
          <p className="wrap-block text-base text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Checking…" : "Open the book"}
      </Button>
    </form>
  );
}
