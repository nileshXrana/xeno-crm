import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import CommunicationMessage from "@/models/CommunicationMessage";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * POST /api/channel/send
 *
 * This is the CHANNEL STUB — it simulates an external messaging provider (e.g. WhatsApp Business API).
 *
 * FLOW:
 * 1. Receives a message payload from /api/crm/campaign/send
 * 2. Updates message status to SENT in the DB
 * 3. Waits 1 second (simulates network latency)
 * 4. Calculates a random outcome: 80% DELIVERED, 10% FAILED (10% just SENT)
 * 5. POSTs the outcome back to the CRM's receipt webhook at /api/crm/webhooks/delivery
 *
 * This entire flow is traced with console.log for easy walkthrough explanation.
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { messageId, customerId, customerName, customerPhone, messageText, channel } = body as {
      messageId: string;
      customerId: string;
      customerName: string;
      customerPhone: string;
      messageText: string;
      channel: string;
    };

    console.log(
      `\n[CHANNEL STUB /api/channel/send] 📨 Received message for ${customerName} (${customerPhone}) via ${channel}`
    );
    console.log(`[CHANNEL STUB] Message ID: ${messageId}`);
    console.log(`[CHANNEL STUB] Message text preview: "${messageText?.substring(0, 80)}..."`);

    // Step 1: Mark message as SENT in DB
    await CommunicationMessage.findByIdAndUpdate(messageId, {
      $set: { status: "SENT" },
    });
    console.log(`[CHANNEL STUB] ✅ Message ${messageId} marked as SENT.`);

    // Step 2: Simulate 1-second network/processing delay
    console.log(`[CHANNEL STUB] ⏳ Simulating 1-second delivery delay for message ${messageId}...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 3: Calculate random delivery outcome
    // 80% DELIVERED, 10% FAILED, 10% stays SENT (no callback)
    const rand = Math.random();
    let finalStatus: "DELIVERED" | "FAILED" | null;
    let failureReason: string | undefined;

    if (rand < 0.80) {
      finalStatus = "DELIVERED";
      console.log(`[CHANNEL STUB] 📬 Outcome for message ${messageId}: DELIVERED`);
    } else if (rand < 0.90) {
      finalStatus = "FAILED";
      failureReason = "Recipient number inactive or unreachable";
      console.log(`[CHANNEL STUB] ❌ Outcome for message ${messageId}: FAILED — ${failureReason}`);
    } else {
      // 10% chance: no callback (simulates a dropped/lost webhook)
      finalStatus = null;
      console.log(
        `[CHANNEL STUB] ⚠️  Outcome for message ${messageId}: No callback sent (simulating lost webhook — message stays SENT)`
      );
    }

    // Step 4: POST the outcome back to the CRM receipt webhook
    if (finalStatus !== null) {
      const receiptPayload = {
        messageId,
        status: finalStatus,
        ...(failureReason ? { failureReason } : {}),
      };

      console.log(
        `[CHANNEL STUB] 🔁 Calling CRM receipt webhook: POST ${APP_URL}/api/crm/webhooks/delivery`
      );
      console.log(`[CHANNEL STUB] Receipt payload:`, JSON.stringify(receiptPayload));

      const receiptRes = await fetch(`${APP_URL}/api/crm/webhooks/delivery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(receiptPayload),
      });

      if (receiptRes.ok) {
        console.log(
          `[CHANNEL STUB] ✅ CRM webhook acknowledged receipt for message ${messageId} — status: ${finalStatus}\n`
        );
      } else {
        console.error(
          `[CHANNEL STUB] ❌ CRM webhook returned error ${receiptRes.status} for message ${messageId}\n`
        );
      }
    }

    return Response.json({
      success: true,
      messageId,
      accepted: true,
      note: "Message accepted by channel stub. Delivery status will be sent via callback.",
    });
  } catch (error) {
    console.error("[CHANNEL STUB /api/channel/send] Error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
