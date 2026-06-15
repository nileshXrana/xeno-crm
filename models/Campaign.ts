import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAudienceRule {
  field: string; // e.g., "totalSpends", "visits", "lastVisitDate"
  operator: string; // e.g., ">", "<", ">=", "<=", "=="
  value: number | string;
  logic: "AND" | "OR"; // how this rule combines with the NEXT rule
}

export interface ICampaign extends Document {
  name: string;
  audienceRules: IAudienceRule[];
  size: number; // number of customers in this audience
  status: "DRAFT" | "SENDING" | "SENT";
  generatedMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

const AudienceRuleSchema = new Schema<IAudienceRule>(
  {
    field: { type: String, required: true },
    operator: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: true },
    logic: { type: String, enum: ["AND", "OR"], default: "AND" },
  },
  { _id: false }
);

const CampaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true },
    audienceRules: { type: [AudienceRuleSchema], default: [] },
    size: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["DRAFT", "SENDING", "SENT"],
      default: "DRAFT",
    },
    generatedMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

const Campaign: Model<ICampaign> =
  mongoose.models.Campaign ||
  mongoose.model<ICampaign>("Campaign", CampaignSchema);

export default Campaign;
