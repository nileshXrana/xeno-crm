import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import CommunicationMessage from "@/models/CommunicationMessage";
import Campaign from "@/models/Campaign";

/**
 * POST /api/crm/webhooks/delivery
 *
 * This is the RECEIPT/CALLBACK endpoint.
 * The channel stub (/api/channel/send) calls this after simulating delivery.
 *
 * Body: { messageId: string, status: "DELIVERED" | "FAILED", failureReason?: string }
 *
 * 1. Updates the CommunicationMessage document in MongoDB with the final status.
 * 2. Checks if ALL messages for the campaign are processed (no PENDING/SENT remaining).
 * 3. If all messages are done, marks the Campaign as "SENT".
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

    // Check if all messages for this campaign are finalized (no PENDING or SENT remaining)
    const campaignId = updated.campaignId;
    const remainingCount = await CommunicationMessage.countDocuments({
      campaignId,
      status: { $in: ["PENDING", "SENT"] },
    });

    if (remainingCount === 0) {
      await Campaign.findByIdAndUpdate(campaignId, { $set: { status: "SENT" } });
      console.log(
        `[WEBHOOK] 🏁 Campaign ${campaignId} fully processed — status updated to SENT.`
      );
    } else {
      console.log(
        `[WEBHOOK] ⏳ Campaign ${campaignId} still has ${remainingCount} messages in-flight.`
      );
    }

    return Response.json({ success: true, messageId, status });
  } catch (error) {
    console.error("[WEBHOOK /api/crm/webhooks/delivery] Error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
