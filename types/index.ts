/**
 * Type definitions shared across the CRM application
 */

export interface AudienceRule {
  field: "totalSpends" | "visits" | "lastVisitDate";
  operator: ">" | ">=" | "<" | "<=" | "==";
  value: string | number;
  logic: "AND" | "OR";
}

export interface CustomerData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  totalSpends: number;
  visits: number;
  lastVisitDate: string;
  createdAt: string;
}

export interface OrderData {
  _id: string;
  customerId: string;
  amount: number;
  date: string;
}

export interface CampaignData {
  _id: string;
  name: string;
  audienceRules: AudienceRule[];
  size: number;
  status: "DRAFT" | "SENDING" | "SENT";
  generatedMessage: string;
  createdAt: string;
}

export interface MessageData {
  _id: string;
  campaignId: string;
  customerId: string;
  status: "PENDING" | "SENT" | "DELIVERED" | "FAILED";
  channel: string;
  messageText: string;
  failureReason?: string;
  createdAt: string;
}

export interface CampaignStats {
  campaignId: string;
  name: string;
  status: string;
  createdAt: string;
  stats: {
    pending: number;
    sent: number;
    delivered: number;
    failed: number;
    total: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
