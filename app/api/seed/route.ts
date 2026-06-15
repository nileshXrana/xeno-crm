import { NextRequest } from "next/server";
import { seedDatabase } from "@/scripts/seed";

export async function GET(_req: NextRequest) {
  try {
    console.log("[API /api/seed] Seeding database...");
    const result = await seedDatabase();
    console.log("[API /api/seed] Seed complete:", result);

    return Response.json({
      success: true,
      message: `Successfully seeded ${result.customers} customers and ${result.orders} orders.`,
      data: result,
    });
  } catch (error) {
    console.error("[API /api/seed] Error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
