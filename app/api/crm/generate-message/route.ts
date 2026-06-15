import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { IAudienceRule } from "@/models/Campaign";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

/**
 * POST /api/crm/generate-message
 * Body: { intent: string, rules: IAudienceRule[], audienceCount: number }
 * Returns: { message: string }
 *
 * Uses Google Gemini to generate a WhatsApp marketing message personalized
 * to the audience segment and marketer's intent.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { intent, rules, audienceCount } = body as {
      intent: string;
      rules: IAudienceRule[];
      audienceCount: number;
    };

    if (!intent) {
      return Response.json(
        { success: false, error: "intent is required" },
        { status: 400 }
      );
    }

    console.log("[API /api/crm/generate-message] Generating message for intent:", intent);
    console.log("[API /api/crm/generate-message] Audience rules:", JSON.stringify(rules));
    console.log("[API /api/crm/generate-message] Audience size:", audienceCount);

    // Build a human-readable description of the audience
    const audienceDescription = rules.length > 0
      ? rules
          .map(
            (r) =>
              `${r.field} ${r.operator} ${r.value}${r.logic ? ` (${r.logic})` : ""}`
          )
          .join(", ")
      : "all customers";

    const prompt = `You are a world-class marketing copywriter for an Indian e-commerce brand.

A marketer wants to send a WhatsApp message to a customer segment with these characteristics:
- Audience criteria: ${audienceDescription}
- Number of customers: ${audienceCount}
- Marketer's campaign intent: "${intent}"

Write a single, highly personalized WhatsApp message that:
1. Opens with a warm, personalized greeting (use "[Name]" as a placeholder)
2. Directly addresses the campaign intent in a compelling way
3. Includes a clear, urgent call-to-action with urgency (limited time / exclusive offer)
4. Uses emojis appropriately to make it feel friendly and native to WhatsApp
5. Is concise (under 200 words)
6. Ends with the brand sign-off: "Team Xeno CRM"

Return ONLY the WhatsApp message text, no explanations or formatting.`;

    let generatedMessage: string;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your-gemini-api-key-here") {
      // Fallback stub when API key is not configured
      console.log("[API /api/crm/generate-message] No Gemini API key found, using stub message.");
      generatedMessage = `Hey [Name]! 👋

We have an exclusive offer just for you! ${intent} 🎉

As one of our valued customers, you get early access to this special deal before anyone else.

⏰ This offer is valid for the next 48 hours only — don't miss out!

👉 Tap here to claim your offer now: [LINK]

We appreciate your loyalty and can't wait to serve you again! 💛

Team Xeno CRM`;
    } else {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = result.response;
      generatedMessage = response.text().trim();
    }

    console.log("[API /api/crm/generate-message] Generated message successfully.");

    return Response.json({ success: true, message: generatedMessage });
  } catch (error) {
    console.error("[API /api/crm/generate-message] Error:", error);
    return Response.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
