import { Schema, model } from "mongoose";
import { ICartDocument } from "./Cart.interface";

const CartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: true }
);

const CartSchema = new Schema<ICartDocument>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    guestId: { type: String, index: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

export const CartModel = model<ICartDocument>("Cart", CartSchema);
