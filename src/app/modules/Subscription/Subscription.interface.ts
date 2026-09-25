import { Document, Types } from "mongoose";

export type TPlanType = "monthly" | "yearly" | "per_product";
export type TSubscriptionStatus = "active" | "expired" | "cancelled" | "pending";

/** Schema is ready for the future vendor billing feature; nothing is enforced yet. */
export type ISubscription = {
  vendorId: Types.ObjectId;
  planType: TPlanType;
  amount: number;
  productLimit?: number;
  startDate: Date;
  expiryDate: Date;
  status: TSubscriptionStatus;
  isDeleted: boolean;
};

export interface ISubscriptionDocument extends ISubscription, Document {
  _id: Types.ObjectId;
}
