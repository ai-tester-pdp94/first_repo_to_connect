import { NextResponse } from "next/server";
import { SIGN_IN_AGAIN } from "@/lib/auth";
import { clampDepth, investigateError } from "@/lib/research";
import { hasSession } from "@/lib/session";

export const runtime = "nodejs";

function requestedDepth(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 1;
}

export async function POST(request: Request) {
  if (!(await hasSession())) {
    return NextResponse.json(
      { query: "", sources: [], draft: "", error: SIGN_IN_AGAIN, depth: 1, usable: false },
      { status: 401 },
    );
  }

  let body: { query?: unknown; depth?: unknown };
  try {
    body = (await request.json()) as { query?: unknown; depth?: unknown };
  } catch {
    return NextResponse.json(
      { error: "The request was not readable.", sources: [], usable: false, depth: 1 },
      { status: 400 },
    );
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  const depth = requestedDepth(body.depth);
  if (query.length < 3) {
    return NextResponse.json(
      {
        query,
        sources: [],
        draft: "",
        error: "Paste a little more of the error text.",
        depth: clampDepth(depth),
        usable: false,
      },
      { status: 400 },
    );
  }
  if (query.length > 20000) {
    return NextResponse.json(
      {
        query,
        sources: [],
        draft: "",
        error:
          "That paste is too long to search. Use the status line or the exception text.",
        depth: clampDepth(depth),
        usable: false,
      },
      { status: 400 },
    );
  }

  const result = await investigateError(query, depth);
  const failed = Boolean(result.error) && result.sources.length === 0;
  return NextResponse.json(result, { status: failed ? 502 : 200 });
}
