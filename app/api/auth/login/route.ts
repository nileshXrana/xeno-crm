import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { signJWT } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const normalizedUser = username?.trim().toLowerCase();
    
    // Validate credentials against dummy data
    if (
      (normalizedUser === "admin@xeno.co" || normalizedUser === "admin") &&
      password === "admin123"
    ) {
      // Sign token
      const token = await signJWT({
        username: "admin",
        email: "admin@xeno.co",
        role: "admin",
      });

      // Save to cookies (HTTP-Only)
      const cookieStore = await cookies();
      cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 86400, // 1 day
      });

      return Response.json({ success: true });
    }

    return Response.json(
      { success: false, error: "Invalid username or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("[API auth/login] Error:", error);
    return Response.json(
      { success: false, error: "Authentication system failure" },
      { status: 500 }
    );
  }
}
