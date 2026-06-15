import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Campaign from "@/models/Campaign";
import Customer from "@/models/Customer";
import CommunicationMessage from "@/models/CommunicationMessage";
import { buildAudienceQuery } from "@/lib/audienceQuery";
import { IAudienceRule } from "@/models/Campaign";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/**
 * POST /api/crm/campaign/send
 * Body: { name, rules, generatedMessage }
 *
 * Flow:
 * 1. Save the Campaign document
 * 2. Find all matching customers using audience rules
 * 3. Insert a CommunicationMessage (PENDING) for each customer
 * 4. Iterate and POST each message to the channel stub (/api/channel/send)
 * 5. Return immediately with campaign ID
 *
 * The channel stub will asynchronously call back /api/crm/webhooks/delivery
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, rules, generatedMessage } = body as {
      name: string;
      rules: IAudienceRule[];
      generatedMessage: string;
    };

    if (!name) {
      return Response.json(
        { success: false, error: "Campaign name is required" },
        { status: 400 }
      );
    }

    console.log(`[API /api/crm/campaign/send] Creating campaign: "${name}"`);

    // Build audience query and find matching customers
    const query = buildAudienceQuery(rules);
    const matchedCustomers = await Customer.find(query).lean();

    console.log(
      `[API /api/crm/campaign/send] Found ${matchedCustomers.length} customers matching audience rules.`
    );

    // Save the Campaign document
    const campaign = await Campaign.create({
      name,
      audienceRules: rules,
      size: matchedCustomers.length,
      status: "SENDING",
      generatedMessage: generatedMessage ?? "",
    });

    console.log(`[API /api/crm/campaign/send] Campaign created with ID: ${campaign._id}`);

    // Insert a PENDING CommunicationMessage for each customer
    const messageDocuments = matchedCustomers.map((customer) => ({
      campaignId: campaign._id,
      customerId: customer._id,
      status: "PENDING" as const,
      channel: "WHATSAPP",
      messageText: (generatedMessage ?? "").replace("[Name]", customer.name),
    }));

    const insertedMessages = await CommunicationMessage.insertMany(messageDocuments);
    console.log(
      `[API /api/crm/campaign/send] Inserted ${insertedMessages.length} PENDING messages.`
    );

    // Fire-and-forget: dispatch each message to the channel stub asynchronously
    // We do NOT await this so the API responds quickly
    dispatchToChannelStub(insertedMessages, matchedCustomers).catch((err) => {
      console.error("[API /api/crm/campaign/send] Error dispatching to channel:", err);
    });

    return Response.json({
      success: true,
      campaignId: campaign._id,
      message: `Campaign "${name}" is sending to ${matchedCustomers.length} customers.`,
    });
  } catch (error) {
    console.error("[API /api/crm/campaign/send] Error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Iterates through communication messages and POSTs each to the channel stub.
 * This runs in the background after the API has responded.
 */
async function dispatchToChannelStub(
  messages: Array<{ _id: unknown; customerId: unknown; messageText: string }>,
  customers: Array<{ _id: unknown; name: string; phone: string; email: string }>
) {
  const customerMap = new Map(customers.map((c) => [String(c._id), c]));

  for (const msg of messages) {
    const customer = customerMap.get(String(msg.customerId));
    if (!customer) continue;

    const payload = {
      messageId: String(msg._id),
      customerId: String(msg.customerId),
      customerName: customer.name,
      customerPhone: customer.phone,
      messageText: msg.messageText,
      channel: "WHATSAPP",
    };

    console.log(
      `[DISPATCH] Sending message ${payload.messageId} to channel stub for customer: ${customer.name}`
    );

    try {
      // POST to the channel stub - this simulates sending to an external service
      const res = await fetch(`${APP_URL}/api/channel/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error(
          `[DISPATCH] Channel stub returned non-OK status ${res.status} for message ${payload.messageId}`
        );
      } else {
        console.log(
          `[DISPATCH] Channel stub accepted message ${payload.messageId} — awaiting delivery callback.`
        );
      }
    } catch (err) {
      console.error(
        `[DISPATCH] Failed to reach channel stub for message ${payload.messageId}:`,
        err
      );
    }
  }

  console.log("[DISPATCH] All messages dispatched to channel stub.");
}

/**
 * GET /api/crm/campaign/send
 * Returns a list of all campaigns
 */
export async function GET(_req: NextRequest) {
  try {
    await dbConnect();
    const campaigns = await Campaign.find({}).sort({ createdAt: -1 }).lean();
    return Response.json({ success: true, campaigns });
  } catch (error) {
    console.error("[API /api/crm/campaign/send GET] Error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
