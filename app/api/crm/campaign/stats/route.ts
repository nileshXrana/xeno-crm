import { NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Campaign from "@/models/Campaign";
import CommunicationMessage from "@/models/CommunicationMessage";

/**
 * GET /api/crm/campaign/stats?campaignId=xxx
 *
 * Returns aggregated delivery statistics for a campaign:
 * { pending, sent, delivered, failed, total }
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const campaignId = req.nextUrl.searchParams.get("campaignId");

    if (!campaignId) {
      // Return stats for all campaigns
      const campaigns = await Campaign.find({}).sort({ createdAt: -1 }).lean();

      const stats = await Promise.all(
        campaigns.map(async (c) => {
          const [pending, sent, delivered, failed] = await Promise.all([
            CommunicationMessage.countDocuments({ campaignId: c._id, status: "PENDING" }),
            CommunicationMessage.countDocuments({ campaignId: c._id, status: "SENT" }),
            CommunicationMessage.countDocuments({ campaignId: c._id, status: "DELIVERED" }),
            CommunicationMessage.countDocuments({ campaignId: c._id, status: "FAILED" }),
          ]);

          return {
            campaignId: c._id,
            name: c.name,
            status: c.status,
            createdAt: c.createdAt,
            stats: { pending, sent, delivered, failed, total: c.size },
          };
        })
      );

      return Response.json({ success: true, campaigns: stats });
    }

    // Single campaign stats
    const campaign = await Campaign.findById(campaignId).lean();
    if (!campaign) {
      return Response.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    const [pending, sent, delivered, failed] = await Promise.all([
      CommunicationMessage.countDocuments({ campaignId, status: "PENDING" }),
      CommunicationMessage.countDocuments({ campaignId, status: "SENT" }),
      CommunicationMessage.countDocuments({ campaignId, status: "DELIVERED" }),
      CommunicationMessage.countDocuments({ campaignId, status: "FAILED" }),
    ]);

    return Response.json({
      success: true,
      campaign: {
        campaignId: campaign._id,
        name: campaign.name,
        status: campaign.status,
        createdAt: campaign.createdAt,
        stats: { pending, sent, delivered, failed, total: campaign.size },
      },
    });
  } catch (error) {
    console.error("[API /api/crm/campaign/stats] Error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
