import { Schema, model } from "mongoose";
import { IReviewDocument } from "./Review.interface";

const ReviewSchema = new Schema<IReviewDocument>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    guestId: { type: String },
    reviewerName: { type: String, required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const ReviewModel = model<IReviewDocument>("Review", ReviewSchema);
