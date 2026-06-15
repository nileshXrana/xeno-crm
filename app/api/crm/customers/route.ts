import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";

export async function GET(_req: NextRequest) {
  try {
    await dbConnect();
    const customers = await Customer.find({}).sort({ createdAt: -1 }).lean();
    return Response.json({ success: true, customers });
  } catch (error) {
    console.error("[API /api/crm/customers] Error:", error);
    return Response.json({ success: false, error: String(error) }, { status: 500 });
  }
}
