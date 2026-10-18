"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  authMode,
  clearFailures,
  issueToken,
  landingPath,
  passcodeMatches,
  recordFailure,
  secondsUntilRetry,
  SESSION_COOKIE,
  SESSION_SECONDS,
} from "@/lib/auth";

export type SignInState = { error?: string } | null;

function clientKey(list: Headers): string {
  return (
    list.get("fly-client-ip") ??
    list.get("cf-connecting-ip") ??
    list.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function signIn(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  if (authMode() !== "passcode") {
    return { error: "Sign-in is not set up on this server." };
  }

  const list = await headers();
  const key = clientKey(list);
  const wait = secondsUntilRetry(key);
  if (wait > 0) {
    return {
      error: `Too many wrong passcodes. Try again in ${Math.ceil(wait / 60)} min.`,
    };
  }

  const entered = formData.get("passcode");
  if (typeof entered !== "string" || !passcodeMatches(entered)) {
    recordFailure(key);
    return { error: "That passcode is not right." };
  }

  clearFailures(key);
  (await cookies()).set(SESSION_COOKIE, issueToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: list.get("x-forwarded-proto") === "https",
    maxAge: SESSION_SECONDS,
    path: "/",
  });
  redirect(landingPath(formData.get("next")));
}
