import { Schema, model } from "mongoose";
import { config } from "../../../config";
import { IProductDocument } from "./Product.interface";

const ProductSchema = new Schema<IProductDocument>(
  {
    vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
    brand: { type: String },
    images: [{ type: String }],
    paymentOptions: { type: String, enum: ["cod", "bkash", "both"], default: "cod" },
    deliveryCharge: { type: Number, default: config.defaultDeliveryCharge, min: 0 },
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text", brand: "text" });

export const ProductModel = model<IProductDocument>("Product", ProductSchema);
