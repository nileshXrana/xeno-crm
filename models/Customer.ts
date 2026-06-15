import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  totalSpends: number;
  visits: number;
  lastVisitDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    totalSpends: { type: Number, default: 0 },
    visits: { type: Number, default: 0 },
    lastVisitDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent model re-compilation in Next.js hot reload
const Customer: Model<ICustomer> =
  mongoose.models.Customer ||
  mongoose.model<ICustomer>("Customer", CustomerSchema);

export default Customer;
