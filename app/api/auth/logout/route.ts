import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    return Response.json({ success: true });
  } catch (error) {
    console.error("[API auth/logout] Error:", error);
    return Response.json(
      { success: false, error: "Logout system failure" },
      { status: 500 }
    );
  }
}
export async function GET() {
  // Support GET logout redirects if needed, but standard POST is best.
  // We will clear and redirect to /login
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    return new Response(null, {
      status: 302,
      headers: { Location: "/login" },
    });
  } catch {
    return new Response(null, {
      status: 302,
      headers: { Location: "/login" },
    });
  }
}
