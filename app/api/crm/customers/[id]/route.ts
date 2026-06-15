import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Customer from "@/models/Customer";
import Order from "@/models/Order";

/**
 * GET /api/crm/customers/[id]
 * Returns a single customer and their orders.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const [customer, orders] = await Promise.all([
      Customer.findById(id).lean(),
      Order.find({ customerId: id }).sort({ date: -1 }).lean(),
    ]);

    if (!customer) {
      return Response.json(
        { success: false, error: "Customer not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, customer, orders });
  } catch (error) {
    console.error("[API /api/crm/customers/[id]] Error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
