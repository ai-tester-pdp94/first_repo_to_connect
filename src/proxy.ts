import { NextResponse, type NextRequest } from "next/server";
import { authMode, SESSION_COOKIE, SIGN_IN_AGAIN, verifyToken } from "@/lib/auth";

const NOT_SET_UP =
  "Sign-in is not set up. Set ERROR_BOOK_PASSCODE on the server and restart it.";

export function proxy(request: NextRequest) {
  const mode = authMode();
  if (mode === "open") return NextResponse.next();
  if (mode === "locked") return new NextResponse(NOT_SET_UP, { status: 503 });
  if (verifyToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { query: "", sources: [], draft: "", error: SIGN_IN_AGAIN, depth: 1, usable: false },
      { status: 401 },
    );
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new NextResponse(SIGN_IN_AGAIN, { status: 401 });
  }

  const login = request.nextUrl.clone();
  login.pathname = "/login";
  login.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(login);
}

// The manifest and icons stay public so the phone can offer to install the app before sign-in.
export const config = {
  matcher: [
    "/((?!login|_next/static|_next/image|manifest.webmanifest|icon.png|apple-icon.png|favicon.ico|icons/).*)",
  ],
};
