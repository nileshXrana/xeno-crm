import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type MessageStatus = "PENDING" | "SENT" | "DELIVERED" | "FAILED";

export interface ICommunicationMessage extends Document {
  campaignId: Types.ObjectId;
  customerId: Types.ObjectId;
  status: MessageStatus;
  channel: string;
  messageText: string;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommunicationMessageSchema = new Schema<ICommunicationMessage>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "DELIVERED", "FAILED"],
      default: "PENDING",
    },
    channel: { type: String, default: "WHATSAPP" },
    messageText: { type: String, default: "" },
    failureReason: { type: String },
  },
  { timestamps: true }
);

const CommunicationMessage: Model<ICommunicationMessage> =
  mongoose.models.CommunicationMessage ||
  mongoose.model<ICommunicationMessage>(
    "CommunicationMessage",
    CommunicationMessageSchema
  );

export default CommunicationMessage;
