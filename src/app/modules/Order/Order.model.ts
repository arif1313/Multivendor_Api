import { Schema, model } from "mongoose";
import { IOrderDocument } from "./Order.interface";

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CustomerInfoSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true },
    city: { type: String },
    note: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    guestId: { type: String, index: true },
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    parentOrderId: { type: String, index: true },
    items: { type: [OrderItemSchema], required: true },
    customerInfo: { type: CustomerInfoSchema, required: true },
    productTotal: { type: Number, required: true, min: 0 },
    deliveryCharge: { type: Number, required: true, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ["cod", "bkash_full", "bkash_delivery_only"],
      default: "cod",
    },
    // Reserved for the future bKash integration.
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partially_paid", "paid", "failed"],
      default: "unpaid",
    },
    paymentMode: { type: String, enum: ["full", "delivery_charge_only"] },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueAmount: { type: Number, default: 0, min: 0 },
    transactionId: { type: String },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    cancelReason: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const OrderModel = model<IOrderDocument>("Order", OrderSchema);
