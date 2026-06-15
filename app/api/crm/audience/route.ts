import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import { buildAudienceQuery } from "@/lib/audienceQuery";
import { IAudienceRule } from "@/models/Campaign";

/**
 * POST /api/crm/audience
 * Body: { rules: IAudienceRule[] }
 * Returns: { count: number, sampleCustomers: Customer[] }
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const rules: IAudienceRule[] = body.rules ?? [];

    console.log("[API /api/crm/audience] Building query for rules:", JSON.stringify(rules));

    const query = buildAudienceQuery(rules);
    console.log("[API /api/crm/audience] MongoDB query:", JSON.stringify(query));

    const [count, sampleCustomers] = await Promise.all([
      Customer.countDocuments(query),
      Customer.find(query).limit(5).lean(),
    ]);

    console.log(`[API /api/crm/audience] Matched ${count} customers.`);

    return Response.json({ success: true, count, sampleCustomers });
  } catch (error) {
    console.error("[API /api/crm/audience] Error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
