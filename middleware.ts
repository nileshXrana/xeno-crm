import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "./lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Automatically bypass auth for authentication endpoints, seeder, channel stub, and webhook receipt
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/channel") ||
    pathname === "/api/crm/webhooks/delivery" ||
    pathname === "/api/seed"
  ) {
    return NextResponse.next();
  }

  // 2. Extract and verify token cookie
  const tokenCookie = request.cookies.get("token");
  const token = tokenCookie?.value;

  let verified = false;
  if (token) {
    const payload = await verifyJWT(token);
    if (payload) {
      verified = true;
    }
  }

  // 3. Routing protection gates
  if (!verified) {
    // Return standard 401 API payload for protected CRM endpoints
    if (pathname.startsWith("/api/crm")) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "Unauthorized session" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Redirect anonymous page requests to login
    if (
      pathname === "/" ||
      pathname.startsWith("/customers") ||
      pathname.startsWith("/campaigns") ||
      pathname.startsWith("/analytics")
    ) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  } else {
    // Redirect logged-in page requests away from login to dashboard
    if (pathname.startsWith("/login")) {
      const dashboardUrl = new URL("/", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

// Intercept routing matches excluding direct static references
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg).*)",
  ],
};
