import { cookies } from "next/headers";
import { authMode, SESSION_COOKIE, SIGN_IN_AGAIN, verifyToken } from "@/lib/auth";

export async function hasSession(): Promise<boolean> {
  const mode = authMode();
  if (mode === "open") return true;
  if (mode === "locked") return false;
  return verifyToken((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function denyWithoutSession(): Promise<{ error: string } | null> {
  return (await hasSession()) ? null : { error: SIGN_IN_AGAIN };
}
