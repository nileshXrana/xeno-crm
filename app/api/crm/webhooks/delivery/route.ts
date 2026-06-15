import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import CommunicationMessage from "@/models/CommunicationMessage";

/**
 * POST /api/crm/webhooks/delivery
 *
 * This is the RECEIPT/CALLBACK endpoint.
 * The channel stub (/api/channel/send) calls this after simulating delivery.
 *
 * Body: { messageId: string, status: "DELIVERED" | "FAILED", failureReason?: string }
 *
 * Updates the CommunicationMessage document in MongoDB with the final status.
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { messageId, status, failureReason } = body as {
      messageId: string;
      status: "DELIVERED" | "FAILED";
      failureReason?: string;
    };

    console.log(
      `[WEBHOOK /api/crm/webhooks/delivery] Received delivery receipt — messageId: ${messageId}, status: ${status}`
    );

    if (!messageId || !status) {
      console.warn("[WEBHOOK] Missing messageId or status in payload.");
      return Response.json(
        { success: false, error: "messageId and status are required" },
        { status: 400 }
      );
    }

    const updateData: Record<string, string> = { status };
    if (failureReason) updateData.failureReason = failureReason;

    const updated = await CommunicationMessage.findByIdAndUpdate(
      messageId,
      { $set: updateData },
      { new: true }
    );

    if (!updated) {
      console.warn(`[WEBHOOK] Message ${messageId} not found in DB.`);
      return Response.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    console.log(
      `[WEBHOOK] ✅ Message ${messageId} updated to status: ${status} for customer: ${updated.customerId}`
    );

    return Response.json({ success: true, messageId, status });
  } catch (error) {
    console.error("[WEBHOOK /api/crm/webhooks/delivery] Error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
