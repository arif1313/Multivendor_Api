import { Schema, model } from "mongoose";
import { IVendorDocument } from "./Vendor.interface";

const VendorSchema = new Schema<IVendorDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    shopName: { type: String, required: true, trim: true },
    brandName: { type: String, trim: true },
    // Reserved for the future subdomain storefront (shopname.yoursite.com)
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    logo: { type: String },
    banner: { type: String },
    description: { type: String },
    address: { type: String },
    contactNumber: { type: String },
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const VendorModel = model<IVendorDocument>("Vendor", VendorSchema);
