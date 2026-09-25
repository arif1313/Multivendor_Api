import { Schema, model } from "mongoose";
import { ISubscriptionDocument } from "./Subscription.interface";

const SubscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    planType: { type: String, enum: ["monthly", "yearly", "per_product"], required: true },
    amount: { type: Number, required: true, min: 0 },
    productLimit: { type: Number },
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "pending",
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const SubscriptionModel = model<ISubscriptionDocument>("Subscription", SubscriptionSchema);
