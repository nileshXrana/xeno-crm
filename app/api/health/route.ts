import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";

/**
 * GET /api/health
 * Health check endpoint for deployment monitoring.
 * Returns database connectivity status.
 */
export async function GET(_req: NextRequest) {
  const start = Date.now();

  try {
    await dbConnect();
    const latency = Date.now() - start;

    return Response.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "xeno-crm",
      version: "1.0.0",
      db: {
        status: "connected",
        latencyMs: latency,
      },
    });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        service: "xeno-crm",
        db: {
          status: "disconnected",
          error: String(error),
        },
      },
      { status: 503 }
    );
  }
}
