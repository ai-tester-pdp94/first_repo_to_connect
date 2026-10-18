import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "error_book_session";
export const SESSION_SECONDS = 60 * 60 * 24 * 180;
export const SIGN_IN_AGAIN =
  "Your sign-in expired. Reload the page and enter the passcode again.";

const MAX_FAILURES = 5;
const FAILURE_WINDOW_MS = 15 * 60 * 1000;

export type AuthMode = "open" | "locked" | "passcode";

type Failures = { count: number; resetAt: number };

const globalForAuth = globalThis as unknown as {
  loginFailures?: Map<string, Failures>;
};
const failures = (globalForAuth.loginFailures ??= new Map());

function passcode(): string {
  return process.env.ERROR_BOOK_PASSCODE ?? "";
}

// A production server without a passcode refuses to serve instead of opening the book to anyone.
export function authMode(): AuthMode {
  if (passcode()) return "passcode";
  return process.env.NODE_ENV === "production" ? "locked" : "open";
}

function sign(expires: number): string {
  return createHmac("sha256", passcode())
    .update(`session:${expires}`)
    .digest("base64url");
}

function sameBytes(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

export function issueToken(now = Date.now()): string {
  const expires = Math.floor(now / 1000) + SESSION_SECONDS;
  return `${expires}.${sign(expires)}`;
}

export function verifyToken(token: string | undefined, now = Date.now()): boolean {
  if (!token || !passcode()) return false;
  const [expiresText, signature] = token.split(".");
  const expires = Number(expiresText);
  if (!signature || !Number.isInteger(expires) || expires * 1000 <= now) return false;
  return sameBytes(Buffer.from(signature), Buffer.from(sign(expires)));
}

function digest(value: string): Buffer {
  return createHmac("sha256", "error-book-passcode").update(value).digest();
}

export function passcodeMatches(candidate: string): boolean {
  const expected = passcode();
  return expected !== "" && sameBytes(digest(candidate), digest(expected));
}

export function secondsUntilRetry(key: string, now = Date.now()): number {
  const entry = failures.get(key);
  if (!entry || entry.resetAt <= now || entry.count < MAX_FAILURES) return 0;
  return Math.ceil((entry.resetAt - now) / 1000);
}

export function recordFailure(key: string, now = Date.now()): void {
  const entry = failures.get(key);
  if (entry && entry.resetAt > now) {
    entry.count += 1;
    return;
  }
  if (failures.size > 1000) {
    for (const [name, value] of failures) {
      if (value.resetAt <= now) failures.delete(name);
    }
  }
  failures.set(key, { count: 1, resetAt: now + FAILURE_WINDOW_MS });
}

export function clearFailures(key: string): void {
  failures.delete(key);
}

// Only same-site paths are allowed, so a crafted link cannot send someone elsewhere after sign-in.
export function landingPath(value: unknown): string {
  if (typeof value !== "string") return "/";
  if (!/^\/(?![/\\])[^\s\\]*$/.test(value) || value.startsWith("/login")) return "/";
  return value;
}
